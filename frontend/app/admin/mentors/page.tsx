/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  BookOpen,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useFetch } from "@/hooks/useFetch";
import { userService } from "@/services/userService";
import { trackService } from "@/services/trackService";
import { toast } from "sonner";
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
import Loader from "@/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignTracksOpen, setIsAssignTracksOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);

  // Form States
  const [newMentor, setNewMentor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    country: "",
    state: "",
    role: "mentor",
  });

  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  // Fetch Data
  const {
    data: mentorsData,
    loading,
    refetch,
  } = useFetch(userService.getMentors);

  const { data: tracksData } = useFetch(trackService.getTracks);
  const allTracks = tracksData?.tracks || [];

  const mentors = mentorsData || [];

  // Filter and Paginate
  const filteredMentors = mentors.filter(
    (mentor: any) =>
      mentor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredMentors.length;
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Create Mentor
  const handleCreateMentor = async () => {
    try {
      setIsCreating(true);
      if (!newMentor.firstName || !newMentor.lastName || !newMentor.email) {
        toast.error("Please fill in required fields");
        return;
      }

      await userService.createUser(newMentor);
      toast.success("Mentor created successfully");
      setIsCreateDialogOpen(false);
      setNewMentor({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        country: "",
        state: "",
        role: "mentor",
      });
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create mentor");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Mentor
  const handleDeleteMentor = async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast.success("Mentor deleted successfully");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete mentor");
    }
  };

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState<
    string | undefined
  >(undefined);
  const [confirmAction, setConfirmAction] = useState<
    (() => void | Promise<void>) | null
  >(null);

  const requestConfirm = (
    title: string,
    description: string | undefined,
    action: () => void | Promise<void>
  ) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  // Assign Tracks
  const handleAssignTracks = async () => {
    if (!selectedMentor) return;
    try {
      setIsAssigning(true);
      await userService.assignTracksToMentor(
        selectedMentor._id,
        selectedTracks
      );
      toast.success("Tracks assigned successfully");
      setIsAssignTracksOpen(false);
      setSelectedMentor(null);
      setSelectedTracks([]);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign tracks");
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignTracks = (mentor: any) => {
    setSelectedMentor(mentor);
    setSelectedTracks(mentor.assignedTracks?.map((t: any) => t._id) || []);
    setIsAssignTracksOpen(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mentors</h1>
          <p className="text-muted-foreground">
            Manage mentors and their track assignments.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Mentor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Mentor</DialogTitle>
              <DialogDescription>
                Create a new mentor account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={newMentor.firstName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={newMentor.lastName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newMentor.email}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newMentor.phoneNumber}
                    onChange={(e) =>
                      setNewMentor({
                        ...newMentor,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={newMentor.gender}
                    onValueChange={(val) =>
                      setNewMentor({ ...newMentor, gender: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={newMentor.country}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, country: e.target.value })
                    }
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateMentor} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Mentor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Assigned Tracks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMentors.length > 0 ? (
              paginatedMentors.map((mentor: any) => (
                <TableRow key={mentor._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>
                          {mentor.firstName?.[0]}
                          {mentor.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {mentor.firstName} {mentor.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {mentor.gender}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {mentor.email}
                      </div>
                      {mentor.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {mentor.phoneNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {mentor.country || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mentor.assignedTracks &&
                      mentor.assignedTracks.length > 0 ? (
                        mentor.assignedTracks.map((track: any) => (
                          <Badge
                            key={track._id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {track.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No tracks assigned
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openAssignTracks(mentor)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" /> Assign Tracks
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            requestConfirm(
                              "Delete mentor",
                              "Are you sure you want to delete this mentor?",
                              () => handleDeleteMentor(mentor._id)
                            )
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No mentors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={currentPage}
        total={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Assign Tracks Dialog */}
      <Dialog open={isAssignTracksOpen} onOpenChange={setIsAssignTracksOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tracks</DialogTitle>
            <DialogDescription>
              Select tracks to assign to {selectedMentor?.firstName}{" "}
              {selectedMentor?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Select Tracks</Label>
            <div className="grid grid-cols-2 gap-2">
              {allTracks.map((track: any) => (
                <div
                  key={track._id}
                  className="flex items-center space-x-2 border p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={`track-${track._id}`}
                    checked={selectedTracks.includes(track._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTracks([...selectedTracks, track._id]);
                      } else {
                        setSelectedTracks(
                          selectedTracks.filter((id) => id !== track._id)
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor={`track-${track._id}`}
                    className="cursor-pointer flex-1"
                  >
                    {track.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignTracksOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignTracks} disabled={isAssigning}>
              {isAssigning ? "Saving..." : "Save Assignments"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
        }}
      />
    </div>
  );
}
