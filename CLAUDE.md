# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**비욘드 오더 허브 (Beyond Order Hub)** - A comprehensive e-commerce order management system built with React frontend and NestJS backend.

**Live Deployments:**
- Frontend: https://beyondworks.github.io/beyond-order-hub-frontend/
- Backend API: https://beyond-order-hub-backend.onrender.com

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Backend Development
```bash
cd boh-backend

# Install dependencies
npm install

# Development with watch mode
npm run start:dev

# Build production
npm run build

# Start production server
npm start:prod

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

## Architecture Overview

### Full-Stack Structure
- **Frontend**: React 19 + TypeScript + Vite with PWA support
- **Backend**: NestJS + TypeScript + PostgreSQL + JWT authentication
- **Deployment**: Frontend on GitHub Pages, Backend on Render

### Frontend Architecture

**State Management Pattern:**
- Centralized state in `App.tsx` with prop drilling
- Context only used for cross-cutting concerns (toast notifications)
- No external state management library (Redux, Zustand)

**Component Organization:**
```
src/
├── components/          # Feature-organized reusable components
│   ├── Common/         # Toast, Pagination
│   ├── Dashboard/      # Dashboard widgets
│   ├── Layout/         # Header, Sidebar
│   ├── Orders/         # Order management
│   └── Products/       # Product management
├── pages/              # Page-level components
├── services/           # API service layer
├── modules/            # Business logic (channel integrations)
└── types.ts           # Centralized TypeScript definitions
```

**Key Patterns:**
- Hash-based routing (no React Router)
- Modal-based UI interactions
- Service layer abstraction for API calls
- Comprehensive TypeScript typing

### Backend Architecture (NestJS)

**Core Modules:**
- Authentication (JWT + Passport)
- User management with role-based access
- Order processing and fulfillment
- Product and inventory management
- Return/exchange workflows
- Error logging and monitoring

**Database:**
- PostgreSQL with TypeORM
- Entity-relationship design
- Migration support

## Channel Integration System

**Modular Pattern:**
- `BaseChannelService` abstract class
- Concrete implementations: `NaverChannelService`, `CoupangChannelService`
- Standardized interfaces for products, orders, and sync results
- Located in `src/modules/channels/`

## API Service Layer

**Authentication Flow:**
1. JWT tokens stored in localStorage
2. Automatic token injection in API requests
3. 401 responses trigger automatic logout
4. Token validation on app initialization

**Error Handling:**
- Centralized in `services/api.ts`
- Toast notifications for user feedback
- Automatic auth error detection and handling

## Environment Configuration

**Frontend (.env.local):**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Backend:**
- Database connection via environment variables
- JWT secret configuration
- CORS enabled for frontend domain

## Key Data Models

**Core Entities:**
- `User`: Authentication and roles (master/user)
- `Order`: Multi-platform order processing
- `Product`: Inventory management
- `ReturnRequest`: Return/exchange workflows
- `StockMovement`: Inventory tracking
- `ErrorLogEntry`: System monitoring

**Channel Integration:**
- `BaseChannelConfig`: Abstract channel settings
- `ChannelProduct/Order`: Standardized data structures
- `ChannelSyncResult`: Integration status tracking

## Development Notes

**Current Status:**
- Authentication and core CRUD operations complete
- Some complex pages use simplified fallback components
- Channel integration framework implemented, specific integrations in progress

**Code Quality:**
- ESLint + Prettier configured for both frontend and backend
- TypeScript strict mode enabled
- Comprehensive type definitions in `src/types.ts`

**PWA Features:**
- Service worker for offline capability
- Manifest configuration in `vite.config.ts`
- Auto-update registration