import React from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

export default function HeaderProfile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@uptick.com</p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-gray-50">
          <User className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700">Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-gray-50">
          <Settings className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700">Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-red-50">
          <LogOut className="w-4 h-4 text-red-500" />
          <span className="text-red-600">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// {
//   "success": true,
//   "message": "Applications retrieved successfully",
//   "data": {
//     "applications": [
//       {
//         "_id": "690c87d67cd7b10bee6ab6df",
//         "applicant": {
//           "_id": "690c87ac7cd7b10bee6ab6d7",
//           "firstName": "John",
//           "lastName": "Doe",
//           "email": "abdulkabirsultan01@gmail.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d12199",
//           "name": "Cohort 2025-Q1"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d1218f",
//           "name": "Frontend Development"
//         },
//         "cvUrl": "https://res.cloudinary.com/dpyhmbyhk/image/upload/v1762428884/uptick-talent/cvs/cv-Federal_University_of_Technology_Minna_pdf-1762428882685-427380225.pdf",
//         "tools": [
//           "javascript",
//           "React"
//         ],
//         "status": "pending",
//         "motivation": "I want to advance my career in tech",
//         "referralSource": "friends",
//         "submittedAt": "2025-11-06T11:34:46.891Z",
//         "createdAt": "2025-11-06T11:34:46.892Z",
//         "updatedAt": "2025-11-06T11:34:46.892Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676219b7246258d121af",
//         "applicant": {
//           "_id": "690c676219b7246258d121ad",
//           "firstName": "Emeka",
//           "lastName": "Obi",
//           "email": "emeka.obi@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d12199",
//           "name": "Cohort 2025-Q1"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d12190",
//           "name": "Backend Development"
//         },
//         "educationalQualification": "BSc Information Technology",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/emeka-obi-cv.pdf",
//         "tools": [
//           "Python",
//           "Django",
//           "PostgreSQL",
//           "Docker"
//         ],
//         "status": "rejected",
//         "submittedAt": "2025-11-04T05:50:24.997Z",
//         "createdAt": "2025-11-06T09:16:18.513Z",
//         "updatedAt": "2025-11-06T09:16:18.513Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676319b7246258d121b3",
//         "applicant": {
//           "_id": "690c676319b7246258d121b1",
//           "firstName": "Fatima",
//           "lastName": "Abdullahi",
//           "email": "fatima.abdullahi@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d1219a",
//           "name": "Cohort 2025-Q2"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d12195",
//           "name": "Data Science"
//         },
//         "educationalQualification": "BSc Mathematics",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/fatima-abdullahi-cv.pdf",
//         "tools": [
//           "Python",
//           "R",
//           "SQL",
//           "Tableau"
//         ],
//         "status": "rejected",
//         "submittedAt": "2025-10-31T21:15:25.452Z",
//         "createdAt": "2025-11-06T09:16:19.695Z",
//         "updatedAt": "2025-11-06T09:16:19.695Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676419b7246258d121bf",
//         "applicant": {
//           "_id": "690c676419b7246258d121bd",
//           "firstName": "Ahmed",
//           "lastName": "Yusuf",
//           "email": "ahmed.yusuf@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d1219a",
//           "name": "Cohort 2025-Q2"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d12193",
//           "name": "Product Management"
//         },
//         "educationalQualification": "BSc Economics",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/ahmed-yusuf-cv.pdf",
//         "tools": [
//           "Jira",
//           "Confluence",
//           "Notion",
//           "Slack"
//         ],
//         "status": "shortlisted",
//         "submittedAt": "2025-10-23T21:00:22.690Z",
//         "createdAt": "2025-11-06T09:16:20.997Z",
//         "updatedAt": "2025-11-06T09:16:20.997Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676419b7246258d121bb",
//         "applicant": {
//           "_id": "690c676419b7246258d121b9",
//           "firstName": "Blessing",
//           "lastName": "Okwu",
//           "email": "blessing.okwu@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d12199",
//           "name": "Cohort 2025-Q1"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d12192",
//           "name": "Mobile Development"
//         },
//         "educationalQualification": "BSc Computer Engineering",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/blessing-okwu-cv.pdf",
//         "tools": [
//           "React Native",
//           "Flutter",
//           "Kotlin",
//           "Swift"
//         ],
//         "status": "pending",
//         "submittedAt": "2025-10-17T14:11:46.735Z",
//         "createdAt": "2025-11-06T09:16:20.530Z",
//         "updatedAt": "2025-11-06T09:16:20.530Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676419b7246258d121b7",
//         "applicant": {
//           "_id": "690c676319b7246258d121b5",
//           "firstName": "Joseph",
//           "lastName": "Adamu",
//           "email": "joseph.adamu@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d1219a",
//           "name": "Cohort 2025-Q2"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d12194",
//           "name": "Product Design"
//         },
//         "educationalQualification": "BSc Business Administration",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/joseph-adamu-cv.pdf",
//         "tools": [
//           "Figma",
//           "Adobe XD",
//           "Sketch",
//           "InVision"
//         ],
//         "status": "pending",
//         "submittedAt": "2025-10-17T01:26:25.880Z",
//         "createdAt": "2025-11-06T09:16:20.093Z",
//         "updatedAt": "2025-11-06T09:16:20.093Z",
//         "__v": 0
//       },
//       {
//         "_id": "690c676219b7246258d121ab",
//         "applicant": {
//           "_id": "690c676119b7246258d121a9",
//           "firstName": "Chioma",
//           "lastName": "Nkosi",
//           "email": "chioma.nkosi@example.com"
//         },
//         "cohort": {
//           "_id": "690c675a19b7246258d12199",
//           "name": "Cohort 2025-Q1"
//         },
//         "track": {
//           "_id": "690c675a19b7246258d1218f",
//           "name": "Frontend Development"
//         },
//         "educationalQualification": "BSc Computer Science",
//         "cvUrl": "https://res.cloudinary.com/sample/raw/upload/v1699123456/cvs/chioma-nkosi-cv.pdf",
//         "tools": [
//           "JavaScript",
//           "React",
//           "HTML",
//           "CSS"
//         ],
//         "status": "pending",
//         "submittedAt": "2025-10-10T02:58:46.452Z",
//         "createdAt": "2025-11-06T09:16:18.013Z",
//         "updatedAt": "2025-11-06T09:16:18.013Z",
//         "__v": 0
//       }
//     ],
//     "pagination": {
//       "total": 7,
//       "page": 1,
//       "limit": 10,
//       "pages": 1
//     }
//   }
// }
