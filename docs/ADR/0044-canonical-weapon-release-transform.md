# ADR0044 — one canonical primary weapon transform

25 October 2026. Parent PR24 / 8edbc5b5afa3c5b4beb66341af8e993fb21aa6fa.
Supersedes ADR0043's cosmetic ellipse, centered pivot and release tether.

The painted equipment floated independently while actual projectiles were born
at the player. A four-unit proximity heuristic guessed release ownership. Raw
equipment cells have different axes, pivots and tips; rotating every cell by the
velocity angle produced incorrect aim. Projectile source cells point right.

Author 24 socket tuples against the unchanged 128px equipment source. The pure
core transform applies pivot, per-cell mirroring, authored-axis correction,
scale, rotation and mount translation once. Renderer Image origin reflects the
authored pivot when flipping. Both paths use this transform. Read-only pixel
calibration checks 72 points against visible ink within six source pixels;
this sanity check does not replace native visual inspection. No bitmap edits.

Float remains default; it tracks targets instead of orbiting by time. The rig
turns at at most 14 rad/s and translates with exponential 10/s convergence.
Mirror selection uses target side with a two-unit deadzone before the analytic
solve; deriving mirror from the solved heading made off-axis grips alternate
at vertical aim. Both mirror states are tested for every cell. Idle holds its last station. Near-pivot targets cause a bounded upward retreat.
Hand remains an explicit comparison through RunConfig/InputFrame, now canonical
and hashed. Rendering/reduced effects never chooses a different canonical mount.
Pause does not step; child worlds reset transient aim/recoil while retaining mode.

Fire waits until the actual muzzle can point forward at the target and the
remaining angle is <=0.045 rad. Releasing aligns exactly; the spread's original
0.12 rad spacing is unchanged. Projectile position, velocity, event position and
per-shot heading share the actual release. Beams start at the same muzzle.
Primary broad-phase padding includes the largest authored enemy collider,
including a center across the next spatial cell. Primary shots sweep their traveled segment to avoid missing near/overlapping
targets; unrelated projectile collision and autonomous emitters remain unchanged.
The primary sweep retains the existing +6 collision allowance. Counts, speeds,
base damage, cooldown constants, range selection and beam damage area are retained.
Necessary gameplay changes are offset origin, initial alignment delay (a pi turn
needs at least 0.224s plus mount settling), and primary segment collision.
These are measured changes, not a claim of identical combat outcomes.

CONTENT_VERSION becomes 19; old content18 input replays are not compatible.
WORLDGEN_VERSION remains 3. Child law generation is explicitly pinned to its
existing content18 seed input, preventing this firing change from rerolling laws.
SAVE_SCHEMA_VERSION remains 2: saved settings/archive/history do not contain an
active RunState, rig or projectiles. Existing save migration tests still apply.
No new runtime dependency. The optional pixel evidence script uses installed
Pillow as a development inspection tool only.

Natural36 compares every parent/candidate outcome, including deaths, unreachable
bosses and skipped phases. Candidate repeatability is required; historical
snapshot equality is recorded, not required. Finite synthetic runs and green CI
cannot establish human fun or close existing performance/art acceptance issues.

The boss fixture clears stale projectiles and mines. Controlled contamination
tests distinguish a 7 HP old projectile from an undodged 49 HP Slam. Reproducing
this mechanism does not identify the exact projectile in the historical failed
trace; preserve that failed run and its uncertainty.

Old renderer tests assuming a centered pivot, cosmetic mount equality, player
emitter origin or unconditional first-tick firing are updated to the new contract.
Damage/shield/death/chain assertions remain. Source-axis, eight-direction spawn,
first-step travel, spread, beam, reversal, sweep, pool and child reset tests are added.
Review markers are available only through the existing e2e hook, off in normal QA.
