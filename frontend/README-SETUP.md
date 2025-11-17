# Dependencies needed for the Uptick Talent LMS Frontend

## Core Dependencies (already in package.json)

- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS

## Additional Dependencies to Install

### UI & Styling

```bash
npm install clsx tailwind-merge
npm install @radix-ui/react-slot
npm install class-variance-authority
```

### State Management & Data Fetching

```bash
npm install axios
npm install @tanstack/react-query  # Optional: for better data fetching
```

### Form Handling

```bash
npm install react-hook-form
npm install @hookform/resolvers
npm install zod  # For validation schemas
```

### Icons (Optional)

```bash
npm install lucide-react
# or
npm install @heroicons/react
```

### Date Handling

```bash
npm install date-fns
# or
npm install dayjs
```

## Development Dependencies

```bash
npm install -D @types/node
npm install -D eslint-config-next
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## File Structure Created

```
frontend/
├── app/
│   ├── layout.tsx (✓ Updated with AuthProvider)
│   ├── page.tsx (✓ Landing page)
│   ├── auth/
│   │   ├── layout.tsx (✓)
│   │   ├── login/page.tsx (✓)
│   │   └── forgot-password/page.tsx (✓)
│   ├── apply/
│   │   ├── layout.tsx (✓)
│   │   ├── page.tsx (✓ Application form)
│   │   ├── status/page.tsx (✓)
│   │   └── assessment/page.tsx (✓)
│   ├── lms/
│   │   ├── layout.tsx (✓ With auth guards)
│   │   ├── dashboard/page.tsx (✓)
│   │   ├── tracks/page.tsx (✓)
│   │   ├── recruitment/
│   │   │   ├── applications/page.tsx (✓)
│   │   │   ├── assessments/page.tsx (✓)
│   │   │   └── interviews/page.tsx (✓)
│   │   └── track/[slug]/
│   │       ├── layout.tsx (✓)
│   │       ├── page.tsx (✓ Track overview)
│   │       ├── stream/page.tsx (✓)
│   │       ├── classroom/page.tsx (✓)
│   │       ├── people/page.tsx (✓)
│   │       └── grades/page.tsx (✓)
│   └── admin/
│       ├── layout.tsx (✓ Admin only)
│       ├── dashboard/page.tsx (✓)
│       └── students/page.tsx (✓)
├── components/
│   ├── ui/
│   │   ├── button.tsx (✓)
│   │   ├── input.tsx (✓)
│   │   └── card.tsx (✓)
│   └── layout/
│       ├── sidebar.tsx (✓)
│       └── navbar.tsx (✓)
├── hooks/
│   ├── useAuth.tsx (✓ Context + hook)
│   ├── useUser.ts (✓)
│   └── useFetch.ts (✓)
├── services/
│   ├── apiClient.ts (✓ Axios setup)
│   ├── authService.ts (✓)
│   ├── applicantService.ts (✓)
│   ├── assessmentService.ts (✓)
│   ├── interviewService.ts (✓)
│   ├── lmsService.ts (✓)
│   └── trackService.ts (✓)
├── middleware/
│   ├── authGuard.tsx (✓)
│   └── roleGuard.tsx (✓)
├── utils/
│   ├── formatDate.ts (✓)
│   ├── cn.ts (✓ Tailwind class merger)
│   └── handleApiError.ts (✓)
└── types/
    └── index.ts (✓ All TypeScript interfaces)
```

## Key Features Implemented

✅ **Authentication System**

- Login/logout with JWT tokens
- Auth context and hooks
- Route protection (AuthGuard, RoleGuard)
- Role-based access control

✅ **Application Flow**

- Public application form
- Application status tracking
- Assessment system
- Interview scheduling

✅ **LMS Dashboard**

- Role-based dashboard views (Admin, Mentor, Student)
- Track management and navigation
- Recruitment pipeline management

✅ **Track System**

- Dynamic track pages with slug routing
- Stream (announcements)
- Classroom (materials & assignments)
- People (students & mentors)
- Grades (progress tracking)

✅ **Admin Panel**

- System-wide student management
- Track administration
- Application oversight

✅ **API Integration**

- Centralized API client with interceptors
- Service layer for all backend calls
- Error handling utilities
- Type-safe API responses

## Next Steps

1. Install the additional dependencies
2. Set up environment variables
3. Test the API connections with your Express backend
4. Customize styling and branding
5. Add form validation with react-hook-form + zod
6. Implement file upload functionality
7. Add loading states and error boundaries
8. Set up proper image handling
