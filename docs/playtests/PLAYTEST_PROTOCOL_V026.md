# PLAYTEST_PROTOCOL_V026.md — Human Playtest Protocol & Evaluation Rubric

> Milestone: v0.26 — Experience Evidence & Playability Validation  
> Baseline SHA: 12e172c (v0.25 Player-Visible Emergence)  
> Branch: `feat/v026-experience-evidence-20261008`  
> Purpose: Establish whether the current civilization origins, seeds, tech choices, and territory systems create meaningful, understandable, replayable gameplay for actual human players.

---

## 1. Non-Negotiable Human Testing Principles

1. **Human Evidence Cannot Be Synthesized**:
   Automated synthetic bots (Class B) prove simulation capability and invariant adherence. They do NOT prove player fun, strategic satisfaction, or comprehension. Human verdicts must come exclusively from living human testers playing via browser.
2. **Subjective Scores Cannot Be Inferred**:
   Telemetry data (dwell time, kill counts, ability uses) describes *what happened*, not *how the player felt*. Subjective metrics must be directly scored by human testers.
3. **Evidence Privacy & Sanitization**:
   Raw hardware identifiers, local user directories, and unredacted personal logs remain strictly local under `test-results/human-playtests/` (gitignored). Only sanitized project metrics, seed parameters, run decisions, and explicit feedback are committed to `docs/playtests/`.

---

## 2. Test Cohorts (Minimum Matrix)

Testers must complete runs across three structured cohorts to provide causal isolation:

### Cohort 1: Same Seed × 4 Origins (Origin Causality)
- **Fixed Master Seed**: `V026-TEST-GENESIS`
- **Runs**: 4 runs (1 run per Origin)
  1. Hunters (`hunters`) — Volley ability, Kinetic + Field bias
  2. Engineers (`engineers`) — Overdrive ability, Kinetic + Defense bias
  3. Resonant (`resonant`) — Nova ability, Energy + Field bias
  4. Sentinels (`sentinels`) — Bulwark ability, Energy + Defense bias
- **Objective**: Determine whether playing different Origins on the *exact same physical world* feels like commanding distinct civilizations with noticeably different strategic routes, or merely cosmetic skin swaps.

### Cohort 2: Same Origin × 3 Seeds (World Law & Trait Causality)
- **Fixed Origin**: `engineers` (or tester's preferred origin)
- **Runs**: 3 runs across 3 distinct seeds with differing World Traits:
  1. Seed A: `V026-SEED-A` (Verifies Law Bias Alpha)
  2. Seed B: `V026-SEED-B` (Verifies Law Bias Beta)
  3. Seed C: `V026-SEED-C` (Verifies Law Bias Gamma)
- **Objective**: Determine whether World Traits shown on the screen visibly shape tech offers, map hazards, and player decisions in practice.

### Cohort 3: Natural Full Run (Pacing & Age Progression Gate)
- **Seed**: Tester's choice (or randomly typed string)
- **Origin**: Tester's choice
- **Objective**: Play naturally from Stone Age through to Space Age / Ascension without cheats or staging. Test end-to-end difficulty curve, boss encounter pacing, garrison/logistics balance, and the emotional resonance of Ascension.

---

## 3. Playtest Execution Instructions

1. Start local dev server:
   ```bash
   npm run dev
   ```
2. Open browser with QA telemetry enabled:
   ```
   http://localhost:5173/?qa=1
   ```
3. In terminal, launch the zero-friction QA watcher:
   ```bash
   npm run qa:human
   ```
   *(The watcher automatically detects terminal run completion, generates the sanitized markdown report, and updates `SESSION_HANDOFF.md` without manual commands.)*
4. Complete the run (victory via Ascension/Boss, death, or manual exit).
5. On the post-run screen, complete the in-game rating survey (or fill in the score sheet below).

---

## 4. Subjective Evaluation Rubric (1 to 5 Stars / Points)

Testers must rate each dimension on a 1–5 scale with brief qualitative commentary:

| Dimension | 1 (Unacceptable) | 3 (Adequate) | 5 (Exemplary) |
| :--- | :--- | :--- | :--- |
| **Clarity** | UI is confusing; cannot tell why cards appear, what F does, or why age advanced. | UI is mostly understandable; minor confusion about logistics or synergy tags. | Clear feedback on every choice, ability cooldown, trait influence, and age mission. |
| **Combat Feel** | Attacks feel limp, enemies bullet-spongey or visually unreadable, zero juice. | Playable survivor combat; basic satisfaction from clearing packs. | Punchy feedback, distinct weapon family feels, impactful active ability moments. |
| **Strategic Agency** | Drafts feel completely random; reserve/reroll feel useless; autopilot picks. | Some meaningful synergies found; choices occasionally pivot build. | Distinct, viable archetypes; draft manipulation (pin/reserve/reroll) enables high mastery. |
| **Seed Identity** | Every seed plays and feels identical despite different trait text. | Seeds have slight variation in enemy density or early card offers. | Physical layout, world traits, and POI distribution force distinct playstyles. |
| **Origin Identity** | Cannot feel difference between Hunters, Engineers, Resonant, and Sentinels. | Noticeable active ability difference, but draft builds end up similar. | Radically distinct tactical rhythm, build trajectory, and civilization character. |
| **Progression Pacing** | Slogs through ages or jumps too fast; boss spawns unexpectedly. | Normal survivor curve; steady power growth with occasional pauses. | Tense escalation, well-timed age milestones, dramatic boss climax. |
| **Desire to Replay** | One run was enough; no interest in trying another seed or origin. | Would play occasionally if prompted. | Immediate desire to try another build, master a different Origin, or conquer a tough seed. |

---

## 5. Decision Gate & Roadmap Transition

The human playtest gate determines the next engineering milestone (**v0.27**):

- If **Combat Feel** < 3.5: Pivot to **v0.27 Combat Feel & Audio Polish** (ZzFX sound design, impact frames, weapon juice).
- If **Progression Pacing** < 3.5: Pivot to **v0.27 Intensity & Adaptive Pacing Director** (intensity peaks, relief valleys, tension curve).
- If **Seed/Origin Identity** < 3.5: Pivot to **v0.27 Strategic Geography & Deep Origin Verbs** (biome hazards, origin-specific verbs).
- If **Strategic Agency** < 3.5: Pivot to **v0.27 Territory, Logistics & Build Synergies Rework**.
- If all dimensions ≥ 4.0: Proceed directly to **v0.27 Content & Ascension Polish**.
