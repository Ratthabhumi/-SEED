# Balance (v0.2.0-dev.0 — engagement pass; drop rates untouched)

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
- Weapons execute by archetype AND origin identity: only active families
  (origin pair + one Industrial expansion, max 3) tick damage. Kinetic fans
  projectiles until the Space beam tier; energy rotates projectile/aura/beam;
  defense spins orbit blades then guardian gunners; field keeps mine layers
  plus stage aura/orbit systems.
  Era weights (swarm/chaser/ranged/tank): stone 35/40/25/0,
  bronze 25/35/25/15, iron 20/30/25/25, industrial 20/25/27/28, atomic 18/24/28/30,
  space 18/22/28/32. Elite chance ≤22%.
- Elites: swift (+35% speed, −20% HP), armored (−35% incoming, −15% speed,
  +60% HP), volatile (110u / 12 dmg death burst, telegraphed), splitter
  (releases 2), shielded (35% max-HP shield ring). Affix pool membership requires
  implemented behavior + readable feedback.
- Age design A: transition auto-grants the age's spine node, opening the whole
  age frontier (≥3 generated draft options at every age, minus origin-locked
  dead cards). Kill gates per age: 25 / 60 / 120 / 200 (+ space boss).
- Knowledge gates (v0.2 provisional, evidence-driven): 500 / 1500 / 2800 /
  4500 / 6500 for Bronze / Iron / Industrial / Atomic / Space.
  Rationale: the golden readability run accumulated ~536 by 1:15, ~2958 by
  5:48 and ~6750 by 11:05 while old gates (60–900) never bound — advancement
  was timer/dwell/kill-governed. The new curve binds each transition near the
  observed trajectory (verified: dumb-play viability sims cross each gate
  close to its threshold) while keeping first Ascension in the 10–14 min band.
  Drop rates unchanged — one side of the equation first.
- Breakthroughs (typed, through the same effect system as techs): metallurgy
  +15% dmg/+10% know; war-machine +1 projectile/−10% cd; bioforge +1.5 regen/
  +30 HP; grid +1 aura/+15% dmg; fortress +60 HP/+1 guardian.
- POI first-discovery rewards (once per family per world): ruin →
  Science/Culture draft; meteor → Warfare/Kinetic/Energy draft; vault →
  Industry/Defense draft; signal → rare/mythic draft; megasite → 150 Knowledge
  + full heal (no modal); worldtree → full heal + survival draft. Repeats pay
  base Knowledge. Never stacks over an open draft.
  Reachability truth: only ruin/meteor/vault/signal spawn in worldgen;
  megasite/worldtree are authored, unit-tested and visualized but NOT
  worldgen-integrated (integrating them changes seeded POI type distribution —
  deliberate versioning decision deferred until after the engagement test).
- Ascension legacy prestige: child world resets level/XP/Knowledge/techs/build/
  weapons/origin (Level 1 Stone); run totals persist; exactly 1 of 3
  deterministic legacies (signature-breakthrough heir, top-family affinity, or
  bounded trait: +10% move / +15% knowledge / +30 HP) carries over, max 3
  slots FIFO. No raw-inflation legacies exist.
- Origins: HUNTERS Kinetic+Field; ENGINEERS Kinetic+Defense; RESONANT
  Energy+Field; SENTINELS Energy+Defense. All four viability-tested to Space.
- Enemy scaling: HP `×(1+0.28·age)(1+0.35·asc)(1+t/900)`; boss 40× tank + shield.

Sanity net: `tests/balance` + `tests/sim` (replay, fuzz 300, frontier, economy,
engagement incl. full origin viability runs).

## Human evidence — 2026-09-29 — PERCEIVED_DIFFICULTY_INCONSISTENT (NOT a rebalance)

- EPOCH-GOLDEN-001 office run: 10:15 survival, Space reached, 1258 kills,
  56 elites, 22 techs, 76 chunks, 26 landmarks, 0 bosses, 0 ascensions.
- Operator affirmed BOTH "ยากเกิน" and "ง่ายเกิน" plus unreadable visuals,
  indistinct enemies/weapons, unclear direction, Thai UI issues — and explicitly
  NOT stutter. Verdict: readability/wayfinding failure, not performance failure.
- Decision: NO numeric changes in this pass (enemy HP/damage/spawn/XP/knowledge/
  weapon/boss/age-gate values untouched). Re-run the same seed after the
  readability remediation; only then judge whether numbers are actually wrong.
