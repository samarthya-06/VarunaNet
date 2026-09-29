# VarunaNet - Comprehensive Project Documentation

> **Purpose**: Complete technical documentation for professor presentation covering architecture, tech stack, features, code structure, database design, and implementation logic.

---

## 1. Project Overview

### What is VarunaNet?

**VarunaNet** is an integrated web application for **crowdsourced ocean hazard reporting** combined with **social media analytics**. It enables citizens to report coastal hazards (pollution, debris, oil spills) while authorities can verify, moderate, and analyze data through role-based dashboards.

### Key Features
| Feature | Description |
|---------|-------------|
| **Hazard Reporting** | GPS-enabled report submission with photo upload |
| **Interactive Map** | Leaflet-based map showing verified hazards |
| **Hotspot Detection** | Grid-based clustering algorithm for hazard concentration |
| **NLP Analysis** | Keyword-based hazard detection from social media |
| **Role-Based Access** | Citizen, Volunteer, Official, Analyst, Admin roles |
| **Offline Support** | IndexedDB queue for offline report submission |
| **Admin Dashboard** | Report moderation queue with verify/dismiss actions |

### Design Goals
- Mobile-first, minimal friction reporting (camera + geotag in 2 taps)
- Clear map-first situational awareness (hotspots, confidence)
- Explainable analytics (show why posts/reports are flagged)
- Fast, accessible, and resilient on coastal networks

---

## 2. Tech Stack

### Backend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | - |
| **Express.js** | Web framework | v4.19.2 |
| **Sequelize** | ORM (Object-Relational Mapper) | v6.37.3 |
| **PostgreSQL** | Relational database | - |
| **JWT** | Authentication tokens | jsonwebtoken v9.0.3 |
| **Passport.js** | Google OAuth integration | v0.7.0 |
| **bcryptjs** | Password hashing | v3.0.3 |
| **Multer** | File upload handling | v2.0.2 |
| **Helmet** | Security headers | v8.1.0 |
| **express-rate-limit** | Rate limiting | v8.2.1 |
| **Pino** | Structured logging | v10.3.0 |
| **Sentry** | Error monitoring | v10.38.0 |
| **Zod** | Input validation | v4.3.6 |

### Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | v18.2.0 |
| **Vite** | Build tool & dev server | v5.2.0 |
| **React Router** | Client-side routing | v6.22.3 |
| **Leaflet** | Interactive maps | v1.9.4 |
| **react-leaflet** | React bindings for Leaflet | v4.2.1 |
| **Recharts** | Data visualization | v3.6.0 |
| **react-hook-form** | Form handling | v7.51.3 |
| **Axios** | HTTP client | v1.6.8 |
| **idb** | IndexedDB wrapper (offline) | v8.0.0 |
| **vite-plugin-pwa** | PWA capabilities | v1.2.0 |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐│
│  │ Landing │ │  Auth   │ │Dashboard│ │  Feed   │ │ AdminPanel  ││
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘│
│       └──────────┬┴──────────┴┬───────────┴─────────────┘       │
│                  │  API Service (Axios)   │                      │
│                  │  Offline Service (idb) │                      │
└──────────────────┼────────────────────────┼──────────────────────┘
                   │        HTTP/REST       │
                   ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Middleware Layer                          │ │
│  │  [Helmet] [CORS] [Rate Limit] [Pino Logger] [Passport]    │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │  Auth   │ │ Reports │ │Hotspots │ │Analytics│ │  Social   │ │
│  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │ │  Routes   │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘ │
│       │           │           │           │             │       │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌─────┴─────┐ │
│  │  Auth   │ │ Report  │ │ Hotspot │ │Analytics│ │  Social   │ │
│  │Controller│ │Controller│ │Controller│ │Controller│ │Controller│ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘ │
│       │           │           │           │             │       │
│       │           │           │           │      ┌──────┴──────┐│
│       │           │           │           │      │ NLP Service ││
│       │           │           │           │      └─────────────┘│
│       └───────────┴───────────┴───────────┴─────────────────────┤
│                        Sequelize ORM                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      PostgreSQL Database       │
              │  ┌─────────────────────────┐  │
              │  │ users | reports | social│  │
              │  └─────────────────────────┘  │
              └───────────────────────────────┘
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────────┐
│      users      │         │       reports       │
├─────────────────┤         ├─────────────────────┤
│ id (PK)         │◄────────│ user_id (FK)        │
│ email (unique)  │         │ id (PK)             │
│ password (hash) │         │ hazard_type         │
│ name            │         │ description         │
│ googleId        │         │ image_url           │
│ role (enum)     │         │ latitude            │
│ avatar_url      │         │ longitude           │
│ created_at      │         │ status (enum)       │
│ updated_at      │         │ confidence_score    │
└─────────────────┘         │ created_at          │
                            │ updated_at          │
                            └─────────────────────┘

┌─────────────────────┐
│    social_posts     │
├─────────────────────┤
│ id (PK)             │
│ platform (enum)     │
│ content             │
│ author              │
│ sentiment_score     │
│ location            │
│ posted_at           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Table Details

#### `users` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `email` | STRING | NOT NULL, UNIQUE | User email address |
| `password` | STRING | NULLABLE | Bcrypt hashed password (null for OAuth) |
| `name` | STRING | NULLABLE | Display name |
| `googleId` | STRING | UNIQUE | Google OAuth identifier |
| `role` | ENUM | DEFAULT 'citizen' | citizen, volunteer, official, analyst |
| `avatar_url` | STRING | NULLABLE | Profile picture URL |

#### `reports` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `hazard_type` | STRING | NOT NULL | Type: pollution, debris, oil_spill, etc. |
| `description` | TEXT | NULLABLE | User description of hazard |
| `image_url` | STRING | NULLABLE | Path to uploaded image |
| `latitude` | FLOAT | NOT NULL | GPS latitude coordinate |
| `longitude` | FLOAT | NOT NULL | GPS longitude coordinate |
| `status` | STRING | DEFAULT 'pending' | pending, verified, dismissed |
| `confidence_score` | FLOAT | DEFAULT 0.0 | 0.0 to 1.0 scale |
| `user_id` | INTEGER | FK → users.id | Report submitter (nullable for anonymous) |

#### `social_posts` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| `platform` | ENUM | NOT NULL | twitter, instagram, facebook |
| `content` | TEXT | NOT NULL | Post content text |
| `author` | STRING | NOT NULL | Social media username |
| `sentiment_score` | FLOAT | DEFAULT 0.0 | NLP sentiment analysis result |
| `location` | STRING | NULLABLE | Location string (e.g., "Mumbai, India") |
| `posted_at` | DATE | DEFAULT NOW | Original post timestamp |

---

## 5. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create new user account |
| POST | `/login` | Public | Email/password login → JWT token |
| GET | `/google` | Public | Initiate Google OAuth flow |
| GET | `/google/callback` | Public | Google OAuth callback |
| GET | `/profile` | Required | Get current user profile |
| PUT | `/profile` | Required | Update user profile |

### Reports (`/api/reports`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Optional | Get reports (with bbox filtering & pagination) |
| POST | `/` | Optional | Create new hazard report |
| GET | `/my` | Required | Get authenticated user's reports |
| GET | `/pending` | Admin/Official | Get pending reports for moderation |
| GET | `/:id` | Public | Get single report by ID |
| POST | `/:id/verify` | Admin/Official | Verify or dismiss a report |

### Hotspots (`/api/hotspots`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get clustered hotspot data |

### Analytics (`/api/analytics`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/keywords` | Analyst | Get hazard type trends & statistics |

### Social Feed (`/api/social`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/feed` | Public | Get NLP-analyzed social media feed |

---

## 6. Code File Structure & Responsibilities

### Backend Structure
```
backend/
├── server.js                    # Entry point (starts app)
├── src/
│   ├── index.js                 # Database sync & server startup
│   ├── app.js                   # Express app configuration
│   │
│   ├── config/
│   │   ├── index.js             # Environment configuration
│   │   ├── db.js                # Sequelize database connection
│   │   ├── logger.js            # Pino logger configuration
│   │   ├── passport.js          # Google OAuth strategy
│   │   └── upload.js            # Multer file upload config
│   │
│   ├── models/
│   │   ├── user.model.js        # User schema + password hooks
│   │   ├── report.model.js      # Report schema
│   │   └── social_post.model.js # Social post schema
│   │
│   ├── controllers/
│   │   ├── auth.controller.js   # Register, Login, Profile
│   │   ├── report.controller.js # CRUD + verification logic
│   │   ├── hotspot.controller.js# Grid clustering algorithm
│   │   ├── analytics.controller.js # Stats aggregation
│   │   ├── social.controller.js # Social feed + NLP
│   │   └── health.controller.js # Health check endpoint
│   │
│   ├── routes/
│   │   ├── auth.routes.js       # /api/auth/* routes
│   │   ├── report.routes.js     # /api/reports/* routes
│   │   ├── hotspot.routes.js    # /api/hotspots/* routes
│   │   ├── analytics.routes.js  # /api/analytics/* routes
│   │   ├── social.routes.js     # /api/social/* routes
│   │   └── health.routes.js     # /health route
│   │
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT verification middleware
│   │
│   ├── services/
│   │   └── nlp.service.js       # Keyword-based hazard detection
│   │
│   └── validators/
│       └── report.validator.js  # Zod schema validation
│
└── uploads/                     # Stored image uploads
```

### Frontend Structure
```
frontend/
├── index.html                   # HTML entry point
├── vite.config.js              # Vite configuration
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main app with routing
│   ├── index.css               # Global styles (ocean theme)
│   │
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing page
│   │   ├── Auth.jsx            # Login/Register form
│   │   ├── AuthCallback.jsx    # OAuth callback handler
│   │   ├── Home.jsx            # Main map view
│   │   ├── Dashboard.jsx       # User dashboard
│   │   ├── Report.jsx          # Report submission form
│   │   ├── Feed.jsx            # Social media feed
│   │   └── AdminPanel.jsx      # Admin moderation queue
│   │
│   ├── components/
│   │   ├── Layout.jsx          # Navigation + layout wrapper
│   │   ├── ProtectedRoute.jsx  # Auth route guard
│   │   └── MapView/
│   │       └── index.jsx       # Leaflet map component
│   │
│   ├── context/
│   │   └── AuthContext.jsx     # React auth state management
│   │
│   └── services/
│       ├── api.js              # Axios API client + interceptors
│       └── offline.js          # IndexedDB offline queue
│
└── public/
    └── favicon.ico             # App icon
```

---

## 7. Feature Implementation Logic

### 7.1 User Authentication Flow

```
Registration:
1. User submits email + password
2. Server validates input
3. Password hashed with bcrypt (10 rounds) via Sequelize hooks
4. User saved to database
5. JWT token generated with { id, email, role }
6. Token returned to frontend → stored in localStorage

Login:
1. User submits credentials
2. Check for admin credentials (hardcoded)
3. Find user by email in database
4. Compare password with bcrypt.compare()
5. Generate JWT token
6. Return token + user profile

Google OAuth:
1. Redirect to /api/auth/google
2. Passport.js handles OAuth flow
3. On callback, find or create user by googleId
4. Generate JWT token
5. Redirect to frontend with token in URL
```

### 7.2 Report Submission Flow

```
1. User opens Report page
2. Camera captures photo → stored in state
3. GPS coordinates fetched via navigator.geolocation
4. User selects hazard type + optional description
5. Form submitted as multipart/form-data
6. Backend:
   - Multer saves image to /uploads/
   - Report created with status='pending', confidence=0.0
   - User ID attached from JWT (if authenticated)
7. Response returned to frontend
8. If offline: saved to IndexedDB via offline.js
```

### 7.3 Hotspot Clustering Algorithm

**Location:** `backend/src/controllers/hotspot.controller.js`

```javascript
// Grid-based clustering (approx 1km blocks)
const CLUSTER_PRECISION = 2; // 2 decimal places ≈ 1.1km

Algorithm:
1. Fetch all reports within time window
2. For each report:
   - Round lat/lon to 2 decimal places
   - Create key: "${gridLat}_${gridLon}"
   - Accumulate: count, lat/lon sums, hazard types
3. For each cluster:
   - Calculate centroid (average lat/lon)
   - Determine dominant hazard type
   - Calculate intensity: min(1.0, count×0.2 + avgConfidence×0.5)
4. Sort by count descending
5. Return top N hotspots
```

### 7.4 NLP Hazard Detection

**Location:** `backend/src/services/nlp.service.js`

```javascript
HAZARD_KEYWORDS = [
  'debris', 'garbage', 'plastic', 'oil', 'spill',
  'sewage', 'pollution', 'dead fish', 'stranded'...
];

URGENCY_KEYWORDS = [
  'huge', 'massive', 'emergency', 'danger', 'toxic'...
];

Algorithm:
1. Normalize text to lowercase
2. Find matching hazard keywords
3. Count urgency keywords (each adds 0.2)
4. Calculate confidence:
   - Base: 0.5 if any hazard keyword found
   - Bonus: +0.1 per additional keyword
   - Urgency: +0.2 per urgency word
   - Cap: 0.95 maximum
5. Return: { is_hazard, keywordsFound, confidence }
```

### 7.5 Report Verification Flow

**Location:** `backend/src/controllers/report.controller.js`

```
1. Admin/Official views pending reports queue
2. Clicks Verify or Dismiss button
3. Backend:
   - Validates status is 'verified' or 'dismissed'
   - Updates report.status
   - If verified: confidence_score += 0.3 (capped at 1.0)
   - Saves to database
4. Only verified reports appear on public map
```

### 7.6 Offline Support

**Location:** `frontend/src/services/offline.js`

```javascript
Uses: idb (IndexedDB wrapper)

Flow:
1. User submits report while offline
2. api.js catches network error
3. offlineService.saveReport() stores to IndexedDB
4. User sees "Report saved offline" message
5. When online, app syncs pending reports
```

---

## 8. Security Implementation

| Security Measure | Implementation | File |
|-----------------|----------------|------|
| **Helmet.js** | Security headers (XSS, CSP, etc.) | `app.js` |
| **CORS** | Configured allowed origins | `app.js` |
| **Rate Limiting** | 100 req/15min general, 20 for auth | `app.js` |
| **Password Hashing** | bcrypt with 10 salt rounds | `user.model.js` |
| **JWT Authentication** | Stateless token auth | `auth.controller.js` |
| **Input Validation** | Zod schema validation | `validators/` |
| **SQL Injection Prevention** | Sequelize ORM parameterized queries | models |
| **Error Logging** | Pino structured logging | `config/logger.js` |
| **Error Monitoring** | Sentry integration | `app.js` |

---

## 9. Visual Design System

### Color Palette
| Name | Hex Code | Usage |
|------|----------|-------|
| Offshore Blue | `#061A2B` | Background |
| Sea Glass | `#0E3B4B` | Cards/Surfaces |
| Tide Teal | `#06B6A4` | Primary CTA |
| Coral Amber | `#FF8A65` | Warnings |
| Ivory | `#F8FAFC` | Text |
| Mist Gray | `#9AA7B2` | Muted text |
| Deep Cyan | `#008E8C` | Verified status |
| Pale Coral | `#FFC9B3` | Unverified |

### Typography
- **Headings**: Inter / Poppins (bold)
- **Body**: Inter (regular)
- **Monospace**: JetBrains Mono

---

## 10. Running the Application

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm/yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env with DB credentials
npm run dev  # Starts on port 3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on port 5173
```

### Environment Variables (Backend)
```
DATABASE_URL=postgres://user:pass@localhost:5432/varunanet
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

---

## 11. Summary for Presentation

### Key Technical Highlights

1. **Full-Stack JavaScript** - React + Node.js + PostgreSQL
2. **RESTful API** - 6 route modules, proper HTTP methods
3. **JWT Authentication** - Stateless auth with role-based access
4. **Google OAuth** - Passport.js integration
5. **Geospatial Features** - Leaflet maps + grid-based clustering
6. **NLP Analysis** - Keyword-based hazard detection
7. **Offline Support** - IndexedDB for network resilience
8. **Security** - Helmet, rate limiting, bcrypt, Zod validation
9. **Modern Tooling** - Vite, ESLint, Pino logging
10. **Clean Architecture** - MVC pattern, separation of concerns

### Presentation Talking Points

1. **Problem Statement**: Coastal hazard reporting lacks real-time data
2. **Solution**: Crowdsourced platform + social media intelligence
3. **Tech Choices**: Why React? Why PostgreSQL? Why Leaflet?
4. **Algorithm Deep-Dive**: Hotspot clustering, NLP confidence scoring
5. **Security Considerations**: Authentication, rate limiting, validation
6. **Demo Flow**: Register → Submit Report → View Map → Admin Verify
