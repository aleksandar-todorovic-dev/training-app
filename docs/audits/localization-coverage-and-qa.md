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

## Serbian editorial standard — November 7, 2026

The complete editorial pass reviewed all 1,611 original entries against the English source and their presentation context, followed by a cross-catalog consistency review. Counts refer to message keys; plural variants belong to one entry. Clear existing translations were retained.

| Catalog | Reviewed | Changed |
| --- | ---: | ---: |
| `support.js` | 164 | 67 |
| `exercises.js` | 493 | 224 |
| `guides.js` | 294 | 174 |
| `plans.js` | 17 | 9 |
| `warmups.js` | 98 | 35 |
| `public.js` | 89 | 37 |
| `ui.js` | 456 | 139 |
| **Total** | **1,611** | **685** |

### Voice and translation rules

- Preserve the calm, knowledgeable, disciplined and practical English voice, including its respect for recovery and real-life interruptions. Address the user as `ti`; use natural gender-neutral phrasing where available.
- Keep workout actions brief and concrete. Preserve the explanatory depth and memorable formulations in Guides. Home must communicate structure, guided execution, continuity and realistic logging without generic fitness hype.
- Translate complete meanings in context. Interpret `clean`, `honest`, `strict` and `grindy` according to technique, range, RIR estimation or effort; avoid automatic word substitutions.
- Preserve numbers, ranges, percentages, timing, movement directions, muscle focus, optionality and progression conditions. `Near 7` stays approximate; a prerequisite for increasing load must not become an unconditional instruction to increase it.
- Preserve every legal/safety qualifier, risk statement, data-flow disclosure and limitation. The first-start acknowledgement confirms an opportunity to review the linked guidance and terms, not that the user has read or accepted additional obligations.
- Keep English keys and source copy unchanged. Check linked fragments and interpolated messages as complete rendered sentences. Retain Serbian `one` / `few` / `other` forms and their existing placeholders.

### Terminology

| Concept | Serbian expression and context |
| --- | --- |
| Working / ramp sets | `radne serije` / `uvodne serije` |
| Performed sets | `odrađene serije`; only Done confirms performance, independently of entered values |
| Exercise completion | `Završeno` for all prescribed sets performed; closing remains a separate workflow action |
| Closed / closed partial | `Zatvoreno` / `Zatvoreno · Delimično odrađeno`; partial requires some performed work, while an empty closed log remains distinct |
| Active partial work | `Delimično odrađeno`; this does not imply closure |
| Progression / progress | `napredovanje` for the process and rules; `napredak` for the result |
| Previous values / carry-over | `prethodne vrednosti`, `polazne vrednosti`, `prenos vrednosti`; loaded references do not mark new sets Done and may come from an earlier valid cycle |
| Logging / inputs / record | `beleženje` / `unos` / `dnevnik treninga` or an individual `zapis` |
| Recovery / rest | `oporavak` / `odmor` |
| Training stimulus / mechanical tension | `trenažni stimulans` / `mehanička napetost`; keep load (`opterećenje`) distinct |
| Main / support / top-up work | `glavni rad` / `pomoćni rad` / smaller planned `dodatni rad`; top-ups are not automatically optional bonuses |
| Bridge work | `povezujući rad` or work that `povezuje delove ciklusa`; this role is within the training cycle, distinct from carrying values into the next cycle |
| Useful strength | Contextual `snaga u vežbama`; no new strength metric or numerical target is implied |
| RIR | `RIR`, explained as estimated `ponavljanja u rezervi`, with proper repetitions still possible |
| Advanced methods | `dropset`, `rest-pause`, `klaster serija`, `mehanička serija`, `mehanički dropset`, `izometrijsko istezanje pod opterećenjem`; keep distinct methods distinct |
| Deload | `rasterećenje`, explained as lighter training |
| Core / hollow body | Keep `Core` as the product section; use `trup` in execution cues and `Hollow body izdržaj` as the recognizable exercise name |

### Context and verification boundaries

Static plan descriptions and active Plan Overview presentation metadata were both reviewed. The former are retained even where the current UI does not display them. Source `cluster` is translated as a generic `niz` in the push-up mechanical-dropset sequence, and as `klaster` for the defined short-rest method; the actual sequences remain unchanged.

No new component changes or contextual message keys were necessary. The existing read-only Exercise set-count interpolation fix and its regression tests remain intact. Existing wording assertions were updated to the reviewed labels, and rendered Serbian checks now also reject unresolved named placeholders. Training numbers, placeholder sets and all English keys remain unchanged.

The current direct `t()` template/accessible-attribute audit found no constructed English template strings. The source-coverage test still primarily inspects literals and JSX text; it is not proof against every future dynamically constructed message. Review new dynamic copy explicitly and pass values through the existing interpolation system.

English warm-up percentage instructions do not explicitly state their percentage base; this editorial pass preserves those instructions without assuming a base. `Useful strength` and `hollow body` wording remain terminology choices for product-owner review, without changed training instructions.

The browser matrix below remains pending. Longer Serbian labels and the known `ODRAĐENO` set-table header spacing belong to the separate UI polish pass; no layout changes are included here.

Verification for this editorial pass passed: `node --test tests/*.test.js` (localization and workout regression files), `npm run lint`, `npm run build`, and `git diff --check`. The production JavaScript asset is 912.68 kB (259.47 kB gzip); the existing chunk-size warning remains. The pre-existing Exercise component fix and the complete read-only preview regression test were compared with their starting contents and preserved unchanged.

## Final Serbian language QA — November 10, 2026

All 1,611 current entries were reviewed again against the English copy, related messages and their source/rendering context, independently of the earlier change count. A second review checked the resulting corrections for grammar, meaning, terminology, counts and interpolation. The following are **additional** corrections relative to commit `c11e5277d2866958c10769309dd144728d8611c5`; the November 7 counts above remain the record of the earlier pass.

| Catalog | Reviewed | Additionally corrected |
| --- | ---: | ---: |
| `support.js` | 164 | 19 |
| `exercises.js` | 493 | 24 |
| `guides.js` | 294 | 29 |
| `plans.js` | 17 | 0 |
| `warmups.js` | 98 | 6 |
| `public.js` | 89 | 4 |
| `ui.js` | 456 | 20 |
| **Total** | **1,611** | **102** |

Missed problems corrected in this pass include incompatible grammar in the hip-position cue, mixed adjective/clause predicates, an omitted modal verb, awkward numerical-range wording, a lost `may` qualifier, and rest wording that suggested resting after the whole heavy exercise rather than between its sets. Bench leg drive is expressed as steady foot pressure against the floor; chest tension refers clearly to muscles. The decline sit-up and plank step-out names are more precise, and the Hollow body cue now distinguishes raised ribs from the low back lifting off the floor. Recognizable `Hollow body` and `hamstring sweep` names avoid inventing new execution instructions.

Home and Bulk copy retain organization, useful work, repeatable volume, progression and clear next steps without repeating near-synonyms. The more natural partial-closure label is used consistently in its explanation. The first-start acknowledgement reads naturally across both links and still confirms an opportunity to review the information, not that it has been read. Public copy retains the original retention purposes, reasonable-necessity limitation, intentional-use qualifier and medical boundaries.

English keys, placeholders, plural variants, numerical prescriptions, IDs, routes, workout logic and persistence are unchanged. No components or layouts were changed. The read-only set-count fix and its original regression block remain intact. Existing tests were updated for the intentional wording changes and extended to check the complete linked acknowledgement and empty versus partial closed Core states in both plans.

Remaining limitations and follow-up:

- Author clarification is still needed for `Keep the single set long and controlled before increasing load.`: `long` could describe duration or range. The existing range interpretation was retained rather than silently changing the instruction. The previously recorded unspecified warm-up percentage base also remains unchanged.
- An existing general presentation issue affects both languages: `METHOD_SUMMARY_BY_TYPE` uses camelCase names for several methods while source types use hyphens (`rest-pause`, `iso-stretch`, `mechanical-set`, `mechanical-dropset`). These methods fall back to the generic summary; their detailed instructions/help remain available. This mapping was left unchanged during the language-only corrections.
- Automated coverage and server rendering do not establish perfect language quality or complete browser validation. The browser matrix below and the separate layout pass, including `ODRAĐENO` spacing, remain pending.

Verification passed for this final pass: `node --test tests/*.test.js` (both localization and workout regression files), `npm run lint`, `npm run build`, and `git diff --check`. Independent comparisons also confirmed all English keys, placeholders and non-date numerical tokens are preserved, as are the prior set-count component fix and its original regression block. The build retains the existing chunk-size warning (913.01 kB JavaScript, 259.53 kB gzip).

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
