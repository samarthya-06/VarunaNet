# Project Timeline Plan

## Overview
This document outlines the project schedule based on the SDLC waterfall model.
**Total Duration:** October 1, 2025 – January 15, 2026

## Gantt Chart (PlantUML)

```plantuml
@startgantt
Project starts 2025-10-01

' Styling
<style>
ganttDiagram {
  task {
    BackGroundColor LightBlue
    LineColor Blue
  }
}
</style>

' Initial Phases (Short)
[Requirement Analysis] lasts 3 days
[Project Planning] starts at [Requirement Analysis]'s end and lasts 3 days
[System Design] starts at [Project Planning]'s end and lasts 5 days
[Database Design] starts at [System Design]'s end and lasts 5 days

' Development Phases (Long - Majority of time)
[Frontend Development] starts at [Database Design]'s end and lasts 30 days
[Backend Development] starts at [Frontend Development]'s end and lasts 30 days

' Integration & Testing
[Integration] starts at [Backend Development]'s end and lasts 7 days
[Testing & Debugging] starts at [Integration]'s end and lasts 14 days

' Deployment & Closure
[Deployment] starts at [Testing & Debugging]'s end and lasts 3 days
[Documentation] starts at [Deployment]'s end and lasts 4 days
[Final Review & Submission] starts at [Documentation]'s end and lasts 3 days

@endgantt
```

## Task Breakdown

| Phase | Est. Start | Est. Duration |
|-------|------------|---------------|
| Requirement Analysis | Oct 1 | 3 days |
| Project Planning | Oct 4 | 3 days |
| System Design | Oct 7 | 5 days |
| Database Design | Oct 12 | 5 days |
| **Frontend Development** | **Oct 17** | **30 days** |
| **Backend Development** | **Nov 16** | **30 days** |
| Integration | Dec 16 | 7 days |
| Testing & Debugging | Dec 23 | 14 days |
| Deployment | Jan 6 | 3 days |
| Documentation | Jan 9 | 4 days |
| Final Review | Jan 13 | 3 days |
