'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lmsService } from '@/services/lmsService';
import { useFetch } from '@/hooks/useFetch';
import Loader from '@/components/Loader';
import { formatDate } from '@/utils/formatDate';
import { 
  Search, 
  MoreHorizontal, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Award,
  User,
  Flag,
  Ban,
  UserX
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
import { userService } from '@/services/userService';
import { trackService } from '@/services/trackService';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    country: '',
    state: '',
    trackId: '',
  });

  const {
    data: students,
    loading,
    error,
    refetch: refetchStudents
  } = useFetch(() => userService.getAllUsers());

  const { data: tracksData } = useFetch(() => trackService.getTracks());
  const tracks = tracksData?.tracks || [];

  const studentList = students?.users?.filter((user: { role: string; })=> user?.role === 'student');

  const filteredStudents = studentList?.filter((student: any) => {
    const matchesSearch =
      !searchTerm ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.track?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && student.isActive) ||
      (statusFilter === 'inactive' && !student.isActive);

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredStudents?.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents?.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await userService.createUser({
        ...newStudent,
        role: 'student',
        assignedTracks: newStudent.trackId ? [newStudent.trackId] : [],
      });
      
      toast.success('Student added successfully');
      setIsAddStudentOpen(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        country: '',
        state: '',
        trackId: '',
      });
      refetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  if (loading) {
    return <Loader />;
  }

  const stats = [
    { 
      label: 'Total Students', 
      value: studentList?.length, 
      icon: Users, 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Active Students', 
      value: studentList?.filter((s: any) => s.isActive).length, 
      icon: UserCheck, 
      color: 'bg-green-500', 
      bgColor: 'bg-green-50' 
    },
    { 
      label: 'Avg. Progress', 
      value: studentList?.length > 0 ? `${Math.round(studentList?.reduce((acc: number, s: any) => acc + (s.progress || 0), 0) / studentList?.length)}%` : '0%', 
      icon: TrendingUp, 
      color: 'bg-purple-500', 
      bgColor: 'bg-purple-50' 
    },
    { 
      label: 'High Performers', 
      value: studentList?.filter((s: any) => (s.progress || 0) >= 80).length, 
      icon: Award, 
      color: 'bg-orange-500', 
      bgColor: 'bg-orange-50' 
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Students</h1>
          <p className='text-gray-600'>Manage all students in the system</p>
        </div>
        
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details of the new student. They will receive an email with login credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newStudent.firstName}
                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newStudent.lastName}
                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newStudent.phoneNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newStudent.gender}
                    onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}
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
                  <Label htmlFor="track">Learning Track</Label>
                  <Select
                    value={newStudent.trackId}
                    onValueChange={(value) => setNewStudent({ ...newStudent, trackId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks.map((track: any) => (
                        <SelectItem key={track._id} value={track._id}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newStudent.country}
                    onChange={(e) => setNewStudent({ ...newStudent, country: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={newStudent.state}
                    onChange={(e) => setNewStudent({ ...newStudent, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1 relative'>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          <Input
            type='text'
            placeholder='Search students...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className='sm:w-48'>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Students</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden overflow-x-auto">
        {!paginatedStudents || paginatedStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No students found matching your criteria.</p>
          </div>
        ) : (
          <Table className="min-w-[800px]">
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-gray-900">Student</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Track</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900">Progress</TableHead>
                <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.map((student : any) => (
                <TableRow key={student._id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{student.track?.name || 'No Track'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        student.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="w-full max-w-[140px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{student.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(student.progress || 0)}`}
                          style={{ width: `${student.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] bg-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/admin/students/${student._id}`} className="w-full cursor-pointer">
                          <DropdownMenuItem className="cursor-pointer gap-2">
                            <User className="w-4 h-4" />
                            View Profile
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 text-orange-600 focus:text-orange-600">
                          <Flag className="w-4 h-4" />
                          Flag Student
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                          <Ban className="w-4 h-4" />
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                          <UserX className="w-4 h-4" />
                          Withdraw
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {filteredStudents?.length > 0 && (
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

