import { createHash, timingSafeEqual } from "node:crypto";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TITLE_LENGTH = 80;
const MAX_PRICE_INR = 10_000_000;

function titleFromSlug(slug) {
  return slug
    .split(/[_-]+/)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

function extensionFromName(fileName) {
  const match = /\.[^.]+$/.exec(fileName ?? "");
  return match?.[0]?.toLowerCase() ?? "";
}

function extensionFromMimeType(mimeType) {
  return {
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
  }[mimeType] ?? "";
}

function normaliseTitle(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseTitle(title) {
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`The title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9 _-]*$/.test(title)) {
    throw new Error("Use letters, numbers, spaces, hyphens, or underscores in the title.");
  }

  const normalised = normaliseTitle(title);
  if (!normalised) throw new Error("The title must contain letters or numbers.");
  return normalised;
}

function parsePrice(price) {
  const digits = price.replace(/,/g, "");
  if (!/^[1-9]\d*$/.test(digits)) {
    throw new Error("The price must be a positive whole INR amount.");
  }

  const value = Number(digits);
  if (!Number.isSafeInteger(value) || value > MAX_PRICE_INR) {
    throw new Error(`The price must be INR ${MAX_PRICE_INR.toLocaleString("en-IN")} or lower.`);
  }
  return String(value);
}

export function parseArtworkFilename(fileName) {
  const extension = extensionFromName(fileName);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported image format for "${fileName}".`);
  }

  const stem = fileName.slice(0, -extension.length);
  const match = /^(?<title>[a-z0-9]+(?:[_-][a-z0-9]+)*)-(?<price>[1-9]\d*)(?<sold>-sold)?$/i.exec(
    stem
  );

  if (!match?.groups) {
    throw new Error(`Invalid artwork filename "${fileName}".`);
  }

  const slug = match.groups.title.toLowerCase().replace(/_/g, "-");
  return {
    id: slug,
    key: createHash("sha256").update(slug).digest("base64url").slice(0, 16),
    fileName,
    name: titleFromSlug(match.groups.title),
    price: Number(match.groups.price),
    available: !match.groups.sold,
  };
}

export function parseArtworkCaption(caption, extension) {
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Send a JPG, JPEG, PNG, WebP, or AVIF image.");
  }

  const parts = (caption ?? "").split("|").map((part) => part.trim());
  if (parts.length < 2 || parts.length > 3 || !parts[0] || !parts[1]) {
    throw new Error("Use an image caption in this format: Title | price | sold (optional).");
  }

  const sold = parts[2]?.toLowerCase();
  if (sold && sold !== "sold") {
    throw new Error('The optional third caption value must be "sold".');
  }

  const title = parseTitle(parts[0]);
  const price = parsePrice(parts[1]);

  return parseArtworkFilename(`${title}-${price}${sold ? "-sold" : ""}${extension}`);
}

export function parseArtworkEditCaption(caption, extension, available) {
  const parts = (caption ?? "").split("|").map((part) => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Reply with the new title and price in this format: Title | price.");
  }

  return parseArtworkCaption(
    `${parts[0]} | ${parts[1]}${available ? "" : " | sold"}`,
    extension
  );
}

export function statusFilename(artwork, available) {
  const extension = extensionFromName(artwork.fileName);
  const stem = artwork.fileName.slice(0, -extension.length).replace(/-sold$/i, "");
  return `${stem}${available ? "" : "-sold"}${extension}`;
}

export function validateImageBytes(bytes, extension) {
  const content = Buffer.from(bytes);
  let detectedExtension = "";

  if (content.length >= 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
    detectedExtension = ".jpeg";
  } else if (
    content.length >= 8 &&
    content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    detectedExtension = ".png";
  } else if (
    content.length >= 12 &&
    content.subarray(0, 4).toString("ascii") === "RIFF" &&
    content.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    detectedExtension = ".webp";
  } else if (
    content.length >= 12 &&
    content.subarray(4, 8).toString("ascii") === "ftyp" &&
    ["avif", "avis"].includes(content.subarray(8, 12).toString("ascii"))
  ) {
    detectedExtension = ".avif";
  }

  if (!detectedExtension) {
    throw new Error("The uploaded file is not a supported image.");
  }

  const expectedExtension = extension === ".jpg" ? ".jpeg" : extension;
  if (detectedExtension !== expectedExtension) {
    throw new Error("The image file type does not match its extension.");
  }
  return detectedExtension;
}

export function renderArtworkDataFile(artworks) {
  const entries = [...artworks]
    .sort((first, second) => first.name.localeCompare(second.name))
    .map(
      (artwork) => `  {
    id: ${JSON.stringify(artwork.id)},
    name: ${JSON.stringify(artwork.name)},
    price: ${artwork.price},
    image: ${JSON.stringify(`/artworks/${artwork.fileName}`)},
    available: ${artwork.available},
  },`
    )
    .join("\n");

  return `// This file is generated by scripts/generate-artworks.mjs. Do not edit it directly.\n\nexport type Artwork = {\n  id: string;\n  name: string;\n  price: number; // in INR\n  image: string; // path under /public/artworks\n  available: boolean; // false = sold\n};\n\nexport const artworks: Artwork[] = [\n${entries}\n];\n`;
}

function changesWithGeneratedData(changes, artworks) {
  return [
    ...changes,
    {
      path: "data/artworks.ts",
      base64Content: Buffer.from(renderArtworkDataFile(artworks), "utf8").toString("base64"),
    },
  ];
}

function getTelegramConfig(env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !webhookSecret) {
    throw new Error("Telegram webhook environment variables are not configured.");
  }
  return { token, webhookSecret };
}

function getBotConfig(env) {
  const telegram = getTelegramConfig(env);
  const adminIds = new Set(
    (env.TELEGRAM_ADMIN_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
  const githubToken = env.GITHUB_TOKEN;
  const repository = env.GITHUB_REPOSITORY;
  const branch = env.GITHUB_BRANCH || "main";

  if (!adminIds.size || !githubToken || !repository) {
    throw new Error("Telegram bot administration environment variables are not configured.");
  }

  const [owner, repo] = repository.split("/");
  if (!owner || !repo || repository.split("/").length !== 2) {
    throw new Error("GITHUB_REPOSITORY must use the owner/repository format.");
  }

  return { ...telegram, adminIds, githubToken, owner, repo, branch };
}

export function webhookSecretMatches(receivedSecret, expectedSecret) {
  if (!receivedSecret) return false;
  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

async function telegramRequest(token, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error(`Telegram ${method} request failed.`);
  }
  return body.result;
}

async function sendMessage(token, chatId, text, replyMarkup) {
  return telegramRequest(token, "sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

async function sendPhoto(token, chatId, artwork, base64Content) {
  const form = new FormData();
  form.set("chat_id", String(chatId));
  form.set(
    "caption",
    `${artwork.name}\nINR ${artwork.price.toLocaleString("en-IN")}\n${
      artwork.available ? "Available" : "Sold"
    }`
  );
  form.set(
    "photo",
    new Blob([Buffer.from(base64Content, "base64")]),
    artwork.fileName
  );

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();
  if (!response.ok || !body.ok) {
    throw new Error("Telegram sendPhoto request failed.");
  }
}

async function githubRequest(config, endpoint, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}${endpoint}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${config.githubToken}`,
      "x-github-api-version": "2022-11-28",
      ...init.headers,
    },
  });
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${body?.message ?? "Unknown error"}.`);
  }
  return body;
}

async function listArtworks(config) {
  const entries = await githubRequest(
    config,
    `/contents/public/artworks?ref=${encodeURIComponent(config.branch)}`
  );
  if (!Array.isArray(entries)) throw new Error("The public/artworks directory could not be read.");

  const artworks = entries
    .filter((entry) => entry.type === "file")
    .map((entry) => parseArtworkFilename(entry.name));
  const duplicateIds = artworks.filter(
    (artwork, index) => artworks.findIndex(({ id }) => id === artwork.id) !== index
  );
  if (duplicateIds.length) throw new Error("Duplicate artwork titles were found in GitHub.");

  return artworks.sort((first, second) => first.name.localeCompare(second.name));
}

async function getFileContent(config, fileName) {
  const file = await githubRequest(
    config,
    `/contents/public/artworks/${encodeURIComponent(fileName)}?ref=${encodeURIComponent(config.branch)}`
  );
  if (file.encoding !== "base64" || !file.content) {
    throw new Error(`Could not read artwork image "${fileName}".`);
  }
  return file.content.replace(/\s/g, "");
}

async function commitArtworkChange(config, changes, message) {
  const branchPath = config.branch.split("/").map(encodeURIComponent).join("/");
  const reference = await githubRequest(config, `/git/ref/heads/${branchPath}`);
  const parentCommit = await githubRequest(config, `/git/commits/${reference.object.sha}`);
  const treeEntries = [];

  for (const change of changes) {
    if (change.base64Content) {
      const blob = await githubRequest(config, "/git/blobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: change.base64Content, encoding: "base64" }),
      });
      treeEntries.push({
        path: change.path ?? `public/artworks/${change.fileName}`,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
    } else {
      treeEntries.push({
        path: change.path ?? `public/artworks/${change.fileName}`,
        mode: "100644",
        type: "blob",
        sha: null,
      });
    }
  }

  const tree = await githubRequest(config, "/git/trees", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree: treeEntries }),
  });
  const commit = await githubRequest(config, "/git/commits", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, tree: tree.sha, parents: [reference.object.sha] }),
  });
  await githubRequest(config, `/git/refs/heads/${branchPath}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
}

function artworkKeyboard(artwork) {
  return [
    [
      { text: "View", callback_data: `view:${artwork.key}` },
      { text: "Edit", callback_data: `edit:${artwork.key}` },
    ],
    [
      {
        text: artwork.available ? "Mark sold" : "Mark available",
        callback_data: `${artwork.available ? "sold" : "available"}:${artwork.key}`,
      },
      { text: "Delete", callback_data: `delete:${artwork.key}` },
    ],
  ];
}

function findArtwork(artworks, key) {
  const artwork = artworks.find((candidate) => candidate.key === key);
  if (!artwork) throw new Error("That artwork no longer exists. Run /artworks again.");
  return artwork;
}

async function showArtworks(config, chatId) {
  const artworks = await listArtworks(config);
  if (!artworks.length) {
    await sendMessage(config.token, chatId, "No artworks are listed yet.");
    return;
  }

  for (const artwork of artworks) {
    await sendMessage(
      config.token,
      chatId,
      `${artwork.name}\nINR ${artwork.price.toLocaleString("en-IN")} · ${
        artwork.available ? "Available" : "Sold"
      }`,
      { inline_keyboard: artworkKeyboard(artwork) }
    );
  }
}

async function getIncomingImage(token, message) {
  const photo = message.photo?.at(-1);
  const document = message.document?.mime_type?.startsWith("image/") ? message.document : null;
  const fileId = photo?.file_id ?? document?.file_id;
  if (!fileId) throw new Error("Send an image as a photo or image document.");

  const fileInfo = await telegramRequest(token, "getFile", { file_id: fileId });
  const extension =
    extensionFromName(document?.file_name) ||
    extensionFromName(fileInfo.file_path) ||
    extensionFromMimeType(document?.mime_type);
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Send a JPG, JPEG, PNG, WebP, or AVIF image.");
  }

  const response = await fetch(`https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`);
  if (!response.ok) throw new Error("Telegram could not download the image.");
  const declaredSize = Number(response.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");
  validateImageBytes(bytes, extension);
  return { extension, base64Content: bytes.toString("base64") };
}

function commandFromMessage(message) {
  const firstWord = message.text?.trim().split(/\s+/)[0];
  return firstWord?.split("@")[0]?.toLowerCase();
}

function editKeyFromReply(message) {
  const reply = message.reply_to_message;
  if (!reply?.from?.is_bot || typeof reply.text !== "string") return null;
  return /^Editing artwork key: (?<key>[A-Za-z0-9_-]{16})$/m.exec(reply.text)?.groups?.key ?? null;
}

async function editArtwork(config, chatId, key, caption) {
  const artworks = await listArtworks(config);
  const artwork = findArtwork(artworks, key);
  const updatedArtwork = parseArtworkEditCaption(
    caption,
    extensionFromName(artwork.fileName),
    artwork.available
  );

  if (artworks.some((candidate) => candidate.id === updatedArtwork.id && candidate.id !== artwork.id)) {
    throw new Error(`An artwork named "${updatedArtwork.name}" already exists.`);
  }
  if (updatedArtwork.fileName === artwork.fileName) {
    await sendMessage(config.token, chatId, "No name or price changes were detected.");
    return;
  }

  const content = await getFileContent(config, artwork.fileName);
  await commitArtworkChange(
    config,
    changesWithGeneratedData(
      [
        { fileName: updatedArtwork.fileName, base64Content: content },
        { fileName: artwork.fileName },
      ],
      artworks.map((candidate) => (candidate.id === artwork.id ? updatedArtwork : candidate))
    ),
    `chore: edit ${artwork.name} artwork`
  );
  await sendMessage(
    config.token,
    chatId,
    `Updated ${updatedArtwork.name} to INR ${updatedArtwork.price.toLocaleString("en-IN")}. Vercel is publishing the update now.`
  );
}

async function handleMessage(update, env) {
  const message = update.message;
  if (!message?.chat?.id || !message.from?.id) return;

  const telegram = getTelegramConfig(env);
  const command = commandFromMessage(message);
  if (command === "/id") {
    await sendMessage(telegram.token, message.chat.id, `Your Telegram user ID is ${message.from.id}.`);
    return;
  }

  const config = getBotConfig(env);
  if (!config.adminIds.has(String(message.from.id))) {
    await sendMessage(config.token, message.chat.id, "This bot is restricted to its configured administrators.");
    return;
  }

  if (command === "/start" || command === "/help") {
    await sendMessage(
      config.token,
      message.chat.id,
      "Commands:\n/artworks — list and manage artworks\n/edit — learn how to edit an artwork\n\nTo add artwork, send an image with this caption:\nTitle | price\n\nOptional sold status:\nTitle | price | sold"
    );
    return;
  }

  if (command === "/artworks") {
    await showArtworks(config, message.chat.id);
    return;
  }

  if (command === "/edit") {
    await sendMessage(
      config.token,
      message.chat.id,
      "Send /artworks, tap Edit on the artwork, then reply to the prompt with:\nNew title | new price"
    );
    return;
  }

  const editKey = editKeyFromReply(message);
  if (editKey) {
    await editArtwork(config, message.chat.id, editKey, message.text);
    return;
  }

  if (message.photo || message.document?.mime_type?.startsWith("image/")) {
    const image = await getIncomingImage(config.token, message);
    const artwork = parseArtworkCaption(message.caption, image.extension);
    const existing = await listArtworks(config);
    if (existing.some(({ id }) => id === artwork.id)) {
      throw new Error(`An artwork named "${artwork.name}" already exists.`);
    }
    await commitArtworkChange(
      config,
      changesWithGeneratedData(
        [{ fileName: artwork.fileName, base64Content: image.base64Content }],
        [...existing, artwork]
      ),
      `feat: add ${artwork.name} artwork`
    );
    await sendMessage(
      config.token,
      message.chat.id,
      `Added ${artwork.name} for INR ${artwork.price.toLocaleString("en-IN")}. Vercel is publishing the update now.`
    );
    return;
  }

  await sendMessage(config.token, message.chat.id, "Use /help to see the available artwork commands.");
}

async function handleCallback(update, env) {
  const query = update.callback_query;
  if (!query?.from?.id || !query.message?.chat?.id || !query.data) return;

  const config = getBotConfig(env);
  if (!config.adminIds.has(String(query.from.id))) {
    await telegramRequest(config.token, "answerCallbackQuery", {
      callback_query_id: query.id,
      text: "You are not allowed to manage this catalogue.",
      show_alert: true,
    });
    return;
  }

  await telegramRequest(config.token, "answerCallbackQuery", { callback_query_id: query.id });
  const [action, key] = query.data.split(":");
  const chatId = query.message.chat.id;
  const artworks = await listArtworks(config);
  const artwork = findArtwork(artworks, key);

  if (action === "view") {
    await sendPhoto(config.token, chatId, artwork, await getFileContent(config, artwork.fileName));
    return;
  }

  if (action === "edit") {
    await sendMessage(
      config.token,
      chatId,
      `Editing artwork key: ${artwork.key}\nReply to this message with:\nNew title | new price`,
      { force_reply: true, input_field_placeholder: "New title | new price" }
    );
    return;
  }

  if (action === "delete") {
    await sendMessage(config.token, chatId, `Delete ${artwork.name} permanently?`, {
      inline_keyboard: [
        [
          { text: "Delete permanently", callback_data: `confirm-delete:${artwork.key}` },
          { text: "Cancel", callback_data: `cancel:${artwork.key}` },
        ],
      ],
    });
    return;
  }

  if (action === "cancel") {
    await sendMessage(config.token, chatId, "Deletion cancelled.");
    return;
  }

  if (action === "confirm-delete") {
    await commitArtworkChange(
      config,
      changesWithGeneratedData(
        [{ fileName: artwork.fileName }],
        artworks.filter(({ id }) => id !== artwork.id)
      ),
      `chore: remove ${artwork.name} artwork`
    );
    await sendMessage(config.token, chatId, `Deleted ${artwork.name}. Vercel is publishing the update now.`);
    return;
  }

  if (action === "sold" || action === "available") {
    const available = action === "available";
    if (artwork.available === available) {
      await sendMessage(config.token, chatId, `${artwork.name} is already ${available ? "available" : "sold"}.`);
      return;
    }
    const nextFileName = statusFilename(artwork, available);
    const content = await getFileContent(config, artwork.fileName);
    const updatedArtwork = parseArtworkFilename(nextFileName);
    await commitArtworkChange(
      config,
      changesWithGeneratedData(
        [
          { fileName: nextFileName, base64Content: content },
          { fileName: artwork.fileName },
        ],
        artworks.map((candidate) => (candidate.id === artwork.id ? updatedArtwork : candidate))
      ),
      `chore: mark ${artwork.name} ${available ? "available" : "sold"}`
    );
    await sendMessage(
      config.token,
      chatId,
      `${artwork.name} is now marked ${available ? "available" : "sold"}. Vercel is publishing the update now.`
    );
    return;
  }

  throw new Error("That action is not recognised.");
}

function updateChatId(update) {
  return update.message?.chat?.id ?? update.callback_query?.message?.chat?.id;
}

export async function handleTelegramUpdate(update, env = process.env) {
  try {
    if (update.message) {
      await handleMessage(update, env);
    } else if (update.callback_query) {
      await handleCallback(update, env);
    }
  } catch (error) {
    console.error("Telegram artwork bot operation failed:", error);
    const chatId = updateChatId(update);
    try {
      const { token } = getTelegramConfig(env);
      if (chatId) await sendMessage(token, chatId, `Could not complete that action: ${error.message}`);
    } catch {
      // The webhook still returns success to prevent Telegram retrying a configuration error.
    }
  }
}

export function getWebhookSecret(env = process.env) {
  return getTelegramConfig(env).webhookSecret;
}
