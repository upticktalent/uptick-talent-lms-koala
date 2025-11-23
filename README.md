# Uptick Talent LMS - Comprehensive Learning Management System

> 🐨 **Built with ❤️ by Team Koala** | *Uptick Talent Africa Cohort 3*

Welcome to the Uptick Talent Africa Learning Management System (LMS) project! This repository contains a comprehensive, production-ready platform designed to automate and streamline the end-to-end operations of Uptick's mentorship and cohort-based learning programs.

## 🎥 Live Demo

**See the Uptick Talent LMS in Action!**

[![Demo 1](https://img.shields.io/badge/🎬_Demo_1-Live_System_Showcase-blue?style=for-the-badge&logo=youtube)](https://streamable.com/ag856b)

[![Demo 2](https://img.shields.io/badge/🎬_Demo_2-Live_System_Showcase-blue?style=for-the-badge&logo=youtube)](https://streamable.com/da9pgs)

> 📹 **Demo Videos**: Watch our comprehensive system walkthrough showcasing all features including the Google Classroom-style LMS, recruitment system, email management, and administrative capabilities.


---

## 🌟 Project Overview

Uptick Talent Africa's mission is to transform beginners into tech professionals through mentorship and hands-on projects. This comprehensive LMS platform provides a complete ecosystem for managing educational programs with Google Classroom-style features and advanced recruitment capabilities.

### 🎯 Core Objectives

- **Automate Admissions**: Complete application processing and candidate evaluation system
- **Centralize Communication**: Professional email system with templated communications
- **Track Progress**: Real-time monitoring of student progress and engagement
- **Provide Structured Learning**: Track-based learning paths with multimedia content
- **Maintain Data Integrity**: Single source of truth for all stakeholders
- **Scale Operations**: Handle multiple cohorts and tracks simultaneously

## 🚀 Key Features

### 📚 **Learning Management System (Google Classroom-Style)**
- **Streams**: Announcements, lessons, and updates with multimedia attachments
- **Tasks**: Assignments, projects, quizzes with submission tracking and grading
- **Materials**: Document library with videos, PDFs, and external resources
- **Interactive Features**: Comments, reactions, and real-time interactions
- **Progress Tracking**: Comprehensive analytics and progress monitoring
- **File Management**: Cloudinary integration for seamless file uploads and organization

### 🎓 **Complete Recruitment System**
- **Application Management**: End-to-end application processing with file uploads
- **Assessment System**: File/URL submissions with mentor review and scoring
- **Interview Scheduling**: Calendly-style interview booking with ICS calendar integration
- **Status Tracking**: Real-time application status updates and notifications
- **Communication Hub**: Integrated email system for candidate communications

### 📧 **Professional Email System**
- **Template Management**: 13 professional email templates covering all scenarios
  - Application confirmations with Application ID tracking
  - Assessment invitations and confirmations
  - Interview scheduling and reminders
  - Result notifications and feedback
  - Password reset and welcome emails
- **Direct Email**: Custom email composition with HTML/Markdown support
- **Email History**: Complete audit trail of all communications
- **Variable System**: Dynamic content insertion with applicant/user data

### 👥 **Role-Based Access Control**
- **Admins**: Full system management and oversight
- **Mentors**: Content creation, student management, and assessment review
- **Students**: Access to learning materials and progress tracking
- **Applicants**: Application submission and status monitoring

### 🏗️ **Multi-Cohort & Track Support**
- **Flexible Structure**: Support for multiple cohorts running simultaneously
- **Track Specialization**: Frontend, Backend, Fullstack, Mobile, Data Science, etc.
- **Mentor Assignment**: Track-specific mentor allocation and management
- **Resource Organization**: Track-specific content and resource management

## 🛠️ Tech Stack

### **Frontend** (`/frontend/`)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui component library
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with validation
- **File Uploads**: Cloudinary integration with progress tracking

### **Backend** (`/backend/`)
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with role-based access control
- **Email Service**: Brevo (SendinBlue) integration
- **File Storage**: Cloudinary for multimedia content
- **Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Structured error responses and logging

### **External Integrations**
- **Brevo Email Service**: Professional email delivery and templates
- **Cloudinary**: File upload, storage, and optimization
- **ICS Calendar**: Calendar integration for interview scheduling
- **MongoDB**: NoSQL database for scalable data storage

## 📁 Project Structure

```
uptick-talent-lms-koala/
├── frontend/                          # Next.js Frontend Application
│   ├── app/                          # App Router pages and layouts
│   │   ├── admin/                    # Admin dashboard and management
│   │   ├── apply/                    # Application submission portal
│   │   ├── auth/                     # Authentication pages
│   │   ├── lms/                      # Main LMS interface
│   │   │   ├── dashboard/            # Student/Mentor dashboard
│   │   │   ├── emails/               # Email management system
│   │   │   ├── recruitment/          # Recruitment management
│   │   │   └── track/[slug]/         # Track-specific content
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable UI components
│   │   ├── shared/                   # Cross-application components
│   │   ├── layout/                   # Navigation and layout components
│   │   └── ui/                       # Base UI components (shadcn/ui)
│   ├── hooks/                        # Custom React hooks
│   ├── services/                     # API service layers
│   ├── types/                        # TypeScript type definitions
│   └── utils/                        # Utility functions
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/              # Route controllers
│   │   ├── models/                   # Database models (Mongoose)
│   │   ├── routes/                   # API route definitions
│   │   ├── services/                 # Business logic services
│   │   ├── middleware/               # Authentication & validation
│   │   ├── schemas/                  # Validation schemas
│   │   ├── utils/                    # Backend utilities
│   │   ├── config/                   # Configuration management
│   │   └── scripts/                  # Database seeding scripts
│   └── test/                         # Test files and utilities
└── README.md                         # This documentation
```

## 🚦 Getting Started

This repository is organized into two main applications that work together:

### **Frontend Setup**
See [`frontend/README.md`](./frontend/README.md) for detailed setup instructions including:
- Environment configuration
- Development server setup
- Build and deployment processes

### **Backend Setup**
See [`backend/ReadMe.md`](./backend/ReadMe.md) for comprehensive backend setup including:
- Database configuration
- Email service setup
- Environment variables
- API documentation

### **Quick Start Guide**

1. **Clone the repository**
   ```bash
   git clone https://github.com/upticktalent/uptick-talent-lms-koala.git
   cd uptick-talent-lms-koala
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Configure environment variables (.env)
   npm run seed        # Seed database with sample data
   npm run dev        # Start development server
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Configure environment variables (.env.local)
   npm run dev        # Start development server
   ```

## 📊 System Features Breakdown

### **🎓 Learning Management**
- **Content Creation**: Rich text editor with file attachments for streams and tasks
- **Assignment Management**: Task creation with requirements, resources, and due dates
- **Submission Tracking**: Student submission monitoring with grading capabilities
- **Progress Analytics**: Real-time progress tracking and performance metrics
- **Resource Library**: Organized materials with categories and difficulty levels

### **🏢 Recruitment Management**
- **Application Portal**: Public application form with file upload capabilities
- **Assessment System**: Comprehensive assessment creation and review workflows
- **Interview Coordination**: Automated interview scheduling with email notifications
- **Candidate Communication**: Professional email templates for all recruitment stages
- **Status Management**: Real-time application status updates and tracking

### **💼 Administrative Features**
- **User Management**: Complete user lifecycle management across all roles
- **Cohort Management**: Multi-cohort support with track assignments
- **Email System**: Professional communication tools with template management
- **Analytics Dashboard**: Comprehensive insights into system usage and performance
- **Data Export**: Export capabilities for reporting and analysis

### **🔐 Security & Authentication**
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Permissions**: Fine-grained access control across all features
- **Input Validation**: Comprehensive data validation and sanitization
- **Secure File Uploads**: Validated and secured file upload processes
- **Password Security**: Secure password hashing and reset functionality

## 🌐 API Documentation

The system provides a comprehensive RESTful API with the following endpoints:

### **Core Modules**
- `/api/auth` - Authentication and user management
- `/api/applications` - Application submission and management
- `/api/assessments` - Assessment creation and review
- `/api/interviews` - Interview scheduling and management
- `/api/cohorts` - Cohort and track management
- `/api/streams` - LMS content streams
- `/api/tasks` - Assignment and task management
- `/api/materials` - Learning resource management
- `/api/emails` - Email system and templates

### **API Features**
- **Swagger Documentation**: Auto-generated API documentation
- **Request Validation**: Comprehensive input validation
- **Error Handling**: Structured error responses
- **Authentication**: JWT-based API security
- **Pagination**: Efficient data pagination for large datasets

## 🧪 Development & Testing

### **Database Seeding**
The system includes comprehensive seeding scripts that create:
- **9 Technology Tracks**: Frontend, Backend, Fullstack, Mobile, etc.
- **3 Sample Cohorts**: With realistic timelines and assignments
- **Test Users**: Admins, mentors, students, and applicants with default credentials
- **Sample Content**: Streams, tasks, materials, and assessments
- **Email Templates**: 13 professional email templates
- **Interview System**: Sample interview slots and bookings

### **Default Credentials**
```
ADMINS (Password: admin123)
• admin@upticktalent.com (System Administrator)
• victoria.adeoye@upticktalent.com (Admin)
• chinedu.okwu@upticktalent.com (Admin)

MENTORS (Password: mentor123)
• john.okafor@upticktalent.com (Frontend, Fullstack)
• sarah.adebayo@upticktalent.com (Backend, DevOps)
• michael.emeka@upticktalent.com (Mobile, Blockchain)

STUDENTS (Password: student123)
• adaora.okonkwo@student.upticktalent.com (Frontend)
• kunle.adebayo@student.upticktalent.com (Backend)

APPLICANTS (Password: applicant123)
• chioma.nkosi@example.com (Frontend)
• emeka.obi@example.com (Backend)
```

### **Test Data Includes**
- Various application statuses (pending, shortlisted, rejected)
- Different assessment types (file uploads and URLs)
- Sample assessment reviews and scoring
- Multiple cohorts and tracks for comprehensive testing
- Realistic Nigerian user data and phone numbers
- Complete LMS content with interactions
- Task submissions with different statuses
- Email communication history

## 🎯 Use Cases & Target Audience

### **For Educational Institutions**
- **Bootcamps**: Complete program management from application to graduation
- **Online Courses**: Structured learning paths with progress tracking
- **Mentorship Programs**: Mentor-student relationship management

### **For Corporate Training**
- **Employee Onboarding**: Structured onboarding programs with assessments
- **Skill Development**: Track-based learning for technical skills
- **Internal Training**: Company-specific learning management

### **For Developers**
- **Complete Codebase**: Production-ready code with best practices
- **API Integration**: RESTful API for external integrations
- **Customizable**: Modular architecture for easy customization

## 🤝 Contributing

We welcome contributions from developers of all skill levels!

### **Getting Involved**
1. **Fork the repository** and create your feature branch
2. **Read the Contributing Guidelines**: Check `backend/CONTRIBUTING.md` for detailed guidelines
3. **Follow Code Standards**: Maintain consistent coding style and practices
4. **Write Tests**: Ensure your changes include appropriate test coverage
5. **Submit Pull Requests**: Create clear, well-documented pull requests

### **Areas for Contribution**
- **Frontend Features**: UI/UX improvements and new functionality
- **Backend API**: New endpoints and business logic enhancements
- **Documentation**: Help improve documentation and tutorials
- **Testing**: Expand test coverage and quality assurance
- **Performance**: Optimization and scalability improvements

## 📋 Roadmap & Future Features

### **Planned Enhancements**
- **Mobile Application**: React Native mobile app for students and mentors
- **Advanced Analytics**: Detailed performance analytics and reporting
- **Integration Hub**: Third-party integrations (Slack, Discord, Zoom)
- **AI Features**: Automated grading and intelligent content recommendations
- **Certification System**: Digital certificates and achievement tracking
- **Live Streaming**: Integrated live class functionality

### **Technical Improvements**
- **Microservices Architecture**: Breaking down into smaller, focused services
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Caching**: Redis integration for improved performance
- **API Versioning**: Versioned API endpoints for backward compatibility

## 🆘 Support & Community

### **Getting Help**
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Documentation**: Check the comprehensive documentation in each module
- **Community**: Join our developer community discussions
- **Contact**: Reach out to project maintainers for direct support

### **Resources**
- **API Documentation**: Available via Swagger UI when running the backend
- **Database Schema**: ERD and model documentation in `/backend/`
- **Frontend Components**: Storybook documentation for UI components
- **Deployment Guides**: Production deployment instructions and best practices

## 📈 Performance & Scalability

### **Current Capabilities**
- **Concurrent Users**: Supports hundreds of concurrent users
- **Data Storage**: Efficient MongoDB queries with indexing
- **File Handling**: Optimized Cloudinary integration for multimedia
- **Email Delivery**: Professional email delivery via Brevo service

### **Scalability Features**
- **Horizontal Scaling**: Designed for multi-instance deployment
- **Database Optimization**: Efficient queries and data structure
- **CDN Integration**: Cloudinary CDN for global content delivery
- **Caching Strategy**: Application-level caching for improved performance

---

## 🌍 About Uptick Talent Africa

**Uptick Talent Africa** is dedicated to empowering Africa's next generation of tech professionals through comprehensive, hands-on learning experiences. Our mission is to bridge the skills gap in the African tech ecosystem by providing world-class training and mentorship opportunities.

### **Our Impact**
- **500+ Graduates**: Successfully trained tech professionals across various tracks
- **Industry Partnerships**: Collaborations with leading tech companies
- **Job Placement**: High employment rate among program graduates
- **Community Building**: Strong alumni network and ongoing support

---

## 🐨 Team Koala - Cohort 3

This comprehensive Learning Management System was proudly developed by **Team Koala** as part of the Uptick Talent Africa Cohort 3 program. Our team applied the skills learned throughout the program to create a production-ready platform that showcases the quality of education and mentorship provided by Uptick Talent Africa.

### **Development Achievement**
- **🏆 Capstone Project**: Complete end-to-end system demonstrating full-stack development expertise
- **🤝 Team Collaboration**: Collaborative development showcasing modern software engineering practices
- **📚 Applied Learning**: Real-world application of technologies and concepts learned in the program
- **🌟 Production Ready**: Professional-grade system suitable for actual educational institutions

### **Technologies Mastered**
Through building this LMS, Team Koala demonstrated proficiency in:
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Modern UI/UX Design
- **Backend**: Node.js, Express.js, MongoDB, RESTful API Development
- **DevOps**: Database Management, Cloud Integration, Version Control
- **Professional Skills**: Project Management, Code Documentation, Testing

*Team Koala is a testament to the transformative power of the Uptick Talent Africa program!* 🎓

---

**Ready to transform tech education in Africa? Get started with Uptick Talent LMS today!** 🚀

For detailed setup instructions, visit the respective README files:
- **Frontend**: [`frontend/README.md`](./frontend/README.md)
- **Backend**: [`backend/ReadMe.md`](./backend/ReadMe.md)

*Building the future of African tech talent, one cohort at a time.* ✨