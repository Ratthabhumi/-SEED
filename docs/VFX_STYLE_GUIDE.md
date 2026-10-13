# Combat presentation checkpoint — 2026-10-12

## Current shared material contract — 2026-10-13

Default friendly projectiles/traps and mounted equipment use original painted
atlases, actual canonical role/tier/coordinates and bounded pools. Amber physical
arrows, blue brass devices, violet/cyan crystal bolts and teal armored darts
share actor materials/upper-left highlights. Bright directional cores and small
decorative tails remain readable at real zoom; collision does not follow artwork
length. Essential projectile bodies remain visible under Reduced Effects.
High Contrast retains explicit geometric weapon/projectile/device silhouettes.

Beams/chains/areas deliberately remain exact-path geometry with dark separation,
bright cores and restrained outer color. Rings, HP bars and hostile barbs encode
combat information; do not replace their actual geometry with decorative art.
Event-triggered existing charge/release/impact/audio and pools remain bounded.
No fake new attacks, randomized cosmetic gameplay stream, bloom shader or new
damage rule. Full authored powers/impact/hostile animation remains acceptance
work. New POI/Guardian/codex assets do not certify actor animation.

Content14 integration: Hunters kinetic arrow/bow, Engineers ribbed mechanical
release, Resonant fork/branch beam and Sentinels faceted prism share one typed
presentation registry. Actual weaponStage selects equipment/shot material;
actual damage events select impacts. Nova expands at its captured cast origin
within the real260u radius; Bulwark facets require its real iframe window;
Overdrive equipment requires its real timer. Kill observations retain family,
radius and tier before pool reuse; DeathResponse uses at most12 pooled fall/fade
images for0.3 simulation seconds, disabled by Reduced Effects and reset per world.
This is posed motion/feedback, not an authored death animation. Existing voice,
beam and spark caps remain. High contrast retains functional geometry. See
ADR0028 and the integrated closure review for measurements and limitations.

Original stylized science-fantasy presentation, using the typed theme and existing
licensed impact texture. This is the first Energy signature prototype, not an
approval of production art or a completed four-family overhaul.

| Phase / trigger | Duration | Geometry / scale | Alpha / blend | Bound |
|---|---|---|---|---|
| Energy beam readiness: acquired beam, target within canonical 800u range, actual cooldown in (0,.2] | last .2s of cooldown | 7–13u charge coil, 2–4u core at hero | .7/.8 × charge; normal | one |
| `beam_fired`: actual weapon family, spawn tier and immutable source/target | .12s | stage-colored 4–10u sheath; cream core; 18u muzzle fan | original beam .85/.95; muzzle fades; normal | 8 concurrent beams |
| `energy_impact`: resolved HP/shield damage, before enemy slot reuse | .24s | 5 deterministic sparks, size 6–18u; shield ring only when shield absorbed damage | .8 × decay; normal | 32 impact groups / 160 sparks |
| Existing original `seed_hit_impact` texture, same actual impact | .24s | 24→48u, fixed center/pivot | .55 × decay; normal | 8 preallocated images |
| Existing canonical target flash | existing .08s | existing enemy sprite | existing tint | visible enemy pool |
| Damage number | existing float-text lifetime | actual HP loss, shield absorption excluded | existing text pool | 12 total texts shared with other combat feedback |
| Release sound | .1s | original synthesized Energy/kinetic timbre | gain .06; inherited volume/mute | inherited 8 voices / 50ms same-tone throttle |

Charge is advisory readiness: targeting can change before the actual shot. It does
not delay simulation, promise a hit, lock aim, add knockback or grant damage.
The rendered release stays at its real firing origin when the player moves.
Beam/impact clocks use simulation elapsed time, so fixture/game pause freezes
them. Existing floating-text tweens retain their original lifetime. Pool reset on world/restart prevents parent effects appearing in a child.
Offscreen endpoint/impact culling and fixed counts bound submission work. No
fullscreen shader, new dependency, cosmetic gameplay RNG or routine-hit shake.

Reduced Effects suppresses charge, muzzle, sparks, impact sprites and damage
numbers; the actual beam line and every existing hostile warning remain. Audio
continues to obey the independent volume setting. Native EN/TH captures include
charge, actual impact and Reduced Effects.

Existing Conduction/Relay retain their actual canonical chain/fusion behavior.
New impact observations do not change their target selection, damage or RNG.
Their .12s arc presentation now uses simulation time and clears on Ascension,
so pause freezes the path without leaking parent arcs into a child. EN/TH native
before/after captures select the real Conduction draft card: two further enemies
take actual damage only after selection. Offers/arena are explicitly staged;
selection and combat run the production UI and canonical methods.
Kinetic, Defense and Field retain their existing primitives; polished signatures
for those families and mounted authored hero attacks remain pending. No claim
that a renderer-only effect is a new acquired skill.
