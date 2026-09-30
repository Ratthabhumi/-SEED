import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function fail(msg) {
  console.error(`❌ [VERIFY-THIRD-PARTY FAIL] ${msg}`);
  process.exit(1);
}

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

console.log('🔍 Verifying third-party dependencies, licenses, and asset provenance...');

const ROOT_DIR = path.resolve('.');

// 1. Verify package.json exact versions
const pkgPath = path.resolve('package.json');
if (!fs.existsSync(pkgPath)) fail('package.json missing');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const deps = { ...pkg.dependencies, ...pkg.devDependencies };
if (deps['@dagrejs/dagre'] !== '3.1.1') {
  fail(`@dagrejs/dagre must be exact version 3.1.1 (found: ${deps['@dagrejs/dagre']})`);
}
if (deps['@panzoom/panzoom'] !== '4.6.2') {
  fail(`@panzoom/panzoom must be exact version 4.6.2 (found: ${deps['@panzoom/panzoom']})`);
}
console.log('✓ package.json exact versions verified (@dagrejs/dagre@3.1.1, @panzoom/panzoom@4.6.2)');

// 2. Verify package-lock.json exact resolutions and licenses
const lockPath = path.resolve('package-lock.json');
if (!fs.existsSync(lockPath)) fail('package-lock.json missing');
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

const lockDagre = lock.packages?.['node_modules/@dagrejs/dagre'];
if (!lockDagre) fail('@dagrejs/dagre missing from package-lock.json packages');
if (lockDagre.version !== '3.1.1') {
  fail(`package-lock @dagrejs/dagre version mismatch: expected 3.1.1, found ${lockDagre.version}`);
}
if (lockDagre.license !== 'MIT') {
  fail(`package-lock @dagrejs/dagre license mismatch: expected MIT, found ${lockDagre.license}`);
}

const lockPanzoom = lock.packages?.['node_modules/@panzoom/panzoom'];
if (!lockPanzoom) fail('@panzoom/panzoom missing from package-lock.json packages');
if (lockPanzoom.version !== '4.6.2') {
  fail(`package-lock @panzoom/panzoom version mismatch: expected 4.6.2, found ${lockPanzoom.version}`);
}
if (lockPanzoom.license !== 'MIT') {
  fail(`package-lock @panzoom/panzoom license mismatch: expected MIT, found ${lockPanzoom.license}`);
}
console.log('✓ package-lock.json resolution and MIT licenses verified');

// 3. Verify required governance documentation files
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

// 4. Verify ASSET_MANIFEST.json and file-level integrity
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

const ACCEPTED_LICENSES = new Set(['CC0', 'MIT', 'OFL-1.1', 'Apache-2.0', 'BSD-3-Clause']);
const seenIds = new Set();
const seenProjectPaths = new Set();
const manifestedProjectFiles = new Set();

const requiredFields = [
  'id',
  'projectPath',
  'vendorSourcePath',
  'sourcePack',
  'sourceUrl',
  'sourceLicense',
  'licenseUrl',
  'author',
  'purpose',
  'attributionRequired',
  'downloadedAt',
  'versionStatus',
  'versionOrRelease',
  'byteSize',
  'vendorSourceSha256',
  'productionSha256'
];

for (const a of manifest.assets) {
  for (const field of requiredFields) {
    if (a[field] === undefined || a[field] === null || a[field] === '') {
      fail(`Manifest asset ${a.id || 'unknown'} missing required field: "${field}"`);
    }
  }

  // Duplicate checks
  if (seenIds.has(a.id)) {
    fail(`Duplicate asset ID in manifest: "${a.id}"`);
  }
  seenIds.add(a.id);

  const normProjectPath = a.projectPath.replace(/\\/g, '/');
  if (seenProjectPaths.has(normProjectPath)) {
    fail(`Duplicate projectPath in manifest: "${normProjectPath}"`);
  }
  seenProjectPaths.add(normProjectPath);
  manifestedProjectFiles.add(path.resolve(a.projectPath));

  // No path escapes root
  const resolvedProj = path.resolve(a.projectPath);
  const resolvedVendor = path.resolve(a.vendorSourcePath);
  if (!resolvedProj.startsWith(ROOT_DIR)) {
    fail(`Manifest projectPath escapes project root: "${a.projectPath}"`);
  }
  if (!resolvedVendor.startsWith(ROOT_DIR)) {
    fail(`Manifest vendorSourcePath escapes project root: "${a.vendorSourcePath}"`);
  }

  // License check
  if (!ACCEPTED_LICENSES.has(a.sourceLicense)) {
    fail(`Manifest asset ${a.id} has unacceptable license: "${a.sourceLicense}"`);
  }

  // File existence checks
  if (!fs.existsSync(resolvedProj)) {
    fail(`Manifest projectPath does not exist on disk: ${a.projectPath}`);
  }
  if (!fs.existsSync(resolvedVendor)) {
    fail(`Manifest vendorSourcePath does not exist on disk: ${a.vendorSourcePath}`);
  }

  // SHA256 & byte size integrity
  const actualVendorSha = sha256(resolvedVendor);
  const actualProdSha = sha256(resolvedProj);
  const actualSize = fs.statSync(resolvedProj).size;

  if (actualVendorSha !== a.vendorSourceSha256) {
    fail(`Vendor SHA256 mismatch for ${a.id}: expected ${a.vendorSourceSha256}, got ${actualVendorSha}`);
  }
  if (actualProdSha !== a.productionSha256) {
    fail(`Production SHA256 mismatch for ${a.id}: expected ${a.productionSha256}, got ${actualProdSha}`);
  }
  if (actualSize !== a.byteSize) {
    fail(`Byte size mismatch for ${a.id}: expected ${a.byteSize}, got ${actualSize}`);
  }
}
console.log(`✓ Asset manifest validated (${manifest.assets.length} assets with SHA256 integrity verified on disk)`);

// 5. Verify all external production files under assets/seed/ are represented in manifest
const seedDir = path.resolve('assets/seed');
function walkDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files = files.concat(walkDir(full));
    else files.push(full);
  }
  return files;
}

const diskSeedFiles = walkDir(seedDir);
for (const file of diskSeedFiles) {
  if (!manifestedProjectFiles.has(path.resolve(file))) {
    fail(`Unmanifested production file found under assets/seed/: ${file}`);
  }
}
console.log(`✓ All ${diskSeedFiles.length} production files under assets/seed/ are accounted for in manifest`);

// 6. Check document portability (zero local workstation file:/// links in markdown)
const mdFilesToScan = [
  ...walkDir(path.resolve('docs')).filter((f) => f.endsWith('.md')),
  path.resolve('ROADMAP.md'),
  path.resolve('README.md'),
  path.resolve('MVP_CONTRACT.md'),
  path.resolve('SESSION_HANDOFF.md'),
];

for (const mdFile of mdFilesToScan) {
  if (!fs.existsSync(mdFile)) continue;
  const content = fs.readFileSync(mdFile, 'utf8');
  if (/file:\/\/\/[a-zA-Z]:/i.test(content)) {
    fail(`Forbidden local workstation path found in ${path.relative(ROOT_DIR, mdFile)}`);
  }
}
console.log('✓ Document portability verified (zero personal file:/// links in committed docs)');

// 7. Verify pure core isolation (grep for third-party presentation packages in src/core)
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
console.log('✓ Pure src/core isolation verified (zero third-party presentation imports in core)');

console.log('✅ ALL THIRD-PARTY AND PROVENANCE CHECKS PASSED.');
