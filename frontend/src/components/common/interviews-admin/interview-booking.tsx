'use client';

import { useState, useMemo } from 'react';
import { Calendar, Plus, Clock, Users, Trash2, Eye, X, User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  avatar?: string;
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxParticipants: number;
  bookedParticipants: number;
  track: string;
  meetingType: 'virtual' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
  assignedMentors: Mentor[];
  createdAt: string;
}

const tracks = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Data Science',
  'Product Management',
  'UI/UX Design',
];

const availableMentors: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    expertise: ['Frontend Development', 'UI/UX Design'],
    avatar: '/avatars/sarah.jpg',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    expertise: ['Backend Development', 'Data Science'],
    avatar: '/avatars/mike.jpg',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    expertise: ['Mobile Development', 'Frontend Development'],
    avatar: '/avatars/emily.jpg',
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    email: 'alex.r@company.com',
    expertise: ['Product Management', 'Backend Development'],
    avatar: '/avatars/alex.jpg',
  },
  {
    id: '5',
    name: 'Priya Patel',
    email: 'priya.patel@company.com',
    expertise: ['Data Science', 'Product Management'],
    avatar: '/avatars/priya.jpg',
  },
];

export default function InterviewBooking() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [filterTrack, setFilterTrack] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [showAssignMentorModal, setShowAssignMentorModal] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    duration: 30,
    maxParticipants: 1,
    track: '',
    meetingType: 'virtual' as 'virtual' | 'in-person',
    meetingLink: '',
    location: '',
    notes: '',
  });

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const matchesTrack = filterTrack === 'All' ? true : slot.track === filterTrack;
      const matchesDate = filterDate ? slot.date === filterDate : true;
      return matchesTrack && matchesDate;
    });
  }, [slots, filterTrack, filterDate]);

  // Get available mentors for a specific slot (filtered by expertise)
  const getAvailableMentorsForSlot = (slot: TimeSlot) => {
    return availableMentors.filter(
      mentor =>
        mentor.expertise.includes(slot.track) &&
        !slot.assignedMentors.some(assigned => assigned.id === mentor.id),
    );
  };

  const handleCreateSlot = () => {
    if (!formData.date || !formData.track) {
      toast.error('Please fill in all required fields');
      return;
    }

    const hasDuplicateSlot = slots.some(slot => {
      const isSameDate = slot.date === formData.date;
      const isSameTrack = slot.track === formData.track;
      const isOverlappingTime =
        (formData.startTime >= slot.startTime && formData.startTime < slot.endTime) ||
        (formData.endTime > slot.startTime && formData.endTime <= slot.endTime) ||
        (formData.startTime <= slot.startTime && formData.endTime >= slot.endTime);

      return isSameDate && isSameTrack && isOverlappingTime;
    });

    if (hasDuplicateSlot) {
      toast.error('A slot already exists for this date, track, and time period');
      return;
    }

    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: formData.duration,
      maxParticipants: formData.maxParticipants,
      bookedParticipants: 0,
      track: formData.track,
      meetingType: formData.meetingType,
      meetingLink: formData.meetingLink,
      location: formData.location,
      notes: formData.notes,
      assignedMentors: [],
      createdAt: new Date().toISOString(),
    };

    setSlots(prev => [...prev, newSlot]);
    setShowCreateModal(false);
    resetForm();
    toast.success('Time slot created successfully!');
  };

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      duration: 30,
      maxParticipants: 1,
      track: '',
      meetingType: 'virtual',
      meetingLink: '',
      location: '',
      notes: '',
    });
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== id));
    toast.success('Time slot deleted successfully!');
  };

  const handleAssignMentor = (slotId: string, mentorId: string) => {
    const mentor = availableMentors.find(m => m.id === mentorId);
    if (!mentor) return;

    setSlots(prev =>
      prev.map(slot =>
        slot.id === slotId ? { ...slot, assignedMentors: [...slot.assignedMentors, mentor] } : slot,
      ),
    );

    setShowAssignMentorModal(null);
    toast.success(`Assigned ${mentor.name} to the slot`);
  };

  const handleRemoveMentor = (slotId: string, mentorId: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === slotId
          ? { ...slot, assignedMentors: slot.assignedMentors.filter(m => m.id !== mentorId) }
          : slot,
      ),
    );
    toast.success('Mentor removed from slot');
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (slot.bookedParticipants >= slot.maxParticipants) {
      return { status: 'full', color: 'destructive' as const };
    } else if (slot.bookedParticipants > 0) {
      return { status: 'partial', color: 'secondary' as const };
    } else {
      return { status: 'available', color: 'default' as const };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasActiveFilters = filterTrack !== 'All' || filterDate !== '';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700">
              Interview Slot Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Create and manage interview time slots for candidates
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Slot
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Slots</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{slots.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Available Slots</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {slots.filter(s => s.bookedParticipants === 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Booked Slots</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {slots.filter(s => s.bookedParticipants > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Mentors Assigned</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {slots.filter(s => s.assignedMentors.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
              {/* Track Filter */}
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="track-filter"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Filter by Track
                </Label>
                <Select value={filterTrack} onValueChange={setFilterTrack}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="All Tracks" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700 shadow-lg">
                    <SelectItem value="All" className="focus:bg-indigo-600">
                      All Tracks
                    </SelectItem>
                    {tracks.map(track => (
                      <SelectItem key={track} value={track} className="focus:bg-indigo-600">
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date Filter */}
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor="date-filter"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Filter by Date
                </Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  className="w-full bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>
              {/* Clear Button */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:gap-0">
                <Button
                  onClick={() => {
                    setFilterTrack('All');
                    setFilterDate('');
                  }}
                  disabled={!hasActiveFilters}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto lg:w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map(slot => {
            const status = getSlotStatus(slot);
            const availableMentors = getAvailableMentorsForSlot(slot);

            return (
              <Card
                key={slot.id}
                className="flex flex-col bg-white border border-gray-200 shadow-sm transition-shadow h-full"
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {formatDate(slot.date)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {slot.startTime} - {slot.endTime}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={status.color}
                      className={
                        status.color === 'destructive'
                          ? 'bg-red-100 text-red-800 hover:bg-red-100'
                          : status.color === 'secondary'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : 'bg-green-100 text-green-800 hover:bg-green-100'
                      }
                    >
                      {status.status === 'full' && 'Full'}
                      {status.status === 'partial' && 'Partial'}
                      {status.status === 'available' && 'Available'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Track:</span>
                      <span className="font-medium text-gray-900">{slot.track}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">{slot.duration} mins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participants:</span>
                      <span className="text-gray-900">
                        {slot.bookedParticipants}/{slot.maxParticipants}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <Badge variant="outline" className="text-gray-700 border-gray-300 capitalize">
                        {slot.meetingType}
                      </Badge>
                    </div>

                    {/* Assigned Mentors Section */}
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Mentors:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAssignMentorModal(slot.id)}
                          disabled={availableMentors.length === 0}
                          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                      {slot.assignedMentors.length > 0 ? (
                        <div className="space-y-2">
                          {slot.assignedMentors.map(mentor => (
                            <div
                              key={mentor.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={mentor.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {mentor.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium text-gray-900">{mentor.name}</p>
                                  <p className="text-xs text-gray-500">{mentor.email}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMentor(slot.id, mentor.id)}
                                className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">
                          No mentors assigned
                        </p>
                      )}
                    </div>

                    {slot.notes && (
                      <div className="text-sm text-gray-600 border-t pt-2">
                        <div className="font-medium text-gray-700 mb-1">Notes:</div>
                        <p className="text-xs">{slot.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSlots.length === 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No slots found</h3>
              <p className="text-gray-600 mb-4 text-sm">
                {slots.length === 0
                  ? 'Get started by creating your first interview slot.'
                  : 'No slots match your current filters.'}
              </p>
              {slots.length === 0 && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Slot
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Slot Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create Interview Slot</DialogTitle>
              <DialogDescription className="text-gray-600">
                Add a new time slot for candidate interviews
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Track */}
              <div className="space-y-2">
                <Label htmlFor="track" className="text-sm font-medium text-gray-700">
                  Track *
                </Label>
                <Select
                  value={formData.track}
                  onValueChange={value => setFormData({ ...formData, track: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700">
                    <SelectValue placeholder="Select track" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700">
                    {tracks.map(track => (
                      <SelectItem className="focus:bg-indigo-600" key={track} value={track}>
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Slot Duration (minutes) *
                </Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={value => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700">
                    <SelectItem className="focus:bg-indigo-600" value="15">
                      15 minutes
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="30">
                      30 minutes
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="45">
                      45 minutes
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="60">
                      60 minutes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <Label htmlFor="maxParticipants" className="text-sm font-medium text-gray-700">
                  Max Participants *
                </Label>
                <Select
                  value={formData.maxParticipants.toString()}
                  onValueChange={value =>
                    setFormData({ ...formData, maxParticipants: parseInt(value) })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700">
                    <SelectValue placeholder="Select max participants" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700">
                    <SelectItem className="focus:bg-indigo-600" value="1">
                      1 participant
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="2">
                      2 participants
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="3">
                      3 participants
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="5">
                      5 participants
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="10">
                      10 participants
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Type */}
              <div className="space-y-2">
                <Label htmlFor="meetingType" className="text-sm font-medium text-gray-700">
                  Meeting Type *
                </Label>
                <Select
                  value={formData.meetingType}
                  onValueChange={(value: 'virtual' | 'in-person') =>
                    setFormData({ ...formData, meetingType: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700">
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-700">
                    <SelectItem className="focus:bg-indigo-600" value="virtual">
                      Virtual
                    </SelectItem>
                    <SelectItem className="focus:bg-indigo-600" value="in-person">
                      In Person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meeting Link (conditional) */}
              {formData.meetingType === 'virtual' && (
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="meetingLink" className="text-sm font-medium text-gray-700">
                    Meeting Link
                  </Label>
                  <Input
                    id="meetingLink"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={formData.meetingLink}
                    onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="bg-white text-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Location (conditional) */}
              {formData.meetingType === 'in-person' && (
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Office location, room number, etc."
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="bg-white text-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes for candidates..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="bg-white text-gray-700 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSlot}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Create Slot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Mentor Modal */}
        <Dialog open={!!showAssignMentorModal} onOpenChange={() => setShowAssignMentorModal(null)}>
          <DialogContent className="max-w-md bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Assign Mentor</DialogTitle>
              <DialogDescription className="text-gray-600">
                Select a mentor to assign to this time slot
              </DialogDescription>
            </DialogHeader>
            {showAssignMentorModal && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {getAvailableMentorsForSlot(slots.find(s => s.id === showAssignMentorModal)!).map(
                    mentor => (
                      <div
                        key={mentor.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAssignMentor(showAssignMentorModal, mentor.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={mentor.avatar} />
                            <AvatarFallback className="text-sm">
                              {mentor.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-sm text-gray-500">{mentor.email}</p>
                            <div className="flex gap-1 mt-1">
                              {mentor.expertise.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <UserPlus className="w-4 h-4 text-gray-400" />
                      </div>
                    ),
                  )}
                </div>
                {getAvailableMentorsForSlot(slots.find(s => s.id === showAssignMentorModal)!)
                  .length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No available mentors for this track
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Slot Modal */}
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent className="max-w-md bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Slot Details</DialogTitle>
            </DialogHeader>
            {selectedSlot && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {/* ... (existing view modal content) ... */}

                  {/* Add mentors section to view modal */}
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Assigned Mentors:</span>
                    {selectedSlot.assignedMentors.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {selectedSlot.assignedMentors.map(mentor => (
                          <div
                            key={mentor.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={mentor.avatar} />
                              <AvatarFallback className="text-xs">
                                {mentor.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 text-xs">{mentor.name}</p>
                              <p className="text-gray-500 text-xs">{mentor.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">No mentors assigned</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
