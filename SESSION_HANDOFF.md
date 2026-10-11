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

- sessionId: qa-54140-qfkh03
- reportSequence: 219
- buildSha: a1d74ca28861fe7a4127b36b71a686fb48f623a9
- buildDirty: false
- seed: EPOCH-GOLDEN-001
- origin: hunters
- package: 0.2.0-dev.0 / worldgen 2 / content 11 / save 2
- endReason: target-complete
- wallDuration: 1141.97s
- viewport: 2560x1305 / refresh: ~48Hz

## Route
- [x] run started (0.00s)
- [x] Bronze (116.80s)
- [x] Iron (192.00s)
- [x] Industrial (350.48s)
- [x] Atomic (549.75s)
- [x] Space (697.42s)
- [x] boss spawned (752.73s)
- [x] boss killed (788.57s)
- [x] ascension offered (788.57s)
- [x] ascension started (0.00s)
- [x] child world (0.00s)
- [x] post-ascension +30s (30.47s)
- [x] post-ascension +60s (60.18s)
- [x] post-ascension +120s (120.28s)
- [ ] player died 
- [x] run ended (120.28s)

## Civilization Command Loop Usage

- Tech Map opened: 1
- First Tech Map open: 89.27s sim
- Paths pinned: 2 [resonant-frontier, space-lance]
- Reserve uses: 0 (attempts 0)
- Rerolls: 0 (attempts 0, unavailable 0)
- Skips: 0
- Breakthroughs completed: 2 [fortress, war-machine]

- Territories claimed: 7 [ruin, ruin, ruin, ruin, signal, ruin, ruin] (claim attempts 8)
- First territory time: 70.98s sim
- Outpost types: [Research: 3, Military: 3, Economy: 1]
- Outpost upgrades: 2 (attempts 2)
- Raids incoming: 3
- Raids defended: 1
- Raids lost: 2
- Outposts repaired: 1

- Rally commands (Q): 1
- Focus commands (E): 1
- Hold commands (R): 0
- Origin ability uses (F): 1
- Civ Map opens (M): 3

- Age gate block summary:
  - Stone dwell: 116.80s
  - Bronze dwell: 75.20s
  - Iron dwell: 158.48s
  - Industrial dwell: 199.27s
  - Atomic dwell: 147.67s
  - Space to Boss kill: 91.15s

## Engagement Identity
- @0.00s stone asc 0: origin hunters [field+kinetic] lv1 k0e0d0f0 techs 0 knowledge 0 breakthroughs [-] legacies [-] poi [-]
- @116.80s bronze asc 0: origin hunters [field+kinetic] lv9 k1e1d1f1 techs 12 knowledge 527 breakthroughs [-] legacies [-] poi [meteor+ruin+signal+vault]
- @192.00s iron asc 0: origin hunters [field+kinetic] lv15 k2e2d2f2 techs 18 knowledge 1519 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @350.48s industrial asc 0: origin hunters [field+kinetic] lv20 k3e3d3f3 techs 23 knowledge 2828 breakthroughs [fortress] legacies [-] poi [meteor+ruin+signal+vault]
- @549.75s atomic asc 0: origin hunters [defense+field+kinetic] lv24 k4e4d4f4 techs 27 knowledge 4503 breakthroughs [fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @697.42s space asc 0: origin hunters [defense+field+kinetic] lv28 k5e5d5f5 techs 31 knowledge 6521 breakthroughs [fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @788.57s space asc 0: origin hunters [defense+field+kinetic] lv29 k5e5d5f5 techs 32 knowledge 7254 breakthroughs [fortress+war-machine] legacies [-] poi [meteor+ruin+signal+vault]
- @0.00s stone asc 1: origin engineers [defense+kinetic] lv1 k0e0d0f0 techs 33 knowledge 0 breakthroughs [-] legacies [affinity-kinetic] poi [-]
- @63.05s bronze asc 1: origin engineers [defense+kinetic] lv10 k1e1d1f1 techs 46 knowledge 563 breakthroughs [-] legacies [affinity-kinetic] poi [meteor+ruin+signal+vault]

## Knowledge At Age
- bronze @116.80s (asc 0): 527
- iron @192.00s (asc 0): 1519
- industrial @350.48s (asc 0): 2828
- atomic @549.75s (asc 0): 4503
- space @697.42s (asc 0): 6521
- bronze @63.05s (asc 1): 563

## Sim Decisions (ordered)
- [dominion] 0/0 @0.93s stone asc 0
- [mission_complete] bronze @8.93s stone asc 0
- [poi-major] meteor @9.97s stone asc 0
- [site_prompt] CONTESTED:meteor @10.00s stone asc 0
- [focus] poi-982d6fd4--2-0-0 @10.00s stone asc 0
- [tech] application-kinetic-0 @10.00s stone asc 0
- [poi_discovered] meteor:+33 @11.37s stone asc 0
- [site_prompt] CLAIMABLE:meteor @11.38s stone asc 0
- [focus] poi-982d6fd4--3-0-0 @11.38s stone asc 0
- [tech] application-field-0 @11.38s stone asc 0
- [tech] stone-trap @11.38s stone asc 0
- [poi-major] ruin @14.48s stone asc 0
- [site_prompt] CONTESTED:ruin @14.50s stone asc 0
- [focus] poi-982d6fd4--4-0-0 @14.50s stone asc 0
- [tech] stone-totem @14.50s stone asc 0
- [focus] poi-982d6fd4--3-0-0 @18.77s stone asc 0
- [focus] poi-982d6fd4--4-0-0 @19.92s stone asc 0
- [poi_discovered] meteor:+33 @19.97s stone asc 0
- [site_prompt] CONTESTED:meteor @19.98s stone asc 0
- [focus] poi-982d6fd4--5--1-0 @19.98s stone asc 0
- [tech] web:application-kinetic-0:0 @19.98s stone asc 0
- [poi_discovered] ruin:+27 @21.27s stone asc 0
- [site_prompt] CONTESTED:ruin @22.17s stone asc 0
- [focus] poi-982d6fd4--4--2-0 @22.17s stone asc 0
- [tech] web:stone-totem:0 @31.58s stone asc 0
- [poi-major] signal @33.33s stone asc 0
- [site_prompt] CONTESTED:signal @33.37s stone asc 0
- [focus] poi-982d6fd4--5--2-0 @33.37s stone asc 0
- [tech] application-field-1 @33.37s stone asc 0
- [focus] poi-982d6fd4--5--1-0 @35.87s stone asc 0
- [focus] poi-982d6fd4--4-0-0 @38.10s stone asc 0
- [poi_discovered] signal:+59 @57.35s stone asc 0
- [site_prompt] CONTESTED:signal @57.37s stone asc 0
- [focus] poi-982d6fd4--3-2-0 @57.37s stone asc 0
- [tech] application-kinetic-1 @57.37s stone asc 0
- [poi_discovered] ruin:+29 @59.75s stone asc 0
- [site_prompt] CONTESTED:ruin @59.78s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @59.78s stone asc 0
- [tech] web:application-field-0:1 @59.78s stone asc 0
- [focus] poi-982d6fd4--3-2-0 @65.52s stone asc 0
- [focus] poi-982d6fd4--3-0-0 @68.87s stone asc 0
- [focus] poi-982d6fd4--4-0-0 @70.00s stone asc 0
- [claim_attempt] poi-982d6fd4--4-0-0 @70.98s stone asc 0
- [territory_claimed] poi-982d6fd4--4-0-0:ruin @70.98s stone asc 0
- [focus] poi-982d6fd4--3-0-0 @70.98s stone asc 0
- [first_claim] 71.0s @70.98s stone asc 0
- [dominion] 1/0 @70.98s stone asc 0
- [outpost_spec] poi-982d6fd4--4-0-0:economy @70.98s stone asc 0
- [focus] poi-982d6fd4--5--1-0 @72.80s stone asc 0
- [focus] poi-982d6fd4--4--2-0 @76.15s stone asc 0
- [focus] poi-982d6fd4--5--1-0 @78.45s stone asc 0
- [focus] poi-982d6fd4--3-0-0 @79.55s stone asc 0
- [focus] poi-982d6fd4--2-0-0 @82.90s stone asc 0
- [tech] web:stone-totem:1 @83.03s stone asc 0
- [poi-major] vault @87.80s stone asc 0
- [site_prompt] CONTESTED:vault @87.82s stone asc 0
- [focus] poi-982d6fd4--1-2-0 @87.82s stone asc 0
- [tech] web:web:stone-totem:1:0 @87.82s stone asc 0
- [techmap_open] open @89.27s stone asc 0
- [pin] resonant-frontier @89.27s stone asc 0
- [pin] space-lance @89.27s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @90.32s stone asc 0
- [poi_discovered] signal:+59 @98.18s stone asc 0
- [site_prompt] CONTESTED:signal @98.18s stone asc 0
- [focus] poi-982d6fd4-0-3-0 @98.18s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @102.73s stone asc 0
- [tech] web:web:stone-totem:0:1 @103.25s stone asc 0
- [focus] poi-982d6fd4--3-2-0 @105.28s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @110.98s stone asc 0
- [focus] poi-982d6fd4-0-3-0 @113.25s stone asc 0
- [focus] poi-982d6fd4--2-2-0 @114.37s stone asc 0
- [poi_discovered] vault:+47 @116.75s stone asc 0
- [age_reached] bronze @116.77s stone asc 0
- [site_prompt] CONTESTED:vault @116.80s bronze asc 0
- [focus] poi-982d6fd4--2-4-0 @116.80s bronze asc 0
- [focus] poi-982d6fd4--2-2-0 @122.40s bronze asc 0
- [focus] poi-982d6fd4--1-2-0 @124.70s bronze asc 0
- [focus] poi-982d6fd4--2-2-0 @126.98s bronze asc 0
- [focus] poi-982d6fd4--3-2-0 @129.28s bronze asc 0
- [focus] poi-982d6fd4--3-0-0 @131.20s bronze asc 0
- [tech] web:application-kinetic-1:1 @131.20s bronze asc 0
- [focus] poi-982d6fd4--2-0-0 @139.55s bronze asc 0
- [mission_complete] iron @139.67s bronze asc 0
- [poi_discovered] vault:+47 @146.07s bronze asc 0
- [site_prompt] CONTESTED:vault @146.38s bronze asc 0
- [focus] poi-982d6fd4-0--2-0 @146.38s bronze asc 0
- [poi_discovered] meteor:+35 @147.95s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @148.65s bronze asc 0
- [focus] poi-982d6fd4-1--2-0 @148.65s bronze asc 0
- [focus] poi-982d6fd4-0--2-0 @149.77s bronze asc 0
- [poi_discovered] vault:+47 @149.80s bronze asc 0
- [site_prompt] CONTESTED:vault @149.82s bronze asc 0
- [focus] poi-982d6fd4-2--2-0 @149.82s bronze asc 0
- [tech] web:web:stone-totem:1:1 @149.82s bronze asc 0
- [poi_discovered] vault:+47 @151.65s bronze asc 0
- [site_prompt] CONTESTED:vault @151.72s bronze asc 0
- [focus] poi-982d6fd4-3--2-0 @151.72s bronze asc 0
- [focus] poi-982d6fd4-2--2-0 @153.97s bronze asc 0
- [poi_discovered] vault:+47 @154.08s bronze asc 0
- [site_prompt] CLAIMABLE:vault @155.13s bronze asc 0
- [focus] poi-982d6fd4-4--2-0 @155.13s bronze asc 0
- [poi_discovered] vault:+47 @155.48s bronze asc 0
- [site_prompt] CONTESTED:vault @155.50s bronze asc 0
- [tech] bronze-armor @155.50s bronze asc 0
- [breakthrough] fortress @155.50s bronze asc 0
- [poi_discovered] signal:+59 @156.60s bronze asc 0
- [site_prompt] CLAIMABLE:signal @157.12s bronze asc 0
- [focus] poi-982d6fd4-5--3-0 @157.12s bronze asc 0
- [poi_discovered] ruin:+29 @159.37s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @160.50s bronze asc 0
- [focus] poi-982d6fd4-6--4-0 @160.50s bronze asc 0
- [focus] poi-982d6fd4-5--2-0 @161.65s bronze asc 0
- [focus] poi-982d6fd4-6--4-0 @163.92s bronze asc 0
- [poi_discovered] vault:+47 @164.67s bronze asc 0
- [site_prompt] CONTESTED:vault @165.07s bronze asc 0
- [focus] poi-982d6fd4-6--1-0 @165.07s bronze asc 0
- [focus] poi-982d6fd4-5--3-0 @166.18s bronze asc 0
- [poi_discovered] ruin:+29 @166.55s bronze asc 0
- [site_prompt] CLAIMABLE:ruin @166.57s bronze asc 0
- [focus] poi-982d6fd4-7-0-0 @166.57s bronze asc 0
- [tech] web:web:application-field-0:1:1 @166.57s bronze asc 0
- [focus] poi-982d6fd4-6--1-0 @168.32s bronze asc 0
- [poi_discovered] signal:+59 @168.58s bronze asc 0
- [site_prompt] CLAIMABLE:signal @169.47s bronze asc 0
- [focus] poi-982d6fd4-8-0-0 @169.47s bronze asc 0
- [poi_discovered] vault:+47 @169.98s bronze asc 0
- [site_prompt] CLAIMABLE:vault @170.62s bronze asc 0
- [focus] poi-982d6fd4-8--1-0 @170.62s bronze asc 0
- [focus] poi-982d6fd4-7-0-0 @171.80s bronze asc 0
- [focus] poi-982d6fd4-6--1-0 @174.08s bronze asc 0
- [focus] poi-982d6fd4-7-0-0 @175.20s bronze asc 0
- [poi_discovered] meteor:+35 @175.95s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @176.33s bronze asc 0
- [focus] poi-982d6fd4-5-1-0 @176.33s bronze asc 0
- [focus] poi-982d6fd4-7-0-0 @177.48s bronze asc 0
- [poi_discovered] meteor:+35 @178.32s bronze asc 0
- [site_prompt] CONTESTED:meteor @178.33s bronze asc 0
- [focus] poi-982d6fd4-5-2-0 @178.33s bronze asc 0
- [tech] web:bronze-armor:1 @178.33s bronze asc 0
- [poi_discovered] vault:+47 @180.47s bronze asc 0
- [site_prompt] CONTESTED:vault @180.97s bronze asc 0
- [focus] poi-982d6fd4-5-3-0 @180.97s bronze asc 0
- [poi_discovered] signal:+59 @182.50s bronze asc 0
- [site_prompt] CONTESTED:signal @183.32s bronze asc 0
- [focus] poi-982d6fd4-6-2-0 @183.32s bronze asc 0
- [poi_discovered] signal:+59 @185.22s bronze asc 0
- [site_prompt] CONTESTED:signal @185.62s bronze asc 0
- [focus] poi-982d6fd4-7-2-0 @185.62s bronze asc 0
- [poi_discovered] meteor:+35 @187.80s bronze asc 0
- [site_prompt] CLAIMABLE:meteor @187.98s bronze asc 0
- [focus] poi-982d6fd4-8-3-0 @187.98s bronze asc 0
- [poi_discovered] ruin:+29 @189.45s bronze asc 0
- [site_prompt] CONTESTED:ruin @189.48s bronze asc 0
- [focus] poi-982d6fd4-8-4-0 @189.48s bronze asc 0
- [tech] web:web:web:stone-totem:1:0:0 @189.48s bronze asc 0
- [focus] poi-982d6fd4-7-2-0 @190.85s bronze asc 0
- [poi_discovered] vault:+47 @191.93s bronze asc 0
- [age_reached] iron @191.97s bronze asc 0
- [site_prompt] CONTESTED:vault @192.00s iron asc 0
- [focus] poi-982d6fd4-7-4-0 @192.00s iron asc 0
- [mission_complete] industrial @192.13s iron asc 0
- [poi_discovered] signal:+59 @193.40s iron asc 0
- [site_prompt] CONTESTED:signal @193.57s iron asc 0
- [focus] poi-982d6fd4-7-5-0 @193.57s iron asc 0
- [poi_discovered] ruin:+29 @196.27s iron asc 0
- [site_prompt] CLAIMABLE:ruin @197.07s iron asc 0
- [focus] poi-982d6fd4-6-6-0 @197.07s iron asc 0
- [focus] poi-982d6fd4-7-5-0 @198.22s iron asc 0
- [poi_discovered] meteor:+35 @198.47s iron asc 0
- [site_prompt] CLAIMABLE:meteor @199.40s iron asc 0
- [focus] poi-982d6fd4-6-5-0 @199.40s iron asc 0
- [focus] poi-982d6fd4-5-3-0 @200.55s iron asc 0
- [focus] poi-982d6fd4-5-2-0 @205.18s iron asc 0
- [poi_discovered] vault:+47 @209.80s iron asc 0
- [site_prompt] CONTESTED:vault @209.83s iron asc 0
- [focus] poi-982d6fd4-2-2-0 @209.83s iron asc 0
- [tech] iron-fort @209.83s iron asc 0
- [focus] poi-982d6fd4-5-2-0 @211.87s iron asc 0
- [focus] poi-982d6fd4--1-2-0 @213.05s iron asc 0
- [focus] poi-982d6fd4-2-2-0 @214.18s iron asc 0
- [focus] poi-982d6fd4--1-2-0 @215.30s iron asc 0
- [focus] poi-982d6fd4--2-0-0 @216.45s iron asc 0
- [focus] poi-982d6fd4--3-0-0 @217.58s iron asc 0
- [focus] poi-982d6fd4--2-0-0 @218.80s iron asc 0
- [focus] poi-982d6fd4--3-0-0 @221.13s iron asc 0
- [focus] dominion @223.50s iron asc 0
- [focus] poi-982d6fd4--3-0-0 @224.65s iron asc 0
- [focus] poi-982d6fd4--3-2-0 @229.30s iron asc 0
- [focus] poi-982d6fd4--2-4-0 @235.12s iron asc 0
- [focus] poi-982d6fd4-0-3-0 @237.38s iron asc 0
- [focus] poi-982d6fd4--2-4-0 @238.55s iron asc 0
- [focus] poi-982d6fd4--2-2-0 @240.88s iron asc 0
- [focus] poi-982d6fd4--2-4-0 @242.05s iron asc 0
- [poi_discovered] meteor:+35 @246.02s iron asc 0
- [site_prompt] CLAIMABLE:meteor @246.55s iron asc 0
- [focus] poi-982d6fd4--2-5-0 @246.55s iron asc 0
- [focus] poi-982d6fd4--2-4-0 @247.70s iron asc 0
- [poi_discovered] signal:+59 @248.72s iron asc 0
- [site_prompt] CLAIMABLE:signal @248.73s iron asc 0
- [focus] poi-982d6fd4--3-6-0 @248.73s iron asc 0

## Performance Summary
- bronze: n=236 fpsMin=26 frame 24.70/39.50/45.20ms sim 0.38/0.58/0.76ms ent 15/10/72
- iron: n=121 fpsMin=28 frame 26.40/40.50/91.50ms sim 0.35/0.45/0.52ms ent 20/19/141
- industrial: n=210 fpsMin=28 frame 26.00/39.50/47.30ms sim 0.42/0.54/0.63ms ent 25/29/256
- atomic: n=254 fpsMin=27 frame 29.40/40.30/49.70ms sim 0.31/0.47/0.48ms ent 59/42/400
- space: n=149 fpsMin=21 frame 35.90/52.60/62.10ms sim 0.25/0.36/0.43ms ent 62/38/400
- boss-spawn: n=63 fpsMin=28 frame 29.60/40.40/42.00ms sim 0.32/0.45/0.48ms ent 48/26/400
- boss-fight: n=40 fpsMin=28 frame 32.10/43.00/65.60ms sim 0.36/0.44/0.44ms ent 61/19/400
- post-ascension: n=28 fpsMin=25 frame 33.20/46.30/61.00ms sim 0.33/0.37/0.38ms ent 54/12/400
- post-ascension+30s: n=69 fpsMin=32 frame 28.60/46.60/61.60ms sim 0.51/0.66/0.82ms ent 30/12/17
- post-ascension+60s: n=43 fpsMin=40 frame 25.00/43.80/53.50ms sim 0.45/0.58/0.62ms ent 48/17/46
- post-ascension+120s: n=92 fpsMin=26 frame 28.50/46.00/74.40ms sim 0.45/0.66/0.72ms ent 56/37/91
- end: n=1 fpsMin=46 frame 28.10/28.10/28.10ms sim 0.38/0.38/0.38ms ent 28/13/78

## Assertions / Errors
- failed assertions: 0
- console errors: 0

## Human Ratings (recorded, never inferred)
- not provided

## Human Feedback Marks (optional)
- none pressed (neutral — not positive, not negative)

## Human Comment (optional)

- comment: "รบเปลี่ยนโล่เป็นดาบรูป"

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
