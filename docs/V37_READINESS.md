# V3.7 — measured frame pacing, human experience readiness, integration preflight

Parent: Draft PR26 `d4b66c2802b39e648edc11051e2268258fcf4a3f` (tree `32fca4f6`).
Branch `feat/v37-frame-pacing-experience-20261025`. Review candidate only: no
merge, retarget, rebase, tag, release or `main` change. Worldgen3 / Content20 /
Save2 unchanged; no canonical gameplay change, so no Content bump.

## Owner acceptance (specific, not blanket)

`OWNER_FEEDBACK_ACCEPTED — V3.6 BOW AIM / FLOAT / RELEASE FEEL`. The owner played
the V3.6 bow and accepted aim, float and release. Bow behaviour, authentic
muzzle firing, weapon art and aim tuning are frozen; reopen only for a
reproducible regression. All other combat, art, animation, performance and fun
judgments remain OPEN.

## Performance — what causes the 1080p failure

Host: i5-9500, Intel UHD 630 (ANGLE D3D11), Chromium 153 headless, desktop on
the High Performance plan, DPR 1. Frozen 500-enemy/800-projectile fixture, same
seed and hash in every window. Evidence: [`evidence/v37/`](evidence/v37/).

**Ruled out (measured):**

- High-DPI backing buffer: CSS size = canvas backing = WebGL drawing buffer at
  both 1280x720 and 1920x1080 (DPR 1).
- Visible geometry/world area: 1080p uses `gameZoom` 1.2, so it shows 1600x900
  world units vs 1280x720 at 720p. Showing the larger world at 720p pixels did
  not slow it down (render p95 1.5 ms vs 2.0 ms).
- GL submission stalls: wrapping every relevant WebGL call shows all GL calls
  together cost < 0.3 ms/frame at 1080p (4 `bufferSubData`, 3 `drawElements`,
  no `texSubImage2D`, no sync reads). The CPU does not block inside GL.

**Factorial (median of 3 interleaved windows, p95 ms, first session):**

|Pixels / world view|render CPU|GPU timer|frame interval|frames >25 ms per 4 s|
|--|--|--|--|--|
|720p px / 720p world, Normal|2.0|7.9|18.8|0|
|720p px / 1080p world, Normal|1.5|6.5|18.8|0|
|1080p px / 720p world (zoom 1.5), Normal|11.6|11.5|29.9|20|
|1080p px / 1080p world (native), Normal|7.1|9.9|23.9|11|
|1080p native, High Contrast|11.3|10.2|23.4|9|

Cost follows **screen pixels covered**, not world content: holding 720p world
area at 1080p pixels (larger sprites) was the worst case.

**Layer isolation (1080p, diagnostic e2e hook only):** hiding everything gives
0.2 ms. Largest GPU consumers: enemy actor meshes (depth 2, GPU p50 −3.3 ms
Normal / −3.8 ms HC), painted terrain chunks (depth −11, −2.3 ms Normal), HC
ground Graphics (depth −10, −3.3 ms HC), projectile mesh (depth 6). Hiding the
CPU-cheap terrain (15 quads) also removed most CPU render spikes, so the CPU
number is inflated by GPU load, not by its own work.

**Host-state swing (decisive):** the same build, fixture and script re-run
~40 minutes later measured 1080p Normal render p95 **1.0–1.2 ms**, GPU **6.6 ms**,
no frames >25 ms, and 720p GPU fell from 7.9 to 3.9 ms. Identical frames cannot
halve their own GPU work; the GPU timer measures elapsed time and inflates when
another process time-shares the integrated GPU. A Parsec host service
(`parsecd`) and its virtual display adapter are installed; an active stream
encodes on the same Intel GPU. Whether it was streaming earlier is **UNVERIFIED**.

**Conclusion:** the 1080p strict failures are a resolution-scaled GPU fill
workload on a shared integrated GPU whose available throughput varied heavily
during this session. The "render CPU/API" metric absorbs that contention as
spikes. No renderer defect, accidental sync, DPR bug or geometry hot path was
found. Strict physical status is unchanged: **12/24, all 1080p FAIL** (PR26
receipt); it is not relabelled. No matrix re-run because no renderer change ships.

**Rejected candidate (kept in history):** trimming actor quads to padded alpha
bounds (`f220af5`, reverted in `2726e21`). Enemy frames are ~45% opaque area;
raster parity passed versus the Image path (3/3 native WebGL cases, flipped,
tinted and Boss frames). The interleaved A/B on one build showed no measurable
difference (1080p Normal GPU p95 6.9 vs 6.6 ms, render 1.2 vs 1.0 ms), so it does
not ship. Whole-ground caching stays rejected.

**Next measurement (owner host, ~10 min, not run here):** run the unchanged
physical24 once with Parsec disconnected/stopped and no other GPU apps, and
record that host state in the receipt. If 1080p then passes, the gate failure
is environmental; if it still fails, attack actor and terrain fill first.

Reproduce (offline, never imported by production):

```powershell
npx vite build --outDir scratch/v37-pr26-dist --emptyOutDir
node scripts/profile-resolution-factorial.mjs scratch/v37-pr26-dist test-results/v37-resolution-factorial.json 3
node scripts/profile-layer-isolation.mjs scratch/v37-pr26-dist test-results/v37-layer-isolation.json
node scripts/profile-gl-call-timing.mjs scratch/v37-pr26-dist test-results/v37-gl-call-timing.json
```

## Strict stress vs real gameplay (separate tracks)

|Track|Question|Source|Status|
|--|--|--|--|
|STRICT_STRESS (unchanged)|500/800 fixture, render p95 <8 ms AND sim p95 <4 ms, 24 conditions|physical24 script|12/24; 1080p FAIL; host-sensitive|
|SYNTHETIC_DIAGNOSIS|Which factor drives cost|V3.7 factorial / isolation / GL timing|Pixel fill on shared iGPU; no renderer defect found|
|REAL_GAMEPLAY_PERFORMANCE|Does ordinary play stutter?|existing `?qa=1` perf checkpoints (min FPS, frame/sim/render p50/p95/p99 at run start, Boss spawn, Boss fight, post-Ascension +30/60/120 s, run end)|NOT YET CAPTURED at 1080p this cycle|
|HUMAN_SUBJECTIVE|Did it feel smooth?|new "Felt smooth" 1–5 rating|Only when the human submits it|

A staged 500/800 fixture is not natural density. A low CPU render number alone
does not make gameplay smooth; read frame interval and >25 ms frames with it.

## Experience — human feedback (Phase 3/4)

The existing QA pipeline already records explicit ratings ("recorded, never
inferred"), instant feedback marks during play, an optional comment, and a
privacy-sanitized report. V3.7 reuses it and adds five rating questions (EN/TH):
Combat responsiveness, Enemy/Boss attack readability, Progression clarity,
Visual/animation coherence, Felt smooth. A unit test proves no rating exists
until a human clicks one, even after Boss/World2 checkpoints and feedback marks.
Unrated questions report `not provided`. No other gameplay change this cycle.

Original31: identities and statuses are unchanged; no item is closed by these
diagnostics. Highest-impact questions for the next human route are listed under
*Owner next action*.

Natural36 (PR26: 26/36 victories, 4 lost-win cases): not re-run. No gameplay or
combat code changed in V3.7, so outcomes and hashes are unchanged by construction.
The four lost wins remain UNVERIFIED_OUTCOME_CAUSE; no HP/immunity/forced-phase
tuning.

## Art and animation production brief (artist-ready)

Applied today: HQ painted lava Boss, painted enemy/hero atlases, weapon and
projectile art (provenance pinned). Missing: genuinely authored layered
animation. Nothing is invented here.

- **Layers per character:** hero = head, torso, front arm + hand (weapon socket),
  back arm, pelvis, front leg, back leg, cape/accessory; Boss = head/jaw, torso
  core, left/right arms with fists, lava glow/emissive as a separate layer.
  Straight-alpha PNG, no baked shadow (ground contact is drawn by the game).
- **Pivots/sockets:** a JSON per character with the pivot per layer in source
  pixels, plus named sockets `weapon_grip`, `muzzle`, `head_top`, `ground`.
  Keep the existing 128 px hero cell / 256 px Boss cell and the 0.65 vertical
  origin so the accepted bow muzzle and hit radii stay valid.
- **States:** idle (loop), move (loop), attack anticipation → active → recovery,
  hurt, defeat. Boss also slam wind-up / impact / recover matching the existing
  warned-slam timing.
- **Facings:** front/back with horizontal mirroring (current policy); side views
  optional later.
- **Frames/pacing:** 4–6 frames for loops at 8–12 fps; attack anticipation must
  stay readable at the current telegraph durations; no interpolated anatomy.
- **Export:** `<actor>-<state>-<facing>.png` sheets on a fixed cell grid, plus the
  pivot/socket JSON; source PSD/KRA retained for provenance.
- **Readability:** silhouettes must stay legible under EN/TH HUD panels and in
  High Contrast; check at 720p and 1080p.
- **Acceptance references:** compare against native in-game captures of the
  current hero/Boss at 720p and 1080p (existing native visual specs) and the
  owner's play judgment, not generated stills.

## Integration preflight (no execution)

Verified: `main` `5e6d5c65ea905bc3859f115e73bfd02913988d45`. Bottom prerequisite
`d3814a6b7e94182a05be66e341eb36c0914eabc0` (`feat/v0261-outpost-softlock-20261008`)
is **108** commits above `main` (300 files). PR1 through PR26 add **88** commits
(655 files): **196** above `main` at PR26, plus this child. 26 open Draft PRs;
every PR base is an ancestor of its head (`evidence/v37/v37-pr-stack.json`).

|Gate|Status|
|--|--|
|Engineering integration|PREPARED, not executed: needs prerequisite audit|
|Performance acceptance|OPEN (strict 12/24; host-sensitive; real-gameplay 1080p capture pending)|
|Human experience acceptance|OPEN (bow only accepted)|
|Art production|OPEN (authored layered animation missing)|
|Release authorization|NOT GRANTED|

**Shortest safe future strategy:** (1) audit the 108-commit prerequisite as one
unit: its diff to `main`, its tests at its own tip, version/migration history
(Worldgen 3, Save 2 migrations, Content up to 20), third-party provenance;
(2) since every PR is a strict ancestor chain, integrate the **final reviewed
tree** (PR26 or its successor) as a single reviewed merge instead of 27
sequential merges, after one exact-tree `npm run check`, e2e, provenance and
packaging run; (3) close the intermediate Drafts as superseded only after that.
Owner authorization for that plan is separate and not given by this task.

## Research adoption

|Topic|Status|
|--|--|
|Bow muzzle/float/aim|APPLIED, owner-accepted, frozen|
|Fixed step, seeded RNG, save/world laws|APPLIED|
|Pixel-vs-world factorial, layer isolation, GL call timing|APPLIED (diagnostic only)|
|Actor alpha-bound trimming|REJECTED (parity held, no measured benefit)|
|Whole-ground bitmap cache|REJECTED (unchanged)|
|Internal resolution scaling|NOT IMPLEMENTED (would not count as native 1080p)|
|Real-gameplay 1080p capture|PARTIAL (pipeline exists; capture pending)|
|Human ratings for experience categories|APPLIED (questions added; no data inferred)|
|Authored layered animation|NOT IMPLEMENTED (brief only)|

## Validation receipts

`f0053df`: `npm run check` 98 files / 556 tests, provenance and build PASS. Push CI
5/5 PASS. PR CI e2e **FAILED 1/232** (231 passed): `combatReview` TH720 read the
re-mounted panel's `line-height` before it was styled (`NaN`). The same source
passed on push, so this is a test readiness race, not a V3.7 change. The failure
is retained here. Fix: poll for the same ≥1.7 ratio (15 s) before the bounds
assertion; the spec then passed 5/5 locally. The local full browser run was
stopped at 48/233 (0 failures) in favour of exact-source CI; it is not a full receipt.
The final receipt is CI on the follow-up commit.

## Owner next action (~10 minutes)

1. Close Parsec streaming and other GPU-heavy apps. Run `Play-SEED-QA.bat`.
2. Fullscreen 1920x1080, Normal graphics. Play naturally Stone → first Age-up,
   then continue as far as Boss/World2 if time allows. Press F3 once to see
   frame pacing; use the in-panel feedback buttons when something feels wrong.
3. At the end (or End session), rate only what you actually judged:
   Combat responsiveness, Enemy/Boss attack readability, Progression clarity,
   Visual/animation coherence, Felt smooth, plus Want another world. Leave the
   others unrated.
4. Keep the downloaded report locally; share only the sanitized summary.
