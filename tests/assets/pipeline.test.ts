import { describe, it, expect } from "vitest";
import { t } from "../../src/i18n/i18n";

declare const process: { cwd: () => string };
interface NodeFS {
  existsSync(p: string): boolean;
  readFileSync(p: string, encoding: string): string;
  statSync(p: string): { size: number };
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

  it("verifies TH and EN localization keys render for UI elements", () => {
    const enTech = t("ui.techMap");
    expect(enTech).toBe("Tech Map");
    const enClaim = t("ui.claim");
    expect(enClaim).toBe("CLAIM");
  });
});
