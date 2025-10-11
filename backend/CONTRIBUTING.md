# Contributing to Uptick Talent LMS – Backend

Thank you for your interest in contributing to the Uptick Talent LMS backend! This guide will help you get started and ensure a consistent, high-quality codebase.

## 🚀 Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/upticktalent/uptick-talent-lms-koala.git
   cd uptick-talent-lms-koala/backend
   ```

2. **Install dependencies:**

   ```sh
   yarn install
   ```

3. **Start the development server:**

   ```sh
   yarn dev:watch
   ```

   For production:

   ```sh
   yarn start
   ```

## 🌱 Branching Workflow & Naming Conventions

- **Before starting any new work, always switch to the `dev` branch and pull the latest changes:**

  ```sh
  git checkout dev
  git pull origin dev
  git checkout -b name-of-branch
  ```

- **Create your feature/fix/bug branch from `dev` using the following syntax:**

  - `LinearTaskId-task-description` (e.g., `UTM-23-student-login-page`)
  - The `task-description` part must be all lowercase and use dashes (`-`) to separate words (no spaces or underscores).
  - Example branch names:
    - `UTM-45-fix-health-endpoint`
    - `UTM-12-add-auth-middleware`
    - `UTM-23-student-login-page`

## 📝 Commit Message Standards

- All commit messages **must** follow the standards defined in [`commitlint.config.js`](./commitlint.config.js) and [Conventional Commits](https://www.conventionalcommits.org/):
  - Example: `feat: add user login page`
  - Example: `fix: correct health check logic`
- Commit messages are checked using commitlint and must comply with the config. See the `type-enum` and other rules in the config file for allowed types and formatting.

## 🔀 Pull Request (PR) & Review Process

1. **Create a PR** from your feature/fix branch to `dev`.
2. **Checklist before submitting a PR:**
   - All tests pass (`yarn test`)
   - Linting passes (`yarn lint`)
   - Code is formatted (`yarn format`)
   - Type-check passes (`yarn type-check`)
   - PR description clearly explains the change
3. **Review:**
   - Assign one among the authorized reviewers to your PR
   - At least one reviewer must approve before merging
   - Address all review comments
4. **After PR merge:**
   - Delete the branch (remote & local) to maintain a neat working repo.

## 🧹 Code Quality Expectations

- **Linting:** Run `yarn lint` before pushing (uses ESLint)
- **Auto-fix lint issues:** `yarn fix-lint`
- **Formatting:** Use `yarn format` to auto-format code (uses Prettier)
- **Type Checking:** Run `yarn type-check` to ensure no TypeScript errors
- **Testing:** Add/maintain unit tests; run `yarn test` before PR (add real tests as the project grows)
- **Pre-commit hooks:** Husky and lint-staged will run checks automatically on commit
- **Cleanup:** You can run `yarn cleanup` to format and fix lint issues together

## 🐞 Issues & Feature Requests

- Open issues via GitHub or Linear Issues
- Use clear titles and descriptions
- Label appropriately (e.g., `bug`, `feature`, `question`, etc)

## 🤝 Code of Conduct

By participating, you agree to uphold our [Code of Conduct](../CODE_OF_CONDUCT.md) and foster a welcoming, respectful environment.

---

Happy coding! 🎉
