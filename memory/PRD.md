# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router, Zustand
- **Backend**: FastAPI (Python), MongoDB

## Implemented Features

### Phase 1 - MVP (Feb 26)
- [x] 5 tab screens: Home, Map, Circles, Travel, Profile
- [x] Backend API with all core endpoints
- [x] MongoDB with seeded mock data
- [x] Custom CrossPlatformPager for swipe gestures

### Phase 2 - 7 Feature Update (Feb 26)
- [x] Authentication/Onboarding Flow
- [x] Sidebar Drawer Navigation
- [x] Profile Picture Upload (expo-image-picker + web fallback)
- [x] Demo Mode overlay
- [x] Enhanced Map Pins & Animations
- [x] Saved Places on Map
- [x] Simulated Real-Time Updates

### Phase 3 - Design & Feature Enhancement (Feb 27)
- [x] **Home screen redesign** — Card-based layout matching profile screen style
- [x] **Draggable SOS button** — PanResponder-based drag, AsyncStorage position persistence, screen bounds clamping
- [x] **My Places editor** — Interactive mini-map in profile edit, color-coded place types (Home/Work/Gym/Church/Custom), add/delete places
- [x] **Sidebar Get Started card** — Progress checklist (6 items), sage green progress bar, tappable items, auto-hide when complete
- [x] **Check-in Request** — Gentle nudge modal with quick responses ("All good", "Be home soon", "At work"), footprint integration
- [x] **Circle Mood** — Mood emoji selector (Good/Tired/Stressed/Unwell/Great/Grateful), mood badge on story circles, optional
- [x] **Quiet Hours** — Toggle in privacy settings, time range config (start/end), purple moon icon, status shows as "Quiet hours" to circle

## API Endpoints
- GET /api/ — Health check
- GET /api/users — List all users
- GET /api/users/current/me — Current user
- PUT /api/users/{id}/profile — Update profile (name, emoji, home_city, ghost_mode, profile_picture, mood, quiet_hours_enabled/start/end)
- POST /api/users/{id}/status — Update status
- GET /api/circles — List circles
- POST /api/checkin/request — Send check-in request
- POST /api/checkin/respond — Respond to check-in
- GET /api/footprints — Activity feed
- GET /api/travel — Travel sessions
- POST /api/emergency — Emergency alert
- GET /api/notifications — Notifications

## DB Schema
- **users**: {id, name, emoji, circle_ids, status, status_emoji, status_message, home_city, ghost_mode, profile_picture, mood, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, battery_level, updated_at}
- **circles**: {id, name, emoji, member_ids}
- **footprints**: {id, user_id, user_name, user_emoji, status, status_emoji, message, created_at}
- **travel_sessions**: {id, user_id, flight_number, origin, destination, status, progress}
- **notifications**: {id, user_id, type, title, message, related_user_id, read, created_at}

## Architecture
```
/app/backend/server.py          — FastAPI app, all endpoints
/app/frontend/app/_layout.tsx   — Root layout with auth routing
/app/frontend/app/onboarding.tsx — Multi-step onboarding
/app/frontend/app/(tabs)/       — 5 tab screens
/app/frontend/src/components/   — Reusable components
/app/frontend/src/store/        — Zustand stores (appStore, authStore)
/app/frontend/src/services/     — API service layer
/app/frontend/src/constants/    — Theme (colors, fonts, spacing)
```

## Future Backlog
- P1: Real authentication (JWT/OAuth)
- P1: Real-time push notifications
- P2: Actual map integration (MapBox/Google Maps)
- P2: Real GPS location tracking (opt-in)
- P2: Real flight tracking API
- P3: Circle invite system with codes
- P3: Driving mode detection
- P3: Place-based auto-status detection (geofencing)
