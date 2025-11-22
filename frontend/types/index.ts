/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "mentor" | "student";
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IApplicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  motivation: string;
  status:
    | "pending"
    | "shortlisted"
    | "assessment_submitted"
    | "under_review"
    | "interview_scheduled"
    | "accepted"
    | "rejected";
  preferredTrack?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
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
  status: "pending" | "submitted" | "graded";
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssessmentQuestion {
  _id: string;
  question: string;
  type: "multiple-choice" | "short-answer" | "essay" | "code";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface ITrack {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ICurriculumItem {
  _id: string;
  title: string;
  description: string;
  type: "lesson" | "assignment" | "project" | "assessment";
  content?: string;
  resources: IResource[];
  dueDate?: string;
  points?: number;
}

export interface IResource {
  _id: string;
  title: string;
  type: "link" | "file" | "video";
  url: string;
  description?: string;
}

export interface ICohort {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  isActive: boolean;
  tracks: ITrack[];
  students: IUser[];
  cohortNumber: string | number;
  maxStudents: number;
  currentStudents: number;
  status: string;
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
  type: "document" | "video" | "link" | "slides";
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
  priority: "low" | "medium" | "high";
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
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  feedback?: string;
  result?: "passed" | "failed";
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
  phone: string;
  address: string;
  education: string;
  experience: string;
  motivation: string;
  preferredTrack: string;
  resume?: File;
  portfolio?: string;
}
