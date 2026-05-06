import Link from "next/link"
import { getSession } from "@/lib/session"
import { ShieldOff, ArrowLeft } from "lucide-react"

export default async function NotFound() {
  // Determine where to send the user back based on their role
  const session = await getSession()
  const role = session?.user?.role

  const homeHref =
    role === "ADMIN"
      ? "/admin"
      : role === "LECTURER"
        ? "/lecturer"
        : role === "STUDENT"
          ? "/student"
          : "/"

  const homeLabel =
    role === "ADMIN"
      ? "Admin Dashboard"
      : role === "LECTURER"
        ? "My Assessments"
        : role === "STUDENT"
          ? "My Assessments"
          : "Sign In"

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f0f3ff] border border-[#dce3ff]">
        <ShieldOff className="h-9 w-9 text-[#002388]" strokeWidth={1.5} />
      </div>

      {/* Status */}
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9ca3af]">
        404 — Not Found
      </p>

      {/* Heading */}
      <h1
        className="mb-3 text-2xl font-semibold text-[#111827]"
        style={{ fontFamily: "var(--font-sans, 'Poppins', sans-serif)" }}
      >
        This page doesn't exist
      </h1>

      {/* Subtext */}
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#6b7280]">
        The resource you're looking for either doesn't exist or you don't have
        permission to access it.
      </p>

      {/* CTA */}
      <Link
        href={homeHref}
        className="inline-flex items-center gap-2 rounded-xl bg-[#002388] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B4DBB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002388]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {homeLabel}
      </Link>
    </div>
  )
}
