export const getFullName = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return 'Unknown Applicant';
  return [firstName, lastName].filter(Boolean).join(' ');
};
