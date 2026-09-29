# -SEED เมล็ดพันธุ์แห่งอารยธรรม

**One Seed. One Civilization. Infinite Futures.**

> Every seed is a different history. Take a civilization from stone tools to the stars — in a single run.
> หนึ่งเมล็ด หนึ่งประวัติศาสตร์ จากศิลาสู่ดวงดาว

**Status:** v0.1 playable vertical slice (itch.io HTML5). See `SESSION_HANDOFF.md` for the live state.

## Gameplay loop

MOVE → AUTO ATTACK → KILL → COLLECT KNOWLEDGE → LEVEL UP → CHOOSE 1 OF 3 TECHNOLOGIES
→ SYNERGIES → EPOCH MILESTONE → ADVANCE AGE → WORLD + ENEMIES + TECH EVOLVE
→ REACH SPACE → ASCEND → NEXT WORLD → UNTIL DEATH → RUN CHRONICLE

## Controls (desktop)

| Input | Action |
|---|---|
| WASD / Arrows | Move |
| Space | Dash (brief invulnerability) |
| 1 / 2 / 3 or click | Choose upgrade card |
| Esc | Pause |
| F3 | Debug / performance overlay |

## Seed concept

A shareable master seed (e.g. `EPOCH-A7F2-K19X`) deterministically derives terrain,
biomes, the Tech DAG, enemy ecology, POIs, bosses, and ascension worlds via independent
substreams. Same seed + same versions = same world. Seed identity = master seed +
worldgen version + difficulty. Details: `docs/PROCEDURAL_GENERATION.md`.

## Six ages

Stone → Bronze → Iron → Industrial → Atomic → Space → **Ascension** (endless child worlds).
Advancement needs minimum time + knowledge threshold + an age objective (never just a timer).

## Quick start

```powershell
npm install
npm run dev        # local dev server
npm run check      # typecheck + tests + production build
npm run test:e2e   # Playwright Chromium smoke (needs production build)
```

## Testing

```powershell
npm run test       # vitest: 160+ tests — seed/world/tech/director/sim/i18n/save/balance
npm run typecheck
npm run build
npm run release:verify  # 17 artifact checks (root index.html, limits, licenses…)
npm run test:e2e        # Playwright Chromium: smoke + 5 regression scenarios
```

## Architecture overview

- `src/core/` — framework-free authoritative logic, including the pure
  `sim/RunSimulation` (one instance per run; input in as `InputFrame`, effects
  out as `SimEvent`). **No Phaser/DOM/storage imports.**
- `src/content/` — authored data (enemy lineages, biomes, civ layers). Tuning lives here.
- `src/game/` — Phaser adapter: renders state, samples input, plays audio.
- `src/i18n/` — English + Thai, key parity enforced by test.
- `tests/` + `e2e/` — deterministic golden-seed + 300-seed fuzz + replay-hash
  tests, plus a Chromium smoke test.

Deterministic generation: seeded `xoshiro128**` substreams per subsystem + stateless
coordinate hashing for spatial features, so cosmetic changes can never shift terrain.

## Build / itch release

```powershell
npm run build
npm run zip      # → release/seed-web-v0.1.0.zip (index.html at root)
```

Upload procedure: `docs/ITCH_RELEASE.md`.

## Credits / licensing

See `CREDITS.md` and `LICENSE` (MIT).

## AI-assistance disclosure

Code, text, and balance in this repository were produced with LLM coding assistance
(OpenCode + Muse Spark) and reviewed by the maintainer. All procedural content is
generated at runtime by the game's own deterministic algorithms — that is core gameplay,
not generative-AI output. No copyrighted game assets, code, or text were copied.
