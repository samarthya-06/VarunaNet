# Database Design Document: VarunaNet

## 1. Overview
This document details the database schema, storage strategy, and indexing policy for the VarunaNet platform. The system uses **PostgreSQL** as the primary relational database, enhanced with the **PostGIS** extension for advanced geospatial capabilities.

## 2. Database Technology
*   **DBMS**: PostgreSQL (v14+)
*   **Extensions**: `postgis` (for Geometry/Geography types), `pg_trgm` (for text search)
*   **ORM**: Sequelize (Node.js)

## 3. Data Dictionary (Schema)

### 3.1. Users Table (`users`)
Stores profile and authentication data for all actors.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PK, Auto Increment | Unique Identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email |
| `password_hash` | VARCHAR(255) | NULLABLE | Null for OAuth users |
| `role` | ENUM | DEFAULT 'citizen' | 'citizen', 'official', 'admin' |
| `profile_pic` | VARCHAR(255) | NULLABLE | URL to avatar image |
| `google_id` | VARCHAR(255) | UNIQUE, NULLABLE | OAuth Provider ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

### 3.2. Reports Table (`reports`)
Primary data entity for crowdsourced hazards.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PK, Auto Increment | Unique Identifier |
| `user_id` | INTEGER | FK (`users.id`), NULLABLE | Reporter (Anon allowed) |
| `hazard_type` | VARCHAR(50) | NOT NULL | e.g. 'oil_spill', 'debris' |
| `description` | TEXT | NULLABLE | User provided details |
| `image_url` | VARCHAR(255) | NULLABLE | Evidence photo URL |
| `latitude` | FLOAT | NOT NULL | Raw GPS Lat |
| `longitude` | FLOAT | NOT NULL | Raw GPS Long |
| `geom` | GEOMETRY(POINT, 4326) | INDEXED | Spatial Point (PostGIS) |
| `status` | ENUM | DEFAULT 'pending' | 'pending', 'verified', 'dismissed' |
| `confidence` | FLOAT | DEFAULT 0.0 | Calculated trust score |

### 3.3. Social Posts Table (`social_posts`)
Aggregated intelligence from external platforms.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PK, Auto Increment | Unique Identifier |
| `platform_id` | VARCHAR(255) | UNIQUE, NOT NULL | Original Post ID |
| `platform` | ENUM | NOT NULL | 'twitter', 'instagram' |
| `content` | TEXT | NOT NULL | Post body text |
| `keywords` | JSONB | DEFAULT '[]' | Extracted NLP keywords |
| `sentiment` | FLOAT | DEFAULT 0.0 | -1.0 to 1.0 score |
| `geom` | GEOMETRY(POINT, 4326) | INDEXED | Location of post |

### 3.4. Hotspots Table (`hotspots`)
Dynamically generated clusters of hazard activity.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PK, Auto Increment | Unique Identifier |
| `geom` | GEOMETRY(POLYGON, 4326) | INDEXED | Cluster boundary |
| `severity` | INTEGER | DEFAULT 1 | 1-5 Scale |
| `report_count` | INTEGER | DEFAULT 0 | Number of reports involved |
| `last_updated` | TIMESTAMPTZ | DEFAULT NOW() | |
| `expiration` | TIMESTAMPTZ | NOT NULL | Auto-expiry time |

## 4. Indexing Strategy
To ensure performance with geospatial queries ("Find reports near me"), we rely on GIST indices.

1.  **Spatial Indices**:
    *   `CREATE INDEX idx_reports_geom ON reports USING GIST (geom);`
    *   `CREATE INDEX idx_social_geom ON social_posts USING GIST (geom);`
    *   `CREATE INDEX idx_hotspots_geom ON hotspots USING GIST (geom);`

2.  **Performance Indices**:
    *   `users(email)` - Login lookups.
    *   `reports(status, created_at)` - Filtering verification queues.
    *   `reports(confidence)` - Sorting largely trustworthy reports.

## 5. Relationships
*   `users.id` <-> `reports.user_id` (1:N)
*   `hotspots.id` <-> `reports.hotspot_id` (1:N) [Logical Clustering]
