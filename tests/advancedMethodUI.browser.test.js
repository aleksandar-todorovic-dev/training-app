import assert from "node:assert/strict";
import { test } from "node:test";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { env } from "node:process";
import { createServer } from "vite";
import { createTranslator } from "../src/i18n/translate.js";
import { preacherCatalogAlias } from "./preacherMechanicalFixture.js";
import { pushUpCatalogAlias } from "./pushUpMechanicalFixture.js";

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const storageKey = "training-app:v2:app-state";
const route = (exercise = "incline-db-press", day = "d1", plan = "bulk-pro") => `/plan/${plan}/day/${day}/exercise/${exercise}`;

const dropExercise = "leg-extension";
const dropBinding = { definitionId: "bulk-pro/leg-extension/dropset", revision: 1, dayId: "d3", setCount: 3 };
const dropIds = ["drop-1", "drop-2", "drop-3"];
const rolloutBindings = {
  "overhead-rope-extension": { definitionId: "bulk-pro/overhead-rope-extension/dropset", revision: 1, dayId: "d1", setCount: 4 },
  "machine-lateral-raise": { definitionId: "bulk-pro/machine-lateral-raise/dropset", revision: 1, dayId: "d4", setCount: 3 },
  "leg-press-calf-raise": { definitionId: "bulk-pro/leg-press-calf-raise/dropset", revision: 1, dayId: "d6", setCount: 3 },
};
const beforeCluster = { version: 1, exercises: {
  "incline-db-press": { definitionId: "bulk-pro/incline-db-press/rest-pause", revision: 1, dayId: "d1", setCount: 3 },
  "cable-stretch-fly": { definitionId: "bulk-pro/cable-stretch-fly/iso-stretch", revision: 1, dayId: "d1", setCount: 1 },
  "face-away-cable-curl": { definitionId: "bulk-pro/face-away-cable-curl/rest-pause", revision: 1, dayId: "d4", setCount: 1 },
} };
const beforeD3 = { version: 1, exercises: { ...beforeCluster.exercises,
  "assisted-pull-up-cluster": { definitionId: "bulk-pro/assisted-pull-up-cluster/cluster", revision: 1, dayId: "d5", setCount: 2 },
} };
const beforeRollout = { version: 1, exercises: { ...beforeD3.exercises, [dropExercise]: dropBinding } };
const preacherId = "preacher-curl-mechanical";
const preacherRoute = route(preacherId, "d6");
const preacherBinding = { definitionId: "bulk-pro/preacher-curl-mechanical/mechanical-set", revision: 1, dayId: "d6", setCount: 1 };
const beforePreacher = { version: 1, exercises: { ...beforeRollout.exercises, ...rolloutBindings } };
// This mode is for the pre-registration check. The normal suite uses the production registry.
const syntheticPreacher = env.CYCLE_COACH_SYNTHETIC_PREACHER === "1";
const syntheticPushUp = env.CYCLE_COACH_SYNTHETIC_PUSH_UP === "1";
const pushUpId = "push-up-mechanical-dropset";
const pushUpRoute = route(pushUpId, "d5");
const pushUpBinding = { definitionId: "bulk-pro/push-up-mechanical-dropset/mechanical-dropset", revision: 1, dayId: "d5", setCount: 1 };
const beforePushUp = { version: 1, exercises: { ...beforePreacher.exercises, [preacherId]: preacherBinding } };
const currentBulkBindings = { ...beforePushUp.exercises, [pushUpId]: pushUpBinding };

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

test("isolated Chrome: advanced method UI, cycle lifecycle and mobile layout", { skip: !chrome, timeout: 240000 }, async (t) => {
  const profile = await mkdtemp(join(tmpdir(), "cycle-coach-method-ui-"));
  const screenshots = "/tmp/cycle-coach-3a-visual";
  let server, child, socket;
  const pending = new Map();
  try {
    server = await createServer({ cacheDir: join(profile, "vite-cache"),
      server: { host: "127.0.0.1", port: 0, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime", "react-router-dom", "motion/react", "lucide-react"] },
      plugins: [...(syntheticPreacher ? [preacherCatalogAlias()] : []),
        ...(syntheticPushUp ? [pushUpCatalogAlias()] : []), { name: "method-ui-fixture", configureServer(vite) {
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
      if (syntheticPushUp && planId === "bulk-pro") state.progressByPlan[planId].cycles[number].methodBindings.exercises[pushUpId] = pushUpBinding;
      for (const day of ["d1", "d2", "d3", "d4", "d5", "d6"]) {
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
        if (message.error) {
          request.error.message = `${request.method}: ${JSON.stringify(message.error)}`;
          request.reject(request.error);
        } else request.resolve(message.result);
      }
    });
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer, method, error: new Error(method) });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
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
    const mechanical = "[data-mechanical]";
    const mechanicalInput = `${mechanical} input[name="reps"]`;
    const key = async (name, code) => {
      await call("Input.dispatchKeyEvent", {
        type: "keyDown", key: name, code: name, windowsVirtualKeyCode: code,
        ...(name === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}),
      });
      await call("Input.dispatchKeyEvent", { type: "keyUp", key: name, code: name, windowsVirtualKeyCode: code });
      await settle();
    };
    const bulkProgress = (state) => state.progressByPlan["bulk-pro"];
    const preacherRow = (state, number = bulkProgress(state).currentCycleNumber) =>
      bulkProgress(state).cycles[number].dayLogs.d6.mainExerciseLogs[preacherId].sets[0];
    const savedPreacher = async () => preacherRow(JSON.parse(await read()).state);
    const continuation = (row) => row.methodLog?.phases["narrow-grip"];

    const day5 = "/plan/bulk-pro/day/d5";
    const pushUpRow = (state, number = bulkProgress(state).currentCycleNumber) =>
      bulkProgress(state).cycles[number].dayLogs.d5.mainExerciseLogs[pushUpId].sets[0];
    const savedState = async () => JSON.parse(await read()).state;
    const savedPushUp = async () => pushUpRow(await savedState());
    const currentPushUpPhase = async () => (await savedPushUp()).methodLog?.phases["knee-push-up"];
    const rawWeight = " 075.0 ";
    const anomaly = "[data-push-up-retained-value] bdi";
    const toggleMechanical = () => click(`${mechanical} > button`);
    const pushUpHistory = `${mechanical} [data-method-history]`;
    const mainMetric = (field) => `[name="set-1-${field}"]`;
    const typeMain = async (field, value) => {
      await click(mainMetric(field));
      await call("Input.insertText", { text: value });
      await settle();
    };
    await t.test("Push-up Workbench and continuation preserve opaque evidence through V2 reload", async () => {
      const state = fixture("bulk-pro", "d5");
      assert.deepEqual(bulkProgress(state).cycles[1].methodBindings.exercises, currentBulkBindings);
      assert.deepEqual(pushUpRow(state), { setIndex: 1, weight: "", reps: "", rir: "", isDone: false });
      pushUpRow(state).weight = rawWeight;
      await seed(state, pushUpRoute);
      const before = await read();
      assert.equal(await evaluate(`document.querySelector('${anomaly}').textContent`), rawWeight);
      assert.equal(await evaluate('document.querySelector("[name=set-1-weight], [data-dropset]")'), null);
      assert.equal(await evaluate("document.querySelectorAll('[name$=-reps]').length"), 1);
      assert.ok((await evaluate("document.body.innerText")).includes("Standard push-up base"));
      assert.equal(await evaluate(`document.querySelector('${mechanical} > button').getAttribute('aria-expanded')`), "false");
      await toggleMechanical();
      assert.equal(await evaluate(`document.querySelectorAll('${mechanical} input:not([type=radio])').length`), 1);
      assert.equal(await read(), before);
      assert.deepEqual(await evaluate("window.__writes"), []);
      await typeMain("reps", "12");
      await typeMain("rir", "2");
      await fill("reps", "30");
      assert.deepEqual(await currentPushUpPhase(), { execution: "unconfirmed", reps: "30" });
      await fill("reps", "3");
      const draft = await read();
      await call("Input.insertText", { text: "1" });
      await settle();
      assert.equal(await evaluate("document.activeElement.value"), "3");
      assert.equal(await evaluate("document.activeElement.getAttribute('aria-invalid')"), "true");
      assert.equal(await read(), draft);
      // The CDP click retains its original coordinates for both halves of the gesture.
      await click(`${mechanical} input[value="partial"]`);
      assert.deepEqual(await currentPushUpPhase(), { execution: "partial", reps: "3" });
      assert.equal((await savedPushUp()).isDone, false);
      await click('button[aria-label="Mark set 1 performed"]');
      await fill("reps", "31");
      const skip = `${mechanical} [data-mechanical-choice]`;
      await call("Emulation.setTouchEmulationEnabled", { enabled: true });
      try {
        const point = await controlPoint(skip);
        await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
        await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await wait(`document.querySelector('${skip}').textContent === 'Resume recording'`);
        await settle();
      } finally {
        await call("Emulation.setTouchEmulationEnabled", { enabled: false });
      }
      assert.equal((await savedPushUp()).methodLog.choice, "skip");
      assert.equal((await savedPushUp()).isDone, true);
      await click(skip);
      assert.deepEqual(await currentPushUpPhase(), { execution: "partial", reps: "3" });
      await fill("reps", "");
      await click(`${mechanical} input[value="performed"]`);
      assert.deepEqual(await currentPushUpPhase(), { execution: "performed", reps: "" });
      assert.match(await evaluate(`document.querySelector('${mechanical}').innerText`), /Measurement not recorded/);
      await fill("reps", "0");
      const recorded = await read();
      const writes = await evaluate("window.__writes.length");
      await click(`${mechanical} input[value="performed"]`);
      await toggleMechanical();
      await toggleMechanical();
      await click(mechanicalInput);
      await evaluate(`window.__pushUpInput=document.activeElement;window.__pushUpInput.setSelectionRange(1,1);const s=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'sr-Latn');s.dispatchEvent(new Event('change',{bubbles:true}));`);
      await settle();
      assert.equal(await evaluate("document.activeElement===window.__pushUpInput && window.__pushUpInput.selectionStart===1"), true);
      assert.equal(await evaluate("window.__writes.length"), writes);
      assert.equal(await read(), recorded);
      await evaluate(`window.__navigate('${day5}');void 0`);
      await wait(`Boolean(document.querySelector('a[href="${pushUpRoute}"]'))`);
      assert.match(await evaluate(`document.querySelector('a[href="${pushUpRoute}"]').innerText`), /Osnova: standardni sklekovi/);
      await click(`a[href="${pushUpRoute}"]`);
      const generation = await evaluate("window.__generation");
      await call("Page.reload");
      await wait(`window.__generation>${generation} && Boolean(document.querySelector('${mechanical}'))`);
      assert.equal(await read(), recorded);
      assert.deepEqual(await savedPushUp(), { setIndex: 1, weight: rawWeight, reps: "12", rir: "2", isDone: true,
        methodLog: { choice: "record", phases: { "knee-push-up": { execution: "performed", reps: "0" } } } });
      assert.equal(await evaluate(`document.querySelector('${anomaly}').textContent`), rawWeight);
      assert.deepEqual(await evaluate("window.__writes"), []);
    });

    await t.test("Push-up EN/SR layouts, legacy, previews and one previous attempt remain read-only where required", async () => {
      const legacy = fixture("bulk-pro", "d5");
      bulkProgress(legacy).cycles[1].methodBindings = structuredClone(beforePushUp);
      Object.assign(pushUpRow(legacy), { weight: "75", reps: "26", rir: "1", isDone: true });
      const prior = fixture("bulk-pro", "d5", legacy);
      assert.deepEqual(pushUpRow(prior), { setIndex: 1, weight: "", reps: "", rir: "", isDone: false });
      Object.assign(pushUpRow(prior), { weight: rawWeight, reps: "12", rir: "2", isDone: true,
        methodLog: { choice: "record", phases: { "knee-push-up": { execution: "performed", reps: "0" } } } });
      const next = fixture("bulk-pro", "d5", prior);
      assert.deepEqual(pushUpRow(next), { setIndex: 1, weight: "", reps: "12", rir: "2", isDone: false });
      const directory = await mkdtemp(join(tmpdir(), "cycle-coach-6b2-visual-"));
      const capture = async (name, selector) => {
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
        await settle();
        const shot = await call("Page.captureScreenshot", { format: "png" });
        await writeFile(join(directory, `${name}.png`), Buffer.from(shot.data, "base64"));
      };
      const hostileText = '<img src=x onerror=alert(1)>' + 'W'.repeat(130);
      pushUpRow(next).weight = rawWeight;
      for (const locale of ["en", "sr-Latn"]) {
        const translate = createTranslator(locale);
        await seed(legacy, pushUpRoute, locale);
        assert.equal(await evaluate(`document.querySelector('${mainMetric("weight")}').value`), "75");
        assert.equal(await evaluate(`document.querySelector('${mainMetric("reps")}').value`), "26");
        assert.equal(await evaluate("document.querySelector('[data-mechanical]')"), null);
        const legacyNote = "Saved reps may come from different or combined variations.";
        assert.ok((await evaluate("document.body.innerText")).includes(translate(legacyNote)));
        await capture(`legacy-${locale}`, mainMetric("weight"));
        await seed(legacy, day5, locale);
        assert.ok((await evaluate(`document.querySelector('a[href="${pushUpRoute}"]').innerText`)).includes(translate(legacyNote)));
        const upcoming = fixture();
        await seed(upcoming, day5, locale);
        assert.ok((await evaluate(`document.querySelector('a[href="${pushUpRoute}"]').innerText`))
          .includes(translate("Standard push-ups · optional knee push-ups")));
        await click(`a[href="${pushUpRoute}"]`);
        assert.equal(await evaluate("document.querySelector('[data-mechanical], [name=set-1-reps]')"), null);
        assert.equal(await evaluate("window.__qa.state.progressByPlan['bulk-pro'].cycles[1].dayLogs.d5"), undefined);
        assert.deepEqual(await evaluate("window.__writes"), []);
        for (const width of [320, 360, 390]) {
          await call("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: true });
          await seed(next, pushUpRoute, locale);
          const initial = await read();
          assert.ok((await evaluate("document.body.innerText")).includes(translate("Previous compatible standard push-up values")));
          assert.equal(await evaluate(`document.querySelector('${anomaly}').textContent`), rawWeight);
          assert.deepEqual(await evaluate(`(() => {
            const cells = document.querySelector('[name=set-1-reps]').closest('.divide-x');
            const header = cells.parentElement.parentElement.previousElementSibling;
            const metrics = header.children[1];
            const mid = (el) => { const r=el.getBoundingClientRect(); return r.x+r.width/2; };
            const headings = [header.firstElementChild, ...metrics.children, header.lastElementChild];
            const misaligned = Array.from(cells.children).filter((cell,i)=>Math.abs(mid(cell)-mid(metrics.children[i])) >= 1);
            const clipped = headings.filter((heading) => {
              const words = document.createRange();
              words.selectNodeContents(heading);
              const text = words.getBoundingClientRect();
              const box = heading.getBoundingClientRect();
              return text.left < box.left - 0.5 || text.right > box.right + 0.5;
            });
            return [...misaligned, ...clipped].map((element) => element.textContent);
          })()`), [], `${locale} ${width}px headings`);
          if (width === 390) await capture(`bodyweight-${locale}-${width}`, mainMetric("reps"));
          if (width !== 360) await capture(`collapsed-${locale}-${width}`, mechanical);
          await toggleMechanical();
          assert.equal(await evaluate(`document.querySelector('${mechanicalInput}').value`), "");
          assert.equal(await evaluate(`document.querySelector('${mechanicalInput}').getBoundingClientRect().height>=44`), true);
          if (width !== 360) await capture(`expanded-${locale}-${width}`, mechanical);
          await evaluate(`document.querySelector('${mechanicalInput}').focus()`);
          assert.equal(await evaluate(`document.activeElement === document.querySelector('${mechanicalInput}')`), true);
          await key("Tab", 9);
          assert.equal(await evaluate(`document.activeElement.matches('${mechanical} input[type=radio]')`), true, `${locale} ${width}px`);
          await evaluate(`document.querySelector('${pushUpHistory} button').focus()`);
          await key("Enter", 13);
          assert.equal(await evaluate(`document.querySelector('${pushUpHistory} button').getAttribute('aria-expanded')`), "true");
          const history = await evaluate(`document.querySelector('${pushUpHistory}').innerText`);
          for (const key of ["Standard push-up base", "Bodyweight", "Base set marked performed",
            "Saved base values may include carry-over.", "This value is not used to compare bodyweight resistance."]) {
            assert.ok(history.includes(translate(key)), key);
          }
          assert.ok(history.includes(translate("Previous continuation · Cycle {cycle}", { cycle: 2 })));
          assert.ok(history.includes(translate("Extra reps: {value}", { value: "0" })));
          assert.equal(await evaluate(`document.querySelector('${pushUpHistory} ${anomaly}').textContent`), rawWeight);
          assert.equal(await evaluate(`document.querySelector('${pushUpHistory} input')`), null);
          assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true, `${locale} ${width}px`);
          if (width !== 360) await capture(`history-${locale}-${width}`, pushUpHistory);
          assert.equal(await read(), initial);
          assert.deepEqual(await evaluate("window.__writes"), []);
        }
      }
      pushUpRow(next).weight = hostileText;
      await call("Emulation.setDeviceMetricsOverride", { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
      await seed(next, pushUpRoute, "sr-Latn");
      assert.equal(await evaluate(`document.querySelector('${anomaly}').textContent`), hostileText);
      assert.equal(await evaluate(`document.querySelector('${anomaly} img')`), null);
      assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
      assert.equal((await savedPushUp()).weight, hostileText);
      await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      const previous = pushUpRow(prior);
      Object.assign(previous, { reps: "", rir: "", isDone: false });
      previous.methodLog.phases["knee-push-up"] = { reps: "", execution: "partial" };
      const blank = fixture("bulk-pro", "d5", prior);
      await seed(blank, pushUpRoute);
      assert.equal((await savedPushUp()).weight, "");
      assert.match(await evaluate("document.body.innerText"), /No earlier compatible standard push-up values/);
      await toggleMechanical();
      await click(`${pushUpHistory} button`);
      assert.match(await evaluate(`document.querySelector('${pushUpHistory}').innerText`), /Measurement not recorded[\s\S]*Base set not marked performed/);
      for (const edit of [
        (state) => { bulkProgress(state).cycles[1].methodBindings.exercises[pushUpId].revision = 99; },
        (state) => { pushUpRow(state).setIndex = 2; },
      ]) {
        const unresolved = fixture("bulk-pro", "d5");
        edit(unresolved);
        await seed(unresolved, pushUpRoute);
        assert.equal(await evaluate("document.querySelector('[data-mechanical]')"), null);
        assert.equal(await evaluate("document.querySelectorAll('[name$=-weight]').length"), 1);
        assert.match(await evaluate("document.body.innerText"), /Structured continuation logging is unavailable/);
      }
      t.diagnostic(`Push-up review screenshots: ${directory}`);
    });
    if (syntheticPushUp) {
      assert.deepEqual(exceptions, []);
      await send("Browser.close");
      return;
    }
    await t.test("Preacher disclosure, real pointer actions, stable controls and V2 reload", async () => {
      const state = fixture("bulk-pro", "d6");
      const current = bulkProgress(state).cycles[1];
      assert.deepEqual(current.methodBindings.exercises,
        syntheticPreacher ? beforePreacher.exercises : currentBulkBindings);
      if (syntheticPreacher) current.methodBindings.exercises[preacherId] = preacherBinding;
      await seed(state, preacherRoute);
      const initialRaw = await read();
      const toggle = `${mechanical} > button`;
      const skip = `${mechanical} [data-mechanical-choice]`;
      assert.equal(await evaluate(`document.querySelector('${toggle}').getAttribute('aria-expanded')`), "false");
      assert.ok((await evaluate("document.body.innerText")).includes("Wide-grip base"));
      await click(toggle);
      assert.equal(await evaluate(`document.querySelectorAll('${mechanical} input:not([type=radio])').length`), 1);
      await click(`${mechanical} input[value="unconfirmed"]`);
      assert.equal(await read(), initialRaw);
      await fill("reps", "30");
      assert.deepEqual(continuation(await savedPreacher()), { reps: "30", execution: "unconfirmed" });
      const draft = await read();
      for (const invalid of ["31", "01", "-1", "1.5", "1,5"]) {
        await fill("reps", invalid);
        assert.equal(await read(), draft);
        assert.equal(await evaluate("document.activeElement.value"), "30");
        assert.equal(await evaluate("document.activeElement.getAttribute('aria-invalid')"), "true");
      }
      // click() presses and releases at one coordinate pair with the input focused.
      await evaluate("void (window.__preacherInput=document.activeElement)");
      await click(`${mechanical} input[value="partial"]`);
      assert.equal(continuation(await savedPreacher()).execution, "partial");
      assert.equal((await savedPreacher()).isDone, false);
      await fill("reps", "31");
      await call("Emulation.setTouchEmulationEnabled", { enabled: true });
      try {
        const point = await controlPoint(skip);
        await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
        await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await wait(`document.querySelector('${skip}').textContent === 'Resume recording'`);
        await settle();
      } finally {
        await call("Emulation.setTouchEmulationEnabled", { enabled: false });
      }
      assert.equal((await savedPreacher()).methodLog.choice, "skip");
      assert.equal(continuation(await savedPreacher()).reps, "30");
      await click(skip);
      assert.equal(continuation(await savedPreacher()).execution, "partial");
      await click(toggle); await click(toggle);
      assert.equal(await evaluate(`window.__preacherInput===document.querySelector('${mechanicalInput}')`), true);
      await fill("reps", "0");
      await click(`${mechanical} input[value="performed"]`);
      assert.match(await summary(), /Attempt confirmed.*0/);
      const zero = await read();
      const writes = await evaluate("window.__writes.length");
      await click(`${mechanical} input[value="performed"]`);
      assert.equal(await read(), zero);
      assert.equal(await evaluate("window.__writes.length"), writes);
      await fill("reps", "");
      assert.deepEqual(continuation(await savedPreacher()), { execution: "performed", reps: "" });
      assert.ok((await evaluate("document.body.innerText")).includes("Measurement not recorded"));
      await click('button[aria-label="Mark set 1 performed"]');
      assert.equal((await savedPreacher()).isDone, true);
      await fill("reps", "0");
      const saved = await read();
      await evaluate(`window.__preacherInput=document.activeElement;window.__preacherInput.setSelectionRange(1,1);const s=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'sr-Latn');s.dispatchEvent(new Event('change',{bubbles:true}));`);
      await settle();
      assert.equal(await evaluate("document.activeElement===window.__preacherInput && window.__preacherInput.selectionStart===1"), true);
      assert.ok((await summary()).includes(createTranslator("sr-Latn")("Attempt confirmed")));
      assert.equal(await read(), saved);
      const generation = await evaluate("window.__generation");
      await call("Page.reload");
      await wait(`window.__generation>${generation} && Boolean(document.querySelector('${mechanical}'))`);
      assert.deepEqual(continuation(await savedPreacher()), { execution: "performed", reps: "0" });
      assert.equal((await savedPreacher()).isDone, true);
      assert.deepEqual(await evaluate("window.__writes"), []);
    });
    if (syntheticPreacher) {
      assert.deepEqual(exceptions, []);
      await send("Browser.close");
      return;
    }
    await t.test("Preacher real next-cycle prefill, history and EN/SR mobile layouts", async () => {
      const legacy = fixture("bulk-pro", "d6");
      bulkProgress(legacy).cycles[1].methodBindings = structuredClone(beforePreacher);
      Object.assign(preacherRow(legacy), { weight: "45", reps: "12", rir: "0", isDone: true });
      for (const locale of ["en", "sr-Latn"]) {
        const t = createTranslator(locale);
        await seed(legacy, preacherRoute, locale);
        assert.equal(await evaluate(`document.querySelector('${mechanical}')`), null);
        assert.equal(await evaluate('document.querySelector("[name=set-1-reps]").value'), "12");
        assert.ok((await evaluate("document.body.innerText")).includes(t("Saved reps may include both grips.")));
        await seed(legacy, "/plan/bulk-pro/day/d6", locale);
        assert.ok((await evaluate(`document.querySelector('a[href="${preacherRoute}"]').innerText`)).includes(t("Saved reps may include both grips.")));
        const upcoming = fixture();
        await seed(upcoming, "/plan/bulk-pro/day/d6", locale);
        assert.ok((await evaluate(`document.querySelector('a[href="${preacherRoute}"]').innerText`)).includes(t("Wide-grip prescription")));
        await seed(upcoming, preacherRoute, locale);
        assert.equal(await evaluate("document.querySelector('[data-method-set], input[name=set-1-reps]')"), null);
      }
      await seed(fixture("bulk-pro", "d6"), route("preacher-curl-ez", "d6"));
      assert.equal(await evaluate("document.querySelector('[data-method-set]')"), null);

      const first = fixture("bulk-pro", "d6", legacy);
      assert.deepEqual(preacherRow(first), { setIndex: 1, weight: "", reps: "", rir: "", isDone: false });
      await seed(first, "/plan/bulk-pro/day/d6");
      assert.ok((await evaluate(`document.querySelector('a[href="${preacherRoute}"]').innerText`)).includes("Wide-grip base"));
      await seed(first, preacherRoute);
      assert.ok((await evaluate("document.body.innerText")).includes("No earlier compatible wide-grip values"));
      for (const [field, value] of [["weight", "25"], ["reps", "7"], ["rir", "1"]]) {
        await click(`input[name="set-1-${field}"]`);
        await call("Input.insertText", { text: value });
        await settle();
      }
      await click('button[aria-label="Mark set 1 performed"]');
      await click(`${mechanical} > button`);
      await fill("reps", "0");
      await click(`${mechanical} input[value="performed"]`);
      const next = fixture("bulk-pro", "d6", JSON.parse(await read()).state);
      assert.deepEqual(preacherRow(next), { setIndex: 1, weight: "25", reps: "7", rir: "1", isDone: false });
      const directory = await mkdtemp(join(tmpdir(), "cycle-coach-6a2-visual-"));
      const capture = async (name, selector) => {
        await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
        await settle();
        const shot = await call("Page.captureScreenshot", { format: "png" });
        await writeFile(join(directory, `${name}.png`), Buffer.from(shot.data, "base64"));
      };
      for (const [width, height] of [[320, 568], [360, 800], [390, 844]]) for (const locale of ["en", "sr-Latn"]) {
        const t = createTranslator(locale);
        await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
        await seed(next, preacherRoute, locale);
        const before = await read();
        assert.ok((await evaluate("document.body.innerText")).includes(t("Previous compatible wide-grip values")));
        if (width !== 360) await capture(`collapsed-${locale}-${width}`, mechanical);
        await click(`${mechanical} > button`);
        assert.equal(await evaluate(`document.querySelector('${mechanicalInput}').value`), "");
        assert.equal(await evaluate(`document.querySelector('${mechanicalInput}').getBoundingClientRect().height>=44`), true);
        if (width !== 360) await capture(`expanded-${locale}-${width}`, mechanical);
        await click(mechanicalInput);
        await key("Tab", 9);
        assert.equal(await evaluate("document.activeElement.type"), "radio");
        const history = `${mechanical} [data-method-history]`;
        await evaluate(`document.querySelector('${history} button').focus()`);
        await key("Enter", 13);
        assert.equal(await evaluate(`document.querySelector('${history} button').getAttribute('aria-expanded')`), "true");
        const text = await evaluate(`document.querySelector('${history}').innerText`);
        for (const copy of [
          t("Previous comparable attempt · Cycle {cycle}", { cycle: 2 }), t("Wide-grip base"),
          t("Extra reps: {value}", { value: "0" }), t("Base set marked performed"),
        ]) assert.ok(text.includes(copy), copy);
        assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"), true);
        assert.equal(await evaluate(`document.querySelector('${history} input')`), null);
        if (width !== 360) await capture(`history-${locale}-${width}`, history);
        assert.equal(await read(), before);
        assert.deepEqual(await evaluate("window.__writes"), []);
      }
      const previous = preacherRow(next, 2);
      previous.isDone = false;
      continuation(previous).reps = "";
      await seed(next, preacherRoute);
      await click(`${mechanical} > button`);
      await click(`${mechanical} [data-method-history] button`);
      const history = await evaluate(`document.querySelector('${mechanical} [data-method-history]').innerText`);
      assert.ok(history.includes("Measurement not recorded"));
      assert.ok(history.includes("Base set not marked performed"));
      t.diagnostic(`Preacher review screenshots: ${directory}`);
    });
    await seed(fixture());
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
      await seed(fixture(), route("smith-bench-press"));
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

    await t.test("real Push-up cycle start, D5 Finish Day, V2 reload and next-cycle history", async () => {
      await evaluate("localStorage.removeItem('training-app:v1:safety-acknowledged')");
      await seed(structuredClone(appInitialState), "/plan/bulk-pro");
      await click("a", "Start Cycle 1");
      await click('[role="dialog"] button', "I understand — start cycle");
      const first = bulkProgress(await savedState()).cycles[1];
      assert.deepEqual(first.methodBindings, { version: 1, exercises: currentBulkBindings });
      assert.deepEqual(first.dayLogs, {});
      async function reachPushUp() {
        for (const day of ["d1", "d2", "d3", "d4"]) {
          await enterDay(day);
          await finishDay();
        }
        await enterDay("d5");
        await click(`a[href="${pushUpRoute}"]`);
      }
      await reachPushUp();
      await typeMain("reps", "11");
      await click('button[aria-label="Mark set 1 performed"]');
      await toggleMechanical();
      await fill("reps", "6");
      await click(`${mechanical} input[value="performed"]`);
      const current = await savedPushUp();
      assert.equal(current.weight, "");
      assert.deepEqual(await currentPushUpPhase(), { reps: "6", execution: "performed" });
      const generation = await evaluate("window.__generation");
      await evaluate(`sessionStorage.setItem('qa-route', '${pushUpRoute}')`);
      await call("Page.reload");
      await wait(`window.__generation>${generation} && Boolean(document.querySelector('${mechanical}'))`);
      assert.deepEqual(await savedPushUp(), current);
      assert.deepEqual(await evaluate("window.__writes"), []);
      await click('a', "Back to day");
      await click("button", "Finish day");
      const warnings = await evaluate("document.querySelector('[role=dialog]').innerText");
      assert.match(warnings, /1 main set performed/);
      assert.match(warnings, /Main reps or RIR fields: 1/);
      assert.doesNotMatch(warnings, /Main weight fields:/);
      await key("Escape", 27);
      await click(`a[href="${pushUpRoute}"]`);
      await typeMain("rir", "2");
      await click("a", "Back to day");
      await finishDay();
      await enterDay("d6");
      await finishDay();
      await click('a[href="/plan/bulk-pro/end-cycle"]');
      const archived = bulkProgress(await savedState()).cycles[1];
      await click("button", "Start Cycle 2");
      await reachPushUp();
      assert.deepEqual(await savedPushUp(), { setIndex: 1, weight: "", reps: "11", rir: "2", isDone: false });
      const beforeHistory = await read();
      await toggleMechanical();
      await click(`${pushUpHistory} button`);
      assert.match(await evaluate(`document.querySelector('${pushUpHistory}').innerText`), /Cycle 1[\s\S]*Extra reps: 6[\s\S]*Reps 11 · RIR 2/);
      assert.equal(await evaluate(`document.querySelector('${mechanicalInput}').value`), "");
      assert.equal(await read(), beforeHistory);
      assert.deepEqual(bulkProgress(await savedState()).cycles[1], archived);
      await evaluate("localStorage.removeItem('training-app:v1:safety-acknowledged')");
    });

    await t.test("new Bulk cycle: start, reach D5, preserve both Cluster logs in V2, and reference them in Cycle 2", async () => {
      await seed(structuredClone(appInitialState), "/plan/bulk-pro");
      await click("a", "Start Cycle 1");
      await click('[role="dialog"] button', "I understand — start cycle");
      const first = await evaluate("window.__qa.state.progressByPlan['bulk-pro'].cycles[1]");
      assert.deepEqual(first.methodBindings, { version: 1, exercises: currentBulkBindings });
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
          current.methodBindings = structuredClone(beforeCluster);
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
    const dropRoute = route(dropExercise, "d3");
    const dropEditor = "[data-dropset] [data-drop-editor]:not([hidden] *)";
    const dropLog = "window.__qa?.state.progressByPlan['bulk-pro']?.cycles[window.__qa.state.progressByPlan['bulk-pro'].currentCycleNumber]?.dayLogs.d3?.mainExerciseLogs['leg-extension']?.sets[2]?.methodLog";
    const dropAction = (action) => `[data-dropset] [data-drop-action="${action}"]:not([hidden] *)`;
    const doDropAction = (action) => click(dropAction(action));
    const dropValue = (field) => evaluate(`document.querySelector(${JSON.stringify(`${dropEditor} input[name="${field}"]`)})?.value`);
    const openDrop = () => click("[data-dropset] > button");
    const dropEdit = (phaseId) => click(`[data-drop-edit="${phaseId}"]`);
    const dropStep = () => evaluate(`document.querySelector(${JSON.stringify(dropEditor)})?.dataset.dropEditor`);
    const dropsetFixture = (previous, day = "d3") => {
      const state = fixture("bulk-pro", day, previous);
      const progress = state.progressByPlan["bulk-pro"];
      const current = progress.cycles[progress.currentCycleNumber];
      assert.deepEqual(current.methodBindings.exercises[dropExercise], dropBinding);
      return state;
    };
    async function fillDrop(field, value) {
      await click(`${dropEditor} input[name="${field}"]`);
      await evaluate("document.activeElement.select()");
      await call("Input.insertText", { text: value });
      await settle();
    }
    async function tapPoint(point) {
      await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }

    await t.test("new Bulk cycle: start, log D3 Dropset, restore it from V2 and reference it in Cycle 2", async () => {
      const bulk = "window.__qa.state.progressByPlan['bulk-pro']";
      const stored = async () => JSON.parse(await read()).state.progressByPlan["bulk-pro"];
      const rows = (cycle) => cycle.dayLogs.d3.mainExerciseLogs[dropExercise].sets;
      const openDay = async (day) => {
        await enterDay(day);
        await wait(`Boolean(${bulk}.cycles[${bulk}.currentCycleNumber].dayLogs.${day})`);
        await settle();
      };
      const reachDropset = async () => {
        for (const day of ["d1", "d2"]) {
          await openDay(day);
          await finishDay();
        }
        await openDay("d3");
        await click(`a[href="${dropRoute}"]`);
        await wait("Boolean(document.querySelector('[data-dropset]'))");
        assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('input[name^="set-"][name$="-weight"]'), input => input.name)`),
          ["set-1-weight", "set-2-weight", "set-3-weight"]);
        assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('[data-method-set]'), panel => panel.dataset.methodSet)`), ["3"]);
      };
      await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await call("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
      await evaluate("localStorage.removeItem('training-app:v1:safety-acknowledged')");
      await seed(structuredClone(appInitialState), "/plan/bulk-pro");
      await click("a", "Start Cycle 1");
      await click('[role="dialog"] button', "I understand — start cycle");
      const first = await evaluate(`${bulk}.cycles[1]`);
      assert.deepEqual(first.methodBindings.exercises[dropExercise], dropBinding);
      assert.deepEqual(first.dayLogs, {});
      await reachDropset();
      const before = await read();
      assert.equal(await dropStep(), undefined);
      await openDrop();
      assert.equal(await read(), before);
      await fillDrop("reps", "0");
      await fillDrop("loadKg", "27,5");
      assert.equal(await evaluate("document.activeElement.name"), "loadKg");
      await doDropAction("finish");
      const log = { choice: "record", endPhaseId: "drop-1", phases: {
        "drop-1": { execution: "performed", loadKg: "27.5", reps: "0" },
      } };
      assert.deepEqual(await evaluate(dropLog), log);
      const key = JSON.stringify(storageKey);
      await wait(`JSON.parse(localStorage.getItem(${key}))?.state.progressByPlan['bulk-pro'].cycles[1]?.dayLogs.d3?.mainExerciseLogs['leg-extension'].sets[2].methodLog?.endPhaseId === 'drop-1'`);
      const saved = JSON.parse(await read());
      assert.equal(saved.version, 2);
      const savedRows = rows(saved.state.progressByPlan["bulk-pro"].cycles[1]);
      assert.deepEqual(savedRows[2].methodLog, log);
      const withoutLog = structuredClone(saved.state);
      delete rows(withoutLog.progressByPlan["bulk-pro"].cycles[1])[2].methodLog;
      assert.deepEqual(withoutLog, JSON.parse(before).state);

      const generation = await evaluate("window.__generation");
      await evaluate(`sessionStorage.setItem('qa-route',${JSON.stringify(dropRoute)});delete window.__qa`);
      await call("Page.reload");
      await wait(`window.__generation > ${generation} && Boolean(${dropLog}?.endPhaseId)`);
      assert.deepEqual(await evaluate(dropLog), log);
      assert.deepEqual(await evaluate("window.__writes"), []);
      await click("button", "Finish exercise");
      await finishDay();
      for (const day of ["d4", "d5", "d6"]) {
        await openDay(day);
        await finishDay();
      }
      await click('a[href="/plan/bulk-pro/end-cycle"]');
      const archived = (await stored()).cycles[1];
      assert.deepEqual(rows(archived)[2].methodLog, log);
      await click("button", "Start Cycle 2");
      assert.deepEqual(await evaluate(`${bulk}.cycles[2].methodBindings`), first.methodBindings);
      await reachDropset();
      const current = await stored();
      assert.deepEqual(current.cycles[1], archived);
      assert.ok(rows(current.cycles[2]).every((row) => !row.isDone && !Object.hasOwn(row, "methodLog")));
      const writes = await evaluate("window.__writes.length");
      await openDrop();
      await click("[data-dropset] [data-method-history] button");
      assert.match(await evaluate("document.querySelector('[data-dropset] [data-method-history]').innerText"),
        /Cycle 1[\s\S]*Completed · 1\/3[\s\S]*27\.5/);
      assert.equal(await dropValue("loadKg"), "");
      assert.equal(await dropValue("reps"), "");
      assert.equal(await evaluate("window.__writes.length"), writes);
    });

    await t.test("first D3 visit does not retrofit pre-activation Bulk snapshots", async () => {
      for (const snapshot of [beforeCluster, beforeD3]) {
        const state = fixture("bulk-pro", "d2");
        const previous = state.progressByPlan["bulk-pro"].cycles[1];
        previous.methodBindings = structuredClone(snapshot);
        assert.equal(previous.dayLogs.d3, undefined);
        await seed(state, "/plan/bulk-pro/day/d2");
        await finishDay();
        await enterDay("d3");
        await click(`a[href="${dropRoute}"]`);
        await wait(`Boolean(document.querySelector('input[name="set-3-weight"]'))`);
        assert.equal(await evaluate("document.querySelector('[data-method-set]')"), null);
        const reopened = JSON.parse(await read()).state.progressByPlan["bulk-pro"].cycles[1];
        assert.deepEqual(reopened.methodBindings, previous.methodBindings);
        assert.ok(reopened.dayLogs.d3.mainExerciseLogs[dropExercise].sets.every((row) => !Object.hasOwn(row, "methodLog")));
      }
    });

    await t.test("a five-binding cycle never retrofits D1, D4 or D6 on first visit or reload", async () => {
      const state = fixture();
      const prior = state.progressByPlan["bulk-pro"].cycles[1];
      prior.methodBindings = structuredClone(beforeRollout);
      for (const [exerciseId, { dayId, setCount }] of Object.entries(rolloutBindings)) {
        const legacy = structuredClone(state);
        legacy.progressByPlan["bulk-pro"].cycles[1].currentDayId = dayId;
        legacy.progressByPlan["bulk-pro"].cycles[1].dayLogs = {};
        await seed(legacy, `/plan/bulk-pro/day/${dayId}`);
        await click(`a[href="${route(exerciseId, dayId)}"]`);
        await wait(`Boolean(document.querySelector('input[name="set-${setCount}-weight"]'))`);
        const saved = JSON.parse(await read()).state;
        const reopened = saved.progressByPlan["bulk-pro"].cycles[1];
        assert.deepEqual(reopened.methodBindings, beforeRollout);
        assert.ok(reopened.dayLogs[dayId].mainExerciseLogs[exerciseId].sets.every((row) => !Object.hasOwn(row, "methodLog")));
        await seed(saved, route(exerciseId, dayId));
        assert.equal(await evaluate("document.querySelector('[data-method-set], [name=set-1-weight][aria-describedby]')"), null);
        assert.deepEqual(await evaluate("window.__writes"), []);
      }
    });

    await t.test("new Bulk cycle: all four Dropsets save, reload and show separate next-cycle history in EN/SR", async () => {
      const bindings = { ...rolloutBindings, [dropExercise]: dropBinding };
      const days = ["d1", "d2", "d3", "d4", "d5", "d6"];
      const bulk = "window.__qa.state.progressByPlan['bulk-pro']";
      const stored = async () => JSON.parse(await read()).state;
      const cycles = (state) => state.progressByPlan["bulk-pro"].cycles;
      const rows = (cycle, exerciseId) => cycle.dayLogs[bindings[exerciseId].dayId].mainExerciseLogs[exerciseId].sets;
      const logs = {
        "overhead-rope-extension": { loadKg: "21.5", reps: "" },
        "leg-extension": { loadKg: "27.5", reps: "" },
        "machine-lateral-raise": { loadKg: "17.5", reps: "" },
        "leg-press-calf-raise": { loadKg: "0", reps: "0" },
      };
      const kgRule = "Record the total weight of added plates on both sides, excluding the sled, or the marked kg for the selected setting on a selectorized machine. Use the same convention for main sets and drops. Check carried-over values. Leave unknown kg blank.";
      const caveat = "Compare kg only on the same machine and using the same logging convention.";
      const steps = Object.entries(bindings);
      const captureDirectory = await mkdtemp(join(tmpdir(), "cycle-coach-5e-visual-"));
      t.diagnostic(`Phase 5e screenshots: ${captureDirectory}`);
      async function capture(element, name) {
        await evaluate(`document.querySelector(${JSON.stringify(element)}).scrollIntoView({block:'center', behavior:'instant'})`);
        await settle();
        const shot = await call("Page.captureScreenshot", { format: "png" });
        await writeFile(join(captureDirectory, `${name}.png`), Buffer.from(shot.data, "base64"));
      }
      async function traverse(visit) {
        for (const day of days) {
          await enterDay(day);
          await wait(`Boolean(${bulk}.cycles[${bulk}.currentCycleNumber].dayLogs.${day})`);
          const entry = steps.find(([, { dayId }]) => dayId === day);
          if (entry) {
            const [exerciseId, { setCount }] = entry;
            await click(`a[href="${route(exerciseId, day)}"]`);
            await wait(`Boolean(document.querySelector('input[name="set-${setCount}-weight"]'))`);
            assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('[data-method-set]'), p => p.dataset.methodSet)"), [String(setCount)]);
            await visit(exerciseId, day);
            await click("button", "Finish exercise");
          }
          await finishDay();
        }
      }
      const historySelector = "[data-dropset] [data-method-history]";
      await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
      await evaluate("localStorage.removeItem('training-app:v1:safety-acknowledged')");
      await seed(structuredClone(appInitialState), "/plan/bulk-pro");
      await click("a", "Start Cycle 1");
      await click('[role="dialog"] button', "I understand — start cycle");
      assert.deepEqual((await evaluate(`${bulk}.cycles[1]`)).methodBindings.exercises, currentBulkBindings);
      await traverse(async (exerciseId, day) => {
        await openDrop();
        if (day === "d6") {
          await fillDrop("loadKg", "27,");
          const before = await read();
          const writes = await evaluate("window.__writes.length");
          await doDropAction("finish");
          assert.equal(await read(), before);
          assert.equal(await evaluate("window.__writes.length"), writes);
          assert.equal(await dropValue("loadKg"), "27,");
          await fillDrop("reps", "0");
        }
        await fillDrop("loadKg", logs[exerciseId].loadKg.replace(".", ","));
        await doDropAction("finish");
        const savedRows = rows(cycles(await stored())[1], exerciseId);
        assert.ok(savedRows.slice(0, -1).every((row) => !Object.hasOwn(row, "methodLog")));
        assert.equal(savedRows.at(-1).isDone, false);
        assert.deepEqual(savedRows.at(-1).methodLog, { choice: "record", endPhaseId: "drop-1",
          phases: { "drop-1": { execution: "performed", ...logs[exerciseId] } } });
        assert.match(await summary(), /Completed · 1\/3/);
        assert.equal(JSON.parse(await read()).version, 2);
      });
      await click('a[href="/plan/bulk-pro/end-cycle"]');
      const archived = cycles(await stored())[1];
      const generation = await evaluate("window.__generation");
      await evaluate("sessionStorage.setItem('qa-route', '/plan/bulk-pro/end-cycle'); delete window.__qa");
      await call("Page.reload");
      await wait(`window.__generation > ${generation} && Boolean(window.__qa)`);
      assert.deepEqual(await evaluate(`${bulk}.cycles[1]`), archived);
      assert.deepEqual(await evaluate("window.__writes"), []);
      await click("button", "Start Cycle 2");
      await traverse(async (exerciseId, day) => {
        await openDrop();
        const before = await read();
        await click(`${historySelector} button`);
        const heading = day === "d6" ? "Previous recorded attempt" : "Previous comparable attempt";
        assert.equal(await evaluate(`document.querySelector('${historySelector} button').textContent.trim()`), `${heading} · Cycle 1`);
        const history = await evaluate(`document.querySelector('${historySelector}').innerText`);
        assert.ok(history.includes("Completed · 1/3"));
        const measurements = await evaluate(`Array.from(document.querySelectorAll('${historySelector} dd'), value => value.textContent)`);
        assert.deepEqual(measurements, [logs[exerciseId].loadKg, logs[exerciseId].reps || "Not recorded"]);
        assert.equal(await dropValue("loadKg"), "");
        assert.equal(await dropValue("reps"), "");
        assert.equal(await read(), before);
      });
      const state = await stored();
      assert.deepEqual(cycles(state)[1], archived);

      for (const width of [320, 360, 390]) for (const locale of ["en", "sr-Latn"]) {
        const translate = createTranslator(locale);
        await call("Emulation.setDeviceMetricsOverride", { width, height: 820, deviceScaleFactor: 1, mobile: true });
        for (const [exerciseId, { dayId, setCount }] of Object.entries(rolloutBindings)) {
          await seed(state, route(exerciseId, dayId), locale);
          const prefix = `${dayId}-${locale}-${width}`;
          const weight = `input[name="set-${setCount}-weight"]`;
          const description = await evaluate(`document.querySelector('${weight}').getAttribute('aria-describedby')`);
          assert.equal(Boolean(description), dayId === "d6");
          if (description) {
            const selector = `[id="${description}"]`;
            assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).innerText`), translate(kgRule));
            await capture(selector, `${prefix}-main-kg`);
          }
          await openDrop();
          const editorText = await evaluate("document.querySelector('[data-dropset]').innerText");
          assert.ok(editorText.includes(translate("Dropset is optional and does not change main-set Done. Stop early if form declines.")));
          if (dayId === "d6") {
            assert.ok(editorText.includes(translate(kgRule)));
            const described = await evaluate(`Array.from(document.querySelector('${dropEditor} [name=loadKg]').getAttribute('aria-describedby').split(' '), id => document.getElementById(id)?.innerText)`);
            assert.ok(described.includes(translate(kgRule)));
          }
          await click(`${historySelector} button`);
          const heading = dayId === "d6" ? "Previous recorded attempt · Cycle {cycle}" : "Previous comparable attempt · Cycle {cycle}";
          const historyText = await evaluate(`document.querySelector('${historySelector}').innerText`);
          assert.ok(historyText.includes(translate(heading, { cycle: 1 })));
          assert.equal(historyText.includes(translate(caveat)), dayId === "d6");
          assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth &&
            [...document.querySelectorAll('[data-dropset], ${historySelector}')].every(el => el.scrollWidth <= el.clientWidth)`), true, prefix);
          await capture(historySelector, `${prefix}-history`);
        }
      }
    });

    await t.test("Dropset starts collapsed, advances progressively and finishes explicitly at 1/3, 2/3 or 3/3", async () => {
      for (const count of [1, 2, 3]) {
        const state = dropsetFixture();
        state.progressByPlan["bulk-pro"].cycles[1].dayLogs.d3.mainExerciseLogs[dropExercise].sets[2].isDone = true;
        await seed(state, dropRoute);
        const original = await read();
        assert.equal(await evaluate("document.querySelector('[data-dropset]').dataset.methodSet"), "3");
        assert.equal(await dropStep(), undefined);
        await openDrop();
        assert.equal(await read(), original);
        for (let index = 0; index < count; index++) {
          assert.equal(await dropStep(), dropIds[index]);
          assert.equal(await evaluate(`document.querySelectorAll(${JSON.stringify(dropEditor)}).length`), 1);
          assert.equal(await evaluate(`Boolean(document.querySelector(${JSON.stringify(dropAction("continue"))}))`), index < 2);
          await fillDrop("loadKg", "27,5");
          await fillDrop("reps", index === 0 ? "0" : "5");
          assert.notEqual(await evaluate(`${dropLog}?.phases['${dropIds[index]}']?.execution`), "performed");
          await doDropAction(index + 1 === count ? "finish" : "continue");
          if (index + 1 < count) await pause(360);
        }
        const log = await evaluate(dropLog);
        assert.equal(log.endPhaseId, dropIds[count - 1]);
        assert.deepEqual(Object.keys(log.phases), dropIds.slice(0, count));
        assert.equal(log.phases["drop-1"].loadKg, "27.5");
        assert.equal(log.phases["drop-1"].reps, "0");
        assert.ok((await summary()).includes(`Completed · ${count}/3`));
        assert.equal(await dropStep(), undefined);
        const persisted = JSON.parse(await read()).state;
        delete persisted.progressByPlan["bulk-pro"].cycles[1].dayLogs.d3.mainExerciseLogs[dropExercise].sets[2].methodLog;
        assert.deepEqual(persisted, state);
      }
    });

    await t.test("Dropset touch actions validate the visible drafts before confirmation and ignore rapid repeat taps", async () => {
      const state = dropsetFixture();
      const set = state.progressByPlan["bulk-pro"].cycles[1].dayLogs.d3.mainExerciseLogs[dropExercise].sets[2];
      set.methodLog = { choice: "record", phases: { "drop-1": { execution: "unconfirmed", loadKg: "40", reps: "6" } } };
      await seed(state, dropRoute, "sr-Latn");
      await openDrop();
      await evaluate(`window.__dropClicks = [];
        document.addEventListener('click', (event) => {
          if (event.target.dataset.dropAction) window.__dropClicks.push(event.target.dataset.dropAction);
        }, true)`);
      await call("Emulation.setTouchEmulationEnabled", { enabled: true });
      try {
        for (const [incomplete, action] of [["27,", "finish"], ["27.", "continue"]]) {
          await fillDrop("loadKg", incomplete);
          const before = await read();
          const point = await controlPoint(dropAction(action));
          await tapPoint(point);
          await settle();
          assert.deepEqual(await evaluate(dropLog), set.methodLog);
          assert.equal(await read(), before);
          assert.equal(await dropValue("loadKg"), incomplete);
          assert.equal(await evaluate("window.__actions.length"), 0);
          assert.equal(await evaluate("window.__dropClicks.at(-1)"), action);
          assert.equal(await evaluate("document.activeElement.getAttribute('aria-invalid')"), "true");
        }
        await fillDrop("loadKg", "27,5");
        const point = await controlPoint(dropAction("continue"));
        await tapPoint(point);
        await tapPoint(point);
        await settle();
        assert.equal(await dropStep(), "drop-2");
        assert.deepEqual((await evaluate(dropLog)).phases, { "drop-1": { execution: "performed", loadKg: "27.5", reps: "6" } });
        assert.deepEqual(await evaluate("window.__actions.map(action => action.payload.change.type)"), ["set-metric", "set-execution"]);
        assert.equal(await dropValue("loadKg"), "");
        await fillDrop("loadKg", "20,5");
        await pause(360);
        await tapPoint(await controlPoint(dropAction("finish")));
        await settle();
        assert.equal((await evaluate(dropLog)).endPhaseId, "drop-2");
        assert.equal((await evaluate(dropLog)).phases["drop-2"].loadKg, "20.5");
      } finally {
        await call("Emulation.setTouchEmulationEnabled", { enabled: false });
      }
    });

    await t.test("Dropset separates blank and zero, edits a finished drop and preserves its end across Skip, Resume and reload", async () => {
      await seed(dropsetFixture(), dropRoute);
      await openDrop();
      assert.equal(await evaluate(`document.querySelector(${JSON.stringify(dropAction("finish"))}).disabled`), true);
      await click(`${dropEditor} input[type="checkbox"]`);
      assert.deepEqual(await evaluate("window.__writes"), []);
      await doDropAction("finish");
      assert.deepEqual((await evaluate(dropLog)).phases["drop-1"], { execution: "performed", loadKg: "", reps: "" });
      await dropEdit("drop-1");
      await fillDrop("reps", "0");
      await click(`${dropEditor} button`, "Save measurements");
      assert.equal((await evaluate(dropLog)).endPhaseId, "drop-1");
      assert.equal(await evaluate(`${dropLog}.phases['drop-1'].reps`), "0");
      assert.equal(await dropStep(), undefined);
      await pause(360);
      await doDropAction("skip");
      assert.equal((await evaluate(dropLog)).choice, "skip");
      await pause(360);
      await doDropAction("skip");
      assert.equal((await evaluate(dropLog)).endPhaseId, "drop-1");
      await pause(360);
      await doDropAction("extend");
      assert.equal(await dropStep(), "drop-2");
      await fillDrop("loadKg", "23,5");
      await pause(360);
      await doDropAction("finish");
      const log = await evaluate(dropLog);
      const generation = await evaluate("window.__generation");
      await call("Page.reload");
      await wait(`window.__generation > ${generation} && Boolean(${dropLog}?.endPhaseId)`);
      assert.deepEqual(await evaluate(dropLog), log);
      assert.equal(log.endPhaseId, "drop-2");
      assert.equal(log.phases["drop-2"].reps, "");
    });

    await t.test("Dropset history is read-only and only valid Bulk bindings get a panel on active or finished days", async () => {
      const earlier = dropsetFixture();
      const row = earlier.progressByPlan["bulk-pro"].cycles[1].dayLogs.d3.mainExerciseLogs[dropExercise].sets[2];
      row.methodLog = { choice: "record", endPhaseId: "drop-2", phases: {
        "drop-1": { execution: "performed", loadKg: "37.5", reps: "0" },
        "drop-2": { execution: "performed", loadKg: "30", reps: "" },
      } };
      const current = dropsetFixture(earlier, "d4");
      await seed(current, dropRoute);
      await openDrop();
      await click("[data-dropset] [data-method-history] button");
      const historyText = await evaluate("document.querySelector('[data-dropset] [data-method-history]').innerText");
      assert.match(historyText, /Cycle 1[\s\S]*Completed · 2\/3[\s\S]*37\.5[\s\S]*0[\s\S]*Not recorded/);
      assert.equal(await evaluate("document.querySelector('[data-method-history] input')"), null);
      assert.equal(await dropValue("loadKg"), "");
      assert.equal(await dropValue("reps"), "");
      assert.deepEqual(await evaluate("window.__writes"), []);
      await fillDrop("reps", "3");
      await doDropAction("finish");
      assert.equal((await evaluate(dropLog)).endPhaseId, "drop-1");

      for (const context of ["legacy", "pre-activation", "unknown", "malformed", "cut", "upcoming"]) {
        const state = context === "cut" ? fixture("cut-pro", "d3") : dropsetFixture();
        const cycle = state.progressByPlan[context === "cut" ? "cut-pro" : "bulk-pro"].cycles[1];
        if (context === "legacy") delete cycle.methodBindings;
        if (context === "pre-activation") cycle.methodBindings = structuredClone(beforeD3);
        if (context === "unknown") cycle.methodBindings.exercises[dropExercise].revision = 99;
        if (context === "malformed") cycle.methodBindings.exercises[dropExercise].setCount = 2;
        if (context === "upcoming") cycle.currentDayId = "d2";
        await seed(state, context === "cut" ? route(dropExercise, "d3", "cut-pro") : dropRoute);
        assert.equal(await evaluate("Boolean(document.querySelector('[data-dropset]'))"), false, context);
        assert.deepEqual(await evaluate("window.__writes"), [], context);
      }
    });

    await t.test("Dropset drafts survive disclosure and locale changes, support Enter and Tab and fit EN/SR at narrow widths", async () => {
      const dropsetScreenshots = await mkdtemp(join(tmpdir(), "cycle-coach-5d-visual-"));
      for (const width of [320, 360, 390]) {
        for (const locale of ["en", "sr-Latn"]) {
          const t = createTranslator(locale);
          await call("Emulation.setDeviceMetricsOverride", { width, height: 820, deviceScaleFactor: 1, mobile: true });
          await seed(dropsetFixture(), dropRoute, locale);
          await openDrop();
          await fillDrop("loadKg", "27,5");
          await openDrop();
          await openDrop();
          assert.equal(await dropValue("loadKg"), "27,5");
          const other = locale === "en" ? "sr-Latn" : "en";
          for (const language of [other, locale]) {
            await evaluate(`(() => { const s=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,${JSON.stringify(language)});s.dispatchEvent(new Event('change',{bubbles:true})); })()`);
            await settle();
            assert.equal(await dropValue("loadKg"), "27,5");
          }
          assert.deepEqual(await evaluate("window.__writes"), []);
          await click(`${dropEditor} input[name="loadKg"]`);
          for (const [key, keyCode] of [["Enter", 13], ["Tab", 9]]) {
            await call("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: keyCode });
            await call("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: keyCode });
            await settle();
          }
          assert.equal(await evaluate("document.activeElement.name"), "reps");
          assert.equal(await evaluate(`${dropLog}.phases['drop-1'].loadKg`), "27.5");
          assert.equal(await evaluate(`${dropLog}.phases['drop-1'].execution`), "unconfirmed");
          assert.match(await summary(), new RegExp(t("Not confirmed")));
          assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
          await evaluate("document.querySelector('[data-dropset]').scrollIntoView({ block: 'center', behavior: 'instant' })");
          await settle();
          const shot = await call("Page.captureScreenshot", { format: "png" });
          await writeFile(join(dropsetScreenshots, `dropset-${locale}-${width}.png`), Buffer.from(shot.data, "base64"));
        }
      }
      console.log(`Dropset mobile screenshots: ${dropsetScreenshots}`);
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
