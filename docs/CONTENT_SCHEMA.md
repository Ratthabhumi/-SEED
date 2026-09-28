# Content Schema

## TechNode

`id, titleKey, descriptionKey, age, domain (warfare|industry|science|culture),
tags[], prerequisites[], exclusions[], rarity, weight, effects[], synergyTags[]`.

Effects: `damageMul maxHpAdd moveMul pickupMul cooldownMul projectileAdd auraAdd
orbitAdd summonAdd mineAdd beamAdd regenAdd dashCdMul knowledgeMul weaponEvolve`
(+ optional `family`). All player-facing strings are i18n keys — never raw text.

## WeaponStage

`nameKey archetype damage cooldown count speed radius color`, 6 stages per family
in `src/core/combat/weapons.ts`, stage index = age index (orbital program → all 5).

## Enemy lineage

Per family: per-age name + color, base `hp/speed/dmg/radius` in
`src/content/content.ts`. Scaling: `×(1+0.28·age)(1+0.35·asc)(1+t/900)`.

## POI

`ruin meteor vault signal` (+ megasite/worldtree reserved). `poiTypeFor(type)` gives
knowledge reward + seed note. Effects are data (knowledge + toast); DAG mutations
reserved for V0.3.

## Biome

`verdant arid tundra badlands` with ground/alt/accent colors in `BIOME_STYLE`.
Classifier thresholds live in `src/core/world/biome.ts`.
