# Perception Extension - Font Customization Interface

## Overview

This is a web-based font customization interface designed as an accessibility-focused extension. The application allows users to customize font display preferences (font family and size) to improve readability for users with disabilities. It features a React frontend with a Node.js/Express backend, with in-memory storage for rapid development.

The application follows Material Design principles with an accessibility-first approach, providing clear, predictable interfaces with strong visual feedback.

## Recent Changes (November 15, 2025)

**Complete Font Customization System Implemented:**
- ✅ Backend API with full CRUD operations for font preferences
- ✅ Frontend interface with font family selector and size slider
- ✅ Live preview of font changes
- ✅ Persistent storage across page reloads
- ✅ Reset to default functionality
- ✅ Toast notifications for user feedback
- ✅ End-to-end tested and verified

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
  - Custom color scheme using HSL values with CSS variables
  - Material Design-inspired spacing and typography
  - Dark mode support through CSS classes
  - Custom border radius and shadow utilities

**Design System**:
- Typography: Inter font (Google Fonts) for optimal readability
- Component library based on "New York" style variant from shadcn/ui
- Accessibility-first with minimum touch targets (44-48px height)
- Consistent spacing using Tailwind units (3, 4, 6, 8)

**Pages**:
- Font Preferences (`/`) - Main interface for customizing font settings
  - Font family selector (Radio group with 5 options)
  - Font size slider (12px - 24px range)
  - Live preview panel
  - Apply and Reset buttons
  - Automatic state synchronization with saved preferences

**Form Handling**:
- React Hook Form for form state management
- Zod schema validation through @hookform/resolvers
- Type-safe form validation integrated with backend schemas

### Backend Architecture

**Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **Module System**: ES Modules (type: "module")
- **Development**: tsx for TypeScript execution in development
- **Production Build**: esbuild for fast, optimized bundling

**API Design**:
- RESTful endpoints under `/api` prefix
- Font preferences CRUD operations:
  - `GET /api/font-preferences/current` - Retrieve current active preference (404 if none)
  - `GET /api/font-preferences/:id` - Retrieve specific preference by ID
  - `POST /api/font-preferences` - Create new preference (201 on success)
  - `PUT /api/font-preferences/:id` - Update existing preference
  - `DELETE /api/font-preferences/:id` - Delete preference (204 on success)

**Request Processing**:
- JSON body parsing with raw body capture for webhook support
- Request/response logging middleware with duration tracking
- 80-character log truncation for readability
- Error handling with appropriate HTTP status codes

**Development Features**:
- Vite integration in middleware mode for HMR
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)

### Data Layer

**ORM**: Drizzle ORM
- Type-safe database queries
- Schema-first approach with TypeScript inference
- Zod integration for runtime validation via drizzle-zod
- Migration support through drizzle-kit

**Database Schema**:

*Users Table*:
- `id`: UUID primary key (auto-generated)
- `username`: Unique text field
- `password`: Text field for authentication

*Font Preferences Table*:
- `id`: UUID primary key (auto-generated)
- `fontFamily`: Text field (enum: Arial, Verdana, Georgia, Times New Roman, Courier)
- `fontSize`: Integer field (12-24px range)

**Validation Rules**:
- Font family limited to 5 predefined options for reliability
- Font size constrained to 12-24px range for usability
- Zod schemas enforce constraints at both API and storage layers

**Storage Strategy**:
- Interface-based storage abstraction (IStorage)
- In-memory implementation (MemStorage) for development/testing
- Prepared for PostgreSQL implementation via Drizzle
- Current preference tracking through storage layer

### External Dependencies

**Database**:
- **PostgreSQL** (via @neondatabase/serverless)
  - Serverless-compatible PostgreSQL client
  - Configured through DATABASE_URL environment variable
  - Schema migrations in `./migrations` directory

**UI Component Libraries**:
- **Radix UI**: Unstyled, accessible component primitives
  - 20+ component primitives (accordion, dialog, dropdown, slider, etc.)
  - Built-in accessibility features (ARIA attributes, keyboard navigation)
  - Headless components for full styling control
  
**Styling & Utilities**:
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx** & **tailwind-merge**: Conditional className composition

**Form & Validation**:
- **React Hook Form**: Performant form state management
- **Zod**: TypeScript-first schema validation
- Integrated validation between frontend forms and backend APIs

**Development Tools**:
- **TypeScript**: Type safety across full stack
- **Vite**: Fast development server and build tool
- **esbuild**: Production backend bundling
- **Replit Plugins**: Development experience enhancements (only in Replit environment)

**Fonts**:
- **Google Fonts**: Inter (primary UI font), plus additional font families
  - Architects Daughter
  - DM Sans
  - Fira Code
  - Geist Mono

**Session Management**:
- **connect-pg-simple**: PostgreSQL session store for Express
- Prepared for session-based authentication