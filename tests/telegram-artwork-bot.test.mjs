import assert from "node:assert/strict";
import test from "node:test";
import {
  parseArtworkCaption,
  parseArtworkEditCaption,
  parseArtworkFilename,
  renderArtworkDataFile,
  statusFilename,
  validateImageBytes,
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
  assert.throws(() => parseArtworkCaption("Sail/Boat | 1300", ".jpeg"), /letters, numbers/);
  assert.throws(() => parseArtworkCaption(`${"A".repeat(81)} | 1300`, ".jpeg"), /80 characters/);
  assert.throws(() => parseArtworkCaption("Sail Boat | 10000001", ".jpeg"), /1,00,00,000/);
});

test("accepts formatted whole-rupee prices", () => {
  assert.equal(parseArtworkCaption("Sail Boat | 1,300", ".jpeg").price, 1300);
});

test("validates the uploaded image signature against its extension", () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  assert.equal(validateImageBytes(jpeg, ".jpg"), ".jpeg");
  assert.equal(validateImageBytes(png, ".png"), ".png");
  assert.throws(() => validateImageBytes(jpeg, ".png"), /does not match/);
  assert.throws(() => validateImageBytes(Buffer.from("not-an-image"), ".jpeg"), /not a supported image/);
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
