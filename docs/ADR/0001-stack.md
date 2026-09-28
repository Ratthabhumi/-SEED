# ADR 0001 — Stack: TypeScript + Phaser 4.2.1 + Vite + Vitest

## Decision

TypeScript strict, Phaser 4.2.1 (pinned), Vite 6, Vitest 3, Web Audio, localStorage.
No backend. Static relative-path build for itch.io.

## Rationale

Code-first TypeScript maximizes automated testing for procedural systems
(golden-seed tests run in Node without booting the engine). Phaser 4.2.1 is the
current Phaser 4 release (2026-07-09); the game uses only stable cross-version APIs
(Scene, Graphics, Arc, Text, Input, Scale.RESIZE), so the documented fallback to
Phaser 3.90.0 remains available without code changes if a blocker appears.

## Fallback rule

If a Phaser 4 API proves blocking after inspecting installed typings: pin 3.90.0,
record here, continue — never stall the milestone on an engine-version fight.

## Consequences

Phaser bundle ~1.75 MB (acceptable for itch). DOM handles text UI (Thai-safe);
canvas is for shapes/numbers only.
