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
