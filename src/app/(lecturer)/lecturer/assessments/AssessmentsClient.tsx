"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  BarChart2,
} from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { toast } from "sonner"
import { format } from "date-fns"
import type { AssessmentListItem, AssessmentTypeEnum, AssessmentStatusEnum } from "@/lib/assessment-types"

interface AssessmentsClientProps {
  assessments: AssessmentListItem[]
}

const typeBadge: Record<AssessmentTypeEnum, string> = {
  EXAM: "bg-red-50 text-red-700 border-red-200",
  QUIZ: "bg-amber-50 text-amber-700 border-amber-200",
  ASSIGNMENT: "bg-blue-50 text-blue-700 border-blue-200",
}

const statusBadge: Record<AssessmentStatusEnum, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-slate-200 text-slate-500 border-slate-300",
}

export default function AssessmentsClient({ assessments }: AssessmentsClientProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<AssessmentListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [closeTarget, setCloseTarget] = useState<AssessmentListItem | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState<number | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/lecturer/assessments/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Assessment deleted")
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.error("Failed to delete assessment")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = async () => {
    if (!closeTarget) return
    setIsClosing(true)
    try {
      const res = await fetch(`/api/lecturer/assessments/${closeTarget.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed")
      }
      toast.success("Assessment closed")
      setCloseTarget(null)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to close assessment")
    } finally {
      setIsClosing(false)
    }
  }

  const handleStatusTransition = async (id: number, status: "PUBLISHED" | "CLOSED") => {
    setIsTransitioning(id)
    try {
      const res = await fetch(`/api/lecturer/assessments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed")
      }
      toast.success(status === "PUBLISHED" ? "Assessment published" : "Assessment closed")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setIsTransitioning(null)
    }
  }

  const columns: ColumnDef<AssessmentListItem>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-transparent"
        >
          Title
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{row.getValue("title")}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">{row.original.courseCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${typeBadge[row.original.type]}`}>
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const a = row.original
        const effectiveStatus =
          a.status === "PUBLISHED" && new Date() > new Date(a.endsAt) ? "CLOSED" : a.status
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${statusBadge[effectiveStatus]}`}>
            {effectiveStatus}
          </span>
        )
      },
    },
    {
      accessorKey: "classCount",
      header: "Classes",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{row.original.classCount}</span>
      ),
    },
    {
      accessorKey: "startsAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hover:bg-transparent"
        >
          Starts
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{format(new Date(row.original.startsAt), "MMM d, yyyy HH:mm")}</span>
      ),
    },
    {
      accessorKey: "endsAt",
      header: "Ends",
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">{format(new Date(row.original.endsAt), "MMM d, yyyy HH:mm")}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const a = row.original
        const isLoading = isTransitioning === a.id
        const effectiveStatus =
          a.status === "PUBLISHED" && new Date() > new Date(a.endsAt) ? "CLOSED" : a.status
        return (
          <div className="flex items-center justify-end gap-1">
            {effectiveStatus === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleStatusTransition(a.id, "PUBLISHED")}
                className="h-7 px-2 text-[10px] font-medium text-green-700 border-green-200 hover:bg-green-50 rounded-lg"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Publish
              </Button>
            )}
            {effectiveStatus === "PUBLISHED" && (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => setCloseTarget(a)}
                className="h-7 px-2 text-[10px] font-medium text-slate-600 border-slate-200 hover:bg-slate-50 rounded-lg"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Close
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                  <MoreVertical size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/lecturer/assessments/${a.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {(effectiveStatus === "PUBLISHED" || effectiveStatus === "CLOSED") && (
                  <DropdownMenuItem onClick={() => router.push(`/lecturer/assessments/${a.id}/results`)}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Results
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => router.push(`/lecturer/assessments/${a.id}/edit`)}
                  disabled={effectiveStatus !== "DRAFT"}
                  className={effectiveStatus !== "DRAFT" ? "opacity-40 cursor-not-allowed" : ""}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit {effectiveStatus !== "DRAFT" && <span className="ml-auto text-[10px] text-slate-400">Draft only</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  onClick={() => setDeleteTarget(a)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/lecturer/assessments/new")}
          className="flex items-center gap-2 rounded-xl bg-[#002388] px-4 py-2.5 text-sm text-white hover:bg-[#0B4DBB] transition-colors"
        >
          <Plus size={16} />
          New Assessment
        </button>
      </div>

      <ConfirmModal
        open={!!closeTarget}
        title="Close Assessment?"
        description={`"${closeTarget?.title}" is currently live. Closing it will end the assessment for all students immediately. This cannot be undone.`}
        confirmText="Close Assessment"
        isLoading={isClosing}
        onConfirm={handleClose}
        onCancel={() => setCloseTarget(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Assessment?"
        description={
          deleteTarget?.status === "PUBLISHED"
            ? `"${deleteTarget.title}" is currently published. Deleting it may affect students who have already started. This cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`
        }
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <DataTable
        columns={columns}
        data={assessments}
        searchKey="title"
        placeholder="Search assessments..."
      />
    </div>
  )
}
