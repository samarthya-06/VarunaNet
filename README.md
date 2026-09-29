# VarunaNet
Integrated web application for crowdsourced ocean hazard reporting.

## Architecture
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + PostGIS

## Setup
See `Design.txt` for detailed requirements.

## Local configuration

Install dependencies with `npm ci` in both `backend` and `frontend`.
Copy `backend/.env.example` to `backend/.env`, set your PostgreSQL/PostGIS
connection in `DATABASE_URL`, and generate a unique `JWT_SECRET`
(for example, with `openssl rand -base64 32`). See `docs/` for project documentation.

Copy `frontend/.env.example` to `frontend/.env` when configuring the API URL.
Run `npm run dev` in each application directory to start development.
The optional admin login requires an explicitly configured `ADMIN_PASSWORD`;
there is no built-in admin password.

## Repository contents

Source, dependency lockfiles, documentation, CI, and development tooling are included.
Private environment files, user-uploaded images, installed dependencies, and generated
build output are intentionally excluded. Uploads belong in private runtime storage.
