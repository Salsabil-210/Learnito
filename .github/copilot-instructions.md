# Learnito - GitHub Copilot Instructions

## Project Overview

Learnito is a full-stack learning platform built with a TypeScript Node.js Express backend and a React frontend. The project uses a monorepo structure with the backend in the root directory and the frontend in the `frontend/` subdirectory.

## Technology Stack

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Security**: Helmet, CORS
- **Build Tool**: TypeScript Compiler (tsc)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite (using Rolldown)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with PostCSS
- **UI Libraries**: Framer Motion, Lucide React
- **Linting**: ESLint

## Project Structure

```
/
├── src/                    # Backend source code
│   ├── config/            # Configuration files (database, etc.)
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── prisma/           # Prisma schema and migrations
│   ├── repositories/      # Data access layer
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Application entry point
├── frontend/             # React frontend application
│   ├── src/             # Frontend source code
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── dist/                # Compiled backend code (generated)
├── package.json         # Backend dependencies
└── tsconfig.json        # TypeScript configuration
```

## Development Setup

### Backend Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   - Copy `.env.example` to `.env`
   - Configure required environment variables (DATABASE_URL, JWT_SECRET, etc.)

3. **Database setup**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   This uses nodemon for auto-reloading on file changes.

5. **Build for production**:
   ```bash
   npm run build
   ```
   This compiles TypeScript to the `dist/` directory.

6. **Start production server**:
   ```bash
   npm start
   ```

### Frontend Development

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Vite dev server runs on http://localhost:5173

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Lint code**:
   ```bash
   npm run lint
   ```

## Coding Guidelines

### General Principles
- Make minimal, surgical changes to existing code
- Preserve existing working functionality
- Follow existing code patterns and conventions
- Write clean, readable, and maintainable code

### TypeScript Standards
- Use strict TypeScript settings (already configured in tsconfig.json)
- Define explicit types for function parameters and return values
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object shapes
- Define types in the `src/types/` directory for shared types

### Backend Code Standards
- **Structure**: Follow MVC-like pattern with controllers, services, and repositories
- **Routing**: Define routes in `src/routes/` and implement logic in controllers
- **Database**: Use Prisma for all database operations
- **Error Handling**: Implement proper error handling with appropriate HTTP status codes
- **Security**: 
  - Use HttpOnly cookies for JWT tokens (see SECURITY_SETUP.md)
  - Never store sensitive data in localStorage
  - Validate all inputs
  - Use helmet for security headers
  - Configure CORS properly

### Frontend Code Standards
- **Components**: Use functional components with TypeScript
- **Styling**: Use Tailwind CSS utility classes
- **State Management**: Use React hooks (useState, useEffect, etc.)
- **API Calls**: Configure axios with `withCredentials: true` for cookie-based auth
- **Formatting**: Follow ESLint rules configured in eslint.config.js

### File Naming Conventions
- **Backend**: Use lowercase with dots (e.g., `auth.controller.ts`, `auth.routes.ts`)
- **Frontend**: Use PascalCase for components, lowercase for utilities
- **TypeScript**: All source files should use `.ts` or `.tsx` extensions

### Comments
- Add comments only when necessary to explain complex logic
- Match the existing comment style in the file
- Keep comments concise and meaningful
- Document complex algorithms or non-obvious business logic

## Testing Guidelines

Currently, there is no automated test infrastructure in place. When adding tests:
- Follow common testing patterns for Node.js/Express (Jest or similar)
- Create test files with `.test.ts` or `.spec.ts` extensions
- Place tests near the code they test or in a dedicated `__tests__` directory
- Do not add testing infrastructure unless specifically requested

## Build and Validation

### Before Committing
1. **Backend**:
   ```bash
   npm run build
   ```
   Ensure TypeScript compilation succeeds without errors.

2. **Frontend**:
   ```bash
   cd frontend
   npm run lint
   npm run build
   ```
   Ensure linting passes and build succeeds.

### Environment Files
- Never commit `.env` files
- Keep `.env.example` updated with required variables (without values)
- Use environment variables for all sensitive configuration

## Security Considerations

### Authentication Flow
- Tokens are stored in HttpOnly cookies (not localStorage)
- Access tokens: 15-minute expiry
- Refresh tokens: Used for obtaining new access tokens
- Cookies configured with `sameSite: 'strict'` for CSRF protection
- Use `secure: true` flag in production (HTTPS only)

### Best Practices
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Implement rate limiting for sensitive endpoints
- Keep dependencies updated
- Review SECURITY_SETUP.md for detailed security implementation

## Common Tasks

### Adding a New API Endpoint
1. Define route in `src/routes/`
2. Create controller in `src/controllers/`
3. Implement business logic in `src/services/` (if needed)
4. Add data access methods in `src/repositories/` (if needed)
5. Update types in `src/types/` (if needed)

### Adding a Database Model
1. Update `src/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Run `npx prisma generate` to update Prisma Client
4. Create repository methods if needed

### Working with Frontend
1. Create components in `frontend/src/components/`
2. Use Tailwind CSS for styling
3. Configure API calls with `withCredentials: true`
4. Follow React hooks patterns for state management

## Dependencies

### Adding New Dependencies
- **Backend**: Run `npm install <package>` from root directory
- **Frontend**: Run `npm install <package>` from `frontend/` directory
- Always install type definitions for TypeScript packages: `npm install -D @types/<package>`
- Keep `package.json` clean and organized

### Security Scanning
- All dependencies should be scanned for vulnerabilities
- Run security checks before adding new packages
- Address security alerts promptly

## Git Workflow
- Make small, focused commits
- Write clear commit messages
- Review changes before committing
- Exclude build artifacts, node_modules, and .env files (already in .gitignore)

## Additional Resources
- Prisma Documentation: https://www.prisma.io/docs
- Express.js Documentation: https://expressjs.com/
- React Documentation: https://react.dev/
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Tailwind CSS Documentation: https://tailwindcss.com/docs

## Notes
- The project uses a monorepo structure with separate package.json files
- Backend runs on port 3000 by default
- Frontend dev server runs on port 5173 by default
- Database migrations are managed through Prisma
- Review SECURITY_SETUP.md for detailed authentication implementation details
