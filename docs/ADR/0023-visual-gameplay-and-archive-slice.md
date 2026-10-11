# ADR0023 — Living frontier and bounded attempt Archive

User-authorized visual/gameplay experiment from781687a. No forced first loss or attempt-dependent threat multiplier. Attempt is independent of child World; Archive persists across attempts, inherited Legacy only across surviving child transitions.

Schema2 migrates schema1 under the existing storage key, preserving settings, legacy archive identifiers, best and history. New currency starts at zero; old runs do not receive retrospective rewards. Three one-time purchases:3 Insight for root-start+15HP;5 for an optional extra energy core when Origin lacks energy;4 for one extra Stone-age redraw. No repeated power purchases or grind gate. Effects reset on Ascension with the other root equipment; Origin threat/abilities unchanged.

Terminal payout is1 + min(5,full run minutes) + min(5,highest age index) +2 if a boss was actually defeated, maximum13. QA target completion is observation completion, not an attempt reward. Production test staging (?e2e) earns zero currency. Each freshly created attempt reserves a monotonically increasing persisted serial; terminal settlement accepts only an issued serial newer than lastSettled. All repeated/stale settlements fail closed, including after reload. Single active attempt is the supported local game model; out-of-order tab settlements are not a multiplayer economy. Quota failures are visible and never described as persisted progress.

World collision/pathfinding is unchanged. Original vector/code-native decorative art is reviewed as a working vertical slice, not full asset production. Never introduce implied collision, copy commercial assets, or spend canonical RNG on cosmetic layout. Existing budgets remain acceptance targets, not certified60FPS.
