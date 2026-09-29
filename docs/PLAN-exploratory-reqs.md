# Exploratory Study for Requirements Identification: VarunaNet

## 1. Purpose of the Study
The purpose of this exploratory study is to assess the technical feasibility, user needs, and operational constraints for **VarunaNet**, a crowdsourced ocean hazard reporting platform. This study aims to bridge the gap between high-level design concepts ("Coastal Authority" vibe, real-time analytics) and concrete implementation details, ensuring the final system is robust, scalable, and accessible in low-bandwidth coastal environments.

## 2. Objectives
1.  **Define Technical Scope**: Identify the specific architectural components required to support real-time mapping, multimedia uploads, and offline-first PWA functionality.
2.  **Assess Feasibility**: Evaluate the integration of "Hotspot" algorithms and NLP-based social media analysis within a Node.js/PostgreSQL ecosystem.
3.  **Identify Constraints**: Determine the minimum hardware and software configurations for both the server infrastructure and end-user devices, particularly focusing on mobile performance.
4.  **Establish Baseline**: Create a reference document for verified hardware/software prerequisites to guide development and deployment.

## 3. Target Audience
This study addresses the needs of the following key stakeholders:
*   **Development Team**: To understand architectural decisions, dependency versions, and performance targets.
*   **System Administrators / DevOps**: To provision appropriate server infrastructure (storage, compute, database).
*   **Coastal Authorities & Analysts**: To understand the system's capabilities, data reliability (confidence scoring), and accessibility standards.
*   **End Users (Citizens/Volunteers)**: To ensure the application functions on their typical devices (mid-range smartphones, varying network conditions).

## 4. Expected Findings
The study anticipates confirming that a **React-based PWA** combined with a **Node.js/PostGIS backend** is the optimal solution for balancing performance, development speed, and offline capabilities. It will likely highlight the critical need for efficient media compression and robust background synchronization workers to handle data in poor network areas.

---

## Requirements Identified

### 1. Hardware Requirements

#### A. Server Side (Minimum Recommended for Pilot/MVP)
*   **Processor**: Virtual CPU with 2+ Cores (e.g., AWS t3.medium or equivalent)
*   **RAM**: 4 GB (Minimum) to handle Node.js runtime + PostgreSQL database + Redis Queue
*   **Storage**: 
    *   **Database**: 20 GB SSD (Scalable) for PostGIS data
    *   **Object Storage**: S3-compatible bucket (or 50 GB local SSD) for user-uploaded images/videos
*   **Network**: High-bandwidth connection for handling concurrent image uploads and WebSocket streams

#### B. Client Side (End User Devices)
*   **Device Type**: Smartphone (Android/iOS) or Desktop/Laptop
*   **Camera**: Rear-facing camera (Minimum 5MP) for hazard evidence
*   **GPS**: Integrated GPS/GNSS receiver for accurate geolocation
*   **RAM**: 
    *   **Mobile**: 3 GB+ recommended for smooth map interaction
    *   **Desktop**: 4 GB+
*   **Connectivity**: 3G/4G/LTE or Wi-Fi (Offline mode supported for interim disconnects)

### 2. Software Requirements

#### A. Server Environment
*   **Operating System**: Linux (Ubuntu 20.04/22.04 LTS recommended)
*   **Runtime**: Node.js (v18.x or v20.x LTS)
*   **Database**: PostgreSQL (v14+) with **PostGIS** extension enabled
*   **Cache/Queue**: Redis (v6+) for Bull queue management
*   **Process Manager**: PM2 or Docker Runtime

#### B. Client Environment
*   **Browser**: Modern Web Browser with PWA support
    *   **Google Chrome** (v90+)
    *   **Safari** (iOS 15+)
    *   **Firefox** (Mobile/Desktop v90+)
*   **Permissions**: User must grant permissions for:
    *   Location Services (High Accuracy)
    *   Camera / File Access
    *   Notifications (for status updates)

#### C. Development Tools (For Contributors)
*   **Code Editor**: VS Code (recommended) with ESLint/Prettier
*   **Version Control**: Git
*   **Package Manager**: npm (v9+) or pnpm
