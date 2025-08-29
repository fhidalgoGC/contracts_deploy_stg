# Overview

This is a full-stack web application built with React frontend and Express.js backend, featuring a modern UI component library (shadcn/ui) and PostgreSQL database integration via Drizzle ORM. The application currently displays a simple "Hola mundo" welcome page but is architected to support scalable web application development with robust data management and user interface capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database serverless PostgreSQL
- **Development**: Hot module replacement with Vite integration for seamless full-stack development

## Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries
- **Schema**: Centralized schema definition in `shared/schema.ts` with Zod validation
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Storage Interface**: Abstracted storage layer with both memory and database implementations

## Authentication & Session Management
- **Session Store**: PostgreSQL-backed sessions using connect-pg-simple
- **User Model**: Basic user schema with username/password authentication ready for implementation

## Development & Build
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Path Aliases**: Configured import aliases for clean code organization
- **Environment**: Support for development and production environments with appropriate tooling

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL provider for production database hosting
- **Drizzle ORM**: Type-safe SQL toolkit and query builder for PostgreSQL
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Styling
- **Radix UI**: Accessible, unstyled UI component primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Modern icon library with React components
- **class-variance-authority**: Utility for creating type-safe CSS class variants

## Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TanStack Query**: Powerful data synchronization for React applications
- **Wouter**: Minimalist routing library for React
- **React Hook Form**: Performant, flexible forms with easy validation
- **date-fns**: Modern JavaScript date utility library

## Build & Runtime
- **Express.js**: Fast, unopinionated web framework for Node.js
- **esbuild**: Fast JavaScript bundler for backend compilation
- **tsx**: TypeScript execution environment for development
- **Zod**: TypeScript-first schema validation library