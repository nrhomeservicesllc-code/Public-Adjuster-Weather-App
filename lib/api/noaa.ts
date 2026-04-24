import { parse } from "csv-parse/sync"

const NCEI_BASE = "https://www.ncdc.noaa.gov/stormevents"

export interface NCEIStormRecord {
  BEGIN_YEARMONTH: string
  BEGIN_DAY: string
  BEGIN_TIME: string
  END_YEARMONTH: string
  END_DAY: string
  END_TIME: string
  EPISODE_ID: string
  EVENT_ID: string
  STATE: string
  STATE_FIPS: string
  YEAR: string
  MONTH_NAME: string
  EVENT_TYPE: string
  CZ_TYPE: string
  CZ_FIPS: string
  CZ_NAME: string
  WFO: string
  BEGIN_DATE_TIME: string
  CZ_TIMEZONE: string
  END_DATE_TIME: string
  INJURIES_DIRECT: string
  INJURIES_INDIRECT: string
  DEATHS_DIRECT: string
  DEATHS_INDIRECT: string
  DAMAGE_PROPERTY: string
  DAMAGE_CROPS: string
  SOURCE: string
  MAGNITUDE: string
  MAGNITUDE_TYPE: string
  FLOOD_CAUSE: string
  CATEGORY: string
  TOR_F_SCALE: string
  TOR_LENGTH: string
  TOR_WIDTH: string
  TOR_OTHER_WFO: string
  TOR_OTHER_CZ_STATE: string
  TOR_OTHER_CZ_FIPS: string
  TOR_OTHER_CZ_NAME: string
  BEGIN_RANGE: string
  BEGIN_AZIMUTH: string
  BEGIN_LOCATION: string
  END_RANGE: string
  END_AZIMUTH: string
  END_LOCATION: string
  BEGIN_LAT: string
  BEGIN_LON: string
  END_LAT: string
  END_LON: string
  EPISODE_NARRATIVE: string
  EVENT_NARRATIVE: string
  DATA_SOURCE: string
}

const NCEI_EVENT_TYPE_MAP: Record<string, string> = {
  Hail: "HAIL",
  "Tornado": "TORNADO",
  "High Wind": "WIND",
  "Strong Wind": "WIND",
  "Thunderstorm Wind": "THUNDERSTORM",
  "Marine Thunderstorm Wind": "THUNDERSTORM",
  "Flash Flood": "FLOOD",
  Flood: "FLOOD",
  "Coastal Flood": "FLOOD",
  "Hurricane (Typhoon)": "HURRICANE",
  "Hurricane": "HURRICANE",
  "Tropical Storm": "TROPICAL_STORM",
  "Heavy Rain": "RAIN",
  "Excessive Heat": "RAIN",
  "Lightning": "THUNDERSTORM",
  "Dense Fog": "RAIN",
  "Funnel Cloud": "TORNADO",
  "Waterspout": "TORNADO",
}

export function mapNCEIEventType(eventType: string): string {
  return NCEI_EVENT_TYPE_MAP[eventType] ?? "THUNDERSTORM"
}

export function parseDamageAmount(damage: string): number {
  if (!damage || damage === "0") return 0
  const multipliers: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000 }
  const match = damage.match(/^([\d.]+)([KMB]?)$/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  const mult = multipliers[match[2].toUpperCase()] ?? 1
  return num * mult
}

export async function fetchNCEIStormEvents(
  year: number,
  month?: number
): Promise<NCEIStormRecord[]> {
  const now = new Date()
  const targetYear = year || now.getFullYear()

  const url = new URL(`${NCEI_BASE}/csv`)
  url.searchParams.set("eventType", "ALL")
  url.searchParams.set("beginDate_mm", month ? String(month).padStart(2, "0") : "01")
  url.searchParams.set("beginDate_dd", "01")
  url.searchParams.set("beginDate_yyyy", String(targetYear))
  url.searchParams.set("endDate_mm", month ? String(month).padStart(2, "0") : "12")
  url.searchParams.set("endDate_dd", month ? "31" : "31")
  url.searchParams.set("endDate_yyyy", String(targetYear))
  url.searchParams.set("county", "ALL")
  url.searchParams.set("state", "FLORIDA")
  url.searchParams.set("stateName", "FLORIDA")
  url.searchParams.set("hailfilter", "0.00")
  url.searchParams.set("tornfilter", "0")
  url.searchParams.set("windfilter", "000")
  url.searchParams.set("detail", "detail")
  url.searchParams.set("submitbutton", "Search")

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "storm-impact-map/1.0 (admin@stormimpactmap.com)" },
  })

  if (!res.ok) {
    throw new Error(`NOAA NCEI API error: ${res.status}`)
  }

  const csvText = await res.text()

  if (!csvText || csvText.includes("No data") || csvText.length < 100) {
    return []
  }

  try {
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true,
    }) as NCEIStormRecord[]

    return records.filter((r) => r.STATE === "FLORIDA")
  } catch {
    return []
  }
}
