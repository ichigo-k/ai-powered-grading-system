"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

interface Props {
  assessmentId: number
}

export default function ReopenAssessmentButton({ assessmentId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReopen() {
    startTransition(async () => {
      const res = await fetch(`/api/lecturer/assessments/${assessmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Failed to re-open assessment")
        return
      }

      toast.success("Assessment re-opened — students can now attempt it again")
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleReopen}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-all"
    >
      <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
      {isPending ? "Re-opening…" : "Re-open"}
    </button>
  )
}
