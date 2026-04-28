import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
            with: { tenant: true },
          })

          if (!user) return null

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          )
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantName: user.tenant.name,
            tenantSlug: user.tenant.slug,
          }
        } catch (e) {
          console.error("[Auth] Error:", e)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.tenantName = (user as any).tenantName
        token.tenantSlug = (user as any).tenantSlug
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub ?? token.id) as string
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantName = token.tenantName as string
        session.user.tenantSlug = token.tenantSlug as string
      }
      return session
    },
  },
})