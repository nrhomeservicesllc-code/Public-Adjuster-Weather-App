import { prisma } from "@/lib/db"
import { fetchNCEIStormEvents, mapNCEIEventType } from "@/lib/api/noaa"
import { NWS_SEVERITY_MAP } from "@/lib/stormColors"

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    const [datePart, timePart] = dateStr.split(" ")
    const [day, month, year] = datePart.split("-")
    const [hour, minute] = (timePart ?? "00:00").split(":")
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
  } catch {
    return null
  }
}

function mapSeverity(record: {
  TOR_F_SCALE?: string
  MAGNITUDE?: string
  EVENT_TYPE?: string
}): string {
  if (record.TOR_F_SCALE) {
    const efNum = parseInt(record.TOR_F_SCALE.replace(/[^0-9]/g, ""))
    if (efNum >= 3) return "EXTREME"
    if (efNum >= 2) return "HIGH"
    if (efNum >= 1) return "MODERATE"
    return "LOW"
  }
  if (record.MAGNITUDE) {
    const mag = parseFloat(record.MAGNITUDE)
    if (mag >= 75) return "EXTREME"
    if (mag >= 58) return "HIGH"
    if (mag >= 40) return "MODERATE"
    return "LOW"
  }
  return "MODERATE"
}

export async function syncStormEvents(
  year?: number,
  month?: number
): Promise<{ synced: number; skipped: number; errors: string[] }> {
  const now = new Date()
  const targetYear = year ?? now.getFullYear()
  const errors: string[] = []
  let synced = 0
  let skipped = 0

  try {
    const records = await fetchNCEIStormEvents(targetYear, month)

    for (const record of records) {
      try {
        const externalId = `NCEI-${record.EVENT_ID}`
        const startTime = parseDate(record.BEGIN_DATE_TIME)
        if (!startTime) { skipped++; continue }

        const lat = record.BEGIN_LAT ? parseFloat(record.BEGIN_LAT) : null
        const lng = record.BEGIN_LON ? parseFloat(record.BEGIN_LON) : null
        const eventType = mapNCEIEventType(record.EVENT_TYPE)
        const severity = mapSeverity({
          TOR_F_SCALE: record.TOR_F_SCALE,
          MAGNITUDE: record.MAGNITUDE,
          EVENT_TYPE: record.EVENT_TYPE,
        })

        let windSpeedMph: number | null = null
        let hailSizeInches: number | null = null

        if (record.MAGNITUDE && record.MAGNITUDE_TYPE === "MPH") {
          windSpeedMph = parseFloat(record.MAGNITUDE)
        }
        if (eventType === "HAIL" && record.MAGNITUDE) {
          hailSizeInches = parseFloat(record.MAGNITUDE)
        }

        await prisma.stormEvent.upsert({
          where: { externalId },
          create: {
            externalId,
            source: "NOAA_NCEI",
            sourceUrl: `https://www.ncdc.noaa.gov/stormevents/eventdetails.jsp?id=${record.EVENT_ID}`,
            eventType,
            severity,
            confidenceLevel: "CONFIRMED",
            locationName: record.BEGIN_LOCATION || record.CZ_NAME || "Florida",
            state: "FL",
            county: record.CZ_NAME || null,
            latitude: lat && lat >= 24 && lat <= 31 ? lat : null,
            longitude: lng && lng >= -88 && lng <= -80 ? lng : null,
            startTime,
            endTime: parseDate(record.END_DATE_TIME),
            windSpeedMph,
            hailSizeInches,
            tornadoEF: record.TOR_F_SCALE || null,
            description: record.EVENT_NARRATIVE || record.EPISODE_NARRATIVE || null,
            rawData: record as object,
          },
          update: {
            severity,
            windSpeedMph,
            hailSizeInches,
            description: record.EVENT_NARRATIVE || record.EPISODE_NARRATIVE || null,
          },
        })
        synced++
      } catch (err) {
        errors.push(`Event ${record.EVENT_ID}: ${String(err)}`)
      }
    }
  } catch (err) {
    errors.push(`Fetch error: ${String(err)}`)
  }

  return { synced, skipped, errors }
}
