"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
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
import { Plus, Search, Calendar, LoaderCircle, MoreVertical, Edit, Trash2, Users, Clock } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { lmsService } from "@/services/lmsService";
import { trackService } from "@/services/trackService";
import { formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CohortsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);

  const [newCohort, setNewCohort] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    cohortNumber: "",
    maxStudents: 60,
    tracks: [] as string[],
    isActive: true,
  });

  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(lmsService.getCohorts);

  const { data: tracksData } = useFetch(trackService.getTracks);
  const tracks = tracksData?.tracks || [];

  const cohortsData = data?.cohorts || [];

  const filteredCohorts = cohortsData.filter((cohort: any) =>
    cohort.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredCohorts.length;
  
  const paginatedCohorts = filteredCohorts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle Create Cohort
  const handleCreateCohort = async () => {
    try {
      setIsCreating(true);
      
      // Basic validation
      if (!newCohort.name || !newCohort.startDate || !newCohort.endDate || !newCohort.cohortNumber) {
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = {
        ...newCohort,
        cohortNumber: Number(newCohort.cohortNumber),
        startDate: new Date(newCohort.startDate).toISOString(),
        endDate: new Date(newCohort.endDate).toISOString(),
        tracks: newCohort.tracks.length > 0 ? newCohort.tracks : [""], 
      };

      await lmsService.createCohort(payload);
      
      toast.success("Cohort created successfully");
      setIsCreateDialogOpen(false);
      setNewCohort({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        cohortNumber: "",
        maxStudents: 60,
        tracks: [],
        isActive: true,
      });
      refetch();
    } catch (error) {
      console.error("Failed to create cohort:", error);
      toast.error("Failed to create cohort");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Edit Cohort
  const handleEditCohort = async () => {
    if (!selectedCohort) return;

    try {
      setIsUpdating(true);
      
      // Basic validation
      if (!selectedCohort.name || !selectedCohort.startDate || !selectedCohort.endDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = {
        name: selectedCohort.name,
        tracks: selectedCohort.tracks?.length > 0 ? selectedCohort.tracks : [""],
        startDate: new Date(selectedCohort.startDate).toISOString(),
        endDate: new Date(selectedCohort.endDate).toISOString(),
        isActive: selectedCohort.isActive,
      };

      await lmsService.updateCohort(selectedCohort._id, payload);
      
      toast.success("Cohort updated successfully");
      setIsEditDialogOpen(false);
      setSelectedCohort(null);
      refetch();
    } catch (error) {
      console.error("Failed to update cohort:", error);
      toast.error("Failed to update cohort");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Delete Cohort
  const handleDeleteCohort = async () => {
    if (!selectedCohort) return;

    try {
      setIsDeleting(true);
      await lmsService.deleteCohort(selectedCohort._id);
      
      toast.success("Cohort deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedCohort(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete cohort:", error);
      toast.error("Failed to delete cohort");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Dialog - FIXED: Better handling of cohort data
  const openEditDialog = (cohort: any) => {
    console.log("Editing cohort:", cohort); // Debug log
    
    // Map status to isActive for the form
    const isActive = cohort.status === "active";
    
    setSelectedCohort({
      ...cohort,
      startDate: cohort.startDate ? cohort.startDate.split('T')[0] : "",
      endDate: cohort.endDate ? cohort.endDate.split('T')[0] : "",
      tracks: cohort.tracks || [],
      isActive: isActive, // Map status to isActive
    });
    setIsEditDialogOpen(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (cohort: any) => {
    setSelectedCohort(cohort);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className='text-center text-red-600 p-4'>
        Failed to load cohorts: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Cohorts</h1>
        <p className="text-gray-600 text-sm lg:text-base">Manage and view all cohorts</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 lg:p-6 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> 
              <span className="hidden sm:inline">Create Cohort</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>
                Define a new learning cohort with its schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Cohort Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Cohort 7"
                    value={newCohort.name}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cohortNumber">Cohort Number</Label>
                  <Input
                    id="cohortNumber"
                    type="number"
                    placeholder="e.g. 7"
                    value={newCohort.cohortNumber}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, cohortNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tracks">Tracks</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                  {tracks.map((track: any) => (
                    <div key={track._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`track-${track._id}`}
                        checked={newCohort.tracks.includes(track._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCohort({
                              ...newCohort,
                              tracks: [...newCohort.tracks, track._id],
                            });
                          } else {
                            setNewCohort({
                              ...newCohort,
                              tracks: newCohort.tracks.filter((id) => id !== track._id),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor={`track-${track._id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {track.name}
                      </label>
                    </div>
                  ))}
                  {tracks.length === 0 && <p className="text-sm text-gray-500">No tracks available</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCohort.startDate}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCohort.endDate}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={newCohort.maxStudents}
                    onChange={(e) =>
                      setNewCohort({ ...newCohort, maxStudents: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2 items-center">
                   <div className="flex items-center space-x-2 sm:mt-6">
                    <Switch
                      id="isActive"
                      checked={newCohort.isActive}
                      onCheckedChange={(checked) =>
                        setNewCohort({ ...newCohort, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive">Active Cohort</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description..."
                  value={newCohort.description}
                  onChange={(e) =>
                    setNewCohort({ ...newCohort, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCohort} 
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                {isCreating ? "Creating..." : "Create Cohort"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden space-y-4">
        {paginatedCohorts.length > 0 ? (
          paginatedCohorts.map((cohort: any) => (
            <div key={cohort._id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{cohort.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {cohort.description || "No description"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => openEditDialog(cohort)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(cohort)}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Cohort #</span>
                  <span className="text-sm text-gray-900">{cohort.cohortNumber}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Duration</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(cohort.startDate)}
                    </div>
                    <div className="text-xs text-gray-500">to {formatDate(cohort.endDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Students</span>
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Users className="w-3 h-3" />
                    {cohort.currentStudents} / {cohort.maxStudents}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      cohort.status === "active"
                        ? "bg-green-100 text-green-800"
                        : cohort.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {cohort.status ? cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1) : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-gray-500">No cohorts found.</div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-gray-900 w-[250px]">Cohort Name</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Cohort #</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Duration</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Students</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCohorts.length > 0 ? (
                paginatedCohorts.map((cohort: any) => (
                  <TableRow key={cohort._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {cohort.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                          {cohort.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-gray-600 font-medium">
                        {cohort.cohortNumber}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(cohort.startDate)}
                        </span>
                        <span className="text-xs text-gray-400 ml-4">to {formatDate(cohort.endDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-600">
                        {cohort.currentStudents} / {cohort.maxStudents}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          cohort.status === "active"
                            ? "bg-green-100 text-green-800"
                            : cohort.status === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {cohort.status ? cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1) : "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => openEditDialog(cohort)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(cohort)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No cohorts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="px-2">
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Edit Cohort Dialog - FIXED: Better data handling */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle>Edit Cohort</DialogTitle>
            <DialogDescription>
              Update the cohort information. Only name, tracks, dates, and status can be modified.
            </DialogDescription>
          </DialogHeader>
          {selectedCohort && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Cohort Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Cohort 7"
                  value={selectedCohort.name || ""}
                  onChange={(e) =>
                    setSelectedCohort({ ...selectedCohort, name: e.target.value })
                  }
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-tracks">Tracks</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                  {tracks.length > 0 ? (
                    tracks.map((track: any) => (
                      <div key={track._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-track-${track._id}`}
                          checked={selectedCohort.tracks?.includes(track._id) || false}
                          onChange={(e) => {
                            const currentTracks = selectedCohort.tracks || [];
                            if (e.target.checked) {
                              setSelectedCohort({
                                ...selectedCohort,
                                tracks: [...currentTracks, track._id],
                              });
                            } else {
                              setSelectedCohort({
                                ...selectedCohort,
                                tracks: currentTracks.filter((id: string) => id !== track._id),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`edit-track-${track._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {track.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No tracks available</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">Start Date *</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={selectedCohort.startDate || ""}
                    onChange={(e) =>
                      setSelectedCohort({ ...selectedCohort, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-endDate">End Date *</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={selectedCohort.endDate || ""}
                    onChange={(e) =>
                      setSelectedCohort({ ...selectedCohort, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={selectedCohort.isActive || false}
                  onCheckedChange={(checked) =>
                    setSelectedCohort({ ...selectedCohort, isActive: checked })
                  }
                />
                <Label htmlFor="edit-isActive">Active Cohort</Label>
              </div>

              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                <p><strong>Note:</strong> Only name, tracks, dates, and status can be edited. Cohort number, description, and student limits are read-only.</p>
                <p className="mt-1">Current status: {selectedCohort.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCohort} 
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? "Updating..." : "Update Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] mx-4">
          <DialogHeader>
            <DialogTitle>Delete Cohort</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCohort?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCohort} 
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete Cohort"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}