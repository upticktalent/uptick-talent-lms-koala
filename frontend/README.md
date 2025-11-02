# 🚀 Uptick Talent LMS – Frontend

This repository contains the **Next.js (App Router)** frontend for **Uptick Talent Africa’s Learning Management System (LMS)**.  
It’s a modern, **TypeScript-based** application built with best practices for scalability, performance, and maintainability.

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the App](#running-the-app)
6. [Build & Production](#build--production)
7. [Running Tests](#running-tests)
8. [Folder Structure](#folder-structure)
9. [Environment Variables](#environment-variables)
10. [Code Style & Linting](#code-style--linting)
11. [Contributing](#contributing)
12. [Useful Links](#useful-links)

---

## 🧠 Project Overview

The frontend serves as the **user interface** for Uptick Talent Africa’s LMS, connecting to a backend API to power:

- 🎓 Cohort-based learning experiences
- 📝 Admissions and application workflows
- 📊 Role-based dashboards (students, mentors, admins)
- 🧭 Track-based content delivery and progress tracking

---

## ⚙️ Tech Stack & Dependencies

**Core Technologies**

- [Next.js (App Router)](https://nextjs.org/docs/app)
- [TypeScript](https://www.typescriptlang.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/) for global state management
- [React Query](https://tanstack.com/query) for efficient data fetching
- [Zod](https://zod.dev/) for schema validation
- [Tailwind CSS](https://tailwindcss.com/) for styling

**Build & Tools**

- Yarn (preferred package manager)
- ESLint + Prettier for linting and formatting
- Vitest Testing Library for testing

---

## 🧩 Prerequisites

Ensure the following are installed:

- **Node.js 20+ (LTS recommended)**
- **Yarn** (preferred package manager)

You can verify with:

```bash
node -v
yarn -v
```

---

## 💾 Installation

```bash
# Clone the repository
git clone https://github.com/upticktalent/uptick-talent-lms-koala.git

# Navigate into the frontend directory
cd uptick-talent-lms-koala/frontend

# Install dependencies using Yarn
yarn install
```

---

## 🧑‍💻 Running the App

Start the local development server:

```bash
yarn dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Build & Production

To build and run the production build locally:

```bash
yarn build
yarn start
```

---

## 🧪 Running Tests

```bash
yarn test
```

---

## 🗂️ Folder Structure

```
src/
├── app/          # App Router routes, layouts, and server components
├── components/   # UI components and small presentational elements
├── features/     # Feature-based domain logic
├── lib/          # API clients, helpers, and shared utilities
├── providers/    # React context providers (Redux, Query, Auth, Theme)
├── hooks/        # Custom React hooks
├── constants/    # App constants and configuration
├── layout/       # Reusable or shared layout components and wrappers (e.g., dashboard layout)
├── utils/        # Reusable helper functions and formatters
├── schema/       # Validation schemas (Zod)
├── redux/        # Redux store, slices, and types
public/           # Static assets (icons, images, etc.)
```

**Naming Conventions**

| Category            | Convention                | Example                       |
| ------------------- | ------------------------- | ----------------------------- |
| Files               | lowercase, dash-separated | `user-profile.tsx`            |
| Hooks               | PascalCase                | `useAuth.ts`                  |
| Component Functions | PascalCase                | `function UserCard() { ... }` |
| Variables           | camelCase                 | `fetchUserData`               |
| Constants           | UPPER_SNAKE_CASE          | `API_BASE_URL`                |
| Types/Interfaces    | PascalCase                | `UserProfile`                 |

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (never commit it).  
Use `.env.example` as a reference.

**Example `.env.example`:**

```env
# General Next.js Configurations
NEXT_PUBLIC_APP_NAME="uptick-talent-lms"
NEXT_PUBLIC_API_BASE_URL="https://api.uptick-africa.com"

# Authentication
NEXT_PUBLIC_AUTH_CLIENT_ID="your-client-id"
AUTH_CLIENT_SECRET="your-client-secret"

# Analytics / Feature Flags
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
FEATURE_FLAG_EXPERIMENTAL=true
```

**Notes**

- Variables starting with `NEXT_PUBLIC_` are exposed to the client.
- Sensitive variables should **not** use the `NEXT_PUBLIC_` prefix.
- Keep `.env.local` private and untracked.

---

## 🧹 Code Style & Linting

Ensure code consistency and quality using these Yarn scripts:

```bash
# Lint code
yarn lint

# Format with Prettier
yarn format

# Type checking
yarn typecheck
```

**Guidelines**

- TypeScript strict mode is enabled
- Co-locate tests with components (`component.test.tsx`)
- Prefer server components when possible
- Centralize API logic in `src/lib/api`

---

## 🤝 Contributing

We welcome contributions!  
Please see the [Contribution Guidelines](./CONTRIBUTING.md) for setup instructions, branching rules, and code review processes.

---

## 🔗 Useful Links

- [Backend Repository](../backend/README.md)
- [Contribution Guidelines](./CONTRIBUTING.md)
- [Uptick Talent Africa Website](https://upticktalent.africa/)
- [Design Files (Figma)](https://www.figma.com/design/LhrlHM7LLUis7NDRVVIFcl/UTF-LMS)

---

> 💬 For questions or assistance, check the contribution guide or reach out to the maintainers.
