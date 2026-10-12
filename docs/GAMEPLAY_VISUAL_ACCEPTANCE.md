# Experience slice audit and acceptance — 2026-10-12

Baseline: verified PR5 `2ea1191ca555dc7e00164702b0dd6f0c9fbc97ac`, open Draft,
exact-head CI4/4. New workstream targets that branch. PR1–5/main remain unmerged.
No market research performed; supplied market/design references are user inputs,
not independently verified commercial claims.

| Area | Baseline source audit | This checkpoint |
|---|---|---|
| Combat | PARTIAL: basic Graphics, generic one-color beam; real Conduction/Relay | PARTIAL: first Atomic Energy signature uses actual release/impact/damage and bounded sprite/spark/audio feedback |
| Hero | PARTIAL / HUMAN_UNVALIDATED: upright four Origins×six Ages; incomplete attack/death/mount animation | retained; representative authored hero still pending |
| Outposts | PLACEHOLDER: specialization omitted by dressing call | ENGINEERING_READY: spec/era/tier/damage/repair-aware architecture; human readability pending |
| Knowledge | PARTIAL: generic crystal with unclear meaning | original shared codex, actual collection feedback, localized explanation; human recognition pending |
| Alien Signal | PARTIAL: small shared beacon/glyph; compass fallback leaked undiscovered bearings | unique monolith, known-only bearings and localized uncharted guidance; claim/fog geometry unchanged; unprompted navigation pending |
| Boss | PARTIAL: tank-template HP amplification / limited distinct attacks | unchanged; proper multi-pattern encounter still pending |
| World | PLACEHOLDER / PARTIAL: color fills + sparse cosmetic dressing; actual biome site bonuses | unchanged; polished Verdant environment still pending |

User-plan checkpoint mapping: A preservation/audit complete; B first signature
prototype reviewable (four-family overhaul unfinished); C/D first visual identity
corrective implementation; E hero, F boss, G Verdant environment and broader H
integration deferred after this first quality target. I/J engineering evidence,
Draft publication and exact-head CI are recorded in the PR delivery receipt.
Do not read this checkpoint as completion of the attached master plan.

Human265/266 are two reports of session `qa-13489-w2qem1`, identical terminal
wallEnd1389083.5, baseline SHA2ea1191, target-complete. Both have zero feedback/
ratings and null humanComment. Preserve them as one observed session, never two
independent tests or HUMAN_FUN_PASS. Raw reports and incoming three documents
are copied with SHA256 ledger to ignored
`scratch/combat-feedback-baseline-20261012/`. Sanitized session report retained.
The older real P1 `INTERRUPTED_BY_BUG` evidence remains unchanged.

Native browser evidence: `signature-charge/impact/reduced-{en,th}.png`,
`outpost-{research,military,economy}-{en,th}.png`,
`signal-monolith-{en,th}.png`, `knowledge-codex-{en,th}.png` in the visual artifact.
`conduction-before/after-{en,th}.png` compare real damage before and after selecting
the actual technology card in an isolated staged arena.
`signal-exploration-{en,th}.png` verify guidance without hidden coordinates.
These are actual rendered staged encounters/real claim methods, not fresh human
playtests. Native inspection found the first compact HUD icon hidden with its
text label; move it beside persistent values. Initial restart fixture incorrectly
treated fixture pause as a menu; fix fixture without changing Escape behavior.
Retain initial failed logs; do not weaken assertions.

Local B-only full check429 PASS; B/C/D check434/434 and native targeted16/16
PASS; neutral-claim regression brings final full check to435/435 across61 files,
with31-asset provenance/build. Analyze6/6 PASS; final known-only navigation native
regressions14/14 PASS. Packaging
ZIP17 checks and exact-head four-job CI are required after commit; their final
counts/links belong in the delivery receipt, not an advance claim here.

Performance: short sparse local Chromium/software trace after initial slice:
parent frame p50/p95/p99=56/63.3/123.4ms; sim=.1/.4/1.3ms;
renderer CPU submit=4.1/5.3/8.9ms;20 scene objects (includes8 fixed impact images).
The previous exact2ea CI parent frame=54.6/65.2/87.5ms and CPU=3.2/4.9/6ms.
Latest local delivery trace: parent frame69.4/86.2/128.3ms, sim.2/.9/1.9ms,
CPU4.6/7.2/13ms; child frame72.4/86.6/131ms, sim.1/.2/.7ms,
CPU5.7/9.1/13.3ms. Child renderer p95=9.1ms exceeds the8ms target.
Different workloads/hosts do not establish causal regression or improvement.
The16.7ms frame budget is unmet in these software traces. Actual hardware stress,
15min stability, GPU batches and long-run memory remain unverified; budgets
unchanged. Final CI parent/child measurements are artifact evidence, not60FPS.

Fresh human gate: launch `npm run qa:human`, start a new normal run from the new
exact-head package. Ask after unprompted play: identify Energy power/upgrade,
Knowledge, Signal, three outposts, enemy warning/counterplay, desire to replay.
Record genuine quotes/ratings separately from telemetry. No coaching that turns
recognition into a prompted answer. End verdict: ART_PRODUCTION_PARTIAL and
HUMAN_REVALIDATION_PENDING until actual feedback supports a stronger conclusion.
