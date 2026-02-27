# Reassura — Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance. Premium glassmorphism dark UI aesthetic.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router, Zustand
- **Backend**: FastAPI (Python), MongoDB

## Design System
- Background: `#1A1612` (warm dark)
- Card style: `rgba(255,255,255,0.04)` glassmorphism with `rgba(255,255,255,0.1)` borders
- Primary accent: Sage green `#7A9E87`
- Secondary accent: Gold `#C9A84C`
- Typography: Fraunces (headings), DM Sans (body)
- Section headers: Sage green left accent bar, uppercase labels

## Implemented Features

### Phase 1 — MVP (Feb 26)
- [x] 5 tab screens (Home, Map, Circles, Travel, Profile)
- [x] Backend API with all core endpoints
- [x] MongoDB with seeded mock data

### Phase 2 — 7 Feature Update (Feb 26)
- [x] Authentication/Onboarding Flow
- [x] Sidebar Drawer Navigation + Get Started checklist
- [x] Profile Picture Upload (expo-image-picker + web fallback)
- [x] Demo Mode, Enhanced Map Pins, Saved Places, Real-Time Updates

### Phase 3 — Design & Safety Features (Feb 27)
- [x] Check-in Request, Circle Mood, Quiet Hours

### Phase 4 — Premium UI + Safety Suite (Feb 27)
- [x] **Premium Glassmorphism UI** — All cards transparent with soft borders/shadows
- [x] **I'm Home Button** — Sage green pill, scale animation, greyed-out cooldown, late-night "I'm Safe" variant
- [x] **Quick Actions Row** — Night Check, Safe Walk, Quick Check In pills
- [x] **Night Check** — Full-screen dark starfield, moon animation, gold "Send Goodnight" button
- [x] **Safe Walk Mode** — Destination input, ETA selection, progress tracking, arrival celebration
- [x] **Peace Streaks** — Fire emoji + day counter on Peace Score banner
- [x] **Smart Emergency Detection** — Simulated after 90s, 3-option response (All good / Busy / Need help)
- [x] **Sidebar redesign** — Glassmorphism, Safe Walk CTA, active nav with left accent bar
- [x] **Night Check setting** — In profile privacy section
- [x] **Mood picker** — 6 emoji moods with badge on story circles

## API Endpoints
- GET /api/users, /api/users/current/me
- PUT /api/users/{id}/profile (mood, quiet_hours, profile_picture)
- POST /api/users/{id}/status
- GET /api/circles, /api/footprints, /api/travel, /api/notifications
- POST /api/checkin/request, /api/checkin/respond
- POST /api/emergency

## Architecture
```
/app/backend/server.py
/app/frontend/app/_layout.tsx, onboarding.tsx, night-check.tsx, safe-walk.tsx
/app/frontend/app/(tabs)/ — index, map, circles, travel, profile
/app/frontend/src/components/ — EnhancedSidebar, EmergencyButton, StoryCircle, etc.
/app/frontend/src/store/ — appStore, authStore
/app/frontend/src/constants/theme.ts — COLORS, FONTS, GLASS_CARD
```

## Future Backlog
- P1: Real auth (JWT/OAuth), push notifications
- P2: Real map (MapBox), GPS tracking, flight API
- P3: Circle invites, driving mode, geofencing auto-status
