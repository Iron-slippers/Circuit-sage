# Electronics Calculator Web Application

## Overview

This is a comprehensive electronics calculator web application designed for engineers and students working with electrical and electronic calculations. The application provides a centralized platform for managing formulas, constants, performing calculations, visualizing data through graphs, and maintaining calculation history. Built with a modern full-stack architecture, it combines a React-based frontend with an Express.js backend and PostgreSQL database for robust data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript, leveraging Vite as the build tool for fast development and optimized production builds. The application uses a component-based architecture with shadcn/ui for consistent design components and Tailwind CSS for styling. Key architectural decisions include:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens following Material Design principles optimized for technical applications
- **Theme Support**: Built-in dark/light mode with system preference detection

### Backend Architecture
The server follows a REST API pattern using Express.js with TypeScript. The architecture emphasizes simplicity and maintainability:

- **API Layer**: Express.js with structured route handlers for formulas, constants, and calculations
- **Data Layer**: Abstracted storage interface allowing for both in-memory and database implementations
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reloading with Vite integration for seamless development experience

### Data Storage Solutions
The application uses a hybrid storage approach:

- **Production Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database interactions
- **Development Fallback**: In-memory storage with seeded data for rapid prototyping
- **Schema Management**: Database migrations handled through Drizzle Kit

### Core Data Models
- **Formulas**: Store mathematical expressions with metadata (name, category, variables, description)
- **Constants**: Manage physical/mathematical constants with units and descriptions
- **Calculations**: Track calculation history with inputs, results, and timestamps

### Component Architecture
The UI is organized into specialized components for different calculator functions:

- **Calculator Component**: Formula selection and input management with real-time calculation
- **Formula Editor**: CRUD operations for custom formula creation and editing
- **Constants Manager**: Management interface for physical and mathematical constants
- **Graph Display**: Interactive plotting using Plotly.js for formula visualization
- **Calculation History**: Searchable history with export capabilities

### Theme and Design System
The application implements a technical design system optimized for engineering applications:

- **Color Palette**: Dark-mode primary with technical blue accents, supporting light mode
- **Typography**: Inter for readability, JetBrains Mono for formulas and code
- **Spacing**: Consistent Tailwind spacing units for predictable layouts
- **Interactive Elements**: Hover and focus states optimized for data-dense interfaces

## External Dependencies

### Database and ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with schema validation
- **drizzle-zod**: Schema validation integration

### Frontend Framework and UI
- **React 18**: Core frontend framework with modern hooks
- **@radix-ui/***: Accessible UI primitives for all interactive components
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing

### Styling and Theming
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional class name utilities

### Mathematical and Visualization
- **mathjs**: Mathematical expression parsing and evaluation
- **plotly.js**: Interactive graphing and data visualization
- **@types/plotly.js**: TypeScript definitions for Plotly

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the entire application
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development features

### Validation and Forms
- **zod**: Runtime type validation for API contracts
- **@hookform/resolvers**: Form validation integration
- **react-hook-form**: Efficient form state management

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **cmdk**: Command palette and search functionality