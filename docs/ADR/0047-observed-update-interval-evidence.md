# ADR0047 — Bounded observed update intervals

Accepted engineering direction supplied by the owner/ChatGPT; no repeated web research.

Reuse GameScene's wall-clock interval, not smoothed engine delta or a second RAF.
Only QA/profiling creates the monitor; ordinary play has no histogram/observer.
Keep257 uint32 counters: [0,1) through [255,256), then >=256ms overflow.
Nearest-rank p50/p95/p99 expose bucket bounds, never falsely precise overflow.
Counter saturation is explicit and makes quantiles unavailable rather than wrapping.
Thresholds are strictly >33, >50, >100ms. Maximum is the observed active interval.

Coverage counts actual active observations. Initial callbacks, hidden callbacks,
return callbacks and canonical pause boundaries have separate counts. Reset the
adapter timestamp on both visibility transitions. Exclude the interval crossing
a canonical pause boundary too. Genuine continuously visible stalls stay counted.
Existing fixed-step simulation and input ownership are untouched.

LoAF is feature-detected and separate: unsupported/unavailable is not measured zero.
Its coverage is the whole observer session, including paused/hidden periods and
startup, not a purported exact subset of active histogram samples. Only aggregate
count/max/blocking time is retained; no URLs, stacks or script lists. Reset drains
pending entries; shutdown drains and disconnects. No new dependency.

Download a separate aggregate JSON sidecar through the bilingual F10 QA inspector.
Do not change Recorder/Report JSON, sparse checkpoints or the unmerged PR30 source.
No automatic upload of this private sidecar. Snapshot allocates only on request;
update uses fixed counters, no arrays/sorts/DOM writes per update.

These are OBSERVED_GAME_UPDATE_INTERVALS, not GPU_PRESENTED_FRAMES. Histogram
measurement and passing collection tests cannot establish strict physical
performance, real human enjoyment, authentic painted animation or release readiness.
