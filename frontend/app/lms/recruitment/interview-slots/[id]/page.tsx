'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { interviewSlotService } from '@/services/interviewSlotService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/Loader';

export default function InterviewSlotDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, error, refetch } = useFetch(() =>
    interviewSlotService.getSlot(params.id)
  );
  const slot = data?.slot;

  const getAvailabilityColor = (slot: any) => {
    if (!slot.isAvailable) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (slot.bookedCount >= slot.maxInterviews)
      return 'bg-red-50 text-red-700 border-red-200';
    if (slot.bookedCount > 0) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getAvailabilityText = (slot: any) => {
    if (!slot.isAvailable) return 'Unavailable';
    if (slot.bookedCount >= slot.maxInterviews) return 'Fully Booked';
    if (slot.bookedCount > 0) return 'Partially Booked';
    return 'Available';
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this interview slot? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await interviewSlotService.deleteSlot(params.id);
      toast.success('Interview slot deleted successfully!');
      router.push('/lms/recruitment/interview-slots');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to delete interview slot'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await interviewSlotService.updateSlot(params.id, {
        isAvailable: !slot.isAvailable,
      });
      toast.success(
        `Interview slot ${
          slot.isAvailable ? 'disabled' : 'enabled'
        } successfully!`
      );
      refetch();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update interview slot'
      );
    }
  };

  if (loading) {
    return (
      <Loader/>
    );
  }

  if (error || !slot) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className="bg-red-50 p-4 rounded-full">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className='text-center'>
          <h3 className="text-lg font-semibold text-gray-900">Slot Not Found</h3>
          <p className="text-muted-foreground">The interview slot you are looking for does not exist or failed to load.</p>
        </div>
        <Link href="/lms/recruitment/interview-slots">
          <Button variant="outline">Return to Slots</Button>
        </Link>
      </div>
    );
  }

  const slotDurationMinutes = Math.floor(
    (new Date(`1970-01-01T${slot.endTime}`).getTime() -
      new Date(`1970-01-01T${slot.startTime}`).getTime()) /
      (1000 * 60)
  );

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='max-w-5xl mx-auto space-y-8 pb-10'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
          <div className="space-y-1">
            <Link href='/lms/recruitment/interview-slots' className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
              <ArrowLeft className='w-4 h-4 mr-1' />
              Back to Slots
            </Link>
            <div className="flex items-center gap-3">
              <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
                Interview Slot Details
              </h1>
              <Badge variant="outline" className={`${getAvailabilityColor(slot)} border`}>
                {getAvailabilityText(slot)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(slot.date)}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-4 h-4" />
              <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Link href={`/lms/recruitment/interview-slots/${params.id}/edit`}>
              <Button variant='outline' size="sm">
                <Edit className='w-4 h-4 mr-2' />
                Edit
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {slot.isAvailable ? 'Disable Slot' : 'Enable Slot'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  disabled={isDeleting || slot.bookedCount > 0}
                >
                  Delete Slot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slot Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{slotDurationMinutes} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{slot.bookedCount} / {slot.maxInterviews}</span>
                      <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${(slot.bookedCount / slot.maxInterviews) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Interview Type</p>
                    <p className="font-medium capitalize">{slot.interviewType || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {slot.isAvailable ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-medium">{slot.isAvailable ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booked Interviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Scheduled Interviews</CardTitle>
                  <CardDescription>Candidates booked for this time slot</CardDescription>
                </div>
                <Badge variant="secondary">{slot.interviews?.length || 0} Booked</Badge>
              </CardHeader>
              <CardContent>
                {slot.interviews && slot.interviews.length > 0 ? (
                  <div className="space-y-4">
                    {slot.interviews.map((interview: any) => (
                      <div
                        key={interview._id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-slate-500 font-medium">
                            {interview.applicationId?.firstName?.[0]}{interview.applicationId?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {interview.applicationId?.firstName} {interview.applicationId?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {interview.applicationId?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize bg-white">
                            {interview.status}
                          </Badge>
                          <Link href={`/lms/recruitment/interviews/${interview._id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No interviews scheduled yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Interviewer Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Interviewer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {slot.interviewer?.firstName?.[0]}{slot.interviewer?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {slot.interviewer?.firstName} {slot.interviewer?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {slot.interviewer?.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-gray-700 truncate">{slot.interviewer?.email}</span>
                  </div>
                  {slot.interviewer?.phoneNumber && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-gray-700">{slot.interviewer.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracks Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  Target Tracks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slot.tracks && slot.tracks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {slot.tracks.map((track: any) => (
                      <Badge key={track._id} variant="secondary" className="font-normal">
                        {track.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No specific tracks assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            {slot.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 bg-amber-50/50 p-3 rounded-md border border-amber-100">
                    {slot.notes}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground space-y-1 px-1">
              <p>Created: {formatDate(slot.createdAt)}</p>
              {slot.updatedAt !== slot.createdAt && (
                <p>Updated: {formatDate(slot.updatedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
