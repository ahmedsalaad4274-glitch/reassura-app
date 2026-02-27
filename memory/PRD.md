# Reassura — Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance. Premium glassmorphism dark UI.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router, Zustand
- **Backend**: FastAPI (Python), MongoDB

## Design System
- Background: `#1A1612` (warm dark)
- Cards: `rgba(255,255,255,0.04)` glassmorphism + `rgba(255,255,255,0.1)` borders
- Primary: Sage green `#7A9E87` / Secondary: Gold `#C9A84C`
- Typography: Fraunces headings (letter-spacing -0.02em), DM Sans body
- Section headers: Sage green left accent bar, uppercase labels
- Buttons: Solid sage green for primary, transparent+border for secondary

## Implemented Features

### Phase 1 — MVP
- [x] 5 tab screens, backend API, MongoDB, mock data

### Phase 2 — Feature Update  
- [x] Auth/Onboarding, Sidebar, Profile Upload, Demo Mode, Map Pins, Saved Places, Real-Time Updates

### Phase 3 — Safety Features
- [x] Check-in Request, Circle Mood, Quiet Hours, My Places editor

### Phase 4 — Premium UI + Safety Suite (Current)
- [x] **Premium Glassmorphism UI** — All cards, modals, sidebar use transparent glass style
- [x] **I'm Home Button** — Sage green pill, press animation, late-night "I'm Safe" variant, greyed cooldown state
- [x] **Quick Actions Row** — Night Check, Safe Walk, Quick Check In pills
- [x] **Night Check Screen** — Starfield animation, moon, gold "Send Goodnight" button, circle notification
- [x] **Safe Walk Mode** — Destination, ETA, progress tracking, arrival celebration
- [x] **Peace Streaks** — Fire emoji + day counter on Peace Score
- [x] **Smart Emergency Detection** — Simulated prompt, 3-option response (All good / Busy / Need help)
- [x] **Section headers** — Sage green left accent bars
- [x] **Status auto-emoji** — Backend auto-assigns emoji based on status type

## API Endpoints
- GET /api/users, /api/users/current/me
- PUT /api/users/{id}/profile (mood, quiet_hours, profile_picture)
- PUT /api/users/{id}/status (auto-emoji, message fallback)
- GET /api/circles, /api/footprints, /api/travel, /api/notifications
- POST /api/checkin/request, /api/checkin/respond
- POST /api/emergency

## Future Backlog
- P1: Real auth (JWT/OAuth), push notifications
- P2: Real map (MapBox), GPS tracking, flight API, geofencing
- P3: Circle invites, driving mode, shareable peace streak cards
