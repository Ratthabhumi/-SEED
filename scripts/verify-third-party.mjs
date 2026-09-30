import fs from 'node:fs';
import path from 'node:path';

function fail(msg) {
  console.error(`❌ [VERIFY-THIRD-PARTY FAIL] ${msg}`);
  process.exit(1);
}

console.log('🔍 Verifying third-party dependencies, licenses, and asset provenance...');

// 1. Verify package.json dependencies
const pkgPath = path.resolve('package.json');
if (!fs.existsSync(pkgPath)) fail('package.json missing');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const deps = { ...pkg.dependencies, ...pkg.devDependencies };
if (!deps['@dagrejs/dagre']) fail('@dagrejs/dagre missing from package.json');
if (!deps['@panzoom/panzoom']) fail('@panzoom/panzoom missing from package.json');

console.log('✓ Expected npm packages present in package.json');

// 2. Verify required documentation files
const requiredDocs = [
  'docs/ART_BIBLE.md',
  'docs/THIRD_PARTY_LICENSES.md',
  'docs/OPEN_SOURCE_LEVERAGE.md',
  'docs/DEVELOPMENT_TOOLING.md',
  'docs/DEPENDENCY_POLICY.md',
  'ROADMAP.md'
];

for (const doc of requiredDocs) {
  const p = path.resolve(doc);
  if (!fs.existsSync(p)) fail(`Required documentation missing: ${doc}`);
  const stat = fs.statSync(p);
  if (stat.size < 100) fail(`Documentation file suspiciously empty: ${doc}`);
}
console.log('✓ All 6 governance and design documents present and populated');

// 3. Verify ASSET_MANIFEST.json
const manifestPath = path.resolve('assets/ASSET_MANIFEST.json');
if (!fs.existsSync(manifestPath)) fail('assets/ASSET_MANIFEST.json missing');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (e) {
  fail(`assets/ASSET_MANIFEST.json failed to parse: ${e.message}`);
}

if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) {
  fail('assets/ASSET_MANIFEST.json contains no assets');
}

for (const a of manifest.assets) {
  if (!a.id) fail('Manifest asset missing "id"');
  if (!a.sourcePack) fail(`Manifest asset ${a.id} missing "sourcePack"`);
  if (!a.sourceLicense) fail(`Manifest asset ${a.id} missing "sourceLicense"`);
  if (!a.purpose) fail(`Manifest asset ${a.id} missing "purpose"`);
  if (!a.projectPath) fail(`Manifest asset ${a.id} missing "projectPath"`);

  const fileOnDisk = path.resolve(a.projectPath);
  if (!fs.existsSync(fileOnDisk)) {
    fail(`Manifest references file that does not exist on disk: ${a.projectPath}`);
  }
}
console.log(`✓ Asset manifest validated (${manifest.assets.length} normalized production assets verified on disk)`);

// 4. Verify pure core isolation (grep for third-party packages in src/core)
const coreDir = path.resolve('src/core');
function scanCore(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) scanCore(full);
    else if (f.name.endsWith('.ts')) {
      const code = fs.readFileSync(full, 'utf8');
      if (code.includes('@dagrejs/dagre') || code.includes('@panzoom/panzoom') || code.includes('phaser')) {
        fail(`Forbidden presentation import in core file: ${full}`);
      }
    }
  }
}
scanCore(coreDir);
console.log('✓ Pure src/core isolation verified (zero third-party presentation imports)');

console.log('✅ ALL THIRD-PARTY AND PROVENANCE CHECKS PASSED.');
