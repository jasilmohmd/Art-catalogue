import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  generateArtworks,
  parseArtworkFilename,
} from "../scripts/generate-artworks.mjs";

test("parses an available artwork filename", () => {
  assert.deepEqual(parseArtworkFilename("sail_boat-1300.jpeg"), {
    id: "sail-boat",
    name: "Sail Boat",
    price: 1300,
    image: "/artworks/sail_boat-1300.jpeg",
    available: true,
  });
});

test("parses hyphenated sold artwork filenames", () => {
  assert.deepEqual(parseArtworkFilename("moon-night-1800-sold.png"), {
    id: "moon-night",
    name: "Moon Night",
    price: 1800,
    image: "/artworks/moon-night-1800-sold.png",
    available: false,
  });
});

test("rejects malformed and unsupported filenames", () => {
  assert.throws(() => parseArtworkFilename("sail_boat.jpeg"), /Invalid artwork file/);
  assert.throws(() => parseArtworkFilename("sail_boat-1300.gif"), /Unsupported artwork file/);
});

test("rejects filenames that would generate duplicate IDs", async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "art-catalogue-"));
  const sourceDirectory = path.join(temporaryDirectory, "artworks");

  try {
    await mkdir(sourceDirectory);
    await Promise.all([
      writeFile(path.join(sourceDirectory, "sail_boat-1300.jpeg"), ""),
      writeFile(path.join(sourceDirectory, "sail-boat-1400.png"), ""),
    ]);

    await assert.rejects(
      generateArtworks({
        sourceDirectory,
        destinationFile: path.join(temporaryDirectory, "artworks.ts"),
      }),
      /Duplicate artwork ID\(s\): sail-boat/
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("generates a sorted TypeScript catalogue", async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "art-catalogue-"));
  const sourceDirectory = path.join(temporaryDirectory, "artworks");
  const destinationFile = path.join(temporaryDirectory, "artworks.ts");

  try {
    await mkdir(sourceDirectory);
    await Promise.all([
      writeFile(path.join(sourceDirectory, "sail_boat-1300.jpeg"), ""),
      writeFile(path.join(sourceDirectory, "autumn-1200-sold.webp"), ""),
    ]);

    const artworks = await generateArtworks({ sourceDirectory, destinationFile });
    const generatedFile = await readFile(destinationFile, "utf8");

    assert.deepEqual(artworks.map(({ name }) => name), ["Autumn", "Sail Boat"]);
    assert.match(generatedFile, /available: false/);
    assert.ok(generatedFile.includes('image: "/artworks/sail_boat-1300.jpeg"'));
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
