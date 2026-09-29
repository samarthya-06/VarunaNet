# Plan: Activity Diagram for VarunaNet

## 1. Overview
This document defines the **Activity Diagram** for VarunaNet, focusing on the core "Hazard Reporting Lifecycle". It details the interactions between the User (Citizen), the Client Device (PWA), the Backend System, and the Admin.

## 2. Key Process flows
1.  **Reporting**: Capture -> Geotag -> Submit.
2.  **Offline Handling**: Check Network -> Store Locally -> Sync when Online.
3.  **Processing**: Validation -> Confidence Calculation.
4.  **Moderation**: Admin Review -> Publish/Reject.

## 3. PlantUML Code
Copy the code below into a PlantUML editor to visualize the workflow.

```plantuml
@startuml
skinparam style strictuml
title VarunaNet Hazard Reporting Workflow

|Citizen|
start
:Open App (PWA);
:Click "Report Hazard";
:Capture Photo/Select Media;
:Confirm GPS Location;
:Add Description & Category;

if (Network Available?) then (No)
  :Save to Local Storage (IndexedDB);
  :Show "Queued for Sync";
  stop
else (Yes)
  :Submit Report;
endif

|System|
:Receive Data;
:Validate Inputs (Zod);
if (Valid?) then (No)
  |Citizen|
  :Show Error Message;
  stop
else (Yes)
  |System|
  :Calculate Base Confidence Score;
  :Save to Database (Postgres);
  :Trigger Notification (WebSocket);
endif

|Admin / Official|
:Receive Verification Request;
:Review Report Details;
if (Verified?) then (Yes)
  :Mark as "Verified";
  :Update Confidence Score (+Boost);
else (No, Dismiss)
  :Mark as "Dismissed";
  :Update Confidence Score (-Penalty);
endif

|System|
:Update Map Visibility;
:Recalculate Hotspots;
stop

@enduml
```

## 4. Diagram Explanation
*   **Swimlanes**: Separates responsibilities between Citizen, System, and Admin.
*   **Decision Diamond (Network)**: Critical PWA feature. Shows how offline reports are handled.
*   **Validation Loop**: Ensures only valid data enters the system.
*   **Verification**: Shows manual human-in-the-loop step for high-certainty data.
