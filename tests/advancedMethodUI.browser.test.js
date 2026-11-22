import assert from "node:assert/strict";
import { test } from "node:test";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
import { createTranslator } from "../src/i18n/translate.js";

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const storageKey = "training-app:v2:app-state";
const route = (exercise = "incline-db-press", day = "d1", plan = "bulk-pro") => `/plan/${plan}/day/${day}/exercise/${exercise}`;

// Only the isolated server exposes this route. Real pages, context and persistence
// run under StrictMode; the wrapper can enqueue a base edit to reproduce a stale confirmation.
const harness = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module">
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppStateProvider } from '/src/state/AppStateProvider.jsx';
import { AppStateContext } from '/src/state/AppStateContext.js';
import { useAppState } from '/src/state/useAppState.js';
import { LocaleProvider } from '/src/i18n/LocaleProvider.jsx';
import PlanOverviewPage from '/src/pages/PlanOverviewPage.jsx';
import CyclePage from '/src/pages/CyclePage.jsx';
import DayPage from '/src/pages/DayPage.jsx';
import ExercisePage from '/src/pages/ExercisePage.jsx';
import GuidePage from '/src/pages/GuidePage.jsx';
import EndCyclePage from '/src/pages/EndCyclePage.jsx';
import '/src/index.css';
function Probe() {
  const context = useAppState(); const navigate = useNavigate();
  useEffect(() => { window.__qa = context; window.__navigate = navigate; });
  return React.createElement(AppStateContext.Provider, { value: {...context, dispatch(action) { window.__actions.push(action);
    if (window.__beforeMethod && action.type === "UPDATE_EXERCISE_METHOD") {
      context.dispatch(window.__beforeMethod); delete window.__beforeMethod;
    }
    context.dispatch(action); }} },
    React.createElement(Routes, null, React.createElement(Route, {path:'/plan/:planId/day/:dayId/exercise/:exerciseId', element:React.createElement(ExercisePage)}),
      React.createElement(Route, {path:'/plan/:planId', element:React.createElement(PlanOverviewPage)}),
      React.createElement(Route, {path:'/plan/:planId/cycle', element:React.createElement(CyclePage)}),
      React.createElement(Route, {path:'/plan/:planId/day/:dayId', element:React.createElement(DayPage)}),
      React.createElement(Route, {path:'/plan/:planId/guide',element:React.createElement(GuidePage)}),
      React.createElement(Route, {path:'/plan/:planId/end-cycle',element:React.createElement(EndCyclePage)})));
}
createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode, null,
  React.createElement(LocaleProvider, null, React.createElement(AppStateProvider, null,
    React.createElement(MemoryRouter, {initialEntries:[sessionStorage.getItem('qa-route')]}, React.createElement(Probe))))));
</script></body></html>`;

test("isolated Chrome: advanced method UI, cycle lifecycle and mobile layout", { skip: !chrome, timeout: 180000 }, async (t) => {
  const profile = await mkdtemp(join(tmpdir(), "cycle-coach-method-ui-"));
  const screenshots = "/tmp/cycle-coach-3a-visual";
  let server, child, socket;
  const pending = new Map();
  try {
    server = await createServer({ cacheDir: join(profile, "vite-cache"),
      server: { host: "127.0.0.1", port: 0 },
      optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "react-router-dom", "motion/react", "lucide-react"] },
      plugins: [{ name: "method-ui-fixture", configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (req.url !== "/__method-ui") return next();
          res.setHeader("Content-Type", "text/html"); res.end(await vite.transformIndexHtml(req.url, harness));
        });
      } }] });
    await server.listen();
    const load = (path) => server.ssrLoadModule(`/src/${path}`);
    const [{ appReducer }, { APP_ACTIONS: actions }, { appInitialState }, { getDayDetails }, { getExercisesForDay }] = await Promise.all([
      "state/appReducer.js", "state/appActions.js", "state/appInitialState.js", "data/dayDetails/index.js", "data/exercises/index.js",
    ].map(load));
    function fixture(planId = "bulk-pro", dayId = "d1", previous = structuredClone(appInitialState)) {
      let state = previous;
      const send = (type, payload) => { state = appReducer(state, { type, payload: { planId, ...payload } }); };
      const number = (previous.progressByPlan[planId]?.currentCycleNumber ?? 0) + 1;
      send(actions.START_PLAN_CYCLE, { startedAt: new Date(Date.UTC(2026, 10, 17, 10, 0, number - 1)).toISOString().replace(".000Z", "Z") });
      for (const day of ["d1", "d2", "d3", "d4", "d5"]) {
        const dayDetails = getDayDetails(planId, day);
        send(actions.ENSURE_DAY_LOG, { dayDetails, exercises: getExercisesForDay(planId, dayDetails.exerciseIds) });
        if (day === dayId) break;
        send(actions.FINISH_DAY, { dayId: day, finishedAt: `synthetic-${day}` });
      }
      return state;
    }
    child = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
      `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
    const endpoint = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(() => reject(Error(`Chrome startup timeout: ${output.slice(-500)}`)), 15000);
      child.stderr.on("data", (chunk) => {
        output += chunk;
        const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
    let sequence = 0;
    const exceptions = [];
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails);
      const request = pending.get(message.id);
      if (request) {
        clearTimeout(request.timer); pending.delete(message.id);
        if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
      }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const call = (method, params) => send(method, params, sessionId);
    await call("Page.enable"); await call("Runtime.enable");
    const initial = JSON.stringify({ version: 2, savedAt: "synthetic", state: fixture() });
    await call("Page.addScriptToEvaluateOnNewDocument", { source: `
      if (!sessionStorage.getItem('qa-route')) {
        sessionStorage.setItem('qa-route',${JSON.stringify(route())}); localStorage.setItem(${JSON.stringify(storageKey)},${JSON.stringify(initial)});
      }
      window.__generation=Number(sessionStorage.getItem('qa-generation')??0)+1;sessionStorage.setItem('qa-generation',String(window.__generation));
      window.__writes=[]; window.__actions=[];
      const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value) { if(this===localStorage && key===${JSON.stringify(storageKey)}) window.__writes.push(value); return original.call(this,key,value); };
    ` });
    const evaluate = async (expression) => {
      const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    const wait = async (expression) => {
      for (let i = 0; i < 1200; i++) {
        try { if (await evaluate(expression)) return; } catch (error) { if (!/context|navigat/i.test(error.message)) throw error; }
        await pause(50);
      }
      throw Error(`Condition timeout: ${expression}; exceptions=${JSON.stringify(exceptions)}`);
    };
    const settle = () => evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
    const panel = '[data-method-set]';
    const selector = (suffix) => JSON.stringify(`${panel} ${suffix}`);
    async function controlPoint(sel, label) {
      return evaluate(`(async ()=>{
        const selector = ${JSON.stringify(sel)};
        const label = ${JSON.stringify(label)};
        const deadline = performance.now() + 2500;
        do {
          const elements = document.querySelectorAll(selector);
          const el = label === undefined ? elements[0] : Array.from(elements).find(e => e.textContent.trim() === label);
          if (el) {
            el.scrollIntoView({block:'nearest', inline:'nearest', behavior:'instant'});
            const r = el.getBoundingClientRect();
            const x = r.x + r.width / 2;
            const y = r.y + r.height / 2;
            if (el.contains(document.elementFromPoint(x, y))) return {x,y};
          }
          await new Promise(requestAnimationFrame);
        } while (performance.now() < deadline);
        throw Error('Unreachable control: ' + selector + (label ? ' ' + label : '') + ' on ' + document.querySelector('h1')?.innerText);
      })()`);
    }
    async function click(sel, label) {
      const point = await controlPoint(sel, label);
      await call("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
      await call("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
      await settle();
    }
    async function fill(field, value) {
      await click(`${panel} input[name="${field}"]`);
      await evaluate(`document.activeElement.select()`);
      if (value === "") {
        await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
        await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
      } else await call("Input.insertText", { text: value });
      await settle();
    }
    const row = "window.__qa.state.progressByPlan['bulk-pro'].cycles[1].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2]";
    const phase = `${row}.methodLog.phases['extra-reps']`;
    const summary = () => evaluate(`document.querySelector(${selector('[data-method-summary]')}).textContent`);
    const read = () => evaluate(`localStorage.getItem(${JSON.stringify(storageKey)})`);
    async function seed(state, url = route(), locale = "en") {
      const generation = await evaluate("window.__generation");
      const raw = JSON.stringify({ version: 2, savedAt: "synthetic", state });
      await evaluate(`localStorage.setItem(${JSON.stringify(storageKey)},${JSON.stringify(raw)});localStorage.setItem('training-app:v1:locale',${JSON.stringify(locale)});sessionStorage.setItem('qa-route',${JSON.stringify(url)});delete window.__qa`);
      await call("Page.reload"); await wait(`window.__generation>${generation} && Boolean(window.__qa && document.querySelector('h1'))`); await settle();
    }
    const open = () => click(`${panel} > button`);
    await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await call("Page.navigate", { url: `http://127.0.0.1:${server.httpServer.address().port}/__method-ui` });
    await wait("Boolean(window.__qa && document.querySelector('[data-method-set]'))");
    await t.test("disclosure and default confirmation never write workout data or open the keyboard", async () => {
      const before = await read(); await open();
      assert.equal(await evaluate("document.activeElement.tagName"), "BUTTON");
      await click(`${panel} input[value="unconfirmed"]`); await open(); await open();
      assert.equal(await read(), before); assert.deepEqual(await evaluate("window.__writes"), []);
      assert.equal(await evaluate(`${row}.methodLog`), undefined);
      assert.equal(await evaluate("document.querySelector('[data-method-history]')===null"), true);
    });
    await t.test("actual UI sends exact identity; metrics, partial/performed and main Done are independent", async () => {
      await fill("reps", "3"); assert.match(await summary(), /Not confirmed/);
      assert.equal(await evaluate(`${phase}.execution`), "unconfirmed");
      await click(`${panel} input[value="partial"]`); assert.match(await summary(), /Partially performed/);
      await click(`${panel} input[value="performed"]`); assert.match(await summary(), /Performed/);
      assert.equal(await evaluate(`${row}.isDone`), false);
      assert.equal(await evaluate(`${phase}.restSeconds`), "");
      assert.equal(await evaluate(`document.querySelector(${selector('[id$="-body"]')}).innerText.includes('Required measurement missing')`), false);
      const action = await evaluate("window.__actions.find(a=>a.type==='UPDATE_EXERCISE_METHOD')");
      assert.deepEqual(action.payload, { planId: "bulk-pro", cycleNumber: 1, cycleStartedAt: "2026-11-17T10:00:00Z", dayId: "d1", exerciseId: "incline-db-press", setIndex: 3,
        change: { type: "set-metric", phaseId: "extra-reps", field: "reps", value: "3" } });
    });
    await t.test("raw invalid replacement/paste preserves the value, record, focus and storage", async () => {
      const before = await read();
      for (const value of ["31", "-1", "1.5", "1,5", "01", " 3", "1e1", "1000"]) {
        await fill("reps", value);
        assert.equal(await evaluate(`document.querySelector(${selector('input[name="reps"]')}).value`), "3");
        assert.equal(await read(), before);
        assert.equal(await evaluate("document.activeElement.name"), "reps");
        assert.equal(await evaluate(`document.querySelector(${selector('input[name="reps"]')}).getAttribute('aria-invalid')`), "true");
      }
      await fill("restSeconds", "999"); const seconds = await read();
      await fill("restSeconds", "1000"); assert.equal(await read(), seconds);
      await fill("reps", "30"); await fill("restSeconds", "0");
    });
    await t.test("blank, confirmed zero and skip/resume preserve truthful evidence and focus", async () => {
      await fill("reps", "0"); assert.match(await summary(), /Attempt confirmed.*0.*Below target/);
      await fill("reps", ""); assert.match(await summary(), /Performed.*Measurement not recorded/);
      assert.equal(await evaluate(`${phase}.execution`), "performed");
      await fill("reps", "2");
      await click(`${panel} [id$="-body"] > button`);
      assert.match(await summary(), /Skipped/);
      assert.equal(await evaluate("document.activeElement.tagName"), "BUTTON");
      assert.equal(await evaluate(`${phase}.reps`), "2");
      await click(`${panel} [id$="-body"] > button`);
      assert.match(await summary(), /Performed/);
      assert.equal(await evaluate(`${phase}.execution`), "performed");
      assert.equal(await evaluate(`${row}.isDone`), false);
    });
    await t.test("language and rerenders preserve input nodes, disclosure and caret; refresh restores data", async () => {
      await fill("reps", "2");
      await evaluate(`window.__input=document.activeElement;window.__input.setSelectionRange(1,1);const s=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'sr-Latn');s.dispatchEvent(new Event('change',{bubbles:true}));`);
      await settle();
      assert.equal(await evaluate(`window.__input===document.querySelector(${selector('input[name="reps"]')})`), true);
      assert.equal(await evaluate("document.activeElement===window.__input && window.__input.selectionStart===1"), true);
      assert.match(await summary(), /Izvedeno/);
      assert.equal(await evaluate(`document.querySelector(${selector('button')}).getAttribute('aria-expanded')`), "true");
      const generation = await evaluate("window.__generation");
      await call("Page.reload"); await wait(`window.__generation>${generation} && Boolean(window.__qa && document.querySelector('[data-method-set]'))`);
      assert.equal(await evaluate(`${phase}.reps`), "2"); assert.equal(await evaluate(`${row}.isDone`), false);
      assert.deepEqual(await evaluate("window.__writes"), []);
    });
    await t.test("finished day accepts method edits without changing closure; ordinary and Cut sets stay ordinary", async () => {
      const state = fixture("bulk-pro", "d4");
      await seed(state); await open(); await fill("reps", "1");
      assert.equal(await evaluate("window.__qa.state.progressByPlan['bulk-pro'].cycles[1].dayLogs.d1.finishedAt"), "synthetic-d1");
      assert.equal(await evaluate("document.body.innerText.includes('Return to day')"), true);
      await seed(fixture(), route("overhead-rope-extension"));
      assert.equal(await evaluate("document.querySelector('[data-method-set]')===null && Boolean(document.querySelector('input[name=\"set-1-reps\"]'))"), true);
      await seed(fixture("cut-pro"), route("incline-db-press", "d1", "cut-pro"));
      assert.equal(await evaluate("document.querySelector('[data-method-set]')===null"), true);
      await click('button[aria-label="Mark set 1 performed"]');
      assert.equal(await evaluate("window.__qa.state.progressByPlan['cut-pro'].cycles[1].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[0].isDone"), true);
    });
    await t.test("upcoming, anomalous future, legacy, unknown and malformed records expose no method editor", async () => {
      await seed(fixture(), route("face-away-cable-curl", "d4"));
      assert.equal(await evaluate("document.querySelector('input')===null"), true);
      const future = fixture("bulk-pro", "d4"); future.progressByPlan['bulk-pro'].cycles[1].currentDayId = "d1";
      future.progressByPlan['bulk-pro'].cycles[1].dayLogs.d4.finishedAt = "anomalous";
      await seed(future, route("face-away-cable-curl", "d4"));
      assert.equal(await evaluate("document.querySelector('input')===null && /Read-only preview/i.test(document.body.innerText)"), true, await evaluate("document.body.innerText"));
      for (const kind of ["legacy", "revision", "schema", "scaffold", "record"]) {
        const state = fixture(); const c = state.progressByPlan['bulk-pro'].cycles[1];
        if (kind === "legacy") delete c.methodBindings;
        if (kind === "revision") c.methodBindings.exercises['incline-db-press'].revision = 99;
        if (kind === "schema") c.methodBindings.version = 99;
        if (kind === "scaffold") c.dayLogs.d1.mainExerciseLogs['incline-db-press'].sets.pop();
        if (kind === "record") c.dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].methodLog = {choice:"record",phases:{'extra-reps':{execution:"performed",reps:"31"}}};
        await seed(state);
        assert.equal(await evaluate("document.querySelector('input[type=radio]')===null"), true, kind);
        assert.deepEqual(await evaluate("window.__writes"), []);
      }
    });
    await t.test("a captured UI action cannot edit a later cycle", async () => {
      await seed(fixture()); await open(); await fill("reps", "3");
      const oldAction = await evaluate("window.__actions.find(a=>a.type==='UPDATE_EXERCISE_METHOD')");
      await evaluate("window.__qa.dispatch({type:'START_PLAN_CYCLE',payload:{planId:'bulk-pro',startedAt:'later-cycle'}})");
      await settle();
      const before = await read();
      await evaluate(`window.__qa.dispatch(${JSON.stringify(oldAction)})`); await settle();
      assert.equal(await read(), before);
      assert.equal(await evaluate("window.__qa.state.progressByPlan['bulk-pro'].currentCycleNumber"), 2);
    });
    await t.test("both remaining pilots use their own fields and targets", async () => {
      await seed(fixture(), route("cable-stretch-fly")); await open(); await fill("durationSeconds", "8");
      await click(`${panel} input[value="performed"]`);
      assert.match(await summary(), /Performed.*8 s.*Below target/);
      assert.equal(await evaluate(`document.querySelector(${selector('input[name="reps"]')})===null`), true);
      await fill("durationSeconds", "0"); assert.match(await summary(), /Attempt confirmed.*0 s.*Below target/);
      await seed(fixture("bulk-pro", "d4"), route("face-away-cable-curl", "d4")); await open(); await fill("reps", "5");
      await click(`${panel} input[value="performed"]`);
      assert.match(await summary(), /Within target/);
    });
    // Synthetic cycles retain all real fixture scaffolding; only evidence varies.
    function historyFixture(exerciseId = "incline-db-press", count = 2) {
      const state = fixture();
      const progress = state.progressByPlan['bulk-pro'];
      const first = progress.cycles[1];
      const historical = first.dayLogs.d1.mainExerciseLogs[exerciseId].sets.at(-1);
      const phaseId = exerciseId === "cable-stretch-fly" ? "loaded-stretch" : "extra-reps";
      const field = exerciseId === "cable-stretch-fly" ? "durationSeconds" : "reps";
      Object.assign(historical, {weight:"24",reps:"10",rir:"",isDone:false,
        methodLog:{choice:"record",phases:{[phaseId]:{execution:"performed",[field]:"0"}}}});
      for (let number = 2; number <= count; number++) {
        const c = structuredClone(first); c.cycleNumber = number; c.startedAt = `synthetic-cycle-${number}`;
        delete c.dayLogs.d1.mainExerciseLogs[exerciseId].sets.at(-1).methodLog;
        c.dayLogs.d1.mainExerciseLogs[exerciseId].sets.at(-1).weight = "30";
        progress.cycles[number] = c;
      }
      progress.currentCycleNumber = count;
      return state;
    }
    const historySelector = '[data-method-history]';
    const historyText = () => evaluate(`document.querySelector('${historySelector}').innerText`);
    const historyToggle = () => click(`${historySelector} > button`);
    await t.test("Cycle 2 shows one confirmed zero attempt; history is read-only and independent of today's form", async () => {
      await seed(historyFixture());
      assert.equal(await evaluate(`document.querySelector('${panel} > button').getAttribute('aria-expanded')`), "false");
      await open();
      assert.equal(await evaluate(`document.querySelector('${historySelector} > button').getAttribute('aria-expanded')`), "false");
      const before = await read(); const state = await evaluate("JSON.stringify(window.__qa.state)");
      await historyToggle();
      assert.match(await historyText(), /Cycle 1/);
      assert.match(await historyText(), /Method: Performed/);
      assert.match(await historyText(), /Recorded extra reps\s+0\s+Below target/);
      assert.match(await historyText(), /Recorded rest \(optional\)\s+Not recorded/);
      assert.match(await historyText(), /Base set not marked performed/);
      assert.doesNotMatch(await historyText(), /Required measurement missing/);
      assert.equal(await evaluate(`document.querySelector('${historySelector} input, ${historySelector} select, ${historySelector} textarea')===null`), true);
      assert.equal(await evaluate(`document.querySelectorAll('${historySelector} button').length`), 1);
      assert.equal(await evaluate(`document.querySelector('${panel} input[name="reps"]').value`), "");
      assert.equal(await evaluate(`window.__qa.state.progressByPlan['bulk-pro'].cycles[2].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].weight`), "30");
      await historyToggle(); await historyToggle();
      assert.equal(await read(), before); assert.equal(await evaluate("JSON.stringify(window.__qa.state)"), state);
      assert.deepEqual(await evaluate("window.__writes"), []); assert.deepEqual(await evaluate("window.__actions"), []);
    });
    await t.test("latest confirmed incomplete attempt wins; newer draft, skipped, unbound and incompatible cycles do not substitute data", async () => {
      const state = historyFixture("incline-db-press", 8);
      const cycles = state.progressByPlan['bulk-pro'].cycles;
      const attempt = (number) => cycles[number].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2];
      attempt(2).methodLog = {choice:'record',phases:{'extra-reps':{execution:'performed',reps:'3',restSeconds:'15'}}};
      attempt(3).methodLog = {choice:'record',phases:{'extra-reps':{execution:'performed',reps:'',restSeconds:'0'}}};
      attempt(4).methodLog = {choice:'record',phases:{'extra-reps':{execution:'unconfirmed',reps:'9'}}};
      attempt(5).methodLog = {choice:'skip',phases:{'extra-reps':{execution:'performed',reps:'8'}}};
      attempt(6).methodLog = structuredClone(attempt(2).methodLog); delete cycles[6].methodBindings;
      attempt(7).methodLog = structuredClone(attempt(2).methodLog); cycles[7].methodBindings.exercises['incline-db-press'].revision = 99;
      await seed(state); await open(); await historyToggle();
      assert.match(await historyText(), /Cycle 3/);
      assert.match(await historyText(), /Method: Performed/);
      assert.match(await historyText(), /Recorded extra reps\s+Measurement not recorded/);
      assert.match(await historyText(), /Recorded rest \(optional\)\s+0 s\s+Below target/);
      assert.match(await historyText(), /Required measurement missing/);
      const original = await read();
      await historyToggle(); await historyToggle(); assert.equal(await read(), original);
    });
    await t.test("iso-stretch history stays available during skip, locale switching and refresh without copying values", async () => {
      const state = historyFixture("cable-stretch-fly");
      const cycles = state.progressByPlan['bulk-pro'].cycles;
      const previous = cycles[1].dayLogs.d1.mainExerciseLogs['cable-stretch-fly'].sets[0];
      previous.methodLog.phases['loaded-stretch'].durationSeconds = '8'; previous.isDone = true;
      cycles[2].dayLogs.d1.mainExerciseLogs['cable-stretch-fly'].sets[0].methodLog = {
        choice:'skip',phases:{'loaded-stretch':{execution:'partial',durationSeconds:'4'}},
      };
      await seed(state, route('cable-stretch-fly')); await open(); await historyToggle();
      assert.match(await historyText(), /Recorded stretch duration\s+8 s\s+Below target/);
      assert.match(await historyText(), /Base set marked performed/);
      assert.doesNotMatch(await historyText(), /Recorded extra reps|Recorded rest/);
      const before = await read();
      await evaluate(`window.__currentInput=document.querySelector('${panel} input[name="durationSeconds"]');window.__historyButton=document.activeElement;const s=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'sr-Latn');s.dispatchEvent(new Event('change',{bubbles:true}));`);
      await settle();
      assert.match(await historyText(), /Prethodni uporedivi pokušaj · Ciklus 1/);
      assert.match(await historyText(), /Zabeleženo trajanje istezanja\s+8 s/);
      assert.equal(await evaluate(`window.__currentInput===document.querySelector('${panel} input[name="durationSeconds"]') && document.activeElement===window.__historyButton`), true);
      assert.equal(await read(), before);
      const generation = await evaluate("window.__generation");
      await call('Page.reload'); await wait(`window.__generation>${generation} && Boolean(window.__qa && document.querySelector('${panel}'))`);
      await open(); await historyToggle();
      assert.match(await historyText(), /Ciklus 1/);
      assert.equal(await read(), before); assert.deepEqual(await evaluate("window.__writes"), []);
      assert.deepEqual(await evaluate("window.__actions"), []);
      assert.equal(await evaluate(`window.__qa.state.progressByPlan['bulk-pro'].cycles[2].dayLogs.d1.mainExerciseLogs['cable-stretch-fly'].sets[0].methodLog.phases['loaded-stretch'].durationSeconds`), '4');
    });
    await t.test("historical evidence never enables unsupported current contexts", async () => {
      for (const kind of ['unbound','revision','scaffold','record']) {
        const state = historyFixture(); const c = state.progressByPlan['bulk-pro'].cycles[2];
        if (kind === 'unbound') delete c.methodBindings;
        if (kind === 'revision') c.methodBindings.exercises['incline-db-press'].revision = 99;
        if (kind === 'scaffold') c.dayLogs.d1.mainExerciseLogs['incline-db-press'].sets.pop();
        if (kind === 'record') c.dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].methodLog = {choice:'record',phases:{'extra-reps':{execution:'performed',reps:'31'}}};
        await seed(state);
        assert.equal(await evaluate(`document.querySelector('${historySelector}')===null && document.querySelector('input[type=radio]')===null`), true, kind);
        assert.deepEqual(await evaluate('window.__writes'), []);
      }
    });
    await t.test("nested history supports keyboard, stable focus and 320/390px EN/SR layouts", async () => {
      const directory = '/tmp/cycle-coach-3b-visual'; await mkdir(directory,{recursive:true});
      for (const width of [320,390]) for (const locale of ['en','sr-Latn']) {
        const state = historyFixture();
        state.progressByPlan['bulk-pro'].cycles[2].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].methodLog = {choice:'record',phases:{'extra-reps':{execution:'performed',reps:'2',restSeconds:''}}};
        await call('Emulation.setDeviceMetricsOverride',{width,height:width===320?568:844,deviceScaleFactor:1,mobile:true});
        await seed(state,route(),locale); await open();
        await click(`${panel} [id$="-body"] > button`);
        await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
        await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
        assert.equal(await evaluate(`document.activeElement===document.querySelector('${historySelector} > button')`), true);
        const before = await read();
        const writeCount = await evaluate("window.__writes.length");
        const actionCount = await evaluate("window.__actions.length");
        await evaluate('window.__historyFocus=document.activeElement;void 0');
        for (const expanded of ['true','false','true']) {
          await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
          await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}); await settle();
          assert.equal(await evaluate(`document.querySelector('${historySelector} > button').getAttribute('aria-expanded')`),expanded, `${width} ${locale} expected ${expanded}`);
          assert.equal(await evaluate('document.activeElement===window.__historyFocus'),true);
        }
        assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
        assert.equal(await read(),before);
        assert.equal(await evaluate('window.__writes.length'),writeCount);
        assert.equal(await evaluate('window.__actions.length'),actionCount);
        // Both disclosure states survive parent collapse without touching evidence.
        await open(); await open();
        assert.equal(await evaluate(`document.querySelector('${historySelector} > button').getAttribute('aria-expanded')`),'true');
        await evaluate(`document.querySelector('${historySelector}').scrollIntoView({block:'start'})`);
        const image = await call('Page.captureScreenshot',{format:'png'});
        await writeFile(join(directory,`history-rest-pause-${locale}-${width}.png`),Buffer.from(image.data,'base64'));
      }
      t.diagnostic(`Synthetic history screenshots: ${directory}`);
    });
    await t.test("polished empty values, zero, invalid feedback and history fit every mobile width in both languages", async () => {
      const directory='/tmp/cycle-coach-3c-visual';await mkdir(directory,{recursive:true});
      for (const [width,height] of [[320,568],[360,800],[375,812],[390,844],[430,932]]) for (const locale of ['en','sr-Latn']) {
        const t=createTranslator(locale);
        await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
        const state=historyFixture();
        await seed(state,route(),locale);await open();
        const rest=selector('input[name="restSeconds"]');
        assert.equal(await evaluate(`(()=>{const i=document.querySelector(${rest});return document.getElementById(i.getAttribute('aria-describedby')).hidden})()`),true);
        await fill('reps','0');await click(`${panel} input[value="performed"]`);
        assert.ok((await summary()).includes(t('Attempt confirmed')));
        assert.ok((await summary()).includes(t('Below target')));
        const value=await read();
        await evaluate(`window.__typed=document.querySelector(${selector('input[name="reps"]')});void 0`);
        await fill('reps','31');
        assert.equal(await evaluate(`window.__typed===document.querySelector(${selector('input[name="reps"]')}) && document.activeElement===window.__typed`),true);
        assert.equal(await read(),value);
        await fill('reps','');
        assert.ok((await summary()).includes(t('Performed')));
        assert.ok((await summary()).includes(t('Measurement not recorded')));
        await fill('restSeconds','1000');
        assert.equal(await evaluate(`(()=>{const i=document.querySelector(${rest});return document.getElementById(i.getAttribute('aria-describedby')).hidden})()`),false);
        await fill('restSeconds','0');
        assert.equal(await evaluate(`document.querySelector(${rest}).value`),'0');
        await fill('restSeconds','');
        assert.equal(await evaluate(`(()=>{const i=document.querySelector(${rest});return document.getElementById(i.getAttribute('aria-describedby')).hidden})()`),true);
        await fill('reps','2');await historyToggle();
        assert.ok((await historyText()).includes(t('Not recorded')));
        assert.ok((await historyText()).includes(t('Base set not marked performed')));
        assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
        assert.equal(await evaluate(`Array.from(document.querySelectorAll('${panel} input')).filter(i=>i.offsetParent!==null).every(i=>{const r=i.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})`),true);
        if ((width===320 && locale==='sr-Latn') || (width===390 && locale==='en')) {
          await evaluate(`document.querySelector('${panel}').scrollIntoView({block:'start'})`);
          let shot=await call('Page.captureScreenshot',{format:'png'});
          await writeFile(join(directory,`method-${locale}-${width}.png`),Buffer.from(shot.data,'base64'));
          await evaluate(`document.querySelector('${historySelector}').scrollIntoView({block:'start'})`);
          shot=await call('Page.captureScreenshot',{format:'png'});
          await writeFile(join(directory,`history-${locale}-${width}.png`),Buffer.from(shot.data,'base64'));
        }
      }
    });
    await t.test("educational summaries and help remain available without granting extra method editors", async () => {
      for (const [id,day,title] of [['incline-db-press','d1','Rest-pause · exact method available'],['assisted-pull-up-cluster','d5','Cluster set · exact structure available']]) {
        for (const locale of ['en','sr-Latn']) {
          const t=createTranslator(locale);
          await seed(fixture(),route(id,day),locale);
          assert.ok((await evaluate('document.body.innerText')).includes(t(title)));
          const before=await read();
          await click('button[aria-controls]:not([data-method-set] button)');
          // Locate the rendered help control by its accessible text, then use a real pointer click.
          const point=await evaluate(`(()=>{const b=Array.from(document.querySelectorAll('button')).find(b=>b.textContent===${JSON.stringify(t('Open method help'))});b.scrollIntoView({block:'nearest'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
          await call('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
          await call('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await settle();
          assert.equal(await evaluate("Boolean(document.querySelector('[role=dialog]'))"),true);
          assert.equal(await read(),before);
          if (day==='d5') assert.equal(await evaluate(`document.querySelector('${panel}')===null`),true);
        }
      }
    });
    await t.test("Guide and method-only End Cycle copy stay readable at narrow widths without changing progress", async () => {
      const directory='/tmp/cycle-coach-3c-visual';await mkdir(directory,{recursive:true});
      for (const width of [320,390]) for (const locale of ['en','sr-Latn']) for (const planId of ['bulk-pro','cut-pro']) {
        await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
        await seed(fixture(planId),`/plan/${planId}/guide`,locale);
        const before=await read();await click('button');
        await wait("(()=>{const article=document.querySelector('article');return article && getComputedStyle(article.parentElement).opacity==='1'})()");
        assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
        assert.equal(await read(),before);
        if (planId==='bulk-pro' && width===320 && locale==='sr-Latn') {
          await evaluate("document.querySelector('[id$=logging-basics]').scrollIntoView({block:'start'})");
          const shot=await call('Page.captureScreenshot',{format:'png'});
          await writeFile(join(directory,'guide-sr-Latn-320.png'),Buffer.from(shot.data,'base64'));
        }
        let state=fixture(planId);
        if (planId==='bulk-pro') state.progressByPlan[planId].cycles[1].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].methodLog={choice:'record',phases:{'extra-reps':{execution:'performed',reps:'0'}}};
        for (const dayId of ['d1','d2','d3','d4','d5','d6']) {
          const dayDetails=getDayDetails(planId,dayId);
          state=appReducer(state,{type:actions.ENSURE_DAY_LOG,payload:{planId,dayDetails,exercises:getExercisesForDay(planId,dayDetails.exerciseIds)}});
          state=appReducer(state,{type:actions.FINISH_DAY,payload:{planId,dayId,finishedAt:`closed-${dayId}`}});
        }
        await seed(state,`/plan/${planId}/end-cycle`,locale);
        const original=await read();const t=createTranslator(locale);
        assert.ok((await evaluate('document.body.innerText')).includes(t('No performed main/Core values in this recap')));
        assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
        assert.equal(await read(),original);assert.deepEqual(await evaluate('window.__writes'),[]);
        if (planId==='bulk-pro' && ((width===320 && locale==='sr-Latn')||(width===390 && locale==='en'))) {
          await evaluate("document.querySelector('#continuity-title').scrollIntoView({block:'start'})");
          const shot=await call('Page.captureScreenshot',{format:'png'});
          await writeFile(join(directory,`end-cycle-${locale}-${width}.png`),Buffer.from(shot.data,'base64'));
        }
      }
      t.diagnostic(`Synthetic Phase 3c screenshots: ${directory}`);
    });
    await t.test("all mobile sizes, keyboard focus and reduced motion; synthetic review screenshots", async () => {
      await mkdir(screenshots, { recursive: true });
      for (const [width, height] of [[320,568],[360,800],[375,812],[390,844],[430,932],[1024,900]]) {
        await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
        await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
        await seed(fixture(), route(), "sr-Latn"); await open();
        assert.equal(await evaluate("document.documentElement.scrollWidth<=window.innerWidth"), true, `${width}px`);
        if (width > 500) assert.equal(await evaluate("document.querySelector('main > div').getBoundingClientRect().width<=448"), true);
        assert.equal(await evaluate(`document.querySelector(${selector('input[name="reps"]')}).getBoundingClientRect().height>=44`), true);
        await click(`${panel} input[name="reps"]`);
        await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        assert.equal(await evaluate("document.activeElement.name"), "restSeconds");
        if (width === 320 || width === 390) {
          await evaluate("document.querySelector('[data-method-set]').scrollIntoView({block:'start'})");
          const shot = await call("Page.captureScreenshot", { format: "png" });
          await writeFile(join(screenshots, `incline-expanded-sr-${width}.png`), Buffer.from(shot.data,"base64"));
          await open(); const collapsed = await call("Page.captureScreenshot", { format: "png" });
          await writeFile(join(screenshots, `incline-collapsed-sr-${width}.png`), Buffer.from(collapsed.data,"base64"));
        }
      }
      await call("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:1,mobile:true});
      await seed(fixture(), route("cable-stretch-fly")); await open(); await fill("durationSeconds", "8");
      await click(`${panel} input[value="performed"]`);
      await evaluate("document.querySelector('[data-method-set]').scrollIntoView({block:'start'})");
      const shot = await call("Page.captureScreenshot", {format:"png"});
      await writeFile(join(screenshots,"iso-stretch-expanded-en-390.png"),Buffer.from(shot.data,"base64"));
      t.diagnostic(`Synthetic screenshots: ${screenshots}`);
    });
    const clusterId = "assisted-pull-up-cluster";
    const clusterRoute = route(clusterId, "d5");
    const set1 = '[data-method-set="1"]';
    const set2 = '[data-method-set="2"]';
    function clusterFixture() {
      const state = fixture("bulk-pro", "d5", fixture("bulk-pro", "d5", fixture("bulk-pro", "d5")));
      const { cycles } = state.progressByPlan["bulk-pro"];
      for (const n of [1, 2]) {
        const row = cycles[n].dayLogs.d5.mainExerciseLogs[clusterId].sets[n - 1];
        row.weight = "40";
        row.isDone = n === 2;
        row.methodLog = { choice: "record", phases: { "additional-burst": {
          execution: n === 1 ? "partial" : "performed", restSeconds: "", reps: String(n + 3),
          assistance: n === 1 ? { mode: "same", kg: "30" } : { mode: "entered", kg: "0" },
        } } };
      }
      cycles[3].dayLogs.d5.mainExerciseLogs[clusterId].sets[0].weight = "25";
      return state;
    }
    const clusterRows = async (number = 1) => JSON.parse(await read()).state.progressByPlan["bulk-pro"]
      .cycles[number].dayLogs.d5.mainExerciseLogs[clusterId].sets;
    const burstOf = (row) => row.methodLog?.phases["additional-burst"];
    const finishDay = async () => {
      await click("button", "Finish day");
      await click('[role="dialog"] button', "Finish and move on");
    };
    const enterDay = (day) => click(`a[href="/plan/bulk-pro/day/${day}"]:not([aria-current])`);
    async function openCluster(number) {
      await enterDay("d5");
      await wait(`Boolean(window.__qa.state.progressByPlan['bulk-pro'].cycles[${number}].dayLogs.d5)`);
      await click(`a[href="${clusterRoute}"]`);
      await wait(`Boolean(document.querySelector('[name="set-1-weight"]'))`);
    }
    async function reachCluster(number) {
      for (const day of ["d1", "d2", "d3", "d4"]) {
        await enterDay(day);
        await finishDay();
      }
      await openCluster(number);
      await wait("document.querySelectorAll('[data-method-set]').length===2");
    }
    await t.test("new Bulk cycle: start, reach D5, preserve both Cluster logs in V2, and reference them in Cycle 2", async () => {
      await seed(structuredClone(appInitialState), "/plan/bulk-pro");
      await click("a", "Start Cycle 1");
      await click('[role="dialog"] button', "I understand — start cycle");
      const first = await evaluate("window.__qa.state.progressByPlan['bulk-pro'].cycles[1]");
      assert.deepEqual(first.methodBindings, { version: 1, exercises: {
        "incline-db-press": { definitionId: "bulk-pro/incline-db-press/rest-pause", revision: 1, dayId: "d1", setCount: 3 },
        "cable-stretch-fly": { definitionId: "bulk-pro/cable-stretch-fly/iso-stretch", revision: 1, dayId: "d1", setCount: 1 },
        "face-away-cable-curl": { definitionId: "bulk-pro/face-away-cable-curl/rest-pause", revision: 1, dayId: "d4", setCount: 1 },
        [clusterId]: { definitionId: "bulk-pro/assisted-pull-up-cluster/cluster", revision: 1, dayId: "d5", setCount: 2 },
      } });
      assert.deepEqual(first.dayLogs, {});
      await reachCluster(1);
      assert.equal((await clusterRows()).length, 2);
      assert.equal(await evaluate('document.querySelectorAll(\'input[aria-label$="Assistance (kg)"]\').length'), 2);
      await click('input[name="set-1-weight"]');
      await call("Input.insertText", {text:"25"}); await settle();
      await click('button[aria-label="Mark set 1 performed"]');
      assert.equal((await clusterRows())[0].isDone, true);
      assert.equal(burstOf((await clusterRows())[0]), undefined);
      const before = await read();
      assert.equal(await evaluate("document.querySelectorAll('[data-method-set]').length"), 2);
      await click(set1 + " > button"); await click(set2 + " > button");
      assert.equal(await read(), before);
      assert.equal(await evaluate(`document.querySelector('${set2} [data-assistance=same]').disabled`), true);
      // Queue a real base edit immediately before the UI confirmation reaches the reducer.
      await evaluate(`window.__beforeMethod = {type:'UPDATE_EXERCISE_SET_FIELD', payload:{
        planId:'bulk-pro',dayId:'d5',exerciseId:'assisted-pull-up-cluster',setIndex:1,field:'weight',value:'35'}}`);
      await click(set1 + " [data-assistance=same]");
      assert.equal(burstOf((await clusterRows())[0]), undefined);
      assert.match(await evaluate(`document.querySelector('${set1}').innerText`), /Assistance was not updated/);
      await click(set1 + " [data-assistance=same]");
      await click('input[name="set-1-weight"]');
      await evaluate("document.activeElement.select()");
      await call("Input.insertText", {text:"25."}); await settle();
      assert.equal(await evaluate(`document.querySelector('${set1} [data-assistance=same]').disabled`), true);
      assert.deepEqual(burstOf((await clusterRows())[0]).assistance, { mode:"same", kg:"35" });
      await click(set2 + " [data-assistance=entered]");
      const input = set2 + ' input[name="assistanceKg"]';
      await click(input);
      await call("Input.insertText", {text:"12"});
      await click(set2 + " > button"); await click(set2 + " > button");
      assert.equal(burstOf((await clusterRows())[1]), undefined);
      assert.equal(await evaluate(`document.querySelector('${input}').value`), "12");
      async function enter(value) {
        await click(input); await evaluate("document.activeElement.select()");
        await call("Input.insertText", {text:value});
        await call("Input.dispatchKeyEvent", {type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
        await call("Input.dispatchKeyEvent", {type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
        await settle();
      }
      for (const value of ["32.", "1000", "1.23"]) {
        await enter(value);
        assert.equal(await evaluate(`document.querySelector('${input}').getAttribute('aria-invalid')`), "true");
        assert.equal(burstOf((await clusterRows())[1]), undefined);
      }
      for (const [value, kg] of [["0","0"],["032,5","32.5"]]) {
        await enter(value);
        assert.deepEqual(burstOf((await clusterRows())[1]).assistance, {mode:"entered",kg});
      }
      await click(set2 + ' input[name="reps"]'); await call("Input.insertText", {text:"4"});
      await click(set2 + ' input[value="performed"]');
      assert.equal((await clusterRows())[1].isDone, false);
      await click(set2 + ' input[name="assistanceKg"]');
      await click(set2 + ' div.space-y-3 > button');
      assert.equal((await clusterRows())[1].methodLog.choice,"skip");
      await click(set2 + ' div.space-y-3 > button');
      assert.equal(burstOf((await clusterRows())[1]).assistance.kg, "32.5");
      await click(set1 + ' input[name="reps"]'); await call("Input.insertText", {text:"3"});
      await click(set1 + ' input[name="restSeconds"]'); await call("Input.insertText", {text:"15"});
      await click(set1 + ' input[value="partial"]');
      const savedRows = await clusterRows();
      const generation = await evaluate("window.__generation");
      await evaluate(`sessionStorage.setItem('qa-route',${JSON.stringify(clusterRoute)})`);
      await call("Page.reload"); await wait(`window.__generation>${generation} && Boolean(document.querySelector('[data-method-set]'))`);
      assert.equal(JSON.parse(await read()).version, 2);
      assert.deepEqual(await clusterRows(), savedRows);
      await click(set2 + " > button");
      assert.match(await evaluate(`document.querySelector('${set2}').innerText`), /Entered · 32.5 kg/);
      await click(set2 + " [data-assistance=clear]");
      assert.deepEqual(burstOf((await clusterRows())[1]), { execution:"performed", reps:"4", restSeconds:"" });
      assert.deepEqual(burstOf((await clusterRows())[0]).assistance,{mode:"same",kg:"35"});
      await click('button', "Finish exercise");
      await finishDay();
      await enterDay("d6");
      await finishDay();
      await click('a[href="/plan/bulk-pro/end-cycle"]');
      await click("button", "Start Cycle 2");
      await reachCluster(2);
      assert.ok((await clusterRows(2)).every((row) => !Object.hasOwn(row, "methodLog") && !row.isDone));
      for (const panel of [set1, set2]) {
        await click(panel + " > button");
        await click(panel + " [data-method-history] > button");
        const history = await evaluate(`document.querySelector('${panel} [data-method-history]').innerText`);
        assert.match(history, /Cycle 1/);
        if (panel === set1) {
          assert.match(history, /Partially performed/);
          assert.match(history, /Same at confirmation · 35 kg/);
          assert.match(history, /Recorded rest \(optional\)\s+15 s/);
          assert.match(history, /Base set marked performed/);
        } else {
          assert.match(history, /Method: Performed/);
          assert.match(history, /Recorded assistance · Not recorded/);
          assert.match(history, /Base set not marked performed/);
        }
      }
      assert.ok((await clusterRows(2)).every((row) => !Object.hasOwn(row, "methodLog")));
    });

    await t.test("Cluster panels and history at 320, 360 and 390 px in English and Serbian", async () => {
      const directory = await mkdtemp(join(tmpdir(), "cycle-coach-4d-visual-"));
      for (const width of [320,360,390]) for (const locale of ["en","sr-Latn"]) {
        const t = createTranslator(locale);
        const state = clusterFixture();
        const rows = state.progressByPlan["bulk-pro"].cycles[3].dayLogs.d5.mainExerciseLogs[clusterId].sets;
        rows[0].methodLog = {choice:"record",phases:{"additional-burst":{execution:"partial",reps:"3",
          assistance:{mode:"same",kg:"35"}}}};
        await call("Emulation.setDeviceMetricsOverride",{width,height:width===320?568:800,deviceScaleFactor:1,mobile:true});
        await seed(state,clusterRoute,locale);
        if (width === 360 && locale === "en") {
          await evaluate(`document.querySelector('${set1}').scrollIntoView({block:'center'})`);
          const shot = await call("Page.captureScreenshot",{format:"png"});
          await writeFile(join(directory,"cluster-rows-en-360.png"),Buffer.from(shot.data,"base64"));
        }
        const label = await evaluate('document.querySelector("[name=set-1-weight]").getAttribute("aria-label")');
        assert.ok(label.includes(t("Assistance (kg)")));
        const before = await read();
        for (const [panel,cycle] of [[set1,1],[set2,2]]) {
          await click(panel+" > button");
          const toggle = panel+" [data-method-history] > button";
          assert.equal(await evaluate(`document.querySelector('${toggle}').getAttribute('aria-expanded')`),"false");
          await click(toggle);
          const history = await evaluate(`document.querySelector('${panel} [data-method-history]').innerText`);
          assert.ok(history.includes(t("Previous comparable attempt · Cycle {cycle}",{cycle})));
          assert.ok(history.includes(cycle===1?t("Same at confirmation · {kg} kg",{kg:"30"}):t("Entered · {kg} kg",{kg:"0"})));
        }
        await click(set2+" [data-assistance=entered]");
        await click(set2+' input[name="assistanceKg"]');
        assert.equal(await evaluate("document.activeElement.inputMode"),"decimal");
        assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true);
        assert.equal(await evaluate("document.querySelectorAll('[data-method-set] > [aria-expanded=true]').length"), 2);
        assert.equal(await read(),before);
        if ((locale==="en" && width===390) || (locale==="sr-Latn" && width===320)) {
          await evaluate(`document.querySelector('${set1} fieldset').scrollIntoView({block:'center'})`);
          const shot = await call("Page.captureScreenshot",{format:"png"});
          await writeFile(join(directory,`cluster-${locale}-${width}.png`),Buffer.from(shot.data,"base64"));
        }
        if (width === 320) {
          // A short viewport tests control reachability with focus; Chrome does not open an Android IME.
          await call("Emulation.setDeviceMetricsOverride", {width, height:340, deviceScaleFactor:1, mobile:true});
          await click(set2 + ' input[name="assistanceKg"]');
          await call("Input.insertText", {text:"27."});
          assert.equal(await read(), before);
          await click(set2 + " [data-assistance=clear]");
          assert.equal(await evaluate(`document.querySelector('${set2} input[name="assistanceKg"]') === null`), true);
          assert.equal(burstOf((await clusterRows(3))[1]), undefined);
          await click(set2 + ' input[name="reps"]');
          await call("Input.insertText", {text:"4"});
          await click(set2 + ' div.space-y-3 > button');
          assert.equal((await clusterRows(3))[1].methodLog.choice, "skip");
          await click(set2 + ' div.space-y-3 > button');
          assert.equal(burstOf((await clusterRows(3))[1]).reps, "4");
          assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
        }
      }
      t.diagnostic("Cluster review screenshots: "+directory);
    });

    await t.test("Cluster assistance blur keeps Skip and confirmation under the first pointer activation", async () => {
      const inputSelector = set2 + ' input[name="assistanceKg"]';
      const skipSelector = set2 + " div.space-y-3 > button";
      const partialSelector = set2 + ' input[value="partial"]';
      const performed = { execution: "performed", reps: "4", restSeconds: "15" };
      const snapshot = { mode: "same", kg: "35" };
      const manual = { mode: "entered", kg: "27.5" };

      async function enterDraft({ value, assistance, width = 320, locale = "en" }) {
        const state = fixture("bulk-pro", "d5");
        const [first, second] = state.progressByPlan["bulk-pro"].cycles[1].dayLogs.d5.mainExerciseLogs[clusterId].sets;
        first.methodLog = { choice: "skip", phases: {} };
        const phase = assistance ? { ...performed, assistance } : performed;
        Object.assign(second, { weight: "25", reps: "8", isDone: true,
          methodLog: { choice: "record", phases: { "additional-burst": phase } } });
        await call("Emulation.setDeviceMetricsOverride", { width, height: 540, deviceScaleFactor: 1, mobile: true });
        await seed(state, clusterRoute, locale);
        await click(set2 + " > button");
        await click(set2 + " [data-assistance=entered]");
        await click(inputSelector);
        await call("Input.insertText", { text: value });
        await settle();
        assert.deepEqual(await clusterRows(), [first, second]);
        return { first, second };
      }

      for (const [inputType, value, assistance, expectedAssistance] of [
        ["mouse", "27,", undefined, undefined],
        ["touch", "27,", snapshot, snapshot],
        ["mouse", "27,5", snapshot, manual],
      ]) {
        const { first, second } = await enterDraft({ value, assistance });
        const description = `${inputType} on Skip from ${value}`;
        if (inputType === "touch") {
          await call("Emulation.setTouchEmulationEnabled", { enabled: true });
          try {
            // The contact ends in place, with no fresh hit test or second tap.
            const point = await controlPoint(skipSelector);
            await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
            await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
            await wait(`document.querySelector(${JSON.stringify(skipSelector)}).textContent === "Resume recording"`);
            await settle();
          } finally {
            await call("Emulation.setTouchEmulationEnabled", { enabled: false });
          }
        } else {
          // click() uses a single point for both mouse events, even if blur changes layout.
          await click(skipSelector);
        }
        const [untouched, skipped] = await clusterRows();
        assert.equal(skipped.methodLog.choice, "skip", description);
        const expectedPhase = expectedAssistance ? { ...performed, assistance: expectedAssistance } : performed;
        assert.deepEqual(burstOf(skipped), expectedPhase, description);
        assert.deepEqual(untouched, first, description);
        await click(skipSelector);
        const expectedLog = { choice: "record", phases: { "additional-burst": expectedPhase } };
        assert.deepEqual(await clusterRows(), [first, { ...second, methodLog: expectedLog }], description);
      }

      for (const width of [320, 360, 390]) for (const locale of ["en", "sr-Latn"]) {
        const description = `${locale} at ${width}px`;
        const { first, second } = await enterDraft({ value: "27,", assistance: snapshot, width, locale });
        await click(partialSelector);
        assert.equal(await evaluate(`document.querySelector(${JSON.stringify(partialSelector)}).checked`), true, description);
        const expectedLog = { choice: "record", phases: { "additional-burst": {
          ...performed, execution: "partial", assistance: snapshot,
        } } };
        assert.deepEqual(await clusterRows(), [first, { ...second, methodLog: expectedLog }], description);
        const feedback = await evaluate(`(() => {
          const input = document.querySelector(${JSON.stringify(inputSelector)});
          const status = document.getElementById(input.getAttribute("aria-describedby"));
          const messages = [...status.querySelectorAll("p")];
          const bounds = messages.map(message => message.getBoundingClientRect());
          return { invalid: input.getAttribute("aria-invalid"), role: status.getAttribute("role"),
            messages: messages.map(message => message.innerText),
            wraps: bounds.some((rect, index) => rect.height > parseFloat(getComputedStyle(messages[index]).lineHeight)),
            separate: bounds.every((rect, index) => rect.width > 0 && rect.height > 0 &&
              (!index || rect.top >= bounds[index - 1].bottom)),
            fits: document.documentElement.scrollWidth <= innerWidth };
        })()`);
        const translate = createTranslator(locale);
        assert.equal(feedback.invalid, "true", description);
        assert.equal(feedback.role, "status", description);
        assert.ok(feedback.messages.includes(translate("Enter 0–999.9 kg with up to one decimal place.")), description);
        assert.ok(feedback.messages.includes(translate("The base has changed since confirmation. The recorded assistance is still {kg} kg.", { kg: "35" })), description);
        assert.ok(feedback.separate && feedback.fits, description);
        if (width === 320) assert.equal(feedback.wraps, true, description);
      }
    });

    await t.test("pre-activation, legacy and unknown snapshots stay protected on first D5 visit; Cut stays ordinary", async () => {
      for (const kind of ["legacy", "pre-activation", "unknown"]) {
        const state = fixture("bulk-pro", "d4");
        const current = state.progressByPlan["bulk-pro"].cycles[1];
        if (kind === "legacy") delete current.methodBindings;
        if (kind === "pre-activation") {
          delete current.methodBindings.exercises[clusterId];
          assert.equal(Object.keys(current.methodBindings.exercises).length, 3);
        }
        if (kind === "unknown") current.methodBindings.exercises[clusterId].revision = 99;
        assert.equal(current.dayLogs.d5, undefined);
        await seed(state, "/plan/bulk-pro/day/d4");
        await finishDay();
        await openCluster(1);
        assert.equal(await evaluate("document.querySelector('[data-method-set]')===null"), true, kind);
        assert.match(await evaluate('document.querySelector("[name=set-1-weight]").getAttribute("aria-label")'), /weight/i);
        const reopened = JSON.parse(await read()).state.progressByPlan["bulk-pro"].cycles[1];
        assert.deepEqual(reopened.methodBindings, current.methodBindings, kind);
        assert.ok((await clusterRows()).every((row) => !Object.hasOwn(row, "methodLog")), kind);
      }
      await seed(fixture("cut-pro", "d5"), route("assisted-pull-up-light", "d5", "cut-pro"));
      assert.deepEqual(await evaluate("window.__qa.state.progressByPlan['cut-pro'].cycles[1].methodBindings"),
        {version:1, exercises:{}});
      assert.equal(await evaluate("document.querySelector('[data-method-set]')===null"), true);
      assert.match(await evaluate('document.querySelector("[name=set-1-weight]").getAttribute("aria-label")'), /weight/i);
    });
    assert.deepEqual(exceptions, []);
    await send("Browser.close");
  } finally {
    pending.forEach((request) => clearTimeout(request.timer)); socket?.close();
    if (child && child.exitCode === null) { const exited = new Promise((resolve) => child.once("exit", resolve)); child.kill(); await exited; }
    await server?.close();
    await rm(profile, {recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
});
