import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    select: { id: true, email: true, name: true },
  })

  return Response.json(user, { status: 201 })
}
