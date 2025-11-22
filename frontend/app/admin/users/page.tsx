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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Users,
  GraduationCap,
  Shield,
  Key,
  Mail,
} from 'lucide-react';
import { userService } from '@/services/userService';
import { cohortService } from '@/services/cohortService';
import { trackService } from '@/services/trackService';
import { IUser, ICohort, ITrack, ApiResponse } from '@/types';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [cohorts, setCohorts] = useState<ICohort[]>([]);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'male' as 'male' | 'female',
    country: '',
    state: '',
    role: 'mentor' as 'mentor' | 'admin',
    mentorAssignments: [] as { cohort: string; tracks: string[] }[],
  });

  useEffect(() => {
    fetchUsers();
    fetchCohorts();
    fetchTracks();
  }, []);

  const fetchUsers = async () => {
    try {
      const response: any = await userService.getAllUsers();
      console.log('Users response:', response);
      if (response.success) {
        // getAllUsers returns { success: true, data: { users: [], total: number } }
        setUsers(response.data?.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const response: any = await cohortService.getCohorts();
      if (response.success) {
        setCohorts(response.data.cohorts || []);
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchTracks = async () => {
    try {
      const response: any = await trackService.getTracks();
      console.log('Tracks response:', response);
      if (response.success) {
        // getTracks returns { success: true, data: { tracks: [], pagination: {...} } }
        setTracks(response.data?.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await userService.createUser(formData);
      if (response.success && response.data) {
        toast.success(
          `User created successfully. A welcome email has been sent with login credentials.`
        );
        setCreateDialogOpen(false);
        resetForm();
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response: ApiResponse<IUser> = await userService.updateUser(
        editingUser._id,
        formData
      );
      if (response.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        resetForm();
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response: ApiResponse<IUser> = await userService.toggleUserStatus(
        userId
      );
      if (response.success) {
        toast.success('User status updated');
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error updating user status'
      );
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await userService.resetUserPassword(userId);
      if (response.success && response.data) {
        toast.success(
          `Password reset successfully. New password: ${response.data.generatedPassword}`
        );
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error resetting password');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: 'male',
      country: '',
      state: '',
      role: 'mentor',
      mentorAssignments: [],
    });
  };

  const openEditDialog = (user: IUser) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      country: user.country,
      state: user.state,
      role: user.role as 'mentor' | 'admin',
      mentorAssignments: user.mentorAssignments || [],
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mentor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className='h-4 w-4' />;
      case 'mentor':
        return <UserCheck className='h-4 w-4' />;
      case 'student':
        return <GraduationCap className='h-4 w-4' />;
      default:
        return <Users className='h-4 w-4' />;
    }
  };

  const getFilteredUsers = () => {
    console.log(users);
    
    let filtered = users;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((user) => user.role === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role (additional filter)
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Users</h1>
          <p className='text-muted-foreground'>
            Manage users, mentors, and administrators
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className='h-4 w-4 mr-2' />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account (mentor or admin).
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder='John'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder='Doe'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder='john@example.com'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='phoneNumber'>Phone Number</Label>
                  <Input
                    id='phoneNumber'
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder='+1234567890'
                  />
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='gender'>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female') =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Male</SelectItem>
                      <SelectItem value='female'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='country'>Country</Label>
                  <Input
                    id='country'
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder='Nigeria'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='state'>State</Label>
                  <Input
                    id='state'
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder='Lagos'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'mentor' | 'admin') =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mentor'>Mentor</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Admins</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {users.filter((u) => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mentors</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {users.filter((u) => u.role === 'mentor').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Students</CardTitle>
            <GraduationCap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {users.filter((u) => u.role === 'student').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className='flex gap-4'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search users...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by role' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            <SelectItem value='admin'>Admin</SelectItem>
            <SelectItem value='mentor'>Mentor</SelectItem>
            <SelectItem value='student'>Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='all'>All Users</TabsTrigger>
          <TabsTrigger value='admin'>Admins</TabsTrigger>
          <TabsTrigger value='mentor'>Mentors</TabsTrigger>
          <TabsTrigger value='student'>Students</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className='mt-6'>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-center py-8 text-muted-foreground'
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleColor(
                            user.role
                          )} flex items-center gap-1 w-fit`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <div>
                            {user.state}, {user.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user._id)}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className='mr-2 h-4 w-4' />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className='mr-2 h-4 w-4' />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user._id)}
                            >
                              <Key className='mr-2 h-4 w-4' />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-firstName'>First Name</Label>
                <Input
                  id='edit-firstName'
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-lastName'>Last Name</Label>
                <Input
                  id='edit-lastName'
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-email'>Email</Label>
                <Input
                  id='edit-email'
                  type='email'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-phoneNumber'>Phone Number</Label>
                <Input
                  id='edit-phoneNumber'
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-gender'>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female') =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-country'>Country</Label>
                <Input
                  id='edit-country'
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      country: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-state'>State</Label>
                <Input
                  id='edit-state'
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-role'>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'mentor' | 'admin') =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mentor'>Mentor</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
