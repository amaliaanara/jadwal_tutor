# Overview

EduAdmin is a comprehensive educational management system built as a full-stack web application. The system provides tools for managing students, teachers, learning packages, class schedules, and generating reports. It features a modern React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and integrates Replit authentication for secure user access.

# User Preferences

Preferred communication style: Simple, everyday language.

## UI/UX Requirements
- All buttons should have proper color contrast and visibility
- Primary buttons should use blue background with white text
- EduAdmin logo and branding should be clearly visible in sidebar
- Teacher filter functionality required in schedule page
- Reports page with comprehensive analytics needed
- Admin role required for creating packages and students

## Recent User Feedback (August 2025)
- Fixed button color issues (white text on blue background)
- Added teacher filtering in schedule management
- Implemented complete reports page with analytics
- Set user as admin role for proper access permissions
- Enhanced sidebar branding and visibility

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing with role-based page access
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript
- **API Design**: RESTful API with CRUD operations for all entities
- **Request Handling**: Express middleware for JSON parsing, CORS, logging, and error handling
- **Authentication**: Replit OpenID Connect integration with session-based authentication
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Key Entities**:
  - Users (teachers/admins with role-based access)
  - Students (with package assignments and teacher relationships)
  - Packages (learning packages with hours and pricing)
  - Classes (scheduled sessions with student-teacher assignments)
  - Schedule Change Requests (for class modifications)
  - Sessions (authentication session storage)

## Authentication System
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Security**: HTTP-only cookies with CSRF protection and secure session handling
- **Role System**: Admin and teacher roles with different permission levels

## State Management
- **Client State**: React hooks and context for UI state
- **Server State**: TanStack Query for API data caching, background refetching, and optimistic updates
- **Form State**: React Hook Form for form validation and submission handling

## Component Architecture
- **Design System**: shadcn/ui components built on Radix UI primitives
- **Layout**: Responsive sidebar navigation with mobile-friendly collapsible menu
- **Modals**: Dialog components for adding/editing entities
- **Data Display**: Cards, tables, and calendar views for different data types

## Build and Development
- **Development**: Vite dev server with HMR and TypeScript checking
- **Production**: Static build output with Express server for API routes
- **Code Quality**: TypeScript strict mode with path mapping for clean imports

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend Framework**: Express.js with TypeScript support (tsx)
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM, Drizzle Kit for migrations

## Authentication & Security
- **Replit Auth**: OpenID Client for Replit authentication integration
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Security**: Passport.js for authentication strategy handling

## UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Theming**: CSS variables with dark/light mode support
- **Icons**: Lucide React for consistent iconography

## Development Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Validation**: Zod for runtime type validation and schema generation
- **Utilities**: date-fns for date manipulation, clsx and tailwind-merge for conditional styling
- **Development**: Replit-specific plugins for development environment integration

## Database & API
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections
- **WebSocket**: ws library for WebSocket support in serverless environment
- **Validation**: drizzle-zod for automatic schema validation generation