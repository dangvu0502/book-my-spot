# Overview

AppointmentPro is a full-stack appointment booking system built with a modern tech stack. The application allows users to book 30-minute appointment slots between 7:00 AM and 7:00 PM, view available time slots, and manage appointments with proper cancellation policies. The system features a responsive design with real-time dashboard metrics, form validation, and a professional user interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React router alternative)
- **TanStack Query** for server state management and API caching
- **React Hook Form** with Zod validation for form handling
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with CSS variables for theming

## Backend Architecture
- **Express.js** server with TypeScript
- **MVC pattern** with organized controllers, services, and middleware layers
- **Drizzle ORM** with SQLite database (configured for PostgreSQL in production)
- **Zod** for runtime validation and type safety
- **Rate limiting** middleware (10 requests per minute per IP)
- **CORS** and compression middleware for production readiness

## Data Layer
- **SQLite** database with Drizzle ORM for local development
- **PostgreSQL** support configured via Drizzle config for production
- **Database schema** includes appointments table with soft deletes, timestamps, and proper indexing
- **In-memory storage** interface with seeded sample data for development

## API Design
- **RESTful endpoints** for CRUD operations
- **Query validation** using Zod schemas
- **Error handling** with custom error classes and proper HTTP status codes
- **Health check endpoint** for monitoring
- **Metrics endpoint** for dashboard analytics

## Key Features
- **Time slot management** with 30-minute intervals during business hours
- **Real-time availability** checking to prevent double bookings
- **Appointment cancellation** with 30-minute notice requirement
- **Customer booking limits** (maximum 3 active appointments per email)
- **Dashboard metrics** showing today's appointments, available slots, and cancellation rates
- **Responsive design** with mobile-first approach
- **Toast notifications** for user feedback
- **Form validation** with comprehensive error messages

## Business Logic
- **Business hours**: 7:00 AM to 7:00 PM with 30-minute slots
- **Appointment status**: Active or cancelled with soft delete functionality
- **Validation rules**: Email format, date format (YYYY-MM-DD), time format (HH:MM)
- **Cancellation policy**: 30-minute advance notice required
- **Customer limits**: Maximum 3 active bookings per email address

# External Dependencies

## Database
- **@neondatabase/serverless** - Serverless PostgreSQL driver for production
- **Drizzle ORM** - Type-safe database ORM with migration support
- **SQLite** - Local development database

## UI Framework
- **@radix-ui/react-*** - Headless UI components for accessibility
- **class-variance-authority** - Utility for component variant styling
- **tailwindcss** - Utility-first CSS framework
- **lucide-react** - Icon library

## State Management & Forms
- **@tanstack/react-query** - Server state management and caching
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Form validation resolvers
- **zod** - Runtime type validation

## Development Tools
- **Vite** - Build tool and development server
- **TypeScript** - Static type checking
- **@replit/vite-plugin-*** - Replit-specific development plugins
- **esbuild** - Fast JavaScript bundler for production builds

## Server Dependencies
- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **compression** - Response compression middleware
- **connect-pg-simple** - PostgreSQL session store (if sessions needed)

## Date/Time Utilities
- **date-fns** - Date manipulation library for client-side operations