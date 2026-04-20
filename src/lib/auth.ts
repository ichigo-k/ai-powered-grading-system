import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        userId: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
        keepLoggedIn: { label: "Keep me logged in", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { userId: credentials.userId as string },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!passwordMatch) return null

        return {
          id: String(user.id),
          userId: user.userId,
          role: user.role,
          name: user.name,
          keepLoggedIn: credentials.keepLoggedIn === "true",
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any
        token.userId = u.userId
        token.role = u.role
        token.maxAge = u.keepLoggedIn ? 30 * 24 * 60 * 60 : 8 * 60 * 60
      }
      return token
    },
    async session({ session, token }) {
      session.user.userId = token.userId as string
      session.user.role = token.role as "ADMIN" | "LECTURER" | "STUDENT"
      return session
    },
  },
})
