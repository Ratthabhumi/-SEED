# Content16.1: exact material bake and phase-two downtime

Date: 2026-10-15. Parent: PR13 / 4d1dc0c.

## Material decision

The parent measured source preparation up to34.2ms in CI. This is a measured
constructor component, not proof of the root cause of render p95 spikes. Bake
the existing periodicTerrainSource output offline using the same browser Canvas
decoding. Load four256px PNG fallback textures plus one1MiB RGBA8 source buffer.
Copy its four ranges before Worker transfer; never detach Phaser's cached source.
This removes runtime Canvas decoding/readback/periodic conversion from production
source setup. It does not remove atlas allocation, uploads, shaders or Worker work.

The existing64-slot atlas, one-upload/frame limit, typed orientation, gutters,
epoch guards and160ms transition stay intact. No second renderer or dependency.
PNG/byte/source hashes and a native four-material byte comparison gate parity.
The old runtime preparation remains an explicit diagnostic control, selected by
`?terrainSource=runtime`; it is not a second default production path.

Tradeoff: cached CPU bytes add1MiB plus1MiB transient transferable copies. Four
PNG textures replace the parent's four Canvas fallbacks; original source images
are not uploaded on the default path. The original images remain packaged for
the diagnostic/parity control. Transfer/readiness and whole-frame performance
must be measured separately; reduced sourcePrepMs is not an FPS or8ms PASS.

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
