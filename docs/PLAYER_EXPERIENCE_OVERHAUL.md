# Player experience and visual production overhaul

Start: PR18 cf5aaf69277c992ca964ab25ac679d9750fdad0d, fetched and verified open
Draft. Branch feat/player-experience-visual-overhaul-20261016 stacks on it.
Main and prior PR targets are unchanged. Worldgen3 / Content18 / Save2.

## Delivered for review

1. Original editable articulated Boss, not an upscale of128px painted cells.
2. Continuous canonical-time joint motion and pooled articulated defeat.
3. Flowing boss HP/stats/phase lane and notification clearance at200%.
4. Fix discovered POI hidden by unexplored adjacent-chunk visibility guard.
5. Native POI pixel-difference regression, with negative undiscovered case.
6. Optional floating primary weapon comparison with unchanged simulation.
7. Preserve the newly completed real PR18 session and pending human ratings.

Source/provenance: assets/original/actors/boss-rig.svg, boss-rig.json,
boss-rig-density.json, boss-rig-export.png; assets/ASSET_MANIFEST.json.
Reproduce vector export with `node scripts/export-boss-rig.mjs`, then
`node scripts/measure-boss-density.mjs` and
`node scripts/register-boss-rig.mjs`. Runtime rasterizes original SVG via
Phaser's loader, then slices256px joint cells. No new dependencies.

## Real human evidence retained, not promoted to approval

Sanitized session6666c57f3b1bc2cfd78a175a: clean cf5aaf6, Hunters,
EPOCH-GOLDEN-001. Space686.38s; Boss killed827.72s; child world reached,
played120.12s. No assertion/console errors. No subjective ratings/comments.
This establishes an observed natural route on PR18, not acceptance of this
new art or HUMAN_FUN_PASS. Sparse frame telemetry has high tail latency;
do not infer its root cause from lifetime terrain maxima. Raw QA stays private.

## Ledger delta — original31 identities retained

Append this review to docs/CONTENT17_HUMAN_ISSUES.md; do not reset the ledger.
Boss31/17/28: original rig and HUD implemented, human visual acceptance OPEN.
POI10/23/30: one actual border-visibility defect fixed with native pixel test;
other arrival/camera/worker cases still require their existing/final evidence.
Input24/26: preserve current fix and re-run physical key tests; no speculative
input rewrite. Hierarchy2/3/7/8/12/15/25/27: quantify this boss/source change
and actual mount comparison; do not claim all actors are newly animated.
Performance remains OPEN until final measurements; do not hide budget failures.

## Manual review on the new exact build

Run `npm run qa:human`; open http://localhost:5173/?qa=1 . Start a fresh
natural run and preserve the exact build stamp in its report. Test hand mount
first; compare http://localhost:5173/?qa=1&equipment=float in a separate run.
Try all movement directions, turns, firing, dash, F ability; verify the tether
does not suggest shots originate from the floating item. Inspect Stone and
Space and the child world's reset. Don't count test hooks as natural play.

At Boss, check the crisp crown/heart/limbs, walking, breathing, every pattern's
windup/release/recovery, phase2, hits and articulated defeat. Pause mid-motion,
resume, then restart; no frozen leftover plates should remain. At720/1080,
EN/TH and200%, stats/HP/phase/notifications must be separately readable.
Walk along newly explored chunk edges and revisit a discovered site; no
reward-before-landmark delay or premature distant reveal should occur.

Hold movement and Space through a level-up: repeat Space, release Space,
release movement, explicitly select a technology, then resume. Repeat with
Tab/focus/blur and a fresh Enter. Report any unintended selection or movement.

Record genuine ratings: Boss threat/readability/motion/art, hand versus float,
POI visibility, input trust, World2 interest, fun/replay and frame smoothness.
On any blocker mark INTERRUPTED_BY_BUG. No HUMAN_FUN_PASS without actual input.

## Research handoff, no additional market research performed

Ask ChatGPT/artist to compare this native original vector rig with a cohesive
painted layered production target at actual game scale. Needed: acceptable
shape/material style for crown/armor/hero/enemy families, minimum occupied
pixels per displayed role, artist-owned layered anatomy and timelines for
remaining hero/hostile actions, and a human preference result for the optional
floating mount. Existing flattened hero PNGs still do not contain real limbs.
Use screenshots/videos and exact-SHA receipts; do not infer animation quality
from test counts or pick a direction only because a rival game uses it.
