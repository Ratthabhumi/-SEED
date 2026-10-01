# ADR 0006 — Core Engagement Loop (v0.2)

## Status

Accepted. Implements the audited engagement findings; preserves every v0.1.1
determinism/performance contract.

## Context

Human evidence (`docs/playtests/2026-09-30-golden-001-readability.md`): the
technical slice works end-to-end (Space → boss → Ascension ~11 min, no
stutter), but the run has no owned identity: all 4 weapon families fire every
run, most techs are scalar, synergies are invisible, POIs all pay Knowledge,
Knowledge gates never bind, and Ascension carries a maxed Space build into a
Stone-labeled world. Verdict: ENGAGEMENT_INSUFFICIENT.

## Decision 1 — Civilization Origins (build identity)

Each world begins with an Origin granting exactly TWO active weapon families:
HUNTERS (Kinetic+Field), ENGINEERS (Kinetic+Defense), RESONANT (Energy+Field),
SENTINELS (Energy+Defense). Inactive families neither render attacks nor deal
simulation damage. At Industrial, one WORLD EXPANSION unlocks exactly one of
the two inactive families (max 3 per world). Canonical state: `originId` +
`expansionFamily`; derived `activeFamilies()`. Draft pool excludes nodes whose
family-bound effects would do nothing. All four Origins must reach Space
(viability-tested).

## Decision 2 — Legible synergy plans

The seeded Tech DAG is unchanged. Cards show DOMAIN + RARITY + synergy
progress (`SYNERGY: <title> have/need`) and `COMPLETES: <title>` when the pick
finishes a Breakthrough. A HUD panel shows the two nearest Breakthrough goals.
Breakthroughs trigger a short reward beat (emphasis overlay + sting), so the
player feels "my choices caused this".

## Decision 3 — Mechanically distinct POIs

Positions/visuals unchanged. First discovery of each POI FAMILY per world pays
a distinct deterministic reward (canonical `poiFamiliesClaimed`): ruin →
Science/Culture draft; meteor → Warfare/Kinetic/Energy draft; vault →
Industry/Defense draft; signal → rare/mythic draft; megasite → Knowledge cache
+ full heal (no modal); worldtree → full heal + survival draft. Repeats pay
normal Knowledge. At most 6 major modals per world, each once per family.
Scope truth: only ruin/meteor/vault/signal spawn in worldgen; megasite and
worldtree contracts are authored, unit-tested and visualized but dormant
pending a deliberate worldgen-integration + versioning decision.
Reachability truth: only ruin/meteor/vault/signal spawn in worldgen;
megasite/worldtree contracts are authored and tested but dormant until a
deliberate worldgen-integration + versioning decision (post-engagement-test).

## Decision 4 — Real Knowledge gates (single resource kept)

XP and Knowledge remain one resource (`gainKnowledge` exactly-once untouched).
Only thresholds move, calibrated to the observed golden trajectory so the
Knowledge race binds without breaking the 10–14 min first-Ascension target:
Bronze 500, Iron 1500, Industrial 2800, Atomic 4500, Space 6500. Drop rates
unchanged (one side of the equation first). Rationale in BALANCE.md.

## Decision 5 — Ascension as legacy prestige (the core fix)

Child worlds reset world-build progression (level 1, XP/Knowledge 0, no
pending drafts, Stone, fresh owned/tags/breakthroughs/build/weapons/origin)
while preserving run totals (elapsed, kills, highest age, chronicle, damage).
Before crossing, the player picks 1 of 3 deterministic Legacy candidates
derived from the completed world (signature Breakthrough heir, top-family
affinity, or bounded authored trait — never raw inflation), then an Origin
for the new world. Max 3 Legacy slots (FIFO). New worlds start
stronger/different but still have a full build arc. `CONTENT_VERSION` 2→3.

## Decision 6 — Age transitions as payoff, civ dressing as signal

Automatic spine grant kept. Transitions get a short (~1s, skippable) moment:
age name + granted spine + active families' new weapon forms + sting. Civ
dressing gains per-age procedural geometry (presentation-only, cached,
below gameplay contrast).

## Non-goals

No 5th family, 2nd boss, minimap, quests, NPCs, crafting, backend, multiplayer,
galaxy map, mobile controls, art packs, monetization, dailies. No entity-count
or per-frame-DOM increases (perf-neutral pass).

## Consequences

- `RunConfig` gains `originId`; `ascend(legacyId, originId)` replaces `ascend()`.
- Canonical snapshot gains origin/expansion/legacies/POI-claims/draft-context.
- Package becomes `0.2.0-dev.0`; no tag, no itch release from this line.
