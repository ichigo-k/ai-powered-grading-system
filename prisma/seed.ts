import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import bcrypt from "bcrypt"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is not set")

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
// biome-ignore lint/suspicious/noExplicitAny: pg type mismatch
const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12)

  await prisma.user.upsert({
    where: { userId: "admin001" },
    update: {},
    create: { userId: "admin001", name: "Admin User", role: "ADMIN", passwordHash },
  })

  await prisma.user.upsert({
    where: { userId: "lect001" },
    update: {},
    create: { userId: "lect001", name: "Lecturer User", role: "LECTURER", passwordHash },
  })

  await prisma.user.upsert({
    where: { userId: "stud001" },
    update: {},
    create: { userId: "stud001", name: "Student User", role: "STUDENT", passwordHash },
  })

  console.log("Seed complete: admin001 (ADMIN), lect001 (LECTURER), stud001 (STUDENT)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
