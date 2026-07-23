import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourcePath = join(process.cwd(), "apps/mobile/lib/home-hero-finished-source.ts");
const source = readFileSync(sourcePath, "utf8");
const expectedAssets = [
  ["wedding-barunson-anime-09", "wedding-09-finished-v1.png"],
  ["wedding-barunson-anime-04", "wedding-04-finished-v1.png"],
  ["wedding-barunson-anime-10", "wedding-10-finished-v1.png"]
] as const;

function readPngDimensions(path: string) {
  const header = readFileSync(path).subarray(0, 24);
  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20)
  };
}

describe("finished home hero invitation assets", () => {
  it("ships exactly three static 941x1672 PNG assets in the app bundle", () => {
    const assetDirectory = join(process.cwd(), "apps/mobile/assets/home-hero/finished");

    expect(readdirSync(assetDirectory).sort()).toEqual(
      expectedAssets.map(([, filename]) => filename).sort()
    );

    for (const [templateId, filename] of expectedAssets) {
      const assetPath = join(assetDirectory, filename);

      expect(existsSync(assetPath), templateId).toBe(true);
      expect(readPngDimensions(assetPath), templateId).toEqual({ width: 941, height: 1672 });
      expect(source).toContain(`"${templateId}": require("../assets/home-hero/finished/${filename}")`);
    }
  });

  it("does not reference temporary generated-image storage", () => {
    expect(source).not.toContain(".codex/generated_images");
  });
});
