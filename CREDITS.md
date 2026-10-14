# Credits

## Project

-SEED: เมล็ดพันธุ์แห่งอารยธรรม — designed and built 2026-09-29 as an original work.
Working codename `EPOCH//SEED`; repository-safe identifier `seed-game`.
No trademark/name clearance performed yet — treat the display title as provisional.

## Code & content provenance

- All source code, game text (EN/TH), balance values, and audio were created for this
  project with LLM coding assistance (OpenCode + Muse Spark) and maintainer review.
- No source code, artwork, audio, dialogue, maps, or assets were taken from any
  existing game. Named genre references were used for high-level mechanics only.

## Third-party

- Phaser 4.2.1 — MIT License (Copyright (c) 2026 Richard Davey, Phaser Studio Inc.;
  full text in `public/licenses/PHASER-MIT.txt`, shipped in the release artifact)
- Vite, TypeScript, Vitest (MIT)
- Noto Sans + Noto Sans Thai — SIL Open Font License 1.1, bundled via
  `@fontsource/noto-sans` and `@fontsource/noto-sans-thai` (local files in the
  production build; no runtime CDN dependency).

## Audio

All sound effects are synthesized at runtime with the Web Audio API (`src/game/audio/sfx.ts`).
No external or copyrighted audio is used.

## Original painted gameplay assets

Four hero atlases, enemy/boss/outpost atlases and Verdant/Arid/Tundra/Badlands floors were generated for this project using OpenAI imagegen on2026-10-13. Raw source PNGs, exact tool prompts and normalization records are retained; these assets are art-review-pending. See docs/art/GENERATION_RECORD.json and assets/ASSET_MANIFEST.json. They do not represent completed skeletal or multi-frame combat animations.

Three original painted combat/equipment/world-prop atlases were generated with
the same built-in tool on2026-10-13:16 projectile/trap cells,24 weapon-tier cells
and12 landmark/codex/Guardian/impact-sample cells. The impact sample is unbound.
Sources/prompts/packing records/normalized alpha/hashes are retained under
assets/original/combat and the generation record. Human acceptance is pending;
static six-tier weapons are not six animated costumes.

Content15 original art (2026-10-14):48 weapon-neutral front/back costume cells
for four Origins across six Ages and four quiet biome floor sources. Original
project MIT artwork generated with OpenAI imagegen; exact three prompts/raw
sources retained in assets/original/content15/GENERATION_RECORD.json. Five
selected PNGs have source/production checksums in the manifest, including the
additional back-source hash. Offline packing is reproducible with
scripts/normalize-content15.py. Human review and full authored animation remain
pending; procedural bob and weapon recoil are presentation, not animation assets.
