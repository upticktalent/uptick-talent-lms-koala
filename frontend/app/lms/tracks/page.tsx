"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  CheckCircle,
  Search,
  MoreVertical,
  Plus,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/useFetch";
import { trackService } from "@/services/trackService";
import { cohortService } from "@/services/cohortService";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Loader from "@/components/Loader";

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <div
    className={`rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default function TracksPage() {
  const router = useRouter()
  const { isAdmin } = useUser();
  const {
    response: currentCohort,
    loading,
    error,
    refetch,
  } = useFetch(cohortService.getCurrentActiveCohort);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTrack, setNewTrack] = useState({
    name: "",
    trackId: "",
    description: "",
    isActive: true,
  });
  
  console.log('Cohort Data:', currentCohort);
  
  // Extract tracks from current active cohort
  
  const cohortTracks = currentCohort?.tracks || [];
  const [isCreating, setIsCreating] = useState(false);

  const filteredTracks = cohortTracks?.filter((cohortTrack: any) =>
    cohortTrack.track?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  console.log('Filtered Tracks:', filteredTracks);
  
  // Calculate stats based on cohort tracks
  const totalTracks = cohortTracks?.length || 0;
  const activeTracks = cohortTracks?.filter((ct: any) => ct.track?.isActive).length || 0;
  const totalStudents = cohortTracks?.reduce(
    (acc: number, curr: any) => acc + (curr.currentStudents || 0),
    0
  ) || 0;
  const totalMentors = cohortTracks?.reduce(
    (acc: number, curr: any) => acc + (curr.mentors?.length || 0),
    0
  ) || 0;

  const handleCreateTrack = async () => {
    try {
      setIsCreating(true);
      // Basic validation
      if (!newTrack.name || !newTrack.trackId) {
        toast.error("Name and Track ID are required");
        return;
      }
      
      await trackService.createTrack(newTrack);
      
      toast.success("Track created successfully");
      setIsCreateDialogOpen(false);
      setNewTrack({ name: "", trackId: "", description: "", isActive: true });
      refetch();
    } catch (error) {
      toast.error("Failed to create track");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load tracks. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tracks</h1>
        <p className="text-gray-600 mt-2">
          {currentCohort ? (
            <>
              Managing tracks for <span className="font-semibold text-blue-600">{currentCohort.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({new Date(currentCohort.startDate).toLocaleDateString()} - {new Date(currentCohort.endDate).toLocaleDateString()})
              </span>
            </>
          ) : (
            "No active cohort found"
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tracks"
          value={totalTracks}
          icon={BookOpen}
          color="#3B82F6" // Blue
        />
        <StatCard
          title="Active Tracks"
          value={activeTracks}
          icon={CheckCircle}
          color="#10B981" // Emerald
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="#8B5CF6" // Violet
        />
        <StatCard
          title="Total Mentors"
          value={totalMentors}
          icon={UserCheck}
          color="#F59E0B" // Amber
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create New Track
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Track</DialogTitle>
                <DialogDescription>
                  Add a new learning track to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newTrack.name}
                    onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                    placeholder="e.g. Cloud Computing"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trackId">Track ID</Label>
                  <Input
                    id="trackId"
                    value={newTrack.trackId}
                    onChange={(e) => setNewTrack({ ...newTrack, trackId: e.target.value })}
                    placeholder="e.g. cloud-computing"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTrack.description}
                    onChange={(e) => setNewTrack({ ...newTrack, description: e.target.value })}
                    placeholder="Provide a brief description of the track..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status" className="text-base">Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="status"
                      checked={newTrack.isActive}
                      onCheckedChange={(checked) => setNewTrack({ ...newTrack, isActive: checked })}
                    />
                    <span className="text-sm text-gray-600">
                      {newTrack.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateTrack} disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : "Create Track"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tracks Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[300px]">Track Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Mentors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTracks.length > 0 ? (
              filteredTracks.map((cohortTrack: any) => {
                const track = cohortTrack.track;
                return (
                  <TableRow key={cohortTrack._id || track?._id} className="hover:bg-gray-50" onClick={() => router.push(`/lms/track/${track?.trackId}/stream`)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {track?.name || 'Unknown Track'}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {track?.description || 'No description available'}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Cohort: {currentCohort?.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={track?.isActive ? "default" : "secondary"}
                        className={
                          track?.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                      >
                        {track?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{cohortTrack.currentStudents || 0}</span>
                        {cohortTrack.maxStudents && (
                          <span className="text-xs text-gray-400">
                            / {cohortTrack.maxStudents}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserCheck className="w-4 h-4" />
                        <span className="font-medium">{cohortTrack.mentors?.length || 0}</span>
                        {cohortTrack.mentors?.length > 0 && (
                          <div className="text-xs text-gray-500 ml-1">
                            {cohortTrack.mentors.slice(0, 2).map((mentor: any, index: number) => (
                              <span key={mentor._id || index}>
                                {mentor.firstName} {mentor.lastName}
                                {index < Math.min(cohortTrack.mentors.length - 1, 1) && ", "}
                              </span>
                            ))}
                            {cohortTrack.mentors.length > 2 && (
                              <span> +{cohortTrack.mentors.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/lms/track/${track?.trackId}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          {isAdmin && (
                            <>
                              <DropdownMenuItem className="cursor-pointer">
                                Edit Track
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                Manage Mentors
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 cursor-pointer">
                                Remove from Cohort
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {currentCohort ? 
                    "No tracks found in the current active cohort." : 
                    "No active cohort found. Please create or activate a cohort first."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}