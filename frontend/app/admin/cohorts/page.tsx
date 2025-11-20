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
import { Plus, Search, Calendar, LoaderCircle, MoreVertical } from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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



  if (loading) {
    return <LoadingSpinner />;
  }
  
  
    if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load cohorts: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cohorts</h1>
        <p className="text-gray-600 mt-1">Manage and view all cohorts</p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cohorts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Cohort
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Cohort</DialogTitle>
              <DialogDescription>
                Define a new learning cohort with its schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                   <div className="flex items-center space-x-2 mt-6">
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
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCohort} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Cohort"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cohorts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
              paginatedCohorts.map((cohort: any) => {
                 return (
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No cohorts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
