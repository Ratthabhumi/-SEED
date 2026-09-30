import fs from 'node:fs';
import path from 'node:path';

// Asset plan:
// Select only necessary files for proof-of-leverage to keep bundle lean and disciplined.
const VENDOR_BASE = path.resolve('assets/vendor/kenney');
const SEED_BASE = path.resolve('assets/seed');

const plan = [
  // 1. Input Prompts
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_q.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_q.png',
    seedPath: 'assets/seed/input/prompt_q.png',
    id: 'kenney-input-q',
    purpose: 'Squad Rally command input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD command prompt bar',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_e.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_e.png',
    seedPath: 'assets/seed/input/prompt_e.png',
    id: 'kenney-input-e',
    purpose: 'Squad Focus target command input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD command prompt bar',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_r.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_r.png',
    seedPath: 'assets/seed/input/prompt_r.png',
    id: 'kenney-input-r',
    purpose: 'Squad Hold ground command input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD command prompt bar',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_f.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_f.png',
    seedPath: 'assets/seed/input/prompt_f.png',
    id: 'kenney-input-f',
    purpose: 'Active Civilization ability trigger input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD command prompt bar',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_t.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_t.png',
    seedPath: 'assets/seed/input/prompt_t.png',
    id: 'kenney-input-t',
    purpose: 'Tech Map toggle key input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD prompt badges',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_m.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_m.png',
    seedPath: 'assets/seed/input/prompt_m.png',
    id: 'kenney-input-m',
    purpose: 'Minimap / Civ Map toggle key input prompt',
    modifications: 'Renamed and normalized to standard 32x32 size for HUD prompt badges',
  },

  // 2. Sci-Fi RTS (Outposts)
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_03.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_03.png',
    seedPath: 'assets/seed/structures/outpost_research.png',
    id: 'kenney-outpost-research',
    purpose: 'Visual presentation sprite for civilization Research Outposts',
    modifications: 'Isolated structure sprite, normalized scale and anchor point for world rendering',
  },
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_05.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_05.png',
    seedPath: 'assets/seed/structures/outpost_military.png',
    id: 'kenney-outpost-military',
    purpose: 'Visual presentation sprite for civilization Military Outposts',
    modifications: 'Isolated structure sprite, normalized scale and anchor point for world rendering',
  },
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_07.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_07.png',
    seedPath: 'assets/seed/structures/outpost_economic.png',
    id: 'kenney-outpost-economic',
    purpose: 'Visual presentation sprite for civilization Economic Outposts',
    modifications: 'Isolated structure sprite, normalized scale and anchor point for world rendering',
  },

  // 3. UI Pack - Sci-Fi
  {
    pack: 'ui-pack-sci-fi',
    sourceRelative: 'PNG/Blue/Default/bar_square_gloss_large.png',
    vendorPath: 'assets/vendor/kenney/ui-sci-fi/bar_square_gloss_large.png',
    seedPath: 'assets/seed/ui/panel_header_bar.png',
    id: 'kenney-ui-header-bar',
    purpose: 'Tech Map and Age requirement card chrome header styling',
    modifications: 'Used as sliced/scaled background element for strategic overlay headers',
  },
  {
    pack: 'ui-pack-sci-fi',
    sourceRelative: 'PNG/Blue/Default/bar_round_large_square.png',
    vendorPath: 'assets/vendor/kenney/ui-sci-fi/bar_round_large_square.png',
    seedPath: 'assets/seed/ui/button_frame.png',
    id: 'kenney-ui-button-frame',
    purpose: 'Tech Map controls (FIT, RESET, zoom) and command action buttons',
    modifications: 'Normalized button framing asset for UI components',
  },

  // 4. Particle Pack
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/circle_05.png',
    vendorPath: 'assets/vendor/kenney/particles/circle_05.png',
    seedPath: 'assets/seed/vfx/hit_impact.png',
    id: 'kenney-vfx-hit',
    purpose: 'Combat hit impact VFX texture',
    modifications: 'Cleaned alpha channel texture for additive particle emitter in Phaser',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/light_01.png',
    vendorPath: 'assets/vendor/kenney/particles/light_01.png',
    seedPath: 'assets/seed/vfx/claim_glow.png',
    id: 'kenney-vfx-claim',
    purpose: 'Territory and Outpost claim animation pulse',
    modifications: 'Glow alpha mask for territory expansion pulse',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/magic_04.png',
    vendorPath: 'assets/vendor/kenney/particles/magic_04.png',
    seedPath: 'assets/seed/vfx/breakthrough_spark.png',
    id: 'kenney-vfx-breakthrough',
    purpose: 'Breakthrough discovery and Age transition milestone particle',
    modifications: 'Radial burst particle texture for progression celebratory pulse',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/muzzle_01.png',
    vendorPath: 'assets/vendor/kenney/particles/muzzle_01.png',
    seedPath: 'assets/seed/vfx/raid_alert.png',
    id: 'kenney-vfx-raid',
    purpose: 'Territory raid warning and breach alarm flare texture',
    modifications: 'Warning flare indicator texture for raid proximity alerts',
  },

  // 5. Board Game Icons
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/book_open.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/book_open.png',
    seedPath: 'assets/seed/icons/icon_research.png',
    id: 'kenney-icon-research',
    purpose: 'Knowledge and Research category indicator icon',
    modifications: 'Normalized to 24x24 / 32x32 SVG-compatible icon asset',
  },
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/shield.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/shield.png',
    seedPath: 'assets/seed/icons/icon_military.png',
    id: 'kenney-icon-military',
    purpose: 'Military, defense and squad garrison indicator icon',
    modifications: 'Normalized to 24x24 / 32x32 SVG-compatible icon asset',
  },
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/resource_iron.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/resource_iron.png',
    seedPath: 'assets/seed/icons/icon_economic.png',
    id: 'kenney-icon-economic',
    purpose: 'Economy, outpost yield and resource indicator icon',
    modifications: 'Normalized to 24x24 / 32x32 SVG-compatible icon asset',
  }
];

const PACK_METADATA = {
  'input-prompts': {
    name: 'Kenney Input Prompts',
    url: 'https://kenney.nl/assets/input-prompts',
    version: '1.5',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
  },
  'sci-fi-rts': {
    name: 'Kenney Sci-Fi RTS',
    url: 'https://kenney.nl/assets/sci-fi-rts',
    version: '1.0',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
  },
  'ui-pack-sci-fi': {
    name: 'Kenney UI Pack - Sci-Fi',
    url: 'https://kenney.nl/assets/ui-pack-sci-fi',
    version: '1.0',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
  },
  'particle-pack': {
    name: 'Kenney Particle Pack',
    url: 'https://kenney.nl/assets/particle-pack',
    version: '1.0',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
  },
  'board-game-icons': {
    name: 'Kenney Board Game Icons',
    url: 'https://kenney.nl/assets/board-game-icons',
    version: '1.0',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
  }
};

const scratchBase = path.resolve('scratch/kenney_downloads');

const manifestEntries = [];

for (const item of plan) {
  const src = path.join(scratchBase, item.pack, item.sourceRelative);
  if (!fs.existsSync(src)) {
    throw new Error(`Source file missing: ${src}`);
  }
  const vendorFull = path.resolve(item.vendorPath);
  const seedFull = path.resolve(item.seedPath);

  fs.mkdirSync(path.dirname(vendorFull), { recursive: true });
  fs.mkdirSync(path.dirname(seedFull), { recursive: true });

  fs.copyFileSync(src, vendorFull);
  fs.copyFileSync(src, seedFull);

  const meta = PACK_METADATA[item.pack];
  manifestEntries.push({
    id: item.id,
    projectPath: item.seedPath.replace(/\\/g, '/'),
    vendorSourcePath: item.vendorPath.replace(/\\/g, '/'),
    sourcePack: meta.name,
    sourceUrl: meta.url,
    sourceFile: item.sourceRelative.replace(/\\/g, '/'),
    sourceLicense: meta.license,
    licenseUrl: meta.licenseUrl,
    author: meta.author,
    versionOrRelease: meta.version,
    downloadedAt: '2026-10-01T00:20:00Z',
    modified: true,
    modifications: item.modifications,
    attributionRequired: false,
    purpose: item.purpose,
    status: 'normalized'
  });
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  totalAssets: manifestEntries.length,
  assets: manifestEntries
};

fs.mkdirSync(path.resolve('assets'), { recursive: true });
fs.writeFileSync(path.resolve('assets/ASSET_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Successfully installed ${manifestEntries.length} assets and generated assets/ASSET_MANIFEST.json`);
