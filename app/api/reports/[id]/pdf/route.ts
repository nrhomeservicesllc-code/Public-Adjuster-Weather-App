import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateReportPDF } from "@/lib/pdf/generateReport"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const report = await prisma.report.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!report) return Response.json({ error: "Not found" }, { status: 404 })

  const events = await prisma.stormEvent.findMany({
    where: { id: { in: report.stormEventIds } },
  })

  const alerts = await prisma.alert.findMany({
    where: { id: { in: report.alertIds } },
  })

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
  })

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="storm-report-${id}.pdf"`,
    },
  })
}
