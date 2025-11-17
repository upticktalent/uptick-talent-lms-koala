'use client';

import { useAuth } from './useAuth';

export function useUser() {
  const { user, loading, isAuthenticated } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'mentor';
  const isStudent = user?.role === 'student';

  const canAccessAdmin = isAdmin;
  const canAccessLMS = isAdmin || isMentor || isStudent;
  const canManageRecruitment = isAdmin || isMentor;

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isMentor,
    isStudent,
    canAccessAdmin,
    canAccessLMS,
    canManageRecruitment,
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    initials: user ? `${user.firstName[0]}${user.lastName[0]}` : '',
  };
}
