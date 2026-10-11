# Content 9 competitive quality audit and development strategy

Date: 2026-10-11. Initial SHA: 83a3a2f6943039c6779b261277c3d31371ab9d71.
Branch: feat/civilization-playability-20261011. Intended draft PR base:
feat/v0261-outpost-softlock-20261008; never main. Initial CI: [4/4](https://github.com/Ratthabhumi/-SEED/actions/runs/38131525167), 368 unit tests, 57 browser tests, one capture-only skip, two actual ZIP artifacts. New corrections require their own exact-SHA CI.

## A. Product and audience

-SEED is a short-session civilization survivor for PC players who enjoy survivor action but want explainable technology and territory decisions. Its testable promise is: survive, develop a civilization, allocate scarce outposts, and see the consequences of a reproducible world. It is not yet a validated commercial product. The approximately 12-minute Stone-to-Space contract is a target, not an observed completion guarantee.

## B. Capability benchmarks, not a feature-count competition

Primary Steam pages and Steam appreviews API checked on 2026-10-11. Counts below are all-language, all-purchase-type, all-time snapshots, not the English-only store headline, sales, revenue, or current concurrency. More reviews do not establish the best game or the leader across platforms.

| Reference | Reviews | Positive |
|---|---:|---:|
| [Vampire Survivors](https://store.steampowered.com/app/1794680/) | 266,330 | 98.30% |
| [Brotato](https://store.steampowered.com/app/1942280/) | 119,665 | 95.89% |
| [BALL x PIT](https://store.steampowered.com/app/2062430/) | 27,557 | 95.25% |
| [Against the Storm](https://store.steampowered.com/app/1336490/) | 37,702 | 94.45% |
| [The Riftbreaker](https://store.steampowered.com/app/780310/) | 25,059 | 90.36% |
| [Factorio](https://store.steampowered.com/app/427520/) | 235,688 | 97.52% |
| [Hades II](https://store.steampowered.com/app/1145350/) | 124,118 | 95.70% |
| [Megabonk](https://store.steampowered.com/app/3405340/) | 106,953 | 94.24% |

Reproduce each query with https://store.steampowered.com/appreviews/APPID?json=1&language=all&purchase_type=all&filter=all&num_per_page=1 . Raw responses are local research material in scratch/research-audit-20261011/.

| Reference capability from publisher description | SEED hypothesis and observable check |
|---|---|
| Vampire Survivors: minimal action and power accumulation | First-minute player identifies movement, auto-attack, Knowledge and one visible upgrade without coaching. |
| Brotato: character traits and item/weapon builds | Two viable choices need explainable tradeoffs; ask which behavior changes after selecting. |
| BALL x PIT: ball fusion plus rebuilding a settlement | Action and base choices should feed one another. Test the existing combat/research/economy choice before adding new combinations. |
| Against the Storm: settlement adaptation under environmental pressure | Player explains why the same specialization is preferable in one biome. |
| The Riftbreaker: combat, exploration and defended bases | Taking and defending an outpost should change route or safety, not just HUD totals. |
| Factorio: automated production and infrastructure | Player diagnoses full logistics and reallocates through a visible, reversible-cost decision. No factory-production promise. |
| Hades II: differentiated powers and presentation | The effect can be recognized during play, and the player can say what the choice did. |
| Megabonk: survivor builds with character/map variation | Test moment-to-moment movement and readable growth; a successful competitor does not justify adding a 3D engine or copying its systems. |

These are design inferences from official descriptions, not findings from our own controlled competitor playtests. No copied names, code, art, audio, or balance.

Developer sales claims are separate: the [BALL x PIT announcement](https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=2062430&count=20&maxlength=700), dated September 20, 2026 in the Steam news API, reports 2 million copies. Platform mix, refunds and revenue are unspecified; this is a publisher statement, not an independently audited sales figure. Megabonk's widely repeated million-in-two-weeks figure was not verified from a primary developer announcement in this pass; do not convert its 106,953 reviews into sales.

## C. Position and originality

The differentiator to test is a civilization that evolves through choices and useful geography inside an action run. Avoid promises of infinite unique powers, a full city builder, or Factorio-scale production. Existing primitives can compose many branches while producing substantially similar behavior. A larger graph alone is not strategic depth.

## D. Runtime reconciliation

| System | Classification | Actual call path and evidence | Remaining limit |
|---|---|---|---|
| Determinism, state hashes, isolated streams | IMPLEMENTED_AND_TESTED | core/seed → RunSimulation → stateHash; determinism/rngIsolation tests | QA wall clock is outside canonical simulation. |
| Bounded technology web | IMPLEMENTED_HUMAN_UNVALIDATED | generator/web → RunSimulation.takeTech → expandTechWeb → state.techNodes; dagFrontier/webCohort tests | 128 nodes, depth 10, 8 slots; finite. |
| Eligibility and offers | IMPLEMENTED_AND_TESTED | eligibleTech/offerEngine used by draft, map, reserve and rerollAlternatives | Supply tests do not certify natural pacing. |
| Actual effect application | IMPLEMENTED_AND_TESTED | takeTech → effectiveEffects → applyTechEffect → combat/build reads | Cooldown floor .3; most scalar multipliers have no general ceiling. Pool limits bound entities, not subjective readability. No new primitive added. |
| Origin ability and usable families | IMPLEMENTED_HUMAN_UNVALIDATED | origins/ORIGIN_ABILITY → input F → RunSimulation; engagement tests | Four actual actives; stronger deep verbs remain scaffolds. |
| World laws / traits | IMPLEMENTED_HUMAN_UNVALIDATED | seeded laws → offer weights and generated cross-domain selection → trait HUD | Offer divergence is not distinct player strategy. |
| Biomes / territory value | IMPLEMENTED_HUMAN_UNVALIDATED | cached chunk biome → territory Knowledge/regen → HUD and site detail | Real support multipliers; no biome-specific enemy ecology/hazard simulation. |
| Free claim, specialization, first Signal | IMPLEMENTED_AND_TESTED | claimTerritory / canSetOutpostSpec / setOutpostSpec; softlock regressions | First Signal intentionally charges full cost while allowing a one-time capacity exception; reallocation cannot renew it. |
| Upgrade and refund | IMPLEMENTED_AND_TESTED | outpostUpgradeStatus / dismantleOutpost / upgradeOutpost; playability/frontier tests | Refund removes tier/benefits; no free Knowledge or healing; raid restrictions stay. |
| Responsive decision surfaces | IMPLEMENTED_HUMAN_UNVALIDATED | GameScene pause/draft + TechMapView / CSS; browser regressions | EN/TH desktop/narrow/200% tests are not a Thai readability interview or touch/controller certification. |
| Live budget director | IMPLEMENTED_HUMAN_UNVALIDATED | core/director + spawner → RunSimulation.step | Real spawning; combat feel / cadence not human validated. |
| Experimental phased director, deep verbs, ecology, FATE | SCAFFOLD_ONLY | core/emergence declarations; no live step imports/calls | Do not advertise as gameplay. |
| Audio / high-tier presentation | PARTIAL | SimEvent → game/audio/sfx and renderer | Minimal synthesis and existing assets; polish hypothesis deferred. |
| Expanded systems / storefront launch | DEFERRED | Human gate precedes scope authority | No new director, ecology, world event system or v0.27 in this pass. |
| Runtime LLM, ECS rewrite, navmesh | REJECTED | Existing deterministic pooled architecture suffices for present scope | Revisit only with an identified need and measured evidence. |

Core remains free of Phaser/browser imports and gameplay Math.random calls. WORLDGEN=2, CONTENT=9, SAVE_SCHEMA=1 unchanged. Settings/archive persistence exists; live-run save/restore is not promised. Ascension regenerates a child graph with bounded Legacy inheritance and preserves run evidence. Historical content-8 ledger metrics are dated separately.

## E. Meaningful choices and technical acceptance

Generation draws from eight domain effect slots using seven scalar effect kinds: damage, cooldown, speed, pickup, Knowledge, max HP, regeneration. Authored modules also use existing family powers. Six authored weave templates are unlocked by two free domain markers plus age; generated frontier joins require two actually acquired effect-bearing technologies from distinct domains. These are different contracts.

Selecting changes the build through canonical effectiveEffects. Origin/family compatibility filters offers; seed, age, tags and laws condition frontier composition. Generated names communicate domain plus stable depth/slot rather than a new combat verb. Repeated domain names and numeric stat choices are a credible plateau/readability risk, not a demonstrated request for more content. At 100+ nodes, stable layout/non-overlap and current-focus tests do not establish novice comprehension. Ask whether a player can find their last upgrade, explain two prerequisites and distinguish two branches.

Preserved conditioned cohort: 8 seeds × 4 origins × 36 staged picks, first-card policy, no natural combat/income/reroll/pin. Content-8 generator fixture uses the current runner: 990 real / 2466 fallback offers and 137/1152 alternate-choice rounds. Content 9: 3456 real / 0 fallback and 1152/1152 alternates, maximum 117 nodes. This is a supply comparison, not whole-old-build equivalence or proof of fun.

Class A audits eligible offers/fingerprints; Class B runs 48 short canonical traces with four scripted policies; Class C compares conditioned offers and heuristic first picks. None is a novice playtest or multi-run human strategy experiment. Preserve thresholds and samples. Windows watchdog accommodations are documented in ADR 0020, not a frame-time waiver.

## F. Remaining-defect review A–J

| Case | Finding | Action / evidence |
|---|---|---|
| A old mandatory picker | Fixed in parent; no recurrence established | canSetOutpostSpec, optional picker, existing browser tests. |
| B Later/Esc/resume/FIFO | Existing coverage | Retain free claims and pending unspecialized territory; no artificial logistics grant. |
| C full 6/6 / T2 gate | Full capacity is a real constraint; prior UI hid recovery | Existing refund and canonical reason path; original screenshot also lacked Knowledge. |
| D refund | Existing focused coverage | Actual paid cost only, tier reset, blocked during raid, Signal not farmable. |
| E no alternate reroll | Fixed | Predicate disables before spending or drawing RNG; reserve/pin use canonical eligibility. |
| F finite exhaustion | Intentional bound | Terminal fallback remains valid; skip/close paths and real-node focus covered. |
| G localization | Remaining English map tooltips found | Localized five tooltips; EN/TH parity and actual DOM regression. |
| H responsive surfaces | Existing wide/narrow/scale/keyboard checks | Retain screenshots; no visual quality claim from key parity alone. |
| I Chronicle IDs | Demonstrated EN/TH browser failure at 83a3a2f | Translate current graph/fallback names; old-world entries (including reused IDs) show an honest localized previous-world label. Canonical IDs remain in telemetry. |
| J run-end evidence | Real report has -13.68s wall duration; save-time SHA can relabel an old bundle | End timestamp uses monotonic milliseconds. Freeze SHA/dirty at Vite build/startup; save-time comparison marks changed/missing provenance dirty/unknown. No retroactive clean certification. |

The initial clock regression failed; both initial Chronicle regressions exposed raw IDs. The first expanded check failed only because a new unit fixture lacked document; corrected fixture supplies a document double. Full final checks must pass before engineering verification.

## G. Actual human evidence and performance

Preserved session 9bbc4e64c35275c8a56ca785: reported initial SHA 83a3a2f, Hunters, EPOCH-GOLDEN-001, 720.55 simulation seconds, player died in Iron; Bronze96.38s, Iron222.42s; two upgrades, two lost raids, F used three times. No subjective ratings, feedback marks or comment. Its old SHA was stamped at report submission, so running-bundle provenance cannot now be certified. Negative wall time is invalid, not repaired by guessing. Duplicated same-time Civilization Map marks also limit exact action counts; do not infer behavior frequencies from them without a reproduction.

Historical 11:43 Industrial softlock and later content-8 incident remain INTERRUPTED_BY_BUG. This newer telemetry does not supersede them with HUMAN_FUN_PASS. It is machine evidence with HUMAN_VALIDATION_PENDING.

At 2560×1305, estimated refresh ~36Hz, run-end frame p50/p95/p99=29.86/37.41/41.72ms and simulation=.49/.65/.70ms; minimum FPS22. Target60FPS/render p95<8ms is not established. Frame interval is not isolated renderer CPU/GPU duration. Measurement context is incomplete; collect focused hardware/browser/stress workload and profile before optimizing or changing budgets. Unit-test duration is not FPS. Production bundle warning remains a warning; no reduction or waiver claimed.

Only skipped E2E: visualAuditV0231.spec.ts capture fixture, enabled by SEED_CAPTURE=1. It is a screenshot-generation skip, not an excluded gameplay regression. Keyboard focus/navigation tested in affected surfaces; controller/touch and color-vision usability remain unvalidated. Raw logs stay ignored; reviewed sanitized summaries only are staged.

## H. Minimum private demo bar

Before broad distribution: no P0/P1 modal/progression traps; truthful names/effects/costs; basic action without coaching; at least two explainably different builds; one meaningful territory tradeoff; natural end Chronicle and replay reason; complete EN/TH decision access at100–200%; reliable build provenance; target-hardware measurement against unchanged budgets. Private exploratory pilot may proceed after exact-SHA engineering checks, with remaining hypotheses disclosed to operators. Public demo/release readiness remains unapproved.

## I. Human pilot

Use [compact operator checklist](../playtests/CONTENT9_PILOT_CHECKLIST.md). Recruit3–5 novices for qualitative discovery, not statistical fun certification. First15min or natural death: no coaching/cheats; record observations then interpretations separately. Follow-up compares two origins on one seed, then two seeds on one origin, counterbalancing order across testers. Record direct statements about power effects, location, logistics, age gate, death and replay. Do not force a full factorial on every novice. Stop a session at a blocker, preserve screenshot/log, mark INTERRUPTED_BY_BUG.

## J. Ranked hypotheses and next two experiments

| Rank | Hypothesis | Measurement / decision |
|---|---|---|
| 1 first minute | Players can connect action → Knowledge → visible reward | Uncoached explanation and time to first deliberate upgrade; prototype a contextual prompt only if the failure repeats. |
| 2 combat/effect feedback | Upgrades feel different enough to guide the next pick | Ask what visibly changed before showing the card; consider a small effect-feedback change if repeated misidentification. |
| 3 builds | Scalar branches yield intentional tradeoffs | Capture two rejected alternatives and why; do not count distinct IDs as distinct strategies. |
| 4 origins | F and family affordances change tactics | Same-seed paired comparison, not first-offer JSD. |
| 5 outposts | Biome/support and refund change route | Explain site choice and recover6/6 without coaching after blind phase. |
| 6 pacing | Natural advancement remains legible and survivable | Record age dwell and unmet gates; one Iron death is not evidence for an automatic difficulty nerf. |
| 7 replay | Player voluntarily wants a different next run | Direct yes/no/why and intended next change; survival time is not preference. |

Highest-value next work: the first-minute comprehension experiment and effect-recognition experiment. Gather evidence first; no speculative gameplay implementation in this audit. Audio, deep verbs, phased intensity and ecology need separate hypotheses, caps, costs and acceptance tests.

## K. Distribution preparation

[Steam Coming Soon](https://partner.steamgames.com/doc/store/coming_soon) supports public information and wishlists once branding and core promises are stable. This is an option after validation, not authority to publish a page. [Steam Next Fest](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest) requires an eligible unreleased base game and playable demo; event-specific review/eligibility rules must be checked at decision time. Reserve the one participation opportunity; do not choose a date from urgency. No event registration, launch date or price set here.

[itch HTML5 requirements](https://itch.io/docs/creators/html5) support a ZIP with index.html at its root and relative paths. Current packaging gates verify this, licenses, files and assets; artifact verification does not publish the game or certify demand. Start with controlled pilot access before broad promotion; collect consent for screenshots and keep identifying hardware/path logs private.

## L. Stop/go and evidence expansion

ENGINEERING_VERIFIED requires final exact-SHA four jobs and uploaded ZIPs, not the initial green SHA. HUMAN_PLAYTEST_READY means eligible for a fresh controlled pilot. HUMAN_VALIDATION_PENDING remains the subjective verdict. Hardware stress, novice Thai readability, natural late-age/Ascension experience, voluntary replay and market demand remain gaps. No FUN_CERTIFIED, MARKET_READY or RELEASE_READY claim.

Expand only after repeated human evidence supports the next hypothesis and engineering budgets remain met. FOMO from hit sales, status from graph size, sunk cost in scaffolds, and changing thresholds after seeing results are not sufficient authority. Freeze the pilot rubric before results; negative evidence may narrow scope rather than trigger more systems. Final CI/PR receipt is recorded in SESSION_HANDOFF and the exact-SHA Actions run.
