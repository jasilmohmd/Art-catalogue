const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("Set TELEGRAM_BOT_TOKEN before configuring the Telegram command menu.");
}

const commands = [
  { command: "start", description: "Show artwork bot help" },
  { command: "help", description: "Show artwork bot help" },
  { command: "artworks", description: "View and manage artworks" },
  { command: "edit", description: "Learn how to edit an artwork" },
  { command: "id", description: "Show your Telegram user ID" },
];

const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ commands }),
});
const body = await response.json();

if (!response.ok || !body.ok) {
  throw new Error(`Telegram command menu setup failed: ${body.description ?? "Unknown error"}`);
}

console.log("Telegram slash-command menu configured.");
