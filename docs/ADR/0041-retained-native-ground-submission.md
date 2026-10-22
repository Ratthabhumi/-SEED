# ADR0041 — retain complete native ground triangle submissions

Parent: clean PR20, 4827b9ad3778cb927c9cb7250ea462fbdae72d38.
Branch: feat/v31-ground-geometry-20261022. No integration/release authority.

## Evidence and distinct hypothesis

Official PR19/PR20 packages were served immutably on the same UHD630 host.
An instrumented identical-PR20 A/A control again attributes substantial HC
cost to ground Graphics replay. Five alternating ABBA/BAAB blocks retain all
40 cold/warm rows for the actual 1080p HC500-enemy/800-projectile fixture.
This is a bounded diagnosis, not a replacement for the final24 live cases.
Different historical22/24 and12/24 campaigns cannot establish causation.

Instead of another framebuffer, FillPath cache or prepared StrokePath node,
the candidate retains the **complete native flat-triangle submission** for
the existing static ground command stream. This skips the command interpreter,
path construction, fill triangulation and stroke expansion together. It keeps
native submission order, indices/colors, triangle geometry and shader/batcher.
There is no raster resampling, new texture, render target or shared-node edit.

## Scope and invalidation

The original bounded ground neighborhood and decoration culling stay intact.
Only that Graphics owns the cache, including its existing static site dressing;
combat and canonical state are untouched. Every ground refresh invalidates it:
world, age, chunk/detail bounds, discovery, territory state, scale and settings.
Linear transform, alpha and path-detail changes rebuild native geometry.
Camera translation reuses and translates the captured screen-space vertices.
Cached primitives retain their actual native triangle bounds. Wholly offscreen
submissions are skipped with a2px guard only for a full matching viewport and
identity external transform (or a local framebuffer). Partial intersections
and unsupported viewport transforms keep the original triangles. Native tests
assert actual nonzero skips, avoiding a false-positive inactive optimization.
Canvas and lit sources retain the native renderer. Retention is capped at
65,536 vertices; overflow completes the native draw and bypasses caching until
the next invalidation. Scene destruction releases retained CPU arrays; there
are no additional GPU resources to leak across restart/context restoration.

Phaser4 captures renderWebGL at object construction. Use its public render-step
API to install the instance adapter. A method assignment alone was caught by
the first native test (zero cache hits); that unsuccessful attempt is retained.
Opt-in diagnostics measures the outer adapter once, including preparation.

## Acceptance

Default enablement requires native exact pixel comparisons, fractional camera
movement, all six ages/four biomes/two zooms at720/1080, unchanged canonical
hashes and repeatable matched benefit. A development opt-in is not acceptance.
Final results and every failure belong to the new Draft PR, with their actual
compiled source identities. Uninstrumented CPU/API8ms and simulation4ms limits
remain strict. Instrumented GPU/CPU spans are separate, inclusive and cannot
be added together or substituted for the live budget.

No canonical/balance/art/dependency/version changes. Painted lava Boss remains
default. Hand mount remains default. The fastest Natural36 Hunters trajectory
still kills before protected phase1 recovery finishes; no HP inflation or
immunity is justified by that case alone. Natural/human fun and real layered
painted anatomy remain separate open gates.

## First bounded measurement (clean experimental5969c8d)

Without primitive clipping, the first40-row uninstrumented matched campaign
has median window renderer p95 A15.3/B12.1ms warm and A15.3/B14.5ms cold.
Four warm blocks improve, one regresses; B's worst warm window18.2ms is retained.
Every warm window remains above8ms. This is partial benefit, not budget closure.
The next bounded revision adds only the conservative native-bound clipping
above. Retain the first campaign rather than replacing its unfavorable rows.

## Clipped candidate decision (clean2418086)

All five paired warm blocks improve against official PR20. Median window
p95 A14.75/B12.7ms warm and A17.8/B13.85ms cold. Strong time drift affects BOTH
labels: warm A ranges6.7–18.9ms and B4.9–16.8ms; every row stays available.
Five paired block medians support retaining the improvement; global medians
alone would not attribute that drift. This does not establish thermal/scheduling
causes or universal8ms acceptance. Final production enables reuse only for
High Contrast; Normal/Reduced keep native submission. groundGeometry=legacy
is the explicit comparison path. No scene density, art or gameplay reduction.

Final complete check/browser/analyze/Natural36/package, exact-head CI and
24 live physical cases receive their own final-source receipts in the Draft PR.
Earlier experimental stamps are preserved in docs/evidence/v31-ground.

## Research handoff and natural QA

APPLIED: native Phaser4 flat-triangle pipeline and conservative visibility.
REJECTED: whole-neighborhood raster cache and old individual Fill/Stroke/PNG
prototypes; no rerun under a new name. PARTIAL: physical budgets and existing
painted presentation. NOT IMPLEMENTED: new authored animation or Boss balance.

For ChatGPT/artist: supply actual layered basalt/ember golem anatomy and
authored turn/windup/impact/recovery/hurt/death timelines, compatible with the
existing atlas/pivots; preserve the preferred painted silhouette. Existing
V3_VISUAL_RECOVERY specifies material, view and occupied-pixel limitations.
For design research: review Hunters/GOLDEN002/damage's4.7167s natural kill and
protected recovery/50% escalation contract across all36 outcomes. Recommend
counterplay-preserving escalation tests; do not force phase2 with HP/immunity.

Owner QA on the final branch: npm run qa:human, open localhost:5173/?qa=1,
start a fresh Hunters/EPOCH-GOLDEN-001 session. Compare Normal/Reduced/HC,
move through chunk boundaries and change age; pause/resume, then reach Boss,
Ascension and World2 naturally. Verify full Logistics→claim→Later/Esc→movement,
retry specialization/first Signal, technology input/focus, EN/TH200% and Boss
HUD. Finish the session and record visual clarity/fun ratings and actual FPS.
No QA grants/forced phases; preserve failures as INTERRUPTED_BY_BUG.
