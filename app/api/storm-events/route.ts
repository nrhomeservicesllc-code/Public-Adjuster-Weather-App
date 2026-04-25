import { prisma } from "@/lib/db"
import { getSinceDate } from "@/lib/utils"
import { fetchFloridaAlerts } from "@/lib/api/nws"
import { normalizeNWSEventType, NWS_SEVERITY_MAP } from "@/lib/stormColors"

export const dynamic = "force-dynamic"

/** Compute centroid of a polygon ring */
function ringCentroid(coords: number[][]): [number, number] {
  const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length
  const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length
  return [lat, lng]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const since = searchParams.get("since")
  const until = searchParams.get("until")
  const types = searchParams.getAll("type")
  const severities = searchParams.getAll("severity")
  const bbox = searchParams.get("bbox")
  const state = searchParams.get("state") ?? "FL"

  // Default to 30 days so fresh deploys show data
  const sinceDate = since ? new Date(since) : getSinceDate("30d")
  const untilDate = until ? new Date(until) : undefined

  const where: Record<string, unknown> = {
    state,
    startTime: {
      gte: sinceDate,
      ...(untilDate && { lte: untilDate }),
    },
  }

  if (types.length > 0) where.eventType = { in: types }
  if (severities.length > 0) where.severity = { in: severities }

  if (bbox) {
    const parts = bbox.split(",").map(Number)
    if (parts.length === 4 && !parts.some(isNaN)) {
      const [minLng, minLat, maxLng, maxLat] = parts
      where.latitude = { gte: minLat, lte: maxLat }
      where.longitude = { gte: minLng, lte: maxLng }
    }
  }

  try {
    const events = await prisma.stormEvent.findMany({
      where,
      orderBy: { startTime: "desc" },
      take: 500,
      select: {
        id: true,
        externalId: true,
        source: true,
        sourceUrl: true,
        eventType: true,
        severity: true,
        confidenceLevel: true,
        locationName: true,
        state: true,
        county: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        startTime: true,
        endTime: true,
        windSpeedMph: true,
        hailSizeInches: true,
        rainfallInches: true,
        tornadoEF: true,
        description: true,
        createdAt: true,
      },
    })

    if (events.length > 0) return Response.json(events)

    // DB is empty — fall back to live NWS alerts converted to event format
    const collection = await fetchFloridaAlerts()
    const now = new Date().toISOString()

    const fallbackEvents = collection.features
      .filter((f) => f.properties.status === "Actual")
      .map((f) => {
        let lat: number | null = null
        let lng: number | null = null

        if (f.geometry?.type === "Point") {
          const [lo, la] = f.geometry.coordinates as number[]
          lat = la; lng = lo
        } else if (f.geometry?.type === "Polygon") {
          const [la, lo] = ringCentroid((f.geometry.coordinates as number[][][])[0])
          lat = la; lng = lo
        } else if (f.geometry?.type === "MultiPolygon") {
          const [la, lo] = ringCentroid(((f.geometry.coordinates as number[][][][])[0])[0])
          lat = la; lng = lo
        }

        const areaName = f.properties.areaDesc.split(";")[0].trim()
        return {
          id: `nws-live-${f.properties.id}`,
          externalId: f.properties.id,
          source: "NWS",
          sourceUrl: f.properties.url ?? null,
          eventType: normalizeNWSEventType(f.properties.event),
          severity: NWS_SEVERITY_MAP[f.properties.severity] ?? "LOW",
          confidenceLevel: "ALERT_BASED",
          locationName: areaName,
          state: "FL",
          county: null,
          zipCode: null,
          latitude: lat,
          longitude: lng,
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

    return Response.json(fallbackEvents)
  } catch (err) {
    console.error("Storm events error:", err)
    return Response.json({ error: "Failed to fetch storm events" }, { status: 500 })
  }
}
