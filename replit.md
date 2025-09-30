# Overview

This is an ERPNext data integration application that enables Excel-based data imports from ERPNePOS to ERPNext. The system provides a web interface for uploading Excel files containing business data (Items, Customers, Sales Orders, Invoices, Payment Entries), validates the data, stages it in a PostgreSQL database, and synchronizes it with ERPNext via REST API calls. The application features real-time monitoring, error tracking, and API health dashboards.

# Recent Changes

## September 30, 2025 - Database & API Integration
- **Supabase Database Integration**: Configured the application to support Supabase PostgreSQL database via DATABASE_URL
- **Settings Page**: Created comprehensive settings interface at `/settings` for ERPNext API configuration
- **Database-Stored Credentials**: ERPNext API credentials (base URL, API key, secret) now stored in database instead of environment variables only
- **Connection Testing**: Added test connection functionality in Settings to verify ERPNext API connectivity
- **Backward Compatibility**: Maintained support for environment variable configuration as fallback

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Technology Stack**: React with TypeScript, Vite as build tool, Wouter for routing

**UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling

**State Management**: TanStack Query (React Query) for server state management and data fetching

**Design Pattern**: Component-based architecture with separation of concerns:
- UI components in `client/src/components/ui/` (reusable primitives)
- Feature components in `client/src/components/` (business logic)
- Pages in `client/src/pages/`
- Utility functions and hooks in `client/src/lib/` and `client/src/hooks/`

**Rationale**: This architecture provides type safety, excellent developer experience with hot module replacement, and a comprehensive UI component library. React Query handles caching, refetching, and loading states automatically.

## Backend Architecture

**Technology Stack**: Node.js with Express.js, TypeScript with ESM modules

**API Design**: RESTful endpoints for file uploads, data processing, logging, and health checks

**File Processing Pipeline**:
1. Multer middleware handles Excel file uploads (10MB limit, .xlsx/.xls only)
2. ExcelParser service converts Excel to JSON using XLSX library
3. DataValidator service validates against module-specific rules
4. Staging records stored in PostgreSQL
5. Background processing syncs validated data to ERPNext

**Service Layer Pattern**:
- `excelParser.ts`: Excel file parsing and template generation
- `validator.ts`: Schema-based data validation with field-level rules
- `erpnextClient.ts`: HTTP client for ERPNext REST API interactions
- `storage.ts`: Database abstraction layer

**Rationale**: Service-oriented architecture promotes testability and maintainability. The staging pattern prevents data loss and enables retry logic for failed API calls.

## Data Storage Solutions

**Database**: PostgreSQL via Neon serverless driver (Supabase-compatible)

**ORM**: Drizzle ORM with schema-first approach

**Schema Design**:
- `staging_erpnext_imports`: Temporary storage for parsed Excel data with status tracking (pending/processing/completed/failed)
- `api_logs`: Audit trail for ERPNext API requests/responses with success/failure metrics
- `configuration`: Key-value store for application settings (includes ERPNext API credentials)
- `excel_templates`: Template definitions for downloadable Excel files

**Data Flow**: Excel → Parse → Validate → Stage → Sync → Log

**Database Configuration**: Supports both Neon and Supabase PostgreSQL via DATABASE_URL environment variable. The `@neondatabase/serverless` driver works seamlessly with both providers.

**Rationale**: PostgreSQL provides ACID compliance and JSON support for flexible data structures. Staging table pattern enables data review before committing to ERPNext. Drizzle ORM offers type-safe database operations with minimal overhead.

## External Dependencies

**ERPNext Integration**:
- REST API communication via axios HTTP client
- Token-based authentication (API Key + Secret)
- Supports CRUD operations for: Item, Customer, Sales Order, Sales Invoice, Payment Entry
- Configuration stored in database via Settings page (base URL, API key, API secret)
- Settings UI at `/settings` for easy credential management
- Automatic fallback to environment variables for backward compatibility
- Built-in connection health check to verify API connectivity

**File Processing**:
- SheetJS (XLSX) library for Excel file parsing and generation
- Multer for multipart/form-data file uploads
- In-memory buffer processing (no disk storage)

**Frontend Libraries**:
- React Query for API state management
- React Hook Form with Zod for form validation
- React Dropzone for drag-and-drop file uploads
- date-fns for date formatting

**Development Tools**:
- Vite plugins for Replit integration (cartographer, dev-banner, runtime-error-modal)
- TypeScript for type safety across client and server
- Shared schema definitions in `/shared` for type consistency

**Rationale**: ERPNext REST API provides programmatic access to all business objects. SheetJS is the industry standard for Excel manipulation in JavaScript. The shared schema approach ensures type safety between frontend and backend.