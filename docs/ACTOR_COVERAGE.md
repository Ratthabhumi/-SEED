# Living Frontier actor coverage and direction

Content14 override: normal gameplay uses the four painted16-pose hero atlases,
painted16-frame enemy roles,8 boss poses and12 outpost states introduced in
Content13. Hero112u, squad56u, Guardian48u, ordinary enemies44/56/64/78u,
elites1.4×, boss at least196u, bases176/208u. Camera zoom1–1.25 responds to
height; collision sizes remain canonical and unchanged. Six equipment materials
and mounted weapon geometries now come from combatPresentation/HeroEquipment,
with real release recoil and Origin-specific bow/mechanical/fork/prism grammar.
These rigs do not constitute six independently painted costumes or full authored
attack/death sequences. Guardian alone retains its six-era legacy SVG upload;
other old actor sources are retained for provenance/diagnostics without gameplay
GPU uploads. Historical prototype sizes below are superseded. See
INTEGRATED_GAMEPLAY_ART_CLOSURE.md for native evidence and open acceptance gates.

Editable original SVG in assets/original/actors; exact MIT copies in assets/seed/actors. All working-prototype pending human visual acceptance. Texture1152×64: six equipment Ages ×three64px anchored gait poses; pivot32,32. Ten textures≈2.81MiB raw RGBA before overhead. Cached once, no new dependency.

| Actor | Role/silhouette | Renderer / size | States | Status |
|---|---|---|---|---|
| hunters | hooded scout, asymmetric bow/cape | ActorRenderer48px | idle/gait/facing/dash/hit/ability tint/six Age equipment | prototype |
| engineers | helmet, broad shoulders, wrench | same | same | prototype |
| resonant | split robe, forked staff | same | same | prototype |
| sentinels | shield, protective helmet | same | same | prototype |
| chaser | six-legged mandible beetle | radius×3, pool650 | gait/facing/hit/age armor | prototype |
| ranged | winged organism, dorsal cannon | same | same; original aim tell retained | prototype |
| tank | wide armored crawler | same | same | prototype |
| swarm | narrow winged creature | same | same | prototype |
| boss | crown-tusk siege organism, own asset | canonical boss radius×3 | gait/facing/hit/HP; canonical hazards retained | prototype |
| elites | actual four family sprites | same | five canonical affix glyphs | bespoke animation partial |
| guardians | articulated defensive drone |26px, ally pool128 | orbit/gait | prototype |
| command squad | current world Origin equipment |28px, ally pool128 | gait/facing, canonical orders | prototype |

Orthographic top-down,2.5px dark outline at64px, upper-left cream highlights, slate interiors, restrained gold/teal devices and desaturated coral enemy shells. Differences use equipment, wing span, armor mass, mandibles and asymmetry. Age layers: bronze guards→iron plates→industrial packs→atomic cells→space exosuit. Hitboxes unchanged.

Production character bodies are sprites only. PlayerRenderer/EnemyRenderer spriteBody mode retains functional dash/hurt/aim/affix/HP indicators; geometry body fallback remains only for legacy VisualLab. Mandatory missing art throws diagnostic on load. Guardians/squad no longer draw circle summon bodies in GameScene. Projectiles/pickups/mines/orbit blades/area telegraphs intentionally retain functional graphics.

Remaining art: independent authored attack/dash/death sequences, enemy attack timing, bespoke elites, squad role variants, full six-age environmental art and human silhouette/scale approval. Gait and event tint do not certify full production animation. Original source/manifest hashes and bundled MIT license provide provenance; no reference-game assets copied.

Animation limitation: tank and boss currently use rigid facing/hit/equipment poses; their three gait frames repeat. Authored walking, attack and death animation remains production work.

## Upright directional corrective slice (2026-10-12)
Four humanoid strips now36 frames (18 front +18 authored back),2304×64; front idle/walk0/1/2 plus back offset18, stable horizontal flip, rotation0. Actual displacement controls gait; simulation time freezes animation on pause. Boss stays upright; insect/drone heading preserved.36-frame sprites keep pivot32,32 and six age equipment layers; cached raw actor pixels≈3.94MiB. Prior universal rotation/gait descriptions are superseded. ActorMotion and AGE_COMBAT_EVOLUTION.md define exact scope; authored attack/death/weapon mounts and expanded era/boss behavior remain partial.
