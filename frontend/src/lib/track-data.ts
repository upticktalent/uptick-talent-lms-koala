import { StaticImageData } from 'next/image';
import {
  backendIcon,
  dataScienceIcon,
  frontendIcon,
  fullstackIcon,
  mobileIcon,
  productDesignIcon,
  productManagementIcon,
} from '../../public/images';

export interface Track {
  slug: string;
  title: string;
  icon: StaticImageData;
  summary: string;
  description: string;
  duration: string;
  level: string;
  requirements: string[];
  learningOutcomes: string[];
  applicants: number;
}

export const tracks: Track[] = [
  {
    slug: 'product-design',
    title: 'Product Design',
    icon: productDesignIcon,
    summary: 'Master user-centered design principles and create impactful digital products',
    description:
      "Learn the fundamentals of product design including user research, wireframing, prototyping, and usability testing. This comprehensive program covers design thinking methodologies, interaction design, and visual design principles. You'll work on real-world projects and build a professional portfolio demonstrating your design capabilities.",
    duration: '12 weeks',
    level: 'Intermediate',
    requirements: [
      'Basic understanding of design principles',
      'Proficiency with design tools (Figma, Adobe XD)',
      'Strong portfolio with 2-3 design projects',
      'Communication and collaboration skills',
    ],
    learningOutcomes: [
      'Design user-centered digital products',
      'Conduct effective user research and testing',
      'Create high-fidelity prototypes and mockups',
      'Build and present a professional design portfolio',
      'Master design systems and component libraries',
      'Lead design sprints and workshops',
    ],
    applicants: 4200,
  },
  {
    slug: 'product-management',
    title: 'Product Management',
    icon: productManagementIcon,
    summary: 'Develop skills to lead product strategy and drive business growth',
    description:
      'Become a strategic product leader with comprehensive training in product discovery, roadmapping, metrics, and stakeholder management. This program teaches you how to identify market opportunities, define product vision, and execute go-to-market strategies. Learn from industry veterans and apply frameworks used at leading tech companies.',
    duration: '10 weeks',
    level: 'Intermediate',
    requirements: [
      '2+ years in tech or business roles',
      'Analytical and problem-solving mindset',
      'Experience with product or analytics tools',
      'Understanding of tech industry basics',
    ],
    learningOutcomes: [
      'Define product vision and strategy',
      'Conduct market research and competitive analysis',
      'Build and prioritize product roadmaps',
      'Develop key metrics and KPIs',
      'Lead cross-functional teams effectively',
      'Execute successful product launches',
    ],
    applicants: 3800,
  },
  {
    slug: 'frontend-development',
    title: 'Frontend Development',
    icon: frontendIcon,
    summary: 'Build modern, responsive web interfaces with React and Next.js',
    description:
      "Master frontend development with hands-on training in HTML, CSS, JavaScript, React, and Next.js. Learn to build scalable, performant web applications with modern best practices. This program covers component architecture, state management, testing, and deployment strategies. You'll contribute to real projects and learn from experienced engineers.",
    duration: '14 weeks',
    level: 'Beginner',
    requirements: [
      'Strong JavaScript fundamentals',
      'Understanding of HTML and CSS',
      'Problem-solving skills and attention to detail',
      'Willingness to build portfolio projects',
    ],
    learningOutcomes: [
      'Build responsive web interfaces with React',
      'Master Next.js for full-stack development',
      'Implement state management solutions',
      'Write testable, maintainable code',
      'Optimize web performance and SEO',
      'Deploy applications to production',
    ],
    applicants: 5600,
  },
  {
    slug: 'backend-development',
    title: 'Backend Development',
    icon: backendIcon,
    summary: 'Build scalable server applications and APIs with Node.js and databases',
    description:
      "Learn backend development fundamentals with Node.js, Express, and modern databases. Understand server architecture, API design, authentication, and deployment. This program emphasizes writing clean, maintainable code and handling real-world challenges like scaling, caching, and security. You'll build production-ready applications.",
    duration: '14 weeks',
    level: 'Beginner',
    requirements: [
      'Solid JavaScript knowledge',
      'Understanding of databases and SQL',
      'Problem-solving and debugging skills',
      'Linux command line basics',
    ],
    learningOutcomes: [
      'Build RESTful and GraphQL APIs',
      'Design and manage databases',
      'Implement authentication and authorization',
      'Handle errors and edge cases',
      'Deploy and scale applications',
      'Write unit and integration tests',
    ],
    applicants: 4100,
  },
  {
    slug: 'fullstack-development',
    title: 'Fullstack Development',
    icon: fullstackIcon,
    summary: 'Become a versatile developer by mastering both frontend and backend technologies',
    description:
      'This program equips you with end-to-end development skills — from designing responsive UIs with React and Next.js to building robust APIs with Node.js and databases. You’ll learn modern tools, deployment strategies, and DevOps fundamentals to confidently build and ship full-scale web applications.',
    duration: '18 weeks',
    level: 'Intermediate',
    requirements: [
      'Strong JavaScript and React foundation',
      'Basic knowledge of backend concepts',
      'Familiarity with databases and Git',
      'Passion for building complete web solutions',
    ],
    learningOutcomes: [
      'Develop complete fullstack applications',
      'Integrate frontend and backend seamlessly',
      'Implement authentication and authorization',
      'Work with databases and cloud deployment',
      'Apply CI/CD and DevOps practices',
      'Build and launch production-grade projects',
    ],
    applicants: 4800,
  },
  {
    slug: 'mobile-development',
    title: 'Mobile Development',
    icon: mobileIcon,
    summary: 'Create native and cross-platform mobile applications',
    description:
      'Develop mobile applications using React Native and modern mobile development practices. Learn to build iOS and Android apps from a single codebase, implement native features, and optimize performance. This program covers state management, navigation, testing, and app store deployment.',
    duration: '13 weeks',
    level: 'Intermediate',
    requirements: [
      'Proficiency in JavaScript and React',
      'Understanding of mobile UX principles',
      'Experience with git and CLI tools',
      'Familiarity with mobile platforms',
    ],
    learningOutcomes: [
      'Build cross-platform mobile apps with React Native',
      'Implement native device features',
      'Master mobile-specific state management',
      'Optimize app performance and battery usage',
      'Deploy to App Store and Google Play',
      'Debug and test mobile applications',
    ],
    applicants: 3400,
  },
  {
    slug: 'data-science',
    title: 'Data Science',
    icon: dataScienceIcon,
    summary: 'Transform data into actionable insights with Python and machine learning',
    description:
      'Master data science fundamentals including data analysis, visualization, machine learning, and statistical modeling. Learn Python, pandas, scikit-learn, and TensorFlow. This program teaches you how to work with real datasets, build predictive models, and communicate insights to stakeholders.',
    duration: '16 weeks',
    level: 'Advanced',
    requirements: [
      'Strong mathematics foundation',
      'Python programming experience',
      'Statistics and probability knowledge',
      'Problem-solving ability',
    ],
    learningOutcomes: [
      'Perform exploratory data analysis',
      'Build supervised and unsupervised models',
      'Implement machine learning algorithms',
      'Create data visualizations',
      'Deploy ML models to production',
      'Communicate data insights effectively',
    ],
    applicants: 2800,
  },
];
