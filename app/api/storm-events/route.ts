import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { getSinceDate } from "@/lib/utils"
import { fetchFloridaAlerts } from "@/lib/api/nws"
import { normalizeNWSEventType, NWS_SEVERITY_MAP } from "@/lib/stormColors"
import { searchFLLocations } from "@/lib/florida-locations"

export const dynamic = "force-dynamic"

/** Centroid of a GeoJSON ring (coords are [lng, lat] pairs) */
function ringCentroid(ring: number[][]): { lat: number; lng: number } {
  const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
  const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
  return { lat, lng }
}

/** Extract lat/lng from any GeoJSON geometry */
function geometryCenter(geom: { type: string; coordinates: unknown } | null): { lat: number; lng: number } | null {
  if (!geom) return null
  try {
    if (geom.type === "Point") {
      const [lng, lat] = geom.coordinates as number[]
      return { lat, lng }
    }
    if (geom.type === "Polygon") {
      return ringCentroid((geom.coordinates as number[][][])[0])
    }
    if (geom.type === "MultiPolygon") {
      return ringCentroid(((geom.coordinates as number[][][][])[0])[0])
    }
  } catch {
    return null
  }
  return null
}

/**
 * Resolve coordinates from an NWS areaDesc string when geometry is missing.
 * Tries each semicolon-separated area name against the FL locations index.
 */
function resolveAreaCoords(areaDesc: string): { lat: number; lng: number } | null {
  const areas = areaDesc.split(";").map((s) => s.trim()).filter(Boolean)
  for (const area of areas) {
    const term = area.replace(/ county$/i, "").trim()
    const hits = searchFLLocations(term, 1)
    if (hits.length > 0) return { lat: hits[0].latitude, lng: hits[0].longitude }
  }
  return null
}

function parseReportStormType(areaName: string): string {
  const label = (areaName.split(/[—–-]/)[0] ?? "").trim().toLowerCase()
  if (label.includes("tornado")) return "TORNADO"
  if (label.includes("hurricane")) return "HURRICANE"
  if (label.includes("tropical")) return "TROPICAL_STORM"
  if (label.includes("hail")) return "HAIL"
  if (label.includes("wind")) return "WIND"
  if (label.includes("flood")) return "FLOOD"
  if (label.includes("rain")) return "RAIN"
  return "THUNDERSTORM"
}

function resolveReportCenter(geoJson: unknown, areaName: string): { lat: number; lng: number } | null {
  try {
    const geo = geoJson as { type: string; coordinates: unknown }
    if (geo?.type === "Point") {
      const [lng, lat] = geo.coordinates as number[]
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
    if (geo?.type === "Polygon") {
      const ring = (geo.coordinates as number[][][])[0]
      const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
      const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
  } catch { /* fall through */ }

  const dashPart = areaName.split(/[—–]/).slice(1).join(" ").trim()
  const candidates: string[] = []
  if (dashPart) {
    dashPart.split(",").forEach((s) =>
      candidates.push(s.trim().replace(/\s+(co\.|county|fl|florida)\.?$/i, "").trim())
    )
    const words = dashPart.split(/[\s,]+/).filter((w) => w.length > 3 && !/^\d+$/.test(w))
    words.reverse().forEach((w) => candidates.push(w))
  }
  candidates.push(areaName.split(/[—–]/)[0].trim())

  for (const term of candidates) {
    if (term.length < 3) continue
    const hits = searchFLLocations(term, 1)
    if (hits.length > 0) return { lat: hits[0].latitude, lng: hits[0].longitude }
  }
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const since = searchParams.get("since")
  const until = searchParams.get("until")
  const types = searchParams.getAll("type").filter((t) => /^[A-Z_]+$/.test(t))
  const severities = searchParams.getAll("severity").filter((s) => /^[A-Z]+$/.test(s))
  const bboxRaw = searchParams.get("bbox")
  const state = /^[A-Z]{2}$/.test(searchParams.get("state") ?? "") ? (searchParams.get("state") ?? "FL") : "FL"

  // Default to 24h so live NWS events always surface even when DB is empty
  const sinceDate = since ? new Date(since) : getSinceDate("24h")
  const untilDate = until ? new Date(until) : undefined

  if (isNaN(sinceDate.getTime())) {
    return Response.json({ error: "Invalid since date" }, { status: 400 })
  }

  const where: Record<string, unknown> = {
    state,
    startTime: { gte: sinceDate, ...(untilDate && !isNaN(untilDate.getTime()) && { lte: untilDate }) },
  }

  if (types.length > 0) where.eventType = { in: types }
  if (severities.length > 0) where.severity = { in: severities }

  if (bboxRaw) {
    const parts = bboxRaw.split(",").map(Number)
    if (
      parts.length === 4 &&
      !parts.some(isNaN) &&
      parts[1] >= -90 && parts[3] <= 90 &&
      parts[0] >= -180 && parts[2] <= 180 &&
      parts[1] <= parts[3] && parts[0] <= parts[2]
    ) {
      const [minLng, minLat, maxLng, maxLat] = parts
      where.latitude = { gte: minLat, lte: maxLat }
      where.longitude = { gte: minLng, lte: maxLng }
    }
  }

  // 1. Try DB first
  try {
    const events = await prisma.stormEvent.findMany({
      where,
      orderBy: { startTime: "desc" },
      take: 500,
      select: {
        id: true, externalId: true, source: true, sourceUrl: true,
        eventType: true, severity: true, confidenceLevel: true,
        locationName: true, state: true, county: true, zipCode: true,
        latitude: true, longitude: true, startTime: true, endTime: true,
        windSpeedMph: true, hailSizeInches: true, rainfallInches: true,
        tornadoEF: true, description: true, createdAt: true,
      },
    })
    if (events.length > 0) return Response.json(events)
  } catch (dbErr) {
    console.error("Storm events DB fetch failed:", dbErr)
    // fall through to NWS
  }

  // 2. DB empty or unavailable — convert live NWS alerts to storm event format.
  //    NWS alerts often lack polygon geometry (they reference zone codes), so we
  //    fall back to searchFLLocations for any alert without a resolvable centroid.
  try {
    const collection = await fetchFloridaAlerts()
    const now = new Date().toISOString()

    const liveEvents = collection.features
      .filter((f) => f.properties.status === "Actual")
      .map((f) => {
        const areaName = f.properties.areaDesc.split(";")[0].trim()

        // Try geometry centroid first, then resolve from area description text
        const center =
          geometryCenter(f.geometry) ??
          resolveAreaCoords(f.properties.areaDesc)

        return {
          id: `nws-live-${f.properties.id}`,
          externalId: f.properties.id,
          source: "NWS_LIVE",
          sourceUrl: f.properties.url ?? null,
          eventType: normalizeNWSEventType(f.properties.event),
          severity: NWS_SEVERITY_MAP[f.properties.severity] ?? "LOW",
          confidenceLevel: "ALERT_BASED",
          locationName: areaName,
          state: "FL",
          county: null,
          zipCode: null,
          latitude: center?.lat ?? null,
          longitude: center?.lng ?? null,
          startTime: f.properties.effective,
          endTime: f.properties.expires,
          windSpeedMph: null,
          hailSizeInches: null,
          rainfallInches: null,
          tornadoEF: null,
          description: f.properties.description ?? null,
          createdAt: now,
        }
      })
      // Only return events we have a location for
      .filter((e) => e.latitude !== null && e.longitude !== null)

    return Response.json(liveEvents)
  } catch (nwsErr) {
    console.error("Storm events NWS fetch failed:", nwsErr)
  }

  // 3. Last resort — synthesise pseudo-events from the user's own saved reports
  //    so the map always shows their historical work even with no NOAA/NWS data.
  try {
    const session = await auth()
    if (session?.user?.id) {
      const reports = await prisma.report.findMany({
        where: {
          userId: session.user.id,
          NOT: { areaName: { startsWith: "notify:" } },
        },
        orderBy: { generatedAt: "desc" },
        take: 50,
        select: { id: true, areaName: true, geoJson: true, generatedAt: true, summary: true },
      })

      const now = new Date().toISOString()
      const pseudoEvents = reports.flatMap((r) => {
        const center = resolveReportCenter(r.geoJson, r.areaName)
        if (!center) return []
        const stormType = parseReportStormType(r.areaName)
        return [{
          id: `report-${r.id}`,
          externalId: null,
          source: "REPORT",
          sourceUrl: null,
          eventType: stormType,
          severity: "MODERATE",
          confidenceLevel: "REPORTED",
          locationName: r.areaName,
          state: "FL",
          county: null,
          zipCode: null,
          latitude: center.lat,
          longitude: center.lng,
          startTime: r.generatedAt,
          endTime: null,
          windSpeedMph: null,
          hailSizeInches: null,
          rainfallInches: null,
          tornadoEF: null,
          description: r.summary ?? null,
          createdAt: now,
        }]
      })

      if (pseudoEvents.length > 0) return Response.json(pseudoEvents)
    }
  } catch { /* fall through */ }

  return Response.json([])
}
