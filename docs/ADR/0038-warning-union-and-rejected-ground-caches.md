# ADR0038 — finite warning perimeter; reject unproven ground caches

Start: clean local/fetched PR17 f6281228d711ab206b2e1285ccffb534a4bbc231.

MEASUREMENT: fresh physical PR17 diagnostic, Intel UHD630/ANGLE D3D11 driver
31.0.101.2141, Chromium153,903 frames: inclusive p95 renderer8.5 / ground3.6 /
Combat3.7 / sim0.8ms. Instrumented attribution, not budget acceptance.

Two isolated dirty prototypes were removed, with frozen same-state ABBA
renderer/ground p95 retained:

- FillPath triangulation reuse: A5.2/2.3, B4.7/2.2, B5.3/2.3, A4.7/2.0ms.
- Native StrokePath prepared geometry: A13.3/7.6, B13.5/7.7, B11.6/6.8,
  A11.2/5.7ms.

Neither demonstrates repeatable benefit. No new cache/render-node override or
dependency ships. Variation is unexplained; no thermal, scheduling or GPU
root cause is established. Do not attribute PR17's joint render/sim outlier
from one trajectory. No proven performance intervention is claimed this round.

profile-matched-control.mjs provides a small identical-code A/A control:
clean compiled stamp, stable frozen hash, CPU busy fractions, power-plan name,
GPU/features/browser, unique CPU/RAF data, independent advancing prefix.
It refuses changing/dirty builds. It does not stop apps/change power/evict OS
caches or claim exclusive machine ownership. Optional GPU instrumentation is
separate. A/A controls do not demonstrate optimization or universal acceptance.

FACT: the old Cross warning drew four parallel edges without finite end caps
or a filled interior, crossing the union center. Render the true12-corner
union of the canonical finite perpendicular rectangles, with quiet fill and
dark-under-coral edge. Slam receives the same backing. Edge centerline is
the hit limit; outline width is not extra collision. Fan is unchanged.

No HP/damage/timing/collision/movement/spawn/seed/input changes. Versions stay
3/18/2. Geometry tests compare the polygon with bossAreaHit under rotation and
negative/fractional positions. Native tests require all8 interior samples
visible with the source offscreen in Normal/Reduced/Contrast; old warnings
and Natural36/experimental16 remain. No bot win certifies human fairness.

ART: the inspected36-pose source is a flattened painted PNG, with cloth/armor
overlapping limb surfaces needed by a real rig. No tracked KRA/ORA/PSD/
ASEPRITE/BLEND/SCML/SCON source or matching PATH/common Program Files/local
Programs authoring install was found in the bounded inventory. This is not
proof of absence everywhere. Installing a DCC alone cannot reconstruct
occluded anatomy. Production is BLOCKED on actual layered painted front/back
source with complete limbs/feet/joints, or a genuine original frame timeline.
Reuse existing importer/ReferenceAnimation/Phaser clock; no metadata-only rig
or another generated gait grid. Existing partial/rejected sources preserved.

Final exact-source CI/package/native/physical receipts belong to the new
Draft PR. Same31 issues, separate performance/art/visual/fun gates. Candidate
is HUMAN_REVIEW_READY for inspection, not release. No main merge/tag/release.
