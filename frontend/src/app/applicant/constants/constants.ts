'use client';

import * as Yup from 'yup';
import { ApplicationFormValues } from '../types/type';

export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;


export const initialApplicationValues: ApplicationFormValues = {
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


export const trackNameToIdMap: Record<string, string> = {
  'Frontend Development': 'frontend-development',
  'Backend Development': 'backend-development', 
  'Full Stack Development': 'fullstack-development',
  'Mobile Development': 'mobile-development',
  'Product Management': 'product-management',
  'Product Design': 'product-design',
  'Data Science': 'data-science',
  'DevOps Engineering': 'devops-engineering',
  'Blockchain Development': 'blockchain-development',
};

export const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  gender: Yup.string().required('Gender is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  trackId: Yup.string().required('Please select a track'),

  cv: Yup.mixed<File>()
    .nullable()
    .test('fileRequired', 'CV is required', (value) => value instanceof File),

  tools: Yup.array()
    .of(Yup.string())
    .min(1, 'Please select at least one tool')
    .required('Please select at least one tool'),

  referralSource: Yup.string().required('Referral source is required'),
  motivation: Yup.string().required('Motivation is required'),

  otherCountry: Yup.string().when('country', {
    is: 'Other',
    then: (schema) => schema.required('Please specify your country'),
    otherwise: (schema) => schema.notRequired(),
  }),
  otherState: Yup.string().when('state', {
    is: 'Other',
    then: (schema) => schema.required('Please specify your state/province'),
    otherwise: (schema) => schema.notRequired(),
  }),
});


export const trackTools: Record<string, string[]> = {
  'frontend-development': [
    'React',
    'Vue.js', 
    'Angular',
    'Next.js',
    'Svelte',
    'Tailwind CSS',
    'JavaScript',
    'TypeScript',
    'HTML',
    'CSS',
  ],
   'backend-development': [ 
    'Node.js',
    'Django',
    'Laravel',
    'Flask',
    'Spring Boot',
    'Express.js',
    'JavaScript',
    'Python',
    'Java',
    'PHP',
  ],
  'fullstack-development': [ 
    'MERN',
    'MEAN',
    'Django + React',
    'Laravel + Vue',
    'Next.js + Nest.js',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
  ],
 'mobile-development': [
    'React Native',
    'Flutter',
    'Swift',
    'Kotlin',
    'Ionic',
    'JavaScript',
    'Dart',
    'Java',
  ],
  'product-management': [
    'Agile',
    'Scrum',
    'JIRA',
    'User Research',
    'Roadmapping',
    'Product Strategy',
    'Market Analysis',
    'Stakeholder Management',
  ],
};

export const countries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Egypt',
  'Morocco',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Other',
];

export const statesByCountry: Record<string, string[]> = {
  Nigeria: [
    'Lagos',
    'Abuja',
    'Kano',
    'Rivers',
    'Kaduna',
    'Oyo',
    'Enugu',
    'Borno',
    'Delta',
    'Ekiti',
    'Other',
  ],
Ghana: ['Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Other'],
    Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Other'],
    'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Other'],
    Egypt: ['Cairo', 'Giza', 'Alexandria', 'Luxor', 'Other'],
    Morocco: ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Other'],
    'United States': ['California', 'Texas', 'New York', 'Florida', 'Other'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Other'],
    Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Other'],
    Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'Other'],
  };

export const referralSources = [
  'LinkedIn',
  'Twitter',
  'Facebook',
  'Instagram',
  'WhatsApp',
  'YouTube',
  'GitHub',
  'From a friend',
  'Career Website',
  'University/College',
  'Other',
];