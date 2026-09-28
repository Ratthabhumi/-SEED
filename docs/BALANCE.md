# Balance (v0.1 provisional — all values retunable via data)

- Player: 100 HP, 220 speed, 90 pickup, dash 2.2s cd / 0.35s i-frame, touch-hit 0.6s i-frame.
- XP: `8 + 7L + 0.6L²` per level. Shard 1, elite ×5, boss ×15 (+30×3 drops).
- Threat: `B0=10, ka=0.55, kt=2.2`, smoothstep/720s; spawn tick 2.2s, ≤24/wave;
  costs swarm/chaser 1, ranged 2, tank 4, elite 8. Elite chance ≤22%.
- Enemy scaling: HP `×(1+0.28·age)(1+0.35·asc)(1+t/900)`; boss 40× tank + 2× dmg.
- Kill gates per age: 25 / 60 / 120 / 200 (+ space boss). Knowledge gates:
  60 / 180 / 360 / 600 / 900.
- Breakthroughs ≈ +10% damage plus themed bonus; spine ≈ +15–20% per tier.

Sanity net: `tests/balance/completable.test.ts` runs 8 seeds through
graph-validity, finite-threat, sane-fields, XP-monotonicity, and weapon-stage checks.
