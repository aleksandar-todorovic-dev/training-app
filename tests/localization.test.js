import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";
import { Linter } from "eslint";
import { srLatn } from "../src/i18n/sr-Latn.js";
import { createTranslator, englishPlurals, performedSetLabel } from "../src/i18n/translate.js";
import { loadLocale, saveLocale, LOCALE_STORAGE_KEY } from "../src/i18n/localeStorage.js";
import { updateDocumentMetadata } from "../src/i18n/documentMetadata.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const en = createTranslator("en");
const sr = createTranslator("sr-Latn");
const unchanged = (text) => /^[\d\s≈.×x+%°–—/()-]*(?:(?:s|min|kg)[\d\s≈.×x+%°–—/()-]*)?$/.test(text)
  || /^(?:RIR|Kg|kg|Tempo|Bulk Pro|Cut Pro|Cycle Coach|Core(?: [ABC])?|D[1-6]|English|Srpski|cyclecoach.app@gmail.com)$/.test(text);
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

let vite, appReducer, actions, appInitialState, AppStateContext, LocaleContext;
let loadStoredAppState, saveStoredAppState, clearStoredAppState;
let getPlanById, getDayDetails, getDayDetailsByPlanId, getExercisesForDay;
let getCoreBlockById, getCoreExercisesByIds, getGuideByPlanId, getWarmupById;
const components = {};
after(() => vite?.close());
before(async () => {
  vite = await createServer({ root,
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom" });
  const load = (path) => vite.ssrLoadModule(`/src/${path}`);
  [
    { appReducer }, { APP_ACTIONS: actions }, { appInitialState }, { AppStateContext }, { LocaleContext },
    { loadStoredAppState, saveStoredAppState, clearStoredAppState },
    { getPlanById }, { getDayDetails, getDayDetailsByPlanId }, { getExercisesForDay },
    { getCoreBlockById, getCoreExercisesByIds }, { getGuideByPlanId }, { getWarmupById },
  ] = await Promise.all([
    "state/appReducer.js", "state/appActions.js", "state/appInitialState.js", "state/AppStateContext.js",
    "i18n/LocaleContext.js", "storage/appStateStorage.js", "data/plans/index.js", "data/dayDetails/index.js",
    "data/exercises/index.js", "data/core/index.js", "data/guides/index.js", "data/warmups/index.js",
  ].map(load));
  await Promise.all([
    ...["HomePage", "PlanOverviewPage", "CyclePage", "DayPage", "ExercisePage", "CorePage", "GuidePage", "EndCyclePage", "PublicInfoPage", "NotFoundPage"].map((name) => [name, `pages/${name}.jsx`]),
    ["GuideGroupCard", "components/guide/GuideGroupCard.jsx"],
    ["WarmupSheet", "components/warmup/WarmupSheet.jsx"],
    ["HelpSheet", "components/common/HelpSheet.jsx"],
    ["FirstStartSafetySheet", "components/system/FirstStartSafetySheet.jsx"],
    ["FinishDaySheet", "components/day/FinishDaySheet.jsx"],
    ["LocaleProvider", "i18n/LocaleProvider.jsx"],
    ["LanguageSelector", "components/system/LanguageSelector.jsx"],
  ].map(async ([name, path]) => { const module = await load(path); components[name] = module.default ?? module[name]; }));
});

test("catalog placeholders, plural forms and training numbers match the English source", () => {
  assert.ok(Object.keys(srLatn).length > 1500);
  for (const [source, translation] of Object.entries(srLatn)) {
    const variants = typeof translation === "string" ? [translation] : Object.values(translation);
    if (typeof translation === "object") assert.deepEqual(Object.keys(translation).sort(), ["few", "one", "other"]);
    for (const text of variants) {
      assert.ok(text.trim(), source);
      assert.deepEqual(placeholders(text), placeholders(source), source);
    }
  }
  // Test prescriptions and instructional numbers, not a translated legal date.
  for (const group of ["support", "exercises", "guides", "plans", "warmups"]) {
    const source = readFileSync(`${root}src/i18n/sr-Latn/${group}.js`, "utf8");
    const catalog = JSON.parse(source.replace(/^export default /, "").replace(/;\s*$/, ""));
    for (const [key, value] of Object.entries(catalog)) {
      assert.deepEqual(value.match(/\d+(?:\.\d+)?/g), key.match(/\d+(?:\.\d+)?/g), key);
    }
  }
});

test("English fallback, interpolation and Serbian one/few/other counts", () => {
  assert.equal(en("Back to home"), "Back to home");
  assert.equal(sr("Back to home"), "Nazad na početnu");
  assert.equal(createTranslator("invalid")("Back to home"), "Back to home");
  assert.equal(sr("Unknown {name}", { name: "value" }), "Unknown value");
  assert.equal(sr("Unknown {name}"), "Unknown {name}");
  assert.equal(sr("{plan} · Cycle {cycle} · {day}", { plan: "Bulk Pro", cycle: 2, day: "D4" }), "Bulk Pro · Ciklus 2 · D4");
  assert.equal(sr("View {value0}", { value0: "Chest & Triceps" }), "Pogledaj Grudi i triceps");
  for (const [count, noun] of [[0,"serija"],[1,"serija"],[2,"serije"],[4,"serije"],[5,"serija"],[11,"serija"],[12,"serija"],[14,"serija"],[21,"serija"],[22,"serije"],[101,"serija"],[111,"serija"],[1.2,"serije"]]) {
    assert.equal(sr("{count} sets", { count }), `${count} ${noun}`);
  }
  for (const key of Object.keys(englishPlurals)) {
    assert.ok(srLatn[key], key);
    for (const count of [0,1,2,5,11,21,22]) assert.doesNotMatch(sr(key, { count }), /\{count\}/);
  }
  assert.equal(performedSetLabel(en, 1), "1 main set performed");
  assert.equal(performedSetLabel(en, 2), "2 main sets performed");
  assert.equal(performedSetLabel(sr, 1), "Odrađena 1 glavna serija");
  assert.equal(performedSetLabel(sr, 2), "Odrađene 2 glavne serije");
  assert.equal(performedSetLabel(sr, 5, "Core"), "Odrađeno 5 Core serija");
});

test("locale storage defaults safely and writes only its separate preference key", () => {
  const store = storage({ "training-app:v1:app-state": "workout bytes", "training-app:v1:safety-acknowledged": "true" });
  assert.equal(loadLocale(store), "en");
  for (const malformed of ["", "sr", "SR-LATN", "null", '{"locale":"sr-Latn"}', "../../", "<script>"]) {
    store.setItem(LOCALE_STORAGE_KEY, malformed);
    assert.equal(loadLocale(store), "en");
  }
  assert.equal(saveLocale("sr-Latn", store), true);
  assert.equal(loadLocale(store), "sr-Latn");
  assert.equal(store.getItem("training-app:v1:app-state"), "workout bytes");
  assert.equal(store.getItem("training-app:v1:safety-acknowledged"), "true");
  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("quota"); } };
  assert.equal(loadLocale(blocked), "en");
  assert.equal(saveLocale("sr-Latn", blocked), false);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw Error("denied"); } });
    assert.equal(loadLocale(), "en");
    assert.equal(saveLocale("sr-Latn"), false);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});

test("document language, description and route metadata update in both languages", () => {
  let description;
  const document = { documentElement: {}, querySelector: () => ({ setAttribute: (name, value) => { description = value; } }) };
  for (const path of ["/", "/privacy", "/preview-terms", "/fitness-safety", "/contact", "/plan/bulk-pro", "/plan/cut-pro/cycle", "/plan/bulk-pro/day/d2", "/plan/bulk-pro/day/d2/exercise/weighted-pull-up", "/plan/cut-pro/day/d2/core/core-a", "/plan/bulk-pro/guide", "/plan/cut-pro/end-cycle", "/missing"]) {
    updateDocumentMetadata("sr-Latn", path, document);
    assert.equal(document.documentElement.lang, "sr-Latn");
    assert.match(document.title, /^Cycle Coach · /);
    assert.match(description, /pomoćnik za strukturisan trening/);
    updateDocumentMetadata("en", path, document);
    assert.equal(document.documentElement.lang, "en");
    assert.match(description, /structured training companion/);
  }
  updateDocumentMetadata("sr-Latn", "/privacy", document);
  assert.equal(document.title, "Cycle Coach · Privatnost");
});

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? sourceFiles(path) : /\.[jt]sx?$/.test(path) ? [path] : [];
  });
}

test("all source data and UI copy have Serbian catalog entries", () => {
  const missing = [];
  const dataFields = new Set(["label","name","title","goal","shortDescription","audience","cycleLabel","intro","coreSystem","keyRules","focus","rirRule","advancedTechniques","subtitle","prescription","cue","tempo","rest","targetRir","progression","advancedTechnique","extraCues","note","notes","paragraphs","bullets","lead","eyebrow","items"]);
  const linter = new Linter();
  const rule = { create: () => ({ Literal(node) {
    const s = node.value;
    if (typeof s !== "string" || unchanged(s) || Object.hasOwn(srLatn, s)) return;
    if (node.parent.type === "ImportDeclaration" || node.parent.type === "Property" && node.parent.key === node) return;
    let field = node.parent;
    while (field && field.type !== "Property") field = field.parent;
    if (currentFile.includes("/data/")) {
      if (dataFields.has(field?.key.name)) missing.push(`${currentFile}:${node.loc.start.line} ${s}`);
    } else {
      if (!/[A-Z]|[a-z] [a-z]/.test(s) || /[#[]/.test(s) || /^(?:flex |grid |relative flex |group |mb-|ml-|p-| x |http:|M\d)/.test(s) || s.includes("prefers-reduced-motion") || ["Escape","Tab"].includes(s)) return;
      if (node.parent.type === "JSXAttribute" && !["aria-label","title","alt","placeholder"].includes(node.parent.name.name)) return;
      missing.push(`${currentFile}:${node.loc.start.line} ${s}`);
    }
  }, JSXText(node) {
    const text = node.value.replace(/\s+/g, " ").trim();
    if (/[a-z]/i.test(text) && !unchanged(text)) missing.push(`${currentFile}:${node.loc.start.line} raw JSX: ${text}`);
  } }) };
  let currentFile;
  for (const file of [...sourceFiles(`${root}src/data`), ...sourceFiles(`${root}src/pages`), ...sourceFiles(`${root}src/components`)]) {
    if (file.endsWith("index.js")) continue;
    currentFile = file;
    const result = linter.verify(readFileSync(file, "utf8"), [{ files: ["**/*.{js,jsx}"], languageOptions: { ecmaVersion: "latest", sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } }, plugins: { coverage: { rules: { copy: rule } } }, rules: { "coverage/copy": "error" } }], { filename: file });
    assert.equal(result.filter((item) => item.fatal).length, 0, file);
  }
  assert.deepEqual(missing, []);
});

function workout(planId) {
  let state = structuredClone(appInitialState);
  const send = (type, payload = {}) => { state = appReducer(state, { type, payload: { planId, ...payload } }); };
  const ensure = (dayId) => {
    const dayDetails = getDayDetails(planId, dayId);
    send(actions.ENSURE_DAY_LOG, { dayId, dayDetails, exercises: getExercisesForDay(planId, dayDetails.exerciseIds) });
  };
  const cycle = () => { const progress = state.progressByPlan[planId]; return progress.cycles[progress.currentCycleNumber]; };
  send(actions.START_PLAN_CYCLE, { startedAt: "2026-11-01T10:00:00Z" });
  ensure("d1");
  return { state: () => state, send, ensure, cycle };
}
function render(name, state, locale, path = "/", url = "/", props = {}) {
  return renderToStaticMarkup(h(LocaleContext.Provider, { value: { locale, t: createTranslator(locale), setLocale: () => {}, isLocalePersistenceAvailable: true } },
    h(AppStateContext.Provider, { value: { state, dispatch: () => {}, isPersistenceAvailable: true } },
      h(MemoryRouter, { initialEntries: [url] }, h(Routes, null, h(Route, { path, element: h(components[name], props) }))))));
}
function localized(html) {
  assert.doesNotMatch(html.replace(/<[^>]*>/g, " "), /\b(?:Done|Read-only preview|Closed partial|exercises complete|Next exercise|Smith Bench Press|Cycle \d+)\b/);
  assert.doesNotMatch(html, /\{(?:count|value\d+|plan|cycle|day|label|name)\}/);
}

for (const planId of ["bulk-pro", "cut-pro"]) {
  test(`${planId}: Serbian read-only Exercise previews translate set counts`, () => {
    const w = workout(planId);
    const snapshot = JSON.stringify(w.state());
    const day = getDayDetails(planId, "d2");
    const expectedCounts = { 1: "1 serija", 2: "2 serije", 3: "3 serije", 4: "4 serije" };

    for (const exercise of getExercisesForDay(planId, day.exerciseIds)) {
      const html = render("ExercisePage", w.state(), "sr-Latn",
        "/plan/:planId/day/:dayId/exercise/:exerciseId", `/plan/${planId}/day/d2/exercise/${exercise.id}`);
      assert.ok(html.includes(`>${expectedCounts[exercise.setCount]}</p>`), exercise.id);
      assert.doesNotMatch(html, /\b\d+ sets?\b|<input|aria-pressed=/);
    }

    assert.equal(JSON.stringify(w.state()), snapshot);
    assert.equal(w.cycle().dayLogs.d2, undefined);
  });

  test(`${planId}: both languages cover every day, exercise, Core block, guide group and warm-up`, () => {
    const w = workout(planId);
    const snapshot = JSON.stringify(w.state());
    for (const locale of ["en", "sr-Latn"]) {
      const t = createTranslator(locale);
      const check = (html) => { if (locale === "sr-Latn") localized(html); return html; };
      check(render("HomePage", w.state(), locale));
      check(render("PlanOverviewPage", w.state(), locale, "/plan/:planId", `/plan/${planId}`));
      check(render("CyclePage", w.state(), locale, "/plan/:planId/cycle", `/plan/${planId}/cycle`));
      check(render("GuidePage", w.state(), locale, "/plan/:planId/guide", `/plan/${planId}/guide`));
      for (const day of getDayDetailsByPlanId(planId)) {
        const dayUrl = `/plan/${planId}/day/${day.id}`;
        const dayHtml = check(render("DayPage", w.state(), locale, "/plan/:planId/day/:dayId", dayUrl));
        assert.ok(dayHtml.includes(escape(t(day.name))), day.name);
        for (const exercise of getExercisesForDay(planId, day.exerciseIds)) {
          const html = check(render("ExercisePage", w.state(), locale, "/plan/:planId/day/:dayId/exercise/:exerciseId", `${dayUrl}/exercise/${exercise.id}`));
          assert.ok(html.includes(escape(t(exercise.name))), exercise.name);
          assert.ok(html.includes(escape(t(exercise.cue))), `${locale}: ${exercise.id}`);
        }
        if (day.coreBlockId) check(render("CorePage", w.state(), locale, "/plan/:planId/day/:dayId/core/:coreId", `${dayUrl}/core/${day.coreBlockId}`));
        check(render("WarmupSheet", w.state(), locale, "/", "/", { dayDetails: day, warmup: getWarmupById(planId, day.sessionInfo.warmupId) }));
      }
      for (const group of getGuideByPlanId(planId).groups) {
        const html = check(render("GuideGroupCard", w.state(), locale, "/", "/", { group, groupIndex: 0, groupCount: 4 }));
        for (const topic of group.topics) assert.ok(html.includes(escape(t(topic.title))), topic.id);
      }
    }
    assert.equal(JSON.stringify(w.state()), snapshot);
    assert.deepEqual(Object.keys(w.cycle().dayLogs), ["d1"]);
  });

  test(`${planId}: changing preference preserves active and completed saved records and Cycle 2 references`, () => {
    const w = workout(planId);
    const day = getDayDetails(planId, "d1");
    const exerciseId = day.exerciseIds[0];
    w.send(actions.UPDATE_EXERCISE_SET_FIELD, { dayId: "d1", exerciseId, setIndex: 1, field: "weight", value: "55" });
    w.send(actions.TOGGLE_EXERCISE_SET_DONE, { dayId: "d1", exerciseId, setIndex: 1 });
    w.send(actions.MARK_EXERCISE_CLOSED, { dayId: "d1", exerciseId, closedAt: "closed" });
    const store = storage();
    const oldWindow = globalThis.window;
    globalThis.window = { localStorage: store, addEventListener() {}, removeEventListener() {} };
    try {
      const verify = () => {
        assert.equal(saveStoredAppState(w.state()), true);
        const bytes = store.getItem("training-app:v1:app-state");
        for (const locale of ["sr-Latn", "en", "sr-Latn"]) {
          saveLocale(locale, store);
          render("CyclePage", w.state(), locale, "/plan/:planId/cycle", `/plan/${planId}/cycle`);
          assert.equal(store.getItem("training-app:v1:app-state"), bytes);
          assert.deepEqual(loadStoredAppState(), w.state());
        }
      };
      verify();
      for (const dayId of getPlanById(planId).dayOrder) {
        w.ensure(dayId);
        if (dayId === "d2") {
          const block = getCoreBlockById(getDayDetails(planId, dayId).coreBlockId);
          const coreExercises = getCoreExercisesByIds(block.exerciseIds);
          w.send(actions.ENSURE_CORE_BLOCK_LOG, { dayId, coreBlock: block, coreExercises });
          w.send(actions.TOGGLE_CORE_SET_DONE, { dayId, coreExerciseId: coreExercises[0].id, setIndex: 1 });
        }
        w.send(actions.FINISH_DAY, { dayId, finishedAt: `closed-${dayId}` });
      }
      verify();
      const completed = JSON.stringify(w.cycle());
      const html = render("EndCyclePage", w.state(), "sr-Latn", "/plan/:planId/end-cycle", `/plan/${planId}/end-cycle`);
      assert.match(html, /Ciklus 1 je zatvoren/);
      localized(html);
      w.send(actions.START_PLAN_CYCLE, { startedAt: "cycle-two" });
      w.ensure("d1");
      verify();
      assert.equal(JSON.stringify(w.state().progressByPlan[planId].cycles[1]), completed);
      const log = w.cycle().dayLogs.d1.mainExerciseLogs[exerciseId];
      assert.equal(log.sets[0].weight, "55");
      assert.equal(log.sets[0].isDone, false);
      assert.equal(log.closedAt, null);
      clearStoredAppState();
      assert.equal(store.getItem(LOCALE_STORAGE_KEY), "sr-Latn");
    } finally { globalThis.window = oldWindow; }
  });
}

test("public pages, contextual help, first-start safety and guard screens render bilingually", async () => {
  const { exerciseHelp, advancedTechniqueHelpByType } = await vite.ssrLoadModule("/src/data/contextualHelp/index.js");
  const { publicInfoPages } = await vite.ssrLoadModule("/src/data/publicInfo.js");
  for (const locale of ["en", "sr-Latn"]) {
    const t = createTranslator(locale);
    for (const [pageKey, page] of Object.entries(publicInfoPages)) {
      const html = render("PublicInfoPage", appInitialState, locale, "/", "/", { pageKey });
      assert.ok(html.includes(escape(t(page.title))));
      for (const section of page.sections) for (const text of section.paragraphs ?? []) assert.ok(html.includes(escape(t(text))), text);
      if (locale === "sr-Latn") localized(html);
    }
    for (const help of [exerciseHelp, ...Object.values(advancedTechniqueHelpByType)]) {
      const html = render("HelpSheet", appInitialState, locale, "/", "/", { ...help, isOpen: true });
      assert.ok(html.includes(escape(t(help.title))));
      if (locale === "sr-Latn") localized(html);
    }
    const safety = render("FirstStartSafetySheet", appInitialState, locale, "/", "/", { isOpen: true });
    assert.ok(safety.includes(escape(t("Train with control."))));
    const guard = render("NotFoundPage", appInitialState, locale);
    assert.ok(guard.includes(escape(t("This training screen does not exist."))));
  }
});


test("provider restores the separate preference and falls back to English when storage is blocked", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    const store = storage({ [LOCALE_STORAGE_KEY]: "sr-Latn" });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: store });
    const html = renderToStaticMarkup(h(components.LocaleProvider, null, h(components.LanguageSelector)));
    assert.match(html, /<label[^>]*>Jezik<\/label>/);
    assert.match(html, /value="sr-Latn"[^>]*selected=""/);
    assert.match(html, /<select[^>]*id="[^"]+"/);
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw Error("blocked"); } });
    const fallback = renderToStaticMarkup(h(components.LocaleProvider, null, h(components.LanguageSelector)));
    assert.match(fallback, /<label[^>]*>Language<\/label>/);
    assert.match(fallback, /value="en"[^>]*selected=""/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});

for (const planId of ["bulk-pro", "cut-pro"]) {
  test(`${planId}: Serbian partial main and Core-only closed states report only Done sets`, () => {
    const w = workout(planId);
    const dayDetails = getDayDetails(planId, "d1");
    const exerciseId = dayDetails.exerciseIds[0];
    w.send(actions.UPDATE_EXERCISE_SET_FIELD, { dayId: "d1", exerciseId, setIndex: 1, field: "weight", value: "60" });
    let html = render("DayPage", w.state(), "sr-Latn", "/plan/:planId/day/:dayId", `/plan/${planId}/day/d1`);
    assert.match(html, /Odrađeno 0 glavnih serija/);
    w.send(actions.TOGGLE_EXERCISE_SET_DONE, { dayId: "d1", exerciseId, setIndex: 1 });
    w.send(actions.MARK_EXERCISE_CLOSED, { dayId: "d1", exerciseId, closedAt: "closed-exercise" });
    html = render("ExercisePage", w.state(), "sr-Latn", "/plan/:planId/day/:dayId/exercise/:exerciseId", `/plan/${planId}/day/d1/exercise/${exerciseId}`);
    assert.match(html, /Zatvoreno · Deo odrađen/);
    assert.match(html, /Nazad na pregled dana/);
    assert.match(html, /Označi seriju 1 kao neodrađenu/);
    assert.match(html, /Serija 1: težina/);
    assert.match(html, /value="60"/);
    w.send(actions.FINISH_DAY, { dayId: "d1", finishedAt: "closed-day" });
    w.ensure("d2");
    const day = getDayDetails(planId, "d2");
    const block = getCoreBlockById(day.coreBlockId);
    const exercises = getCoreExercisesByIds(block.exerciseIds);
    w.send(actions.ENSURE_CORE_BLOCK_LOG, { dayId: "d2", coreBlock: block, coreExercises: exercises });
    w.send(actions.TOGGLE_CORE_SET_DONE, { dayId: "d2", coreExerciseId: exercises[0].id, setIndex: 1 });
    const snapshot = JSON.stringify(w.state());
    html = render("FinishDaySheet", w.state(), "sr-Latn", "/", "/", { dayDetails: day,
      hasCoreBlock: true, progress: { performedMainSetCount: 0, performedCoreSetCount: 1, completedExerciseCount: 0, totalExerciseCount: day.exerciseIds.length } });
    assert.match(html, /Odrađeno 0 glavnih serija/);
    assert.match(html, /Odrađena 1 Core serija/);
    assert.match(html, /Završene glavne vežbe: 0\/9/);
    assert.equal(JSON.stringify(w.state()), snapshot);
    w.send(actions.FINISH_DAY, { dayId: "d2", finishedAt: "core-only-day" });
    html = render("CyclePage", w.state(), "sr-Latn", "/plan/:planId/cycle", `/plan/${planId}/cycle`);
    assert.match(html, /Zatvoreno · Deo odrađen · Odrađena 1 glavna serija/);
    assert.match(html, /Zatvoreno · Odrađeno 0 glavnih serija/);
    assert.match(html, /Odrađena 1 Core serija/);
  });
}
