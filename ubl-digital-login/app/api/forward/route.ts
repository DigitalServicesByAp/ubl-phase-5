import { type NextRequest, NextResponse } from "next/server"
import { forwardToTelegram } from "@/lib/forwarders/telegram"
import { forwardToExternalApi } from "@/lib/forwarders/external-api"

/**
 * Data forwarding endpoint.
 *
 * Every form in the flow posts its collected fields here as
 * `{ page, ...fields }`. The submission is fanned out in parallel to every
 * configured destination (Telegram, and a generic external API) so callers
 * only need to know about this single endpoint. Destinations run
 * independently — one failing never blocks or delays the others.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { page, ...fields } = body as { page?: string } & Record<string, unknown>

  const [telegramResult, externalApiResult] = await Promise.all([
    forwardToTelegram(page, fields),
    forwardToExternalApi(page, fields),
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
