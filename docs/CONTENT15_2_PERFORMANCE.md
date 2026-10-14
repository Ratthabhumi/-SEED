# Content15.2 performance receipt

Parent `0fa6378a457606e4066055032e8ea52b22fc63b1`; frozen product
`105b6c836b054b683ffca9a8a8ba594c59dce98e`. Evidence-only commits after
that product do not change rendering or canonical rules. Intel UHD630 / ANGLE
D3D11, driver31.0.101.2141. No entity, projectile or collision reduction.

## Paired renderer experiment

Five alternating ABBA/BAAB blocks,20 fresh browser processes,240 retained
observations;10 per build/viewport/mode/cache condition. All completed, no page
errors. Fixed paused500 enemies/800 friendly projectiles. No profiler enabled.
Values below are **median of ten per-run renderer p95 values**, milliseconds;
they are not percentiles pooled across runs. Fresh-context cold is not an OS
disk-cache eviction. Warm upload maxima include startup and cannot be attributed
to the warm measurement interval.

|Viewport width|Mode|Cold parent → candidate|Warm parent → candidate|
|--|--|--|--|
|1280|Normal|1.90 → 1.90|1.10 → 1.20|
|1280|Reduced|2.20 → 2.00|1.15 → 1.20|
|1280|High contrast|6.95 → 4.40|5.50 → 3.80|
|1920|Normal|3.00 → 3.35|1.80 → 1.75|
|1920|Reduced|3.20 → 3.40|1.95 → 2.05|
|1920|High contrast|9.00 → 7.10|7.70 → 5.90|

**Performance acceptance remains PARTIAL.** The strict renderer p95<8ms budget
still fails one candidate1920-HC cold run at exactly8.00ms. Parent failed8/10
cold and3/10 warm HC1920; candidate failed1/10 cold and0/10 warm. Other candidate
conditions have no render8ms failures. Normal/reduced results are mixed; do not
claim universal improvement. Terrain upload lifetime maximum remains29ms in
candidate1920 reduced versus23.5ms parent, despite removing DOM-source upload.
These occasional uploads remain a hitch risk; no budget was relaxed.

## Retained diagnostic failure and correction

Separate8s instrumented HC1920 diagnostics are explanatory, not acceptance:
parent GPU p95=8.655ms; first full-quad cache=14.880ms (regression).
On the same corrected build, full-quad=13.227ms and alpha-cropped=7.939ms.
No GPU disjoint/page errors. The crop keeps every nonzero-alpha pixel plus2px
filtering gutters and uses the existing mesh path. Same-build comparator:
`?friendly=fullquad`. Do not subtract unrelated percentiles to infer phase cost.

Raw paired observations, exact min/max/failure counts and diagnostic summaries:
[performance.json](evidence/content152/performance.json).
Reproduce with `scripts/profile-paired-renderer.mjs` against clean parent and
candidate previews. Live canonical stress is reported separately; this paused
experiment cannot establish sustained combat, simulation p95, human smoothness
or visual acceptance.

## Independent advancing late-Space fixture

Clean105b6c8, normal1920×1080, existing staged Hunters age5 roster:
901.313s wall time,54,002 unique RAF samples, canonical clock advanced to900.1s,
then actual boss, child-world and restart each advanced for20s. No paused/Draft
interruption or page errors. Initial500 high-HP/zero-damage enemies and800 shots
are an explicit stress setup; shots retire normally and no refill maintains800.

|Stage|Simulation p95|Renderer CPU/API p95|Frame p95|Worst renderer|
|--|--|--|--|--|
|Dense15min|1.00|4.70|16.70|30.90|
|Boss20s|0.90|4.20|16.70|39.10|
|Child20s|1.20|4.70|16.80|9.50|
|Restart20s|1.20|4.40|16.80|8.30|

All values milliseconds. Dense simulation worst15ms; frame worst33.4ms.
These scoped p95 results meet sim<4/render<8, but do not certify every workload
or eliminate hitches. Sim/render rolling240 windows sampled1Hz overlap; RAF
samples are unique. No natural progression, boss DPS or human verdict follows.
Raw observations: [live-space.json](evidence/content152/live-space.json).
Reproduce: `node scripts/profile-canonical-combat.mjs URL OUTPUT.json 900 5`.
