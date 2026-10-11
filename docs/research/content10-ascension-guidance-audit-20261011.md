# Ascension, language and goal guidance audit

Baseline: clean local/remote a09babda190a4104eb6314cb608341054bd5768d, feat/civilization-playability-20261011. PR #1 remains open/draft against feat/v0261-outpost-softlock-20261008. This work is a separate experiment on feat/content9-ascension-guidance-20261011; no merge, retarget, tag or v0.27.

## Evidence and causes

Recovered report 229 and private integrity manifest before edits. Genuine operator feedback: “รู้สึกว่าเริ่มเล่นของเดิมซ้ำอีกครั้ง” / “World #2 feels like starting the same game again.” No terminal reason, ratings or 30/60/120-second post-arrival sample. See the separate human evidence report.

| System | Content 9 transition to child | Persists / resets | Before change, visible in 30s? |
| --- | --- | --- | --- |
| World geometry | deriveAscensionSeed; new nonce / POIs | resets | Yes, geography; meaning weak |
| World laws | freshWorldState sampled master seed again | identical laws | No new strategic rule |
| Civilization | new compatible Origin | origin abilities change | HUD names; not explicitly compared |
| Inherited power | ascend applies last 3 legacyDefById effects | bounded FIFO persists | Swift +10% speed real but easy to miss |
| Age, levels, tech, weapons | fresh level 1 / Stone / root + foundations | resets | Same initial loop |
| Age objectives | shared AGE_MISSIONS | repeat exactly | Yes, repeated ten-kill task |
| Bases/capacity/research/Signal | freshWorldState clears them | resets | Requires rebuilding infrastructure |
| Offers/web | child-seeded graph and fresh streams; expandTechWeb | resets | New choices, same verbs/scalars |
| Enemy pressure | threatBudget includes ascension; raids size grows | child pressure scales | Not an explained new objective |
| Boss | stronghold/boss reset | resets | Later mechanic, not immediate arrival |
| History / totals | runElapsed/runKills/stats/history restored | persists | Chronicle; no arrival summary |

Sources: src/core/sim/RunSimulation.ts freshWorldState/ascend/knowledgeMult/updateRaid; src/core/progression/legacies.ts; missions.ts; src/core/director/director.ts; src/core/tech/web.ts; src/game/scenes/GameScene.ts doAscend/showChildIntro. Proven cause is reset plus weak differentiation/explanation; whether two conditions improve replay desire is a hypothesis requiring human comparison.

## Implemented bounded differences

See ADR 0022 and childWorld.ts. Exactly two configurations alternate deterministically. Scarcity is a research/biome routing tradeoff, not a damage sponge: .8 base rewards, doubled research contribution, strong-site/multi-base counterplay. Frontier changes defense placement through 135s vs 180s raid interval with 30s warning. Neither grants capacity, specialization, age, prerequisites or unbounded entities. Both require ten kills and one free cleared-site claim before Bronze; later gates unchanged. Actual inherited effects appear before resuming.

## Smart advice

pathGuidance.ts computes five relations from materialized graph, canonical ownership/tags, age and active families. Missing graph/age/family/exclusion blockers are explicit. No target means no advice; owned/completed goals suggest a new target. Unrelated draft explains that a new draw may still not help. Reserved cards and graph expansion use the same underlying node IDs/eligibility, not an independent pool. Offer weighting and quality remain unchanged; goal relevance is not universal build superiority.

Browser checks cover map→future-node selection→pin→draft→relation/reason→map review without consuming a draft→pick→updated map in EN/TH, and keyboard inheritance→Origin→child introduction. Canonical advice tests cover prerequisite chains, OR tags, ownership, age/family/exclusion, missing routes, invalid/no target, pin change/unpin/child reset and zero-draw equality. Legal gate tests are staged predicate/canonical progression evidence, not natural pacing or fun.

## Runtime reconciliation

| System | Classification | Evidence / limit |
| --- | --- | --- |
| Graph, bounded expansion, layout | IMPLEMENTED_AND_TESTED | Existing cohort + DAG + browser; scalar effects remain limited |
| Origins/abilities | IMPLEMENTED_HUMAN_UNVALIDATED | Canonical dispatch, tests; perceived identity pending |
| World laws | PARTIAL | Domain/combat weights execute; continuous axes not all used |
| Pinned guidance | IMPLEMENTED_AND_TESTED | Pure query + rendered draft; human comprehension pending |
| Territory/capacity/biomes | IMPLEMENTED_AND_TESTED | Shared predicates; actual research/regen; defense fun pending |
| Emergence director/ecology/events | SCAFFOLD_ONLY | Existing experimental modules are not complete runtime behavior |
| Child experiment | IMPLEMENTED_HUMAN_UNVALIDATED | Real economy/raid/mission differences; private A/B required |
| Localization/UI | PARTIAL | Simplified terms, effect numbers, translated history, EN/TH parity/layout; full novice comprehension pending |
| QA/provenance | IMPLEMENTED_AND_TESTED | Existing frozen bundle SHA and immutable archives; observation does not attest hardware |
| Audio/VFX | PARTIAL | Existing primitives; no fresh sound-language validation |
| Performance | PARTIAL | CPU-submit instrumentation; dense long-session/GPU budget pending |
| Persistence | IMPLEMENTED_AND_TESTED | Existing settings/archive schema unchanged; not full mid-run resume |
| New combat verbs / quest engine / public launch | DEFERRED | No evidence justifies expansion here |
| Guaranteed target draw / fake human ratings | REJECTED | Violates agency/evidence contracts |

Historical conditioned cohort remains: 8 seeds ×4 Origins ×36 picks; Content 8 real990/fallback2466/alternatives137 of1152; Content9 real3456/fallback0/alternatives1152 of1152, max117nodes. These are supply tests, not natural pacing or replayability. Reuse docs/research/content9-quality-audit-20261011.md and market-and-quality-20261011.md for primary-source comparator research; no new market-leader claim is needed for this bounded experiment.

## Performance and readiness

CPU-render submit, simulation step and actual browser frame intervals must be reported separately with viewport, age and environment. Targets remain 16.7ms/frame, sim p95<4ms, renderer p95<8ms. Automated headless/browser measurements do not certify player hardware or dense long-session performance. Human fun/replay/comprehension all pending. No observed new P0/P1 is waived; automated checks and exact-source CI determine engineering status only.

## Delivery validation and measured limits (2026-10-11)

Prepublication browser checks found and corrected real stale map-header rendering. The first published browser CI exposed fixture array/case errors; these were corrected without deleting assertions. The next exact-source run38146017490 passed59 browser cases but failed6 historical copy assertions (old RESERVE/REROLL/BUILD PLAN/LOGISTICS labels). Those assertions now check the new player-facing labels with their original visibility, click and layout contracts. Local targeted browser6/6 passed, including EN/TH pin-to-choice, two actual child transitions, keyboard and exhausted-alternative behavior. Full final CI is the publication gate; final exact SHA is recorded in the PR delivery receipt.

A final graph review also rejects combo providers whose prerequisite chains are permanently excluded or absent. Recoverable age/family gates remain visible. A regression retains a valid alternative and rejects the misleading indirect step.

### Performance evidence

The initial overlapping local runs produced large renderer-submit spikes and cannot establish a child regression. A serial run removed those spikes, but revealed that the old frame sampler used Phaser's smoothed delta. Presentation telemetry now measures performance.now between scene updates; canonical engine-delta stepping is unchanged. The serial production-build rerun below had no concurrent automated tests. CDP identifies ANGLE Vulkan **SwiftShader software rendering**, not a hardware GPU. GPU completion remains unmeasured.

| World / Stone age | Actual frame p50/p95/p99 ms | Sim-step p50/p95/p99 ms | CPU-render submit p50/p95/p99 ms | Frame / sim / render samples |
| --- | --- | --- | --- | --- |
| Parent |57.50 /68.90 /72.40 |.10 /.30 /1.30 |4.70 /6.40 /8.70 |128 /200 /129 |
| First child |58.30 /65.30 /75.40 |.10 /.30 /.50 |4.00 /5.60 /8.30 |126 /240 /127 |

Environment: local Windows Playwright Chromium,1920x1080, PERF-CHILD, release build from ce0abd1 plus wall-clock telemetry changes (dirty candidate), child staged through actual Ascend UI. This is a short early-world sample, not natural late-age/dense stress or human hardware certification. Separate simulation and CPU-submit p95 meet their budgets **in this sample only**; total frame budget fails in both worlds. No evidence here justifies changing combat, spawn caps or balance. Software rendering/scheduling is an investigated environment limitation, not proof of where every unmeasured millisecond was spent. 60FPS remains unverified and is not waived.

Raw sanitized numeric evidence: [renderer-serial.json](../playtests/content10-evidence/renderer-serial.json). Visually reviewed screenshots: child-intro-th, frontier-intro-en, recommended-draft-th, no-relevant-combo in the same directory. At200% /1280x720 the introduction keeps its heading and action visible; its body intentionally scrolls to accommodate readable text. The3-card Thai draft shows concrete effects and one truthful goal-completing card at1920x1080. At720px height, long goal/details use bounded internal scrolling. These checks are visual/automated evidence, not a novice comprehension verdict.

Final supported statuses: EVIDENCE_RECOVERED, ASCENSION_ROOT_CAUSE_AUDITED, PINNED_GUIDANCE_IMPLEMENTED, CHILD_WORLD_EXPERIMENT_VERIFIED (canonical/browser), HUMAN_REVALIDATION_PENDING. Localization remains PARTIAL; full-language comprehension and representative performance prevent release certification. No new observed gameplay P0/P1 remains in the tested paths; performance budget attainment and real child replay desire remain open validation items.
