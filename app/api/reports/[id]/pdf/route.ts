import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateReportPDF } from "@/lib/pdf/generateReport"
import { searchFLLocations } from "@/lib/florida-locations"

function extractCenter(geoJson: unknown): [number, number] | null {
  try {
    const geo = geoJson as { type: string; coordinates: unknown }
    if (geo?.type === "Point") {
      const [lng, lat] = geo.coordinates as number[]
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
    }
    if (geo?.type === "Polygon") {
      const ring = (geo.coordinates as number[][][])[0]
      const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length
      const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng]
    }
  } catch { /* fall through */ }
  return null
}

// Esri World Imagery (satellite) — free, no API key, reliable
// bbox computed so the impact circle always fills ~66% of the image height
async function fetchMapBase64(lat: number, lng: number, radiusM: number): Promise<string | null> {
  const padding = 1.5
  const latDelta = (padding * radiusM) / 111000
  const lngDelta = latDelta * (640 / 280) / Math.cos((lat * Math.PI) / 180)
  const bbox = `${lng - lngDelta},${lat - latDelta},${lng + lngDelta},${lat + latDelta}`
  const url =
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export` +
    `?bbox=${bbox}&bboxSR=4326&size=640,280&format=png32&f=image`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    return `data:image/png;base64,${Buffer.from(buf).toString("base64")}`
  } catch {
    return null
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [report, user] = await Promise.all([
    prisma.report.findFirst({ where: { id, userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
  ])
  if (!report) return Response.json({ error: "Not found" }, { status: 404 })

  const [events, alerts] = await Promise.all([
    prisma.stormEvent.findMany({ where: { id: { in: report.stormEventIds } } }),
    prisma.alert.findMany({ where: { id: { in: report.alertIds } } }),
  ])

  // Resolve center coordinates
  let center: [number, number] | null = extractCenter(report.geoJson)
  if (!center) {
    const ev = events.find((e) => e.latitude != null && e.longitude != null)
    if (ev) center = [ev.latitude!, ev.longitude!]
  }
  if (!center) {
    const hits = searchFLLocations(report.areaName.split(/[—–]/)[0].trim(), 1)
    if (hits.length > 0) center = [hits[0].latitude, hits[0].longitude]
  }
  if (!center) center = [27.9944, -81.7603] // FL centre

  const [lat, lng] = center
  const areaName = report.areaName

  // Derive storm type for radius calculation
  const stormLabel = (areaName.split(/[—–-]/)[0] ?? "").trim().toLowerCase()
  let stormType = "THUNDERSTORM"
  if (stormLabel.includes("tornado")) stormType = "TORNADO"
  else if (stormLabel.includes("hurricane")) stormType = "HURRICANE"
  else if (stormLabel.includes("tropical")) stormType = "TROPICAL_STORM"
  else if (stormLabel.includes("hail")) stormType = "HAIL"
  else if (stormLabel.includes("wind")) stormType = "WIND"
  else if (stormLabel.includes("flood")) stormType = "FLOOD"
  else if (stormLabel.includes("rain")) stormType = "RAIN"

  const radiusM = { TORNADO: 3000, HURRICANE: 40000, TROPICAL_STORM: 22000, HAIL: 5000, WIND: 5000, FLOOD: 7000, RAIN: 5000, THUNDERSTORM: 5000 }[stormType] ?? 5000
  const mapBase64 = await fetchMapBase64(lat, lng, radiusM)

  const pdfBuffer = await generateReportPDF({
    id: report.id,
    areaName: report.areaName,
    generatedAt: report.generatedAt.toISOString(),
    stormEvents: events.map((e) => ({
      ...e,
      eventType: e.eventType as import("@/types").StormType,
      severity: e.severity as import("@/types").Severity,
      confidenceLevel: e.confidenceLevel as import("@/types").ConfidenceLevel,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    alerts: alerts.map((a) => ({
      id: a.id,
      nwsId: a.nwsId,
      title: a.title,
      description: a.description,
      eventType: a.eventType,
      areaDesc: a.areaDesc,
      severity: a.severity,
      urgency: a.urgency,
      certainty: a.certainty,
      effective: a.effective.toISOString(),
      expires: a.expires.toISOString(),
      sourceUrl: a.sourceUrl,
      rawGeometry: a.rawGeometry as import("@/types").GeoJsonGeometry | null,
      createdAt: a.createdAt.toISOString(),
    })),
    affectedLocations: [...new Set(events.map((e) => e.locationName))],
    summary: report.summary ?? `Storm exposure report for ${report.areaName}.`,
    dateRangeLabel: "Selected date range",
    lat,
    lng,
    mapBase64,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
  })

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="storm-report-${id}.pdf"`,
    },
  })
}
