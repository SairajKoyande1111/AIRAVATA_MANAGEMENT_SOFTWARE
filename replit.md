# Company Management System

## Overview

This is a 5-user internal company management system built with a full-stack architecture. The application provides authentication, attendance tracking, client management, lead management, and follow-up tracking capabilities. The system is designed for small teams where all users have equal access to view and manage data without role-based restrictions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing

**UI Components**: Radix UI primitives with shadcn/ui component system, styled using Tailwind CSS v4

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration

**Key Design Patterns**:
- Component composition using Radix UI primitives
- Utility-first CSS with Tailwind
- Custom hooks for reusable logic (mobile detection, toast notifications)
- Form handling with React Hook Form and Zod validation

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Database**: MongoDB Atlas with Mongoose ODM
- Connection string stored in environment variable MONGODB_URI
- Database successfully connected and operational
- All models use Mongoose schemas with TypeScript interfaces

**Authentication**: JWT-based authentication with bcryptjs for password hashing
- JWT tokens expire after 30 days
- Token stored in JWT_SECRET environment variable
- All API endpoints (except auth) protected with JWT middleware

**API Structure**: RESTful API with the following endpoints organized by domain:
- `/api/auth/*` - Authentication (register, login)
- `/api/attendance/*` - Attendance management (clock in/out, breaks, summaries)
- `/api/clients/*` - Client CRUD operations
- `/api/leads/*` - Lead management and tracking
- `/api/followups/*` - Follow-up scheduling and tracking
- `/api/reports/*` - Analytics and reporting (funnel, due follow-ups)

**Middleware**: 
- CORS enabled for cross-origin requests
- JWT token authentication middleware for protected routes
- Request logging with timing information
- Body parsing for JSON and URL-encoded data

**Development vs Production**:
- Development mode: tsx server running on port 5000 with MongoDB connection
- Production mode: Built with esbuild, serves static files from dist/public

**Server Structure**:
- `server/config/database.ts` - MongoDB connection configuration
- `server/models/` - Mongoose schemas (User, Attendance, Client, Lead, FollowUp)
- `server/controllers/` - Business logic for each module
- `server/middleware/auth.ts` - JWT authentication middleware
- `server/routes.ts` - API route definitions
- `server/app.ts` - Express app setup with CORS and logging

### Data Models

**User Model**:
- Email-based authentication
- Maximum 5 users enforced at registration
- No role-based access control

**Attendance Model**:
- Daily tracking with clock-in/out times
- Break management with validation (lunch after 12 PM, max 1 hour)
- Automatic calculation of total work minutes
- Unique constraint per user per day

**Client Model**:
- Basic contact information (name, phone, email, business type, location)
- Tracks creator for audit purposes

**Lead Model**:
- Linked to clients
- Requirement categorization (Website, Mobile app, Custom software, Digital marketing, Other)
- Stage tracking (new → contacted → qualified → proposal → meeting → negotiation → won/lost)
- Priority levels (low, medium, high)
- Budget estimation and next follow-up scheduling

**Follow-Up Model**:
- Linked to leads
- Date-based scheduling
- Outcome recording
- Support for attachments
- Can trigger next follow-up date updates on parent lead

## External Dependencies

### Core Framework Dependencies
- **Express.js**: Web application framework
- **React**: Frontend UI library
- **Vite**: Build tool and development server
- **TypeScript**: Type-safe development

### Database & ORM
- **Mongoose**: MongoDB object modeling for all data persistence
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- All CRUD operations use Mongoose models with TypeScript typing

### Authentication & Security
- **jsonwebtoken**: JWT token generation and validation
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing

### UI Component Libraries
- **@radix-ui/***: Headless UI component primitives (accordion, dialog, dropdown, select, toast, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **lucide-react**: Icon library
- **cmdk**: Command menu component
- **vaul**: Drawer component
- **recharts**: Charting library

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolver
- **zod**: Schema validation
- **drizzle-zod**: Drizzle schema to Zod validation

### State Management
- **@tanstack/react-query**: Server state management and caching

### Routing
- **wouter**: Lightweight routing library

### Development Tools
- **Replit-specific plugins**: 
  - @replit/vite-plugin-runtime-error-modal
  - @replit/vite-plugin-cartographer (dev only)
  - @replit/vite-plugin-dev-banner (dev only)
- Custom meta images plugin for OpenGraph tags

### Build Tools
- **esbuild**: JavaScript bundler for production server build
- **tsx**: TypeScript execution for development

## Recent Changes (November 22, 2025)

### Backend Implementation Completed
- ✅ Installed Mongoose, bcryptjs, jsonwebtoken, cors packages
- ✅ Created all 5 Mongoose models with TypeScript interfaces
- ✅ Implemented full authentication system with JWT
- ✅ Built attendance module with business rule validations
- ✅ Created client, lead, and follow-up management APIs
- ✅ Implemented reporting endpoints (funnel, due follow-ups)
- ✅ Connected to MongoDB Atlas database
- ✅ All API endpoints tested and verified working
- ✅ Server running on port 5000 with MongoDB connection established

### Environment Configuration
- MONGODB_URI: MongoDB Atlas connection string
- JWT_SECRET: Secure key for token signing
- PORT: 5000 (serves both frontend and backend)

### Testing Status
All modules tested successfully:
- Authentication (register/login) ✓
- Attendance tracking ✓
- Client management ✓
- Lead management ✓
- Follow-up tracking ✓
- Reports (funnel, due follow-ups) ✓