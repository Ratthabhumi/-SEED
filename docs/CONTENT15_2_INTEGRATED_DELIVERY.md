# Content 15.2 integrated human quality candidate

Parent: PR11, `0fa6378a457606e4066055032e8ea52b22fc63b1`, verified OPEN/Draft,
push38529670058 and PR38529676580 SUCCESS4/4. Branch:
`feat/content15-integrated-human-quality-20261014`. One Draft against PR11;
no merge, tag, public release or history rewrite. Final exact-head CI/package
receipt will be in the PR body. Source-only frozen measurements are distinguished
from official clean CI packages.

## Confirmed changes and scope

- **Input:** fresh Space on a focused Draft button reproduced a choice on the
  parent. Native capture now prevents keydown/repeat/keyup default activation
  whenever canonical `draftOpen` is true, including hidden/queued surfaces.
  Pointer, Enter and1/2/3 remain intentional controls. Movement uses captured
  physical codes instead of Phaser's possibly stale `isDown` state. Entry into
  decisions/pause/maps clears movement/edge latch; blur/hidden clears physical
  tracking. Repeat alone cannot resurrect cleared movement. Fresh gameplay Dash
  remains enabled. Original human stuck-movement report's SHA and exact cause
  are unverified; this is adapter hardening plus native sequence verification.
  Installed Phaser KeyboardManager explicitly ignores defaultPrevented keyups;
  context/blocked-release reset clears its key states as well as the latch.
  Center/Current in Tech Map snaps instead of independently animated zoom/pan
  exposing an offscreen intermediate frame. Live HUD/context hints/toasts use
  bounded readable fonts; menus retain requested full text scale.
- **Terrain:** Worker additionally transfers vertically reversed RGBA bytes.
  `texSubImage2D` uses the typed-array overload instead of a Canvas DOM source.
  Original backing Canvas, atlas coordinates, opaque colors, gutters, epoch/
  serial guards, one-upload/frame scheduling, cache/pools and canonical world
  generation remain unchanged. Unit verifies row orientation and immutability.
  Temporary source tiles no longer mirror on alternate coordinates. Raw fallback
  still differs from periodically blended prepared material: full visual parity
  and cold-start aesthetics are NOT closed.
- **High Contrast:** existing friendly projectile geometry is baked once per
  identity using Phaser Graphics' Canvas export, then drawn with existing
  Mesh2D batching. Same outline, trail, roles, rotation and projectile count;
  Canvas/large-radius/zero-velocity/64-glyph overflow retains original vectors.
  One2.25MiB optional HC atlas,1000-quads; glyph texture upload once per changed
  frame. No reduced population/effects or budget relaxation. Normal/Reduced
  painted projectile path is unchanged.
- **Equipment:** remove the27u center offset from the body hand socket. Original
  equipment atlas receives explicit source grip origins (bow/crossbow/gun/staff/
  shield); recoil moves at most2u from that socket. These are initial reviewed
  source coordinates, not artist-approved attachment across all24 costumes.
  Reference hand metadata, one primary mount and actual simulation muzzle
  coordinates are retained. No duplicate weapon or autonomous fake attack.
- **Boss communication:** localized persistent phase/action/recovery cues derive
  from the actual canonical encounter. Warning names actual danger/counterplay,
  recovery is visually distinct. This does NOT change HP, DPS, invulnerability,
  phase timing, encounter patterns or make the16.1s historical fight longer.

WORLDGEN/CONTENT/SAVE remain3/15/2. No canonical rule/replay/save change, new
dependency, external artwork or fabricated artist approval. Existing original
asset checks/provenance are retained. New geometry texture is generated from
project source at runtime; Canvas scratch36KiB plus HC texture2.25MiB and fixed
mesh buffers are the additional bounded resources. Restart resets per-scene
metadata; manager-owned texture is reused and never accumulated by run count.

## Evidence and retained failures

- Parent Space failure: `docs/evidence/content152/input-before.png`; full local
  trace/log under ignored `scratch/content152-input-before*`.
- Native sequence suite: Space EN/TH, held/repeat/queued Space, fresh Dash,
  multiple movement releases at Draft/pause/tech/civ/blur boundaries; HC800-shot
  cache/restart, actual boss phase cue EN/TH and posed hand-grip distance.
- Early movement fixture wrongly read a serialized snapshot as an object;
  corrected to parse canonical `p` coordinates. Another fixture wrongly required
  cooldown exactly0 despite existing negative countdown semantics; corrected to
  require readiness≤0, keeping actual Dash-positive assertion. Both failure logs
  retained locally; no gameplay changes or timeout extensions to hide failures.
  First full browser run157passed/5failed/1oldskip is retained: two input cases,
  two offscreen animated-center cases and the correct dirty-build QA rejection.
  Dash fixture also needed real movement: canonical Dash requires `il>0`.
  Corrected focused suite11/11 and center EN/TH2/2 passed; full clean rebuild
  must certify the consolidated product. No original assertion was removed.
  Two cohort runs completed all8 assertions but failed worker RPC acknowledgement
  after64/78s of continuous CPU work. Harness now yields Node's event loop with
  `setImmediate` between the same cases; no cohort/policy/assertion reduction or
  timeout increase. Failed logs remain retained.
- Full verification and paired-performance results are recorded below after
  completion. Historical failed performance runs remain in their original files.

## Remaining quality gates

This workstream preserves the best verifiable implementation but is **PARTIAL**.
Full authored animation/in-betweens for one family, new production enemy-shot art,
artist-approved hand anatomy, historical terrain preference, measured natural
Boss DPS/exposure tuning, strategic biome depth and human screen-size acceptance
are unresolved. More generated assets do not certify those gates. No claims of
HUMAN_ART_PASS, HUMAN_FUN_PASS, REPLAY_MOTIVATION_PASS or RELEASE_READY.

See [issue matrix](CONTENT15_2_HUMAN_ISSUES.md),
[animation coverage](CONTENT15_2_ANIMATION_COVERAGE.md) and
[visual/performance evidence](evidence/content152/README.md).

## One coordinated human retest

After final exact-head engineering checks, run `npm run qa:human` from this
branch, confirm the displayed build SHA, choose a fresh seed/Origin and complete
one Stone→Space→Boss→World2 run. Hold movement and Space before Draft, release
movement inside it, test fresh Space on a focused card (must do nothing), choose
with pointer/Enter/1–3, then move/Dash again. Inspect hand attachment in Stone/
Space, terrain arrival/seams, threat readability, HC mode and actual boss phase/
recovery cues; test Pause/maps and high-scale Thai layout. Record exact SHA,
viewport/mode, ratings and any interruption. Existing failed sessions remain
INTERRUPTED_BY_BUG/QUALITY_GATE_FAILED; new machine fixtures are not human passes.
