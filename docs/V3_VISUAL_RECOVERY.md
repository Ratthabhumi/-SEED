# V3 painted visual recovery — 22 October 2026

Parent: PR19 `9b5c1facd4bbab891b452051b392e5e460c76353`, fetched and
verified open Draft on PR18. No merge, retarget, release or canonical change.
One continuation branch: `feat/v3-painted-recovery-20261022`.

## Authoritative human feedback

Owner feedback supplied with this task: **PR19 BOSS ART REJECTED BY PLAYER**;
the articulated vector replacement looks worse and inconsistent with the game.
This supersedes its pending art gate, not the proven HUD/POI/lifecycle fixes.
Preserve the rejected source and opt-in laboratory, never use it as production
art by default. No test count can override this verdict.

New real session `bc09b0feacda5bd6398be905` is retained unchanged: clean PR19,
Hunters/EPOCH-GOLDEN-001, Boss540.23→595.13s (54.90s), child+120.07s,
no console/assertion errors. Its telemetry contains no subjective ratings.
The owner's art rejection is separate direct feedback; fun remains pending.
Different builds/choices/routes in prior human sessions are not controlled A/B.

## Visual target extracted from actual sources

The legacy boss is a massive **lava-rock golem**, not violet plate armor.
Keep its broad hunched silhouette, irregular black basalt/cracked orange core,
craggy asymmetric shoulders and small bright eye/heart accents. Other enemies
use textured painted materials with dark grounding edges, not clean vector
outlines. Use warm ember highlights against cool/dark ground, a roughly
three-quarter upright view with feet anchored at the same contact line.
Light belongs on raised rock edges and in cracks; avoid a flat uniform fill.
The crown-like dorsal rocks and stone fists must survive native game scale.

The unchanged original `assets/original/actors/boss-v2.png` is the selected
source. Its eight128px cells and measured occupied88–98×60–99px bounds remain
limitations; a transform is not new painted anatomy. No generated sprite grid,
invented hidden limbs, new dependency or art license is introduced.

## Implemented scope

- Default: one painted boss Image; rejected3MiB SVG texture not loaded.
- Existing real windup/impact/fan/hit/defeat cells; impact stops after .32s
  into recovery so the canonical punish window reads as rest. Subtle whole-body
  secondary motion samples canonical time; Reduced Effects suppresses it.
- Death uses the actual painted defeat cell with bounded fade, cleared on
  world change/restart. No animation callback owns canonical rules.
- `bossArt=baseline` reproduces the old frame selector for matched comparison;
  `bossArt=rig` preserves the rejected PR19 laboratory and its regressions.
- Existing painted enemy darts/bolts/fan assets retained. High Contrast and
  Canvas fallback now distinguish narrow dart, heavy bolt and forked boss fan
  by silhouette, sharing the exact same velocity-space paths across backends.
  Collision radius, damage, spawn point, speed and source remain unchanged.
- Optional float primary now holds a shoulder station with2u hover instead
  of circling through the body. Reduced Effects stops hover. Hand remains
  default because no human preference authorizes a production switch.
- HUD/notifications, ResizeObserver cleanup, canonical POI border fix, inputs,
  age equipment and existing terrain/camera systems retained.

## Combat evidence and balance decision

Phase2 threshold is50% HP, transition .4s; committed attacks finish their full
1.4–1.85s recovery before escalation. Phase1 alternates Slam/Fan; phase2 adds
Cross with1.1s approach cooldown and unchanged generous warnings. Lethal damage
stays lethal. PR19 native CI trajectories included both phase2 exposure and
death before phase2; Natural36 contains unreached/lost cases. A54.90s human
kill alone does not establish weak balance or single-phase behavior.
Do not inflate HP, add immunity or rewrite controllers to force a phase.
Visual recovery is changed; canonical pacing is retained pending a timed
human phase-exposure/DPS trace. Historical Natural36 evidence stays intact.

## Research application status

|Area|Status|Decision|
|--|--|--|
|Seed/world laws/save/culling/enemy batching|APPLIED|Retain existing contracts|
|Prepared terrain, camera and input boundaries|APPLIED|No demonstrated new defect to justify replacement|
|HUD, POI border discovery, canonical-time motion|APPLIED|Keep independent engineering fixes|
|Painted atlas/import pipeline and six age equipment|PARTIAL|Existing frames reused; no complete authored motion family|
|PR19 flat vector boss production direction|REJECTED|Owner rejection; opt-in historical comparison only|
|Previous ground-cache prototypes / random walk grids|REJECTED|No new hypothesis; do not repeat|
|Authentic painted cutout/cel source|NOT IMPLEMENTED|Needs artist-owned layered anatomy and real turn/attack drawings|
|Boss pacing redesign|NOT IMPLEMENTED|Need natural phase/DPS/damage trace, not arbitrary HP changes|
|All31 human complaints closed|NOT IMPLEMENTED|Acceptance remains per issue|

ChatGPT/artist handoff: use native legacy/current/candidate captures to specify
a higher-resolution lava-golem cel/cutout source preserving the above silhouette,
material/light/view and occupied-pixel targets. Supply actual layered files,
authored turns, attacks, death and timeline exports compatible with the current
atlas pipeline. Separately assess phase2 exposure using natural Hunters DPS/
phase timing, and attribute remaining1080p High Contrast CPU/GPU cost without
reducing density, warnings or8ms/4ms budgets. No market survey needed.

## Validation / QA

Early comparison captures precede the full browser/performance campaign;
comparison metadata labels actual official parents versus same-build old-frame
selector. They are staged native evidence, never a new human art approval.
Final exact-SHA checks/CI/performance receipts belong in this Draft PR.
The historical PR19 physical22/24 result retains its original identity; two
1080p HC failures10.3/9.3ms must not be relabeled as fixed by a new boss.

Development attempts retained: first new motion test caught recovery overriding
the hit cell (1failed/526passed); fixed hit priority, focused4/4PASS. Initial
comparison wrongly required equal entire startup canonical histories; those
contain different real-time boot steps/RNG consumption. No balance changed:
set the existing arena fixture clock and compare actual boss/encounter fields,
viewport, zoom and camera; retain full histories and explicitly disclose their
inequality. Corrected early comparison passed on actual official PR18/PR19 ZIPs
and the dirty candidate before the full browser campaign. Its PNGs/clips are
development evidence; final CI reruns the same comparison with clean stamps.
Initial focused native suite19PASS/5FAIL: all five new painted tests incorrectly
expected string frame IDs while Phaser returns numeric IDs; compare numeric
frame values without changing the texture/frame or encounter assertions.
Next sampling attempt hit .3167s of recovery at2.0s because phase changes
consume whole simulation ticks; the .32s impact hold was correctly still active.
Sample at2.15s to verify the subsequent rest cell, retaining the real timing.
Manifest transition initially exposed2test failures: one still expected the
old pending verdict; another incorrectly classified original unmodified SVG
as a resized raster. Keep source hash/modified expectations intact and change
only this asset's verdict to the owner's rejection. No tests were removed.

Run `npm run qa:human`, open `http://localhost:5173/?qa=1`, start a fresh natural
Hunters run. Inspect the painted boss, windup→impact→rest, phase2 and actual
damage counterplay; pause/resume and restart. Continue through World2+120s.
At720/1080 EN/TH200% verify stats/HP/phase/notifications do not overlap. Walk
across unexplored chunk borders to discover/revisit POIs. Hold/release Space
and movement across a draft. Compare `?qa=1&equipment=float` separately.
Record actual art/readability/threat/fun/replay ratings. A blocker is
`INTERRUPTED_BY_BUG`; telemetry without ratings stays `HUMAN_FUN_PENDING`.
