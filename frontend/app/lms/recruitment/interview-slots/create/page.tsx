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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { interviewSlotService } from '@/services/interviewSlotService';
import { userService } from '@/services/userService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { RoleGuard } from '@/middleware/roleGuard';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Link as LinkIcon,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface BulkForm {
  cohortId: string;
  trackId: string;
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
  cohortId: string;
  trackId: string;
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
  const [activeTab, setActiveTab] = useState('bulk');

  const [bulkForm, setBulkForm] = useState<BulkForm>({
    cohortId: '',
    trackId: '',
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

  const [manualSlots, setManualSlots] = useState<ManualSlot[]>([
    {
      cohortId: '',
      trackId: '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      maxInterviews: 1,
      tracks: [],
      meetingLink: '',
    },
  ]);

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
        cohortId: '',
        trackId: '',
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
      if (activeTab === 'bulk') {
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

        // For manual slots, we'll need to create them individually or update the service
        for (const slot of manualSlots) {
          await interviewSlotService.createSlots({
            cohortId: slot.cohortId,
            trackId: slot.trackId,
            startDate: slot.date,
            endDate: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotDuration: 60, // default duration
            meetingLink: slot.meetingLink,
            notes: slot.notes,
          });
        }
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
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
          <Link href='/lms/recruitment/interview-slots'>
            <Button variant='ghost' size='sm' className='-ml-2'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 mb-6 bg-gray-200'>
            <TabsTrigger value='bulk'>Bulk Creation</TabsTrigger>
            <TabsTrigger value='manual'>Manual Creation</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value='bulk' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='w-5 h-5 text-primary' />
                    Date & Time Configuration
                  </CardTitle>
                  <CardDescription>
                    Define the date range and daily schedule for generating
                    slots
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='startDate'>Start Date *</Label>
                      <Input
                        type='date'
                        id='startDate'
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
                        id='endDate'
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

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='startTime'>Start Time *</Label>
                      <div className='relative'>
                        <Clock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                          type='time'
                          id='startTime'
                          name='startTime'
                          value={bulkForm.startTime}
                          onChange={handleBulkChange}
                          className='pl-9'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='endTime'>End Time *</Label>
                      <div className='relative'>
                        <Clock className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                          type='time'
                          id='endTime'
                          name='endTime'
                          value={bulkForm.endTime}
                          onChange={handleBulkChange}
                          className='pl-9'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='slotDuration'>
                        Slot Duration (minutes)
                      </Label>
                      <Input
                        type='number'
                        id='slotDuration'
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
                        id='maxInterviews'
                        name='maxInterviews'
                        value={bulkForm.maxInterviews}
                        onChange={handleBulkChange}
                        min={1}
                        max={10}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='w-5 h-5 text-primary' />
                    Details & Tracks
                  </CardTitle>
                  <CardDescription>
                    Assign tracks and meeting details
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-3'>
                    <Label>Applicable Tracks *</Label>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                      {tracks.map((track: any) => (
                        <div
                          key={track._id}
                          className='flex items-center space-x-2 border p-3 rounded-md hover:bg-slate-50 transition-colors'
                        >
                          <Checkbox
                            id={`track-${track._id}`}
                            checked={bulkForm.tracks.includes(track._id)}
                            onCheckedChange={(checked) =>
                              handleBulkTrackChange(
                                track._id,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={`track-${track._id}`}
                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full'
                          >
                            {track.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {bulkForm.tracks.length === 0 && (
                      <p className='text-sm text-red-500 font-medium'>
                        Please select at least one track
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='meetingLink'>Meeting Link</Label>
                    <div className='relative'>
                      <LinkIcon className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        type='url'
                        id='meetingLink'
                        name='meetingLink'
                        value={bulkForm.meetingLink}
                        onChange={handleBulkChange}
                        placeholder='https://meet.google.com/xxx-xxx-xxx'
                        className='pl-9'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notes (Optional)</Label>
                    <Textarea
                      id='notes'
                      name='notes'
                      value={bulkForm.notes}
                      onChange={handleBulkChange}
                      rows={3}
                      placeholder='Add any instructions for the candidate...'
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className='bg-slate-50 border-slate-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-medium text-slate-700'>
                    Summary Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
                    <div>
                      <div className='text-2xl font-bold text-slate-900'>
                        {bulkSlotsPreview.length}
                      </div>
                      <div className='text-sm text-slate-500'>
                        Slots will be created
                      </div>
                    </div>
                    {bulkSlotsPreview.length > 0 && (
                      <div className='text-sm text-slate-600 bg-white px-3 py-2 rounded-md border'>
                        First slot: {bulkSlotsPreview[0].date} at{' '}
                        {bulkSlotsPreview[0].startTime}
                      </div>
                    )}
                  </div>

                  {bulkSlotsPreview.length > 0 && (
                    <div className='max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar'>
                      {bulkSlotsPreview.map((s, i) => (
                        <div
                          key={i}
                          className='text-sm text-slate-600 flex justify-between border-b border-slate-100 last:border-0 py-1'
                        >
                          <span>{s.date}</span>
                          <span className='font-mono text-xs bg-slate-200 px-2 py-0.5 rounded'>
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='manual' className='space-y-6'>
              <div className='space-y-4'>
                {manualSlots.map((slot, index) => (
                  <Card key={index} className='relative overflow-hidden'>
                    <div className='absolute top-0 left-0 w-1 h-full bg-primary' />
                    <CardHeader className='pb-3 pt-4'>
                      <div className='flex justify-between items-center'>
                        <CardTitle className='text-base'>
                          Slot #{index + 1}
                        </CardTitle>
                        {manualSlots.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8'
                            onClick={() => removeManualSlot(index)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                          <Label>Date *</Label>
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
                        <div className='space-y-2'>
                          <Label>Start Time *</Label>
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
                        <div className='space-y-2'>
                          <Label>End Time *</Label>
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

                      <div className='space-y-3'>
                        <Label>Tracks *</Label>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                          {tracks.map((track: any) => (
                            <div
                              key={track._id}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={`manual-track-${index}-${track._id}`}
                                checked={slot.tracks.includes(track._id)}
                                onCheckedChange={(checked) =>
                                  handleManualTrackChange(
                                    index,
                                    track._id,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`manual-track-${index}-${track._id}`}
                                className='text-sm font-normal cursor-pointer'
                              >
                                {track.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='space-y-2'>
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
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type='button'
                  variant='default'
                  className='w-full py-6'
                  onClick={addManualSlot}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Another Slot
                </Button>
              </div>
            </TabsContent>

            {/* Footer Actions */}
            <div className='flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t mt-6'>
              <Link
                href='/lms/recruitment/interview-slots'
                className='w-full sm:w-auto'
              >
                <Button
                  type='button'
                  variant='outline'
                  className='w-full sm:w-auto'
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full sm:w-auto sm:ml-auto'
              >
                {isLoading
                  ? 'Creating Slots...'
                  : `Create ${activeTab === 'bulk' ? 'Bulk' : 'Manual'} Slots`}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
