# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack personal Spotify stats web app. The frontend fetches real-time data directly from the Spotify API, while historical monthly stats come from a Rails API backed by MySQL (hosted on AWS RDS, accessed via SSH tunnel through a bastion host).

## Development Commands

### Backend (Rails API)
```bash
cd backend
bundle install          # install gems
rails db:create         # create database
rails db:migrate        # run migrations
bin/dev                 # start server (opens SSH tunnel to bastion + starts Rails on port 3001)
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm install             # install dependencies
npm start               # dev server on port 3000
npm run build           # production build
npm test                # run tests (Jest via react-scripts)
npm test -- --testPathPattern=<filename>   # run a single test file
```

## Architecture

### Two Data Sources
- **Current stats:** Fetched directly by the frontend from the Spotify API (real-time, no backend involved)
- **Monthly/historical stats:** Fetched by the frontend from the Rails API (`localhost:3001`) → MySQL on AWS RDS

### Backend
Rails 7 API-only app (no views). Three controllers under `app/controllers/api/`: `TracksController`, `ArtistsController`, `AlbumsController`. Each returns data grouped by `year`/`month`/`standing` (rank). Routes: `/api/tracks`, `/api/artists`, `/api/albums`.

Database schema has three tables (`tracks`, `artists`, `albums`) where the primary keys are the Spotify IDs (`track_id`, `artist_id`, `album_id`). JSON columns store arrays (`artist_ids`, `genres`, `images`).

The `bin/dev` script opens an SSH tunnel (`localhost:3307 → RDS:3306`) via bastion host before starting Puma on port 3001.

### Frontend
React 18 + TypeScript SPA with Material-UI. State lives in `App.tsx`: view mode (current vs. monthly), tab (tracks/artists/albums), display style (grid vs. table), and theme (dark/light).

- `hooks/useSpotifyWeb.ts` — initializes the Spotify API client; fetches the refresh token from AWS Secrets Manager on mount
- `components/current/` — `CurrentTopTracks`, `CurrentTopArtists` (hit Spotify API directly)
- `components/monthly/` — `MonthlyTopTracks`, `MonthlyTopArtists`, `MonthlyTopAlbums` (hit Rails API via Axios)
- `theme.ts` — Material-UI theme config (dark/light)

### Token Storage
The Spotify refresh token is stored in AWS Secrets Manager and fetched client-side using `@aws-sdk/client-secrets-manager` with credentials from frontend `.env`.

## Environment Variables

**Backend** (`backend/.env`, see `backend/sample.env`):
```
DB_PASSWORD, DB_USERNAME, DB_NAME, DB_HOST
BASTION_HOST, BASTION_USER, BASTION_KEYFILE_PATH
```

**Frontend** (`frontend/.env`, see `frontend/sample.env`):
```
REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REDIRECT_URI
REACT_APP_AWS_ACCESS_KEY_ID, REACT_APP_AWS_SECRET_ACCESS_KEY
REACT_APP_AWS_DEFAULT_REGION, REACT_APP_SECRET_NAME
REACT_APP_API_URL   # defaults to http://localhost:3001
```

## Key Config Files
- `backend/config/database.yml` — connects to `localhost:3307` in dev (SSH tunnel port)
- `backend/config/initializers/cors.rb` — currently only allows `http://localhost:3000`
- `backend/config/routes.rb` — all routes are namespaced under `/api`
