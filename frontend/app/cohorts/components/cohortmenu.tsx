"use client"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Eye, Edit, Trash2 } from "lucide-react"
import { CohortDetailModal } from "./cohortdetailsmodal"

// Use the same Cohort interface that CohortDetailModal expects
interface Cohort {
  _id: any
  id: string
  name: string
  students: number
  status: "Active" | "Upcoming" | "Archived"
  isActive: boolean
}

interface CohortActionMenuProps {
  cohort: Cohort
  onUpdate?: () => void
  onDelete?: () => void
  loading?: boolean
}

export function CohortActionMenu({ cohort, onUpdate, onDelete, loading }: CohortActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleView = () => {
    setShowDetailModal(true)
    setIsOpen(false)
  }

  const handleEdit = () => {
    setShowDetailModal(true)
    setIsOpen(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${cohort.name}"? This action cannot be undone.`)) {
      onDelete?.()
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
        aria-label="Cohort actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={handleView}
            className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted text-left transition-colors first:rounded-t-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted text-left transition-colors border-t border-border flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors border-t border-border last:rounded-b-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      <CohortDetailModal
        cohort={cohort}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  )
}