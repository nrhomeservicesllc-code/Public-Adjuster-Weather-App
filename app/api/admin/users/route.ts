import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { savedAreas: true, reports: true } },
    },
  })

  return Response.json(users)
}
