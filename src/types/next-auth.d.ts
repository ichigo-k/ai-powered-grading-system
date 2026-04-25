import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      role: "ADMIN" | "LECTURER" | "STUDENT"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    maxAge?: number
  }
}
