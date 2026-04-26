import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  try {
    const user = await prisma.user.create({
      data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash },
      select: { id: true, email: true, name: true },
    })
    return Response.json(user, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "Email already registered" }, { status: 409 })
    }
    throw err
  }
}
