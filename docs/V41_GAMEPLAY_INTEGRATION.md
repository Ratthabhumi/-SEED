# V4.1 gameplay integration — 2026-11-02

## Integration and scope

Verified main: `725cc79b6c3ddb433257a55734aa5281ee89a7de`.
Branch: `feat/v41-playable-core-20261102`, based on PR32
`530c545f3f8e9e696412a1dfcd65d0bca4a8b858`. Includes the exact two
QA report/test files from PR30 `caf6777e9aeb588b7786025c505796c5b5e710e1`,
which includes PR31's missing-sample correction. This integrates source without
merging or closing those PRs. The original desktop checkout is untouched.

No external research, new dependencies, canonical rules, save/worldgen changes,
new animation pipeline, release, deployment or performance threshold changes.

## Runtime/research reconciliation

These are source classifications, not new human acceptance claims. Historical
research percentages are not current measurement results.

| Concept | Classification | Runtime, input and feedback | Recovery / evidence |
|---|---|---|---|
| Seeded world/laws and weighted tech offers | LIVE_HUMAN_UNVALIDATED | `RunSimulation` imports `generateWorldLaws` and `generateOffers`; traits and draft cards show outcomes | `tests/seed/determinism.test.ts`, `tests/emergence/distribution.audit.test.ts`; strategic agency needs human evidence |
| Tech decision consequences | LIVE_HUMAN_UNVALIDATED | `GameScene` draft calls `chooseDraft`; effective effects and before/after use the existing build presenter | Reserve/reroll/skip already exist; `e2e/playability.spec.ts`; do not add a second effect engine |
| Free territory claim / specialization | LIVE_HUMAN_UNVALIDATED | `claimTerritory`, `canSetOutpostSpec`, `setOutpostSpec`; picker and civilization map use canonical affordability | Later/Escape and first-Signal exception already implemented; `e2e/outpostSoftlock.spec.ts`, `tests/sim/territoryEconomy.test.ts` |
| Age progression | LIVE_HUMAN_UNVALIDATED | Shared `ageGates` knowledge/mission/dominion checklist; new next-step line reads the same gates | No threshold/balance change; late-age terminal display corrected; `tests/sim/playability.test.ts`, new V4.1 browser cases |
| Four Origin powers | LIVE_HUMAN_UNVALIDATED | F input and existing ability loadout reach canonical active ability; cooldown feedback exists | `tests/sim/engagement.test.ts`, `e2e/content15Quality.spec.ts`; do not add duplicate Origin mechanics |
| Ascension / World 2 | LIVE_HUMAN_UNVALIDATED | `RunSimulation.ascend` and existing legacy/origin picker | Existing playability coverage; natural second-world enjoyment remains unvalidated |
| Notification queue | LIVE_VERIFIED (targeted automated checks) | Presentation-only manager; critical preemption; pause/hidden dwell freeze | New capacity/priority regressions plus existing browser pause/phase tests; no claim of overall game acceptance |
| Emergence ecology/director/events modules | SCAFFOLD_ONLY | Exports in `src/core/emergence/index.ts`; no runtime consumer found for those generators | Not equivalent to live combat AI/raids; no speculative wiring in this batch |
| Painted art and pose continuity | PARTIAL | Existing authored assets and current renderer preserved, including accepted floating bow/muzzle | `CONTENT16_1_REMAINING.md`; missing continuous anatomical animation requires original asset production |
| New advanced civilization/content tiers | DEFERRED | No new canonical subsystem justified by this audit | Validate the current loop before scope expansion |
| Fake limb motion / changing budgets after results | REJECTED | Would misrepresent authored continuity or measured performance | Preserve acceptance contract |
| Old research runtime counts / old artifact downloads | SUPERSEDED | Historical research ledger marks itself historical; ADR0048 pins source reconstructions explicitly | New archives are not original archive evidence |

## Confirmed corrections

1. During a boss encounter three simultaneous centered toasts obstruct play focus.
   Encounter presentation now has one slot at the left edge. Displaced alerts
   retain remaining dwell in the bounded queue; normal three-slot display returns
   afterward. Critical alerts still preempt routine alerts and phase text remains.
2. At queue capacity a routine notice could overwrite a queued critical summary.
   Overflow now evicts the lowest eligible priority; routine text cannot replace
   a critical warning. Both defects failed new unit regressions before the fix.
3. Final Space age displayed Knowledge against a nonexistent `/1` threshold.
   It now shows the total and hides the next-age bar. Earlier ages restore both.
4. A concise localized next-step line points to the first unmet canonical gate or
   substep. It does not change advancement or imply a new mission. Corrected the
   Thai next-age label typo.

Before browser reproduction: `v41Gameplay.spec.ts` on the existing production
bundle showed three encounter alerts where one is expected. Retained local
before/after captures live outside Playwright's disposable browser directory:
`test-results/v41-visible`. These are staged UI fixtures, not human gameplay.
Candidate captures may carry dirty-source build metadata; final CI is the
exact-commit authority. No private human telemetry is included here.

## Validation and acceptance

Local check passed 584 tests/101 files, typecheck, notices and production build.
An additional priority regression subsequently passed with the other two queue
tests (3/3). Analyze passed 6/6; ZIP and release:verify passed. Focused browser
batch: 30 passed, 1 startup timeout. Its trace records GET `/?e2e` returning404
while the concurrent full check rebuilt dist; the same English mobile test
passed in3.8s after separating build and browser execution. No timeout/assertion
was weakened. All four new EN/TH720/1080 cases passed. Preserve the original
failure instead of claiming a clean31/31 batch. Final CI links belong in the PR.
Required commands:
`npm run check`, focused browser regressions, `npm run analyze`, `npm run zip`,
`npm run release:verify`. There is no `npm run release` script; verification is
not authorization to publish a release.

| Acceptance | Status / boundary |
|---|---|
| ENGINEERING_INTEGRATION | INCONCLUSIVE until exact-SHA CI; local validation passes |
| CORE_LOOP_PLAYABILITY | PASS for automated scope; natural play separate |
| INPUT_RELIABILITY | PASS for focused Escape/keyboard/browser checks; startup404 retained separately |
| COMBAT_CORRECTNESS | PASS for existing automated invariants; canonical combat unchanged |
| PROGRESSION_CLARITY | PASS for automated UI regression; human comprehension unvalidated |
| VISUAL_CONTINUITY | INCONCLUSIVE, original assets preserved; no new animation claim |
| AUTHORED_ANIMATION | BLOCKED by missing original continuous frames |
| NATIVE_720P_PERFORMANCE | NOT_RUN in this presentation batch |
| STRICT_NATIVE_1080P_PERFORMANCE | NOT_RUN; historical gate remains unresolved |
| HUMAN_GAMEPLAY_ACCEPTANCE | NOT_RUN; no invented ratings or clean-pass claim |
| RELEASE_READINESS | BLOCKED by open human/art/performance acceptance |

## Owner retest and next milestone

Play the final CI commit in EN and TH at 720p/1080p. Follow the next-step hint
through a real age transition; inspect tech before/after, reserve/reroll/skip;
claim at full logistics, use Later/Escape and reopen; trigger a first Signal;
fight a boss while alerts queue; pause/resume; reach Space then World 2 and
confirm the Knowledge threshold returns. Report seed, exact build, elapsed
time, any interruption, and real ratings for combat/choices/progression/boss
readability/perceived performance/visual consistency/enjoyment. Keep raw reports
private. An interrupted session is bug evidence, not HUMAN_FUN_PASS.

Next milestone: review actual V4.1 natural-play feedback before selecting the
next combat/civilization improvement. Separately obtain original continuous
animation frames and a controlled native performance run. Owner retains
merge/release/deployment decisions; no further market research needed here.
