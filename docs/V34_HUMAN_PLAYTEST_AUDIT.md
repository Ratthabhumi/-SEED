# V3.4 — actual human play audit and focused recovery

Reviewed25 October2026. Parent PR23/source
`508537877b2c2606bfb6f6cf9844d2518ab7fbca`, clean recorded build,
Worldgen3/Content18/Save2. Status: **RECOVERED_INCOMPLETE / HUMAN_FUN_PENDING**.

## Facts and evidence

The new session is `qa-82121-40i640`, sanitized archive key
`63f14a27e12e0b3143646644`, seed EPOCH-GOLDEN-001. It is not PR19's
olderbc09b0fe session. All local raw evidence and original file timestamps
were preserved before changes; none is published. The latest pointer held
revision128, but an archived129 has two additional interactions and ten more
performance samples.25 archived snapshots for this session were found.
The sequence gaps alone do not prove missing gameplay events:129 is cumulative.

|Event|World simulation seconds|Elapsed wall seconds|
|--|--:|--:|
|Hunters starts, Stone|0|0|
|Bronze|98.62|136.45|
|Iron|157.93|214.18|
|Industrial|216.45|299.07|
|Atomic|334.28|430.93|
|Space / Boss arrives|382.98|490.36|
|Boss killed / Ascension offered|429.18|538.51|
|World2 starts, Engineers / heir-metallurgy / scarce|0|553.57|
|World2 +60s checkpoint|60.02|624.75|
|World2 Bronze|90.57|658.46|
|Last recorded interaction, site focus|96.58|665.19|

Thus at least11m05s wall time is evidenced; this is a lower bound, not a final
duration. `endReason` is empty, `wallEnd=0`, no RUN_END/PLAYER_DIED/target-complete
exists. Closing, pausing or continuing after the last snapshot is unverified.
Recorder wallStart is a monotonic millisecond value, not an epoch timestamp;
an exact absolute start/end cannot be reconstructed. Server archive stamps
span24October18:54:41–19:08:28 UTC and describe receipt, not play duration.

Eight recorded assertions pass; console errors/warnings, overflow and saturation
arrays are empty. Recorded actions:46 technology acquisitions, one map open,
one pin, five claim attempts/five claims/five specializations, one upgrade
attempt/success, one ability use, one raid incoming/repelled and a legacy choice.
No reroll/reserve action is recorded; their absence is not proof those controls
were unusable. Full Logistics affordability, input holds, precise Boss phase
attacks, pause/restart and artwork quality are not certified by these counters.
Full World Laws and graphics mode were not captured in this snapshot.

## Human feedback and priorities

The preserved telemetry contains zero ratings, zero feedback entries and no
comment. Subsequent owner chat explicitly says:

> ตรง อาวุธหลักอะ มันติดตัวละครเกินไป ให้มันลอยๆ อยู่รอบๆ ก็ได้ เผื่อมีอาวุธหลักหลายอันไง

This is real, unscored **weapon-spacing feedback**, received after the run;
it is not inserted into the old raw snapshot or converted into a fun score.
P1: correct the proven latest-report regression. P2: make the existing primary
weapon visibly detached and floating by default. No observed P0 gameplay
blocker is established. Human fun/readability/fairness/replay ratings stay PENDING.

## Correction and limits

The sink previously assigned latest in arrival order. Archived129 arrived
before128; the latter replaced the newer evidence. It now archives arrivals
first and advances latest only for a higher sequence within the same session.
Atomic file replacement prevents truncated JSON; latest JSON is published last.
New sessions and legacy snapshots preserve existing arrival semantics. Manual
`qa:report` also recovers a higher archived revision of the same session through
a read-only selector, so rerunning the report cannot regress this audit to128.
It preserves missing end reasons and does not alter the raw latest file. This is
not a cross-tab/global clock ordering protocol. Tests reproduce129→128 and
protect terminal revisions from older autosaves, with real Windows file writes.

The watcher correctly ignored this non-terminal run. No missed eligible terminal
report was found, so finalization was not forced. A reviewed sanitized partial
report and this audit recover the useful evidence without another long run.
The QA process was already running during inspection; archives end19:08UTC,
whereas the local BAT creation time is19:32UTC. Thus this recorded run cannot be
attributed to the newly created BAT. The untracked BAT is preserved separately.

The existing painted primary now floats in a clear elliptical station around
the hero, with a centered pivot and canonical-time motion. Pause freezes it;
Reduced Effects holds a quiet fixed station. Hand remains an explicit comparison
via `?equipment=hand`. Real release aim/reflection/recoil, one Image, projectile
origins/counts/cooldowns/damage and canonical input remain unchanged. A brief
release tether explains the connection without a permanent line over the body.
Multiple future primaries are not implemented or implied by extra cosmetic guns.

## Performance evidence, inference and hypotheses

Recorded viewport1268x1264, refresh estimate72Hz; graphics mode unknown.
Nine rolling checkpoints report frame p95=28.4–39.7ms, renderer CPU/API p95=
8.9–11.9ms, recorded simulation p95=1.04–1.50ms, cumulative worst frame90.9ms.
These are real frame-pacing concerns, not the controlled500/800 stress matrix.
Terrain cumulative maxima include refresh40.4ms and upload42.3ms; asynchronous
worker paint352.8ms is not a measured main-thread stall. Missing per-frame
timestamps/mode/GL/GPU traces prevent causal assignment to a particular action.
Terrain upload, other renderer work and host scheduling remain hypotheses.
No speculative renderer optimization, blind Boss downscale or balance change
follows. Keep PR23's physical22/24 failures (HC1080 dense9.4ms/Boss9.6ms);
fresh final-source measurements, if run, remain separate rather than erasing them.

## Research and next owner action

APPLIED: deterministic simulation, retained ground, HQ painted Boss, release aim,
localized loading, QA recording and the two focused corrections above.
PARTIAL: performance, movement/readability and human quality. REJECTED: production
vector Boss, blind downscale, fake anatomy, invulnerability and unproven caches.
NOT IMPLEMENTED: genuine layered painted animation and full in-between families;
retain V32_COMBAT_SLICE's artist brief. Original31 identities/statuses remain.

Next inspect the detached weapon at Stone/Space, strafing and Atomic beam,
Normal/Reduced/HC and pause/restart. Judge spacing and motion; one clear comment
is sufficient. End/save explicitly when possible, but the recovered run need not
be repeated for this audit. A future frame-drop report needs its graphics mode
and the approximate action/time. No CLEAN_PLAYTEST_READY or RELEASE_READY claim.
