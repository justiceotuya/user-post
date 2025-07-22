# User Post Monorepo

A unified development environment for a React frontend and Express backend.

## Project Structure

```text
├── backend/          # Express.js server with SQLite  
├── frontend/         # React + Vite + TanStack Router
└── package.json      # Unified scripts for both projects
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher recommended, v16.20+ minimum)
- Yarn (for backend dependencies)
- npm (for frontend dependencies, comes with Node.js)

### Installation

From the root directory, install all dependencies:

```bash
npm run install
```

This will install dependencies for both backend and frontend projects.

### Development

To start both backend and frontend in development mode:

```bash
npm start
# or
npm run dev
```

This will start:

- Backend server on <http://localhost:5000>
- Frontend development server on <http://localhost:3000>

### Individual Commands

You can also run projects individually:

```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend
```

### Building

To build the frontend for production:

```bash
npm run build
```

### Cleaning

To remove all node_modules and build artifacts:

```bash
npm run clean
```

## API Endpoints

The backend provides the following endpoints:

- `GET /` - List users with pagination
- `GET /users` - List users with pagination
- `GET /users/:userId/posts` - Get posts for a specific user
- `DELETE /posts/:postId` - Delete a specific post

## Package Managers

- Backend: Uses Yarn
- Frontend: Uses npm
- Root: Uses npm for orchestration

This setup allows each project to use its preferred package manager while providing unified commands from the root.
