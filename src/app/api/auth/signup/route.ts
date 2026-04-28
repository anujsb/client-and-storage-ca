import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users, tenants } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Create a new Tenant for this user
    const [tenant] = await db.insert(tenants).values({
      name: "My CA Firm",
      slug: `firm-${Date.now()}`,
    }).returning()

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create the User and assign them as the owner of the Tenant
    const [user] = await db.insert(users).values({
      tenantId: tenant.id,
      name: email.split("@")[0],
      email,
      passwordHash,
      role: "owner",
    }).returning()

    return NextResponse.json(
      { message: "Account created successfully", id: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Signup Error]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}