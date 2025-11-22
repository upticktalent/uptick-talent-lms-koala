'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  Plus,
  MessageSquare,
  Heart,
  ThumbsUp,
  HelpCircle,
  Calendar,
  FileText,
  Video,
  Link,
  Upload,
  Send,
  Edit,
  Trash2,
} from 'lucide-react';
import { streamService } from '@/services/streamService';
import { taskService } from '@/services/taskService';
import { cohortService } from '@/services/cohortService';
import { trackService } from '@/services/trackService';
import { applicationService } from '@/services/applicationService';
import { useUser } from '@/hooks/useUser';
import { IStream, ITask, ICohort, ITrack, ApiResponse } from '@/types';
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import { CustomPagination } from '@/components/shared/CustomPagination';

export default function LMSDashboard() {
  const { user } = useUser();
  const [streams, setStreams] = useState<IStream[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [currentCohort, setCurrentCohort] = useState<ICohort | null>(null);
  const [userTracks, setUserTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [recruitmentData, setRecruitmentData] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [activeTab, setActiveTab] = useState('streams');

  // Pagination state
  const [streamsPagination, setStreamsPagination] = useState<any>(null);
  const [tasksPagination, setTasksPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stream creation
  const [createStreamOpen, setCreateStreamOpen] = useState(false);
  const [streamFormData, setStreamFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as 'announcement' | 'lesson' | 'update',
    scheduledFor: '',
  });

  // Task creation
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    type: 'assignment' as 'assignment' | 'project' | 'quiz' | 'reading',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: 1,
    maxScore: 100,
    dueDate: '',
    requirements: [] as string[],
    allowLateSubmissions: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedTrack && currentCohort) {
      // Reset pagination when track changes
      setCurrentPage(1);
      setStreamsPagination(null);
      setTasksPagination(null);
      fetchStreams(1);
      fetchTasks(1);
    }
  }, [selectedTrack, currentCohort]);

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      // Get current active cohort
      const cohortResponse: any = await cohortService.getCurrentActiveCohort();
      console.log(cohortResponse);
      if (cohortResponse.success && cohortResponse.data) {
        setCurrentCohort(cohortResponse.data);
      }

      // Get user's tracks based on role
      if (user.role === 'mentor') {
        const tracksResponse: any = await trackService.getMentorTracks();
        if (tracksResponse.success) {
          setUserTracks(tracksResponse.data || []);
          if (tracksResponse.data && tracksResponse.data.length > 0) {
            setSelectedTrack(tracksResponse.data[0]._id);
          }
        }
      } else if (user.role === 'student' && user.studentTrack) {
        const trackResponse: ApiResponse<ITrack> =
          await trackService.getTrackById(user.studentTrack);
        if (trackResponse.success && trackResponse.data) {
          setUserTracks([trackResponse.data]);
          setSelectedTrack(trackResponse.data._id);
        }
      } else if (user.role === 'admin') {
        const tracksResponse: ApiResponse<ITrack[]> =
          await trackService.getActiveTracks();
        if (tracksResponse.success) {
          setUserTracks(tracksResponse.data || []);
          if (tracksResponse.data && tracksResponse.data.length > 0) {
            setSelectedTrack(tracksResponse.data[0]._id);
          }
        }
      }

      // Fetch recruitment data for current cohort (admin and mentor only)
      if (
        (user.role === 'admin' || user.role === 'mentor') &&
        cohortResponse.success
      ) {
        try {
          const applicationsResponse = await applicationService.getApplications(
            {
              cohort: cohortResponse.data?._id,
            }
          );

          if (
            applicationsResponse.success &&
            applicationsResponse.data?.applications
          ) {
            const applications = applicationsResponse.data.applications;
            setRecruitmentData({
              totalApplications: applications.length,
              pendingApplications: applications.filter(
                (app: any) => app.status === 'pending'
              ).length,
              shortlistedApplications: applications.filter(
                (app: any) => app.status === 'shortlisted'
              ).length,
              acceptedApplications: applications.filter(
                (app: any) => app.status === 'accepted'
              ).length,
              rejectedApplications: applications.filter(
                (app: any) => app.status === 'rejected'
              ).length,
            });
          }
        } catch (recruitmentError) {
          console.error('Error fetching recruitment data:', recruitmentError);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreams = async (page = currentPage) => {
    if (!currentCohort || !selectedTrack) return;

    try {
      const response: ApiResponse<{ streams: IStream[]; pagination: any }> =
        await streamService.getStreams(
          currentCohort._id,
          selectedTrack,
          page,
          pageSize
        );
      if (response.success && response.data) {
        setStreams(response.data.streams || []);
        setStreamsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  const fetchTasks = async (page = currentPage) => {
    if (!currentCohort || !selectedTrack) return;

    try {
      const response: ApiResponse<{ tasks: ITask[]; pagination: any }> =
        await taskService.getTasks(
          currentCohort._id,
          selectedTrack,
          page,
          pageSize
        );
      if (response.success && response.data) {
        setTasks(response.data.tasks || []);
        setTasksPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (activeTab === 'streams') {
      fetchStreams(newPage);
    } else if (activeTab === 'tasks') {
      fetchTasks(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (activeTab === 'streams') {
      fetchStreams(1);
    } else if (activeTab === 'tasks') {
      fetchTasks(1);
    }
  };

  const handleCreateStream = async () => {
    if (!currentCohort || !selectedTrack) return;

    try {
      const response: ApiResponse<IStream> = await streamService.createStream({
        cohortId: currentCohort._id,
        trackId: selectedTrack,
        ...streamFormData,
      });

      if (response.success) {
        toast.success('Stream created successfully');
        setCreateStreamOpen(false);
        resetStreamForm();
        fetchStreams();
      } else {
        toast.error(response.message || 'Failed to create stream');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating stream');
    }
  };

  const handleCreateTask = async () => {
    if (!currentCohort || !selectedTrack) return;

    try {
      const response: ApiResponse<ITask> = await taskService.createTask({
        cohortId: currentCohort._id,
        trackId: selectedTrack,
        ...taskFormData,
      });

      if (response.success) {
        toast.success('Task created successfully');
        setCreateTaskOpen(false);
        resetTaskForm();
        fetchTasks();
      } else {
        toast.error(response.message || 'Failed to create task');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleAddReaction = async (
    streamId: string,
    type: 'like' | 'love' | 'helpful' | 'confused'
  ) => {
    try {
      await streamService.addReaction(streamId, type);
      fetchStreams(); // Refresh to show updated reactions
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const resetStreamForm = () => {
    setStreamFormData({
      title: '',
      content: '',
      type: 'announcement',
      scheduledFor: '',
    });
  };

  const resetTaskForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      type: 'assignment',
      difficulty: 'beginner',
      estimatedHours: 1,
      maxScore: 100,
      dueDate: '',
      requirements: [],
      allowLateSubmissions: true,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'lesson':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'project':
        return 'bg-red-100 text-red-800';
      case 'quiz':
        return 'bg-yellow-100 text-yellow-800';
      case 'reading':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateContent = user?.role === 'mentor' || user?.role === 'admin';

  if (loading) {
    return <Loader />;
  }

  if (!currentCohort) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <h3 className='text-lg font-medium'>No Active Cohort</h3>
          <p className='text-muted-foreground'>
            There is no currently active cohort.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Learning Management System
          </h1>
          <p className='text-muted-foreground'>
            {currentCohort.name} - Track-based content and assignments
          </p>
        </div>
        <div className='flex gap-2'>
          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select track' />
            </SelectTrigger>
            <SelectContent>
              {userTracks.map((track) => (
                <SelectItem key={track._id} value={track._id}>
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        {user?.role === 'admin' || user?.role === 'mentor' ? (
          <>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Applications
                </CardTitle>
                <FileText className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {recruitmentData.totalApplications}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Total for this cohort
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Pending</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {recruitmentData.pendingApplications}
                </div>
                <p className='text-xs text-muted-foreground'>Awaiting review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Shortlisted
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {recruitmentData.shortlistedApplications}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Ready for assessment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Accepted</CardTitle>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {recruitmentData.acceptedApplications}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Enrolled students
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Active Streams
                </CardTitle>
                <Play className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{streams.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Tasks
                </CardTitle>
                <BookOpen className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{tasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Due Soon</CardTitle>
                <Clock className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    tasks.filter((task) => {
                      const dueDate = new Date(task.dueDate);
                      const now = new Date();
                      const diffTime = dueDate.getTime() - now.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      return diffDays <= 7 && diffDays > 0;
                    }).length
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Completed</CardTitle>
                <CheckCircle className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {
                    tasks.filter((task) =>
                      task.submissions.some((sub) =>
                        typeof sub.student === 'string'
                          ? sub.student === user?._id
                          : sub.student._id === user?._id
                      )
                    ).length
                  }
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value='streams'>Streams</TabsTrigger>
            <TabsTrigger value='tasks'>Tasks</TabsTrigger>
            {(user?.role === 'admin' || user?.role === 'mentor') && (
              <TabsTrigger value='recruitment'>Recruitment</TabsTrigger>
            )}
          </TabsList>
          {/* Recruitment Tab Content */}
          {(user?.role === 'admin' || user?.role === 'mentor') && (
            <TabsContent value='recruitment' className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>Recruitment Overview</h2>
                <Button
                  onClick={() =>
                    (window.location.href = '/lms/recruitment/applications')
                  }
                >
                  <FileText className='w-4 h-4 mr-2' />
                  View All Applications
                </Button>
              </div>

              <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Applications
                    </CardTitle>
                    <FileText className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {recruitmentData.totalApplications}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      For current cohort
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Pending Review
                    </CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {recruitmentData.pendingApplications}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Need attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Shortlisted
                    </CardTitle>
                    <Users className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {recruitmentData.shortlistedApplications}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Ready for assessment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Accepted
                    </CardTitle>
                    <CheckCircle className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {recruitmentData.acceptedApplications}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Enrolled students
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage recruitment for the current cohort
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4 md:grid-cols-3'>
                  <Button
                    variant='outline'
                    onClick={() =>
                      (window.location.href = '/lms/recruitment/applications')
                    }
                  >
                    <FileText className='w-4 h-4 mr-2' />
                    Review Applications
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => (window.location.href = '/lms/assessments')}
                  >
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Manage Assessments
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => (window.location.href = '/lms/cohorts')}
                  >
                    <Users className='w-4 h-4 mr-2' />
                    Cohort Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}{' '}
          {canCreateContent && (
            <div className='flex gap-2'>
              {activeTab === 'streams' && (
                <Dialog
                  open={createStreamOpen}
                  onOpenChange={setCreateStreamOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={resetStreamForm}>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Stream
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[600px]'>
                    <DialogHeader>
                      <DialogTitle>Create New Stream</DialogTitle>
                      <DialogDescription>
                        Share announcements, lessons, or updates with your
                        students.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='stream-title'>Title</Label>
                        <Input
                          id='stream-title'
                          value={streamFormData.title}
                          onChange={(e) =>
                            setStreamFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='Stream title...'
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='stream-type'>Type</Label>
                          <Select
                            value={streamFormData.type}
                            onValueChange={(
                              value: 'announcement' | 'lesson' | 'update'
                            ) =>
                              setStreamFormData((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='announcement'>
                                Announcement
                              </SelectItem>
                              <SelectItem value='lesson'>Lesson</SelectItem>
                              <SelectItem value='update'>Update</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='stream-scheduled'>
                            Schedule For (Optional)
                          </Label>
                          <Input
                            id='stream-scheduled'
                            type='datetime-local'
                            value={streamFormData.scheduledFor}
                            onChange={(e) =>
                              setStreamFormData((prev) => ({
                                ...prev,
                                scheduledFor: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='stream-content'>Content</Label>
                        <Textarea
                          id='stream-content'
                          value={streamFormData.content}
                          onChange={(e) =>
                            setStreamFormData((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          placeholder='Write your content here...'
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setCreateStreamOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateStream}>
                        Create Stream
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {activeTab === 'tasks' && (
                <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetTaskForm}>
                      <Plus className='h-4 w-4 mr-2' />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[600px]'>
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                        Create assignments, projects, quizzes, or reading
                        materials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='task-title'>Title</Label>
                        <Input
                          id='task-title'
                          value={taskFormData.title}
                          onChange={(e) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='Task title...'
                        />
                      </div>
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='task-type'>Type</Label>
                          <Select
                            value={taskFormData.type}
                            onValueChange={(
                              value:
                                | 'assignment'
                                | 'project'
                                | 'quiz'
                                | 'reading'
                            ) =>
                              setTaskFormData((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='assignment'>
                                Assignment
                              </SelectItem>
                              <SelectItem value='project'>Project</SelectItem>
                              <SelectItem value='quiz'>Quiz</SelectItem>
                              <SelectItem value='reading'>Reading</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='task-difficulty'>Difficulty</Label>
                          <Select
                            value={taskFormData.difficulty}
                            onValueChange={(
                              value: 'beginner' | 'intermediate' | 'advanced'
                            ) =>
                              setTaskFormData((prev) => ({
                                ...prev,
                                difficulty: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='beginner'>Beginner</SelectItem>
                              <SelectItem value='intermediate'>
                                Intermediate
                              </SelectItem>
                              <SelectItem value='advanced'>Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='task-hours'>Est. Hours</Label>
                          <Input
                            id='task-hours'
                            type='number'
                            value={taskFormData.estimatedHours}
                            onChange={(e) =>
                              setTaskFormData((prev) => ({
                                ...prev,
                                estimatedHours: parseInt(e.target.value),
                              }))
                            }
                            min='1'
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='task-score'>Max Score</Label>
                          <Input
                            id='task-score'
                            type='number'
                            value={taskFormData.maxScore}
                            onChange={(e) =>
                              setTaskFormData((prev) => ({
                                ...prev,
                                maxScore: parseInt(e.target.value),
                              }))
                            }
                            min='1'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='task-due'>Due Date</Label>
                          <Input
                            id='task-due'
                            type='datetime-local'
                            value={taskFormData.dueDate}
                            onChange={(e) =>
                              setTaskFormData((prev) => ({
                                ...prev,
                                dueDate: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='task-description'>Description</Label>
                        <Textarea
                          id='task-description'
                          value={taskFormData.description}
                          onChange={(e) =>
                            setTaskFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder='Task description and instructions...'
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setCreateTaskOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask}>Create Task</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>

        <TabsContent value='streams' className='mt-6'>
          <div className='space-y-4'>
            {streams.length === 0 ? (
              <Card>
                <CardContent className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium'>No streams yet</h3>
                    <p className='text-muted-foreground'>
                      {canCreateContent
                        ? 'Create your first stream to share content with students.'
                        : "Your mentors haven't posted any streams yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              streams.map((stream) => (
                <Card key={stream._id}>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div>
                        <div className='flex items-center gap-2 mb-2'>
                          <Badge className={getTypeColor(stream.type)}>
                            {stream.type}
                          </Badge>
                          <span className='text-sm text-muted-foreground'>
                            {new Date(stream.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle>{stream.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='prose prose-sm max-w-none mb-4'>
                      {stream.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {stream.attachments && stream.attachments.length > 0 && (
                      <div className='mb-4'>
                        <h4 className='text-sm font-medium mb-2'>
                          Attachments
                        </h4>
                        <div className='space-y-2'>
                          {stream.attachments.map((attachment) => (
                            <div
                              key={attachment._id}
                              className='flex items-center gap-2 p-2 border rounded'
                            >
                              {attachment.type === 'video' && (
                                <Video className='h-4 w-4' />
                              )}
                              {attachment.type === 'link' && (
                                <Link className='h-4 w-4' />
                              )}
                              {attachment.type === 'file' && (
                                <FileText className='h-4 w-4' />
                              )}
                              <a
                                href={attachment.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-sm text-blue-600 hover:underline'
                              >
                                {attachment.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='flex items-center gap-4 pt-4 border-t'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleAddReaction(stream._id, 'like')}
                        className='text-muted-foreground hover:text-blue-600'
                      >
                        <ThumbsUp className='h-4 w-4 mr-1' />
                        {
                          stream.reactions.filter((r) => r.type === 'like')
                            .length
                        }
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleAddReaction(stream._id, 'love')}
                        className='text-muted-foreground hover:text-red-600'
                      >
                        <Heart className='h-4 w-4 mr-1' />
                        {
                          stream.reactions.filter((r) => r.type === 'love')
                            .length
                        }
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleAddReaction(stream._id, 'helpful')}
                        className='text-muted-foreground hover:text-green-600'
                      >
                        <CheckCircle className='h-4 w-4 mr-1' />
                        {
                          stream.reactions.filter((r) => r.type === 'helpful')
                            .length
                        }
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleAddReaction(stream._id, 'confused')
                        }
                        className='text-muted-foreground hover:text-yellow-600'
                      >
                        <HelpCircle className='h-4 w-4 mr-1' />
                        {
                          stream.reactions.filter((r) => r.type === 'confused')
                            .length
                        }
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-muted-foreground'
                      >
                        <MessageSquare className='h-4 w-4 mr-1' />
                        {stream.comments.length}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {/* Pagination for streams */}
            {streamsPagination && streams.length > 0 && (
              <CustomPagination
                page={streamsPagination.page}
                pageSize={streamsPagination.limit}
                total={streamsPagination.total}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value='tasks' className='mt-6'>
          <div className='space-y-4'>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <BookOpen className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                    <h3 className='text-lg font-medium'>No tasks yet</h3>
                    <p className='text-muted-foreground'>
                      {canCreateContent
                        ? 'Create your first task to assign work to students.'
                        : "Your mentors haven't assigned any tasks yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task._id}>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div>
                        <div className='flex items-center gap-2 mb-2'>
                          <Badge className={getTypeColor(task.type)}>
                            {task.type}
                          </Badge>
                          <Badge
                            className={getDifficultyColor(task.difficulty)}
                          >
                            {task.difficulty}
                          </Badge>
                          <span className='text-sm text-muted-foreground'>
                            {task.estimatedHours}h • {task.maxScore} pts
                          </span>
                        </div>
                        <CardTitle>{task.title}</CardTitle>
                        <CardDescription>
                          Due: {new Date(task.dueDate).toLocaleDateString()} at{' '}
                          {new Date(task.dueDate).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='prose prose-sm max-w-none mb-4'>
                      {task.description.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {task.requirements && task.requirements.length > 0 && (
                      <div className='mb-4'>
                        <h4 className='text-sm font-medium mb-2'>
                          Requirements
                        </h4>
                        <ul className='text-sm list-disc list-inside space-y-1'>
                          {task.requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.resources && task.resources.length > 0 && (
                      <div className='mb-4'>
                        <h4 className='text-sm font-medium mb-2'>Resources</h4>
                        <div className='space-y-2'>
                          {task.resources.map((resource) => (
                            <div
                              key={resource._id}
                              className='flex items-center gap-2 p-2 border rounded'
                            >
                              {resource.type === 'video' && (
                                <Video className='h-4 w-4' />
                              )}
                              {resource.type === 'link' && (
                                <Link className='h-4 w-4' />
                              )}
                              {resource.type === 'file' && (
                                <FileText className='h-4 w-4' />
                              )}
                              <div>
                                <a
                                  href={resource.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-sm text-blue-600 hover:underline font-medium'
                                >
                                  {resource.title}
                                </a>
                                {resource.description && (
                                  <p className='text-xs text-muted-foreground'>
                                    {resource.description}
                                  </p>
                                )}
                                {resource.isRequired && (
                                  <Badge
                                    variant='outline'
                                    className='ml-2 text-xs'
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='flex items-center justify-between pt-4 border-t'>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Calendar className='h-4 w-4' />
                        <span>
                          {new Date(task.dueDate) > new Date()
                            ? `Due in ${Math.ceil(
                                (new Date(task.dueDate).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )} days`
                            : 'Past due'}
                        </span>
                      </div>
                      <div className='flex gap-2'>
                        {user?.role === 'student' && (
                          <Button size='sm' asChild>
                            <a href={`/lms/tasks/${task._id}/submit`}>
                              <Upload className='h-4 w-4 mr-1' />
                              Submit
                            </a>
                          </Button>
                        )}
                        {(user?.role === 'mentor' ||
                          user?.role === 'admin') && (
                          <>
                            <Button variant='outline' size='sm' asChild>
                              <a href={`/lms/tasks/${task._id}/submissions`}>
                                <Users className='h-4 w-4 mr-1' />
                                Submissions ({task.submissions.length})
                              </a>
                            </Button>
                            <Button variant='outline' size='sm'>
                              <Edit className='h-4 w-4 mr-1' />
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {/* Pagination for tasks */}
            {tasksPagination && tasks.length > 0 && (
              <CustomPagination
                page={tasksPagination.page}
                pageSize={tasksPagination.limit}
                total={tasksPagination.total}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
