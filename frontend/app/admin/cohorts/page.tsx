"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cohortService } from "@/services/cohortService";
import { trackService } from "@/services/trackService";
import { userService } from "@/services/userService";
import { ICohort, ITrack, IUser, ApiResponse } from "@/types";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<ICohort[]>([]);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<ICohort | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cohortNumber: "",
    startDate: "",
    endDate: "",
    applicationDeadline: "",
    maxStudents: 100,
  });
  const [selectedTracks, setSelectedTracks] = useState<
    { trackId: string; maxStudents: number; mentorIds: string[] }[]
  >([]);
  const [availableMentors, setAvailableMentors] = useState<IUser[]>([]);

  useEffect(() => {
    fetchCohorts();
    fetchTracks();
    fetchMentors();
  }, []);

  const fetchCohorts = async () => {
    try {
      const response: any = await cohortService.getCohorts();
      if (response.success) {
        const cohorts = response.data?.cohorts || [];
        setCohorts(cohorts);
      } else {
        toast.error("Failed to fetch cohorts");
      }
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      toast.error("Error fetching cohorts");
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const response: any = await trackService.getActiveTracks();
      console.log("Tracks Response:", response);
      if (response.success) {
        // getActiveTracks returns { success: true, data: tracks } directly
        setTracks(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response: ApiResponse<IUser[]> = await userService.getMentors();
      if (response.success) {
        setAvailableMentors(response.data || []);
      } else {
        console.error("Error fetching mentors:", response.message);
        toast.error(response.message || "Failed to fetch mentors");
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
      toast.error("Failed to fetch mentors");
    }
  };

  const handleCreateCohort = async () => {
    try {
      // First create the cohort
      const response: ApiResponse<ICohort> = await cohortService.createCohort(
        formData
      );
      if (response.success && response.data) {
        const newCohortId = response.data._id;

        // Then add tracks to the cohort
        if (selectedTracks.length > 0) {
          for (const track of selectedTracks) {
            try {
              await cohortService.addTrackToCohort(newCohortId, {
                trackId: track.trackId,
                maxStudents: track.maxStudents,
                mentorIds: track.mentorIds,
              });
            } catch (trackError) {
              console.error("Error adding track:", trackError);
            }
          }
        }

        toast.success("Cohort created successfully");
        setCreateDialogOpen(false);
        resetForm();
        fetchCohorts();
      } else {
        toast.error(response.message || "Failed to create cohort");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating cohort");
    }
  };

  const handleUpdateCohort = async () => {
    if (!editingCohort) return;

    try {
      // First update the basic cohort information
      const response: ApiResponse<ICohort> = await cohortService.updateCohort(
        editingCohort._id,
        formData
      );

      if (response.success) {
        // Handle track updates
        const existingTrackIds = editingCohort.tracks.map((ct) =>
          typeof ct.track === "string" ? ct.track : ct.track._id
        );
        const newTrackIds = selectedTracks
          .map((st) => st.trackId)
          .filter(Boolean);

        // Remove tracks that are no longer selected
        const tracksToRemove = existingTrackIds.filter(
          (id) => !newTrackIds.includes(id)
        );
        for (const trackId of tracksToRemove) {
          try {
            await cohortService.removeTrackFromCohort(
              editingCohort._id,
              trackId
            );
          } catch (error) {
            console.error("Error removing track:", error);
          }
        }

        // Add or update tracks
        for (const track of selectedTracks) {
          if (track.trackId) {
            if (!existingTrackIds.includes(track.trackId)) {
              // Add new track
              try {
                await cohortService.addTrackToCohort(editingCohort._id, {
                  trackId: track.trackId,
                  maxStudents: track.maxStudents,
                  mentorIds: track.mentorIds,
                });
              } catch (error) {
                console.error("Error adding track:", error);
              }
            } else {
              // Update existing track (remove and re-add for now)
              // Note: You might want to implement a more sophisticated update method
              try {
                await cohortService.removeTrackFromCohort(
                  editingCohort._id,
                  track.trackId
                );
                await cohortService.addTrackToCohort(editingCohort._id, {
                  trackId: track.trackId,
                  maxStudents: track.maxStudents,
                  mentorIds: track.mentorIds,
                });
              } catch (error) {
                console.error("Error updating track:", error);
              }
            }
          }
        }

        toast.success("Cohort updated successfully");
        setEditingCohort(null);
        resetForm();
        fetchCohorts();
      } else {
        toast.error(response.message || "Failed to update cohort");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error updating cohort");
    }
  };

  const handleSetActive = async (cohortId: string) => {
    try {
      const response: ApiResponse<ICohort> =
        await cohortService.setCurrentlyActive(cohortId);
      if (response.success) {
        toast.success("Cohort set as active");
        fetchCohorts();
      } else {
        toast.error(response.message || "Failed to set cohort as active");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error setting cohort as active"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cohortNumber: "",
      startDate: "",
      endDate: "",
      applicationDeadline: "",
      maxStudents: 100,
    });
    setSelectedTracks([]);
  };

  const handleEditCohort = (cohort: ICohort) => {
    setEditingCohort(cohort);
    setFormData({
      name: cohort.name,
      description: cohort.description,
      cohortNumber: cohort.cohortNumber,
      startDate: cohort.startDate.split("T")[0],
      endDate: cohort.endDate.split("T")[0],
      applicationDeadline: cohort.applicationDeadline.split("T")[0],
      maxStudents: cohort.maxStudents,
    });
    // Populate selected tracks from existing cohort
    const existingTracks = cohort.tracks.map((ct) => ({
      trackId: typeof ct.track === "string" ? ct.track : ct.track._id,
      maxStudents: ct.maxStudents || 50,
      mentorIds: ct.mentors.map((m) => (typeof m === "string" ? m : m._id)),
    }));
    setSelectedTracks(existingTracks);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />;
      case "upcoming":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAddTrack = () => {
    setSelectedTracks((prev) => [
      ...prev,
      {
        trackId: "",
        maxStudents: 50,
        mentorIds: [],
      },
    ]);
  };

  const handleRemoveTrack = (index: number) => {
    setSelectedTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTrackChange = (index: number, field: string, value: any) => {
    setSelectedTracks((prev) =>
      prev.map((track, i) =>
        i === index ? { ...track, [field]: value } : track
      )
    );
  };

  const handleMentorToggle = (trackIndex: number, mentorId: string) => {
    setSelectedTracks((prev) => {
      const updated = [...prev];
      const mentorIds = updated[trackIndex].mentorIds;

      if (mentorIds.includes(mentorId)) {
        updated[trackIndex].mentorIds = mentorIds.filter(
          (id) => id !== mentorId
        );
      } else {
        updated[trackIndex].mentorIds = [...mentorIds, mentorId];
      }

      return updated;
    });
  };

  const handleSelectAllMentors = (trackIndex: number) => {
    setSelectedTracks((prev) => {
      const updated = [...prev];
      updated[trackIndex].mentorIds = availableMentors.map(
        (mentor) => mentor._id
      );
      return updated;
    });
  };

  const handleDeselectAllMentors = (trackIndex: number) => {
    setSelectedTracks((prev) => {
      const updated = [...prev];
      updated[trackIndex].mentorIds = [];
      return updated;
    });
  };

  const filteredCohorts = cohorts.filter((cohort) => {
    const matchesSearch =
      cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cohort.cohortNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cohort.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cohorts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage student cohorts and track assignments
          </p>
          {availableMentors.length === 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
              <span>💡 Need mentors?</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-amber-600 underline"
                onClick={() => window.open("/admin/users", "_blank")}
              >
                Create mentors here
              </Button>
            </div>
          )}
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>
                Create a new cohort to organize students and tracks.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cohort Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Software Development Cohort 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cohortNumber">Cohort Number</Label>
                  <Input
                    id="cohortNumber"
                    value={formData.cohortNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cohortNumber: e.target.value,
                      }))
                    }
                    placeholder="e.g., COH-2024-01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the cohort..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">
                    Application Deadline
                  </Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicationDeadline: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Maximum Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxStudents: parseInt(e.target.value),
                    }))
                  }
                  min="1"
                />
              </div>

              {/* Track Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Tracks</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTrack}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Track
                  </Button>
                </div>

                {selectedTracks.map((selectedTrack, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Track {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTrack(index)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Track</Label>
                          <Select
                            value={selectedTrack.trackId}
                            onValueChange={(value) =>
                              handleTrackChange(index, "trackId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a track" />
                            </SelectTrigger>
                            <SelectContent>
                              {tracks.map((track) => (
                                <SelectItem key={track._id} value={track._id}>
                                  {track.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Max Students</Label>
                          <Input
                            type="number"
                            value={selectedTrack.maxStudents}
                            onChange={(e) =>
                              handleTrackChange(
                                index,
                                "maxStudents",
                                parseInt(e.target.value) || 0
                              )
                            }
                            min="1"
                            placeholder="50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <span>Assigned Mentors</span>
                            <Badge variant="secondary" className="text-xs">
                              {selectedTrack.mentorIds.length} selected
                            </Badge>
                          </Label>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={fetchMentors}
                              title="Refresh mentors list"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleSelectAllMentors(index)}
                            >
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleDeselectAllMentors(index)}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {availableMentors.length === 0 ? (
                            <div className="col-span-full text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                No mentors available
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open("/admin/users", "_blank")
                                }
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Create Mentors
                              </Button>
                            </div>
                          ) : (
                            availableMentors.map((mentor) => (
                              <div
                                key={mentor._id}
                                className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded"
                              >
                                <input
                                  type="checkbox"
                                  id={`mentor-${index}-${mentor._id}`}
                                  checked={selectedTrack.mentorIds.includes(
                                    mentor._id
                                  )}
                                  onChange={() =>
                                    handleMentorToggle(index, mentor._id)
                                  }
                                  className="rounded border-2 w-4 h-4"
                                />
                                <label
                                  htmlFor={`mentor-${index}-${mentor._id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {mentor.firstName} {mentor.lastName}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {selectedTracks.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No tracks added. Click "Add Track" to assign tracks to this
                    cohort.
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCohort}>Create Cohort</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohorts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Cohorts
            </CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.reduce((sum, cohort) => sum + cohort.currentStudents, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Cohorts
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohorts.filter((c) => c.status === "upcoming").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">           
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cohorts Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Tracks</TableHead>
              <TableHead>Application Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCohorts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No cohorts found
                </TableCell>
              </TableRow>
            ) : (
              filteredCohorts.map((cohort) => (
                <TableRow key={cohort._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{cohort.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cohort.cohortNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(
                        cohort.status
                      )} flex items-center gap-1 w-fit`}
                    >
                      {getStatusIcon(cohort.status)}
                      {cohort.status}
                      {cohort.isCurrentlyActive && (
                        <span className="text-xs">(Current)</span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {new Date(cohort.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">
                        to {new Date(cohort.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>
                        {cohort.currentStudents}/{cohort.maxStudents}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (cohort.currentStudents / cohort.maxStudents) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {cohort.tracks.slice(0, 2).map((track, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {typeof track.track === "string"
                            ? track.track
                            : track.track.name}
                        </Badge>
                      ))}
                      {cohort.tracks.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{cohort.tracks.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(
                        cohort.applicationDeadline
                      ).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/cohorts/${cohort._id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCohort(cohort)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!cohort.isCurrentlyActive && (
                          <DropdownMenuItem
                            onClick={() => handleSetActive(cohort._id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Set as Active
                          </DropdownMenuItem>
                        )}
                        {cohort.status === "active" ? (
                          <DropdownMenuItem asChild>
                            <Link href="/lms/dashboard">
                              <Users className="mr-2 h-4 w-4" />
                              LMS Dashboard
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/cohorts/${cohort._id}/applications`}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Applications
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </div>
      </Card>      {/* Edit Dialog */}
      <Dialog
        open={!!editingCohort}
        onOpenChange={(open) => !open && setEditingCohort(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cohort</DialogTitle>
            <DialogDescription>
              Update cohort information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Cohort Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cohortNumber">Cohort Number</Label>
                <Input
                  id="edit-cohortNumber"
                  value={formData.cohortNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cohortNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-applicationDeadline">
                  Application Deadline
                </Label>
                <Input
                  id="edit-applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      applicationDeadline: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxStudents">Maximum Students</Label>
              <Input
                id="edit-maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxStudents: parseInt(e.target.value),
                  }))
                }
                min="1"
              />
            </div>

            {/* Track Management Section for Edit */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Tracks</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTrack}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              </div>

              {selectedTracks.map((selectedTrack, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Track {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTrack(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Track</Label>
                        <Select
                          value={selectedTrack.trackId}
                          onValueChange={(value) =>
                            handleTrackChange(index, "trackId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a track" />
                          </SelectTrigger>
                          <SelectContent>
                            {tracks.map((track) => (
                              <SelectItem key={track._id} value={track._id}>
                                {track.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Max Students</Label>
                        <Input
                          type="number"
                          value={selectedTrack.maxStudents}
                          onChange={(e) =>
                            handleTrackChange(
                              index,
                              "maxStudents",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                          placeholder="50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <span>Assigned Mentors</span>
                          <Badge variant="secondary" className="text-xs">
                            {selectedTrack.mentorIds.length} selected
                          </Badge>
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={fetchMentors}
                            title="Refresh mentors list"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleSelectAllMentors(index)}
                          >
                            Select All
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleDeselectAllMentors(index)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {availableMentors.length === 0 ? (
                          <div className="col-span-full text-center py-4">
                            <p className="text-sm text-muted-foreground mb-2">
                              No mentors available
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open("/admin/users", "_blank")
                              }
                              className="text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Create Mentors
                            </Button>
                          </div>
                        ) : (
                          availableMentors.map((mentor) => (
                            <div
                              key={mentor._id}
                              className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded"
                            >
                              <input
                                type="checkbox"
                                id={`edit-mentor-${index}-${mentor._id}`}
                                checked={selectedTrack.mentorIds.includes(
                                  mentor._id
                                )}
                                onChange={() =>
                                  handleMentorToggle(index, mentor._id)
                                }
                                className="rounded border-2 w-4 h-4"
                              />
                              <label
                                htmlFor={`edit-mentor-${index}-${mentor._id}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {mentor.firstName} {mentor.lastName}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {selectedTracks.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No tracks assigned. Click "Add Track" to assign tracks to this
                  cohort.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCohort(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCohort}>Update Cohort</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
