# Session Handoff

## Latest human playtest evidence

<!-- QA-ENGAGEMENT-START -->

No v0.26.1 human pilot recorded. HUMAN_FUN_VERDICT = PENDING.
Historical evidence remains in docs/playtests/ and Git history.

<!-- QA-ENGAGEMENT-END -->

## CURRENT CANONICAL STATE — READ THIS FIRST

- Codex review continuation (2026-10-08): retained the existing branch and baseline; corrected readiness blockers listed below. The prior CI run certifies `efb9f81` only; verify the correction commit's exact-SHA CI before calling the corrected build ready.

- Active branch: `fix/v0261-playtest-readiness-20261008`
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
