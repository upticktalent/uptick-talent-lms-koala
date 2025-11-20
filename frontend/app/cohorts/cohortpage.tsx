"use client"

import { useState, useEffect } from "react"
import { CohortTable } from "./components/cohorttable"
import { AddCohortModal } from "./components/cohort-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export interface Cohort {
  _id: any 
  id: string
  name: string
  students: number
  status: "Active" | "Upcoming" | "Archived"
  isActive: boolean
}

export function CohortPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [filteredCohorts, setFilteredCohorts] = useState<Cohort[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 

  const fetchCohorts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/cohorts`) 
      
      if (!response.ok) throw new Error("Failed to fetch cohorts")
      
      const data = await response.json()
      console.log("API Response:", data) 
      
      const transformedData = data.data?.cohorts.map((item: any) => ({
        _id: item._id, 
        id: item._id || item.id, 
        name: item.name,
        students: item.currentStudents || item.studentCount || 0,
        status: mapStatus(item.status), 
        isActive: item.isActive || item.isAcceptingApplications || false,
      }))
      
      setCohorts(transformedData)
      setFilteredCohorts(transformedData)
    } catch (error) {
      console.error("Error fetching cohorts:", error)
      const fallbackData: Cohort[] = [
        {
          _id: "1",
          id: "1",
          name: "Fall 2024 Full-Stack",
          students: 32,
          status: "Active",
          isActive: true,
        },
        {
          _id: "2",
          id: "2",
          name: "Spring 2024 UX/UI",
          students: 28,
          status: "Upcoming",
          isActive: false,
        },
        {
          _id: "3",
          id: "3",
          name: "Summer 2023 Data Science",
          students: 25,
          status: "Archived",
          isActive: false,
        },
        {
          _id: "4",
          id: "4",
          name: "Winter 2024 Cybersecurity",
          students: 22,
          status: "Upcoming",
          isActive: false,
        },
      ]
      setCohorts(fallbackData)
      setFilteredCohorts(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const mapStatus = (status: string): "Active" | "Upcoming" | "Archived" => {
    switch (status?.toLowerCase()) {
      case 'active': return 'Active'
      case 'upcoming': return 'Upcoming'
      case 'archived': return 'Archived'
      default: return 'Upcoming'
    }
  }

  useEffect(() => {
    fetchCohorts()
  }, [])

  useEffect(() => {
    const filtered = cohorts.filter((cohort) => 
      cohort.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredCohorts(filtered)
  }, [searchQuery, cohorts])

  const handleToggleActive = (cohortId: string) => {
    setCohorts((prev) =>
      prev.map((cohort) =>
        cohort.id === cohortId ? { ...cohort, isActive: !cohort.isActive } : { ...cohort, isActive: false },
      ),
    )
    setFilteredCohorts((prev) =>
      prev.map((cohort) =>
        cohort.id === cohortId ? { ...cohort, isActive: !cohort.isActive } : { ...cohort, isActive: false },
      ),
    )
  }

  const handleAddCohort = () => {
    fetchCohorts()
    setIsModalOpen(false)
  }

  const handleCohortUpdate = () => {
    fetchCohorts()
  }

  const handleCohortDelete = () => {
    fetchCohorts()
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cohort Management</h1>
          <p className="text-muted-foreground mt-1">Manage all student cohorts in one place.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          + Add New Cohort
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for a cohort by name"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CohortTable
        cohorts={filteredCohorts}
        loading={loading}
        onToggleActive={handleToggleActive}
        onCohortUpdate={handleCohortUpdate}
        onCohortDelete={handleCohortDelete}
      />

      <AddCohortModal open={isModalOpen} onOpenChange={setIsModalOpen} onAddCohort={handleAddCohort} />
    </div>
  )
}