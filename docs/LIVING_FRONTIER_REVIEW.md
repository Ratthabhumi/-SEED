# Living Frontier review checkpoint
Base: PR2 head781687a. Separate feature branch; no main/PR1/PR2 merge, tag, release or dependency update.

| Area | Delivered evidence | Remaining gate |
|---|---|---|
| A: FPS | Wall-clock frame median; top-left18px EN/TH, one HUD across restart/Ascension; argument-array QA launcher | Real target-hardware dense workload |
| B: Attempts / Archive | Schema2 migration; idempotent defeat/victory settlement; three bounded optional purchases; Attempt separate from World; explicit Chronicle → Archive | Fresh human defeat/retry feedback |
| C: Art | Original MIT scout/mite/observatory SVG family, manifest hashes and bundled license; style board; bounded pools | Working prototype; human readability/style review before expanding art families |
| D: Terrain / sites | Seed-stable passable Verdant grass/worn ground; exact pre-claim biome bonus, hostile count, direct distance and capacity cost | Physical obstacles deferred until canonical navigation/reachability exists |
| E: Behaviors / fusion | Energy chains across projectile/aura/beam; operational base pulses; fusion requires acquired Conduction+Relay; real before/after preview | Human build preference/balance |
| F: Feedback | Bounded energy links, max16 ornamental VFX sprites,24 bursts; Reduced Effects, Shake; eight audio voices with throttle and gain ceiling | Hardware audio/visual fatigue review |
| G: Validation | Canonical/unit, EN/TH browser, policy cohort, exact report-identity audit, screenshot captures | No automated HUMAN_FUN_PASS |
| H: Delivery | Focused commits and new Draft PR targeting PR2 head | Exact pushed-SHA4/4 and two ZIP artifacts must pass before new clean pilot |

## Measurements and limits
See playtests/frontier-performance-sanitized.json. Sparse1920×1080 software-rendered parent: frame p50/p95/p99=75.7/87.8/94.4ms; sim=0.1/0.4/2.7ms; renderer CPU submission=5.2/7.6/8.5ms; 8 scene objects. Child: frame p50/p95/p99=79.9/100.6/104.7ms; sim=0/0.2/0.3ms; renderer CPU submission=6.1/9.1/15.9ms; 13 scene objects. 69/59 frame samples. Scene count varies with visible pooled landmarks/enemies. These are short measurements, not GPU completion or dense stress certification. Prior sparse trace from the preceding Content10 audit measured frame parent p95=68.9ms, child65.3ms; workload and timing differ, so no causal improvement claim. Frame target60FPS remains unmet on this local software renderer; budgets are not relaxed.

Four synthetic policies × two seeds, max900 simulated seconds, no grants, teleports, health changes or Archive perks: one real canonical boss victory (planner, FRONTIER-POLICY-002,409.05s), five defeats, two time limits. Golden-seed planner dies at717.30s; golden explorer reaches Industrial but stalls. The victorious planner reserves upgrade capacity and defends raids; acquisitions and damage remain canonical. This cohort does not establish human win rate or boss fairness. eligibleInsight is a derived settlement estimate; persistedInsight=0 for synthetic runs. Actual currency and purchase persistence are checked separately by ledger and browser regressions. See playtests/frontier-policy-sanitized.json.

## Fresh human pilot after green CI
1. Start without Archive perks. Observe Attempt1 / World1, choose a site using its actual bonus/cost, and explain an acquired tech combination.
2. On natural defeat, read earned Insight and Return to Archive. Buy only an available option; verify an actual benefit in Attempt2. First attempts remain winnable without purchases.
3. If a boss is defeated, either Ascend into World2 or use Pause → Finish victorious attempt. Neither path fabricates a death; only terminal completion settles currency once.
4. Check Thai100/125/150/200%, keyboard navigation, Reduced Effects, shake/audio, clear warning/projectile silhouettes and dense FPS on actual hardware.
5. Record direct answers: what felt good/unfair, which upgrade excited you, whether the world felt alive, where to build, whether you want another attempt. No inferred ratings or HUMAN_FUN_PASS.

Screenshots from actual browser tests: test-results/browser/evolution-pause-100-en.png, evolution-pause-100-th.png, evolution-pause-en.png, evolution-pause-th.png, evolution-world-en.png, evolution-world-th.png and evolution-child.png. Captures include staged E2E flows; human session evidence remains separately preserved. Three-column desktop pause folds optional world traits; small/200% views use safe scrolling.

## Research boundary
No new market research was performed per the user's instruction. Retain docs/research/market-and-quality-20261011.md as the existing benchmark input, with its verification boundaries. Further market research is delegated by the user to ChatGPT. Do not convert an input recommendation into a verified-current market claim.
