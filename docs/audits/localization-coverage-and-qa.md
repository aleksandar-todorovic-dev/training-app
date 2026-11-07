# English / Serbian Latin localization coverage and QA

## Scope and baseline

Feature branch: `feat/serbian-localization`. Baseline: latest fetched `origin/main`, `abdc68737833444a7785eaca9341c2c52ae118ef` (verified November 1, 2026). No commits, pushes, merges, tags, or deployments are part of this task.

The pre-implementation audit inspected all 90 JavaScript/JSX source files. It identified 1,228 unique data strings and 647 UI candidates, including identifiers and styling strings that must not be translated. The concise inventory was reported before implementation. The older September copy inventory is historical; this audit uses the current source tree.

## Coverage inventory

| Surface | Coverage |
| --- | --- |
| Home | Product explanation, four disclosures, both plan cards, active cycles, reset confirmation |
| Plan Overview | Both phase descriptions, facts, rhythm, principles, start/continue/review states, safety acknowledgement |
| Cycle | D1–D6 rhythm/rest positions, current/closed/upcoming rows, next action, partial/empty/Core-only evidence, progress, accessible names |
| Day | All 12 plan/day combinations, goals, session notes, next exercise, main progress, Core entry, finish sheet, warnings |
| Exercise | 54 Bulk Pro and 52 Cut Pro source definitions: names, subtitles, prescriptions, cues, progression, notes, optional methods, inputs, Done controls, previews and closed logs |
| Core | Three blocks and nine exercise definitions: purpose, cues, reps/time/load targets, notes, statuses and row accessibility |
| Guides | Both guides, four groups and 18 topics per plan, paragraphs, bullets, section navigation and topic indexes |
| Warm-ups | All six warm-ups per plan, goals, all preparation steps and reminders |
| Contextual help | Exercise help and all registered advanced technique help sections, paragraphs and bullets |
| Public information | Privacy, Preview Terms, Fitness & Safety, Contact, links and existing effective date |
| Shared/fallback UI | Navigation, guards, empty/inactive states, persistence warning, dialog controls, safety sheet, selector and language-save warning |
| Document | English/Serbian Latin HTML `lang`, localized route title and description; English static HTML default |

No known user-facing prose remains untranslated. Product names Cycle Coach, Bulk Pro, Cut Pro, Core A/B/C, training terms such as RIR, numeric prescriptions, kg/s/min units, D1–D6 labels, the contact email and URLs stay unchanged where appropriate. English/Srpski are the selector's language endonyms. Console diagnostics and internal identifiers remain English.

## Architecture and changed files

- `src/i18n/translate.js`: source-English message keys, named interpolation, English singular forms, Serbian CLDR one/few/other forms through `Intl.PluralRules`, English fallback, display-only progress formatting.
- `src/i18n/sr-Latn.js` and `src/i18n/sr-Latn/{support,exercises,guides,plans,warmups,public,ui}.js`: centralized Serbian catalogs. No translated training data structures or duplicated workout logic.
- `src/i18n/{LocaleContext.js,useTranslation.js,LocaleProvider.jsx,localeStorage.js}`: independent locale context and safe preference persistence under `training-app:v1:locale`.
- `src/i18n/{DocumentMetadata.jsx,documentMetadata.js}`, `src/app/ScrollToTopLayout.jsx`: document language and metadata updates without route changes or locale-based remounts.
- `src/App.jsx`: composes the locale provider outside the existing workout provider.
- `src/components/system/LanguageSelector.jsx`, `src/components/layout/AppShell.jsx`: shared labeled native selector, including a storage-failure notice. Available before starting a cycle and on workout and public pages.
- All ten `src/pages/*.jsx` and the content-bearing common, core, cycle, day, exercise, guide, plan, system and warm-up components: translate only displayed text. Existing structural button, back-control and brand primitives remain unchanged.
- `src/data/guides/{bulkProGuide,cutProGuide}.js`: concise clarification in existing logging sections. Main counts use Done sets/all prescribed main sets; partial closure does not complete unchecked work; Return to day only navigates; closed logs remain editable. Existing text retains Core separation.
- `src/data/publicInfo.js`: one minimal Privacy paragraph discloses functional language storage and its independent reset behavior. Existing legal scope and effective date remain unchanged.
- `tests/localization.test.js`: catalog/source coverage, interpolation/plurals, local preference fallback/persistence, provider hydration, metadata, rendered bilingual screens, partial/Core-only evidence, saved-record and Cycle 2 regressions.
- `README.md` and this file: localization architecture, storage behavior, contributor instructions, automated checks and manual QA.

No dependencies were added or changed. Workout reducers, runtime helpers, workout/safety storage modules, prescriptions, identifiers, routes and persistence schema remain unchanged.

## Automated verification

Run from the repository root:

```bash
npm run lint
npm run build
node --test tests/*.test.js
git diff --check
```

The new suite checks source data and UI literals against the catalog, rejects raw prose in JSX, verifies interpolation placeholder parity and Serbian forms (including 0, 1, 2, 4, 5, 11–14, 21, 22 and decimal counts), and compares numerical training instructions across languages.

Rendered checks cover every day and exercise, all Core entries, warm-ups, guide groups, contextual help, first-start safety and all public pages in both languages. State regressions cover partial main work, Core-only days, completed cycles and carried values. Preference writes are checked against unchanged serialized workout storage and restored state, including the preserved prior cycle and unchecked Cycle 2 sets.

These are unit and server-rendering tests using existing React/Vite/ESLint tooling. They do not execute browser effects, click native controls, or establish visual/accessibility conformance. Metadata effects call a separately tested document updater. The browser runtime reported no connected browser during implementation, so the checklist below remains pending. The production build's chunk-size warning remains a known limitation; the bundled translation catalogs increase asset size.

## Manual browser QA — perform together

Use an isolated browser profile or a copy of saved logs. Run each applicable item in **English and Srpski**, for **Bulk Pro and Cut Pro**, at **375 × 812** and **390 × 844** CSS pixels, then spot-check desktop.

### Screens and content

- [ ] Home: four explanation disclosures, both plan cards, active-cycle entries and reset confirmation; cancel reset when checking existing logs.
- [ ] Plan Overview: pre-start, active cycle, completed cycle, facts, rhythm, rules, guide link and first-start safety sheet.
- [ ] Cycle: D1–D6/rest strip, current action, upcoming previews, closed full/partial/empty days and Core-only evidence; swipe the strip.
- [ ] Day: each D1–D6, session notes, next exercise, all exercise entries, Core entry and finish sheet with/without missing-value warnings.
- [ ] Exercise: all names and cues, targets, notes, progression, previous values, method disclosure and help, inputs, performed counts and close/return controls.
- [ ] Core: A/B/C, reps and time rows, loaded and bodyweight work, cues, notes and separate counts.
- [ ] Guide: every group and topic in both plans; use topic anchors; verify both logging clarifications and numerical rules.
- [ ] Warm-ups: all six per plan, every step and reminder, close/finish actions.
- [ ] End Cycle: full, partial and empty evidence, Core recap, previous-cycle preservation and explicit next-cycle start.
- [ ] Privacy, Preview Terms, Fitness & Safety and Contact: complete prose, links, effective date and language-storage disclosure; direct-route refresh.
- [ ] Invalid plan/day/exercise/Core URLs and missing routes: translated guards with working recovery links and no created logs.

### Live switching, storage and runtime continuity

- [ ] Start in a fresh profile: English is the default. Choose Srpski before starting a cycle and refresh; it remains selected.
- [ ] In an active exercise, enter weight/reps/RIR, mark one set Done and leave another edited but unchecked. Switch both ways. URL, scroll position, focus, inputs and checkboxes remain intact; no cycle is recreated.
- [ ] Open/close an exercise partially, return to it and switch language. Return to day navigates without repeating closure; unchecked sets remain unperformed.
- [ ] Finish a partial day, switch and refresh. The current day pointer and closure remain correct; reopen and edit its saved exercise log.
- [ ] Log only Core on D2, leave all main sets unchecked, close the day and switch. Main progress stays zero; Core evidence remains separate. Reopen/edit the closed Core log.
- [ ] Complete a cycle with useful main/Core values. Switch, review End Cycle, explicitly start Cycle 2 and verify carry-over, fresh unchecked sets and intact Cycle 1 records.
- [ ] Repeat with existing pre-localization saved records. Compare the workout storage value before/after a language change: only the separate locale key should change.
- [ ] Reset local workout progress in a disposable profile: language and safety acknowledgement remain. Clearing all site storage returns the app to English and removes local records/preferences.
- [ ] Use malformed/unsupported locale storage: safe English fallback, workout logs retained. Block storage or simulate quota failure: immediate switching still works and the localized preference warning appears; subsequent successful choice clears it.

### Mobile layout and accessibility

- [ ] Long Serbian headings, status badges, previous-value messages, counts and button labels wrap without overlapping or horizontal page overflow; inspect the set-column headers and bottom sheets carefully.
- [ ] Language selector has a visible localized label, keyboard operation, focus indicator, correct selected option and practical touch target.
- [ ] Switch languages repeatedly without losing current workout position or typed values; do not reset scroll or start navigation.
- [ ] Inspect `<html lang>` (`en` / `sr-Latn`), localized tab title and description on workout and public routes after switching and refresh.
- [ ] Screen reader: check translated set/input names, performed/not-performed toggle state, progressbar names, navigation and dialog close names.
- [ ] Sheets: focus entry, Tab/Shift+Tab trap, Escape close, focus return, background scroll lock and long-content scrolling still work.
- [ ] Check reduced motion, browser zoom/text enlargement, contrast, and visible keyboard focus in both languages.
- [ ] No console errors or unexpected failed requests. Confirm no analytics, external translation requests or new data flows were introduced.

## Documentation and release follow-up

Update the source English key and corresponding Serbian entry together for future copy changes; run the source-coverage test. Document new plural message keys in both `englishPlurals` and the Serbian catalog. Keep translated values at the presentation boundary.

Before release, complete the browser matrix, review Serbian editorial quality in context, and perform the separately planned legal/geographic-targeting review. Localized screenshots may be added after visual approval; existing release screenshots were not changed by this feature.
