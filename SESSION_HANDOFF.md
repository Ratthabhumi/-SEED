## Upright actors and era counterplay slice — 2026-10-12

Based on verified PR4 head47aa8c6, separate feat/age-combat-evolution-20261012. Incoming uncommitted human245/246 evidence preserved: one session qa-27147-e9kpmj, same terminal wallEnd, target-complete, no written comment/ratings recorded. Raw evidence/hash backup in scratch/age-evolution-baseline-20261012. Older interrupted softlock evidence unchanged.

Implemented pending checks: upright hero/squad with authored front/back strips across four Origins×six Ages, stable movement/hold/idle history reset per world; distinct non-humanoid facing; source/spawn-tier projectile grammar; Guardian/aura/orbit visibility matches actual active families and Guardian equipment receives current Age. Two-Age canonical experiment: Stone ordinary chaser warning→locked rush→recovery; Industrial ordinary ranged warning→three fixed-aim shots→reload. Existing boss/elite/siege/director density preserved. Content12, worldgen2/save2; new state hashed and recycled. No dependency.

Highest-value human gate: compare Stone versus Industrial and upright movement; do not automatically expand unvalidated behavior to remaining Ages. Art remains working-prototype, attack/death/mount/boss polish partial; no HUMAN_FUN_PASS or60FPS. See AGE_COMBAT_EVOLUTION.md and ADR0025. Draft PR5 https://github.com/Ratthabhumi/-SEED/pull/5 targets PR4. Focused27/27 and committed rush/pool8/8, typecheck,31-asset provenance and build passed. Local full check421 passed/1 policy180s timeout plus worker onTaskUpdate timeout; no thresholds weakened. First browser run exposed POI-discovery interference and missed recovery while screenshotting; isolated the arena and used real fixed-step, temporarily frozen encounter captures. Corrected movement and24-state-per-language roster14/14 passed locally; encounter capture was canceled correctly by friendly knockback, so friendly fire is suppressed only in that isolated fixture. Added Guardian enablement/Age regression (focused9/9 passed). Final16-case matrix/48 Origin-Age-language captures and final exact-head CI/ZIP receipt are maintained in PR5 after completion.

## Unified art/UI corrective work — 2026-10-12

Work branch feat/unified-art-ui-repair-20261012, based on verified local/remote PR3 a1d74ca. Existing PR1/2/3 and main untouched. Incoming human report219 at a1d74ca preserved, raw and sanitized evidence never replaced by synthetic tests; private baseline copies in scratch/unified-art-baseline-20261012.

Implemented: typed theme + generated CSS/Phaser palette, bounded title/Archive regions with persistent Start footer, native Origin previews, original ten actor strips with six reusable equipment Ages and three frame slots (tank/boss gait still rigid). Production hero/enemy/guardian/squad body shapes suppressed; functional telegraphs remain. One pooled world repair label/bar reads canonical repairT/range, pauses/resets with simulation; mechanics unchanged. No version/dependency changes. All actor sources remain working-prototype, authored attack/death sequences and human visual approval pending.

Docs: UI_DESIGN_SYSTEM.md, ACTOR_COVERAGE.md, UNIFIED_ART_UI_REVIEW.md, ADR0024 and actor-family-board.svg. New tests cover contrast/asset coverage/no primitive body, repair derivation/real10s restoration and browser title matrix/repair pause-exit-resume. PR4 is a separate Draft targeting PR3. Focused17 tests/analyze6/typecheck/provenance/build/ZIP/release verification passed. Local full check exceeded frontier-policy180s timeout; log retained, no threshold changes. c9f3cb5 CI Node22/24/analyze passed; e2e found schema1 fixture wrongly accessing meta. Fixture corrected and48 combinations partitioned per viewport, funded purchase cases separate. Local corrected browser suite16/16 passed, covering48 viewport/scale/language combinations and native purchases/repair. Code checkpoint42ae39e has Node22/24 full CI checks passed; final four-job exact-head receipt and artifact links are recorded in PR4 after CI completes. See UNIFIED_ART_UI_REVIEW.md for evidence and performance limits. Never mark art complete or60FPS from synthetic tests.

## Living Frontier implementation checkpoint — 2026-10-12
Work branch: feat/visual-gameplay-evolution-20261011, based on PR2 head781687a. PR2/PR1/main remain untouched. Commits00f22e6 preserve real Content10 human evidence,1b22aab adds FPS/QA launcher,235be2c adds Archive; current milestone adds original vector slice, site previews, acquired combat behaviors/fusion, bounded feedback and responsive pause.

Delivered: schema2 migration with safe v1 fallback; idempotent defeat/voluntary boss-victory rewards; three optional one-time purchases; Attempt distinct from World. Content11 adds Conduction, Relay and acquired-tag fusion; all new flags/timers hashed/reset on child. Worldgen2 geometry unchanged; Verdant decorative terrain has no collision. MIT original assets have manifest hashes and bundled license; working prototype only. Site risk uses the exact canonical spatial query and first-Signal affordability exemption. Reduced Effects/Shake and max8 synthesized audio voices. Pause fits EN1920×1080 and TH1280×720 at100%;200% safely scrolls. Actual browser captures reviewed; no human fun verdict inferred.

Verification: npm run check passes407 tests, provenance and build; new browser suite4/4 passes. Existing playability cases11/11 passed in the preceding combined run; it exposed the new TH fit failure, subsequently fixed and rerun. Publication requires final check/analyze/ZIP/release verification plus exact pushed-SHA CI4/4 and two ZIP artifacts. Record authoritative CI completion in the PR/task without claiming green in advance. No merges, tags, public release or v0.27.

Evidence/design: docs/LIVING_FRONTIER_REVIEW.md, docs/ADR/0023-visual-gameplay-and-archive-slice.md, docs/frontier-style-board.svg, docs/playtests/frontier-policy-sanitized.json and frontier-performance-sanitized.json. Human terminal report296 and feedback revision297 share one session/wallEnd; console identifies sequence. Raw evidence copied with hashes under scratch/visual-evolution-evidence-20261011, never overwritten. Old INTERRUPTED_BY_BUG preserved. Tiny canonical policy cohort:1 victory,5 defeats,2 time limits; no target human win rate claimed.

Next gate: fresh human defeat → Archive purchase → Attempt2 and optional boss finish/World2, actual hardware stress performance, visual readability/style and fun feedback. The latest sparse local software-rendered trace misses frame and child renderer-CPU targets; no60FPS certificate or relaxed budget. See exact measured values and limitations in the review. Physical obstacles and expanded art families are deferred for validated navigation/style/performance. No additional market research performed per user request; existing research inputs retain their boundaries.

# Session Handoff

## Current review experiment — 2026-10-11

Branch: feat/content9-ascension-guidance-20261011, based on clean Content9 a09babd. Separate Draft PR against the Content9 branch; PR1 remains unchanged. Versions: worldgen2/content10/save1. Recovered report229 and genuine negative child-arrival feedback are in docs/playtests/content9-ascension-human-20261011.md. Raw evidence is privately preserved. Latest audit: docs/research/content10-ascension-guidance-audit-20261011.md; human follow-up: docs/playtests/ASCENSION_AB_CHECKLIST.md. Checkpoint tests394 PASS; standalone analyze6 PASS; focused browser6 PASS; exact-head delivery receipt and CI remain pending until publication. The older canonical/QA sections below are historical baselines, not certification of this experiment.


## Latest human playtest evidence

<!-- QA-ENGAGEMENT-START -->

# -SEED v0.26 Experience Evidence Human — Sanitized Evidence

> Auto-generated by `npm run qa:report` from local QA telemetry.
> Machine evidence only — fun and readability verdicts need a human.

## Run

- sessionId: qa-27147-e9kpmj
- reportSequence: 246
- buildSha: 47aa8c620166f92b11d61d9d58c480620c602052
- buildDirty: false
- seed: EPOCH-GOLDEN-001
- origin: hunters
- package: 0.2.0-dev.0 / worldgen 2 / content 11 / save 2
- endReason: target-complete
- wallDuration: 1269.91s
- viewport: 2560x1305 / refresh: ~48Hz

## Route
- [x] run started (0.00s)
- [x] Bronze (74.28s)
- [x] Iron (178.43s)
- [x] Industrial (434.60s)
- [x] Atomic (777.68s)
- [x] Space (825.18s)
- [x] boss spawned (872.00s)
- [x] boss killed (913.25s)
- [x] ascension offered (913.25s)
- [x] ascension started (0.00s)
- [x] child world (0.00s)
- [x] post-ascension +30s (30.05s)
- [x] post-ascension +60s (60.12s)
- [x] post-ascension +120s (120.25s)
- [ ] player died 
- [x] run ended (120.25s)

## Civilization Command Loop Usage

- Tech Map opened: 2
- First Tech Map open: 49.73s sim
- Paths pinned: 1 [space-singularity]
- Reserve uses: 0 (attempts 0)
- Rerolls: 0 (attempts 0, unavailable 0)
- Skips: 0
- Breakthroughs completed: 2 [fortress, metallurgy]

- Territories claimed: 8 [ruin, ruin, ruin, ruin, signal, ruin, ruin, ruin] (claim attempts 8)
- First territory time: 110.15s sim
- Outpost types: [Research: 4, Military: 2, Economy: 2]
- Outpost upgrades: 2 (attempts 2)
- Raids incoming: 3
- Raids defended: 1
- Raids lost: 2
- Outposts repaired: 2

- Rally commands (Q): 3
- Focus commands (E): 1
- Hold commands (R): 0
- Origin ability uses (F): 1
- Civ Map opens (M): 4

- Age gate block summary:
  - Stone dwell: 74.28s
  - Bronze dwell: 104.15s
  - Iron dwell: 256.17s
  - Industrial dwell: 343.08s
  - Atomic dwell: 47.50s
  - Space to Boss kill: 88.07s

## Engagement Identity
- @0.00s stone asc 0: origin hunters [field+kinetic] lv1 k0e0d0f0 techs 0 knowledge 0 breakthroughs [-] legacies [-] poi [-]
- @74.28s bronze asc 0: origin hunters [field+kinetic] lv9 k1e1d1f1 techs 12 knowledge 542 breakthroughs [-] legacies [-] poi [meteor+ruin+signal+vault]
- @178.43s iron asc 0: origin hunters [field+kinetic] lv15 k2e2d2f2 techs 18 knowledge 1558 breakthroughs [-] legacies [-] poi [meteor+ruin+signal+vault]
- @434.60s industrial asc 0: origin hunters [field+kinetic] lv21 k3e3d3f3 techs 24 knowledge 3351 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @777.68s atomic asc 0: origin hunters [defense+field+kinetic] lv28 k4e4d4f4 techs 31 knowledge 6816 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @825.18s space asc 0: origin hunters [defense+field+kinetic] lv29 k5e5d5f5 techs 32 knowledge 7352 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @913.25s space asc 0: origin hunters [defense+field+kinetic] lv31 k5e5d5f5 techs 34 knowledge 9065 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @0.00s stone asc 1: origin resonant [energy+field] lv1 k0e0d0f0 techs 35 knowledge 0 breakthroughs [-] legacies [trait-swift] poi [-]
- @55.78s bronze asc 1: origin resonant [energy+field] lv11 k1e1d1f1 techs 49 knowledge 834 breakthroughs [metallurgy] legacies [trait-swift] poi [meteor+ruin+signal+vault]
- @98.22s iron asc 1: origin resonant [energy+field] lv15 k2e2d2f2 techs 53 knowledge 1501 breakthroughs [metallurgy] legacies [trait-swift] poi [meteor+ruin+signal+vault]

## Knowledge At Age
- bronze @74.28s (asc 0): 542
- iron @178.43s (asc 0): 1558
- industrial @434.60s (asc 0): 3351
- atomic @777.68s (asc 0): 6816
- space @825.18s (asc 0): 7352
- bronze @55.78s (asc 1): 834
- iron @98.22s (asc 1): 1501

## Sim Decisions (ordered)
- [dominion] 0/0 @0.98s stone asc 0
- [mission_complete] bronze @7.65s stone asc 0
- [poi-major] vault @12.17s stone asc 0
- [site_prompt] CLAIMABLE:vault @12.17s stone asc 0
- [focus] poi-982d6fd4--1-2-0 @12.17s stone asc 0
- [tech] application-field-0 @12.18s stone asc 0
- [poi-major] ruin @16.27s stone asc 0
- [site_prompt] CLAIMABLE:ruin @16.28s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @16.28s stone asc 0
- [tech] fb-spd-1 @16.28s stone asc 0
- [tech] weave-stone-warfare-culture @16.45s stone asc 0
- [poi_discovered] vault:+44 @25.27s stone asc 0
- [tech] stone-trap @25.28s stone asc 0
- [site_prompt] CONTESTED:vault @25.28s stone asc 0
- [focus] poi-982d6fd4--2-4-0 @25.28s stone asc 0
- [tech] application-field-1 @30.53s stone asc 0
- [poi-major] signal @32.97s stone asc 0
- [site_prompt] CLAIMABLE:signal @32.98s stone asc 0
- [focus] poi-982d6fd4-0-3-0 @32.98s stone asc 0
- [tech] web:stone-trap:1 @32.98s stone asc 0
- [focus] poi-982d6fd4--2-4-0 @39.58s stone asc 0
- [poi-major] meteor @43.03s stone asc 0
- [tech] web:application-field-1:1 @43.05s stone asc 0
- [site_prompt] CLAIMABLE:meteor @43.27s stone asc 0
- [focus] poi-982d6fd4--2-5-0 @43.27s stone asc 0
- [poi_discovered] signal:+59 @46.03s stone asc 0
- [site_prompt] CLAIMABLE:signal @46.05s stone asc 0
- [focus] poi-982d6fd4--3-6-0 @46.05s stone asc 0
- [tech] stone-totem @46.05s stone asc 0
- [focus] poi-982d6fd4--2-5-0 @48.00s stone asc 0
- [focus] poi-982d6fd4--3-6-0 @49.05s stone asc 0
- [civmap_open] open @49.37s stone asc 0
- [techmap_open] open @49.73s stone asc 0
- [pin] space-singularity @49.73s stone asc 0
- [poi_discovered] vault:+47 @54.27s stone asc 0
- [site_prompt] CONTESTED:vault @54.30s stone asc 0
- [focus] poi-982d6fd4--2-8-0 @54.30s stone asc 0
- [tech] web:application-field-1:0 @54.30s stone asc 0
- [focus] poi-982d6fd4--3-6-0 @55.87s stone asc 0
- [focus] poi-982d6fd4--2-8-0 @56.97s stone asc 0
- [poi_discovered] signal:+59 @57.75s stone asc 0
- [site_prompt] CONTESTED:signal @57.77s stone asc 0
- [focus] poi-982d6fd4--1-8-0 @57.77s stone asc 0
- [tech] web:web:stone-trap:1:0 @57.77s stone asc 0
- [poi_discovered] vault:+47 @61.93s stone asc 0
- [site_prompt] CONTESTED:vault @62.55s stone asc 0
- [focus] poi-982d6fd4-1-7-0 @62.55s stone asc 0
- [poi_discovered] signal:+59 @63.82s stone asc 0
- [site_prompt] CONTESTED:signal @63.83s stone asc 0
- [focus] poi-982d6fd4-2-7-0 @63.83s stone asc 0
- [tech] web:web:application-field-1:1:1 @63.83s stone asc 0
- [poi_discovered] meteor:+35 @66.37s stone asc 0
- [site_prompt] CLAIMABLE:meteor @66.85s stone asc 0
- [focus] poi-982d6fd4-3-7-0 @66.85s stone asc 0
- [poi_discovered] ruin:+29 @67.72s stone asc 0
- [site_prompt] CONTESTED:ruin @67.75s stone asc 0
- [tech] application-kinetic-1 @67.75s stone asc 0
- [poi_discovered] vault:+47 @68.62s stone asc 0
- [site_prompt] CONTESTED:vault @68.92s stone asc 0
- [focus] poi-982d6fd4-2-6-0 @68.92s stone asc 0
- [focus] poi-982d6fd4-3-6-0 @70.03s stone asc 0
- [focus] poi-982d6fd4-3-7-0 @71.15s stone asc 0
- [poi_discovered] vault:+47 @74.25s stone asc 0
- [age_reached] bronze @74.27s stone asc 0
- [site_prompt] CONTESTED:vault @74.28s bronze asc 0
- [focus] poi-982d6fd4-4-9-0 @74.28s bronze asc 0
- [poi_discovered] signal:+59 @77.82s bronze asc 0
- [site_prompt] CONTESTED:signal @77.85s bronze asc 0
- [focus] poi-982d6fd4-3-10-0 @77.85s bronze asc 0
- [tech] web:web:web:application-field-1:1:1:0 @77.85s bronze asc 0
- [focus] poi-982d6fd4-4-9-0 @79.25s bronze asc 0
- [focus] poi-982d6fd4-3-10-0 @80.35s bronze asc 0
- [poi_discovered] ruin:+29 @81.57s bronze asc 0
- [site_prompt] CONTESTED:ruin @82.55s bronze asc 0
- [focus] poi-982d6fd4-1-10-0 @82.55s bronze asc 0
- [poi_discovered] vault:+47 @83.12s bronze asc 0
- [site_prompt] CLAIMABLE:vault @83.65s bronze asc 0
- [focus] poi-982d6fd4-0-11-0 @83.65s bronze asc 0
- [poi_discovered] signal:+59 @85.20s bronze asc 0
- [site_prompt] CLAIMABLE:signal @85.22s bronze asc 0
- [focus] poi-982d6fd4-0-12-0 @85.22s bronze asc 0
- [tech] web:weave-stone-warfare-culture:1 @85.22s bronze asc 0
- [focus] poi-982d6fd4-0-11-0 @86.82s bronze asc 0
- [poi_discovered] meteor:+35 @87.18s bronze asc 0
- [site_prompt] CONTESTED:meteor @87.95s bronze asc 0
- [focus] poi-982d6fd4-2-12-0 @87.95s bronze asc 0
- [focus] poi-982d6fd4-1-10-0 @90.17s bronze asc 0
- [focus] poi-982d6fd4-2-12-0 @91.32s bronze asc 0
- [focus] poi-982d6fd4-3-10-0 @92.45s bronze asc 0
- [mission_complete] iron @93.37s bronze asc 0
- [focus] poi-982d6fd4-4-9-0 @96.95s bronze asc 0
- [squad_command] follow @99.70s bronze asc 0
- [squad_command] focus @100.27s bronze asc 0
- [focus] poi-982d6fd4-3-10-0 @102.70s bronze asc 0
- [poi_discovered] ruin:+29 @103.32s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @103.83s bronze asc 0
- [focus] poi-982d6fd4-5-11-0 @103.83s bronze asc 0
- [squad_command] follow @104.23s bronze asc 0
- [poi_discovered] ruin:+29 @107.10s bronze asc 0
- [site_prompt] CONTESTED:ruin @107.12s bronze asc 0
- [focus] poi-982d6fd4-6-11-0 @107.12s bronze asc 0
- [tech] application-kinetic-0 @107.12s bronze asc 0
- [claim_attempt] poi-982d6fd4-6-11-0 @110.15s bronze asc 0
- [territory_claimed] poi-982d6fd4-6-11-0:ruin @110.15s bronze asc 0
- [focus] poi-982d6fd4-5-11-0 @110.15s bronze asc 0
- [first_claim] 110.1s @110.15s bronze asc 0
- [dominion] 1/1 @110.15s bronze asc 0
- [outpost_spec] poi-982d6fd4-6-11-0:economy @110.15s bronze asc 0
- [poi_discovered] signal:+59 @112.93s bronze asc 0
- [site_prompt] CONTESTED:signal @113.22s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @113.22s bronze asc 0
- [focus] poi-982d6fd4-5-11-0 @114.33s bronze asc 0
- [poi_discovered] meteor:+35 @114.43s bronze asc 0
- [site_prompt] CONTESTED:meteor @115.48s bronze asc 0
- [focus] poi-982d6fd4-9-11-0 @115.48s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @116.62s bronze asc 0
- [poi_discovered] ruin:+29 @116.68s bronze asc 0
- [site_prompt] CONTESTED:ruin @117.73s bronze asc 0
- [focus] poi-982d6fd4-9-13-0 @117.73s bronze asc 0
- [claim_attempt] poi-982d6fd4-9-13-0 @118.73s bronze asc 0
- [territory_claimed] poi-982d6fd4-9-13-0:ruin @118.73s bronze asc 0
- [focus] poi-982d6fd4-9-11-0 @118.73s bronze asc 0
- [dominion] 2/1 @118.73s bronze asc 0
- [outpost_spec] poi-982d6fd4-9-13-0:military @118.73s bronze asc 0
- [poi_discovered] ruin:+29 @120.97s bronze asc 0
- [site_prompt] CONTESTED:ruin @120.98s bronze asc 0
- [focus] poi-982d6fd4-9-14-0 @120.98s bronze asc 0
- [tech] web:web:web:stone-trap:1:0:0 @120.98s bronze asc 0
- [claim_attempt] poi-982d6fd4-9-14-0 @122.20s bronze asc 0
- [territory_claimed] poi-982d6fd4-9-14-0:ruin @122.20s bronze asc 0
- [focus] poi-982d6fd4-9-11-0 @122.20s bronze asc 0
- [dominion] 3/1 @122.20s bronze asc 0
- [outpost_spec] poi-982d6fd4-9-14-0:research @122.20s bronze asc 0
- [poi_discovered] meteor:+39 @123.75s bronze asc 0
- [site_prompt] CONTESTED:meteor @123.88s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @123.88s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @126.15s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @127.28s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @128.43s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @129.57s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @131.80s bronze asc 0
- [focus] poi-982d6fd4-9-11-0 @140.70s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @144.05s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @152.98s bronze asc 0
- [focus] poi-982d6fd4-9-11-0 @154.08s bronze asc 0
- [focus] poi-982d6fd4-8-11-0 @157.47s bronze asc 0
- [tech] web:web:application-field-1:1:0 @159.35s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @161.23s bronze asc 0
- [poi_discovered] ruin:+32 @164.10s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @164.60s bronze asc 0
- [focus] poi-982d6fd4-10-14-0 @164.60s bronze asc 0
- [focus] poi-982d6fd4-8-14-0 @165.72s bronze asc 0
- [poi_discovered] vault:+52 @166.53s bronze asc 0
- [site_prompt] CONTESTED:vault @166.83s bronze asc 0
- [focus] poi-982d6fd4-9-15-0 @166.83s bronze asc 0
- [focus] poi-982d6fd4-10-14-0 @167.95s bronze asc 0
- [poi_discovered] signal:+65 @170.23s bronze asc 0
- [site_prompt] CONTESTED:signal @171.32s bronze asc 0
- [focus] poi-982d6fd4-12-15-0 @171.32s bronze asc 0
- [focus] poi-982d6fd4-10-14-0 @172.42s bronze asc 0
- [poi_discovered] meteor:+39 @173.45s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @173.52s bronze asc 0
- [focus] poi-982d6fd4-11-17-0 @173.52s bronze asc 0
- [poi_discovered] vault:+52 @176.87s bronze asc 0
- [site_prompt] CONTESTED:vault @176.88s bronze asc 0
- [focus] poi-982d6fd4-12-18-0 @176.88s bronze asc 0
- [tech] web:stone-trap:0 @176.88s bronze asc 0
- [poi_discovered] signal:+65 @178.40s bronze asc 0
- [age_reached] iron @178.42s bronze asc 0
- [site_prompt] CONTESTED:signal @178.43s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @178.43s iron asc 0
- [poi_discovered] signal:+65 @179.00s iron asc 0
- [site_prompt] CLAIMABLE:signal @179.05s iron asc 0
- [focus] poi-982d6fd4-11-19-0 @179.05s iron asc 0
- [poi_discovered] ruin:+32 @180.45s iron asc 0
- [site_prompt] CLAIMABLE:ruin @181.27s iron asc 0
- [focus] poi-982d6fd4-11-20-0 @181.27s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @182.38s iron asc 0
- [focus] poi-982d6fd4-12-18-0 @183.50s iron asc 0
- [poi_discovered] vault:+52 @185.60s iron asc 0
- [site_prompt] CONTESTED:vault @185.63s iron asc 0
- [focus] poi-982d6fd4-14-18-0 @185.63s iron asc 0
- [tech] web:web:application-field-1:0:1 @185.63s iron asc 0
- [focus] poi-982d6fd4-12-18-0 @189.23s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @190.35s iron asc 0
- [poi_discovered] ruin:+32 @191.78s iron asc 0
- [site_prompt] CLAIMABLE:ruin @192.58s iron asc 0
- [focus] poi-982d6fd4-13-21-0 @192.58s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @194.77s iron asc 0
- [poi_discovered] vault:+52 @195.20s iron asc 0
- [site_prompt] CLAIMABLE:vault @195.87s iron asc 0
- [focus] poi-982d6fd4-14-22-0 @195.87s iron asc 0
- [focus] poi-982d6fd4-13-21-0 @196.97s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @199.20s iron asc 0
- [focus] poi-982d6fd4-11-20-0 @200.35s iron asc 0
- [focus] poi-982d6fd4-12-19-0 @202.58s iron asc 0
- [focus] poi-982d6fd4-11-17-0 @203.70s iron asc 0
- [focus] poi-982d6fd4-12-15-0 @210.37s iron asc 0
- [focus] poi-982d6fd4-10-14-0 @213.78s iron asc 0
- [focus] poi-982d6fd4-9-15-0 @220.53s iron asc 0

## Performance Summary
- bronze: n=164 fpsMin=33 frame 22.20/36.00/47.70ms sim 0.40/0.55/0.59ms ent 17/9/89
- iron: n=199 fpsMin=34 frame 20.80/29.50/32.60ms sim 0.32/0.43/0.46ms ent 18/19/189
- industrial: n=476 fpsMin=34 frame 20.50/31.00/38.80ms sim 0.28/0.37/0.41ms ent 20/23/278
- atomic: n=521 fpsMin=28 frame 23.50/30.10/37.00ms sim 0.20/0.28/0.36ms ent 43/28/400
- space: n=78 fpsMin=31 frame 27.60/35.80/37.50ms sim 0.15/0.18/0.19ms ent 16/33/400
- boss-spawn: n=71 fpsMin=33 frame 22.90/28.40/36.90ms sim 0.21/0.28/0.28ms ent 36/25/400
- boss-fight: n=59 fpsMin=38 frame 24.20/29.50/31.10ms sim 0.21/0.26/0.27ms ent 43/23/400
- post-ascension: n=26 fpsMin=36 frame 25.40/33.50/35.90ms sim 0.21/0.25/0.26ms ent 35/22/400
- post-ascension+30s: n=105 fpsMin=40 frame 20.20/33.80/38.80ms sim 0.43/0.53/0.57ms ent 27/9/22
- post-ascension+60s: n=64 fpsMin=45 frame 19.60/29.00/31.20ms sim 0.48/0.55/0.58ms ent 63/18/48
- post-ascension+120s: n=112 fpsMin=43 frame 19.70/27.00/29.30ms sim 0.48/0.60/0.62ms ent 64/26/104

## Assertions / Errors
- failed assertions: 0
- console errors: 0

## Human Ratings (recorded, never inferred)
- not provided

## Human Feedback Marks (optional)
- none pressed (neutral — not positive, not negative)

## Human Comment (optional)

- comment: NOT PROVIDED

## Evidence & Gate Classification

- Machine Telemetry Status: AUTOMATED_CHECKS_PASS
- Human Subjective Evidence: PENDING_HUMAN_PLAYTEST
- Human Fun / Replay Verdict: HUMAN_FUN_PENDING (No automated fun claims allowed)

> RULE: Telemetry describes what happened; only living human players can rate fun and strategic agency.
> A report without genuine human subjective input MUST NOT be labeled as HUMAN_FUN_PASS.

<!-- QA-ENGAGEMENT-END -->

## Historical canonical state — 2026-10-08

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

## 2026-10-11 — competitive-quality execution pass

Starting SHA83a3a2f6943039c6779b261277c3d31371ab9d71, branch feat/civilization-playability-20261011, parent feat/v0261-outpost-softlock-20261008. Initial exact-SHA Actions38131525167 passed4/4 with368 units/57 browser passes/one capture-only skip and two ZIPs. Main remains5e6d5c65ea905bc3859f115e73bfd02913988d45. No merge, tag or release publication.

Preserved the operator's pre-existing generated report/handoff changes, privacy-reviewed sanitized session9bbc4e64c35275c8a56ca785, and ignored raw evidence. The new report has no human ratings/comment; its negative wall duration and save-time-only SHA cannot certify a clean running bundle. Earlier Industrial11:43 and content8 failures remain INTERRUPTED_BY_BUG; HUMAN_FUN_PENDING.

Demonstrated fixes: milliseconds-versus-seconds at QA finalization; build provenance frozen into bundle with dirty/unknown reconciliation at report save; raw Chronicle technology IDs resolved for EN/TH/current graph/fallback with honest old-world label; five English-only map tooltips localized. Added npm run qa alias of the single QA launcher. Canonical simulation, RNG, balance, content9/worldgen2/save1 and existing modal/logistics contracts unchanged. ADR0021 records boundaries.

New quality audit: docs/research/content9-quality-audit-20261011.md (A–L,8 references, real runtime classification, bugsA–J, finite-web limits, pilot/demo/market gates). Historical content8 ledger metrics are explicitly dated. Operator checklist: docs/playtests/CONTENT9_PILOT_CHECKLIST.md. Target-hardware60FPS/render budget remains unverified; observed frame p95=37.41ms is not isolated renderer duration.

Regression-first clock and both EN/TH browser Chronicle tests failed against baseline. Corrected final npm run check passes; detailed logs remain scratch/audit-check-final.log. Initial expanded test run failed because the new unit fixture lacked document; fixture corrected, no assertions removed. Final exact-SHA CI, new browser tests and ZIP validation gate delivery; see Actions on this branch and the final delivery receipt. Human subjective validation remains pending. Next experiments: first-minute comprehension and recognition of actual upgrade effects; no speculative systems or v0.27.

Delivery follow-up: Draft PR#1 is open against the parent softlock branch. Local follow-up375tests and two EN/TH browser regressions passed; packaging/release:verify passed. A final inspection found downloaded raw Markdown omitted bundle provenance although sink JSON/sanitized summaries contained it; added explicit buildSha and startup dirty fields with a focused regression. Final head CI supersedes the first follow-up run38135567502. No subjective verdict inferred.

Ascension review follow-up: canonical IDs can recur across worlds. Chronicle now uses the latest child-root/Ascension history boundary, so older entries never borrow a same-ID node name from the new world. Focused regressions cover ID reuse and FIFO boundary trimming; canonical history stays unchanged. Final head supersedes earlier follow-up CI runs.

CI fixture finding: exact-source push run38136149735 had58browser passes/one capture-only skip/one failure (TH2560×1272 draft absent); parallel PR run38136152333 passed59browser tests. The responsive fixture assumed grant(30) always reaches the next level, despite prior picks, pickups and higher XP thresholds. It now stages the current canonical XP deficit normalized by the build Knowledge multiplier; outpost bonuses can only increase the result. All layout assertions and timeouts remain unchanged; no gameplay or balance change. Final CI must rerun on the corrective head.

## 2026-10-11 — separate Ascension and goal-guidance experiment

Base: clean Content9 a09babd; new branch feat/content9-ascension-guidance-20261011. Existing PR1 stays Draft/unmerged. Raw observed world2 report229 and 452 files preserved privately with hashes BEFORE edits. Negative feedback preserved separately; no end/rating/post120 invented.

Implemented canonical pure path guidance; actual inherited-effect arrival; two child-only research/raid conditions and a shared claim objective; simple EN/TH terms; keyboard choice/modal flow; Chronicle display translations; renderer CPU-submit instrumentation. ADR0022 explains content10/worldgen2/save1 and world-one c9 laws compatibility. First full check passed391tests; final checks/CI still pending at this checkpoint. See content10 audit, terminology guide, recovered human report and ASCENSION_AB_CHECKLIST. Human fun/replay and representative performance remain pending.

Browser regression exposed stale pin header; refreshPinState now updates the live header and progress. Combo goals have native pin controls. Guidance progress traverses owned ancestors too so denominators do not shrink as prerequisites are acquired.

Final browser fixture correction: canonical snapshot.lvl[6] holds offers (lvl[5] is draftOpen). The full map/pin/choice assertions are retained; completing-card checks use the actual pending offer.

Final follow-up: historical EN browser copy assertions updated without reducing behavior/layout checks; broken combo prerequisite alternatives rejected with a regression. Wall-clock frame telemetry replaces Phaser-smoothed delta for measurement only. Targeted browser6/6 PASS; software SwiftShader short-run evidence and reviewed screenshots are in docs/playtests/content10-evidence. Both worlds miss total60FPS target; dense/human hardware certification remains pending. PR2 is Draft against Content9; no merge/tag or PR1 change. Final exact-head CI/artifact receipt is linked from PR2 after publication.

CI follow-up:6fb36f9 PR run38149414529 passed62 browser cases;3 responsive matrix cases still referenced the previous Thai reroll text. Updated that expectation and the intentionally skipped visual-capture selector to the new Thai label. Assertions/layout contracts retained; functional source unchanged. Exact-source final CI pending this test-only commit.

Visual evolution checkpointA: preserved2821 current evidence files before editing; live baseline PR2 remains781687a / green CI. FPS HUD reuses real-frame samples at2Hz and follows the top-left flow. QA launcher uses Node+Vite arguments without Windows shell. Full check394 PASS before the Archive checkpoint. Human completion report297 contains actual child120s and a negative difficulty comment, not a fun certification.

CheckpointB: full check398 PASS. Schema2 migrates existing schema1 without erasing settings/history. Three bounded Archive purchases now have real root-start effects, explicit costs and guarded idempotent settlement; no first-attempt forced loss or hidden difficulty. QA observation completion is not a currency payout. See ADR0023.
