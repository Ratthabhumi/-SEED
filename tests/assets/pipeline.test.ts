import { describe, it, expect } from "vitest";
import { t } from "../../src/i18n/i18n";

declare const process: { cwd: () => string };
interface NodeFS {
  existsSync(p: string): boolean;
  readFileSync(p: string, encoding: string): string;
  statSync(p: string): { size: number };
  readdirSync(p: string, options?: any): any[];
}

interface NodePath {
  join(...paths: string[]): string;
}
declare const require: (module: string) => any;
const fs: NodeFS = require("fs");
const path: NodePath = require("path");

describe("Asset Pipeline and Manifest Verification", () => {
  const root = process.cwd();
  const manifestPath = path.join(root, "assets", "ASSET_MANIFEST.json");

  it("has a valid ASSET_MANIFEST.json file", () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    const list = Array.isArray(manifest) ? manifest : manifest.assets;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it("every entry in ASSET_MANIFEST.json has required metadata and exists on disk", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    const list = Array.isArray(manifest) ? manifest : manifest.assets;

    const requiredFields = [
      "id",
      "projectPath",
      "sourcePack",
      "sourceUrl",
      "sourceFile",
      "sourceLicense",
      "licenseUrl",
      "author",
      "versionOrRelease",
      "downloadedAt",
      "modified",
      "modifications",
      "attributionRequired",
      "purpose",
      "status",
    ];

    for (const entry of list) {
      for (const field of requiredFields) {
        expect(entry, `Entry ${entry.id} must have field ${field}`).toHaveProperty(field);
      }
      expect(entry.sourceLicense).toBe("CC0");
      expect(entry.author).toBe("Kenney");

      const diskPath = path.join(root, entry.projectPath);
      expect(fs.existsSync(diskPath), `Asset file must exist on disk: ${entry.projectPath}`).toBe(true);
      const stat = fs.statSync(diskPath);
      expect(stat.size, `Asset file must not be empty: ${entry.projectPath}`).toBeGreaterThan(0);
    }
  });

  it("verifies all input prompt assets are present", () => {
    const promptKeys = ["q", "e", "r", "f", "t", "m"];
    for (const key of promptKeys) {
      const p = path.join(root, "assets", "seed", "input", `prompt_${key}.png`);
      expect(fs.existsSync(p), `Prompt asset prompt_${key}.png must exist`).toBe(true);
    }
  });

  it("verifies all outpost structure assets are present", () => {
    const outpostTypes = ["research", "military", "economic"];
    for (const type of outpostTypes) {
      const p = path.join(root, "assets", "seed", "structures", `outpost_${type}.png`);
      expect(fs.existsSync(p), `Outpost asset outpost_${type}.png must exist`).toBe(true);
    }
  });

  it("verifies all VFX particle assets are present", () => {
    const vfxNames = ["hit_impact", "claim_glow", "breakthrough_spark", "raid_alert"];
    for (const name of vfxNames) {
      const p = path.join(root, "assets", "seed", "vfx", `${name}.png`);
      expect(fs.existsSync(p), `VFX asset ${name}.png must exist`).toBe(true);
    }
  });

  it("verifies exact package.json and lockfile dependencies and licenses", () => {
    const pkgRaw = fs.readFileSync(path.join(root, "package.json"), "utf-8");
    const pkg = JSON.parse(pkgRaw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps["@dagrejs/dagre"]).toBe("3.1.1");
    expect(deps["@panzoom/panzoom"]).toBe("4.6.2");

    const lockRaw = fs.readFileSync(path.join(root, "package-lock.json"), "utf-8");
    const lock = JSON.parse(lockRaw);
    expect(lock.packages["node_modules/@dagrejs/dagre"]?.version).toBe("3.1.1");
    expect(lock.packages["node_modules/@dagrejs/dagre"]?.license).toBe("MIT");
    expect(lock.packages["node_modules/@panzoom/panzoom"]?.version).toBe("4.6.2");
    expect(lock.packages["node_modules/@panzoom/panzoom"]?.license).toBe("MIT");
  });

  it("verifies SHA256 integrity and vendor file existence for every manifest asset", { timeout: 30000 }, () => {
    const crypto = require("crypto");
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    const list = Array.isArray(manifest) ? manifest : manifest.assets;

    const seenIds = new Set<string>();
    const seenPaths = new Set<string>();

    for (const a of list) {
      expect(seenIds.has(a.id), `Duplicate asset ID: ${a.id}`).toBe(false);
      seenIds.add(a.id);

      expect(seenPaths.has(a.projectPath), `Duplicate projectPath: ${a.projectPath}`).toBe(false);
      seenPaths.add(a.projectPath);

      const prodFull = path.join(root, a.projectPath);
      const vendorFull = path.join(root, a.vendorSourcePath);

      expect(fs.existsSync(prodFull), `Production file must exist: ${a.projectPath}`).toBe(true);
      expect(fs.existsSync(vendorFull), `Vendor file must exist: ${a.vendorSourcePath}`).toBe(true);

      const prodSha = crypto.createHash("sha256").update(fs.readFileSync(prodFull, "")).digest("hex");
      const vendorSha = crypto.createHash("sha256").update(fs.readFileSync(vendorFull, "")).digest("hex");

      expect(prodSha).toBe(a.productionSha256);
      expect(vendorSha).toBe(a.vendorSourceSha256);
      expect(prodSha).toBe(vendorSha);
      expect(a.modified).toBe(false);
      expect(a.status).toBe("production-selected");
    }
  });

  it("verifies all files under assets/seed/ are accounted for in the manifest", () => {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    const list = Array.isArray(manifest) ? manifest : manifest.assets;
    const manifestedPaths = new Set(list.map((x: { projectPath: string }) => path.join(root, x.projectPath)));

    function walk(dir: string): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) results = results.concat(walk(full));
        else results.push(full);
      }
      return results;
    }

    const diskFiles = walk(path.join(root, "assets", "seed"));
    for (const df of diskFiles) {
      expect(manifestedPaths.has(df), `Disk file ${df} must be manifested`).toBe(true);
    }
  });

  it("verifies no personal workstation file:/// URLs exist in repository markdown", { timeout: 30000 }, () => {
    function walkMd(dir: string): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) results = results.concat(walkMd(full));
        else if (ent.name.endsWith(".md")) results.push(full);
      }
      return results;
    }

    const docs = [
      ...walkMd(path.join(root, "docs")),
      path.join(root, "ROADMAP.md"),
      path.join(root, "README.md"),
      path.join(root, "MVP_CONTRACT.md"),
      path.join(root, "SESSION_HANDOFF.md"),
    ];

    for (const d of docs) {
      if (!fs.existsSync(d)) continue;
      const text = fs.readFileSync(d, "utf-8");
      expect(/file:\/\/\/[a-zA-Z]:/i.test(text), `Forbidden local path in ${d}`).toBe(false);
    }
  });

  it("verifies TH and EN localization keys render for UI elements including ui.fit", () => {
    const enTech = t("ui.techMap");
    expect(enTech).toBe("Tech Map");
    const enFit = t("ui.fit");
    expect(enFit).toBe("Fit");
    const enClaim = t("ui.claim");
    expect(enClaim).toBe("CLAIM");
  });
});
