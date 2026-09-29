# Balance (v0.1.1 provisional — retunable via data)

- Player: 100 HP, 220 speed, 90 pickup, dash 2.2s cd / 0.35s i-frame, touch-hit 0.6s i-frame.
- Knowledge is the SINGLE progression resource: `gainKnowledge(base) = base × mult`
  feeds level XP, the civilization age-gate total, and statistics — exactly once.
  A "+15% Knowledge" tech does what its description says.
- XP: `8 + 7L + 0.6L²` per level. Drops: base family XP, elite ×5, boss ×15 + burst.
- Threat: `B0=10, ka=0.55, kt=2.2`, smoothstep/720s; tick 2.2s, ≤24/wave.
  Elite economics (model B, explicit): ordinary-wave elites are composed from
  and paid out of the Threat Budget; the scheduled milestone encounter
  (3 elites / 75s, era-eligible) is outside the ordinary budget and separately
  bounded. Tanks locked until bronze on EVERY pathway.
- Weapons execute by archetype: kinetic fans projectiles until the Space beam
  tier; energy rotates projectile/aura/beam; defense spins orbit blades then
  guardian gunners; field keeps mine layers plus stage aura/orbit systems.
  Era weights (swarm/chaser/ranged/tank): stone 35/40/25/0,
  bronze 25/35/25/15, iron 20/30/25/25, industrial 20/25/27/28, atomic 18/24/28/30,
  space 18/22/28/32. Elite chance ≤22%.
- Elites: swift (+35% speed, −20% HP), armored (−35% incoming, −15% speed,
  +60% HP), volatile (110u / 12 dmg death burst, telegraphed), splitter
  (releases 2), shielded (35% max-HP shield ring). Affix pool membership requires
  implemented behavior + readable feedback.
- Age design A: transition auto-grants the age's spine node, opening the whole
  age frontier (≥3 generated draft options at every age). Kill gates per age:
  25 / 60 / 120 / 200 (+ space boss). Knowledge gates: 60 / 180 / 360 / 600 / 900.
- Breakthroughs (typed, through the same effect system as techs): metallurgy
  +15% dmg/+10% know; war-machine +1 projectile/−10% cd; bioforge +1.5 regen/
  +30 HP; grid +1 aura/+15% dmg; fortress +60 HP/+1 guardian.
- Enemy scaling: HP `×(1+0.28·age)(1+0.35·asc)(1+t/900)`; boss 40× tank + shield.

Sanity net: `tests/balance` + `tests/sim` (replay, fuzz 300, frontier, economy).
