'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { interviewSlotService } from '@/services/interviewSlotService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { RoleGuard } from '@/middleware/roleGuard';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EditForm {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxInterviews: number;
  tracks: string[];
  meetingLink: string;
  notes?: string;
  isAvailable: boolean;
}

export default function EditInterviewSlotPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditForm>({
    date: '',
    startTime: '',
    endTime: '',
    duration: 30,
    maxInterviews: 1,
    tracks: [],
    meetingLink: '',
    notes: '',
    isAvailable: true,
  });

  // Fetch slot data
  const {
    data: slotData,
    loading: slotLoading,
    error: slotError,
  } = useFetch(() => interviewSlotService.getSlot(params.id));

  // Fetch tracks
  const { data: tracksData, loading: tracksLoading } = useFetch(() =>
    trackService.getActiveTracks()
  );

  const slot = slotData?.slot;
  const tracks = tracksData?.tracks || tracksData || [];

  useEffect(() => {
    if (slot) {
      setFormData({
        date: slot.date ? new Date(slot.date).toISOString().split('T')[0] : '',
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        duration: slot.duration || 30,
        maxInterviews: slot.maxInterviews || 1,
        tracks: slot.tracks?.map((track: any) => track._id) || [],
        meetingLink: slot.meetingLink || '',
        notes: slot.notes || '',
        isAvailable: slot.isAvailable !== false,
      });
    }
  }, [slot]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleTrackChange = (trackId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tracks: checked
        ? [...prev.tracks, trackId]
        : prev.tracks.filter((id) => id !== trackId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.meetingLink
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.tracks.length === 0) {
      toast.error('Please select at least one track');
      return;
    }

    // Validate time range
    const startTime = new Date(`1970-01-01T${formData.startTime}`);
    const endTime = new Date(`1970-01-01T${formData.endTime}`);
    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        maxInterviews: formData.maxInterviews,
        tracks: formData.tracks,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        isAvailable: formData.isAvailable,
      };

      await interviewSlotService.updateSlot(params.id, updateData);
      toast.success('Interview slot updated successfully!');
      router.push(`/lms/recruitment/interview-slots/${params.id}`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update interview slot'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (slotLoading || tracksLoading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading interview slot...</div>
      </div>
    );
  }

  if (slotError || !slot) {
    return (
      <div className='text-center text-red-600'>
        Interview slot not found or failed to load
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href={`/lms/recruitment/interview-slots`}>
            <Button variant='secondary' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Details
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set the date, time, and duration for the interview slot
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='date'>
                    Date <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='date'
                    name='date'
                    type='date'
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor='startTime'>
                    Start Time <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='startTime'
                    name='startTime'
                    type='time'
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='endTime'>
                    End Time <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='endTime'
                    name='endTime'
                    type='time'
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='duration'>Duration (minutes)</Label>
                  <Input
                    id='duration'
                    name='duration'
                    type='number'
                    value={formData.duration}
                    onChange={handleInputChange}
                    min={15}
                    max={120}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Duration for each individual interview
                  </p>
                </div>

                <div>
                  <Label htmlFor='maxInterviews'>Max Interviews</Label>
                  <Input
                    id='maxInterviews'
                    name='maxInterviews'
                    type='number'
                    value={formData.maxInterviews}
                    onChange={handleInputChange}
                    min={1}
                    max={10}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Number of interviews that can be scheduled in this slot
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Track Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Track Availability</CardTitle>
              <CardDescription>
                Select which tracks this interview slot is available for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                {Array.isArray(tracks) && tracks.length > 0 ? (
                  tracks.map((track: any) => (
                    <div
                      key={track._id}
                      className='flex items-center space-x-2 p-3 border rounded-md'
                    >
                      <Checkbox
                        id={`track-${track._id}`}
                        checked={formData.tracks.includes(track._id)}
                        onCheckedChange={(checked) =>
                          handleTrackChange(track._id, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`track-${track._id}`}
                        className='cursor-pointer flex-1'
                      >
                        <div>
                          <div className='font-medium'>{track.name}</div>
                          {track.description && (
                            <div className='text-sm text-gray-500'>
                              {track.description}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 col-span-full'>
                    No tracks available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meeting Details */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                Set the meeting link and other details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='meetingLink'>Meeting Link</Label>
                <Input
                  id='meetingLink'
                  name='meetingLink'
                  type='url'
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder='https://meet.google.com/xxx-xxx-xxx'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Default meeting link for online interviews
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
              <CardDescription>
                Optional notes and availability settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='notes'>Notes (Optional)</Label>
                <Textarea
                  id='notes'
                  name='notes'
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder='Any special instructions or notes for this interview slot...'
                  rows={3}
                  maxLength={500}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  {formData.notes?.length || 0}/500 characters
                </p>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='isAvailable'
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isAvailable: !!checked }))
                  }
                />
                <Label htmlFor='isAvailable' className='cursor-pointer'>
                  Available for booking
                </Label>
                <p className='text-xs text-gray-500'>
                  Uncheck to temporarily disable this slot
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex gap-3'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Update Slot
                </>
              )}
            </Button>

            <Link href={`/lms/recruitment/interview-slots/${params.id}`}>
              <Button type='button' variant='secondary'>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
