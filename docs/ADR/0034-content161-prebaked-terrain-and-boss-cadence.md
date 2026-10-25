# Content16.1: exact material bake and phase-two downtime

Date: 2026-10-15. Parent: PR13 / 4d1dc0c.

## Material decision

The parent measured source preparation up to34.2ms in CI. This is a measured
constructor component, not proof of the root cause of render p95 spikes. Bake
the existing periodicTerrainSource output offline using the same browser Canvas
decoding. Load one1MiB RGBA8 source buffer and populate four existing-size
CanvasTexture fallbacks using putImageData/refresh, matching the parent upload
path. Copy its four ranges before Worker transfer; never detach Phaser's cache.
This removes original-image decoding/readback/periodic conversion from source
setup. It retains explicit fallback upload, atlas allocation and Worker work.

The existing64-slot atlas, one-upload/frame limit, typed orientation, gutters,
epoch guards and160ms transition stay intact. No second renderer or dependency.
PNG/byte/source hashes and a native four-material byte comparison gate parity.
The old runtime preparation remains a diagnostic control (`?terrainSource=runtime`).
Direct baked PNG fallback remains diagnostic-only (`?terrainSource=prebaked-png`).

Tradeoff: cached CPU bytes add1MiB plus1MiB transient transferable copies. Four
Canvas textures preserve the parent's fallback type; original source images are
not uploaded by default. PNGs/original images remain packaged for diagnostic and
parity controls. Transfer/readiness and whole-frame performance
must be measured separately; reduced sourcePrepMs is not an FPS or8ms PASS.

## Rejected first experiment

Exact c40cf0c Push38685763415 / PR38685781809 passed5/5 engineering jobs and
four official packages, but direct PNG defaults are REJECTED. Source preparation
median fell28.8→0.7ms in PR data;1080p normal cold render p95 median regressed
9.25→17.35ms (Push8.75→17.25ms). Both replicas retain all samples. See
docs/evidence/content161/rejected-png-experiment.json. Pixel equality and warm
passes cannot erase cold regressions. Test one correction: preserve the parent
CanvasTexture creation/refresh path while supplying already-prepared pixels.
Whether texture type/upload timing caused the regression is still a hypothesis;
do not attribute shader/driver/thermal causes without evidence.

The retained PR parent/candidate data also shows that every normal/reduced
"warm" row still had16–31 pending terrain jobs (40/40 rows per mode); HC's49
unused jobs are intentionally paused. Those old windows were post-cold, not
fully prepared steady state. Correct the existing paired harness to wait for
active painted terrain to drain before its1500ms settle/new3s warm sample.
HC excludes unused terrain work. Record wait duration; preserve cold3s, all
five blocks, populations, rows and strict budgets. This changes warm protocol;
do not compare new warm windows to old windows as if they were identical.

## Ground contact decision

Parent landmarks/outposts use center-based offsets unrelated to their actual
painted support edges. Measure alpha>=32 bounds of the existing18 frames. Use
the measured ground ordinate as the Image origin and place it on the existing
site shadow plane y+8. Preserve canonical site coordinates, claim ranges and
fog eligibility. This fixes support alignment without new art or collision.
Measurements are initial technical anchors, not an artist's anatomy approval.

## Boss decision

Parent36 policies reached24 bosses;21/24 reached encounters exposed phase-two
attacks. Do not classify the12 unreached cases as encounter failures. Test one
cadence intervention: transition .8→.4s and phase-two approach cooldown2.2→1.1s.
Leave full1.15–1.4s telegraphs, .14s commitment,1.4–1.85s stationary recoveries,
aim locks, damage, HP and lethal hits unchanged. Shorter noninteractive downtime
should expose the existing spatial choices earlier; it must not manufacture
immortality or shorten dodge/recovery opportunities. Compare the identical36
controllers/seeds/Origins against4d1dc0c, including defeats and censored cases.

CONTENT_VERSION16→17 identifies intentionally different encounter traces and
the established content-version-dependent child-world laws. World-one laws keep
their existing Content9 identity. WORLDGEN3 / SAVE2 stay unchanged; no schema or
world-position migration. Natural progression/encounter/human-fun gates differ.

## Windows audit decision

Keep the same eight900s policy/seed runs and two30s replay runs. Give each policy
a test transport boundary; yield every128 fixed steps instead of1024. Measure
wall/process CPU time, boundary RSS and longest work slice. Retain the original
600s Windows /180s Linux aggregate policy budget explicitly; never turn splitting
into a larger audit budget. A full successful Windows check is still required.

## Animation decision

No new animation engine, synthetic frame grid or distorted whole-body walk.
The existing painted reference has no editable anatomical layers; the available
legacy SVGs would replace the established material direction. Krita/Aseprite
were not found via installed commands. A convincing source-matched cutout still
requires actual segmented anatomy and artist motion work. Keep verified runtime
motion and rejected experiments intact; production motion remains BLOCKED.
