
# ERPNext Data Integration Application

**Developer: Ethan Victor**

A comprehensive Excel-based data import system that bridges ERPNePOS to ERPNext with real-time monitoring, validation, and API health dashboards.

## 🚀 Overview

This application enables seamless data migration from ERPNePOS to ERPNext through Excel file uploads. It features a modern web interface with drag-and-drop functionality, comprehensive data validation, staging capabilities, and real-time processing status monitoring.

### Key Features

- **Multi-Module Support**: Item, Customer, Sales Order, Sales Invoice, Payment Entry
- **Real-time Monitoring**: Live status updates and API health checks
- **Bilingual Interface**: English + Myanmar language support
- **Robust Validation**: Schema-based validation with detailed error reporting
- **Template System**: Downloadable Excel templates for each module
- **Audit Trail**: Comprehensive logging of all operations
- **Background Processing**: Async processing with status tracking
- **Error Handling**: Graceful error handling with user feedback

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript, Vite build tool
- **Routing**: Wouter for client-side routing
- **UI System**: shadcn/ui components on Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **State Management**: TanStack Query for server state and API caching
- **File Handling**: React Dropzone for drag-and-drop uploads

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js, TypeScript with ESM modules
- **API Pattern**: RESTful endpoints for uploads, processing, logging
- **File Processing**: Multer for multipart uploads, XLSX for Excel parsing
- **Background Jobs**: Async processing with status tracking
- **Error Handling**: Comprehensive error handling and logging

### Database (PostgreSQL)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Provider**: Neon serverless PostgreSQL
- **Tables**: Staging imports, API logs, configuration, Excel templates

### External Integration
- **ERPNext API**: REST API client with token authentication
- **Supported Operations**: CRUD for all major business objects

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- ERPNext instance with API access
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Create environment variables in Replit Secrets:

```env
# Database
DATABASE_URL=your_neon_postgresql_url

# ERPNext Configuration
ERPNEXT_BASE_URL=https://your-erpnext-instance.com
ERPNEXT_API_KEY=your_api_key
ERPNEXT_API_SECRET=your_api_secret

# Application
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

```bash
# Push database schema
npm run db:push
```

### 4. Start Development Server

```bash
# Start the application
npm run dev
```

The application will be available at `http://localhost:5000`

## 📖 Usage Guide

### 1. Download Template
- Select the desired module (Item, Customer, etc.)
- Click "Download Template" to get the Excel format
- Templates include required fields and sample data

### 2. Prepare Data
- Fill the Excel template with your data
- Ensure all required fields are populated
- Follow the data format specifications

### 3. Upload & Process
- Drag and drop the Excel file or browse to select
- Choose the appropriate module
- Click "Upload & Process" to start the import
- Monitor real-time processing status

### 4. Monitor Results
- View processing status in real-time
- Check import logs for detailed results
- Review API health dashboard
- Access comprehensive audit trails

## 🔧 API Endpoints

### File Operations
- `POST /api/upload-excel` - Upload and process Excel file
- `GET /api/template/:module` - Download Excel template

### Monitoring & Logs
- `GET /api/staging/:id` - Get staging import status
- `GET /api/logs` - Retrieve API logs
- `GET /api/stats` - Dashboard statistics
- `GET /api/health/erpnext` - ERPNext API health check

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Reusable UI components
│   │   │   └── ...        # Feature components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Node.js application
│   ├── services/          # Business logic services
│   │   ├── erpnextClient.ts   # ERPNext API client
│   │   ├── excelParser.ts     # Excel processing
│   │   └── validator.ts       # Data validation
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── index.ts           # Application entry point
├── shared/                # Shared TypeScript definitions
│   └── schema.ts          # Database schema and types
└── README.md             # This file
```

## 🧪 Development

### Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database schema push
npm run db:push
```

### Component Development

The application uses a component-based architecture:

- **UI Components**: Located in `client/src/components/ui/`
- **Feature Components**: Located in `client/src/components/`
- **Pages**: Located in `client/src/pages/`

### API Development

API routes are defined in `server/routes.ts` with the following pattern:

1. Route handler receives request
2. Service layer processes business logic
3. Database operations through storage layer
4. Response with appropriate status and data

## 🔐 Security

- **API Authentication**: Token-based authentication for ERPNext
- **File Validation**: Strict file type and size validation
- **Error Handling**: Comprehensive error handling without data exposure
- **Input Validation**: Schema-based validation for all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file format (.xlsx, .xls only)
   - Verify file size (max 10MB)
   - Ensure all required fields are present

2. **ERPNext Connection Issues**
   - Verify API credentials in environment variables
   - Check ERPNext instance accessibility
   - Review API rate limits

3. **Database Errors**
   - Confirm DATABASE_URL is correct
   - Check database connectivity
   - Verify schema is up to date

### Error Monitoring

- Check browser console for frontend errors
- Review server logs for backend issues
- Monitor API logs through the dashboard
- Use the health check endpoint for API status

## 📊 Monitoring & Analytics

The application provides comprehensive monitoring:

- **Real-time Status**: Live updates on processing status
- **API Health**: ERPNext connectivity and response times
- **Import Statistics**: Success rates, failure analysis
- **Audit Trails**: Complete logs of all operations

## 🚀 Deployment

### Replit Deployment

1. Ensure all environment variables are set in Replit Secrets
2. Database schema is pushed successfully
3. Click the "Run" button to start the application
4. Application will be available on the provided Replit URL

### Production Considerations

- Set `NODE_ENV=production`
- Configure proper database backup
- Monitor API rate limits
- Set up log rotation
- Configure error alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Developer

**Ethan Victor**
- Specialized in full-stack web applications
- Expert in React, Node.js, and PostgreSQL
- Focused on enterprise data integration solutions

---

For support or questions, please check the troubleshooting section or review the comprehensive logging available in the application dashboard.
