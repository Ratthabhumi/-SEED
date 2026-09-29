# ADR 0004 — Human Playtest QA Harness (read-only, query-gated)

Status: accepted (v0.1.1 stabilization, human operator authorized).

## Context

Human Gate A requires a real full run (Stone → Space → Boss → Ascension) plus
Thai visual QA and hardware performance evidence. Asking the operator to
hand-record times, F3 percentiles, and state invariants turns the gate into
manual QA labor and produces thin, error-prone evidence.

## Decision

- New `src/qa/` layer: pure recorder/sampler/report/visual modules plus one
  browser-only session glue (`qaPanel.ts`). `src/core` stays pure; QA observes
  `RunSimulation`, `SimEvent` flow, renderer metrics, and DOM read-only.
- Activated only by `?qa=1`. Normal launch (`/`) has zero QA behavior and no
  gameplay effect. QA mode adds no XP, kills, teleports, age forcing, damage,
  or RNG changes — the operator genuinely plays.
- No world hard-bounds: -SEED stays an unbounded chunk world. QA ships a
  diagnostic overlay (F4: chunk box, POI direction, objective readout) so
  navigation/readability problems can be proven from evidence before any
  guidance feature (compass/minimap/beacon) is designed.
- The harness reports `AUTOMATED_CHECKS_PASS/FAIL` for machine-checkable
  invariants only. It can never declare `HUMAN_GATE_A_PASS`; fun, clarity,
  readability, and Thai typography remain human judgment.

## Consequences

- `GameScene`/`TitleScene` gain small query-gated branches; adapter maps sim
  state to plain QA frame data. Overhead in normal mode is one
  `URLSearchParams` check per scene creation.
- QA code ships in the production bundle but is inert without `?qa=1`.
- New tests: `tests/qa/*` (pure modules) + `e2e/qa.spec.ts` (gate flow).
