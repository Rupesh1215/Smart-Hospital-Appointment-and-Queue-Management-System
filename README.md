# 🏥 Smart Hospital — Appointment Management System

A modern, AI-powered hospital appointment management platform built with **React + Vite** frontend and **Java Spring Boot** backend, using **MongoDB** for data storage and **Google Gemini** for intelligent appointment assistance.

---

## ✨ Features

- **Smart Appointment Booking** — AI-powered slot recommendations with double-booking prevention
- **Real-Time Queue Tracking** — Live queue position and estimated waiting time via WebSocket
- **AI Chatbot** — Natural language appointment booking powered by Google Gemini
- **Role-Based Access** — Admin, Doctor, Receptionist, and Patient portals
- **Dynamic Scheduling** — Automatic slot generation based on doctor availability
- **Analytics Dashboard** — Comprehensive reports and visualizations
- **Notification System** — In-app appointment reminders and queue updates
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓ Axios / REST APIs
Backend (Spring Boot 3)
    ↓ Spring Data MongoDB
Database (MongoDB 7)

AI Flow:
React Chatbot → Spring Boot AI Controller → Google Gemini API
                                           ↓
                        Appointment / Doctor / Queue Data
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 4, React Router 6, Axios |
| Backend | Java 17, Spring Boot 3.3, Spring Security 6, Spring Data MongoDB |
| Database | MongoDB 7 |
| AI | Google Gemini API |
| Auth | JWT (jjwt 0.12.6) + BCrypt |
| Real-time | WebSocket / STOMP |
| Build | Maven (backend), npm (frontend) |
| Containerization | Docker + Docker Compose |

---

## 📋 Prerequisites

- **Java 17+** — `java -version`
- **Maven 3.9+** — `mvn -version`
- **Node.js 18+** — `node -v`
- **MongoDB 7.x** — running locally on port 27017
- **Git** — `git --version`

### Optional
- **Docker** — for running MongoDB via container

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Smart Hospital"
```

### 2. Start MongoDB

**Option A — Local MongoDB:**
```bash
mongod --dbpath /data/db
```

**Option B — Docker:**
```bash
docker-compose up mongodb -d
```

### 3. Backend Setup

```bash
cd backend

# Copy env template
cp .env.example .env
# Edit .env with your values

# Build and run
mvn clean compile
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

Health check: **http://localhost:8080/api/health**

### 4. Frontend Setup

```bash
cd frontend

# Copy env template
cp .env.example .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts at: **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart_hospital` |
| `JWT_SECRET` | JWT signing key (min 256 bits) | `your-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## 📁 Project Structure

```
Smart Hospital/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/hospital/smart/
│   │   ├── config/             # Security, CORS, MongoDB, WebSocket
│   │   ├── controller/         # REST API controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # MongoDB repositories
│   │   ├── model/              # Data models
│   │   ├── dto/                # Data transfer objects
│   │   ├── security/           # JWT auth filter
│   │   ├── exception/          # Exception handlers
│   │   └── util/               # Utilities
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components by role
│   │   ├── services/           # API service modules
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Constants, validators, date utils
│   │   ├── routes/             # Routing configuration
│   │   └── styles/             # Global CSS
│   ├── index.html
│   └── vite.config.js
├── docker-compose.yml          # MongoDB container
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/doctors` | List doctors |
| `GET` | `/api/doctors/{id}/slots` | Get available slots |
| `POST` | `/api/appointments` | Book appointment |
| `GET` | `/api/queues/{doctorId}` | Get queue |
| `POST` | `/api/chatbot/message` | AI chatbot |

*Full API documentation will be added as endpoints are implemented.*

---

## 📸 Screenshots

*Coming soon — screenshots will be added after all dashboard phases are complete.*

---

## 🚧 Development Phases

- [x] Phase 1 — Project setup and structure
- [x] Phase 2 — MongoDB models and repositories
- [x] Phase 3 — Authentication and JWT
- [x] Phase 4 — Doctor and department management
- [x] Phase 5 — Appointment booking
- [x] Phase 6 — Availability and slot generation
- [x] Phase 7 — Queue management
- [x] Phase 8 — Real-time queue updates
- [x] Phase 9 — Patient dashboard
- [x] Phase 10 — Receptionist dashboard
- [x] Phase 11 — Doctor dashboard
- [x] Phase 12 — Admin dashboard
- [x] Phase 13 — Gemini AI integration
- [x] Phase 14 — Notifications
- [x] Phase 15 — Analytics
- [x] Phase 16 — Testing & Build Verification
- [ ] Phase 17 — Docker support
- [ ] Phase 18 — Deployment preparation

---

## 📄 License

This project is for educational and demonstration purposes.
