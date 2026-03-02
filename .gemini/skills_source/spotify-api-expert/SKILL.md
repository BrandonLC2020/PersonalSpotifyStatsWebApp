---
name: spotify-api-expert
description: Expert in Spotify Web API, OAuth 2.0 flow, and `spotify-web-api-js`. Use for API mapping, permission scope management, and TypeScript interfaces for Spotify tracks, artists, and playback state.
---

# Spotify API Expert

Guidance for interacting with the Spotify Web API within the Personal Spotify Stats project.

## Authentication & Tokens
- **Auth Flow**: Uses OAuth 2.0 with refresh tokens. The refresh token is retrieved from AWS Secrets Manager.
- **Library**: Primarily uses `spotify-web-api-js` wrapper in `useSpotifyWeb.ts`.
- **Refreshing**: When a `401 Unauthorized` is encountered, use the refresh token stored in Secrets Manager to obtain a new access token.

## API Scopes
Ensure the following scopes are handled for current stats:
- `user-read-recently-played`
- `user-top-read`
- `user-read-currently-playing`

## TypeScript Interfaces
Map Spotify JSON responses to the following local interfaces:
- `SpotifyApi.TrackObjectFull` for tracks.
- `SpotifyApi.ArtistObjectFull` for artists.
- `SpotifyApi.AlbumObjectSimplified` for albums.

## Troubleshooting
- If requests fail, verify the `REACT_APP_CLIENT_ID` and `REACT_APP_CLIENT_SECRET` in `frontend/.env`.
- Check if the access token has expired before every major batch of requests.
