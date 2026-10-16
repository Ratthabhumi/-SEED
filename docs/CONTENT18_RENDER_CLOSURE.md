# Native camera, enemy submission and warning recovery —16 October2026

Starting local/remote PR15 source b909802d5fa18e5bbef11ce7ff5ae38a30b1bb37,
clean and0 ahead/behind. Parent Push38743028304 and PR38743039178 each5/5 verified.
One continuation branch feat/content18-render-boss-art-closure-20261016 targets
PR15. No main merge, retarget, rebase, force push, tag or public release.

## Implemented

- Consecutive bounded enemy quad runs replace per-enemy Image traversal in
  WebGL, preserving the exact existing artwork, tint, flip, frame, origin,
  dimensions and painter order. Native actor parity is exact at two tested
  conditions and11 channels at1/255 at the far positive/zoom1.25 condition;
  see ADR0036 for the explicit numerical bound and rejected anchor experiment.
  No actor is removed. Canvas/`?actors=images`
  retain the original path. See ADR0036 for measurement hypothesis and budgets.
- Offscreen enemy bodies no longer suppress warnings aimed inside the view.
  The native Slam regression fails on the parent path with0 changed pixels;
  the corrected path must pass without changing canonical attack/damage rules.
- A native camera oracle checks actual worldView/inverse-transform corners and
  submitted ground bounds across supported zooms/resolutions, lag, teleports,
  negative coordinates, resize, biomes and World2. The original camera formula
  agrees with installed Phaser semantics; no speculative coordinate rewrite.
- Accepted player damage now identifies its source. Natural36 retains the
  controller and all reached/unreached/defeated cases, entry HP/adds, raw accepted
  damage-source totals and traces. Exact final snapshots must match PR15.
  Final overkill may exceed remaining HP; regen is separate. Historical events
  lacking source metadata are not retroactively assigned a cause.
- Actual glyph bounds, not screenshots alone, check draft choices/toolbar and
  Boss decisions in EN/TH at720p/200%. Existing Pause, keyboard input, Logistics,
  first Signal and modal queue regressions remain required. Thai≥1.7 retained.

## Late native UI correction

The clean3b19720 checkpoint passed183 Windows browser tests/one skip, yet manual
review of its actual200% screenshot showed technology names hidden above the
card viewport. Autofocusing the first bottom SELECT action had scrolled the
entire row. New initial-title visibility assertions reproduce2 failures (EN/TH).
Focus the existing labelled dialog heading instead, trap initial Tab/Shift+Tab,
and retain fresh Enter as first-choice activation through DecisionInputBoundary.
The first heading experiment missed that Enter contract; six existing input
tests failed, so restore the contract rather than removing their assertions.
Names/effects also precede long before/after comparisons, keeping the decision
identity visible. No global font shrink or weaker title visibility assertion.

Checkpoint PR CI also reproduced a native-camera harness race: pending Phaser
resize overwrote injected zoom1 with responsive gameZoom1.25. Wait for actual
camera viewport/real render stages before explicit zooms. The production camera
formula is unchanged. Group the same108 frame observations inside browser RAF
callbacks to remove hundreds of CDP round trips; total120 rows, raster cases,
hash invariants and timeout remain. Old Push/PR conclusions stay separate;
new exact-head checks are required after these corrections.
The30-test Windows focus/input/mobile/visibility suite passes after correction;
the resize-settled native camera oracle also passes120 rows. Final exact-head
source, full workflows, physical results and packages are recorded at
https://github.com/Ratthabhumi/-SEED/pull/16.

## Evidence and compatibility

Worldgen/Content/Save remain3/18/2: this work changes presentation and descriptive
events, not canonical values/timing/inputs. Package version stays0.2.0-dev.0.
The same31-issue ledger is updated in CONTENT17_HUMAN_ISSUES.md; do not create a
new taxonomy or treat engineering tests as31 human-quality closures.

CI uses PR15's exact official Push Node22 inner package, digest
c9d6d19725b51cef8fb7f4c0f6acb46262cfba5d0615b5c39c548514c42047b0,
as parent comparator. Existing five-block ABBA/BAAB protocol,500/800 density,
720p/1080p, all3 modes, cold/drained-warm and strict8ms remain. The same-build
comparison now isolates Images versus ordered actors; PR15's old ground
comparison remains preserved in its committed evidence. Advancing profiler
now records the actually served compiled stamp and accepts comparator queries.
Physical timings and software CI remain separate. Final counts, source/test
merge SHA, measurements, negative outcomes and package receipts belong to the
new Draft PR after exact-head checks finish. A pending gate is not a default PASS.

## Art production dependency and narrow external handoff

No replacement gait or editable painted source is claimed. Existing36 poses
and eight front attack frames stay intact. On16October neither common Program
Files/local Programs directories nor standard HKCU/HKLM uninstall entries
identified Krita/Blender/Aseprite/Inkscape. This bounded inventory is not proof
of absence everywhere. No accepted layered source appeared in tracked standard
KRA/ORA/PSD/ASEPRITE/BLEND/SCML/SCON files. Another generated grid or legacy flat
SVG cutout cannot establish painted anatomy/foot contact. ANIMATION_PRODUCTION
remains BLOCKED while the engineering work proceeds independently.

The existing research/CONTENT16_1_REMAINING.md is still the concrete artist
deliverable. No broad competitor/terrain research is repeated. Remaining
ChatGPT task: interpret current damage-source/entry-health evidence alongside
the controller's boss-warning response before proposing one fairness change;
separate AI limitations from real human counterplay. For render tails, use the
new same-build and advancing data to decide one next controlled experiment,
keeping inclusive CPU/API spans, asynchronous GPU time and frame time separate.
Do not infer exclusive cost by subtracting unrelated percentiles.

## Coordinated human review

Use the final clean source/official package and `npm run qa:human`, verify stamp,
then one fresh Hunters Stone→Space→Boss→World2 attempt. Review moving front/back
weapon attachment, natural damage/warnings/victory or defeat, biome/site travel,
Normal/Reduced/HC and selected EN/TH200% decisions. Keep raw reports private and
ignored. Preserve INTERRUPTED_BY_BUG; only a fresh human may grant visual/fun
acceptance. Failed automated encounters and old measurements are not overwritten.
