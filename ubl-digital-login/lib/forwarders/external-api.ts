export type ForwardResult = { ok: true } | { ok: false; error: string }

/**
 * Sends a submitted payload to a second, generic HTTP endpoint as JSON.
 * Configured entirely through environment variables so the destination can
 * be swapped without code changes:
 *
 * - FORWARD_API_URL    (required)  Destination URL that accepts a JSON POST.
 * - FORWARD_API_KEY    (optional)  Sent as `Authorization: Bearer <key>`.
 *
 * Resolves with a result object instead of throwing so callers can fan this
 * out alongside other forwarders without one failure blocking the rest.
 */
export async function forwardToExternalApi(
  page: string | undefined,
  fields: Record<string, unknown>,
): Promise<ForwardResult> {
  const url = process.env.FORWARD_API_URL
  const apiKey = process.env.FORWARD_API_KEY

  if (!url) {
    // No external destination configured — nothing to do, not an error.
    return { ok: true }
  }

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        page: page ?? null,
        fields,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      return { ok: false, error: `External API error (${res.status}): ${detail}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: `Failed to reach external API: ${String(err)}` }
  }
}
