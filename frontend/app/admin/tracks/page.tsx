"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Edit, Users, BookOpen, Eye } from "lucide-react";
import { useFetch } from "@/hooks/useFetch";
import { trackService } from "@/services/trackService";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function TracksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const [newTrack, setNewTrack] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(trackService.getTracks);

  const tracksData = data?.tracks || [];

  const filteredTracks = tracksData.filter((track: any) =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTrack = async () => {
    try {
      setIsCreating(true);
      if (!newTrack.name || !newTrack.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      await trackService.createTrack(newTrack);
      
      toast.success("Track created successfully");
      setIsCreateDialogOpen(false);
      setNewTrack({
        name: "",
        description: "",
        isActive: true,
      });
      refetch();
    } catch (error) {
      console.error("Failed to create track:", error);
      toast.error("Failed to create track");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTrack = async () => {
    if (!selectedTrack) return;

    try {
      setIsUpdating(true);
      if (!selectedTrack.name || !selectedTrack.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      const payload = {
        name: selectedTrack.name,
        description: selectedTrack.description,
        isActive: selectedTrack.isActive,
      };

      await trackService.updateTrack(selectedTrack._id, payload);
      
      toast.success("Track updated successfully");
      setIsEditDialogOpen(false);
      setSelectedTrack(null);
      refetch();
    } catch (error) {
      console.error("Failed to update track:", error);
      toast.error("Failed to update track");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = (track: any) => {
    setSelectedTrack({ ...track });
    setIsEditDialogOpen(true);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tracks</h1>
        <p className="text-gray-600 text-sm lg:text-base">Manage learning tracks and curriculums</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 lg:p-6 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> 
              <span className="hidden sm:inline">Create Track</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Track</DialogTitle>
              <DialogDescription>Add a new learning track to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Track Name</Label>
                <Input
                  id="name"
                  value={newTrack.name}
                  onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })}
                  placeholder="e.g. Frontend Development"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTrack.description}
                  onChange={(e) => setNewTrack({ ...newTrack, description: e.target.value })}
                  placeholder="Brief description of the track..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newTrack.isActive}
                  onCheckedChange={(checked) => setNewTrack({ ...newTrack, isActive: checked })}
                />
                <Label htmlFor="active">Active Status</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTrack} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Track"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="py-4 font-semibold text-gray-900">Track Name</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Mentors</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900">Students</TableHead>
              <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTracks.length > 0 ? (
              filteredTracks.map((track: any) => (
                <TableRow key={track._id} className="hover:bg-gray-50/50">
                  <TableCell className="py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{track.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[300px]">{track.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={track.isActive ? "default" : "secondary"} className={track.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                      {track.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {track.mentors?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      {track.students?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tracks/${track._id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(track)} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                  No tracks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="block lg:hidden space-y-4">
        {filteredTracks.map((track: any) => (
          <div key={track._id} className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{track.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{track.description}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tracks/${track._id}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(track)} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge variant={track.isActive ? "default" : "secondary"} className={track.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {track.isActive ? "Active" : "Inactive"}
              </Badge>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {track.mentors?.length || 0}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {track.students?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>Update track information.</DialogDescription>
          </DialogHeader>
          {selectedTrack && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Track Name</Label>
                <Input
                  id="edit-name"
                  value={selectedTrack.name}
                  onChange={(e) => setSelectedTrack({ ...selectedTrack, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTrack.description}
                  onChange={(e) => setSelectedTrack({ ...selectedTrack, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={selectedTrack.isActive}
                  onCheckedChange={(checked) => setSelectedTrack({ ...selectedTrack, isActive: checked })}
                />
                <Label htmlFor="edit-active">Active Status</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTrack} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Track"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
