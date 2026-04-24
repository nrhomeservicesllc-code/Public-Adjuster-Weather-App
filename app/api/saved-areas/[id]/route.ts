import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  notes: z.string().max(2000).nullable().optional(),
  isProspecting: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const area = await prisma.savedArea.findFirst({ where: { id, userId: session.user.id } })
  if (!area) return Response.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.savedArea.update({ where: { id }, data: parsed.data })
  return Response.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const area = await prisma.savedArea.findFirst({ where: { id, userId: session.user.id } })
  if (!area) return Response.json({ error: "Not found" }, { status: 404 })

  await prisma.savedArea.delete({ where: { id } })
  return Response.json({ ok: true })
}
