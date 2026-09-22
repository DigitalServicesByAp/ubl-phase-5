import { type NextRequest, NextResponse } from "next/server"
import { forwardToTelegram, type ReportSection } from "@/lib/forwarders/telegram"
import { forwardToExternalApi } from "@/lib/forwarders/external-api"

/**
 * Data forwarding endpoint.
 *
 * Every form in the flow posts the FULL cumulative history collected so far
 * here as `{ sections: [{ page, fields }, ...] }` — one entry per page
 * completed up to and including the one just submitted. The submission is
 * fanned out in parallel to every configured destination (Telegram, and a
 * generic external API) so callers only need to know about this single
 * endpoint. Destinations run independently — one failing never blocks or
 * delays the others.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const rawSections = (body as { sections?: unknown }).sections
  const sections: ReportSection[] = Array.isArray(rawSections)
    ? rawSections
        .filter((entry): entry is ReportSection => !!entry && typeof entry === "object")
        .map((entry) => ({
          page: String((entry as ReportSection).page ?? ""),
          fields: (entry as ReportSection).fields ?? {},
        }))
    : []

  const [telegramResult, externalApiResult] = await Promise.all([
    forwardToTelegram(sections),
    forwardToExternalApi(sections),
  ])

  const destinations = {
    telegram: telegramResult,
    externalApi: externalApiResult,
  }

  const anySucceeded = telegramResult.ok || externalApiResult.ok

  if (!anySucceeded) {
    return NextResponse.json({ ok: false, destinations }, { status: 502 })
  }

  return NextResponse.json({ ok: true, destinations })
}
