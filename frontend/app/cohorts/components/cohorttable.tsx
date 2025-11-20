"use client"

import { CohortActionMenu } from "./cohortmenu" 

interface Cohort {
  _id: any
  id: string
  name: string
  students: number
  status: "Active" | "Upcoming" | "Archived"
  isActive: boolean
}

interface CohortTableProps {
  cohorts: Cohort[]
  loading: boolean
  onToggleActive: (cohortId: string) => void
  onCohortUpdate?: () => void  
  onCohortDelete?: () => void 
}

export function CohortTable({ cohorts, loading, onToggleActive, onCohortUpdate, onCohortDelete }: CohortTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading cohorts...</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Upcoming":
        return "bg-orange-100 text-orange-700"
      case "Archived":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">COHORT NAME</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">STUDENTS</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">STATUS</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ACTIVE COHORT</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr key={cohort.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{cohort.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{cohort.students} Students</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cohort.status)}`}>
                    {cohort.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleActive(cohort.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      cohort.isActive ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={cohort.isActive}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cohort.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <CohortActionMenu 
                    cohort={cohort}
                    onUpdate={onCohortUpdate}
                    onDelete={onCohortDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Showing 1 to {Math.min(4, cohorts.length)} of {cohorts.length} results
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 text-sm font-medium border border-border rounded hover:bg-muted transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}