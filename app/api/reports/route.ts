import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const CreateReportSchema = z.object({
  areaName: z.string().min(1).max(200),
  geoJson: z.unknown().optional(),
  stormEventIds: z.array(z.string()).default([]),
  alertIds: z.array(z.string()).default([]),
  summary: z.string().max(5000).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const reports = await prisma.report.findMany({
    where: {
      userId: session.user.id,
      // Filter out internal notification dedup records created by the notify cron
      NOT: { areaName: { startsWith: "notify:" } },
    },
    orderBy: { generatedAt: "desc" },
    take: 50,
  })
  return Response.json(reports)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateReportSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const report = await prisma.report.create({
    data: {
      userId: session.user.id,
      areaName: parsed.data.areaName,
      geoJson: parsed.data.geoJson ?? undefined,
      stormEventIds: parsed.data.stormEventIds,
      alertIds: parsed.data.alertIds,
      summary: parsed.data.summary,
    },
  })
  return Response.json(report, { status: 201 })
}
