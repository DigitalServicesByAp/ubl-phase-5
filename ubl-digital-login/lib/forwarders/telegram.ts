export type ForwardResult = { ok: true } | { ok: false; error: string }

/**
 * Formats a submission payload into a readable Telegram message.
 */
function formatMessage(page: string | undefined, fields: Record<string, unknown>): string {
  const title = page ? `New submission — ${page}` : "New submission"

  const fieldLines = Object.entries(fields).map(([key, value]) => {
    const label = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
    const printable =
      value === undefined || value === null || value === "" ? "-" : String(value)
    return `${label}: ${printable}`
  })

  return [title, ...fieldLines].join("\n")
}

/**
 * Sends a submitted payload to the configured Telegram chat via the Bot API.
 * Resolves with a result object instead of throwing so callers can fan this
 * out alongside other forwarders without one failure blocking the rest.
 */
export async function forwardToTelegram(
  page: string | undefined,
  fields: Record<string, unknown>,
): Promise<ForwardResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return { ok: false, error: "Telegram credentials are not configured." }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: formatMessage(page, fields) }),
    })

    if (!res.ok) {
      const detail = await res.text()
      return { ok: false, error: `Telegram API error: ${detail}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Failed to reach Telegram: ${String(err)}` }
  }
}
