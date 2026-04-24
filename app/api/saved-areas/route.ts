import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const SaveAreaSchema = z.object({
  name: z.string().min(1).max(100),
  notes: z.string().max(2000).optional(),
  isProspecting: z.boolean().optional().default(false),
  geoJson: z.object({ type: z.string(), coordinates: z.unknown() }),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const areas = await prisma.savedArea.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(areas)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = SaveAreaSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const area = await prisma.savedArea.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      notes: parsed.data.notes,
      isProspecting: parsed.data.isProspecting,
      geoJson: parsed.data.geoJson as object,
    },
  })
  return Response.json(area, { status: 201 })
}
