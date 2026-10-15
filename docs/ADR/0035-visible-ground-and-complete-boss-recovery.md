# ADR0035 — visible ground and complete boss recovery

Parent PR14/7b9b164a4b6c5a565de7195b9050494e10da252d. No new dependency.

Home baseline check506 tests/87 files, provenance61/build and five terrain
browser tests passed. Intel UHD630 D3D11 instrumented HC diagnostic593 frames:
renderer.total p95=16.3ms, Graphics13.6ms, ground13.0ms. Inclusive CPU/API spans
are not additive or isolated GPU timings. Earlier instance wrappers missed
Phaser4 construction-time render steps; prototype wrapper now identifies src.
Zero instance spans were not evidence. Raw diagnostic remains separately scoped.

Cull static HC floor commands outside camera bounds plus a full safety chunk.
Retain original primitive order, all POIs/fog and dynamic danger geometry.
Quantized camera bounds invalidate redraw on travel/resize/zoom. Comparator:
?ground=unculled. No texture/cache allocation, topology or canonical density change.

Whole-neighborhood Canvas/DynamicTexture baking is not selected:7x7x512px needs
3584² RGBA=49MiB per surface before overhead, with neighborhood/age rebuilds.
Installed Phaser4.2.1 GraphicsWebGLRenderer.js confirms command replay;
DynamicTexture.js documents context-loss contents and WebGL1 aliasing limits.
Culling removes invisible work directly. Those texture alternatives were assessed,
not benchmarked; no fabricated experimental result or new renderer pipeline.

Parent promises complete stationary recovery, but half-HP escalation interrupts
it. Finish recovery before transition; preserve warnings, commitment, damage/HP,
lethal hits, cooldown and player control. This fixes a contract rather than
tuning to the single Engineers/STRESS/survival victory→defeat case. Retain all36
policy comparisons and adverse outcomes. Content17→18 reflects actual canonical
timing; Worldgen3/Save2 unchanged. Content-keyed child laws inherit18; World1 law
identity remains9. Old replays must not be relabeled.

Acceptance: real old/new Canvas raster parity and nonblank coverage, canonical
hash preservation, native WebGL review, unchanged five-block profiling/full
regression. Green execution is distinct from strict8ms and human quality gates.
