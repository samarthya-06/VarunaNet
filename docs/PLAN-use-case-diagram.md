# Plan: Use Case Diagram for VarunaNet

## 1. Overview
This document defines the **Use Case Diagram** for VarunaNet, illustrating the functional requirements and interactions between external entities (Actors) and the system.

## 2. Actors
*   **Citizen / Volunteer**: Primary data contributor. Can report hazards and view the map.
*   **Coastal Official (Admin)**: Moderator. Verifies reports and views analytics.
*   **System (Automated)**: Background processes. Handles confidence scoring and social media aggregation.

## 3. PlantUML Code
Copy the code below into a PlantUML editor (or use a VS Code extension) to visualize the diagram.

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Citizen / Volunteer" as citizen
actor "Coastal Official" as official
actor "System Processor" as system <<Automated>>

rectangle "VarunaNet Platform" {
    
    ' Authentication
    usecase "Register / Login" as UC1
    usecase "Manage Application Status" as UC12

    ' Reporting Flow
    usecase "Submit Hazard Report" as UC2
    usecase "Upload Media (Photo/Video)" as UC3
    usecase "Geotag Location" as UC4
    
    ' Visualization Flow
    usecase "View Interactive Map" as UC5
    usecase "Filter Reports" as UC6
    usecase "View Social Feed" as UC7

    ' Verification & Admin Flow
    usecase "Verify / Dismiss Report" as UC8
    usecase "View Analytics Dashboard" as UC9
    
    ' System Processes
    usecase "Calculate Confidence Score" as UC10
    usecase "Aggregate Social Posts" as UC11
    usecase "Generate Hotspots" as UC13

}

' Relationships

' Citizen Actions
citizen -- UC1
citizen -- UC2
citizen -- UC5
(UC2) .> (UC3) : <<include>>
(UC2) .> (UC4) : <<include>>
citizen -- UC7

' Official Actions
official -- UC1
official -- UC5
official -- UC8
official -- UC9
official -- UC12

' System Actions
system -- UC10
system -- UC11
system -- UC13

' Dependencies
(UC8) .> (UC10) : <<utilizes>>
(UC9) .> (UC13) : <<displays>>
(UC10) .> (UC2) : <<triggers>>

@enduml
```

## 4. Key Use Case Descriptions

### UC2: Submit Hazard Report
*   **Actor**: Citizen
*   **Flow**: User captures photo -> Confirms Location -> Adds Description -> Submits.
*   **System Action**: Stores report, triggers Confidence Score calculation (UC10).

### UC8: Verify Report
*   **Actor**: Official
*   **Flow**: Admin views "Pending" reports -> Reviews evidence -> Marks as "Verified" or "Dismissed".
*   **Result**: Updates report status and visibility on the public map.

### UC11: Aggregate Social Posts
*   **Actor**: System Processor
*   **Flow**: Scheduled job fetches tweets/posts with relevant hashtags -> Runs NLP -> Stores as potential hazards.
