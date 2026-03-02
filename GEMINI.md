# GEMINI.md

## Project Overview
The **Personal Spotify Stats Web App** is a full-stack application designed to visualize personal Spotify listening habits. It consists of a decoupled architecture with a React-based frontend and a Ruby on Rails backend.

- **Frontend**: A React (TypeScript) application that provides a modern, interactive UI (Material UI, Framer Motion). it fetches real-time data directly from the Spotify Web API and manages authentication by retrieving refresh tokens from AWS Secrets Manager.
- **Backend**: A Ruby on Rails API that serves historical listening statistics (tracks, artists, and albums) grouped by month and year. It interacts with a MySQL database (hosted on AWS RDS) and uses a Bastion host for secure access.

### Main Technologies
- **Frontend**: React 18, TypeScript, Material UI (MUI), Axios, Framer Motion, `spotify-web-api-js`, AWS SDK for JavaScript.
- **Backend**: Ruby 3.3.4, Rails 7.0.4, MySQL, Puma, Rack-CORS, `dotenv-rails`.
- **Infrastructure**: AWS RDS (MySQL), AWS Secrets Manager, Bastion Host (SSH Tunneling).

---

## Building and Running

### Prerequisites
- **Ruby**: 3.3.4
- **Node.js**: LTS version (v18+ recommended)
- **MySQL**: Local or remote instance
- **Spotify API**: Developer credentials (Client ID/Secret)
- **AWS**: Access Key/Secret for Secrets Manager

### Configuration
Both frontend and backend require `.env` files. Templates are available as `sample.env` in their respective directories.

#### Backend (`backend/.env`)
- `DB_PASSWORD`, `DB_USERNAME`, `DB_NAME`, `DB_HOST`
- `BASTION_HOST`, `BASTION_USER`, `BASTION_KEYFILE_PATH`

#### Frontend (`frontend/.env`)
- `REACT_APP_CLIENT_ID`, `REACT_APP_CLIENT_SECRET`
- `REACT_APP_AWS_ACCESS_KEY_ID`, `REACT_APP_AWS_SECRET_ACCESS_KEY`, `REACT_APP_AWS_DEFAULT_REGION`, `REACT_APP_SECRET_NAME`

### Commands

#### Backend
```bash
cd backend
bundle install
rails db:create
rails db:migrate
bin/dev # Starts Rails server on port 3001
```

#### Frontend
```bash
cd frontend
npm install
npm start # Starts React dev server (defaults to port 3000)
```

---

## Development Conventions

### General
- **Monorepo Structure**: The project is split into `backend/` and `frontend/` directories. Always specify the directory when running commands.
- **Environment Variables**: Use `.env` files for local development. Never commit `.env` files.

### Backend (Rails)
- **API-Only**: The backend acts as a JSON API under the `api` namespace.
- **Controllers**: Located in `app/controllers/api/`. Responses are typically grouped by `year` and `month`.
- **Models**: `Track`, `Artist`, `Album` models store historical data.
- **Style**: Standard Rails conventions. Uses `ActiveRecord` for database interactions.

### Frontend (React/TypeScript)
- **Functional Components**: Use functional components with hooks.
- **Theming**: Custom MUI theme defined in `src/theme.ts`.
- **State Management**: Uses React hooks (`useState`, `useEffect`) and custom hooks (e.g., `useSpotifyWeb.ts`) for authentication and API calls.
- **Animations**: Uses `framer-motion` for smooth UI transitions.
- **Icons**: Uses `@mui/icons-material`.

### API Communication
- Frontend calls Spotify API directly for real-time "current" stats.
- Frontend calls Rails API (`http://localhost:3001/api/...`) for historical "monthly" stats.
