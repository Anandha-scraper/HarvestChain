# Replit.md

## Overview

A crop tracking application designed for agricultural supply chain transparency and authenticity verification. The system enables farmers to register crops and generate QR codes, while retailers and consumers can scan these codes to track crop journey from farm to table. The application focuses on ensuring food safety, preventing counterfeiting, and providing transparency in the agricultural supply chain.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Component Library**: Radix UI components with shadcn/ui styling system
- **State Management**: React hooks and TanStack Query for server state management
- **Mobile-First Design**: Responsive design optimized for mobile devices with Material Design principles

### Backend Architecture
- **Express.js Server**: Node.js/Express backend with TypeScript
- **RESTful API Design**: API routes prefixed with `/api` for clear separation
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
- **PostgreSQL Database**: Primary data store using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Schema Design**: Three main entities:
  - Farmers: Authentication and profile information
  - Crop Batches: Crop details, QR codes, and tracking status
  - QR Scans: Scan history and price updates throughout supply chain

### Authentication and Authorization
- **Phone-Based Authentication**: Farmers authenticate using phone number and passcode
- **Role-Based Access**: Three user types with different capabilities:
  - Farmers: Generate QR codes, manage crop batches
  - Retailers: Scan QR codes, update prices and status
  - Consumers: Scan QR codes for verification and transparency

### User Interface Design
- **Theme System**: Light/dark mode support with CSS custom properties
- **Agricultural Color Palette**: Green and brown themed colors reflecting farming context
- **Accessibility**: Focus management, keyboard navigation, and screen reader support
- **Component Patterns**: Consistent card-based layouts, elevated surfaces, and status indicators

### QR Code System
- **Unique QR Generation**: Each crop batch generates multiple unique QR codes
- **Status Tracking**: Real-time status updates (generated, uploaded, in_transit, with_retailer, sold)
- **Price History**: Track price changes across the supply chain
- **Verification**: Anti-counterfeiting through unique code validation

## External Dependencies

### Database and Storage
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

### UI and Component Libraries
- **@radix-ui/***: Headless UI components for accessibility and functionality
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe component variant management

### Development and Build Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Form and Validation
- **react-hook-form**: Performant form library with validation
- **@hookform/resolvers**: Validation resolver integration
- **zod**: Runtime type validation and schema validation

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **lucide-react**: Icon library for consistent iconography
- **nanoid**: Unique ID generation for QR codes