# Resource and Task Allocation Plan: VarunaNet

**Based on Project Timeline:** Dec 1, 2025 – Feb 5, 2026  
**Reference:** [PLAN-project-gantt.md](./PLAN-project-gantt.md)

This document outlines the resource requirements and detailed task assignments effectively mapping the Gantt chart schedule to team roles.

---

## 1. Resource Allocation Sheet

**Team Structure Assumptions:**
*   **Project Manager (PM)**: Oversees timeline, requirements, and handoff.
*   **Backend Developer (BE)**: Handles Node.js, PostgreSQL/PostGIS, Redis, API logic.
*   **Frontend/PWA Developer (FE)**: Handles React, Leaflet Maps, PWA Config, Mobile responsiveness.
*   **UI/UX Designer (Des)**: Creates visual assets, wireframes, and high-fidelity mockups.
*   **DevOps/QA Engineer (QA)**: Infrastructure setup, Security audits, Testing, CI/CD.

| Resource Role | Count | Primary Responsibilities | Availability Required |
| :--- | :---: | :--- | :--- |
| **Project Manager** | 1 | Planning, Requirement Analysis, Moderation Strategy, Documentation | Part-time (20%) |
| **Backend Lead** | 1 | DB Schema, API Endpoints, Geo-spatial Queries, Auth, Social NLP | Full-time (100%) |
| **Frontend Dev** | 1 | React Components, Map Integration, Camera access, PWA Offline | Full-time (100%) |
| **UI/UX Designer** | 0.5 | App prototyping, Iconography, Visual Polish, Accessibility check | Part-time (50%) |
| **DevOps / QA** | 0.5 | Server setup, Database tuning, Security Hardening, Bug verification | Part-time (50%) |

---

## 2. Task Allocation Sheet

This table aligns specific tasks from the Gantt chart with the assigned resources.

### Phase 1: Inception & Setup (Dec 1 - Dec 10)

| Task Name | Assigned Resource | Start Date | End Date | Duration | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Repo Init & Tech Stack** | PM, BE, FE | 2025-12-01 | 2025-12-03 | 3 Days | None |
| **Database Design (ERD)** | BE | 2025-12-04 | 2025-12-07 | 4 Days | Tech Stack |
| **Basic Auth & Roles** | BE | 2025-12-08 | 2025-12-10 | 3 Days | Database |

### Phase 2: Core Reporting & Map (Dec 11 - Dec 31)

| Task Name | Assigned Resource | Start Date | End Date | Duration | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Report API & Media Uploads** | BE | 2025-12-11 | 2025-12-17 | 7 Days | Auth |
| **User Forms & Camera UI** | FE, Des | 2025-12-15 | 2025-12-20 | 6 Days | API Draft |
| **Map Integration (Leaflet)** | FE | 2025-12-21 | 2025-12-28 | 8 Days | API & Forms |

### Phase 3: Advanced Features (Jan 1 - Jan 20)

| Task Name | Assigned Resource | Start Date | End Date | Duration | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | FE, BE | 2026-01-01 | 2026-01-10 | 10 Days | Core Reporting |
| **Hotspot Algorithm (DBSCAN)** | BE | 2026-01-10 | 2026-01-16 | 7 Days | Geo Data |
| **Social Media NLP Service** | BE | 2026-01-12 | 2026-01-19 | 8 Days | None (Parallel) |

### Phase 4: UI/UX & PWA Refinement (Jan 21 - Jan 31)

| Task Name | Assigned Resource | Start Date | End Date | Duration | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PWA Config (Service Workers)**| FE | 2026-01-20 | 2026-01-24 | 5 Days | Core App |
| **Feed UI & Visual Polish** | Des, FE | 2026-01-25 | 2026-01-29 | 5 Days | Core App |
| **Refine Filters & Search** | FE | 2026-01-28 | 2026-01-31 | 4 Days | Map Integration |

### Phase 5: Verification & Launch (Feb 1 - Feb 5)

| Task Name | Assigned Resource | Start Date | End Date | Duration | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Security Audit** | QA, BE | 2026-02-01 | 2026-02-02 | 2 Days | All Code |
| **Final QA & Bug Fixes** | QA, FE, BE | 2026-02-03 | 2026-02-05 | 3 Days | Audit |
| **Documentation & Handoff** | PM | 2026-02-04 | 2026-02-05 | 2 Days | Functional App |

---

## 3. Weekly Focus Summary

*   **Week 1 (Dec 1-7)**: Architecture & Database.
*   **Week 2 (Dec 8-14)**: Authentication & Backend Core.
*   **Week 3 (Dec 15-21)**: Frontend Forms & Camera Access.
*   **Week 4 (Dec 22-28)**: Map Integration (Geospatial).
*   **Week 5 (Jan 1-7)**: Admin Panel & Moderation Tools.
*   **Week 6 (Jan 8-14)**: Algorithms (Hotspots) & NLP.
*   **Week 7 (Jan 15-21)**: Service Integration & PWA Setup.
*   **Week 8 (Jan 22-31)**: UI Polish & User Experience.
*   **Week 9 (Feb 1-5)**: Security, Testing, & Final Delivery.
