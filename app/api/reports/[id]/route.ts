import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const report = await prisma.report.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!report) return Response.json({ error: "Not found" }, { status: 404 })
  return Response.json(report)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    await prisma.report.deleteMany({
      where: { id, userId: session.user.id },
    })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: "Failed to delete report" }, { status: 500 })
  }
}
