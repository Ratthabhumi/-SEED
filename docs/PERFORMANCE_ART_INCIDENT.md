# Content14 human performance and art incident

Baseline: PR8, exact8d52ecd34ca3de4cb5c1bb55293d663c3b515493.
Operator reports intermittent traversal stutter and inconsistent art after actual
play. This is a failed human quality gate even though baseline CI4/4 was green.
It does not establish that every stall has the same cause. No HUMAN_FUN_PASS.

Two terminal sessions, not165 separate snapshots, were examined. Original
reports, sanitized summaries and handoff were preserved privately before edits
with a SHA256 ledger (5423 files including prior historical evidence). Raw
reports, browser identities and local machine paths are not committed here.

| Session | Provenance | Route / duration | Recorded performance | Limits |
|---|---|---|---|---|
| cc5fbce5 | baseline exact SHA, buildDirty=false | Hunters, GOLDEN seed, first world; Space549.53s, boss553.32s, died600.13s; wall752.09s | Bronze frame p50/p95/p99=21/51.1/341.4ms; sim=.77/1.05/1.16ms;2560×1305, estimated45Hz | No boss win/Ascension; no terrain/GPU trace; no rating/comment; estimated Hz is not monitor specification |
| 8e444207 | same exact SHA, buildDirty=false | Engineers, same seed, died70.10s; wall114.04s | end frame21.6/45.6/52.4ms; sim=.70/1.15/1.27ms; same viewport, estimated43Hz | Short run; no rating/comment or isolated streaming trace |

Both terminal reports record zero failed assertions/console errors. This is
machine telemetry, not evidence of visual approval or smoothness. Older actual
softlock evidence remains INTERRUPTED_BY_BUG. Raw player-died end reasons are
preserved; operator feedback is recorded as QUALITY_GATE_FAILED, not retroactively
invented inside the original exports.

## Reproduction and decision

On the official baseline ZIP, a deterministic four-biome review route measured
uncached refresh work134.3/142.7/211.4ms, versus cached0.2–0.7ms. This includes
site lookup and ground refresh, not just texture upload. Source inspection
locates252²-pixel blending per tile on the main thread and full16MiB atlas uploads.
This verifies a reproducible streaming bottleneck; correlation with the original
hardware incident still lacks a trace.

A direct single-quad GPU bilinear prototype removed CPU painting but regressed
steady Software GPU frame pacing (1080p p50 approximately83.3→100ms). It was
rejected. An initial shader compilation failure and this valid regression are
retained privately. No failed result is used as evidence of speed.

Selected architecture keeps exact baseline pixels,252px sampling, two-pixel
gutters and a16MiB atlas. A module Worker prepares pixels; visible requests precede
prewarming.64 cached cells, one in-flight job and at most one256KiB subregion
upload per frame bound resource use. Source-biome images immediately cover
pending cells, with160ms crossfade; no uninitialized slot is displayed. Old-world
results and evicted-job results are ignored. Canvas backing pixels retain context
restoration data. Unsupported/failed Worker uses explicit source-art fallback.

Before final measurement, streaming acceptance is set at refreshGround p95≤4ms
and worst≤8ms, one completed-tile upload/frame and262144 bytes/upload. These are
additional engineering budgets; the existing60FPS, sim p95<4ms, render p95<8ms
and400–600/600–1000 stress targets remain unchanged. GPU upload-call CPU time is
not GPU completion. Hardware acceptance remains pending.

The reusable profiler uses the same seed, trajectories, viewport, settings and
500-enemy/800-projectile staged renderer workload on each build. Its canonical
simulation is paused, so its results are not simulation or human-run timings.
RAF intervals are unsmoothed wall time. Long tasks are observed without inventing
GC/terrain attribution. Driver, frame tails, spikes, cache/upload counters and
optional15-minute heap trend are exported. Heap measurements include GC cycles;
no unmeasured retained-memory claim is allowed.

New real QA exports additionally retain cumulative ground/chunk/upload-call/
worker maxima, cache misses, pending work and upload byte counters. They are
sparse2Hz diagnostics, not per-frame causal traces; absent historical values
remain absent. The installed scene's rendererCpuSubmit bracket uses actual
Phaser PRE_RENDER/POST_RENDER events, including CPU renderer/API submission and
possible driver waits. It excludes asynchronous GPU completion; it is not merely
drawFrame command construction. Earlier reports using the latter description
must be interpreted with this correction.
