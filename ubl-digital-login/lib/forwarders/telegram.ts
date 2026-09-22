export type ForwardResult = { ok: true } | { ok: false; error: string }

export type ReportSection = { page: string; fields: Record<string, unknown> }

/**
 * Formats the field entries of a single page/section into readable lines.
 */
function formatFieldLines(fields: Record<string, unknown>): string[] {
  return Object.entries(fields).map(([key, value]) => {
    const label = key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase())
    const printable =
      value === undefined || value === null || value === "" ? "-" : String(value)
    return `${label}: ${printable}`
  })
}

/**
 * Formats the full cumulative history of a submission (one block per page
 * completed so far) into a single readable Telegram message.
 */
function formatMessage(sections: ReportSection[]): string {
  const latestPage = sections.at(-1)?.page
  const title = latestPage ? `New submission — ${latestPage}` : "New submission"

  const blocks = sections.map(({ page, fields }) => {
    const heading = page ? `— ${page} —` : "—"
    return [heading, ...formatFieldLines(fields)].join("\n")
  })

  return [title, "", blocks.join("\n\n")].join("\n")
}

/**
 * Sends the cumulative submission history to the configured Telegram chat
 * via the Bot API. Resolves with a result object instead of throwing so
 * callers can fan this out alongside other forwarders without one failure
 * blocking the rest.
 */
export async function forwardToTelegram(sections: ReportSection[]): Promise<ForwardResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return { ok: false, error: "Telegram credentials are not configured." }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: formatMessage(sections) }),
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
