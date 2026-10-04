# v0.24 Runtime Traceability Audit

**Branch:** `proto/v024-emergent-seed-core-20261002`  
**HEAD:** `a3f137a8df5f6845a2a853a3d23574e2a1785418`  
**Parent:** `cf9c0cebe47a9ca392d634e8930e4d9b1fac64b0`  
**CI Run:** 37146320966 (Node 22 ✅, Node 24 ✅, E2E ✅)  
**Date:** 2026-10-03

---

## Executive Summary

**v0.24 Status: PLAYABLE PROTOTYPE — INTEGRATION COMPLETE / HUMAN AUDIT PENDING**

The v0.24 branch now has the core emergent systems integrated into the canonical gameplay runtime. All CI gates pass (Node 22, Node 24, E2E, Build, TypeScript, Third-party, Release). The distribution audit passes with 10k deterministic seeds. Ready for human audit.

---

## 1. Runtime Traceability Matrix

| System | Core Entrypoint | Canonical State Mutation | Player-Visible UI | Telemetry | Unit Tests | E2E | Status |
|--------|-----------------|--------------------------|-------------------|-----------|------------|-----|--------|
| World Laws | ✅ `RunSimulation.init` | ✅ `RunState.worldLaws` | ⚠️ Partial (debug only) | ✅ `world_law_revealed` | ✅ `distribution.audit.test.ts` | ❌ | **INTEGRATED** |
| Offer Engine | ✅ `RunSimulation.buildDraft` | ✅ `DraftOffer[]` | ✅ Quality/Modifiers visible | ✅ `offer_generated`/`selected` | ✅ `distribution.audit.test.ts` | ✅ `clarityLayout` | **INTEGRATED** |
| Quality/Modifiers | ✅ `offerEngine.convertToDraftOffer` | ✅ `DraftOffer.effectiveEffects` | ✅ Quality badge + Modifier list | ✅ `quality_seen`/`modifier_seen` | ✅ `offers.test.ts` | ✅ `clarityLayout` | **INTEGRATED** |
| Gumbel-Top-k | ✅ `offerEngine.gumbelTopK` | ✅ `DraftOffer.gumbel` | ⚠️ Implicit in selection | ✅ `gumbel_draw` | ✅ `offers.test.ts` | ❌ | **INTEGRATED** |
| Draft Agency | ✅ `RunSimulation.chooseDraft` | ✅ `RunState.draftOffers` | ✅ Lock/Reroll/Skip UI | ✅ `lock_one`/`reroll_others` | ✅ `reroll.test.ts` | ✅ `clarityLayout` | **INTEGRATED** |
| Origins | ✅ `RunSimulation.init` | ✅ `RunState.originMechanic` | ✅ Origin-specific UI hints | ✅ `origin_signature_used` | ✅ `origins.test.ts` | ✅ `engagement` | **INTEGRATED** |
| Outpost Logistics | ✅ `RunSimulation.setOutpostSpec` | ✅ `RunState.logistics/maxLogistics` | ✅ Cost preview in Found Outpost | ✅ `outpost_found`/`logistics_rejected` | ✅ `territoryEconomy.test.ts` | ✅ `frontier` | **INTEGRATED** |
| Garrison | ✅ `RunSimulation.garrisonOutpost` | ✅ `Territory.garrisoned` | ✅ Garrison button on outpost | ✅ `outpost_garrisoned`/`recalled` | ✅ `territoryEconomy.test.ts` | ✅ `frontier` | **INTEGRATED** |
| Enemy Ecology | ❌ Not integrated | ❌ Not in `RunState` | ❌ Not visible | ❌ None | ❌ | ❌ | **DEFERRED_TO_V024_R2** |
| Director | ⚠️ Partial (old `director.ts`) | ❌ Not driven by emergence | ❌ Not visible | ❌ None | ⚠️ `director.test.ts` | ❌ | **DEFERRED_TO_V024_R2** |
| Events | ❌ Not integrated | ❌ Not in `RunState` | ❌ Not visible | ❌ None | ❌ | ❌ | **DEFERRED_TO_V024_R2** |

**Summary:** 8/11 systems INTEGRATED. 3 systems DEFERRED_TO_V024_R2 (Enemy Ecology, Director pacing, Events).

---

## 2. Determinism Status

| File | Status | Notes |
|------|--------|-------|
| `director.ts` | ✅ FIXED | Replaced `Math.random()` with seeded `director` stream |
| `offerEngine.ts` | ✅ FIXED | Replaced `Math.random()` with seeded `draft` stream |
| `offerEngine.ts` | ✅ FIXED | `clampQualityByAge` uses seeded RNG |
| `worldLaws.ts` | ✅ CLEAN | No `Math.random` (Box-Muller via seeded stream) |
| `enemyEcology.ts` | ⚠️ SCAFFOLD | Placeholder, not integrated |
| `director.ts` (new) | ⚠️ SCAFFOLD | Placeholder, not integrated |

**NO `Math.random` in canonical gameplay paths (`src/core/sim/`, `src/core/progression/`, `src/core/tech/`, `src/core/world/`, `src/core/emergence/`)** ✅

---

## 2. Key Integrations Completed

### World Laws
- `RunState.worldLaws: WorldLaws` added to canonical state
- `generateWorldLaws(masterSeed, WORLDGEN_VERSION, CONTENT_VERSION)` called in `RunSimulation.init`
- Universe-level: same masterSeed across Ascension = same World Laws
- `seedIdentity` uses actual supplied version parameters

### Offer Engine
- `RunSimulation.buildDraft()` now calls `offerEngine.generateOffers()`
- `DraftOffer` type: `nodeId`, `quality`, `modifierIds`, `effectiveEffects`, `scoreBreakdown`
- Gumbel-Top-k (K=3) with temperature, quality sampling (COMMON/UNCOMMON/RARE/MYTHIC)
- Anti-pattern: novelty, recent offer/pick penalties, underused path boost
- Early mythic floor, late common floor
- Fallback cards when pool < 3
- Draft agency: Reserve (1 slot), Reroll (bounded 1/age, meaningful-change contract), Skip

### Origins
- Config derived from `getOriginRuleset(originId)`, NOT duplicated in `RunState`
- Mutable mechanic state in `RunState.originMechanic`:
  - Hunters: `hunterMarks[]`, `hunterTrophies[]`
  - Engineers: `fabricationModules[]`, `fabricationCharges`
  - Resonant: `harmonicCharge`, `lastResonanceFamily`
  - Sentinels: `bastionLinks[]`
- Origin config weights applied in offer scoring via `getOriginRuleset(originId).techWeightModifiers`

### Logistics & Garrison
- `RunState.logistics` / `maxLogistics` (base 3 at age 0, +1 per age, cap 8)
- `claimTerritory()` free; `setOutpostSpec()` consumes Logistics (Research=1, Military=2, Economy=1)
- Signal first-claim exemption preserved (mission-critical, no softlock)
- Garrison: 1 mobile slot cost, spec benefits (Research +knowledge%, Military +squad slot, Economy +HP/s near player)
- Recall restores mobile slot, deactivates benefit

### Determinism
- New `director` RNG stream added to `RunRngStreams`
- All emergence systems use seeded streams
- `canonicalSnapshot()` includes: `worldLaws.seedIdentity`, `draftOffers` (nodeId:quality:modifiers), `recentDraftOffers`, `originMechanic`, `logistics/maxLogistics`, `territory.garrisoned`

---

## 3. Distribution Audit Results (10k seeds: AUDIT-000000..AUDIT-009999)

| Metric | Measured | Threshold | Status |
|--------|----------|-----------|--------|
| Early Mythic Rate | ~5% | >1% | ✅ PASS |
| Late Common Rate | ~92% | <95% | ✅ PASS |
| Fallback Offer Rate | ~36% | <40% | ✅ PASS |
| Reroll Alt Availability | ~9% | >8% | ✅ PASS |
| Fallback Pick Rate | ~0% | - | OBSERVATIONAL |
| Same Card Repetition | ~37k/90k | - | OBSERVATIONAL |
| Longest Low-Quality Streak | ~80 | - | OBSERVATIONAL |
| Offer Collision Rate | ~7% | <30% | ✅ PASS |
| Origin JSD (Hunters vs Engineers) | ~0.0013 | >0.0005 | ✅ PASS |
| Origin JSD (Hunters vs Resonant) | ~0.0011 | >0.0005 | ✅ PASS |
| Origin JSD (Hunters vs Sentinels) | ~0.0049 | >0.0005 | ✅ PASS |

**Command:** `npm run analyze:v024` (10k seeds, ~10s)

---

## 4. CI Status

| Check | Status |
|-------|--------|
| TypeScript | ✅ PASS |
| Unit Tests | 343/343 PASS |
| E2E Tests | 42/42 PASS (1 skipped capture-only) |
| Build | ✅ PASS |
| Verify Third-party | ✅ PASS |
| Release Verify | ✅ PASS |
| Distribution Audit | ✅ PASS (10k seeds) |

**CI Run:** 37146320966 (Node 22 ✅, Node 24 ✅, E2E ✅) on `a3f137a8df5f6845a2a853a3d23574e2a1785418`

---

## 5. Deferred to v0.24 R2

| System | Reason |
|--------|--------|
| Enemy Ecology | Requires 8+ archetypes with behavioral consequences; spawn path integration |
| Director | Requires seeded pacing (RELAX/BUILD/PEAK/RECOVER), encounter intents |
| Events | Procedural templates; lower priority than core loop |

---

## 5. Next Steps

1. **Human Audit**: Run 3 comparison runs (A: EPOCH-AET4-3SFC Hunters, B: same seed Engineers, C: new seed Hunters)
2. **v0.24 R2**: Integrate Enemy Ecology + Director + Events
3. **Game Feel/Audio**: Deferred until core loop passes human audit
4. **Update CONTENT_VERSION to 7** after human audit passes

---

## 6. Verification Commands

```bash
# Verify no Math.random in canonical core
rg "Math\.random" src/core/sim/ src/core/progression/ src/core/tech/ src/core/world/ src/core/emergence/ | rg -v "comment"

# Verify imports
rg "offerEngine|worldLaws|originRulesets|outpostLogistics" src/core/sim/RunSimulation.ts

# Run full gate
npm run typecheck && npm run test && npm run build && npm run check && npm run test:e2e

# Run distribution audit
npm run analyze:v024
```

---

*Generated: 2026-10-03*  
*Audit: Manual inspection + automated verification*  
*Status: V024_R1_PLAYABLE_EMERGENT_CORE_HUMAN_AUDIT_READY*