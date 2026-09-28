# Game Design — -SEED v0.1

## Pillars (in order)

1. Game feel 2. Readable decisions 3. Deterministic replayability
4. Civilization evolution 5. Systemic depth 6. Performance
7. Content scalability 8. Visual polish

## Core loop

MOVE → AUTO ATTACK → KILL → COLLECT KNOWLEDGE → LEVEL UP → CHOOSE 1 OF 3
→ SYNERGIES → EPOCH MILESTONE → ADVANCE AGE → WORLD EVOLVES → SPACE → ASCEND
→ NEXT WORLD → UNTIL DEATH → RUN CHRONICLE.

## Differentiator

One run = one civilization's entire history, stone → space, inside a single
survivor run. The master seed generates the world, the Tech DAG side-branches,
anomalies, enemy ecology, and ascension children. Same seed = same history.

## Ages (target pacing ~12 min to first ascension)

| Age | Min total | Knowledge | Objective (kills this age) |
|---|---|---|---|
| Stone | 0:00 | 0 | gather |
| Bronze | 1:40 | 60 | 25 |
| Iron | 3:40 | 180 | 60 |
| Industrial | 5:40 | 360 | 120 |
| Atomic | 7:40 | 600 | 200 |
| Space | 9:40 | 900 | survive → boss at +15s |

All three gates (time + knowledge + objective) must pass; never timer-only.

## Tech DAG

Critical spine guarantees completion (tools → metallurgy → ironwork → steam →
fission → orbital). Seeded side branches per age (3–4 nodes) hang off spine/siblings.
Validator enforces: acyclic, spine reachable, per-age ≥2 choices, offense + defense +
mobility/economy present, space reachable. Drafts pick 3 with category diversity.

## Synergies

Tag combos unlock Breakthroughs (metallurgy, war-machine, bioforge, grid, fortress).
Data-driven in `src/core/tech/synergy.ts`.

## Weapons (archetypes, not bespoke systems)

Projectile / Beam / Aura / Orbit / Summon / Mine. Four families × six age tiers:
Kinetic (spear→orbital lance), Energy (ember→solar beam), Defense (totem→satellite),
Field (trap→singularity). Content explosion via configuration.

## Enemies

4 behavior lineages (chaser, ranged, tank, swarm) reskinned/restatted per age.
Elites: 1 affix (swift, armored, volatile, splitter, shielded). Space boss: 40× tank.
Threat budget `B(t,a)=B0(1+ka·a)(1+kt·S(t))`, smoothstep over 720s, +35%/ascension.

## Meta

Archive unlocks possibility space (doctrines, anomaly classes, origins) — never raw
stat inflation. (V0.1 stores the schema; options wire up in V0.2.)

## UI/UX notes

- All text via i18n keys; DOM UI for Thai-safe rendering; canvas text numeric-only.
- Toasts for age/breakthrough/POI/boss; screen shake toggleable; autoplay-safe audio.
