# Playtest Evidence — EPOCH-GOLDEN-001 Readability Era (2026-09-30)

> EVIDENCE GAP (recorded honestly): the formal `playtest-report.md` /
> `playtest-report.json` from this run were NOT preserved — the game was closed
> before END PLAYTEST was pressed. What follows is auditor-observed evidence
> (screenshots + direct human statement), not recorder output. Threshold and
> design decisions derived from it are PROVISIONAL and must be re-confirmed by
> the first instrumented v0.2 Gate A run. Do NOT infer numeric sentiment scores.

## Route (observed)

- Seed `EPOCH-GOLDEN-001` reached Space, boss defeated, Ascension offered and
  used, child world #2 loaded. First Ascension at ~11 minutes.
- Post-Ascension 60s window: NOT completed (run closed early).
- No meaningful stutter reported. Readability improved vs the 10:15 run.

## Knowledge accumulation (observed)

- Stone ~1:15: Knowledge 536 / 60 gate.
- Industrial ~5:48: Knowledge 2958 / 600 gate.
- Space ~11:05: Knowledge ~6750 accumulated.
- After Ascension: Knowledge still ~6750 → child-world gates trivially satisfied.
- Conclusion: age advancement is governed by timer/dwell/kills; the Knowledge
  gate is nominally present but practically dead.

## Build state (observed)

- Level 20–27 carried into child world (Stone label, Space build). By current
  code design this is NOT a bug — Ascension preserves the whole build — but it
  destroys the Stone→Space escalation loop after the first planet.
- All 4 weapon families maxed (Space spine sets every stage to 5).
- Example draft (Level 20): Fission +20% damage / Fort +40 HP / Rotary +15%
  attack speed — all useful, none changes how the run plays.

## Human statement (authoritative)

"เริ่มสนุกขึ้นนิดหน่อย แต่ยังไม่ทำให้คนเล่นติด/อยากเล่นต่อ"

Translated for design purposes: ENGAGEMENT_INSUFFICIENT (not "addiction
failure", not a balance verdict).

## Feedback-button ambiguity (observed)

The QA panel mixed negative statements and positive questions under one
"click means feedback" interaction (e.g. "ภาพอ่านยาก" beside "สนามอ่านออกไหม?"),
so presses cannot be scored. Fixed in v0.2 (unambiguous event labels).

## Presentation note

Screenshots were taken with the F4 QA overlay ON (chunk box, POI lines, debug
text). F4 is diagnostics, not the normal game face — feel evaluation must be
done with F4 OFF. QA recording is unaffected by overlay visibility.
