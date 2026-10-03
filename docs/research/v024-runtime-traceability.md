# v0.24 Runtime Traceability Audit

**Branch:** `proto/v024-emergent-seed-core-20261002`  
**HEAD:** `968a205388e05ac918630f19c973dbba24039fba`  
**Parent:** `fix/v0231-interaction-clarity-20261001` (`cf9c0cebe47a9ca392d634e8930e4d9b1fac64b0`)  
**CI Run:** 37051156684 (Node 22 ✅, Node 24 ✅, E2E ✅)  
**Date:** 2026-10-02

---

## Executive Summary

**v0.24 Status: SCAFFOLD CREATED / REGRESSION CI GREEN / RUNTIME INTEGRATION NOT DONE**

The v0.24 branch contains substantial scaffold code for emergent systems, but **none of the new systems are integrated into the canonical gameplay runtime**. The CI is green because the code compiles and existing tests pass, but the new emergent systems are not wired into the canonical gameplay loop.

---

## 1. Runtime Traceability Matrix

| System | Core Entrypoint | Canonical State Mutation | Player-Visible UI | Telemetry | Unit Tests | E2E | Status |
|--------|-----------------|--------------------------|-------------------|-----------|------------|-----|--------|
| World Laws | ❌ Not called | ❌ Not stored | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Offer Engine | ❌ Not called | ❌ Not used | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Quality/Modifiers | ❌ Placeholder only | ❌ Not applied | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Gumbel-Top-k | ❌ Not used | ❌ Not used | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Draft Agency | ❌ Not wired | ❌ Not live | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Origins | ❌ Not imported | ❌ Not active | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Outpost Logistics | ❌ Not imported | ❌ Not live | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Garrison | ❌ Not wired | ❌ Not active | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Enemy Ecology | ❌ Not imported | ❌ Not spawned | ❌ Not encountered | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |
| Director | ✅ Imported | ❌ Not driven by emergence | ❌ Not shown | ❌ None | ❌ None | ❌ None | **PARTIAL** |
| Events | ✅ Imported | ❌ Not triggered | ❌ Not shown | ❌ None | ❌ None | ❌ None | **SCAFFOLD** |

**Summary:** 10/11 systems are SCAFFOLD (code exists but not integrated). Only Director has partial integration (imported by GameScene but not driven by emergence data).

---

## 2. Key Disconnects

### Offer Engine
- `generateOffers()` exists but returns `[]` in scaffold, not integrated into `RunSimulation.buildDraft()`
- `RunSimulation.buildDraft()` uses its own legacy logic, not `offerEngine.generateOffers()`
- `offerEngine` not imported in `RunSimulation.ts`

### World Laws
- `generateWorldLaws()` exists but never called
- No `worldLaws` field in `RunState`
- No derivation in `RunSimulation`

### Origins
- `originRulesets.ts` exists but never imported by `RunSimulation`
- No `originRuleset` field in `RunState`

### Outpost Logistics / Garrison
- `outpostLogistics.ts` not imported by `RunSimulation` or `GameScene`
- `Territory` interface missing `garrisoned` field
- `claimTerritory()` does not check logistics capacity

### Enemy Ecology / Director / Events
- None imported by `RunSimulation` or `GameScene`
- `director.ts` uses `Math.random()` for phase duration (non-deterministic!)
- `events.ts` exists but never triggered

---

## 2. Determinism Violations

| File | Line | Issue |
|------|------|-------|
| `director.ts` | 49, 50, 114, 147 | `Math.random()` for RNG stream |
| `offerEngine.ts` | 126, 130 | `Math.random()` in `clampQualityByAge` |
| `director.ts` | 114, 147 | `Math.random()` for phase duration |

**NO Math.random in canonical gameplay path (src/core/sim/**, src/core/progression/**, src/core/tech/**, src/core/world/**) ✅**

---

## 3. QA Telemetry Gaps

| Telemetry Kind | Currently Tracked? | Required? |
|----------------|-------------------|-----------|
| `reroll_attempt` | ❌ | ✅ Yes |
| `reroll_success` | ❌ | ✅ Yes |
| `reroll_unavailable` | ❌ | ✅ Yes |
| `reserve_attempt` | ❌ | ✅ Yes |
| `upgrade_attempt` | ❌ | ✅ Yes |
| `claim_attempt` | ❌ | ✅ Yes |
| `upgrade_attempt` | ❌ | ✅ Yes |
| `claim_attempt` | ❌ | ✅ Yes |

---

## 4. False Claims in Documentation

| Document | Claim | Reality |
|----------|-------|---------|
| `SESSION_HANDOFF.md` | "v0.24 is active milestone" | v0.24 is scaffold, not integrated |
| `SESSION_HANDOFF.md` | "Human gate DONE" | Human gate NOT done |
| `ROADMAP.md` | "v0.24 = ACTIVE" | Should be PROTOTYPE INTEGRATION |
| `ROADMAP.md` | "Game Feel & Audio = RESEARCH READY" | Audio deferred, not in scope |

---

## 5. Actual CI Status

| Check | Status |
|-------|--------|
| TypeScript | ✅ PASS |
| Unit Tests | 338/338 PASS |
| E2E Tests | 42/42 PASS (1 skipped capture-only) |
| Build | ✅ PASS |
| Verify Third-party | ✅ PASS |
| Release Verify | ✅ PASS |

**CI Run:** 37051156684 (Node 22 ✅, Node 24 ✅, E2E ✅) on `968a205388e05ac918630f19c973dbba24039fba`

---

## 6. Files Requiring Integration (Priority Order)

| Priority | System | Files to Modify |
|----------|--------|-----------------|
| 1 | World Laws | `RunSimulation.ts`, `GameScene.ts` |
| 2 | Offer Engine | `RunSimulation.ts` (buildDraft), `GameScene.ts` |
| 3 | Origins | `RunSimulation.ts`, `GameScene.ts` |
| 4 | Outpost Logistics | `RunSimulation.ts`, `GameScene.ts` |
| 5 | Garrison | `RunSimulation.ts`, `GameScene.ts` |
| 3 | Enemy Ecology | `RunSimulation.ts` |
| 4 | Director | `GameScene.ts` |
| 5 | Events | `GameScene.ts`, `RunSimulation.ts` |

---

## 6. Canonical Status

| Metric | Value |
|--------|-------|
| **Branch** | `proto/v024-emergent-seed-core-20261002` |
| **HEAD** | `968a205388e05ac918630f19c973dbba24039fba` |
| **Parent Baseline** | `cf9c0cebe47a9ca392d634e8930e4d9b1fac64b0` (`fix/v0231-interaction-clarity-20261001`) |
| **CONTENT_VERSION** | 6 (needs 7 when integrated) |
| **WORLDGEN_VERSION** | 2 |
| **SAVE_SCHEMA_VERSION** | 1 |
| **CONTENT_VERSION** | 6 (needs 7 when integrated) |

---

## 7. Next Steps (Priority Order)

1. **Fix determinism**: Replace all `Math.random()` in `src/core/emergence/**` with seeded streams
2. **Wire World Laws**: Add `worldLaws` to `RunState`, call `generateWorldLaws()` in `RunSimulation` init
3. **Wire Offer Engine**: Replace `buildDraft` logic with `offerEngine.generateOffers()`
4. **Wire Origins**: Add `originRuleset` to `RunState`, call `originRulesets.getOriginRuleset()`
5. **Wire Logistics/Garrison**: Add `Logistics` to `RunState`, update `claimTerritory`, add `garrisoned` field
6. **Wire Enemy Ecology**: Integrate `enemyEcology.ts` into spawn path
7. **Wire Director**: Connect `director.ts` to spawn pacing
8. **Add QA telemetry**: Attempt/success for all player actions
9. **Fix QA observer**: Ascension uses checked baseline, post-ascension uses sim time
10. **Add attempt telemetry**: Reroll/reserve/upgrade/claim attempts
11. **Fix key-repeat**: Gate Q/E/R/F with edge-triggered check
11. **Update CONTENT_VERSION to 7** when integration complete
12. **Update SESSION_HANDOFF.md** with accurate status
13. **Update ROADMAP.md** with accurate v0.24 status

---

## 7. Verification Commands

```bash
# Verify no Math.random in canonical core
rg "Math\.random" src/core/sim/ src/core/progression/ src/core/tech/ src/core/world/

# Verify no Math.random in canonical emergence (except comments)
rg "Math\.random" src/core/emergence/ | rg -v "comment"

# Verify imports
rg "offerEngine|worldLaws|originRulesets|outpostLogistics|enemyEcology" src/core/sim/RunSimulation.ts

# Run full gate
npm run typecheck && npm run test && npm run build && npm run check && npm run test:e2e
```

---

*Generated: 2026-10-02*  
*Audit: Manual inspection + automated verification*  
*Status: SCAFFOLD_NOT_INTEGRATED*