import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      userId: string
      role: "ADMIN" | "LECTURER" | "STUDENT"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: string
    maxAge?: number
  }
}
