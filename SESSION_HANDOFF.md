# Session Handoff

## Latest human playtest evidence

<!-- QA-ENGAGEMENT-START -->

Operator-reported v0.26.1 pilot on `c310c20`: Industrial 11:43 / Logistics 6/6 specialization softlock. Status `INTERRUPTED_BY_BUG`; evidence in `docs/playtests/v0261-outpost-softlock-20261008.md`. HUMAN_FUN_VERDICT = PENDING.
Historical evidence remains in docs/playtests/ and Git history.

<!-- QA-ENGAGEMENT-END -->

## CURRENT CANONICAL STATE — READ THIS FIRST

- Codex review continuation (2026-10-08): retained the existing branch and baseline; corrected readiness blockers listed below. The prior CI run certifies `efb9f81` only; verify the correction commit's exact-SHA CI before calling the corrected build ready.

- Active branch: `feat/v0261-outpost-softlock-20261008`
- Base development commit: `5fe8f26506411869e1ec04f0f57b2d579481eeb2` on `feat/v026-experience-evidence-20261008` (v0.26 Experience Evidence).
- Certified v0.25 automated baseline: `12e172cba23fdf06cec4bf0057fcf3fcfb3a4d2d` on `feat/v025-player-visible-emergence-20261005` (exact-SHA CI run 37658953734 100% green: Node 22, Node 24, Chromium E2E, Analyze).
- Certified v0.24 technical baseline: `9c261e43c670ddf2208f8b4c38748879bcf167da` on `proto/v024-emergent-seed-core-20261002`.
- Canonical main: `5e6d5c65ea905bc3859f115e73bfd02913988d45` (105 commits behind feature lineage; unmerged pending human playtest evidence).
- Versions: `WORLDGEN_VERSION = 2` / `CONTENT_VERSION = 8` / `SAVE_SCHEMA_VERSION = 1` / package `0.2.0-dev.0`.
- Current milestone: `v0.26.1 Playtest Readiness & Evidence Truth`.
- Status verdicts:
  - `TECHNICAL_GATE = PASS` (Node 22/24 typecheck, 346 tests, 42 Playwright E2E, analyze audit, clean zip build).
  - `PLAYTEST_READINESS = READY` (`npm run qa:human` validated, port collision fixed, privacy sanitization enforced).
  - `HUMAN_FUN_VERDICT = PENDING` (Cannot be synthesized by bots or inferred from telemetry; awaiting genuine human testers).
  - `REPLAY_DESIRE_VERDICT = PENDING`.
- Next milestone gate: **Human Playtest Gate** via `docs/playtests/PLAYTEST_PROTOCOL_V0261.md`.

---

## v0.26.1 IMPLEMENTATION OVERVIEW

1. **Evidence Integrity & Audit Corrections (`tests/emergence/distribution.audit.test.ts`)**:
   - **Class A Metric Truth**:
     - Denominator explicitly bound to genuinely observed draft samples (`observedDraftSamples = 6000`).
     - Corrected collidingFingerprintGroupRate to divide by unique groups (historical 15.90% used drafts as denominator) from `duplicateDraftSampleFrequency` (53.97%, true duplicate sample frequency across all drafts).
     - Reroll pool alternative candidate availability verified at 56.50% (> 8%).
     - Real age buckets (stone..space) verified with zero age quality clamping (all 4 qualities present).
   - **Class B Simulation Boundary Clarification**:
     - Verified 48-run factorial simulation matrix (3 seeds × 4 origins × 4 policies).
     - Explicitly clarified that runs test up to 40 seconds of canonical simulation time (2,400 steps @ 60 Hz).
     - Distinguishes canonical physics progression (`sim.step`) and direct simulation API actions (`claimTerritory`, `tryAbility`) from human UI interactions. EXPANDER claims (54 outposts) and AGGRESSOR ability uses (20) prove autonomous simulation capability, NOT player onboarding or human enjoyment.
   - **Class C Scope Alignment**:
     - Renamed to `[Class C: Single-Draft Offer & First-Pick Heuristic Divergence]`.
     - Documented that this evaluates single-draft offer engine divergence after staged Knowledge injection (`gainKnowledge(2000)`), NOT full multi-draft player decision trajectories or strategic preference.
     - Preserved normalized base-2 Jensen-Shannon Divergence mathematics.

2. **Research-to-Runtime Ledger Reconciliation (`docs/research/v026-research-runtime-ledger.md`)**:
   - Corrected all non-existent paths from v0.26 ledger to verified repository paths:
     - `src/core/world/laws.ts` → `src/core/emergence/worldLaws.ts`
     - `src/core/tech/techGraph.ts` → `src/core/tech/graph.ts` & `src/core/emergence/offerEngine.ts`
     - `src/core/territory/` → `src/core/world/territory.ts` & `src/core/emergence/outpostLogistics.ts`
     - `src/renderer/scenes/TechMapScene.ts` → `src/game/tech/TechMapView.ts` & `src/game/tech/TechGraphLayout.ts`
     - `src/core/director/phasedDirector.ts` → `src/core/emergence/director.ts` (`SCAFFOLD_ONLY`)
     - `src/core/ecology/` → `src/core/emergence/enemyEcology.ts` (`SCAFFOLD_ONLY`)
     - `src/core/events/` → `src/core/emergence/events.ts` (`SCAFFOLD_ONLY`)
     - `src/renderer/audio/` → `src/game/audio/sfx.ts` (`PARTIAL`)
     - `src/renderer/assets/` → `src/game/assets/seedAssets.ts`
   - Every system classified across: Source Exists, Canonical Sim Invoked, UI Exposed, Automated Tests, and Human Evidence.

3. **Human QA Pipeline & Privacy Hardening**:
   - `scripts/qa-report.mjs`: Added `sanitizePrivacy` redacting local filesystem paths (`C:\Users\...`, `/home/...`, `file:///...`), emails, and non-loopback IPs from committable reports.
   - Added `Evidence & Gate Classification` section: forbids labeling any report as `HUMAN_FUN_PASS` without explicit recorded human ratings.
   - `docs/playtests/PLAYTEST_PROTOCOL_V026.md`: Fixed instructions so testers do not run `npm run dev` simultaneously with `npm run qa:human`, preventing port 5173 collisions.

4. **Games User Research Protocol (`docs/playtests/PLAYTEST_PROTOCOL_V0261.md`)**:
   - Replaced heavy 8-run burden for novices with a two-stage qualitative protocol:
     - **Stage A**: Unmoderated/lightly moderated 15-minute blind first-run (3–5 novices) + neutral interview + Likert ratings.
     - **Stage B**: Focused counterbalanced paired comparisons (Hunters vs Sentinels on same seed, or Seed Alpha vs Seed Beta on Engineers).
     - 8-run factorial matrix preserved in appendix for specialized balance audits.
   - Enforces observation vs interpretation vs recommendation separation.

---

## Codex review corrections — 2026-10-08

- Corrected Class A unique-group denominator: colliding groups / unique fingerprints = 34.54%; duplicate samples remain 53.97%. Kept the existing 35% unique-group acceptance threshold.
- Restored the QA handoff markers required by finalization. Watcher and CLI now both save independent, safely hashed session summaries; raw same-second session/revision archives no longer collide.
- Save terminal comments and ratings after initial completion; reportSequence makes the watcher accept each human-response revision. Added browser POST regression coverage.
- Sink records server-derived buildSha and buildDirty in raw JSON; sanitized summaries retain both. Keep the checkout fixed throughout a pilot and reject UNKNOWN provenance.
- Redact the whole sanitized report, including labels/telemetry; cover arbitrary Windows drives and IPv6. Hashed report filenames prevent client session identifiers from escaping the report directory. Redaction covers common patterns and still requires operator privacy review before commit.
- Corrected remaining ledger paths/symbols, C claim key, unverified seed-bias claims, and hardware-performance claims. Small-cohort scores are discussion prompts, not automatic v0.27 implementation gates.
- Launcher smoke: npm run qa:human started Vite on 127.0.0.1:5173 with strictPort and watcher; stopped after the smoke. No human pilot was performed. Historical playtest documents were not overwritten.
- Local npm run check PASS: typecheck, 348 tests in 45 files (including all 6 audit tests), license/provenance verification, production build. A prior local run passed tests but had a worker RPC timeout; the clean rerun exited 0.
- Focused Chromium regression PASS: e2e/qa-auto.spec.ts verifies completion POST, subsequent human-comment POST, increasing sequence, and saved rating POST. Full E2E coverage is delegated to the new exact-SHA GitHub CI.
- HUMAN_FUN_VERDICT = PENDING; REPLAY_DESIRE_VERDICT = PENDING. No merge, release, or v0.27 implementation is authorized by this review.

### First human pilot

1. Use the corrected commit with clean gameplay/tooling files; stop any other server on 5173 and run npm run qa:human (there is no npm run qa alias).
2. Open http://localhost:5173/?qa=1, choose Origin, and START PLAYTEST. Follow Stage A in docs/playtests/PLAYTEST_PROTOCOL_V0261.md: 15 minutes without coaching, then neutral interview and explicit ratings.
3. Save in-game ratings/comment after ending. Verify the per-session sanitized summary, tested SHA, and buildDirty=false; raw JSON stays in gitignored test-results/human-playtests/.
4. Put interview observations in a separate anonymous pilot notes file; review privacy before committing evidence. Choose v0.27 only after actual findings.

## VERIFICATION COMMANDS

```bash
# Typecheck, unit & integration tests, license & asset verify, production build
npm run check

# Emergence & experience distribution audit (Class A, B, C)
npm run analyze

# Full Playwright Chromium E2E (43 specs)
npm run test:e2e

# Production ZIP packaging and itch.io compliance verification
npm run zip
npm run release:verify

# Launch Human QA Environment (single command starts Vite + watcher)
npm run qa:human
```


## v0.26.1 P1 Outpost softlock correction — 2026-10-08

- Work branch: `feat/v0261-outpost-softlock-20261008`, verified parent `c310c20cb56fa095ad7a4da50e5d93be974cb29f`.
- Operator-observed Industrial 11:43 / Logistics 6/6 softlock recorded in `docs/playtests/v0261-outpost-softlock-20261008.md`; session `INTERRUPTED_BY_BUG`, human fun/replay verdicts PENDING.
- Shared read-only canonical specialization predicate; optional EN/TH Later/Esc and keyboard focus containment; deferred claims do not mask first Signal or free claim actions. FIFO blocking contract preserved.
- First-Signal charged capacity overflow is an intentional existing mission exemption (7/6 or 8/6), not new free Logistics. Ordinary/subsequent claims cannot specialize past capacity. No balance, version, dependency, save or worldgen changes.
- Added focused unit and Chromium regressions; no v0.27, main merge, public release or tag.
- Final validation results and exact-SHA CI are reported in the corrective delivery. Until exact-SHA CI and operator revalidation, no human-pass claim.

- Final local check: 353/353 tests in 45 files, typecheck, provenance verification and production build PASS. Analyze and standalone test PASS. ZIP + release:verify 17/17 PASS (46 files, 1114 KB).
- Final focused Chromium: 8/8 PASS (6 new softlock cases + 2 frontier cases), including Thai 200% at 1280×720. Thai screenshots visually inspected.
- Initial full browser sweep: 45 PASS, 2 failures repaired and verified by the focused rerun, 1 pre-existing capture-only skip (`SEED_CAPTURE=1`). Final full-suite certification remains the exact-SHA CI job.
- One concurrent check attempt timed out in the existing 60-second factorial audit plus worker RPC; after browser work stopped, unchanged `npm run check` passed in 20.38s. No timeout/acceptance threshold relaxed. Existing large-bundle warning and NO_COLOR/FORCE_COLOR warnings remain; hardware performance was not measured.


## 2026-10-11 — Civilization playability workstream

Branch: feat/civilization-playability-20261011, based on d3814a6.
Status: IMPLEMENTED_PENDING_VALIDATION. No new human fun/replay pass.

User supplied four screenshots and reported unresolved technology/map/UI work.
Atomic's T2 upgrade mission is genuinely blocked at full 6/6 logistics; the old
Later/Escape modal fix remains. Added explicit confirmed capacity reallocation,
shared upgrade/reroll validation, biome-specific research/supply tradeoffs,
responsive pause/draft workspaces and truthful localized effect previews.
Unsupported modifiers are withheld instead of claiming powers they never apply.

Implemented bounded four-domain technology web: one root, authored joins,
choice-triggered deterministic expansion, stable polar layout, shared eligibility
and canonical graph hashing. CONTENT_VERSION 9; worldgen 2/save schema 1.
This is bounded compositional content, not an infinite-content claim.

Evidence and retest: docs/playtests/civilization-playability-20261011.md.
Research: docs/research/market-and-quality-20261011.md.
Raw human reports were backed up privately with hashes. Playwright's output
folder is isolated from human archives. Regression fixtures retain the exact
content-8 generator for a conditioned before/after choice-supply comparison.
Existing natural distribution thresholds are preserved. Test workers are bounded
to one to limit startup/memory pressure on office hardware. Windows watchdogs
are 600s after the exact d3814a6 baseline itself timed out (192.93s Class B);
Linux caps and numerical acceptance criteria remain unchanged (ADR 0020).

Required before readiness: complete check, analyze, browser regressions/visual
inspection, zip/release:verify, source review, focused commit/push and exact-SHA
GitHub CI 4/4. No main merge/tag or v0.27 start. Fresh human playtest remains
required after those gates pass.

Local validation boundary so far: complete check typechecked and ran all 367
tests; 366 passed, one obsolete root-only Ascension expectation failed. The
content-9 reset expectation was corrected explicitly. Final frontier refinement
requires two purchased domains; targeted rerun passed 27 selected cases (16
unselected by name filter), including the reset, refund, joins, determinism and
cohort. Final cohort max is 117 nodes. Complete final-source suite certification
will be the unfiltered exact-SHA Node 22/24 CI checks; do not call the initial
local check green. Standalone Analyze passed 6/6; production build passed. Final browser/package gates remain pending.

Final-source TypeScript PASS; standalone Analyze 6/6 PASS with no worker RPC
errors. Statistical thresholds unchanged. Browser validation also covers the
mobile radial workspace; headings/node labels/sidebar use line-height >=1.7.

Browser first pass: 22/26 passed. Four failures were diagnosed: territory snapshot positional compatibility (new fields now appended), excess Thai pause paragraph margins (removed without reducing line-height), and EN/TH mobile fixtures leaving two queued drafts (drain now explicitly verifies closure). Final rerun is required after rebuilding. Local browser pass also verified Later/Esc/FIFO, affordability, first/second Signal, reallocation cancel/confirm, no-alternative reroll, 200% Thai toolbar, map pan/zoom/pin and repeated open/close.

Browser second pass: 10/11 passed, including the corrected snapshot and both mobile languages. Thai pause still overflowed because full-width section-button rules also stacked scale/language buttons; scoped wrapping-row widths now correct this root cause. Visual inspection found empty map focus after fallback rewards: focus now chooses only IDs in the actual layout and tests require visible graph content. Smaller UI-only XP fixtures preserve decision/queue assertions without staging unnecessary levels. Final rebuilt browser rerun pending.

Final local acceptance: source TypeScript and production build PASS. Browser coverage completed through focused reruns: desktop EN/TH pause/draft, Thai 200%, full-logistics reallocation, terminal-reroll/map focus, mobile EN/TH actual visible graph, radial EN/TH. Existing Later/Esc/FIFO/Signal and pan/zoom/pin regressions passed earlier; final unfiltered browser suite is a CI gate. Screenshots inspected and hashed separately as synthetic evidence. Precommit ZIP/release:verify passed all 17 artifact checks (46 files, 2.6 MB extracted). After commit, rebuild/package clean HEAD and verify its exact-SHA CI 4/4 before the next human run.

Delivery boundary: initial local unfiltered check was NOT green; corrected focused unit cases and Analyze passed. Final unfiltered check runs on both Node 22 and 24 in GitHub CI. The final task response/Actions run and ignored scratch/playability-delivery-receipt.json record delivery SHA/CI/artifact evidence; fetch and verify rather than infer a live CI result from this precommit handoff. Human fun/replay and hardware frame-time budget remain unvalidated. Rollback source reference: d3814a6b7e94182a05be66e341eb36c0914eabc0 (content 8); no main merge/tag/v0.27.

Exact-SHA CI e470d710fc4ca4927096805c71d1c103a999fe7a run 38130807280: verify Node 22/24 and Analyze passed; full browser suite had 56 passed, one pre-existing skip, one failure in the retained readability contract. The persistent-draft instruction was 16px; corrected to body text (18px at 100%) without changing the assertion or reducing Thai line-height. Revalidate affected readability/desktop cases, commit normally and require all four jobs at the new SHA.
Local readability retest passed 1/1; desktop EN/TH retest passed 2/2 after the 18px correction. Updated Thai draft evidence/hash. All gameplay and tests are unchanged in this final corrective commit.

CI artifact audit found zero attached ZIPs despite passing upload steps: workflow used seed-web-{version}.zip while make-zip writes seed-web-v{version}.zip. Corrected the path and made missing files an upload failure. Final delivery must include two actual Node 22/24 ZIP artifacts as well as exact-SHA CI 4/4. Gameplay code is unchanged by this packaging correction.
