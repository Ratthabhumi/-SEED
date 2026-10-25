# V3.2 visual identity and combat slice

Parent: PR21, `835a25f821b5aa0e8492c9f13787a3d7aa59f6ad`.
One child Draft PR; stop for owner playtest. No integration/release authority.

## Production target and implemented slice

Keep the existing painted three-quarter civilization figures and basalt/ember
Boss. Pale metal/wood/cloth lead into glowing Space equipment; the terrain is
lower contrast than bodies, with small dark floor contacts, never a hazard ring.
Preserve asymmetry and silhouettes. The rejected violet vector rig stays opt-in.
Recover actual Boss detail from its untouched1774x887 original into eight256px
cells (1024x512), replacing the128px derivative. This is a fresh downsample of
the real source, not an upscale of the old sheet or newly generated anatomy.
Keep the same240u world footprint. Texture RGBA rises0.5→2MiB (+1.5MiB);
the same single Image submits it. Measured per-cell floor metadata and manifest
hashes follow the regenerated derivative; other source artwork is preserved.

Real beam releases now reach the same primary mount as projectile releases.
Only kinetic/energy events emitted at the player steer the body and weapon;
remote/autonomous Defense/Field releases cannot turn the hero. During the actual
160ms release, body facing and its existing authored hand socket follow aim,
including while strafing. Locomotion history is copied before this override.
Imported staff cells already point right (the raw source is diagonal); preserve
that normalization. Leftward equipment uses a vertical mirror and reflected
grip origin to stay upright. Quadratic2u recoil settles
in canonical seconds. Hand remains default; Float is still one tethered weapon.
No emitter, shot count, cooldown, damage, collision or input change.

Boss motion now observes actual position changes: the generic enemy helper had
reported a Boss without evolution data as perpetually moving. Stationary Boss
poses no longer cycle stride cells or float. Measured alpha bottoms of the
unchanged eight cells set a common floor pivot; anticipation and recovery lean
about that contact. Locked attacks face their locked target. Phase2 retains
the same painted silhouette with a warmer material tint. Existing hit/defeat
cells, full recovery, Reduced Effects, pause/rewind/world cleanup remain.
Floor contacts are bounded to hero, Boss and focused enemy; no swarm-wide new
draw-object pool. Existing source-distinct painted ordinary/burst/fan shots,
hit/kill/reward/cooldown feedback are retained rather than replaced wholesale.

## Art dependency and concrete artist handoff

This is a presentation/counterplay readability correction, not newly authored
anatomy or a complete animation family. Existing flattened atlases cannot supply
hidden joints or genuine in-betweens. Do not manufacture them by warping pixels.
For the next artist delivery use Krita layered source with separate silhouette,
head, torso, near/far arms, hands, weapon, near/far legs, feet, cape, emissive
cracks and shadow. Supply genuine front/back turns and left/right asymmetry.
For Boss: rest, two full stride cycles, Slam/Fan/Cross anticipation, release,
recovery, hurt, transition and defeat. Preserve feet and hammer volume. For
Hunters Stone/Space: idle/walk/dash/release/recovery/hurt/defeat with stable
costume and a separate weapon layer/socket track. Export transparent PNG
sequences at128px cells plus a2x source, explicit fps/tags, pivot(64,83.2),
ground(64,116), per-frame hand socket and contact bounds. Feed the existing
PNG/sheet importer; no new animation engine/dependency. Review at126u hero/
240u Boss and native720/1080 before expanding all Origins/Ages.
All original source PNGs/hashes are unchanged;62 assets remain under the existing
manifest. Only the Boss derivative/hash changes through the reproducible
`scripts/normalize-boss-detail.py`; no new source artwork/third-party asset.

## Boss phase decision

Reused Natural36:24 reached,21 won,21 phase2 attacks, including a Hunters4.72s
pre-phase2 kill. Half-HP escalation waits for committed attack and full1.4–1.85s
punish window; .4s transition then phase2 cadence. Rapid lethal damage remains
lethal. That one trajectory does not justify HP inflation or invulnerability.
No balance/version change (Worldgen3/Content18/Save2). Preserve all losses,
unreached cases and the two different native PR21 encounter outcomes.
Targeted read of the official PR21 Hunters/GOLDEN-002/damage trace: Boss
HP12131.74, first warning2.20s, commit3.35s (HP9044.77), attack3.50s,
recovery3.683s (HP6132.80), HP2832.58 at4.017s, lethal4.717s while still
recovering. Damage multiplier19.4131, largest damage step2135.44. This is a
burst entering the protected punish window, not a missing phase2 controller.
The fixed policy is synthetic canonical progression, not a human difficulty
rating; preserve the original36-case receipt rather than resampling this loss
of phase exposure until a preferred outcome appears.

## Research classification and acceptance

APPLIED: existing Phaser sheets, authored sockets, canonical-time release,
grounding, one representative Stone→Space equipment path. PARTIAL: authentic
motion, material hierarchy, combat feel and scale (native owner judgement
pending). REJECTED: violet vector production Boss, invented anatomy, uniform
enlargement, arbitrary HP/immunity and repeated development benchmark campaigns.
NOT IMPLEMENTED: new artist-owned source/in-betweens, all-Origin redesign,
new Boss balance and any HUMAN_FUN_PASS claim. No market research repeated.

Early native screenshots/short clips compare the actual immutable PR21 package
to a labeled dirty candidate before long CI. Exact-source final evidence and
every failed attempt belong in this workstream's PR, never restamped onto early
captures. Performance baseline remains PR21; final physical suite runs once
with strict CPU/API render<8ms and sim<4ms. GPU/RAF/fun are separate measures.

## Natural human QA

Run `npm run qa:human`; open http://localhost:5173/?qa=1. Play a fresh Hunters
run naturally Stone→Space, strafe while firing both directions, inspect attack/
hurt/foot contacts and real Boss warning→impact→recovery→phase2. Try Resonant
beam and optional `&equipment=float` separately. Pause/resume, open a Tech Draft
while holding Space/movement, release keys, then continue through World2+120s.
At720/1080 EN/TH normal/200% verify HUD, warnings and contextual actions. Retry
full Logistics claim→Later/Esc→movement and the first Signal exemption. Record
actual art/motion/readability/threat/fairness/fun/replay ratings. A blocker stays
INTERRUPTED_BY_BUG; automated/staged footage never supplies human ratings.
