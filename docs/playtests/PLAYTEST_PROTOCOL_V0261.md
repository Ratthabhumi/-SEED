# PLAYTEST_PROTOCOL_V0261.md — Human Playtest Protocol & Evidence Integrity

> Milestone: v0.26.1 — Playtest Readiness & Evidence Truth  
> Target Build: `fix/v0261-playtest-readiness-20261008`  
> Research Methodology: Games User Research (GUR) Qualitative Discovery  
> Status: Authoritative Protocol for Human Evaluation

---

## 1. Core Principles & Evidence Integrity

1. **Human Evidence Cannot Be Synthesized**:
   - Automated synthetic bots (Class B factorial runs) prove simulation invariants and API accessibility. They do NOT prove player fun, strategic agency, or visual clarity.
   - Genuine player sentiment must come exclusively from living human testers interacting via the web UI.

2. **Qualitative Discovery vs. Premature Quantification (NN/g Principle)**:
   - Initial cohorts of 3–5 players are designed for **qualitative problem discovery** (finding where players get confused, stuck, or bored).
   - We must NEVER convert a 3–5 player sample average into a statistically validated claim (e.g., claiming "Fun score = 4.2 ± 0.1").
   - Maintain a strict three-tier separation in all notes:
     1. **Observation** (Objective: "Player pressed F 0 times in 15 minutes, never opened Tech Map").
     2. **Interpretation** (Analytical: "Player did not notice the F prompt on the cooldown ring or understand its utility").
     3. **Design Recommendation** (Actionable: "Introduce contextual ability prompt on first elite encounter").

3. **Telemetry Explains Behavior, Not Emotion**:
   - Telemetry logs (dwell time, draft picks, route milestones, FPS) describe *what actions occurred*.
   - Player ratings and interview responses describe *how the player experienced it*.
   - A report containing only machine telemetry MUST NOT be classified as `HUMAN_FUN_PASS`.

4. **Zero-Friction Privacy Sanitization**:
   - Local environments, usernames, private paths, personal emails, and raw console stack traces remain strictly on the tester's local machine under `test-results/human-playtests/` (gitignored).
   - Only sanitized markdown evidence is committed to `docs/playtests/`.

---

## 2. Research Priorities

All observation and interview questions center on five core questions:

1. **First-Minute Comprehension**: Does the player understand movement, attacking, enemy threats, and why they gain Knowledge?
2. **Player Agency & Choice**: When drafting cards, does the player feel they are making meaningful decisions, or are they picking randomly / on autopilot?
3. **Combat Enjoyment & Feel**: Are weapons satisfying to fire? Does hitting enemies feel punchy? Are active abilities (F key) impactful?
4. **Origin & Seed Identity**: Does switching Origins or seeds change how the game plays, or does it feel like a cosmetic label swap?
5. **Reason to Replay**: When the run ends (death or victory), does the player have an immediate impulse to try another run? Why or why not?

---

## 3. Two-Stage Playtest Structure

Rather than forcing every novice through an exhausting 8-run matrix, evaluation is divided into two focused stages:

```
[ Stage A: First Experience ] (3–5 Novice Players, 20–25 mins each)
  ├─ Phase 1: Blind First-Run (15 mins) ────────── Observation only (no coaching)
  ├─ Phase 2: Post-Run Structured Interview (5 mins) ── Neutral qualitative feedback
  └─ Phase 3: Subjective Ratings (2 mins) ────────── Recorded 1–5 rubric

[ Stage B: Focused Identity Comparison ] (Targeted Players, 15–20 mins each)
  ├─ Condition 1: Origin Pair (Hunters vs Sentinels on same seed) [Counterbalanced]
  └─ Condition 2: Seed Pair (Alpha vs Beta on same Origin) [Counterbalanced]

[ Optional Appendix: Deep 8-Run Factorial Matrix ] (Experienced Testers only)
```

---

### Stage A: Unmoderated / Lightly Moderated First Experience

- **Cohort**: 3–5 first-time players.
- **Duration**: 20–25 minutes total.
- **Setup**: Start with `npm run qa:human`, open `http://localhost:5173/?qa=1`.
- **Pre-test briefing**: 
  > *"Please play this prototype naturally. Think aloud if you like, but treat it as if you found this game on itch.io. There are no right or wrong ways to play, and you are evaluating the game, not being tested yourself."*

#### Step 1: Blind First Run (15 Minutes)
- **Rules for Observer**: Do NOT guide, explain controls, or give hints unless the player experiences a fatal game stall.
- **Observation Checklist**:
  - [ ] Did the player find and use WASD / Arrow movement immediately?
  - [ ] Did the player notice automatic weapon firing?
  - [ ] When the first draft card screen appeared, did the player read cards or click immediately?
  - [ ] Did the player discover the Origin Ability ('F' key)? How long until first use?
  - [ ] Did the player notice the top-center World Traits banner?
  - [ ] Did the player discover territory claim ('C' key) when entering a POI circle?
  - [ ] Did the player open the Tech Map ('T' key)?
  - [ ] Signs of hesitation, frustration, or visual confusion.

#### Step 2: Post-Run Neutral Interview (5 Minutes)
Ask these exact questions without prompting or validating:
1. *"In your own words, what was your objective in that game?"*
2. *"What was the most satisfying moment or action during your run?"*
3. *"What felt confusing, unfair, or unclear?"*
4. *"When choosing upgrade cards, how did you decide what to pick?"*
5. *"Would you want to play another run right now? Why or why not?"*

#### Step 3: Explicit Ratings (1–5 Likert Scale)
Record tester's direct scores (never infer from telemetry):

| Dimension | Score (1-5) | Tester Rationale / Comment |
| :--- | :---: | :--- |
| **1. First-Minute Clarity** | `[ ] / 5` | |
| **2. Combat Feel & Juice** | `[ ] / 5` | |
| **3. Strategic Choice Agency** | `[ ] / 5` | |
| **4. Origin / Ability Impact** | `[ ] / 5` | |
| **5. Desire to Replay** | `[ ] / 5` | |

---

### Stage B: Focused Identity Comparison

- **Cohort**: 2–4 players who completed Stage A or have basic survivor familiarity.
- **Purpose**: Compare Origin and Seed identity without exhausting testers.
- **Counterbalancing**: Alternate the presentation order to prevent learning effects:
  - Tester 1: Condition A first, then Condition B.
  - Tester 2: Condition B first, then Condition A.

#### Paired Test 1: Origin Divergence (Same Seed, 2 Contrasting Origins)
- **Seed**: `V026-TEST-GENESIS`
- **Pair**: `hunters` (Agile, kinetic volley) vs `sentinels` (Bulwark defense, area denial).
- **Duration**: 7 minutes per Origin.
- **Core Question**: *"Did changing civilizations change how you fought and built, or did it feel like the same ship with a different button?"*

#### Paired Test 2: Seed Divergence (Same Origin, 2 Contrasting Seeds)
- **Origin**: `engineers`
- **Pair**: `V026-SEED-A` vs `V026-SEED-B` (record the actual displayed traits; no trait bias is assumed).
- **Duration**: 7 minutes per Seed.
- **Core Question**: *"Did you notice the world traits altering your card options or survival strategy?"*

---

### Optional Appendix: Deep 8-Run Factorial Matrix

For dedicated design and balance passes (optional, never forced on novices):
- 4 Origins on `V026-TEST-GENESIS` (Hunters, Engineers, Resonant, Sentinels)
- 3 Seeds on `engineers` (`V026-SEED-A`, `V026-SEED-B`, `V026-SEED-C`)
- 1 Unconstrained Full Run to Ascension.

---

## 4. Execution Step-by-Step for Operators

### Step 1: Start QA Environment
In your development terminal, execute:
```bash
npm run qa:human
```
- Starts Vite at `http://localhost:5173`.
- Enables dev-only QA telemetry sink (`SEED_QA_SINK=1`).
- Starts `qa-watcher.mjs` to observe `test-results/human-playtests/latest.json`.
- **CRITICAL**: Do NOT run `npm run dev` in a separate terminal.

### Step 2: Open Player Browser
Navigate to:
```
http://localhost:5173/?qa=1
```
Ensure browser console is clear and resolution is at least 1280×720.

### Step 3: Run & Finalization
- Let tester play according to Stage A or Stage B.
- When the run ends (death, Ascension, or intentional exit), telemetry is captured to `test-results/human-playtests/latest.json`.
- The watcher automatically writes sanitized summary to `docs/playtests/latest-v026-experience-human.md` and updates `SESSION_HANDOFF.md`.
- Each session also has a separate session-<hashed-id>-sanitized.md report. Capture interview notes in a separate pilot-<anonymous-id>-notes.md so regeneration cannot erase them. Record ratings and comments in-game; they are saved again after completion.

### Step 4: Verification Before Git Commit
- Confirm buildSha equals the tested commit and buildDirty is false. UNKNOWN provenance is not certified evidence. Keep the server on the same checkout throughout the run; restart after code changes.
Inspect git diff:
```bash
git diff docs/playtests/
git diff SESSION_HANDOFF.md
```
Confirm zero personal paths, IP addresses, or unredacted emails leaked before staging.

---

## 5. Decision Gates for Milestone v0.27

Use repeated observations plus interview evidence to choose a single v0.27 priority. The following score thresholds are discussion prompts, not statistical release gates or automatic authorization to add deferred systems:

1. **UX / Onboarding Gate**: If *First-Minute Clarity* < 3.5:
   → **v0.27 First-Time User Experience & Visual Wayfinding**.
2. **Agency & Build Gate**: If *Strategic Choice Agency* < 3.5:
   → **v0.27 Tech Synergies, Card Drafting & Meaningful Build Archetypes**.
3. **Feel & Polish Gate**: If *Combat Feel* < 3.5:
   → **v0.27 Combat Juice, Impact Audio (ZzFX) & Weapon Differentiation**.
4. **Identity Gate**: If *Origin / Ability Impact* < 3.5:
   → **v0.27 Deep Civilization Verbs & Distinct Playstyles**.
5. **Advancement Gate**: If all dimensions ≥ 4.0:
   → **v0.27 Ascension Endgame & Phased Threat Director**.
