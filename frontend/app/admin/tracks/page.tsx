'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { trackService } from '@/services/trackService';
import { ITrack } from '@/types';
import { toast } from 'sonner';

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<ITrack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true,
  });

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response: any = await trackService.getTracks();
      console.log('Tracks response:', response);
      
      if (response.success && response.data?.tracks) {
        // Response format: { success: true, data: { tracks: [], pagination: {...} } }
        setTracks(response.data.tracks);
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to fetch tracks');
        setTracks([]);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Error fetching tracks');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrack = async () => {
    try {
      const response = await trackService.createTrack(formData);
      if (response.success) {
        toast.success('Track created successfully');
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          isActive: true,
        });
        fetchTracks();
      } else {
        toast.error(response.message || 'Failed to create track');
      }
    } catch (error) {
      console.error('Error creating track:', error);
      toast.error('Error creating track');
    }
  };

  const handleEditTrack = async () => {
    if (!selectedTrack) return;
    
    try {
      const response = await trackService.updateTrack(selectedTrack._id, formData);
      if (response.success) {
        toast.success('Track updated successfully');
        setIsEditDialogOpen(false);
        setSelectedTrack(null);
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          isActive: true,
        });
        fetchTracks();
      } else {
        toast.error(response.message || 'Failed to update track');
      }
    } catch (error) {
      console.error('Error updating track:', error);
      toast.error('Error updating track');
    }
  };

  const handleToggleActive = async (trackId: string, currentStatus: boolean) => {
    try {
      const response = await trackService.updateTrack(trackId, {
        isActive: !currentStatus,
      });
      if (response.success) {
        toast.success(`Track ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchTracks();
      } else {
        toast.error('Failed to update track status');
      }
    } catch (error) {
      console.error('Error updating track status:', error);
      toast.error('Error updating track status');
    }
  };

  const handleDeleteTrack = async (trackId: string, trackName: string) => {
    if (!confirm(`Are you sure you want to delete the track "${trackName}"?`)) {
      return;
    }
    
    try {
      const response = await trackService.deleteTrack(trackId);
      if (response.success) {
        toast.success('Track deleted successfully');
        fetchTracks();
      } else {
        toast.error(response.message || 'Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      toast.error('Error deleting track');
    }
  };

  const openEditDialog = (track: ITrack) => {
    setSelectedTrack(track);
    setFormData({
      name: track.name,
      description: track.description || '',
      color: track.color || '#3B82F6',
      isActive: track.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredTracks = tracks.filter((track) =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Tracks</h1>
          <p className="text-gray-600 mt-2">
            Manage learning tracks for the LMS platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Track
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Track</DialogTitle>
              <DialogDescription>
                Add a new learning track to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Track Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter track name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter track description"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTrack}>Create Track</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tracks</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.filter((track) => track.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Tracks</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.filter((track) => !track.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tracks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tracks</CardTitle>
          <CardDescription>
            {filteredTracks.length} of {tracks.length} tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Track</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTracks.map((track) => (
                <TableRow key={track._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: track.color }}
                      />
                      <div>
                        <p className="font-medium">{track.name}</p>
                        <p className="text-sm text-gray-500">Slug: {track.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate">
                      {track.description || 'No description'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={track.isActive ? 'default' : 'secondary'}>
                      {track.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {track.createdAt
                      ? new Date(track.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(track)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(track._id, track.isActive)}
                        >
                          {track.isActive ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTrack(track._id, track.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>
              Update the track information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Track Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter track name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter track description"
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedTrack(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTrack}>Update Track</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
