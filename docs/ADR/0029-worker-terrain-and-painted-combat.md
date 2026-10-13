# ADR0029: asynchronous terrain and shared painted combat assets

Accepted for engineering review2026-10-13; baseline PR8 exact8d52ecd.

Measured134–211ms cold ground refresh and16MiB full uploads justify removing
per-pixel preparation from the frame thread. A fullscreen GPU blend was tested
and rejected after a steady software-renderer regression. Preserve baseline
sampling and atlas batching instead: one module Worker,64-slot LRU, visible-first
jobs/prewarming, world/request tokens, one subregion upload/frame, immediate
deterministic source-art fallback and short crossfade. No dependency, gameplay,
collision, RNG, worldgen, content or save-version change.

Phaser4.2.1 has no public CanvasTexture subregion refresh. A narrowly isolated
upload uses its typed glTextureUnits/glWrapper state managers, texSubImage2D and
the live TextureSource wrapper. The canvas backing source is updated first for
context restoration. No cached raw WebGLTexture reference or per-tile mip chain.
Native traversal/Ascension/cache tests and byte-for-byte worker pixel comparisons
guard this adapter; revalidate against installed primary source on Phaser upgrades.

The initial Image-per-projectile atlas prototype regressed dense median frame
time on the software renderer. Replace its display-list traversal with three
Phaser4.2 Mesh2D ordered-quad batches (two tint groups and one pickup group), fixed
typed vertex/index buffers and unchanged camera/world-space UVs. Canvas retains
the Image fallback. High Contrast pauses unused terrain jobs/uploads. Keep both
prototype results; do not hide a frame median regression behind improved spikes.

A quiet-baseline repeat additionally exposed a remaining dense median cost.
Alpha-bound metadata (checked against bitmap SHA) trims only transparent GPU
quad margins, retaining2px filtering gutters. World-space scale, visible pixel
positions and UV mapping are preserved mathematically; no art downsampling or
damage/hitbox change. This reduces software rasterizer fill work. Record paired
final results; do not select the slower baseline or conceal repeat variability.

Default weapons/projectiles/mines/POIs/Guardians use three original atlases with
documented generation, alpha/gutters and exact provenance hashes. Six equipment
tiers reflect canonical weaponStage; projectile role, position and tier come
from actual SimProj. Pools are capped at existing canonical capacities and
offscreen objects remain culled. Event timing/geometry/audio stay canonical.
High Contrast retains geometric equipment/POI/Guardian paths and danger warnings.
Reduced Effects suppresses ornament, never hostile information.

Six painted weapon tiers are not six independently painted hero costumes. Static
poses/recoil/fade are not authored attack/death animation. These, era environments,
hardware60FPS and human visual approval remain explicit acceptance work.

Real QA reports add optional, copied cumulative terrain diagnostics without
inventing historical measurements. Sparse2Hz checkpoints are not per-frame
causal traces. Existing rendererCpuSubmit timing is the installed Phaser
PRE_RENDER→POST_RENDER CPU/API bracket, including possible driver waits, never
asynchronous GPU completion. The separate staged profiler records wall RAF
intervals and long tasks with explicit paused-simulation/hardware limitations.
