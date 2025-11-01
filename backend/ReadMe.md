# Uptick Talent LMS - Backend API

A RESTful API backend for the Uptick Talent Learning Management System, built
with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 Authentication & Authorization
- 👥 User Management
- 📚 Course Tracks & Cohorts
- 📄 Application Processing with CV Upload
- 🏥 Health Check Endpoints
- 📧 Email Service Integration
- 🔍 Input Validation with Zod
- 🌍 CORS Support
- 📝 TypeScript Support

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB instance
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
CURRENT_LANGUAGE=en
APP_PORT=7000
DATABASE_URI=mongodb://localhost:27017/uptick-lms
ALLOWED_ORIGINS=http://localhost:3000
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm run start

# Seed database with initial data
npm run seed
```

The API will be available at `http://localhost:7000`

## API Endpoints

### Health Check

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### User Management

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Tracks & Cohorts

- `GET /tracks` - Get all tracks
- `POST /tracks` - Create new track
- `GET /cohorts` - Get all cohorts
- `POST /cohorts` - Create new cohort

### Applications

- `POST /applications` - Submit application with CV upload
- `GET /applications` - Get all applications
- `PUT /applications/:id` - Update application status

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── loader.ts              # Service loader
├── config/                # Configuration files
│   ├── index.ts
│   ├── getters.ts
│   ├── dynamicEnv.ts
│   └── statusCodes.ts
├── constants/             # Application constants
├── controllers/           # Route controllers
├── middleware/            # Express middleware
├── models/                # Database models
├── routes/                # Route definitions
├── schemas/               # Validation schemas
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run start:prod   # Start with NODE_ENV=production
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test         # Run tests
npm run seed         # Seed database
npm run seed:prod    # Seed production database
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **Development**: ts-node-dev, nodemon
- **Linting**: ESLint with Google config
- **Code Formatting**: Prettier

## Development

### Code Style

This project follows the Google TypeScript style guide:

- Use double quotes for strings
- 80 character line limit
- Camel case for variables and functions
- No console.log in production (use console.warn)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/modifications
- `chore:` - Build process or auxiliary tool changes

## License

This project is licensed under the ISC License.
