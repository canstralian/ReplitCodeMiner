# Replit Project Analyzer

## Overview

This is a full-stack web application built for analyzing duplicate code patterns across Replit projects. The application allows users to authenticate with their Replit accounts, fetch their projects, and identify potential code duplicates using advanced pattern matching algorithms.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for frontend bundling

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Replit theme colors
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect for Replit OAuth
- **Session Management**: Express sessions with PostgreSQL store
- **API Integration**: Custom service for Replit GraphQL API

### Database Schema
The application uses several key tables:
- `users`: Stores user profile information from Replit OAuth
- `sessions`: Required for Replit authentication session management
- `projects`: Caches Replit project metadata
- `codePatterns`: Stores identified code patterns for analysis
- `duplicateGroups`: Groups related duplicate patterns

### Authentication Flow
- Users authenticate via Replit OAuth using OpenID Connect
- Sessions are stored in PostgreSQL for persistence
- User profile data is automatically synced from Replit
- Protected routes require valid authentication

## Data Flow

1. **User Authentication**: Users sign in through Replit OAuth, creating or updating their user record
2. **Project Synchronization**: The app fetches user's Replit projects via GraphQL API and caches them locally
3. **Code Analysis**: Projects are analyzed for duplicate patterns using custom algorithms
4. **Pattern Storage**: Identified patterns and duplicates are stored in the database
5. **Dashboard Display**: Users can view projects, duplicates, and detailed comparisons through the web interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management and caching
- **passport**: Authentication middleware
- **openid-client**: OAuth/OpenID Connect client

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Environment**: Node.js 20 with PostgreSQL 16
- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Production Build**: `npm run build` creates optimized production assets
- **Production Start**: `npm run start` runs the production server
- **Database**: Uses Drizzle migrations with `npm run db:push`

The deployment uses autoscale configuration and serves the frontend through the Express server in production, with Vite handling development mode with HMR.

## Changelog

- June 14, 2025. Initial setup
- July 4, 2025. Added PostgreSQL database integration with Drizzle ORM
- January 3, 2025. Fixed orphaned links:
  - Created Settings page with comprehensive user preferences management
  - Created Recent Searches page for search history tracking
  - Connected all navigation buttons to appropriate pages
  - Added filter support to Dashboard for "Potential Duplicates" view
  - Implemented back navigation buttons for improved UX
- July 16, 2025. Fixed TypeScript compilation errors in analysisService.ts:
  - Removed duplicate interface definitions
  - Fixed Map iteration syntax errors
  - Improved error handling and logging throughout the service
  - Added proper type annotations for better code reliability
  - Enhanced cache management and language detection

## Database Status

The application now has a fully configured PostgreSQL database with the following tables:
- `users`: Stores user profile information from Replit OAuth
- `projects`: Caches Replit project metadata
- `code_patterns`: Stores identified code patterns for analysis
- `duplicate_groups`: Groups related duplicate patterns
- `pattern_groups`: Links patterns to duplicate groups
- `sessions`: Required for Replit authentication session management

Database connection is configured using @neondatabase/serverless with proper WebSocket support for Replit's environment.

## User Preferences

Preferred communication style: Simple, everyday language.