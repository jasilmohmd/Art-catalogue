import assert from "node:assert/strict";
import test from "node:test";
import {
  parseArtworkCaption,
  parseArtworkEditCaption,
  parseArtworkFilename,
  renderArtworkDataFile,
  statusFilename,
  webhookSecretMatches,
} from "../lib/telegram-artwork-bot.mjs";

test("creates an available artwork filename from a Telegram photo caption", () => {
  assert.deepEqual(parseArtworkCaption("Sail Boat | 1300", ".jpeg"), {
    id: "sail-boat",
    key: parseArtworkFilename("sail_boat-1300.jpeg").key,
    fileName: "sail_boat-1300.jpeg",
    name: "Sail Boat",
    price: 1300,
    available: true,
  });
});

test("creates sold artwork and can toggle its filename", () => {
  const sold = parseArtworkCaption("Moon Night | 1800 | sold", ".png");
  assert.equal(sold.fileName, "moon_night-1800-sold.png");
  assert.equal(sold.available, false);
  assert.equal(statusFilename(sold, true), "moon_night-1800.png");
  assert.equal(statusFilename(sold, false), "moon_night-1800-sold.png");
});

test("edits an artwork name and price while preserving its sold state", () => {
  assert.deepEqual(parseArtworkEditCaption("New Moon | 2400", ".jpeg", false), {
    id: "new-moon",
    key: parseArtworkFilename("new_moon-2400-sold.jpeg").key,
    fileName: "new_moon-2400-sold.jpeg",
    name: "New Moon",
    price: 2400,
    available: false,
  });
  assert.throws(
    () => parseArtworkEditCaption("New Moon | 2400 | sold", ".jpeg", false),
    /Reply with the new title and price/
  );
});

test("rejects invalid captions and unsupported formats", () => {
  assert.throws(() => parseArtworkCaption("Sail Boat | 0", ".jpeg"), /positive whole INR/);
  assert.throws(() => parseArtworkCaption("Sail Boat | 1300 | unavailable", ".jpeg"), /third caption value/);
  assert.throws(() => parseArtworkCaption("Sail Boat | 1300", ".gif"), /JPG/);
});

test("compares webhook secrets without accepting an empty value", () => {
  assert.equal(webhookSecretMatches("expected-secret", "expected-secret"), true);
  assert.equal(webhookSecretMatches("wrong-secret", "expected-secret"), false);
  assert.equal(webhookSecretMatches("", "expected-secret"), false);
});

test("renders the same generated catalogue shape used by the build", () => {
  const source = renderArtworkDataFile([
    parseArtworkFilename("sail_boat-1300.jpeg"),
    parseArtworkFilename("moon-night-1800-sold.png"),
  ]);

  assert.match(source, /name: "Moon Night"/);
  assert.ok(source.includes('image: "/artworks/sail_boat-1300.jpeg"'));
  assert.match(source, /available: false/);
});
