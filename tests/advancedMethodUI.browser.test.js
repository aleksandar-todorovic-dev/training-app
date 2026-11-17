import assert from "node:assert/strict";
import { test } from "node:test";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const storageKey = "training-app:v2:app-state";
const route = (exercise = "incline-db-press", day = "d1", plan = "bulk-pro") => `/plan/${plan}/day/${day}/exercise/${exercise}`;

// Only the isolated server exposes this route. Real pages, context and persistence
// run under StrictMode; the wrapper observes dispatched actions without changing them.
const harness = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module">
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppStateProvider } from '/src/state/AppStateProvider.jsx';
import { AppStateContext } from '/src/state/AppStateContext.js';
import { useAppState } from '/src/state/useAppState.js';
import { LocaleProvider } from '/src/i18n/LocaleProvider.jsx';
import ExercisePage from '/src/pages/ExercisePage.jsx';
import '/src/index.css';
function Probe() {
  const context = useAppState(); const navigate = useNavigate();
  useEffect(() => { window.__qa = context; window.__navigate = navigate; });
  return React.createElement(AppStateContext.Provider, { value: {...context, dispatch(action) { window.__actions.push(action); context.dispatch(action); }} },
    React.createElement(Routes, null, React.createElement(Route, {path:'/plan/:planId/day/:dayId/exercise/:exerciseId', element:React.createElement(ExercisePage)})));
}
createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode, null,
  React.createElement(LocaleProvider, null, React.createElement(AppStateProvider, null,
    React.createElement(MemoryRouter, {initialEntries:[sessionStorage.getItem('qa-route')]}, React.createElement(Probe))))));
</script></body></html>`;

test("isolated Chrome: pilot Exercise UI interactions, lifecycle guards and mobile layout", { skip: !chrome, timeout: 180000 }, async (t) => {
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
    function fixture(planId = "bulk-pro", dayId = "d1") {
      let state = structuredClone(appInitialState);
      const send = (type, payload) => { state = appReducer(state, { type, payload: { planId, ...payload } }); };
      send(actions.START_PLAN_CYCLE, { startedAt: "2026-11-17T10:00:00Z" });
      for (const day of ["d1", "d2", "d3", "d4"]) {
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
    async function click(sel) {
      const point = await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(sel)}); if(!el) throw Error('Missing control'); el.scrollIntoView({block:'nearest'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
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
    assert.deepEqual(exceptions, []);
    await send("Browser.close");
  } finally {
    pending.forEach((request) => clearTimeout(request.timer)); socket?.close();
    if (child && child.exitCode === null) { const exited = new Promise((resolve) => child.once("exit", resolve)); child.kill(); await exited; }
    await server?.close();
    await rm(profile, {recursive:true,force:true,maxRetries:10,retryDelay:100});
  }
});
