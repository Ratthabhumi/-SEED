# V3.3 performance recovery and startup lifetime

Parent PR22/c529f7c47d2e142b51e37255fd965fd24a966d03; one child Draft.
No integration, release or human acceptance. Versions remain3/18/2.

## Diagnosis and decision

Actual immutable official PR21/835a25f and PR22/c529f7c packages were served
on this Windows i5-9500/UHD630/D3D11 host. First, instrumented identical-PR22
A/A sampled eight alternating3s windows per mode. HC renderer p95 ranged
3.8–15.8ms with unchanged paused hash; ground and combat spans both drifted.
Across HC windows1668 valid async GPU samples, zero disjoints and zero texture
upload calls were recorded. Inclusive spans must not be added/subtracted.
This demonstrates substantial host/scheduling variability, not its OS-level
cause and not a proven code speedup. PR22's original19/24 remains unfavorable
evidence; a fresh matrix cannot erase it.

The40-row PR21/PR22 HC comparison retains all windows, including unfavorable
ones. A short unit-test/typecheck accidentally overlapped part of this campaign;
therefore this is **not an isolated causal performance comparison**. No renderer
optimization is justified from it. Raw results and this limitation are retained.
Separate same-PR22-code128/256 texture-override diagnosis is explicitly labeled
as a diagnostic overlay, not a production build or approved pixel comparison.
Preserve the genuine256px painted Boss; no density/threshold/balance reduction,
new caching prototype, arbitrary immunity or fake anatomy is introduced.

Same-code eight-window Boss control (256/128/128/256/128/256/256/128):
CPU/API p95=1.6/1.5/8.1/6.3/1.0/1.6/1.2/3.2ms;1441 async GPU samples,
zero disjoints/errors. No consistent texture-size penalty is established.
Compressed original diagnosis and SHA256 checksums: `docs/evidence/v33-recovery`.

## Corrected observable defects

The old HC restart test required a transient zero after restart, although its
failure screenshot already showed Attempt2,13s and14kills. New legitimate shots
can repopulate the fresh cache before polling. The cache now explicitly clears
CPU entries/references on Scene shutdown, exposes a renderer-only generation,
and reports disposal. A regression retains a reference to the old cache, proves
it is disposed/empty, observes a different live generation, then re-stages800
canonical shots and checks bounded reconstruction. Shared atlas ownership stays
with Phaser's texture manager; the Scene owns its mesh. No canonical IDs change.

The preserved Thai1080 video trace shows a19.5s wall-time HUD assertion and an
8.215s terrain-worker fetch. It does not prove a font defect or a particular
background process was causal. Startup now waits for the actual simulation hook,
visible HUD and loaded fonts. Only the painted video-review family receives a
documented45s initialization cap; other helpers keep15s. A stalled application
still fails. Actual loading now has an EN/TH status/progress surface instead of
leaving the title apparently unresponsive. Resource-gated EN/TH720/1080 tests
hold the Boss request, inspect the native loading surface, then release it and
require a real initialized game. Thai line height remains at least1.7.

Original PR22 failure traces/logs are preserved in ignored scratch and their
existing public receipt; they are not deleted or replaced with isolated passes.

## Scope and research classification

- APPLIED: controlled A/A, exact served identities, explicit lifetime ownership,
  resource-aware readiness and localized loading feedback.
- PARTIAL: strict physical performance recovery; final source receives its own
 24-case receipt with all failures. Native staged evidence is not natural fun.
- REJECTED: blind Boss downscale, threshold/density relaxation, another unproven
 ground cache, fake painted joints, HP inflation and fabricated human approval.
- NOT IMPLEMENTED: genuine layered painted animation; retain the concrete artist
 brief in V32_COMBAT_SLICE. No external market research is required for these fixes.

## Owner diagnostic QA

Use the exact published source/package and `npm run qa:human`. In Thai and
English, begin a run, confirm visible loading then readable HUD, play naturally
through draft/Logistics6/6/first Signal, strafe/fire and inspect Atomic beam grip.
Observe Boss approach/warning/release/full recovery/phase2; lethal damage stays
lethal. Progress canonically to World2; pause/resume/restart and confirm fresh
HUD, input and projectiles. Report frame drops with mode/resolution/time.
Staged800-shot fixtures and prepared ascension clips are diagnostic evidence,
not a natural victory. Record an interrupted session as INTERRUPTED_BY_BUG;
never infer HUMAN_FUN_PASS from tests. Stop at this one child Draft PR.
