import { FormikProps as FormikLibProps } from 'formik';

export interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  trackId: string;
  tools: string[];
  cohortNumber: string;
  cv: File | null;
  otherCountry: string;
  otherState: string;
  referralSource: string;
  motivation: string;
}

export const initialValues: ApplicationFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  gender: '',
  country: '',
  state: '',
  trackId: '',
  tools: [],
  cohortNumber: '',
  cv: null,
  otherCountry: '',
  otherState: '',
  referralSource: '',
  motivation: '',
};


export interface Track {
  _id: string;
  name: string;
}

export interface Cohort {
  cohortNumber: string;
  tracks: Track[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: Cohort;
}

export interface FormikProps {
  formik: FormikLibProps<ApplicationFormValues>;
}

export interface TrackOption {
  id: string;
  name: string;
  originalId: string;
    trackTools: Record<string, string[]>;

}


