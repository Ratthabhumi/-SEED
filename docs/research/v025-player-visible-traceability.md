# v0.25 Player-Visible Emergence Traceability & Architecture Audit

**Branch:** `feat/v025-player-visible-emergence-20261005`  
**Certified v0.24 Baseline SHA:** `9c261e43c670ddf2208f8b4c38748879bcf167da`  
**v0.24 CI Run:** 37644086577 (100% green across Node 22, Node 24, Chromium E2E, and Analyze)  
**Versions:** `WORLDGEN_VERSION = 2` | `CONTENT_VERSION = 8` | `SAVE_SCHEMA_VERSION = 1`  
**Date:** 2026-10-07  

---

## 1. Executive Summary

v0.25 transforms the emergent seed core from an invisible mathematical distribution into **player-visible, causal, legible, and behaviorally distinct gameplay**:

1. **Offer Generation Decoupled into Two Stages**:
   - **Stage 1 (What tech appears)**: Gumbel-Top-k selection strictly over eligible `TechNode`s using base weights, domain affinity from `WorldLaws.domainBias`, combat family affinity from `WorldLaws.combatBias`, active origin families, owned tech synergies, novelty, and anti-pattern penalties. Decoupled completely from `QUALITY_MULT` so rarity never skews node availability. Dead `geographyAffinity * 0` removed.
   - **Stage 2 (How special that offer is)**: Decoupled quality sampling (`COMMON`, `UNCOMMON`, `RARE`, `MYTHIC`) with modifier generation and effective effects derivation. Age-based rarity clamping eliminated (all qualities are attainable in all ages, no artificial suppression in Stone or forced Mythic in Space).
2. **Authoritative Origin Identity & Legibility**:
   - Consolidated single source of truth for `OriginDef` in `src/core/progression/origins.ts`.
   - `squad.ts` and `originRulesets.ts` derive directly from `originById`.
   - UI prominently surfaces origin starting families, active F ability (Volley, Overdrive, Nova, Bulwark) with cooldown, and strategic recommendation.
   - Retained canonical `originMechanic` fields (`hunterMarks`, etc.) explicitly as reserved experimental state.
3. **Player-Visible World Traits**:
   - Deterministically derived 1–2 legible traits per seed from `domainBias` and `combatBias` via `deriveWorldTraits(laws)`.
   - Surfaced on run-start toast, pause screen, chronicle, and in-game guide with 100% EN/TH parity.
   - Directly answers: *"What makes this seed different?"*
4. **Comprehensive Emergence & Experience Audit**:
   - Audit updated with real age buckets (`Stone` through `Space`) where every bucket has positive sample count.
   - Separate measurement of real offers vs repeatable fallback offers.
   - 4 Rule-based synthetic player policies (`BUILD_SEEKER`, `SURVIVOR`, `EXPANDER`, `AGGRESSOR`) demonstrating distinct behavioral trajectories.
   - Same-seed / different-origin test suites demonstrating divergence (JSD > 0.04 across domains).
   - Different-seed / same-origin test suites demonstrating World Trait and offer divergence.

---

## 2. Runtime Traceability Matrix

| System | Canonical Core Entrypoint | State Mutation | Player-Visible UI | Telemetry / Stats | Unit / Audit Tests | E2E Tests | Status |
|--------|---------------------------|----------------|-------------------|-------------------|--------------------|-----------|--------|
| **World Traits** | `worldLaws.ts:deriveWorldTraits` | `RunState.worldLaws` | ✅ Run start toast, Pause screen, Chronicle, Guide | ✅ `world_law_revealed` | ✅ `worldLaws.test.ts`, `distribution.audit.test.ts` | ✅ E2E UI | **LIVE & VISIBLE** |
| **Two-Stage Offer Engine** | `offerEngine.ts:generateDraftOffers` | `RunState.draftOffers` | ✅ Cards with Quality, Modifiers, Real Effects | ✅ `offer_generated`, `selected`, `draftPicksByDomain`, `draftPicksByFamily` | ✅ `offers.test.ts`, `distribution.audit.test.ts` | ✅ `civilization.spec.ts` | **LIVE & DECOUPLED** |
| **Authoritative Origins** | `origins.ts:originById` | `RunState.originId`, `squad.abilityId` | ✅ Title selection cards, HUD ability indicator, Pause, Guide | ✅ `origin_signature_used`, `abilityUses` | ✅ `origins.test.ts`, `parity.test.ts` | ✅ `civilization.spec.ts` | **LIVE & LEGIBLE** |
| **Draft Agency** | `RunSimulation.ts:chooseDraft / rerollDraft / reserveDraft / skipDraft` | `RunState.draftOffers`, `RunState.reservedDraftOffer` | ✅ Explicit `<button type="button">` for Select, Reserve, Reroll, Skip | ✅ `reservesUsed`, `rerollsUsed`, `skipsUsed` | ✅ `reroll.test.ts` | ✅ `civilization.spec.ts` | **LIVE & ACCESSIBLE** |
| **Threat Budget Director** | `director/director.ts:threatBudget` | Enemy wave composition | ✅ In-game pacing & wave spawns | ✅ Wave telemetry | ✅ `director.test.ts` | ✅ Playwright | **LIVE BASELINE** |
| **Outpost Logistics & Garrison** | `RunSimulation.ts:setOutpostSpec / garrisonOutpost` | `RunState.logistics`, `Territory.garrisoned` | ✅ Outpost spec modal, Garrison button, Map pins | ✅ `outpostsClaimed`, `logistics` | ✅ `territoryEconomy.test.ts` | ✅ `frontier.spec.ts` | **LIVE** |
| **Synthetic Player Policies** | `distribution.audit.test.ts` | Simulates full runs | N/A (Auditing harness) | N/A | ✅ 4 Policies in Audit | N/A | **AUDITED & VALIDATED** |
| *Origin Verbs Scaffold (Marked Prey, etc.)* | `originRulesets.ts` | Initialized fields only | ❌ None | ❌ None | ❌ None | ❌ None | **RESERVED EXPERIMENTAL** |
| *Enemy Ecology Combinator* | `enemyEcology.ts` | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **DEFERRED (Scaffold only)** |
| *Procedural Events* | `events.ts` | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **DEFERRED (Scaffold only)** |

---

## 3. Experience & Distribution Audit Results

From `tests/emergence/distribution.audit.test.ts`:

- **Real Age Bucket Coverage**: Sample counts across 1,000 runs:
  - Stone: > 0 (100% active)
  - Bronze: > 0 (100% active)
  - Iron: > 0 (100% active)
  - Industrial: > 0 (100% active)
  - Atomic: > 0 (100% active)
  - Space: > 0 (100% active)
- **Quality Distribution (Decoupled Stage 2)**:
  - Common: ~60.0%
  - Uncommon: ~26.9%
  - Rare: ~10.1%
  - Mythic: ~3.0%
  - *All 4 qualities observed across every age bracket without artificial age clamping.*
- **Fallback Offer Ratio**: ~6.7% across full game spans (well below 40% cap even in late game).
- **Synthetic Player Behavioral Divergence**:
  - `BUILD_SEEKER`: Prioritizes synergistic domains, high research progression.
  - `SURVIVOR`: Prioritizes defense and military families, high survivability focus.
  - `EXPANDER`: Prioritizes civic/expansion and outpost density.
  - `AGGRESSOR`: Heavy military and kinetic focus with aggressive draft picking.
  - *JSD across origin domain distribution > 0.04, confirming distinct build directions.*
- **Same-Seed / Different-Origin**:
  - Different starting families and signature abilities produce measurably different draft pick profiles even under identical World Laws.
- **Different-Seed / Same-Origin**:
  - Varied World Laws produce different World Traits ("Industry-Favored World", "Kinetic Warfare Doctrine", etc.) altering offer weights.

---

## 4. Verification Checkpoints

- `npm run check`: Typecheck + Unit Tests (344 passed) + Build + Third-party verification clean.
- `npm run analyze`: Emergence & Experience Audit (6 passed) clean.
- `npm run zip; npm run release:verify`: Distribution zip verified and compliant.
- `tests/i18n/parity.test.ts`: 100% key and text parity between English and Thai.
