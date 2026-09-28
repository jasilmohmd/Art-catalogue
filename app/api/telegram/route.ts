import { getWebhookSecret, handleTelegramUpdate, webhookSecretMatches } from "@/lib/telegram-artwork-bot.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let webhookSecret: string;
  try {
    webhookSecret = getWebhookSecret();
  } catch {
    return Response.json({ error: "Telegram bot is not configured." }, { status: 503 });
  }

  if (!webhookSecretMatches(request.headers.get("x-telegram-bot-api-secret-token"), webhookSecret)) {
    return Response.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return Response.json({ error: "Invalid Telegram update." }, { status: 400 });
  }

  await handleTelegramUpdate(update);
  return Response.json({ ok: true });
}
