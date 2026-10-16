# ADR0037 — cull invisible floor ink; isolate experimental Boss input

Starting local and fetched remote PR16: a9d0af4460a9c38dd24d62e8075489ca6ee4d6fa,
clean. Latest continuation was PR16. Branch
feat/content18-live-performance-counterplay-20261016 stacks on that branch.
No main merge, previous-PR retarget, tag, dependency or release.

## Measurement before hypothesis

FACT: the installed Phaser4.2.1 GraphicsWebGLRenderer replays paths on every
render; retained command buffers do not cache the tessellation. The prior
native120-row camera proof remains valid; no camera formula correction.

MEASUREMENT: clean PR16 Intel UHD630/D3D11 driver31.0.101.2141,
Chromium153, instrumented1080p advancing Space/High Contrast,1123 retained
unique display frames: inclusive renderer.total p95=16.9ms,
graphics.ground12.9ms, graphics.combat3.7ms. Asynchronous WebGL1 GPU query
1123 results,p95=10.776206ms. This is NOT an exclusive-cost subtraction,
uninstrumented budget result or proof that every Graphics source is slow.

INFERENCE: invisible decorative curves inside the deliberately padded chunk
neighborhood contribute avoidable replay work. The dynamic-Combat-first
hypothesis in the supplied research is not supported as the largest source
in this actual observation. Investigate the measured floor source first.

## One bounded candidate

Preserve all chunk base fills, geography, canonical geometry, sites and hazards.
Cull only wholly invisible tonal ellipses, decorative ellipses, grass glyphs
and civilization marks using conservative ink bounds. Use world-space bounds
quantized outwards128u, an additional128u guard, and the union of current
native-camera center and followed-player views. Existing chunk bounds remain.
Refresh the display buffer when quantized detail bounds change. No texture,
render target, extra atlas, geometry replacement or precision reduction.
`?decor=all` is the same-build comparator; `?ground=unculled` still disables
both culls. Sites, damage geometry and combat rendering never use detail bounds.

Native floor-only WebGL comparisons must remain exact, across biomes/ages/
fractional coordinates/zooms; the existing ground/camera/original-offscreen
warning regressions remain. Final physical paired and advancing measurements,
including every failed condition, belong to the new Draft PR receipt. Accept
only if supported by paired measurements; no universal performance PASS follows
from a changed median. Source changes require new exact-head CI/package stamps.

## Timing evidence contract

Preserve legacy rolling240 metrics and their overlapping-window percentiles.
Add E2E-only uniquely identified POST_RENDER rows, drained exactly once,
with matching step-only durations, entity counts, warning count and camera/
world observations.1200 pending rows maximum; consumers drain every second.
Use separate summaries; never restamp old samples or redefine the8ms/4ms budget.
Frame intervals remain independent RAF observations. These API/step boundaries
exclude presentation preparation and do not measure exclusive GPU execution.

Extend existing opt-in RenderDiagnostics: source-attributed Graphics command
buffer lengths, nested GL timing/counts and typed upload-view payload bytes.
Command-buffer numbers are not all primitives/triangles. DOM texture allocation,
driver copies and actual GPU residency cannot be inferred from those arguments.
Inclusive spans overlap. Existing asynchronous GPU queries require availability
and non-disjoint results; no gl.finish or synchronous readback. Instrumented
data must be reported separately from uninstrumented paired acceptance.

## Separate evaluation policy, unchanged game

Original scripts/progressionPolicy.ts and Natural36 remain untouched.
visible-locked-area-v1 wraps only InputFrame through an evaluation Proxy;
all original simulation methods stay bound to the real instance. No canonical
player automation, stat grants, teleports, phase forcing or future attacks.
Observe only a visible warning, apply150/300/450ms fixed reaction delays,
then use ordinary movement/dash validation. Slam escape is radial; Cross
escape exits both locked bars. Existing fan/projectile policy is retained.

Visibility uses a conservative player-centered1280x720/zoom1.25 approximation,
not a human perception model or exact native camera. Record this limitation.
Four adverse/burst cases each run baseline plus all delays, asserting exact
Boss-entry snapshot equality. Record initial hazard occupancy, time to fire,
occupancy at fire, accepted area damage, dash availability/usage, adds, HP,
timeouts/deaths, duration and phase exposure. An observed warning is not a dodge:
count evasion only when initially inside, outside at firing, with no accepted
matching area hit. Regen/iframes/overkill differ from raw damage totals.

A preliminary16-case run produced all passing assertions but a Vitest worker
onTaskUpdate RPC timeout from synchronous tasks starving reporting. It is NOT
a completed green experiment. Yield the evaluation runner between tests using
setImmediate, as in the original Natural36 runner; preserve cases and assertions.
Keep unsuccessful evidence; require an error-free rerun.

No Boss HP/damage/timing, mandatory invulnerability or burst suppression.
Improvement is evidence about controller limitations, not human fairness.
Worldgen/Content/Save remain3/18/2. Save/package versions unchanged.

## Precommit checks (final-head receipts still required)

Full check513 tests/89files,61 provenance/build PASS; final source typecheck
PASS.12 affected native browser tests PASS:120 existing camera observations,
16 exact-channel native floor comparisons (4biomes x2ages x2zooms), unique-frame
drain/legacy continuity and9 old/new offscreen/edge/zoom/mode warning cases.
Eight new warning views include native video; videos stay in Actions evidence,
selected synthetic PNGs and gzip receipts are committed with provenance.

Experimental16 rerun PASS without worker errors. All16 Boss-entry snapshots
match their baseline exactly. Engineers/STRESS/survival baseline defeat50.983s,
Cross147;150/300/450ms policy wins83.767/57.85/63.55s, Cross0. These are
controller-limitation observations, not human fairness acceptance. Engineers/
GOLDEN001 and Sentinels/GOLDEN001 time caps remain; Hunters/GOLDEN002 damage
burst remains4.7167s/no phase2. report.dashUses includes whole-run usage;
warnings[].dashUses is per observed-warning usage. Initial occupancy and
actual firing/outside/no-matching-accepted-hit are required for evasion.

The instrumented precommit candidate1181 frames measured ground8.6ms versus
parent12.9ms, renderer13.7 versus16.9, GPU p95=10.580541 versus10.776206ms.
These independently advancing diagnostics motivate paired testing, not a
controlled causal delta or budget PASS. Before is clean parent; candidate is
explicitly dirty. Exact-source five-block/advancing receipts decide acceptance.
