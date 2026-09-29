# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Project Modification Guidelines

This is an existing production-style academic project. The following rules govern all changes:

1. **Preserve existing functionality.** Do not break or remove working features.
2. **Inspect before modifying.** Before touching any component, inspect the related JSX/TSX/JS, CSS, services, API calls, context/state, and routing.
3. **Prefer modifying over duplicating.** Modify existing components rather than creating duplicate components.
4. **No unauthorized backend changes.** Do not change backend APIs, database models, authentication, or business logic unless explicitly requested.
5. **No redesigns for the sake of redesigns.** Do not replace working functionality just to achieve a visual redesign.
6. **Maintain React + Vite architecture.** Keep the existing frontend build and framework choices.
7. **Maintain frontend-backend integration.** Preserve the existing axios/JWT/WebSocket data flow.
8. **Preserve data flow and handlers.** When modifying UI, maintain existing data flow and event handlers.
9. **No mock data.** Do not create mock data when real project data already exists.
10. **Explain large changes.** Before making a large change, explain which files will be modified and why.
11. **Incremental changes.** Make changes incrementally rather than rewriting the entire application.
12. **Verify after changes.** After changes, check for broken imports, JSX errors, CSS conflicts, and obvious runtime issues.
13. **Follow naming conventions.** Keep the existing naming conventions and folder structure unless there is a strong technical reason to change them.
14. **Inspect before redesigning.** For major UI redesigns, first inspect the existing implementation and then modify it rather than creating a separate demo page.

## 📁 Project Structure

The repository follows a clear layered architecture with separation of concerns:

```
Smart Hospital
├── backend/                    # Spring Boot Java backend (src/main/java/com/hospital/smart)
│   ├── config/                 # Security, CORS, MongoDB, WebSocket configuration
│   ├── controller/             # REST API endpoints
│   ├── service/                # Business logic
│   ├── repository/             # Data access layer (JPA/MongoDB)
│   ├── model/                  # Domain entities (Lombok + JPA)
│   ├── dto/                    # Data transfer objects
│   ├── security/               # JWT authentication
│   ├── exception/              # Custom exceptions
│   └── util/                   # Utility classes
├── frontend/                   # React + Vite frontend (src/)
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Role-specific pages
│   ├── services/               # API client modules
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                   # Constants, validators, utilities
│   ├── routes/                 # Routing configuration
│   └── styles/                  # Global CSS
├── docker-compose.yml          # Full stack deployment
└── .env.example                # Environment variable templates
```

## 🏗️ Architecture Overview

### Backend (Java Spring Boot)
- **Framework**: Spring Boot 3.3 + Java 17
- **Database**: MongoDB 7 with Spring Data MongoDB
- **Security**: JWT authentication with BCrypt passwords
- **Real-time**: WebSocket + STOMP for queue updates
- **AI Integration**: Google Gemini API for chatbot
- **Build**: Maven with Lombok for POJOs

### Frontend (React + Vite)
- **Framework**: React 19 + Vite 8 + Tailwind CSS 4
- **Routing**: React Router 7 with nested protected routes
- **Auth**: JWT token stored in localStorage, axios interceptors
- **HTTP**: Axios with automatic JWT attachment and error handling
- **Real-time**: STOMP over WebSocket for live queue updates
- **Build**: Vite with oxlint for linting

### API Design Patterns
- **Controller layer**: REST endpoints with validation
- **Service layer**: Business logic with transaction management
- **Repository layer**: MongoDB abstraction
- **Exception handling**: Global exception handler with custom responses

## 🔧 Development Commands

### Prerequisites
```bash
# Java 17+, Maven 3.9+, Node.js 18+, MongoDB 7.x
# Start MongoDB: mongod --dbpath /data/db
# Or use Docker: docker-compose up mongodb -d
```

### Backend Development
```bash
cd backend

# Build and compile
mvn clean compile

# Run with hot reload
mvn spring-boot:run

# Package for production
mvn clean package

# Run tests (when implemented)
# mvn test
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server (with proxy to backend)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Setup
```bash
# Backend .env (copy from .env.example)
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET, GEMINI_API_KEY

# Frontend .env (copy from .env.example)
cd frontend
cp .env.example .env
# Edit .env with VITE_API_BASE_URL
```

### Docker Compose (when enabled)
```bash
# Start full stack with MongoDB
# cd to project root and run:
docker-compose up -d

# Stop and remove
docker-compose down
```

## 🔐 Security Configuration

### JWT Authentication
- **Token storage**: localStorage in frontend
- **Authentication**: Spring Security with JWT filter
- **Password encoding**: BCrypt (strength: 10)
- **Session management**: Stateless (JWT only)

### CORS Configuration
- Frontend origins: http://localhost:5173, http://localhost:3000
- WebSocket endpoints: /ws/** (STOMP)

### Role-Based Access Control
- **Admin**: Full access (dashboards, management, reports)
- **Doctor**: Appointments, queue, profile
- **Receptionist**: Patients, appointments, queue, check-in
- **Patient**: Dashboard, doctors, appointments, queue, profile

## 📊 Data Flow

1. **Frontend → Backend**: All API calls via axios with JWT auth
2. **WebSocket Communication**: STOMP for real-time queue updates
3. **AI Integration**: Chatbot service calls Gemini API via backend
4. **Database Operations**: MongoDB collections managed via Spring Data

## 📋 Key Components

### Core Models
- **User**: Base entity with authentication and roles
- **Doctor**: Schedule management, availability, appointments
- **Patient**: Appointment booking, queue status
- **Queue**: Real-time patient queuing system
- **Appointment**: Booking and consultation management
- **Department**: Medical department organization

### Key Services
- **AuthService**: User registration, login, token generation
- **QueueService**: Patient queuing, real-time updates
- **AppointmentService**: Booking, rescheduling, cancellation
- **GeminiService**: AI-powered chatbot integration
- **NotificationService**: In-app and real-time notifications

### API Patterns
- **GET /api/**: Public endpoints (departments, doctors, slots)
- **POST /api/auth/**: Authentication (register, login)
- **JWT secured**: All other endpoints require authentication
- **WebSocket**: /ws/queue/** for real-time updates

## 🔍 Development Best Practices

### Testing
- **Backend**: spring-boot-starter-test dependency available (JUnit 5, Spring Boot Test)
- **Frontend**: No testing framework currently configured
- **Integration**: End-to-end testing can be added as needed

### Code Quality
- **Backend**: Lombok for boilerplate reduction
- **Frontend**: oxlint for code quality
- **Styling**: Tailwind CSS utilities
- **Routing**: Nested layouts with ProtectedRoute wrapper

### Error Handling
- **GlobalExceptionHandler**: Centralized error responses
- **Custom exceptions**: ResourceNotFound, DuplicateResource, SlotUnavailable
- **API responses**: Standardized success/error format

### Real-time Features
- **WebSocket Configuration**: Spring Boot WebSocket + STOMP
- **Frontend Integration**: @stomp/stompjs library
- **Queue updates**: Live patient queue position updates

## 🚨 Common Issues & Solutions

### MongoDB Connection Issues
- Ensure MongoDB is running on port 27017
- Check MONGODB_URI in backend/.env
- Use Docker if local MongoDB is unavailable

### JWT Authentication Issues
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration (86400000 ms = 24 hours)
- Ensure password encoding matches BCrypt

### Build Issues
- Maven: `mvn clean compile` before running
- Frontend: `npm install` after dependency changes
- Environment variables: Check .env files in respective directories

## 📝 Guidelines for New Features

### Adding New Controllers
1. Create new controller class in `backend/src/main/java/com/hospital/smart/controller/`
2. Define REST endpoints with proper validation
3. Implement service layer methods
4. Add repository interfaces if needed
5. Update SecurityConfig for endpoint access

### Adding New Frontend Pages
1. Create new directory under `frontend/src/pages/{role}/`
2. Implement React components
3. Add route in `frontend/src/routes/AppRoutes.jsx`
4. Create service if needed in `frontend/src/services/`
5. Use DashboardLayout for consistent layout

### Database Schema Changes
1. Modify model classes in `backend/src/main/java/com/hospital/smart/model/`
2. Update repositories if needed
3. Create services for new business logic
4. Add DTOs for data transfer
5. Update controllers with new endpoints

## 🔄 Deployment

### Docker
- Dockerfiles exist for both backend and frontend
- docker-compose.yml orchestrates MongoDB, backend, and frontend
- Backend Dockerfile: multi-stage Maven build + JRE runtime
- Frontend Dockerfile: multi-stage Node build + Nginx serving

### Docker Commands
```bash
# Start full stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 🚧 Project Status

This is an existing production-style academic project with comprehensive functionality. The core system is operational with the following verified components:

### ✅ Core Systems Complete
- **Authentication & User Management**: JWT-based auth with BCrypt passwords
- **Doctor & Department Management**: Complete CRUD with scheduling
- **Appointment Booking**: Smart scheduling with slot management
- **Queue Management**: Real-time patient queuing with WebSocket updates
- **Role-Based Access**: Admin, Doctor, Receptionist, and Patient portals
- **AI Integration**: Google Gemini-powered chatbot for appointment assistance
- **Notifications**: In-app and real-time queue updates
- **Analytics**: Dashboard with comprehensive reports and visualizations

### 📊 Technology Stack
- **Backend**: Spring Boot 3.3 + Java 17, MongoDB 7, WebSocket/STOMP
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4
- **Security**: JWT with BCrypt, Spring Security, CORS
- **AI**: Google Gemini API for intelligent scheduling

### 🔄 Development Approach
- **Preserved Architecture**: React + Vite for frontend, Spring Boot for backend
- **Existing API Design**: No unauthorized changes to backend APIs or database models
- **Incremental Development**: All features built following established patterns

### 📝 Best Practices Applied
- **Code Quality**: Lombok boilerplate reduction, oxlint for frontend
- **Error Handling**: GlobalExceptionHandler with custom exceptions
- **Security**: JWT stateless authentication with proper CORS configuration
- **Real-time Features**: WebSocket integration for live queue updates