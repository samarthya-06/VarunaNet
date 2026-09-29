# Project Overview & Executive Summary: VarunaNet

## Executive Summary
**VarunaNet** is an integrated platform for crowdsourced ocean hazard reporting, designed to bridge the gap between citizen observations and official coastal authority action. The platform empowers users to report hazards (oil spills, debris, wildlife strandings) via a mobile-first web interface, while also aggregating social media intelligence to identify "hotspots" of activity.

The system aims to be "Coastal Authority" compliant—authoritative yet approachable—functioning effectively even in low-bandwidth coastal environments. Key features include real-time map visualization, confidence scoring for reports, and role-based dashboards for citizens, officials, and analysts.

## Tech Stack

### Frontend (Web/PWA)
*   **Framework**: React 18 (Vite)
*   **Language**: JavaScript (ES6+)
*   **Styling**: TailwindCSS (v3.4), Framer Motion (animations)
*   **Maps**: Leaflet (`react-leaflet`)
*   **State/Routing**: React Router DOM, Context API
*   **PWA**: `vite-plugin-pwa` (Offline support, Service Workers)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### Backend (API)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL (v14+) with PostGIS extension
*   **ORM**: Sequelize
*   **Authentication**: Passport.js (Google OAuth), JWT, Bcrypt
*   **Validation**: Zod
*   **Security**: Helmet, CORS, Express Rate Limit
*   **Logging**: Pino, Sentry

### Infrastructure & DevOps
*   **Containerization**: (Planned) Docker
*   **CI/CD**: (Planned) GitHub Actions
*   **Hosting**: (Current Local) Node/Vite Dev Servers

## Project Structure Overview
```
VarunaNet/
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route views (Report, AdminPanel, etc.)
│   │   ├── services/    # API integration
│   │   └── context/     # Global state
├── backend/
│   ├── src/
│   │   ├── config/      # DB & Auth config
│   │   ├── models/      # Sequelize definitions
│   │   ├── routes/      # API endpoints
│   │   ├── controllers/ # Request logic
│   │   └── scripts/     # Utility scripts
├── docs/                # Planning & Documentation
└── Design.txt           # Design Source of Truth
```

## Success Criteria
1.  **Functional Parity**: Codebase matches `Design.txt` specifications.
2.  **Executive Clarity**: Stakeholders understand the system architecture and status.
3.  **Verification**: All core paths (Report Submission, Admin Review, Map Visualization) are tested and working.

## Task Breakdown: Baseline & Verification

### Phase 1: Audit & Analysis
- [ ] **Frontend Audit**: Verify UI against "Ocean + Clarity" design language (Colors, Typography). -> Verify: `ux_audit.py`
- [ ] **Backend Audit**: Verify API endpoints against requirements (Reports, Auth). -> Verify: `curl` tests
- [ ] **Database Audit**: Confirm Schema includes User, Report, SocialPost, Hotspot tables. -> Verify: `schema_validator.py`

### Phase 2: Gap Closure (Planning)
- [ ] **Identify Missing Features**: Compare implemented features vs `Design.txt`.
- [ ] **Create Remediation Plan**: Plan tasks for missing features (e.g., NLP pipeline, Hotspot engine).

### Phase 3: Documentation
- [x] **Executive Summary**: Create this plan file. -> Verify: File exists.
- [ ] **API Documentation**: Document available endpoints. -> Verify: `endpoints.md`

## Phase X: Verification Checklist
- [ ] **Build Check**: `npm run build` passes for both frontend and backend.
- [ ] **Lint Check**: Code follows clean code standards.
- [ ] **Security Scan**: No critical vulnerabilities in `npm audit`.
- [ ] **User Flow**: "Report Hazard" flow works end-to-end.
- [ ] **Mobile Responsive**: UI is usable on mobile viewports.
