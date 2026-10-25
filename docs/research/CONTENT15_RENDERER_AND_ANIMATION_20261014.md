# Content15 renderer and animation research execution — 2026-10-14

## 1. Verified baseline and authority

FACT: PR10 parent branch is feat/content15-combat-world-ui-quality at
efef11ef9729c3bbc388061a45b605688b6a213e. Its independent push38513285072 and
PR38513288712 CI both completed successfully. Earlier product0700989 CI remains
historical evidence. This workstream branches from the verified parent and targets
it with one Draft PR; no main merge, tag, public release or canonical expansion.

AUTHORIZATION: operator requests a focused renderer/animation pass and reviewed
GitHub publication. Research not resolved by measurements is returned to ChatGPT.
No market research or copied game code/art/balance is authorized or performed.

## 2. Primary documentation and implementation evidence

Operator-supplied primary reference links:
[Phaser Text](https://docs.phaser.io/phaser/concepts/gameobjects/text),
[Phaser animations](https://docs.phaser.io/phaser/concepts/animations),
[Chrome Performance](https://developer.chrome.com/docs/devtools/performance/reference),
[WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices),
[GPU timer queries](https://developer.mozilla.org/en-US/docs/Web/API/EXT_disjoint_timer_query),
[Krita animation](https://docs.krita.org/en/user_manual/animation.html),
[Krita export](https://docs.krita.org/en/reference_manual/render_animation.html),
[Aseprite CLI](https://www.aseprite.org/docs/cli/).

EVIDENCE: actual installed Phaser4.2.1 Text.js/updateText calls canvasToTexture;
GraphicsWebGLRenderer interprets commandBuffer and dispatches FillPath/StrokePath
each rendering pass. AnimationState supports native clips and setProgress.
Repository decisions use this local implementation and browser measurements,
not an assumption that every documentation example applies to Phaser4.

## 3. CPU versus GPU attribution protocol

Implemented `?profile=1`: bounded1200 unique completed frame records, inclusive
simulation/update/actor/presentation/Graphics/Image/Text/mesh/GL spans, call counts,
terrain putImageData/backing drawImage/upload spans and worker roundtrip/evictions.
`?profileTrace=1` emits named User Timing spans into Chromium traces. Nested spans
overlap; they are NOT added or derived by subtracting unrelated percentiles.

WebGL1 EXT_disjoint_timer_query and WebGL2 equivalent are checked. Asynchronous
query results are read only when available; at most8 pending queries, disjoint
samples rejected, no finish/readback/per-frame getError. Diagnostic wrappers,
queries and observers are disposed/restored on scene shutdown. Normal gameplay
installs no profiler. `profile-render-phases.mjs` records hardware/browser context,
captures short traces and keeps raw evidence locally. Diagnostics have overhead;
independent no-profiler runs are required for budget acceptance.

## 4. Controlled repeatability protocol

`profile-paired-renderer.mjs A_URL B_URL OUTPUT 5` implements alternating ABBA/BAAB
blocks, fresh browser process per letter, six1280×720/1920×1080 normal/reduced/high-
contrast conditions and separate cold-start/warm-settled samples. Cold means fresh
browser context/texture state, not OS disk-cache eviction. Samples are unique
retained product render/frame records, not duplicated observations of rolling
windows. Record initial fixture/hash, foreground, hardware/browser, cache/Worker
counts, p50/p95/p99/worst. Paused500/800 and advancing live fixtures remain separate.
No thermal/power/other-app attribution without independent measurements.

## 5–6. Hypotheses, interventions and measured results

| Hypothesis | Experiment | Evidence / decision |
|---|---|---|
| Frequent numeric Text uploads dominate | Numeric-only13-glyph BitmapText prototype,12 slots | First20s diagnostic had34 rebuilds, Text p95=0. Optional `numbers=atlas` removes these rebuilds; keep experimental, no justified global Text replacement |
| Threat polygon interpretation/tessellation costs CPU | Cache unchanged arrowhead/outline/tip in bounded64-glyph1MiB atlas, one1000-quad mesh | Initial instrumented Graphics p95 **16.3→4.3ms**, renderer22.6→10.1ms; independent short trace vector/cache Graphics3.1→.9ms, renderer8.0→5.8ms |
| Graphics change removes all GPU cost | Async queries in short traces | GPU p95 vector9.201/cache8.282ms, zero disjoint; substantial GPU time remains; CPU submission is not GPU completion |
| Terrain scheduling causes remaining stalls | Split timing and cache/worker counters | Instrumentation delivered; no unsupported scheduler/pixel/worldgen changes shipped |
| Actor traversal/overdraw needs quality cuts | Existing actor spans, GPU timing | No measured intervention justifies dropping actors/effects or changing caps; not shipped |

Short vector/cache trace captures366/367 frames, no page errors; MinorGC events
66/33, MajorGC2/2. Traces are highly instrumented (about399k User Timing events
each), so GC/CPU overhead must not be mistaken for normal-play costs. Numeric
variant GPU p95=9.610ms and renderer CPU p95=3.2ms are from a different20s run;
this is not proof that the numeric variant caused the improvement.

INFERENCE: measured CPU Graphics work is a supported optimization target.
HYPOTHESIS: remaining GPU/fill and driver/browser variability may matter, but
neither source inspection nor these short traces proves a universal root cause.
No guessed thermal explanation, budget relaxation or gameplay change is accepted.

## 7. Performance gates

The original render CPU/API p95<8ms, sim-step p95<4ms, terrain refresh p95≤4ms/
worst≤8ms and caps remain. Final uninstrumented paired/live numeric summaries and
their confidence limits are in the delivery receipt; short diagnostic wins alone
do not close these gates. Old degraded50.1ms repeat remains historical evidence.

## 8–9. Animation pipeline and artist versus technical work

Delivered original Hunters Stone/Space front/back36 key poses, reproducible PNG/
metadata/Phaser atlas export, distinct-frame/source hash/anchor/bounds checks,
native Phaser clip registration and canonical-time playback, per-pose hand socket,
event revision restart, pause/restart/World2-safe adapter clocks. Two-frame walk/
attack clips are real distinct source poses. Idle/hurt/dash/ability/death are single
authored poses, NOT finished motion clips; other Origins/Ages retain neutral art.

[Production contract and visual guide](../ANIMATION_PRODUCTION_CONTRACT.md) records
exact scale/facing/action/socket rules and memory budgets. Existing Pillow is an
offline import tool; no runtime dependency added. Source PNG/generation summary/
project MIT provenance are retained. No fabricated layered Krita project.

Technical work can slice, validate, pack, export, time and test. Artist/human work
must review anatomy, silhouettes, weapon contact, in-betweens, motion spacing and
cohesion at112px. AI key-pose generation and green browser assertions do not supply
human art or fun approval. Full enemy/Guardian/environment era kits remain pending.

## 10. Effort for a next batch (proposal, not schedule)

One reviewed reference clip family: approximately1–3 artist days for pose cleanup/
in-betweens plus0.5–1 engineering day for import/capture, depending on quality and
frame count. Before multiplying Origins/Ages, review this reference and measure
resident textures/CPU/GPU. Current reference atlas2.25MiB plus existing neutral3MiB
and old squad/pose4MiB; do not expand them without an explicit measured budget.

## 11. Open questions to ChatGPT and human gates

- Recommend a low-overhead GPU/CPU paired tracing protocol given actual query
  support and large User Timing instrumentation overhead; separate normal GC from
  diagnostic GC and determine whether CPU batch savings still leave GPU fill-bound.
- Recommend an artist workflow to refine this actual36-pose source into smooth
  clips without anatomy/anchor/socket drift; source art and native captures are
  supplied, so avoid a generic market survey or another speculative feature list.
- Full-animation library, six-era enemy/Guardian/environment kits, human art
  readability and human fun/replay judgments are pending. Preserve all negative
  human feedback and historical exact-build identities.
