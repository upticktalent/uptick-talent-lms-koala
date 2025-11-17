'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { lmsService } from '@/services/lmsService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate } from '@/utils/formatDate';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { 
    data: students, 
    loading, 
    error 
  } = useFetch(() => lmsService.getStudents());

  // Mock data for demonstration
  const mockStudents = [
    {
      _id: '1',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@student.com',
      isActive: true,
      track: { name: 'Frontend Development', slug: 'frontend' },
      cohort: { name: 'Cohort 2024-1' },
      progress: 85,
      joinedAt: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-11-15T10:30:00.000Z',
    },
    {
      _id: '2',
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@student.com',
      isActive: true,
      track: { name: 'Backend Development', slug: 'backend' },
      cohort: { name: 'Cohort 2024-1' },
      progress: 72,
      joinedAt: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-11-14T15:45:00.000Z',
    },
    {
      _id: '3',
      firstName: 'Charlie',
      lastName: 'Davis',
      email: 'charlie.davis@student.com',
      isActive: true,
      track: { name: 'Full Stack Development', slug: 'fullstack' },
      cohort: { name: 'Cohort 2024-1' },
      progress: 91,
      joinedAt: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-11-16T09:20:00.000Z',
    },
    {
      _id: '4',
      firstName: 'Diana',
      lastName: 'Miller',
      email: 'diana.miller@student.com',
      isActive: false,
      track: { name: 'Product Management', slug: 'product' },
      cohort: { name: 'Cohort 2024-1' },
      progress: 45,
      joinedAt: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-10-28T12:15:00.000Z',
    },
    {
      _id: '5',
      firstName: 'Eve',
      lastName: 'Wilson',
      email: 'eve.wilson@student.com',
      isActive: true,
      track: { name: 'UI/UX Design', slug: 'design' },
      cohort: { name: 'Cohort 2024-1' },
      progress: 68,
      joinedAt: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-11-16T14:30:00.000Z',
    },
  ];

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = !searchTerm || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.track.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && student.isActive) ||
      (statusFilter === 'inactive' && !student.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage all students in the system</p>
        </div>
        <Button>
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {mockStudents.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {mockStudents.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(mockStudents.reduce((acc, s) => acc + s.progress, 0) / mockStudents.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Average Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {mockStudents.filter(s => s.progress >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">High Performers</p>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No students found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student._id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {getInitials(student.firstName, student.lastName)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span>
                        <div>{student.email}</div>
                      </div>
                      <div>
                        <span className="font-medium">Track:</span>
                        <div>{student.track.name}</div>
                      </div>
                      <div>
                        <span className="font-medium">Cohort:</span>
                        <div>{student.cohort.name}</div>
                      </div>
                      <div>
                        <span className="font-medium">Joined:</span>
                        <div>{formatDate(student.joinedAt)}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{student.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/students/${student._id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/lms/track/${student.track.slug}/grades`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Grades
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full">
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
