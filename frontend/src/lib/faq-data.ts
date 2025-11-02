interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What are the prerequisites for enrolling in a track?',
    answer:
      'Most of our beginner tracks require no prior experience. However, intermediate and advanced tracks may require foundational knowledge in programming or specific technologies. Check the prerequisites section for each track to ensure you meet the requirements.',
  },
  {
    id: 'faq-2',
    question: 'How long does it take to complete a program?',
    answer:
      'Program duration varies by track, ranging from 4 to 16 weeks. The time depends on the track level and your pace. Most programs are self-paced, so you can complete them faster or slower based on your schedule.',
  },
  {
    id: 'faq-3',
    question: 'Is there job placement assistance after graduation?',
    answer:
      'Yes! We offer comprehensive career support including resume reviews, interview preparation, LinkedIn optimization, and job placement guidance. Our team connects top performers with relevant job opportunities at partner companies.',
  },
  {
    id: 'faq-4',
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "We offer a 14-day money-back guarantee if you're not satisfied with the program. If you don't see value within the first two weeks, contact our support team for a full refund, no questions asked.",
  },
  {
    id: 'faq-5',
    question: 'Do I get a certificate upon completion?',
    answer:
      'Yes! All students who complete their track receive a verified certificate of completion. These certificates are recognized by top tech companies and can be added to your LinkedIn profile and resume.',
  },
  {
    id: 'faq-6',
    question: 'What support is available during the course?',
    answer:
      'We provide 24/7 access to course materials, live office hours with instructors, a community forum for peer support, and one-on-one mentorship sessions. Our support team is always available to help with technical or course-related questions.',
  },
  {
    id: 'faq-7',
    question: 'Is the course self-paced or instructor-led?',
    answer:
      'Our courses are self-paced, allowing you to learn at your own speed. However, we offer live sessions, office hours, and group projects for collaborative learning. You can participate in as many or as few as you want.',
  },
];
