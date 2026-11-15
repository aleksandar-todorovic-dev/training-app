import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
import { WORKOUT_STORAGE_KEYS } from "../src/storage/appStateStorage.js";

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const { v1, v2, reset, recoveryPrefix } = WORKOUT_STORAGE_KEYS;
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// This route exists only in this test server. It mounts real React/provider/shell
// code under StrictMode. Test controls outside the gate also exercise dispatch
// protection, independently of hidden UI. No production test hooks are added.
const harness = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module">
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AppStateProvider } from '/src/state/AppStateProvider.jsx';
import { useAppState } from '/src/state/useAppState.js';
import { LocaleProvider } from '/src/i18n/LocaleProvider.jsx';
import AppShell from '/src/components/layout/AppShell.jsx';
import '/src/index.css';
function Probe() {
  const context = useAppState(); const navigate = useNavigate();
  useEffect(() => { window.__qa = { ...context, navigate }; });
  return React.createElement(AppShell, null, React.createElement('p', { id: 'workout-content' }, 'Test workout'));
}
createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode, null,
  React.createElement(LocaleProvider, null, React.createElement(AppStateProvider, null,
    React.createElement(MemoryRouter, null, React.createElement(Probe))))));
</script></body></html>`;

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  const exceptions = [];
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") exceptions.push(JSON.stringify(message.params.exceptionDetails));
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") exceptions.push(message.params.entry.text);
    const request = pending.get(message.id);
    if (request) {
      clearTimeout(request.timer); pending.delete(message.id);
      if (message.error) request.reject(Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(Error(`Browser command timed out: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  return { send, exceptions, close: () => ws.close() };
}

test("isolated Chrome: StrictMode hydration, migration, retry, recovery, reset and real storage events", { skip: !chrome, timeout: 120000 }, async (t) => {
  const profile = await mkdtemp(join(tmpdir(), "cycle-coach-storage-qa-"));
  let child, browser, server;
  try {
    server = await createServer({ cacheDir: join(profile, "vite-cache"), server: { host: "127.0.0.1", port: 0 },
      optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "react/jsx-dev-runtime", "react/jsx-runtime", "react-router-dom", "motion/react", "lucide-react"] },
      plugins: [{ name: "isolated-storage-test", configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (req.url !== "/__storage-qa") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(await vite.transformIndexHtml(req.url, harness));
        });
      } }] });
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    child = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
      "--no-first-run", "--no-default-browser-check", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] });
    const endpoint = await new Promise((resolve, reject) => {
      let output = "";
      const timeout = setTimeout(() => reject(Error(`Chrome did not start: ${output.slice(-1000)}`)), 15000);
      child.stderr.on("data", (chunk) => {
        output += chunk;
        const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
      child.once("error", (error) => { clearTimeout(timeout); reject(error); });
    });
    browser = await connect(endpoint);
    async function page() {
      const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
      const call = (method, params) => browser.send(method, params, sessionId);
      await call("Page.enable"); await call("Runtime.enable"); await call("Log.enable");
      await call("Page.addScriptToEvaluateOnNewDocument", { source: `
        window.__writes = []; window.__failV2 = false; window.__failRemove = false;
        window.__denyReads = sessionStorage.getItem('deny-on-load') === 'true';
        window.__confirmations = []; window.__ignoreStorageEvents = false;
        window.confirm = (message) => { window.__confirmations.push(message); return true; };
        window.addEventListener('storage', (event) => {
          if (window.__ignoreStorageEvents) event.stopImmediatePropagation();
        }, true);
        const originalSet = Storage.prototype.setItem;
        const originalGet = Storage.prototype.getItem;
        const originalRemove = Storage.prototype.removeItem;
        Storage.prototype.setItem = function(key, value) {
          if (this === localStorage) {
            window.__writes.push(key);
            if (window.__failV2 && key === ${JSON.stringify(v2)}) throw new DOMException('Test quota', 'QuotaExceededError');
          }
          return originalSet.call(this, key, value);
        };
        Storage.prototype.getItem = function(key) {
          if (this === localStorage && window.__denyReads) throw new DOMException('Test read failure', 'SecurityError');
          return originalGet.call(this, key);
        };
        Storage.prototype.removeItem = function(key) {
          if (this === localStorage && window.__failRemove && key === ${JSON.stringify(v1)}) throw new Error('Test reset interruption');
          return originalRemove.call(this, key);
        };` });
      async function evaluate(expression) {
        const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
      }
      async function wait(expression) {
        // Cold Vite transforms can take longer while other test files compile.
        for (let index = 0; index < 1200; index += 1) {
          try { if (await evaluate(expression)) return; }
          catch (error) { if (!/context|navigat/i.test(error.message)) throw error; }
          await pause(50);
        }
        throw Error(`Browser condition timed out: ${expression}; body=${await evaluate("document.body.innerText")}; errors=${JSON.stringify(browser.exceptions)}`);
      }
      await call("Page.navigate", { url: `${origin}/__storage-qa` });
      await wait("Boolean(window.__qa)");
      return { evaluate, wait, call,
        reload: async () => { await evaluate("delete window.__qa"); await call("Page.reload"); await wait("Boolean(window.__qa)"); },
        click: async (text) => evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent === ${JSON.stringify(text)}).click()`),
      };
    }
    const first = await page();
    const read = (p, key) => p.evaluate(`localStorage.getItem(${JSON.stringify(key)})`);
    const select = (p, planId) => p.evaluate(`window.__qa.dispatch({type:'SELECT_PLAN',payload:{planId:${JSON.stringify(planId)}}})`);
    await t.test("fresh/valid mounts do not write; legitimate edits survive refresh", async () => {
      assert.equal(await first.evaluate("window.__qa.persistence.mode"), "ready");
      assert.deepEqual(await first.evaluate("window.__writes"), []);
      await select(first, "bulk-pro");
      await first.wait(`JSON.parse(localStorage.getItem(${JSON.stringify(v2)}))?.state.selectedPlanId === 'bulk-pro'`);
      await first.reload();
      assert.equal(await first.evaluate("window.__qa.state.selectedPlanId"), "bulk-pro");
      assert.deepEqual(await first.evaluate("window.__writes"), []);
    });
    const legacy = JSON.stringify({ version: 1, savedAt: "original", state: { selectedPlanId: "bulk-pro", progressByPlan: {} } });
    await t.test("StrictMode migration writes once and retains the original", async () => {
      await first.evaluate(`localStorage.clear(); localStorage.setItem(${JSON.stringify(v1)}, ${JSON.stringify(legacy)});`);
      await first.reload();
      await first.wait("window.__qa.persistence.mode === 'ready'");
      assert.equal(await read(first, v1), legacy);
      assert.deepEqual(await first.evaluate("window.__writes"), [v2]);
      assert.equal(JSON.parse(await read(first, v2)).savedAt, "original");
    });
    await t.test("quota failure keeps editable in-memory progress; retry verifies the save", async () => {
      const persisted = await read(first, v2);
      await first.evaluate("window.__failV2 = true");
      await select(first, "cut-pro");
      await first.wait("window.__qa.persistence.saveStatus === 'failed'");
      assert.equal(await first.evaluate("window.__qa.state.selectedPlanId"), "cut-pro");
      assert.equal(await read(first, v2), persisted);
      assert.match(await first.evaluate("document.body.innerText"), /Progress isn't being saved/);
      assert.equal(await first.evaluate("JSON.parse(window.__qa.exportMemory()).state.selectedPlanId"), "cut-pro");
      await first.evaluate("window.__failV2 = false");
      await first.click("Try again");
      await first.wait("window.__qa.persistence.saveStatus === 'saved'");
      assert.equal(JSON.parse(await read(first, v2)).state.selectedPlanId, "cut-pro");
    });
    const second = await page();
    await t.test("real cross-tab event blocks stale edits without discarding memory", async () => {
      await select(first, "bulk-pro");
      await second.wait("window.__qa.persistence.mode === 'storage-conflict'");
      assert.equal(await second.evaluate("window.__qa.state.selectedPlanId"), "cut-pro");
      await select(second, "cut-pro");
      assert.equal(JSON.parse(await read(second, v2)).state.selectedPlanId, "bulk-pro");
      assert.equal(await second.evaluate("Boolean(document.querySelector('#workout-content'))"), false);
      assert.equal(await second.evaluate("document.body.innerText.includes('Start with empty progress')"), false);
      await second.click("Load latest saved progress");
      await second.wait("window.__qa.persistence.mode === 'ready'");
      assert.equal(await second.evaluate("window.__qa.state.selectedPlanId"), "bulk-pro");
    });
    await t.test("stale reset before storage-event delivery preserves newer data and every storage key", async () => {
      await second.evaluate("window.__ignoreStorageEvents=true");
      await select(first, "cut-pro");
      await first.wait(`JSON.parse(localStorage.getItem(${JSON.stringify(v2)})).state.selectedPlanId === 'cut-pro'`);
      assert.equal(await second.evaluate("window.__qa.persistence.mode"), "ready");
      const before = await second.evaluate("Object.entries(localStorage).sort()");
      const previousWrites = await second.evaluate("window.__writes.length");
      await second.evaluate("window.__qa.resetProgress()");
      await second.wait("window.__qa.persistence.mode === 'storage-conflict'");
      assert.deepEqual(await second.evaluate("Object.entries(localStorage).sort()"), before);
      assert.equal(await second.evaluate("window.__writes.length"), previousWrites);
      assert.equal(await read(second, reset), null);
      assert.equal(await second.evaluate("window.__qa.state.selectedPlanId"), "bulk-pro");
      assert.equal(await second.evaluate("document.body.innerText.includes('Start with empty progress')"), false);
      await second.evaluate("window.__ignoreStorageEvents=false");
      await second.click("Load latest saved progress");
      await second.wait("window.__qa.persistence.mode === 'ready'");
      assert.equal(await second.evaluate("window.__qa.state.selectedPlanId"), "cut-pro");
    });
    await t.test("unsafe V2 is gated, public content stays accessible, recovery verifies a backup", async () => {
      await first.evaluate(`localStorage.setItem(${JSON.stringify(v2)}, 'broken-original')`);
      await first.reload();
      await first.wait("window.__qa.persistence.mode === 'recovery-required'");
      await select(first, "cut-pro");
      assert.equal(await read(first, v2), "broken-original");
      assert.equal(await first.evaluate("Boolean(document.querySelector('#workout-content'))"), false);
      await first.evaluate("window.__qa.navigate('/privacy')");
      await first.wait("Boolean(document.querySelector('#workout-content'))");
      await first.evaluate("window.__qa.navigate('/')");
      await first.click("Restore older progress");
      await first.wait("window.__qa.persistence.mode === 'ready'");
      assert.equal(await first.evaluate(`Object.keys(localStorage).filter(k => k.startsWith(${JSON.stringify(recoveryPrefix)})).map(k => localStorage.getItem(k))[0]`), "broken-original");
      assert.equal(await read(first, v1), legacy);
    });
    await t.test("interrupted reset stays blocked and can finish without removing preferences", async () => {
      await first.evaluate("localStorage.setItem('training-app:v1:locale','en'); localStorage.setItem('training-app:v1:safety-acknowledged','true'); window.__failRemove=true; window.__qa.resetProgress()");
      await first.wait("window.__qa.persistence.mode === 'reset-incomplete'");
      assert.notEqual(await read(first, reset), null);
      await first.evaluate("window.__failRemove=false");
      await first.click("Complete progress reset");
      await first.wait("window.__qa.persistence.mode === 'ready'");
      assert.match(await first.evaluate("window.__confirmations.at(-1)"), /Permanently delete.*original record and recovery copies\? Export the original first/);
      assert.equal(await read(first, reset), null);
      assert.equal(await read(first, v1), null);
      assert.deepEqual(JSON.parse(await read(first, v2)).state, { selectedPlanId: null, progressByPlan: {} });
      assert.equal(await read(first, "training-app:v1:locale"), "en");
      assert.equal(await read(first, "training-app:v1:safety-acknowledged"), "true");
    });
    await t.test("explicit erase warns in EN/SR and removes the original and recovery copies", async () => {
      for (const locale of ["en", "sr-Latn"]) {
        const backup = `${recoveryPrefix}erase-test`;
        await first.evaluate(`localStorage.setItem(${JSON.stringify(v2)}, 'erase-original'); localStorage.setItem(${JSON.stringify(backup)}, 'erase-backup'); localStorage.setItem('training-app:v1:locale', ${JSON.stringify(locale)})`);
        await first.reload();
        await first.wait("window.__qa.persistence.mode === 'recovery-required'");
        await first.click(locale === "en" ? "Start with empty progress" : "Počni bez sačuvanog napretka");
        await first.wait("window.__qa.persistence.mode === 'ready'");
        assert.match(await first.evaluate("window.__confirmations.at(-1)"), locale === "en"
          ? /Permanently delete.*original record and recovery copies\? Export the original first/
          : /Trajno obrisati.*izvorni zapis i rezervne kopije za oporavak\? Prvo izvezi izvorni zapis/);
        assert.deepEqual(JSON.parse(await read(first, v2)).state, { selectedPlanId: null, progressByPlan: {} });
        assert.equal(await read(first, backup), null);
        assert.equal(await read(first, v1), null);
        assert.equal(await read(first, reset), null);
        assert.equal(await read(first, "training-app:v1:locale"), locale);
      }
      await first.evaluate("localStorage.setItem('training-app:v1:locale','en')");
      await first.reload();
    });
    await t.test("read failure protects hydration; retry works and SR recovery fits a narrow viewport", async () => {
      await first.evaluate("sessionStorage.setItem('deny-on-load','true')");
      await first.reload();
      await first.wait("window.__qa.persistence.mode === 'storage-unavailable'");
      assert.equal(await first.evaluate("Boolean(document.querySelector('#workout-content'))"), false);
      await first.evaluate("window.__denyReads=false; sessionStorage.removeItem('deny-on-load')");
      await first.click("Try again");
      await first.wait("window.__qa.persistence.mode === 'ready'");
      await first.evaluate(`localStorage.setItem(${JSON.stringify(v2)}, 'invalid'); localStorage.setItem('training-app:v1:locale','sr-Latn')`);
      await first.reload();
      await first.wait("window.__qa.persistence.mode === 'recovery-required'");
      await first.call("Emulation.setDeviceMetricsOverride", { width: 320, height: 780, deviceScaleFactor: 1, mobile: true });
      assert.match(await first.evaluate("document.body.innerText"), /Potrebna je provera sačuvanog napretka/);
      assert.equal(await first.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), true);
      assert.equal(await first.evaluate("document.activeElement.tagName"), "H2");
    });
    assert.deepEqual(browser.exceptions, []);
  } finally {
    try { await browser?.send("Browser.close"); } catch { /* Chrome may already have exited. */ }
    browser?.close();
    if (child && child.exitCode === null) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill(); await exited;
    }
    await server?.close();
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
