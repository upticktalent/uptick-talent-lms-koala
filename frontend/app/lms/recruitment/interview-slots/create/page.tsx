'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { interviewSlotService } from '@/services/interviewSlotService';
import { userService } from '@/services/userService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { RoleGuard } from '@/middleware/roleGuard';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface BulkForm {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxInterviews: number;
  tracks: string[];
  meetingLink: string;
  notes?: string;
}

interface ManualSlot {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxInterviews: number;
  tracks: string[];
  meetingLink: string;
  notes?: string;
}

export default function CreateInterviewSlotsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'bulk' | 'manual'>('bulk');

  const [bulkForm, setBulkForm] = useState<BulkForm>({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 60,
    maxInterviews: 1,
    tracks: [],
    meetingLink: '',
    notes: '',
  });

  const [manualSlots, setManualSlots] = useState<ManualSlot[]>([]);

  // Fetch current user as interviewer
  const { data: usersData } = useFetch(() =>
    userService.getAllUsers({ role: ['mentor', 'admin'], isActive: true })
  );

  // Fetch tracks
  const { data: tracksData } = useFetch(() => trackService.getTracks());

  const interviewers = usersData?.users || [];
  const tracks = tracksData?.tracks || [];

  // Bulk form handlers
  const handleBulkChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBulkForm((prev) => ({
      ...prev,
      [name]:
        name === 'slotDuration' || name === 'maxInterviews'
          ? parseInt(value)
          : value,
    }));
  };

  const handleBulkTrackChange = (trackId: string, checked: boolean) => {
    setBulkForm((prev) => ({
      ...prev,
      tracks: checked
        ? [...prev.tracks, trackId]
        : prev.tracks.filter((id) => id !== trackId),
    }));
  };

  const handleManualTrackChange = (
    index: number,
    trackId: string,
    checked: boolean
  ) => {
    const updated = [...manualSlots];
    updated[index] = {
      ...updated[index],
      tracks: checked
        ? [...updated[index].tracks, trackId]
        : updated[index].tracks.filter((id) => id !== trackId),
    };
    setManualSlots(updated);
  };

  // Manual slots handlers
  const handleManualSlotChange = (
    index: number,
    field: keyof ManualSlot,
    value: string | number
  ) => {
    const updated = [...manualSlots];
    updated[index] = { ...updated[index], [field]: value };
    setManualSlots(updated);
  };

  const addManualSlot = () => {
    setManualSlots((prev) => [
      ...prev,
      {
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        maxInterviews: 1,
        tracks: [],
        meetingLink: '',
      },
    ]);
  };

  const removeManualSlot = (index: number) => {
    setManualSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateBulkSlots = () => {
    if (
      !bulkForm.startDate ||
      !bulkForm.endDate ||
      !bulkForm.startTime ||
      !bulkForm.endTime
    )
      return [];

    const slots: { date: string; startTime: string; endTime: string }[] = [];
    let currentDate = new Date(bulkForm.startDate);

    while (currentDate <= new Date(bulkForm.endDate)) {
      let cursor = new Date(`1970-01-01T${bulkForm.startTime}`);
      const endCursor = new Date(`1970-01-01T${bulkForm.endTime}`);

      while (cursor < endCursor) {
        const slotStart = cursor.toTimeString().slice(0, 5);
        cursor = new Date(cursor.getTime() + bulkForm.slotDuration * 60000);
        const slotEnd = cursor.toTimeString().slice(0, 5);

        slots.push({
          date: currentDate.toISOString().split('T')[0],
          startTime: slotStart,
          endTime: slotEnd,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'bulk') {
        const { startDate, endDate, startTime, endTime, tracks } = bulkForm;
        if (!startDate || !endDate || !startTime || !endTime) {
          toast.error('All bulk form fields are required');
          return;
        }
        if (tracks.length === 0) {
          toast.error('Please select at least one track');
          return;
        }

        await interviewSlotService.createSlots({
          mode: 'bulk',
          ...bulkForm,
        });
        toast.success('Bulk interview slots created successfully!');
      } else {
        if (manualSlots.length === 0) {
          toast.error('Add at least one manual slot');
          return;
        }

        // Validate manual slots
        const invalidSlots = manualSlots.filter(
          (slot) =>
            !slot.date ||
            !slot.startTime ||
            !slot.endTime ||
            slot.tracks.length === 0
        );
        if (invalidSlots.length > 0) {
          toast.error(
            'Please fill all required fields and select tracks for all slots'
          );
          return;
        }

        await interviewSlotService.createSlots({
          mode: 'manual',
          slots: manualSlots,
        });
        toast.success('Manual interview slots created successfully!');
      }

      router.push('/lms/recruitment/interview-slots');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create slots');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkSlotsPreview = calculateBulkSlots();

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='max-w-3xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/lms/recruitment/interview-slots'>
            <Button variant='secondary' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Slots
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Create Interview Slots
            </h1>
            <p className='text-gray-600'>
              Set up available time slots for interviews
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className='flex gap-4'>
          <Button
            variant={mode === 'bulk' ? 'primary' : 'secondary'}
            onClick={() => setMode('bulk')}
          >
            Bulk
          </Button>
          <Button
            variant={mode === 'manual' ? 'primary' : 'secondary'}
            onClick={() => setMode('manual')}
          >
            Manual
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              Schedule Configuration
            </CardTitle>
            <CardDescription>
              Define when and how interviews can be scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {mode === 'bulk' && (
                <>
                  {/* Bulk Inputs */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='startDate'>Start Date *</Label>
                      <Input
                        type='date'
                        name='startDate'
                        value={bulkForm.startDate}
                        onChange={handleBulkChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='endDate'>End Date *</Label>
                      <Input
                        type='date'
                        name='endDate'
                        value={bulkForm.endDate}
                        onChange={handleBulkChange}
                        min={
                          bulkForm.startDate ||
                          new Date().toISOString().split('T')[0]
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='startTime'>Start Time *</Label>
                      <Input
                        type='time'
                        name='startTime'
                        value={bulkForm.startTime}
                        onChange={handleBulkChange}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='endTime'>End Time *</Label>
                      <Input
                        type='time'
                        name='endTime'
                        value={bulkForm.endTime}
                        onChange={handleBulkChange}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='slotDuration'>Slot Duration</Label>
                      <Input
                        type='number'
                        name='slotDuration'
                        value={bulkForm.slotDuration}
                        onChange={handleBulkChange}
                        min={15}
                        max={240}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='maxInterviews'>
                        Max Interviews per Slot
                      </Label>
                      <Input
                        type='number'
                        name='maxInterviews'
                        value={bulkForm.maxInterviews}
                        onChange={handleBulkChange}
                        min={1}
                        max={10}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Tracks *</Label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                      {tracks.map((track: any) => (
                        <label
                          key={track._id}
                          className='flex items-center space-x-2'
                        >
                          <input
                            type='checkbox'
                            checked={bulkForm.tracks.includes(track._id)}
                            onChange={(e) =>
                              handleBulkTrackChange(track._id, e.target.checked)
                            }
                            className='rounded border-gray-300'
                          />
                          <span className='text-sm'>{track.name}</span>
                        </label>
                      ))}
                    </div>
                    {bulkForm.tracks.length === 0 && (
                      <p className='text-sm text-red-600'>
                        Please select at least one track
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='meetingLink'>Meeting Link</Label>
                      <Input
                        type='url'
                        name='meetingLink'
                        value={bulkForm.meetingLink}
                        onChange={handleBulkChange}
                        placeholder='https://meet.google.com/xxx-xxx-xxx'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notes (Optional)</Label>
                    <Textarea
                      name='notes'
                      value={bulkForm.notes}
                      onChange={handleBulkChange}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {mode === 'manual' && (
                <div className='space-y-4'>
                  {manualSlots.map((slot, index) => (
                    <div
                      key={index}
                      className='border p-4 rounded-lg space-y-4'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type='date'
                            value={slot.date}
                            onChange={(e) =>
                              handleManualSlotChange(
                                index,
                                'date',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Start Time</Label>
                          <Input
                            type='time'
                            value={slot.startTime}
                            onChange={(e) =>
                              handleManualSlotChange(
                                index,
                                'startTime',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>End Time</Label>
                          <Input
                            type='time'
                            value={slot.endTime}
                            onChange={(e) =>
                              handleManualSlotChange(
                                index,
                                'endTime',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Tracks *</Label>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mt-2'>
                          {tracks.map((track: any) => (
                            <label
                              key={track._id}
                              className='flex items-center space-x-2'
                            >
                              <input
                                type='checkbox'
                                checked={slot.tracks.includes(track._id)}
                                onChange={(e) =>
                                  handleManualTrackChange(
                                    index,
                                    track._id,
                                    e.target.checked
                                  )
                                }
                                className='rounded border-gray-300'
                              />
                              <span className='text-sm'>{track.name}</span>
                            </label>
                          ))}
                        </div>
                        {slot.tracks.length === 0 && (
                          <p className='text-sm text-red-600'>
                            Please select at least one track
                          </p>
                        )}
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <Label>Meeting Link</Label>
                          <Input
                            type='url'
                            value={slot.meetingLink || ''}
                            onChange={(e) =>
                              handleManualSlotChange(
                                index,
                                'meetingLink',
                                e.target.value
                              )
                            }
                            placeholder='https://meet.google.com/xxx-xxx-xxx'
                          />
                        </div>
                      </div>

                      <div className='flex justify-end'>
                        <Button
                          type='button'
                          variant='danger'
                          onClick={() => removeManualSlot(index)}
                        >
                          Remove Slot
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button type='button' onClick={addManualSlot}>
                    Add Slot
                  </Button>
                </div>
              )}

              {/* Preview */}
              <div className='p-4 bg-blue-50 rounded-lg max-h-80 overflow-auto'>
                <h4 className='font-medium text-blue-900 mb-2'>Preview</h4>
                <div className='text-sm text-blue-800 space-y-1'>
                  {mode === 'bulk' &&
                    bulkSlotsPreview.map((s, i) => (
                      <p key={i}>
                        {s.date} - {s.startTime} to {s.endTime}
                      </p>
                    ))}
                  {mode === 'manual' &&
                    manualSlots.map((s, i) => (
                      <p key={i}>
                        {s.date} - {s.startTime} to {s.endTime}
                      </p>
                    ))}
                  <p className='mt-2 font-semibold'>
                    Total slots to be created:{' '}
                    {mode === 'bulk'
                      ? bulkSlotsPreview.length
                      : manualSlots.length}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <Button type='submit' disabled={isLoading} className='flex-1'>
                  {isLoading ? 'Creating Slots...' : 'Create Slots'}
                </Button>
                <Link href='/lms/recruitment/interview-slots'>
                  <Button type='button' variant='secondary' className='px-8'>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
