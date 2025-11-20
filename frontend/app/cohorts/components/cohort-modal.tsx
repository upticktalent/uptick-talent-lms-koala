'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from './ui/textarea'

interface AddCohortModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCohort?: () => void
}

interface Track {
  id: string
  name: string
}

interface Mentor {
  _id: string
  name: string
  email: string
  role: string
}

interface ApiTrackResponse {
  success: boolean
  data: Track[]
}

interface ApiMentorResponse {
  success: boolean
  data: Mentor[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 

const fetchTracks = async (): Promise<Track[]> => {
  const response = await axios.get<ApiTrackResponse>(`${API_BASE_URL}/api/tracks`)
  console.log(response)
  return response.data.data
}

const fetchMentors = async (): Promise<Mentor[]> => {
  const response = await axios.get<ApiMentorResponse>(`${API_BASE_URL}/api/users/mentors`)
  console.log(response)
  return response.data.data
}

export function AddCohortModal({ open, onOpenChange, onAddCohort }: AddCohortModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cohortName: '',
    startDate: '',
    endDate: '',
    mentors: [] as string[],
    tracks: [] as string[],
    description: '',
  })

  const { 
    data: tracksList = [], 
    isLoading: tracksLoading, 
    error: tracksError 
  } = useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    enabled: open,
  })

  const { 
    data: mentorsList = [], 
    isLoading: mentorsLoading, 
    error: mentorsError 
  } = useQuery({
    queryKey: ['mentors'],
    queryFn: fetchMentors,
    enabled: open,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleMentorChange = (mentorId: string) => {
    setFormData((prev) => ({
      ...prev,
      mentors: prev.mentors.includes(mentorId)
        ? prev.mentors.filter((id) => id !== mentorId)
        : [...prev.mentors, mentorId],
    }))
  }

  const handleTracksChange = (trackId: string) => {
    setFormData((prev) => ({
      ...prev,
      tracks: prev.tracks.includes(trackId)
        ? prev.tracks.filter((id) => id !== trackId)
        : [...prev.tracks, trackId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!formData.cohortName.trim()) {
      setError('Cohort name is required')
      setLoading(false)
      return
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required')
      setLoading(false)
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/cohorts/create`, {
        name: formData.cohortName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        mentors: formData.mentors,
        tracks: formData.tracks,
        description: formData.description,
      })

      console.log('Cohort created successfully:', response.data)
      
      onAddCohort?.()
      handleClose()
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Failed to create cohort'
        : 'An unexpected error occurred'
      console.error('Error creating cohort:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      cohortName: '',
      startDate: '',
      endDate: '',
      mentors: [],
      tracks: [],
      description: '',
    })
    setError(null)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Cohort
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Fill in the details below to set up a new cohort.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Cohort Name */}
            <div>
              <label
                htmlFor="cohortName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Cohort Name
              </label>
              <Input
                id="cohortName"
                name="cohortName"
                placeholder="e.g., Spring 2024 Full-Stack Developers"
                value={formData.cohortName}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Start Date
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  End Date
                </label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Mentors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mentors
              </label>
              <div className="space-y-2">
                {mentorsLoading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    Loading mentors...
                  </p>
                ) : mentorsError ? (
                  <p className="text-sm text-red-600 dark:text-red-400 py-2">
                    Error loading mentors. Please try again.
                  </p>
                ) : mentorsList.length > 0 ? (
                  mentorsList.map((mentor) => (
                    <label
                      key={mentor._id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.mentors.includes(mentor._id)}
                        onChange={() => handleMentorChange(mentor._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {mentor.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {mentor.email}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No mentors available
                  </p>
                )}
              </div>
            </div>

            {/* Tracks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracks
              </label>
              <div className="space-y-2">
                {tracksLoading ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    Loading tracks...
                  </p>
                ) : tracksError ? (
                  <p className="text-sm text-red-600 dark:text-red-400 py-2">
                    Error loading tracks. Please try again.
                  </p>
                ) : tracksList.length > 0 ? (
                  tracksList.map((track) => (
                    <label
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tracks.includes(track.id)}
                        onChange={() => handleTracksChange(track.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{track.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No tracks available
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide a brief description of the cohort's focus, goals, or schedule."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-32"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || tracksLoading || mentorsLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading || tracksLoading || mentorsLoading}
              >
                {loading ? 'Creating...' : 'Create Cohort'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}