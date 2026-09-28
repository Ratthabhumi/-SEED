# MVP Contract — v0.1 Vertical Slice

## Promise

A browser-playable survivor roguelite run that compresses a civilization from the
Stone Age to the Space Age in ~12 minutes, then ascends endlessly. Deterministic,
seed-shareable, Thai + English, releasable as a static itch.io ZIP.

## In scope (Definition of Done)

1. Title screen + seed input + random seed + language toggle
2. WASD movement, dash + i-frames, automatic attacks
3. Enemy swarm (4 behavior families), elites with affixes, threat director
4. XP / Knowledge, 3-card level-up with category diversity
5. Procedural Tech DAG (validated: acyclic, spine-reachable, viable choices)
6. 6 ages with time + knowledge + objective gating, visible world evolution
7. Deterministic chunk world (512u, 3×3–5×5 active), ≥4 biomes, ≥4 POI types
8. ≥1 boss + milestone elite encounters, Space transition, endless Ascension
9. Death screen with full Run Chronicle, run statistics
10. Seed display / copy, localStorage saves (versioned, corruption-safe)
11. TH/EN localization with key-parity test, bundled Thai fonts
12. Procedural Web Audio SFX, F3 diagnostics, deterministic tests, itch-ready ZIP

## Out of scope (→ ROADMAP.md)

Multiplayer, backend, accounts, cloud saves, NPC dialogue, colony sim, diplomacy,
crafting inventory, galaxy flight, 3D, WFC cities, Steam, LLM runtime, 50 handmade
enemies, 100 handmade weapons.

## Acceptance

`npm run check` green (typecheck + all tests + production build) AND a human can:
new run → fight → draft → advance ≥3 ages → die → read chronicle → share seed.
