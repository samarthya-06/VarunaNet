# Plan: Entity Relationship Diagram for VarunaNet (Chen's Notation)

## 1. Overview
This document defines the **Entity Relationship Diagram (ERD)** for VarunaNet using **Chen's Notation**.
*   **Rectangles**: Entities
*   **Diamonds**: Relationships
*   **Ellipses**: Attributes
*   **Lines**: Connections with Cardinality (1, N)

## 2. PlantUML Code (Chen's Style)
Copy the code below into a PlantUML editor.

```plantuml
@startuml
' Use standard styling for distinct shapes
skinparam linetype ortho
skinparam roundcorner 10

' -----------------------------------------
' Definitions for Chen Notation Shapes
' -----------------------------------------
!define ENTITY rectangle
!define RELATIONSHIP diamond
!define ATTRIBUTE ellipse

' -----------------------------------------
' Entities
' -----------------------------------------
ENTITY User as E_User #lightblue
ENTITY Report as E_Report #lightgreen
ENTITY SocialPost as E_Social #lightyellow
ENTITY Hotspot as E_Hotspot #pink

' -----------------------------------------
' Relationships
' -----------------------------------------
RELATIONSHIP "Submits" as R_Submits
RELATIONSHIP "Contains" as R_Contains
RELATIONSHIP "Aggregates" as R_Aggregates
RELATIONSHIP "Has" as R_Has 

' -----------------------------------------
' Connectivity & Cardinality
' -----------------------------------------

' User -- Submits -- Report (1:N)
E_User "1" == R_Submits
R_Submits == "N" E_Report

' Hotspot -- Contains -- Report (1:N)
E_Hotspot "1" == R_Contains
R_Contains == "N" E_Report

' Hotspot -- Aggregates -- SocialPost (1:N)
E_Hotspot "1" == R_Aggregates
R_Aggregates == "N" E_Social

' -----------------------------------------
' Key Attributes (Simplification: Showing PKs/Important Fields)
' -----------------------------------------

' User Attributes
ATTRIBUTE "email" as A_User_Email
ATTRIBUTE "role" as A_User_Role
E_User -- A_User_Email
E_User -- A_User_Role

' Report Attributes
ATTRIBUTE "hazard_type" as A_Report_Type
ATTRIBUTE "status" as A_Report_Status
ATTRIBUTE "latitude" as A_Report_Lat
ATTRIBUTE "confidence" as A_Report_Conf
E_Report -- A_Report_Type
E_Report -- A_Report_Status
E_Report -- A_Report_Lat
E_Report -- A_Report_Conf

' Hotspot Attributes
ATTRIBUTE "severity" as A_Hotspot_Sev
E_Hotspot -- A_Hotspot_Sev

' SocialPost Attributes
ATTRIBUTE "platform" as A_Social_Plat
ATTRIBUTE "sentiment" as A_Social_Sent
E_Social -- A_Social_Plat
E_Social -- A_Social_Sent

@enduml
```

## 3. Relationship Explanations
1.  **User -[Submits]-> Report**: A single user (1) can submit many reports (N). The relationship is "Submits".
2.  **Hotspot -[Contains]-> Report**: A hotspot (1) is a cluster definition that contains many individual reports (N).
3.  **Hotspot -[Aggregates]-> SocialPost**: A hotspot (1) also aggregates relevant social media posts (N) in that area.

## 4. Cardinality
*   **1** = One side (Parent/Source)
*   **N** = Many side (Child/Target)
