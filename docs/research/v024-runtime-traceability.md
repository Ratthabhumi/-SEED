# v0.24 Runtime Traceability Audit

**Branch:** `proto/v024-emergent-seed-core-20261002`  
**HEAD at Session Start:** `2a78b6d2e226ced10675638be32578a738b16ccc`  
**Parent:** `cf9c0cebe47a9ca392d634e8930e4d9b1fac64b0`  
**Prior CI Runs:** 37146320966 (failed: E2E failure), 37237370456 (failed: 0 jobs created due to invalid matrix conditional)  
**Date:** 2026-10-07

---

## Executive Summary

**v0.24 Status: TECHNICAL BASELINE FREEZE IN PROGRESS**

The v0.24 branch establishes the emergent seed core foundation. Technical defects in CI and temporary diagnostics have been cleaned. Human audit is deferred to v0.25, which will make emergence player-visible, causal, and legible.

---

## 1. Runtime Traceability Matrix

| System | Core Entrypoint | Canonical State Mutation | Player-Visible UI | Telemetry | Unit Tests | E2E | Status |
|--------|-----------------|--------------------------|-------------------|-----------|------------|-----|--------|
| World Laws | ✅ `RunSimulation.init` | ✅ `RunState.worldLaws` | ⚠️ Partial (debug only) | ✅ `world_law_revealed` | ✅ `distribution.audit.test.ts` | ❌ | **INTEGRATED (traits deferred to v0.25)** |
| Offer Engine | ✅ `RunSimulation.buildDraft` | ✅ `DraftOffer[]` | ✅ Quality/Modifiers visible | ✅ `offer_generated`/`selected` | ✅ `distribution.audit.test.ts` | ✅ `clarityLayout` | **INTEGRATED (quality decoupling in v0.25)** |
| Quality/Modifiers | ✅ `offerEngine.convertToDraftOffer` | ✅ `DraftOffer.effectiveEffects` | ✅ Quality badge + Modifier list | ✅ `quality_seen`/`modifier_seen` | ✅ `offers.test.ts` | ✅ `clarityLayout` | **INTEGRATED** |
| Gumbel-Top-k | ✅ `offerEngine.gumbelTopK` | ✅ `DraftOffer.gumbel` | ⚠️ Implicit in selection | ✅ `gumbel_draw` | ✅ `offers.test.ts` | ❌ | **INTEGRATED** |
| Draft Agency | ✅ `RunSimulation.chooseDraft` | ✅ `RunState.draftOffers` | ✅ Reserve/Reroll/Skip UI | ✅ `reserve_attempt`/`reroll_attempt` | ✅ `reroll.test.ts` | ✅ `clarityLayout` | **INTEGRATED** |
| Origins Identity | ✅ `RunSimulation.init` | ⚠️ `RunState.originMechanic` (reserved fields) | ✅ Active F abilities (Volley/Overdrive/Nova/Bulwark) | ✅ `origin_signature_used` | ✅ `origins.test.ts` | ✅ `engagement` | **LIVE (Family pair + F ability; deep verbs reserved)** |
| Outpost Logistics | ✅ `RunSimulation.setOutpostSpec` | ✅ `RunState.logistics/maxLogistics` | ✅ Cost preview in Found Outpost | ✅ `outpost_found`/`logistics_rejected` | ✅ `territoryEconomy.test.ts` | ✅ `frontier` | **INTEGRATED** |
| Garrison | ✅ `RunSimulation.garrisonOutpost` | ✅ `Territory.garrisoned` | ✅ Garrison button on outpost | ✅ `outpost_garrisoned`/`recalled` | ✅ `territoryEconomy.test.ts` | ✅ `frontier` | **INTEGRATED** |
| Enemy Ecology | ❌ Not integrated | ❌ Not in `RunState` | ❌ Not visible | ❌ None | ❌ | ❌ | **DEFERRED (Scaffold only)** |
| Threat Budget Director | ✅ `director.ts` | ✅ `threatBudget` | ❌ Dynamic spawn director | ❌ None | ✅ `director.test.ts` | ❌ | **LIVE BASELINE (Emergence director scaffold only)** |
| Events | ❌ Not integrated | ❌ Not in `RunState` | ❌ Not visible | ❌ None | ❌ | ❌ | **DEFERRED (Scaffold only)** |

---

## 2. Determinism Status

| File | Status | Notes |
|------|--------|-------|
| `director.ts` | ✅ CLEAN | Uses seeded `director` stream |
| `offerEngine.ts` | ✅ CLEAN | Uses seeded `draft` stream |
| `worldLaws.ts` | ✅ CLEAN | No `Math.random` (Box-Muller via seeded stream) |
| `events.ts` | ✅ FIXED | Seeded RNG replaces non-deterministic timestamp |
| `enemyEcology.ts` | ⚠️ SCAFFOLD | Placeholder, not integrated |
| `director.ts` (emergence) | ⚠️ SCAFFOLD | Placeholder, not integrated |

**Canonical paths in `src/core/**` contain 0 calls to `Math.random` or non-deterministic APIs.** ✅

---

## 3. Verification Commands

```bash
# Verify no Math.random in canonical core
rg "Math\.random" src/core/sim/ src/core/progression/ src/core/tech/ src/core/world/ src/core/emergence/ | rg -v "comment"

# Run full gate
npm run check
npm run test:e2e
npm run analyze
```

---

*Status: V024_TECHNICAL_BASELINE_STABILIZATION*