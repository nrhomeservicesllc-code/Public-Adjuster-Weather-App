import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const { role } = await req.json()

  if (!["USER", "ADMIN"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 })
  }

  if (id === session.user.id && role === "USER") {
    return Response.json({ error: "You cannot demote your own account" }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  })

  return Response.json(user)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return Response.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
