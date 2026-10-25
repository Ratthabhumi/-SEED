# Content15 — Combat, World and Interface Quality Pass

Engineering delivery; human visual acceptance and fun verdict remain pending.
Final exact-SHA CI/package/performance receipt belongs in the Draft PR and ignored
release receipt, avoiding a circular SHA in committed source.

## 1. Baseline verification and QA history

PR9 remains OPEN/Draft, head fd171b239d00827d8100ae165d551d5766630cc7;
both push38434628375 and PR38435075840 checks are green. Remote matched local.
Incoming human/handoff work preserved:6228 files with SHA256 ledger in ignored
scratch/content15-human-baseline-20261014 before browser output cleanup.
Raw reports402/403 share session qa-422486-kb2iv0, clean fd171b2, wallStart
422487.60000000894 and wallEnd2493852.299999997, target-complete. They are snapshots
of ONE Resonant/GOLDEN run: boss killed699.62s, child+120.10s, wall2071.36s.
Ratings/comment are not provided. Operator's22 quality complaints are direct
feedback, separately classified QUALITY_GATE_FAILED, without changing the recorded
terminal outcome or older INTERRUPTED_BY_BUG evidence. ^C is not a game crash.

## 2. All22 issues with independent statuses

PASS below means scoped functional engineering, never human art approval.

|#|Issue|Status|Correction/evidence and limitation|
|--|--|--|--|
|1|One delivery|PARTIAL|One coordinated branch/Draft; original full authored animation remains open|
|2|Origin weapons/projectiles|PARTIAL|Existing24 equipment frames, real source tiers; neutral primary mount and painted orbit; native four-Origin matrix|
|3|Actor/base size|PARTIAL|Measured neutral alpha body100×108 in128px cells; normal enemies52/68/76/92, boss240; collisions unchanged, supported viewport captures|
|4|Logistics overflow|PASS/regression|Canonical ledger and first-Signal full-cost exception retained; free claims preserved|
|5|Raid late gate|PASS/regression|Prior gate-aware raid scheduling preserved; actual attackers still required|
|6|Tech Pin gold|PASS/regression|Actual offered path recommendation and gold outline retained|
|7|Legacy art|PARTIAL|Default Hero/floors/elite rings replaced; intentional HC and original squad poses retained|
|8|Readability/FOV|PARTIAL|Larger enemy hierarchy, stronger hero alpha footprint, same1–1.25 camera zoom; dense human acceptance pending|
|9|Unified GUI|PARTIAL|Shared token panel material/focus/Thai wrapping; existing all-surface suite retained, human audit pending|
|10|Site state|PARTIAL|Explored-chunk visibility, visited checkmark, grounded props, canonical blocked reason; existing claimed/damaged/repair art|
|11|Biome sites|PASS/engineering|Biome-weighted ruin/meteor/vault/signal; all remain possible, unchanged density/geometry/reward; worldgen3|
|12|Mirrored floor motifs|PARTIAL|New quiet4 floors, periodic Worker preparation, non-mirrored world-stable sampling; seamless/negative-coordinate tests; visual approval pending|
|13|Silent failed claim|PASS/engineering|Single canonical claimStatus with localized distance/hostile/discovery/claimed/run reasons; C and contextual panel|
|14|Space orbit|PASS/identity|Painted damage emitters at actual orbital count/position; named live family HUD; HC functional geometry retained|
|15|Six-age Hero|PARTIAL|48 authored neutral front/back costumes, four Origins×six ages; procedural bob/recoil is NOT full authored animation|
|16|Duplicate weapon|PASS/composition|Neutral body plus one primary handheld mount; traps/autonomous Defense do not substitute a second handheld weapon|
|17|Boss/Elite rhythm|PARTIAL|Six explicit deterministic states, pattern timing, half-health transition, fixed-aim escape gaps, family elite rush/burst; human encounter acceptance pending|
|18|World2 phantom powers|PASS/identity|Live canonical family/Legacy HUD and reset; old-world notifications disposed; Ascension regression retained|
|19|Space selects card|PASS/native|Before-fix EN/TH reproduction failed; held Space/Enter/number transition guard, native fresh selection and FIFO preserved|
|20|Skill HUD|PASS/engineering|Origin/F cooldown, real enabled stages, major Conduction/Relay/Breakthroughs, regen and actual Legacy; focus/click descriptions|
|21|Notifications|PASS/scoped|3 visible/64 queued, stable stack, priorities/preemption, deduplication, modal/hidden dwell freeze; counted overflow is not durable history|
|22|Reports402/403|PASS/evidence|Raw JSON confirms one terminal session, no invented ratings or fun pass|

## 3. Gameplay root causes and fixes

Browser Space release activates a newly focused button, independent of Phaser's
previous event replay issue. Capture-phase held-key snapshot prevents inherited
default activation, allows keyup to release movement, cancels pre-modal dash edges,
rebuilds queued choices and rejects stale callbacks/repeated number
events and gates dash during decisions. No arbitrary cooldown. Actual selected
effective effects are copied into tech_selected and visibly confirmed.
claimStatus is read-only and shared with mutation; no capacity or enemy bypass.

## 4. Enemy/Boss design changes

Approach → warning → commit → attack → recover; one half-health phase-transition.
Distinct warning1.15/1.35/1.4s and recovery1.85/1.4/1.8s for slam/fan/cross.
Fixed aim,0.14s commitment,0.18s release, stationary counterattack opportunity.
Phase-two sequence varies spatial problems; six fan shots keep central escape gap.
Elite chaser/ranged use actual warned rush/burst; three burst shots total one
enemy-shot damage. Shared hazard geometry preserves14-unit player collision and
2.2s projectile flight. Directional teeth/muzzle/lane, slam fractures and elite
crown replace generic normal yellow rings; critical edges survive HC/Reduced.
No claim that synthetic policies prove fun or a commercial-quality boss.

## 5. Art direction and six-Age evolution

Stone fur/leather → Bronze craft → Iron armor → Industrial mechanisms → Atomic
ceramics/energy → Space exosuits. Gold/green Hunters, teal Engineers, violet/ivory
Resonant, crimson/ivory Sentinels stay recognizable. Original48 neutral poses;
one external canonical primary weapon. Same upright body anchor/facing policy;
authored back costumes restore back-facing identity. Full multi-frame authored
idle/walk/attack/hurt/dash/ability/death and six-era enemy/Guardian outfits remain
unfinished, rather than relabeling static cells as animation.

## 6. UI/UX and notification changes

Shared material tokens, stable keyboard focus, compact accessible power loadout,
cooldowns, actual family effects/major combinations/Legacy, expanded descriptions
preserved during clock updates. Three stacked notices with critical preemption,
64-entry waiting cap and duplicate counts. Modal/hidden dwell freezes, dismissal
does not erase critical messages. Restart/Ascension dispose old notices/listeners.
Overcapacity critical bursts are counted summaries, not an exhaustive event log.

## 7. Site/Biome generation changes

Weights ruin/meteor/vault/signal: Verdant5/1/2/2, Arid2/5/2/2,
Tundra3/1/5/2, Badlands2/3/4/2. Existing themed rewards stay unchanged.
All mission families remain reachable; no new farming reward/POI density.
Hidden sites outside explored chunks are not disclosed by renderer prewarming.
New authored low-contrast floors remove large repeated bush/rock disks. Periodic
crossfade happens once in Worker; stable warped sampling replaces mirrored motifs.
Original64-slot atlas/one256KiB upload/frame/fallback/backpressure retained.

## 8. Exact tests and screenshots

Native failing-before-fix decisionBoundary EN/TH Space traces preserved privately.
First full check:475 passed/3 failed (new manifest class, bounds metadata placement,
Worldgen test literal); corrected with documented new-asset/version expectations,
no tests removed, no timeout relaxed. Focused compatibility16/16, boss6/6 passed.
Further queued-draft red failed before repair.480 assertions passed with a retained
onTaskUpdate worker RPC error under concurrent load; quiet full480/480 across78
files passed with standard settings. Native integrated54/54 passed on Intel D3D11
before final phase fixture refinements. Final phase/draft/HUD/body/combat native
19/19 PASS on the same D3D11 backend; final CI receipt supersedes local candidates.
Native captures: content15-body-Origin-age, content15-loadout-notifications-EN/TH,
existing six-age/boss/Worker/FIFO/Logistics/path/viewports in browser artifacts.
CI artifact and exact candidate receipt are required; prospective greens prohibited.

## 9. Before/after performance

Parent fd171b2 archived-source renderer baseline measured on Intel UHD630/D3D11,
same seed/trajectory, two viewports, three modes and500/800 staged render fixture.
Baseline compilation inherited workspace Git metadata; source is the archived
parent, not an official clean package. Final paired candidate/stability/live
canonical stress results belong in the delivery receipt. The staged renderer
pauses canonical simulation; live stress is a separate high-HP fixture with real
movement/collisions/retirement and no continuous800-projectile refill. Neither
constitutes a natural human60FPS/fun certificate. No performance budgets relaxed.

## 10. Canonical versions and compatibility

Worldgen3 / Content15 / Save2 / package0.2.0-dev.0. Worldgen type distribution and
derived version-keyed laws intentionally change; world-one content-law pin9 stays.
Old seed identity/replays belong to worldgen2/content14; never relabel them.
Density, positions, IDs, discovery rules/rewards remain. Save settings/archive
migration remains schema2 and old archived versions retain provenance.

## 11. Asset licensing/provenance

Five selected original PNGs bring manifest to53; raw front/back/ground and exact
three built-in imagegen prompts are retained under assets/original/content15.
Project MIT, -SEED contributors/OpenAI image generation, human art review pending.
Offline normalization only extracts alpha/cells, uniformly resizes and packs;
no semantic painting via Python. Source/production and additional back-source
SHA256 are verified. scripts/normalize-content15.py reproduces packing from raw.
No new runtime dependency, copied game art/code or removed historical sources.

## 12. Known unresolved issues

Live canonical stress additionally discovered a pre-existing restart crash:
floating Text canvases destroyed by Phaser remained referenced in the pool.
Corrected parent-native energy-impact/restart/energy-impact fails with the same
floatTextAt/setColor/updateUVs null-drawImage stack; resetting Text/Image pools
and pending impact data passes. Initial wrong-hook/pause/CLI fixture failures
were preserved separately and are not product proof. The corrective receipt
supersedes the first Content15 candidate e2c3811. Live dense median/tails differ
from the paused renderer fixture; keep both scopes and unmet budgets explicit.

Full authored animation, six-era enemy/Guardian/environment kits, final all-surface
human art evaluation and natural run difficulty/fun acceptance remain pending.
Source floor Worker fallback uses original source cells and can differ transiently
from periodic prepared pixels. Queue overflow is summarized rather than a history
archive. Physical-GPU fixtures cannot establish universal hardware performance.
P1/core closure and presentation integration must not be presented as GAME_COMPLETE.

## 13. Branch, final SHA, Draft PR

feat/content15-combat-world-ui-quality targets PR9's branch in
[Draft PR10](https://github.com/Ratthabhumi/-SEED/pull/10).
Verified product SHA070098909d40cac810e2438311e54ba2c21d53ed; later evidence-only
publication has distinct lineage. No main merge/tag/public release.

## 14. Exact-head CI and ZIP receipt

Product exact-SHA push38500135128 and PR38500139907 passed4/4 each:
check480 tests/53 provenance, Analyze6, browser147 PASS/1 existing capture skip,
ZIP and release verification. Official CRC/root/licensing/compiled-SHA passed.
[Delivery receipt](CONTENT15_DELIVERY_RECEIPT.md) records package hashes and
all performance results, including open8ms renderer/ground budgets. Evidence-only
publication CI is separate from the verified product SHA.

## 15. Single clean human retest procedure

Only after final exact-head engineering/CI/package receipt, launch npm run qa:human
and open localhost5173/?qa=1. Start a NEW recorded run. Check Space held across
draft/release/fresh intentional pick; read why a contested/distant site cannot be
claimed; verify6/6 Later/Esc/retry and intentional Signal exception. Inspect one
weapon/six costumes, actual orbit/Legacy names, boss windup/gap/recovery/phase,
notifications, UI scale100–200%, EN/TH, natural traversal/dense fights and World2.
Supply actual fun/readability/replay feedback once. Preserve any interrupted
bug run as INTERRUPTED_BY_BUG. No mid-stage operator playtest requested.
