export interface ICohortAssignment {
  cohort: string;
  tracks: string[];
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  country: string;
  state: string;
  role: 'applicant' | 'student' | 'mentor' | 'admin';

  // For mentors: tracks they can review
  assignedTracks?: string[] | ITrack[];

  // For students: current cohort and track they're enrolled in
  currentTrack?: string | ITrack;
  currentCohort?: string;

  // Legacy fields for backward compatibility
  studentCohort?: string;
  studentTrack?: string;
  mentorAssignments?: ICohortAssignment[];

  isActive: boolean;
  isPasswordDefault: boolean;
  createdBy?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IApplication {
  _id: string;
  applicant: string | IUser;
  cohort: string | ICohort;
  track: string | ITrack;
  cvUrl: string;
  tools: string[];
  status: 'pending' | 'under-review' | 'accepted' | 'rejected' | 'shortlisted';
  reviewedBy?: string | IUser;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;

  // Enhanced application fields
  educationalBackground: string;
  yearsOfExperience: string;
  githubLink?: string;
  portfolioLink?: string;
  careerGoals: string;
  weeklyCommitment: string;
  referralSource: string;
  referralSourceOther?: string;

  // Legacy fields for backward compatibility
  motivation?: string;
  educationalQualification?: string;

  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssessment {
  _id: string;
  applicantId: string;
  questions: IAssessmentQuestion[];
  answers: Record<string, any>;
  score?: number;
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded';
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssessmentQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'code';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface ITrack {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  mentors: IUser[];
  students: IUser[];
  curriculum: ICurriculumItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ICurriculumItem {
  _id: string;
  title: string;
  description: string;
  type: 'lesson' | 'assignment' | 'project' | 'assessment';
  content?: string;
  resources: IResource[];
  dueDate?: string;
  points?: number;
}

export interface IResource {
  _id: string;
  title: string;
  type: 'link' | 'file' | 'video';
  url: string;
  description?: string;
}

export interface ICohortTrack {
  track: string | ITrack;
  mentors: string[] | IUser[];
  maxStudents?: number;
  currentStudents: number;
}

export interface ICohort {
  _id: string;
  name: string;
  cohortNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  maxStudents: number;
  currentStudents: number;
  tracks: ICohortTrack[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  isAcceptingApplications: boolean;
  isCurrentlyActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IClassroom {
  _id: string;
  trackId: string;
  title: string;
  description?: string;
  materials: IClassroomMaterial[];
  assignments: IAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface IClassroomMaterial {
  _id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'slides';
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: ISubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface ISubmission {
  _id: string;
  studentId: string;
  assignmentId: string;
  content: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  trackId?: string;
  authorId: string;
  priority: 'low' | 'medium' | 'high';
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IGrade {
  _id: string;
  studentId: string;
  trackId: string;
  assignmentId?: string;
  assessmentId?: string;
  score: number;
  maxScore: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
}

export interface IInterview {
  _id: string;
  applicantId: string;
  interviewDate: string;
  interviewTime: string;
  interviewLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  result?: 'passed' | 'failed';
  notes?: string;
  interviewerId?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Application submission response type
export interface IApplicationSubmissionResponse {
  applicationId: string;
  status: 'pending' | 'under-review' | 'accepted' | 'rejected' | 'shortlisted';
  submittedAt: string;
}

// Paginated applications response type
export interface IPaginatedApplicationsResponse {
  applications: IApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApplicationForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  country: string;
  state: string;
  educationalBackground: string;
  yearsOfExperience: string;
  tools: string[];
  githubLink?: string;
  portfolioLink?: string;
  careerGoals: string;
  weeklyCommitment: string;
  referralSource: string;
  referralSourceOther?: string;
  track: string;
  cv?: File;
}

// LMS Types for Streams and Tasks
export interface IStream {
  _id: string;
  cohort: string | ICohort;
  track: string | ITrack;
  title: string;
  content: string;
  type: 'announcement' | 'lesson' | 'update';
  createdBy: string | IUser;
  isPublished: boolean;
  scheduledFor?: string;
  attachments: IStreamAttachment[];
  reactions: IStreamReaction[];
  comments: IStreamComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IStreamAttachment {
  _id: string;
  title: string;
  url: string;
  type: 'link' | 'file' | 'video' | 'image';
  size?: number;
  uploadedAt: string;
}

export interface IStreamReaction {
  _id: string;
  user: string | IUser;
  type: 'like' | 'love' | 'helpful' | 'confused';
  createdAt: string;
}

export interface IStreamComment {
  _id: string;
  user: string | IUser;
  content: string;
  replies: IStreamCommentReply[];
  createdAt: string;
  updatedAt: string;
}

export interface IStreamCommentReply {
  _id: string;
  user: string | IUser;
  content: string;
  createdAt: string;
}

export interface ITask {
  _id: string;
  cohort: string | ICohort;
  track: string | ITrack;
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'quiz' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  maxScore: number;
  dueDate: string;
  createdBy: string | IUser;
  requirements: string[];
  resources: ITaskResource[];
  submissions: ITaskSubmission[];
  isPublished: boolean;
  allowLateSubmissions: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskResource {
  _id: string;
  title: string;
  description?: string;
  type: 'link' | 'file' | 'video' | 'reading';
  url: string;
  isRequired: boolean;
}

export interface ITaskSubmission {
  _id: string;
  task: string | ITask;
  student: string | IUser;
  content?: string;
  attachments: ITaskSubmissionAttachment[];
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  score?: number;
  maxScore: number;
  feedback?: string;
  gradedBy?: string | IUser;
  submittedAt?: string;
  gradedAt?: string;
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskSubmissionAttachment {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Material Types
export interface IMaterial {
  _id: string;
  cohort: string | ICohort;
  track: string | ITrack;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'link' | 'slides' | 'book' | 'article';
  url: string;
  category: 'lesson' | 'resource' | 'reference' | 'supplementary';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  isRequired: boolean;
  isPublished: boolean;
  order: number;
  tags: string[];
  accessCount: number;
  createdBy: string | IUser;
  createdAt: string;
  updatedAt: string;
}

// Interview Types
export interface IInterviewSlot {
  _id: string;
  cohort: string | ICohort;
  track: string | ITrack;
  mentor: string | IUser;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  application?: string | IApplication;
  meetingLink?: string;
  notes?: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
