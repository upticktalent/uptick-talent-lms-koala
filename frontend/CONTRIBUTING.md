# Contributing to Uptick Talent LMS – Frontend

Thank you for your interest in contributing to the Uptick Talent LMS frontend! This document outlines the process for contributing, coding standards, and expectations to ensure a smooth and consistent workflow for all contributors.

## 🚀 Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/upticktalent/uptick-talent-lms-koala.git
   cd uptick-talent-lms-koala/frontend
   ```

2. **Install dependencies:**

   ```sh
   yarn install
   ```

3. **Start the development server:**

   ```sh
   yarn dev
   ```

## 🌱 Branching Workflow & Naming Conventions

- **Before starting any new work, always switch to the `dev` branch and pull the latest changes:**

  ```sh
  git pull origin dev
  git checkout -b name-of-branch
  ```

- **Create your feature/fix/bug branch from `dev` using the following syntax:**
  - `LinearIssueId-issue-description` (e.g., `UPT-23-student-login-page`)
  - The `issue-description` part must be all lowercase and use dashes (`-`) to separate words (no spaces or underscores).
  - Example branch names:
    - `UPT-45-fix-navbar-bug`
    - `UPT-12-add-user-profile`
    - `UPT-23-student-login-page`

## 📝 Commit Message Standards

- All commit messages **must** follow the standards defined in [**`commitlint.config.js`**](./commitlint.config.js) and [Conventional Commits](https://www.conventionalcommits.org/):
  - Example: `feat: add user login page`
  - Example: `fix: correct navbar alignment`
- Commit messages are checked using `commitlint` and must comply with the `config`. See the `type-enum` and other rules in the config file for allowed types and formatting.

## 🔀 Pull Request (PR) & Review Process

1. **Create a PR** from your feature/fix branch to `dev`.
2. **Checklist before submitting a PR:**
   - All tests pass (`yarn test`)
   - Linting passes (`yarn lint`)
   - Code is formatted (`yarn format`)
   - PR description clearly explains the change
3. **Review:**
   - Assign one among the authorized reviewers to your PR
   - At least one reviewer must approve before merging
   - Address all review comments
4. **After PR merge:**
   - Delete the branch (remote & local) so as to maintain a neat working repo.

## 🧹 Code Quality Expectations

- **Linting:** Run `yarn lint` before pushing
- **Formatting:** Use `yarn format` to auto-format code
- **Type Checking:** Ensure no TypeScript errors
- **Testing:** Add/maintain unit tests; run `yarn test` before PR

## 🐞 Issues & Feature Requests

- Open issues via GitHub or Linear Issues
- Use clear titles and descriptions
- Label appropriately (e.g., `bug`, `feature`, `question`, etc)

## 🤝 Code of Conduct

By participating, you agree to uphold our [Code of Conduct](../CODE_OF_CONDUCT.md) and foster a welcoming, respectful environment.

---

Happy coding! 🎉
