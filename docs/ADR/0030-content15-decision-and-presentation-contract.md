# ADR0030 — Content15 decision boundaries and coherent world presentation

Accepted implementation direction, 2026-10-14. Human quality acceptance pending.

PR9 parent fd171b239d00827d8100ae165d551d5766630cc7. Native EN/TH tests
failed before repair: Space already held during gameplay activates the first
focused draft button on release. This is an observed browser default activation,
separate from the Phaser queue replay repaired by ADR0028.

Document capture records held physical keys. Entering each decision snapshots
those keys; inherited repeats and release default actions cannot activate it.
Keyup still reaches Phaser to release level-polled movement. Number-key callbacks
reject repeat and DOM events predating the surface boundary. Fresh keyboard,
pointer and focus navigation remain available; no timeout-based debouncing.
Gameplay Space never queues dash while a choice/pause owns input. Shutdown
removes listeners. Queued blocking decisions snapshot independently.

`RunSimulation.claimStatus` owns eligibility and reasons. Claim mutation, C-key
and contextual UI consume it; free claim and canonical specialization affordability,
including the intentional full-cost first-Signal exemption, remain unchanged.
Only discovered sites receive guidance; distant sites receive move-closer feedback.

Boss canonical states: approach, warning, commit, attack, recover, phase-transition.
Fixed target, pattern-dependent generous warning/recovery, one release, explicit
half-health transition and a deterministic phase-two sequence. Slam/fan/cross
retain their exact damage geometry and fan's central escape gap. Elite chaser/ranged
use the existing warned rush/burst families; burst total damage remains one shot's
damage across three projectiles. No new entity/projectile caps or RNG streams.

Worldgen3 changes POI type affinity, keeping density, coordinates, IDs, discovery
rewards and positive support for all four mission families. Content15 intentionally
changes boss/elite decision traces. Save schema2 remains compatible; archived
version identities remain historical rather than relabeled as current seeds.

48 original front/back weapon-neutral costume cells cover four Origins and six
ages. One mounted weapon owns attack aim/recoil. Existing squad pose atlases are
retained until a distinct squad animation pass; no full authored animation claim.
Painted orbit objects use the actual damage coordinates/count and only active
canonical families. Skill HUD derives names, cooldowns and Legacy from live state.

Quiet original floor sources are made periodic once inside the Worker, then
sampled using world-stable warped coordinates instead of mirrored source motifs.
Biome blend,64 cache slots,256px upload cap/backpressure and context fallback
remain. Original art and rejected/history evidence remain. No runtime dependency.
Pillow normalization is an existing offline developer utility, not a game dependency.

One notification queue, three visible slots,64 waiting slots, critical preemption,
deduplication/counting and explicit counted overflow. Dwell freezes while hidden
or a modal pauses play; old-world notices are disposed at Ascension/restart.
Bounded overflow summarizes alerts, so it is not a durable event audit log.

Engineering tests, staged physical-GPU rendering, actual canonical stress and
human visual/fun approval remain separate evidence. Never infer acceptance from CI.

Live stress found a pre-existing restart failure on parent and first Content15
candidate: retained floating Text objects had their canvases destroyed by Phaser
shutdown. `floatTextAt.setColor` then threw in Frame.updateUVs/drawImage. The
corrected native energy-impact → restart → energy-impact regression fails on
the archived parent and passes after resetting Text/Image pools and pending
impact data in startRun. Initial fixture setup errors remain private evidence;
only the corrected null-drawImage failure proves the product issue. A benchmark
waits for the new HUD before staging restarted combat, avoiding old-hook races.
