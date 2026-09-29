# Project Plan: VarunaNet Timeline (Gantt)

## Goal Description
This document provides a visualization of the project timeline for **VarunaNet** (Crowdsourced Ocean Hazard Platform) from **December 1, 2025** to **February 5, 2026**.

## Gantt Chart (PlantUML)

You can render the chart below using the [PlantUML](https://plantuml.com/gantt-diagram) VS Code extension or any online PlantUML viewer.

```plantuml
@startgantt
Project starts 2025-12-01

' Styling
<style>
ganttDiagram {
  task {
    BackGroundColor GreenYellow
    LineColor Green 
    unstarted {
      BackGroundColor Fuchsia 
      LineColor FireBrick
    }
  }
}
</style>

' Phase 1: Inception & Setup
[Phase 1: Inception & Setup] as [P1] starts 2025-12-01 and lasts 10 days
[Repo Init & Tech Stack Selection] lasts 3 days and starts at 2025-12-01
[Database Design (Schema/ERD)] lasts 4 days and starts at 2025-12-04
[Basic Auth & Roles Setup] lasts 3 days and starts at 2025-12-08

' Phase 2: Core Reporting & Map
[Phase 2: Core Reporting] as [P2] starts 2025-12-11 and lasts 18 days
[Backend: Report API & Uploads] lasts 7 days and starts at 2025-12-11
[Frontend: User Forms & Camera] lasts 6 days and starts at 2025-12-15
[Map Integration (Leaflet/PostGIS)] lasts 8 days and starts at 2025-12-21
[P2] -> [P3]

' Phase 3: Advanced Features
[Phase 3: Advanced & Admin] as [P3] starts 2026-01-01 and lasts 20 days
[Admin Dashboard & Moderation] lasts 10 days and starts at 2026-01-01
[Hotspot Clustering Algorithm] lasts 7 days and starts at 2026-01-10
[Social Media NLP Integration] lasts 8 days and starts at 2026-01-12

' Phase 4: UI/UX & PWA
[Phase 4: Refining UX] as [P4] starts 2026-01-20 and lasts 12 days
[PWA Configuration (Offline/Workers)] lasts 5 days and starts at 2026-01-20
[Feed UI & Visual Polish] lasts 5 days and starts at 2026-01-25
[Refine Filters & Search] lasts 4 days and starts at 2026-01-28

' Phase 5: Verification & Launch
[Phase 5: Verification] as [P5] starts 2026-02-01 and ends 2026-02-05
[Security Audit (Helmet/Rate Limit)] lasts 2 days and starts at 2026-02-01
[Final QA & Bug Fixes] lasts 3 days and starts at 2026-02-03
[Documentation & Handoff] lasts 1 days and starts at 2026-02-05

@endgantt
```

## Task Breakdown

### Phase 1: Inception (Dec 1 - Dec 10)
- **Goal:** Establish foundation.
- Tasks:
  - Initialize Node.js/React structure.
  - Define PostgreSQL/PostGIS schema.
  - Implement JWT Authentication.

### Phase 2: Core Development (Dec 11 - Dec 31)
- **Goal:** Enable data collection.
- Tasks:
  - Report submission API (Multipart/form-data).
  - Geometry storage in PostGIS.
  - Interactive Map component.

### Phase 3: Intelligence (Jan 1 - Jan 20)
- **Goal:** Add value to data.
- Tasks:
  - Admin verification queues.
  - `ST_ClusterDBSCAN` for hotspots.
  - Mock/MVP NLP service for social posts.

### Phase 4: Refinement (Jan 21 - Jan 31)
- **Goal:** Improve UX using PWA standards.
- Tasks:
  - Manifest & Service Workers.
  - Responsive visual design.

### Phase 5: Finalization (Feb 1 - Feb 5)
- **Goal:** Production readiness.
- Tasks:
  - Security hardening.
  - Final documentation (ERD, API docs).
