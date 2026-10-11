# Human-observed playability incidents — 2026-10-11

Status: **INTERRUPTED_BY_BUG**. No HUMAN_FUN_PASS or clean replay verdict.

Reproduction source: user screenshots and direct report, seed EPOCH-GOLDEN-001.
The inspected pre-change private human telemetry report records build d3814a6b7e94182a05be66e341eb36c0914eabc0,
content 8, clean build. Telemetry lacks a final reason/rating and its simulation
marks stop much earlier than the screenshots. Therefore it does not independently
prove the late-run state; the screenshots supply that evidence.

| Evidence | Observation | Verified boundary |
|---|---|---|
| [Gameplay](evidence/20261011/gameplay.png) | Iron 6:55, Knowledge 2781/2800 | Remaining Knowledge is visible; squad 6/6 is not itself a logistics reading |
| [Pause](evidence/20261011/pause.png) | Narrow panel and unnecessary desktop scrolling | Presentation defect |
| [Logistics](evidence/20261011/logistics.png) | Industrial 8:24, Logistics 6/6, all choices disabled | Later/Esc is present; distinct from the old mandatory-modal softlock |
| [Draft](evidence/20261011/draft.png) | 8:26, one narrow card column, QUALITY.COMMON | Responsive/localization defect; user additionally reports exhausted reroll |

The logistics screenshot also shows Knowledge 3743/4500 and an incomplete
T2-upgrade mission. Atomic requires one upgraded outpost; full logistics
rejects the necessary +1 upgrade. Thus capacity genuinely obstructs this
mission, while Knowledge is also still below its independent threshold.
Canonical code separately confirmed silent upgrade rejection: UI tested Knowledge
while the mutation also required extra logistics. Free claims remain intentional.

Raw reports are kept private in test-results/human-playtests and backed up with
hashes under ignored scratch/human-evidence-20261011. Playwright output now lives
in test-results/browser so running it cannot delete the human archive. Original
screenshot hashes are recorded beside the evidence. Do not overwrite the older
11:43 softlock incident with this different observation.

Post-fix retest must start a new run from the final CI-verified SHA. Check Thai
and English pause/draft at 1280×720 and 1920×1080; compare card effects with the
visible change after selection. Reach full logistics, defer an unaffordable
specialization, open Civilization Map [M], cancel then confirm a reallocation,
and specialize/upgrade using the returned capacity. Land must stay claimed;
HP and Knowledge must not be refunded. The first Signal exception remains
one-time. Verify all missing age conditions explicitly before expecting age-up.

Compare research/supply outcomes at different biomes, inspect the four technology
domains [T], and test reroll/reserve/pin through multiple age transitions. Record
the first confusing choice and any forced workaround. Ask the player for a real
replay/fun verdict only after a complete uninterrupted run.

## Synthetic post-fix evidence

These are browser-staged working-tree checks, not a new human session or a fun rating. Original human evidence above remains INTERRUPTED_BY_BUG. The final exact-SHA CI must separately verify the complete suite.

- [Thai pause](evidence/20261011/postfix-pause-responsive-th.png) and [three-card draft](evidence/20261011/postfix-draft-responsive-th.png): desktop bounds, Thai font and quality/effect labels inspected.
- [Mobile draft](evidence/20261011/postfix-draft-mobile-th.png), [200% draft](evidence/20261011/postfix-draft-200-th.png): scrollable body, reachable persistent actions, no horizontal overflow.
- [Radial center](evidence/20261011/postfix-radial-current-th.png), [overview](evidence/20261011/postfix-radial-overview-th.png), [mobile map](evidence/20261011/postfix-radial-mobile-th.png): four sectors, actual graph visible on first open; pan/zoom remains available.

Hashes are in postfix-sha256.json. Regression covers map focus after terminal fallback rewards. Panzoom initial-reset race was discovered by visual inspection and then caught by a visible-node assertion; setting initial pan and later focus from the same frame fixes it.
