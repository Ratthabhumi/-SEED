import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_e.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_e.png',
    seedPath: 'assets/seed/input/prompt_e.png',
    id: 'kenney-input-e',
    purpose: 'Squad Focus target command input prompt',
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_r.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_r.png',
    seedPath: 'assets/seed/input/prompt_r.png',
    id: 'kenney-input-r',
    purpose: 'Squad Hold ground command input prompt',
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_f.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_f.png',
    seedPath: 'assets/seed/input/prompt_f.png',
    id: 'kenney-input-f',
    purpose: 'Active Civilization ability trigger input prompt',
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_t.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_t.png',
    seedPath: 'assets/seed/input/prompt_t.png',
    id: 'kenney-input-t',
    purpose: 'Tech Map toggle key input prompt',
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'input-prompts',
    sourceRelative: 'Keyboard & Mouse/Default/keyboard_m.png',
    vendorPath: 'assets/vendor/kenney/input-prompts/keyboard_m.png',
    seedPath: 'assets/seed/input/prompt_m.png',
    id: 'kenney-input-m',
    purpose: 'Minimap / Civ Map toggle key input prompt',
    presentationTransform: 'Scaled/styled at runtime by HTML/CSS and Phaser',
  },

  // 2. Sci-Fi RTS (Outposts)
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_03.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_03.png',
    seedPath: 'assets/seed/structures/outpost_research.png',
    id: 'kenney-outpost-research',
    purpose: 'Visual presentation sprite for civilization Research Outposts',
    presentationTransform: 'Scaled/anchored at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_05.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_05.png',
    seedPath: 'assets/seed/structures/outpost_military.png',
    id: 'kenney-outpost-military',
    purpose: 'Visual presentation sprite for civilization Military Outposts',
    presentationTransform: 'Scaled/anchored at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'sci-fi-rts',
    sourceRelative: 'PNG/Default size/Structure/scifiStructure_07.png',
    vendorPath: 'assets/vendor/kenney/sci-fi-rts/scifiStructure_07.png',
    seedPath: 'assets/seed/structures/outpost_economic.png',
    id: 'kenney-outpost-economic',
    purpose: 'Visual presentation sprite for civilization Economic Outposts',
    presentationTransform: 'Scaled/anchored at runtime by HTML/CSS and Phaser',
  },

  // 3. UI Pack - Sci-Fi
  {
    pack: 'ui-pack-sci-fi',
    sourceRelative: 'PNG/Blue/Default/bar_square_gloss_large.png',
    vendorPath: 'assets/vendor/kenney/ui-sci-fi/bar_square_gloss_large.png',
    seedPath: 'assets/seed/ui/panel_header_bar.png',
    id: 'kenney-ui-header-bar',
    purpose: 'Tech Map and Age requirement card chrome header styling',
    presentationTransform: 'Sliced/scaled at runtime by HTML/CSS',
  },
  {
    pack: 'ui-pack-sci-fi',
    sourceRelative: 'PNG/Blue/Default/bar_round_large_square.png',
    vendorPath: 'assets/vendor/kenney/ui-sci-fi/bar_round_large_square.png',
    seedPath: 'assets/seed/ui/button_frame.png',
    id: 'kenney-ui-button-frame',
    purpose: 'Tech Map controls (FIT, RESET, zoom) and command action buttons',
    presentationTransform: 'Framed/scaled at runtime by HTML/CSS',
  },

  // 4. Particle Pack
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/circle_05.png',
    vendorPath: 'assets/vendor/kenney/particles/circle_05.png',
    seedPath: 'assets/seed/vfx/hit_impact.png',
    id: 'kenney-vfx-hit',
    purpose: 'Combat hit impact VFX texture',
    presentationTransform: 'Scaled/tinted/faded at runtime by Phaser particle tweens',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/light_01.png',
    vendorPath: 'assets/vendor/kenney/particles/light_01.png',
    seedPath: 'assets/seed/vfx/claim_glow.png',
    id: 'kenney-vfx-claim',
    purpose: 'Territory and Outpost claim animation pulse',
    presentationTransform: 'Scaled/tinted/faded at runtime by Phaser particle tweens',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/magic_04.png',
    vendorPath: 'assets/vendor/kenney/particles/magic_04.png',
    seedPath: 'assets/seed/vfx/breakthrough_spark.png',
    id: 'kenney-vfx-breakthrough',
    purpose: 'Breakthrough discovery and Age transition milestone particle',
    presentationTransform: 'Scaled/tinted/faded at runtime by Phaser particle tweens',
  },
  {
    pack: 'particle-pack',
    sourceRelative: 'PNG (Black background)/muzzle_01.png',
    vendorPath: 'assets/vendor/kenney/particles/muzzle_01.png',
    seedPath: 'assets/seed/vfx/raid_alert.png',
    id: 'kenney-vfx-raid',
    purpose: 'Territory raid warning and breach alarm flare texture',
    presentationTransform: 'Scaled/tinted/faded at runtime by Phaser particle tweens',
  },

  // 5. Board Game Icons
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/book_open.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/book_open.png',
    seedPath: 'assets/seed/icons/icon_research.png',
    id: 'kenney-icon-research',
    purpose: 'Knowledge and Research category indicator icon',
    presentationTransform: 'Scaled/rendered at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/shield.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/shield.png',
    seedPath: 'assets/seed/icons/icon_military.png',
    id: 'kenney-icon-military',
    purpose: 'Military, defense and squad garrison indicator icon',
    presentationTransform: 'Scaled/rendered at runtime by HTML/CSS and Phaser',
  },
  {
    pack: 'board-game-icons',
    sourceRelative: 'PNG/Default (64px)/resource_iron.png',
    vendorPath: 'assets/vendor/kenney/board-game-icons/resource_iron.png',
    seedPath: 'assets/seed/icons/icon_economic.png',
    id: 'kenney-icon-economic',
    purpose: 'Economy, outpost yield and resource indicator icon',
    presentationTransform: 'Scaled/rendered at runtime by HTML/CSS and Phaser',
  }
];

const PACK_METADATA = {
  'input-prompts': {
    name: 'Kenney Input Prompts',
    url: 'https://kenney.nl/assets/input-prompts',
    versionStatus: 'EXACT_VERSION_VERIFIED',
    version: '1.5a',
    officialPageLatestVersion: '1.5a',
    sourceRelease: 'Input Prompts (1.5A)',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
    vendorDir: 'input-prompts',
  },
  'sci-fi-rts': {
    name: 'Kenney Sci-Fi RTS',
    url: 'https://kenney.nl/assets/sci-fi-rts',
    versionStatus: 'VERSION_UNVERIFIED_CURRENT_SOURCE',
    version: '1.0',
    officialPageLatestVersion: '1.0',
    sourceRelease: 'current official download as of 2026-10-01',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
    vendorDir: 'sci-fi-rts',
  },
  'ui-pack-sci-fi': {
    name: 'Kenney UI Pack - Sci-Fi',
    url: 'https://kenney.nl/assets/ui-pack-sci-fi',
    versionStatus: 'EXACT_VERSION_VERIFIED',
    version: '2.0',
    officialPageLatestVersion: '2.0',
    sourceRelease: 'UI Pack: Sci-fi (2.0)',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
    vendorDir: 'ui-sci-fi',
  },
  'particle-pack': {
    name: 'Kenney Particle Pack',
    url: 'https://kenney.nl/assets/particle-pack',
    versionStatus: 'EXACT_VERSION_VERIFIED',
    version: '1.1',
    officialPageLatestVersion: '1.0',
    sourceRelease: 'Particle Pack (1.1)',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
    vendorDir: 'particles',
  },
  'board-game-icons': {
    name: 'Kenney Board Game Icons',
    url: 'https://kenney.nl/assets/board-game-icons',
    versionStatus: 'EXACT_VERSION_VERIFIED',
    version: '1.1',
    officialPageLatestVersion: '1.1',
    sourceRelease: 'Board Game Icons (1.1)',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    author: 'Kenney',
    vendorDir: 'board-game-icons',
  }
};

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const scratchBase = path.resolve('scratch/kenney_downloads');

// Ensure vendor license files are preserved
for (const [packKey, meta] of Object.entries(PACK_METADATA)) {
  const srcLicense = path.join(scratchBase, packKey, 'License.txt');
  if (fs.existsSync(srcLicense)) {
    const destDir = path.join(VENDOR_BASE, meta.vendorDir);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcLicense, path.join(destDir, 'License.txt'));
  }
}

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

  const vendorSha = sha256(vendorFull);
  const prodSha = sha256(seedFull);
  const size = fs.statSync(seedFull).size;

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
    versionStatus: meta.versionStatus,
    versionOrRelease: meta.version,
    sourceRelease: meta.sourceRelease,
    officialPageLatestVersion: meta.officialPageLatestVersion,
    downloadedAt: '2026-10-01T00:20:00Z',
    modified: false,
    modifications: 'None at file level',
    presentationTransform: item.presentationTransform,
    attributionRequired: false,
    purpose: item.purpose,
    status: 'production-selected',
    byteSize: size,
    vendorSourceSha256: vendorSha,
    productionSha256: prodSha
  });
}

const manifest = {
  version: 2,
  generatedAt: new Date().toISOString(),
  totalAssets: manifestEntries.length,
  assets: manifestEntries
};

fs.mkdirSync(path.resolve('assets'), { recursive: true });
fs.writeFileSync(path.resolve('assets/ASSET_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Successfully installed ${manifestEntries.length} assets and generated assets/ASSET_MANIFEST.json`);
