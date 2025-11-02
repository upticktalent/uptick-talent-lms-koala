# Uptick Learning Management System (LMS) Backend

## Overview

The LMS Backend powers a modern, scalable Learning Management System that
enables instructors to create learning resources and manage student activities
while allowing learners to enroll, study, and track their progress.

It provides a secure RESTful API for authentication, course management, user
roles, and assignments. The backend is designed for modularity, maintainability,
and extensibility. It is ideal for integration with multiple frontends (web,
mobile, or admin dashboards).

## Tech Stack

- Core Technologies:

- Runtime: Node.js (v20+)

- Framework: Express.js

- Database: Postgresql (via Prisma ORM)

- Cache Layer: Redis (for caching)

- Authentication: JWT (JSON Web Token) with role-based access control

- Logging: Winston + Sentry for error monitoring\*

## Services & External Integrations

- Sentry :Application monitoring and error tracking

- JWT Auth :Secure authentication and access control

## Setup & Installation

### Prerequisites

Make sure you have the following installed:

- Node.js (v20+)

- Postgresql

- Redis

- Git

1. Clone the repo

   git clone git@github.com:upticktalent/uptick-talent-lms-koala.git cd
   lms-backend

2. Install Dependencies

   yarn install

3. Configure Environment Variables Open .env.example file to see the list of
   environment variables used in this app. Create a .env and fill in your
   credentials.

4. Run the Server

5. Running Tests

6. Folder Structure
   <img src="https://i.ibb.co/jkzTPHgv/Screenshot-from-2025-10-18-19-02-56.png" alt="Screenshot-from-2025-10-18-19-02-56" border="0">

7. API Documentation: API documentation is available via Swagger UI. Once the
   server is running, you can access it at:

## Related Repositories & Resources

1. Frontend Repo
2. API Design
3. Entity Relationship Diagram

## Contribution Guidelines

1. Fork the repository

2. Create a new branch. Read the Contributing.md file to understand our
   convention for creating a branch and making prs.

3. Commit your changes with clear messages

4. Push to your branch and create a Pull Request
