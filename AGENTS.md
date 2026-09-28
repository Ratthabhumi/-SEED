# AGENTS.md — persistent instructions for agents working in this repo

Read before modifying code (in order):
1. `README.md`
2. `MVP_CONTRACT.md`
3. `ROADMAP.md`
4. `SESSION_HANDOFF.md`
5. `docs/ARCHITECTURE.md`

## Non-negotiable rules

- **Never use `Math.random()`** inside simulation, procedural generation, combat logic,
  tech generation, loot, encounters, or any deterministic system. Use seeded streams
  (`src/core/seed/*`). Exception: purely cosmetic non-gameplay effects (e.g. title
  starfield) — and mark them as such.
- **Renderer never owns canonical gameplay state.** `src/core/**` must not import Phaser.
  Phaser scenes render + capture input; rules live in `core/` and `content/`.
- Any intentional worldgen compatibility break must increment `WORLDGEN_VERSION`
  (`src/core/seed/versions.ts`). Any save-schema change needs a migration or a
  `SAVE_SCHEMA_VERSION` bump with safe fallback.
- No new dependency without a concrete reason recorded in an ADR or the handoff.
- Record significant architecture decisions in `docs/ADR/`.
- No secrets in source control. No force pushes. No rewriting unrelated history.
- **Do not remove tests merely to obtain a green build.** Fix the system or fix the test's
  expectation with a documented reason.
- Performance budgets (`docs/PERFORMANCE_BUDGET.md`) are acceptance criteria.
- If a feature threatens the v0.1 scope, cut the feature — never damage the architecture.
- Run the complete check before declaring a milestone complete: `npm run check`
  (typecheck + tests + production build).
- Update `SESSION_HANDOFF.md` before ending any substantial implementation session.
- Thai rendering is release-blocking: never split Thai strings by UTF-16 code units
  (use `Array.from`), keep EN/TH key parity (enforced by `tests/i18n/parity.test.ts`),
  and keep `line-height ≥ 1.7` for Thai UI text.

## Workflow

- Branch per workstream: `feat/<topic>-YYYYMMDD`. Commit by meaningful milestone.
- After each passing milestone: run verification → commit → update `SESSION_HANDOFF.md`.
- Originality: learn from genre conventions only. Do not copy code, art, audio, names,
  or balance values from any existing game.
