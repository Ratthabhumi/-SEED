# ADR0036 — preserve enemy order while sharing quad preparation

Parent PR15 b909802d5fa18e5bbef11ce7ff5ae38a30b1bb37. No dependency,
new atlas, gameplay balance, Worldgen or Save change.

Hypothesis: individual enemy Images repeat object/transform/render-node work
in dense advancing play. A physical Intel UHD630 D3D11 diagnostic on the clean
parent recorded904 frames: inclusive actors.prepare p95=2.9ms, render.Image=2.8,
graphics.combat=3.9, renderer.total=8.0 and boundary=8.8. Nested spans overlap;
these are attribution, not additive/exclusive CPU costs or GPU timing.

Candidate: reuse existing PaintedQuadBatch, in consecutive runs of at most16
actors. Start a new run at a texture/tint change. Never sort actors by material.
Preserve image frame UVs, horizontal flip, .65 origin, world dimensions, tint,
painter order and depth. Boss and ordinary textures can alternate. Maximum650
run slots, each1280 bytes of typed vertex/index data:832000 bytes worst case,
normally32 runs for500 equal-style actors. No extra GPU texture residency.
Hidden surplus runs are reused; scene shutdown owns Mesh destruction. Canvas
keeps the original Image implementation. `?actors=images` is a presentation-only
same-build comparator, available independently of the E2E harness.

Native Images→Mesh→Images regression compares102 overlapping actors with mixed
families/frames/flips/tints/boss textures and canonical hash. Origin/zoom1 and
negative fractional world/zoom1.2 match all channels exactly. At
[24576.125,-16800.375]/zoom1.25,11 channels differ by1/255; repeated Images match
exactly. A chunk-local Mesh anchor experiment did not change those11 channels
and is REJECTED/reverted. Different numeric submission/interpolation rounding
is an inference, not a proven GPU attribution. New actor oracle permits at most
1/255 per channel and0.01% changed channels; repeat Images and ground parity
stay exact. This documents correction of an overstrong new byte oracle, not
relaxation of any existing danger, density or performance acceptance test.
An initial QA descriptor mismatch (numeric versus string frame id) was fixed.
Another initial image comparison included animated DOM HUD; isolate the native
canvas from that unrelated overlay. Far-coordinate descriptor review must also
run after camera preRender, not before the fixture's new view is established.
Retained failure logs/traces and sanitized numeric receipts distinguish these
oracle corrections from the real missing-warning defect.

Other correctness finding: drawFrame culled an entire enemy by body center,
including a locked Slam warning aimed inside the view. Before correction the
native warning/no-warning comparison had0 changed pixels. Retain warning
geometry even when its source body is outside the view. Existing on-screen
ordering, hit geometry, durations and damage remain unchanged.

Camera suspicion is a separate question. Installed Phaser4.2.1 Camera.preRender
uses scroll+pixel half-width for midPoint and width/zoom for worldView extent.
The old groundViewport formula matches; do not change it speculatively. New
runtime oracle reads native worldView and getWorldPoint after real renders,
and checks submitted bounds, rather than copying the production formula.
At fractional zoom Canvas antialiases shared chunk edges identically in both
paths (first720p run918882/921600 pixels fully opaque). Requiring every alpha
to equal255 was an invalid new oracle; require exact all-channel parity and
every pixel nonempty instead, retaining opaque counts. The prior integer-zoom
test still requires full opacity. No production culling/budget assertion is cut.

Player-hurt events add descriptive optional source ids. They cannot change
accepted damage, iframe rejection or snapshots. Natural36 now compares PR15
and candidate final canonical snapshots exactly while retaining all outcomes;
entry health/adds and accepted damage sources support fairness diagnosis.
Keep Worldgen/Content/Save3/18/2. No balance change is justified by a controller
defeat alone. Historical missing source ids remain explicitly unattributed.

Decision requires full regression, native parity, cold/drained-warm paused
500/800 pairs and independently measured advancing play. Strict render<8ms /
sim<4ms budgets remain. Measurement execution and green CI are not performance,
artistic or human-fun approval. Final exact-source receipts belong to the PR.

Native UI follow-up: bottom-button autofocus hides draft names at200%. Initial
focus moves to the existing dialog heading; preserve fresh Enter first-choice
through DecisionInputBoundary and retain the Tab trap. Put names/effects before
long comparison text. Actual title-visibility tests fail2/2 on3b19720. Initial
heading-only experiment broke six existing fresh-Enter tests and was corrected,
not certified. Separately, checkpoint PR CI caught resize overriding injected
test zoom; settle native viewport before explicit zoom observations. Grouping
browser RAF observations changes no coverage, budget, production camera or
timeout. Source/failed-run identities remain in the PR receipt.
