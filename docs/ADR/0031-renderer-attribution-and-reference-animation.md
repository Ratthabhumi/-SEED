# ADR0031 — Optional attribution, cached threat glyphs, sparse reference motion

Status: implemented candidate; performance/art acceptance pending measurement.

The prior renderer CPU/API p95=12ms did not prove GPU or Text dominance. Add opt-in
`?profile=1` diagnostic wrappers with bounded unique frame records, inclusive
nested spans/call counters, User Timing traces and nonblocking GPU queries when
supported. Wrappers are restored on shutdown; normal play does not install them.
Never add nested spans or subtract unrelated percentiles to invent attribution.

Initial physical-D3D11 diagnostic shows Graphics p95=16.3ms, Text rebuilds34 over
20s and no measurable p95 Text cost. Prototype caching the original hostile
six-point arrow/outline/tip as glyphs in one bounded1MiB texture and one1000-quad
mesh. First diagnostic Graphics p95 falls to4.3ms; instrumented renderer p95
22.6→10.1ms. Independent uninstrumented paired/live evidence is still required.
Keep vector/Canvas/overflow fallback and a diagnostic `?hostile=vector` comparator.
Do not reduce damage, collisions, threat population, effects or canonical caps.

Numeric BitmapText is `?numbers=atlas` experimental only, limited to numbers and
12 slots. Arbitrary/Thai labels stay Text. No evidence yet justifies default rollout.
Terrain changes are instrumentation only: split canvas/upload spans, worker job
roundtrip, evictions. Scheduling/fill/traversal interventions must follow evidence.

One original Hunters Stone/Space source supplies36 distinct key poses, with sparse
two-frame walk/attack playback. Locked per-row scale, feet/collision anchors and
socket metadata are packed reproducibly into Phaser-compatible assets. Other
costumes stay intact. Single-state poses and missing in-betweens remain explicitly
unfinished. Use canonical events/state and simulation time to select playback;
autonomous mine/Field/Defense effects no longer pose a fake handheld attack.

No canonical version/dependency change, no main merge/tag/public release, and no
human approval is inferred from source, timing, captures or green CI.
