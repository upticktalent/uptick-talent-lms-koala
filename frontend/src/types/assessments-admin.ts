/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Assessment {
  _id: string;
  application: {
    _id: string;
    applicant: {
      firstName: string;
      lastName: string;
      email: string;
    };
    cohort: {
      _id: string;
      name: string;
    };
    track: {
      _id: string;
      name: string;
    };
    educationalQualification: string;
    cvUrl: string;
    tools: string[];
    status: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
  };
  fileUrl: string;
  notes: string;
  status: 'under-review' | 'reviewed' | 'submitted';
  submittedAt: string;
  createdAt: string;
  updatedAt: string;

  submissionType: string;
}

export interface Applicant {
  _id: string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cohort: {
    _id: string;
    name: string;
  };
  track: {
    _id: string;
    name: string;
  };
  cvUrl: string;
  tools: string[];
  status: 'shortlisted' | 'rejected' | 'pending';
  motivation: string;
  referralSource: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}
