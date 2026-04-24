import { prisma } from "@/lib/db"
import { getSinceDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const since = searchParams.get("since")
  const until = searchParams.get("until")
  const types = searchParams.getAll("type")
  const severities = searchParams.getAll("severity")
  const bbox = searchParams.get("bbox")
  const state = searchParams.get("state") ?? "FL"

  const sinceDate = since ? new Date(since) : getSinceDate("7d")
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

    return Response.json(events)
  } catch (err) {
    console.error("Storm events error:", err)
    return Response.json({ error: "Failed to fetch storm events" }, { status: 500 })
  }
}
