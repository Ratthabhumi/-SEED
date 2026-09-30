# ADR 0007 — Civilization Command Loop (v0.2.1)

## Status

Accepted. Implements the audited human-engagement FAIL on the frozen v020
evidence baseline (`fb29b8c`). Presentation + new gameplay systems; no
worldgen change; CONTENT 3 → 4.

## Context

v020 is technically stable (CI 36670662671 green) but HUMAN_ENGAGEMENT_RESULT
= FAIL: movement/kiting carries runs, no strategic pressure, POIs are
walk-past collectibles, the Tech DAG is invisible, drafts feel like losing
owned techs, and simultaneous "too hard + too easy" signals unreadable combat
rather than wrong numbers.

## Decision 1 — Three-gate age contract (no global clock)

Advancement = Knowledge + Age Mission + Stabilization (min time in the CURRENT
age). The old absolute-run-time gate is removed; pacing (~10–14 min to
Space/Boss) now comes from stabilization budgets plus real objectives.
`ageGates()` is the single source consumed by both the sim predicate and the
HUD checklist, so display and logic cannot disagree (contract-tested).

## Decision 2 — Age missions teach one layer each

Bronze: cull threat. Iron: claim territory. Industrial: slay an elite + hold.
Atomic: upgrade an outpost + repel a raid. Space: secure a signal + slay
guardians. Mission counters are canonical; pacing is proven by an engaged-bot
simulation (all origins reach Space < 1500s on EPOCH-GOLDEN-001).

## Decision 3 — Draft agency without breaking determinism

Reserve (one slot, re-offered while compatible), reroll (1/age), skip (bounded
knowledge consolation, queues chain), pin (bounded ×2 weight on the
prerequisite path — never a guarantee). Owned techs persist visibly; the draft
modal states that picks never replace owned techs. All agency state
(pinned/reserved/rerolls) is canonical and replay-equal.

## Decision 4 — Territory creates responsibility

Claimed POIs take one irreversible specialization (research/military/economy),
upgrade to tier 2 by holding, and draw deterministic raids on a schedule with
a warning window. Ignored outposts fall and can be repaired by presence.
Siege units are a canonical enemy flag marching on the raided post.

## Decision 5 — Micro without an RTS engine

One commandable squad per origin (follow/focus/hold via Q/E/R) plus one
origin active ability (F, bounded cooldown). Squad damage, contact risk, and
volatile exposure make positioning matter; all state is canonical.

## Decision 6 — Owned build visibility

Full-screen Tech Map (T) renders the SAME graph object the sim drafts
(`nodeStates()` by construction), with pin/unpin and an owned-build sidebar.
Build history (bounded FIFO, canonical) renders in the Chronicle. Minimap +
civilization map (M) show explored-only information (fog structural).

## Non-goals (this pass)

PvP/multiplayer, free-placement base building, worker economy, fog-of-war
empire AI, galaxy layer, dialogue quests, crafting/inventory, monetization.
