# ADR 0046 — Measured 1080p diagnosis; no speculative renderer change

Status: Accepted (V3.7, parent PR26 `d4b66c28`).

## Context

PR26 passes all 12 strict physical conditions at 720p and fails all 12 at 1080p.
Earlier A/A runs showed large same-code drift, and prepared ground, actor and
projectile batching already exist.

## Decision

1. Diagnose with bounded causal experiments before any optimization: a 2x2
   pixels × world-area factorial, diagnostic-only layer isolation
   (`layerCensus` / `layerIsolation`, e2e hook only), and per-call WebGL timing.
2. Ship no renderer change unless an interleaved same-build A/B shows a
   measurable benefit with raster parity.
3. Keep the strict gate (render p95 <8 ms AND sim p95 <4 ms, 24 conditions)
   unchanged, and add a separate REAL_GAMEPLAY_PERFORMANCE track built on the
   existing QA perf checkpoints and explicit human ratings.

## Findings

Cost follows covered screen pixels on the shared Intel UHD 630, not geometry,
DPR or GL-call stalls (< 0.3 ms/frame in GL). The same build later measured
1080p render p95 ~1 ms with GPU time ~40% lower, so host GPU contention
dominated the session (Parsec host service present; streaming unverified).

Actor alpha-bound trimming kept raster parity but showed no measurable timing
benefit, so it was reverted (`f220af5` → `2726e21`).

## Consequences

The strict gate stays 12/24 until a controlled-host re-run. Internal-resolution
scaling is not used and would not count as a native 1080p pass. Future fill
work, if a controlled host still fails, targets actor and terrain fill first.
