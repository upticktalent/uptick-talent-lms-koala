"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Calendar,
  Users,
  BookOpen,
  UserCheck,
  Edit3,
  Trash2,
  X,
  Mail,
  Phone,
  User,
} from "lucide-react";

interface Track {
  _id: string;
  name: string;
  description: string;
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Cohort {
  _id: string;
  id: string;
  name: string;
  students: number;
  status: "Active" | "Upcoming" | "Archived";
  isActive: boolean;
}

interface CohortDetailModalProps {
  cohort: Cohort;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

interface CohortDetails {
  _id: string;
  name: string;
  cohortNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  tracks: Track[];
  mentors: Mentor[];
  status: string;
  isAcceptingApplications: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add Student Modal Component
function AddStudentModal({
  open,
  onOpenChange,
  cohortId,
  onStudentAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohortId: string;
  onStudentAdded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    track: "",
  });

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://uptick-lms-backend.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        cohortId: cohortId,
        trackId: formData.track || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to add student: ${response.status}`
        );
      }

      await response.json();
      setFormData({ firstName: "", lastName: "", email: "", phone: "", track: "" });
      onStudentAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding student:", error);
      alert(error instanceof Error ? error.message : "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ firstName: "", lastName: "", email: "", phone: "", track: "" });
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300" aria-hidden="true" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Add New Student
              </h2>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="john.doe@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Learning Track (Optional)
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  placeholder="e.g., Frontend Development"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export function CohortDetailModal({
  cohort,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: CohortDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cohortDetails, setCohortDetails] = useState<CohortDetails | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [formData, setFormData] = useState({
    name: cohort.name,
    students: cohort.students.toString(),
    status: cohort.status,
    isActive: cohort.isActive,
    description: "",
    startDate: "",
    endDate: "",
    maxStudents: "50",
    currentStudents: "0",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uptick-lms-backend.onrender.com";

  useEffect(() => {
    if (open) {
      handleView();
    }
  }, [open]);

  const handleView = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cohorts/${cohort.id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch cohort: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setCohortDetails(data.data);
        setFormData(prev => ({
          ...prev,
          name: data.data.name || cohort.name,
          students: data.data.currentStudents?.toString() || cohort.students.toString(),
          status: (data.data.status === "active" ? "Active" : 
                  data.data.status === "upcoming" ? "Upcoming" : 
                  data.data.status === "archived" ? "Archived" : cohort.status),
          isActive: data.data.isAcceptingApplications || cohort.isActive,
          description: data.data.description || "",
          startDate: data.data.startDate ? data.data.startDate.split("T")[0] : "",
          endDate: data.data.endDate ? data.data.endDate.split("T")[0] : "",
          maxStudents: data.data.maxStudents?.toString() || "50",
          currentStudents: data.data.currentStudents?.toString() || "0",
        }));
      }
    } catch (error) {
      console.error("Error fetching cohort details:", error);
      setCohortDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxStudents: Number.parseInt(formData.maxStudents),
        currentStudents: Number.parseInt(formData.currentStudents),
        status: formData.status.toLowerCase(),
        isAcceptingApplications: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/api/cohorts/${cohort._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update cohort: ${response.status}`);
      }

      await response.json();
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating cohort:", error);
      alert(error instanceof Error ? error.message : "Failed to update cohort");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${cohort.name}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cohorts/${cohort._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to delete cohort: ${response.status}`);
      }

      onDelete?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting cohort:", error);
      alert(error instanceof Error ? error.message : "Failed to delete cohort");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAdded = () => {
    handleView();
    onUpdate?.();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-emerald-500";
      case "upcoming": return "bg-amber-500";
      case "archived": return "bg-slate-500";
      default: return "bg-slate-500";
    }
  };

  const assignedMentorsCount = cohortDetails?.mentors?.length || 0;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300" aria-hidden="true" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(cohortDetails?.status || formData.status)}`} />
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                    {cohortDetails?.name || formData.name}
                  </h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {cohortDetails?.description || "A comprehensive bootcamp covering modern web development technologies."}
                </p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Add Student Button */}
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200 group"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Add Student</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Enroll new students</div>
            </div>
          </button>

          <div className="p-8 space-y-8">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <Users className="w-8 h-8 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">
                  {cohortDetails?.currentStudents || formData.currentStudents}
                </div>
                <div className="text-blue-100 text-sm">Total Students</div>
                <div className="text-blue-200 text-xs mt-2">
                  of {cohortDetails?.maxStudents || formData.maxStudents} maximum
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
                <UserCheck className="w-8 h-8 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">{assignedMentorsCount}</div>
                <div className="text-amber-100 text-sm">Assigned Mentors</div>
                <div className="text-amber-200 text-xs mt-2">{assignedMentorsCount} assigned to this cohort</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <BookOpen className="w-8 h-8 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">{cohortDetails?.tracks?.length || 0}</div>
                <div className="text-purple-100 text-sm">Associated Tracks</div>
                <div className="text-purple-200 text-xs mt-2">{cohortDetails?.tracks?.length || 0} learning paths</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <div className="w-8 h-8 mb-3 opacity-90">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-1 capitalize">
                  {(cohortDetails?.status || formData.status).toLowerCase()}
                </div>
                <div className="text-emerald-100 text-sm">Cohort Status</div>
                <div className="text-emerald-200 text-xs mt-2">
                  {cohortDetails?.isAcceptingApplications ? "Accepting applications" : "Not accepting applications"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Description</h3>
              {isEditing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter cohort description..."
                  className="min-h-32"
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {cohortDetails?.description || formData.description || "No description available."}
                </p>
              )}
            </div>

            {/* Associated Tracks */}
            {cohortDetails?.tracks && cohortDetails.tracks.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Associated Tracks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cohortDetails.tracks.map((track, index) => (
                    <div key={track._id} className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200 group">
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          index % 3 === 0 ? "bg-blue-500" : index % 3 === 1 ? "bg-emerald-500" : "bg-purple-500"
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{track.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{track.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Dates & Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Dates */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Dates</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Start Date</span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-40"
                      />
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDate(cohortDetails?.startDate || formData.startDate)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">End Date</span>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-40"
                      />
                    ) : (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDate(cohortDetails?.endDate || formData.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracks List */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Learning Tracks</h3>
                <div className="space-y-3">
                  {cohortDetails?.tracks && cohortDetails.tracks.length > 0 ? (
                    cohortDetails.tracks.map((track, index) => (
                      <div key={track._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index % 4 === 0 ? "bg-blue-500" : 
                            index % 4 === 1 ? "bg-emerald-500" : 
                            index % 4 === 2 ? "bg-purple-500" : "bg-amber-500"
                          }`} />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{track.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{track.description}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">Track</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No tracks associated with this cohort</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add tracks to organize learning paths</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                  <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Cohort
                  </Button>
                  <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Cohort
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setIsEditing(false); handleView(); }} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        open={showAddStudentModal}
        onOpenChange={setShowAddStudentModal}
        cohortId={cohort._id || cohort.id}
        onStudentAdded={handleStudentAdded}
      />
    </>
  );
}