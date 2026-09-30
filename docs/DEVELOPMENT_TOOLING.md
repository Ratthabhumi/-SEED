# Development Tooling & Agent Workflow
**Project**: -SEED  
**Target Runtime**: Browser (HTML5 Canvas / WebGL)

---

## 1. Core Technology Stack
- **Game Engine**: [Phaser 4.2.1](https://github.com/phaserjs/phaser) (Presentation, rendering, audio playback, camera, input capture).
- **Programming Language**: [TypeScript ~5.6.3](https://www.typescriptlang.org/) (Strict mode, no implicit any, type checked via `tsc --noEmit`).
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/) (Instant HMR, production Rollup bundling).
- **Unit & Simulation Testing**: [Vitest 3](https://vitest.dev/) (High-speed deterministic simulation and contract unit testing).
- **End-to-End Testing**: [Playwright](https://playwright.dev/) (Automated headless Chromium browser verification, QA harness runs).
- **Code Assistant / Agent**: Google Antigravity (Pair programming agent running under strict repository persistent instructions in `AGENTS.md`).

---

## 2. Project-Local Agent Skills (`.agents/skills/`)
To assist AI agents in generating idiomatic, high-performance game code, curated skills from [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) are vendored locally in `.agents/skills/`:

1. `phaser-core`: Idiomatic Phaser scene lifecycle, loader caching, and camera management.
2. `game-ui-ux`: Spatial layout, HUD density constraints, and accessible touch/keyboard targets.
3. `create-game-assets`: Procedural sprite normalization, palette management, and silhouette hierarchy.
4. `game-feel`: Screen shake damping, hit stop frames, celebratory juice, and input buffering.
5. `input-systems`: Edge-triggered action handling, keyboard/gamepad glyph binding, and rebinding.
6. `camera-systems`: Deadzones, lead targeting, and smooth interpolation.
7. `performance-optimization`: Object pooling, garbage collection elimination, and draw-call batching.
8. `procedural-gen`: Deterministic RNG stream isolation and seeded chunk generation.

### CRITICAL GOVERNANCE RULE:
> **Skills are NOT architectural authority.**  
> Skills provide tactical code patterns and implementation cheatsheets. They do not have permission to alter the game direction, add unapproved libraries, change simulation invariants, or modify project contracts. Canonical authority resides exclusively in `docs/ARCHITECTURE.md`, `MVP_CONTRACT.md`, `AGENTS.md`, and direct instructions from the external human auditor.
