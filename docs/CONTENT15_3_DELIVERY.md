# Content15.3 playable visual and boss candidate

Verified parent PR12 `ce63df35d52e8b3041d232f5e8e3438c087cecf8`.
Branch `feat/content153-playable-visual-boss-20261015`; one stacked Draft.
No main merge, tag, public release or historical evidence rewrite.

## Playable changes

- Existing hostile `enemy-burst`, `enemy`, `boss-fan` receive original painted
  fast flechette, heavy shell and boss spear artwork respectively. No canonical
  hostile energy source exists: fourth energy illustration is unused, rather
  than inventing an attack. High Contrast and unknown-source vector fallback
  remain available. Existing bounded mesh path,1000-shot cap, new0.25MiB atlas.
- Hunters front Stone/Space gets four genuinely distinct release/follow-through/
  return/guard frames per Age through the existing canonical-time sampler and
  native Phaser animations. Source rows1/3 columns3/5/6/7 only. Original raw
  generation retained. Importer removes detached neighboring-cell spill using
  the largest connected alpha component, preserves body pixels and fixed scale.
  Per-frame hand sockets are explicit initial source coordinates, not artist
  approval. Pausing freezes playback; back/walk/other action clips remain old.
- **Continuous walk remains BLOCKED by authored gait quality.** The new generated
  source still fails reliable alternating contact chronology. No Krita/Aseprite
  executable was found through available commands. No layered project, in-between
  gait certification or full motion family is fabricated. The importer has been
  extended, not replaced, and the failed walk rows are withheld from runtime.
- Fallback and Worker now share the same periodic biome preparation. Four
  manager-owned256px fallback textures add1MiB and are reused on restart. Worker
  receives already-prepared bytes; original backing atlas/typed orientation,
  epoch guards,64 slots and one upload/frame remain intact. World-space warp and
  adjacent-biome blending still differ from uniform fallback: this is a material
  reconciliation, not exact fallback/prepared pixel identity. Startup preparation
  time is exposed separately and must not be hidden in warm-frame measurements.
- Hero/squad/guardian visual sizes112→126/56→60/48→54 world units. Actual source
  alpha bounds are projected at720p/1080p/2560×1305, four Origins/six Ages/front
  and back (144 cases). Hero body occupancy increases12.5%; collision, speed,
  pickup reach and camera zoom do not change. Native clutter/contrast acceptance
  is still required, not implied by display dimensions.
- Boss half-HP now schedules transition from approach/warning/recovery promptly;
  committed/active attacks finish first. Transition remains visible0.8s, and
  phase2 resets its sequence to a warned cross before fan/slam. Lethal hits remain
  lethal; no HP multiplication, damage immunity or fake phase rescue. Telemetry
  compares actual canonical damage/phase exposure over36 seeded Origin/tier
  arenas against exact archived parent. Arena setup is staged; no HP/phase writes
  occur during measured combat. It is not a complete natural progression run.

## Compatibility and evidence gates

WORLDGEN/CONTENT/SAVE = **3/16/2**. Content16 intentionally changes boss rhythm
and therefore replay outcomes; old traces keep their original Content identity.
No world topology/save migration or new runtime dependency. Existing input,
Logistics/Signal exemption, progression and save protections must stay covered.

Local/CI test results, native gallery, performance comparison and official ZIP
verification are recorded only after execution. Prior Content15.2 results do
not certify this new candidate. Failed experiments and interrupted human
sessions remain unchanged. HUMAN_ART_PASS/HUMAN_FUN_PASS/RELEASE_READY are open.

See active-art inventory,31-issue delta and targeted research handoff. Final
exact-head CI/artifact receipt belongs to the Draft PR body, avoiding a recursive
commit-SHA loop. One human retest after engineering gates: `npm run qa:human`,
confirm displayed exact SHA, fresh Stone→Space→Boss→World2; record actual input,
readability, terrain, attack animation, phase exposure, art/fun and interruptions.

Full natural progression comparison reuses the existing controller with fixed
balanced/damage/survival draft priorities:4Origins×3seeds×3priorities,1200s cap,
exact parent/current simulations. No HP/stat grants or forced phases. Trace
includes phase durations, attacks/recovery, real damage, actual researched builds,
defeats/unreached/censored outcomes and one-tick lethal observations. This is
automated canonical play, not human fun. Native Boss video starts from a real
progression-earned build, then uses actual keyboard movement through the fight.

CI has five jobs: the four prior engineering jobs plus isolated render evidence.
The latter retains two240-row five-block comparisons (parent/candidate and
same-build cached/painted hostile art), fixed500/800 counts, all three modes,
720p/1080p and cold/warm. Devices/compiled SHAs are recorded. Software CI values
cannot certify the operator's Intel hardware; green measurement execution is
separate from strict render<8ms acceptance.
The existing advancing canonical stress also covers Space/boss/World2/restart;
its high-HP setup and retiring projectile counts remain explicitly staged.

Retained checkpoint failures:43b751d typecheck lacked Node timer declarations;
45e40bf ran492/494 unit tests successfully but two asset-category checks failed.
New original art is now classified in the existing Content15 MIT namespace with
actual resize/slicing metadata and distinct raw/normalized hashes. No license,
integrity, gameplay assertion or performance threshold was weakened.
