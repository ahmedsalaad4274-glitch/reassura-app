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
- Typography: Fraunces headings, DM Sans body
- All modals/popups/sidebar: expo-blur intensity 85, tint dark
- Sheet backgrounds: solid `rgba(26,22,18,0.97)`
- User name: Rinade

## Implemented Features

### Phase 1 — MVP
- [x] 5 tab screens, backend API, MongoDB, mock data

### Phase 2 — Feature Update
- [x] Auth/Onboarding, Sidebar, Profile Upload, Demo Mode, Map Pins, Saved Places, Real-Time Updates

### Phase 3 — Safety Features
- [x] Check-in Request, Circle Mood, Quiet Hours, My Places editor

### Phase 4 — Premium UI + Safety Suite
- [x] Premium Glassmorphism UI — All cards, modals, sidebar use transparent glass style
- [x] I'm Home Button — Sage green gradient hero card with pulsing ring
- [x] Quick Actions Row — Night Check, Safe Walk, Quick Check In with descriptions
- [x] Night Check Screen — Starfield animation, moon, gold "Send Goodnight" button
- [x] Safe Walk Mode — Destination, ETA, progress tracking, arrival celebration
- [x] Peace Streaks — Fire emoji + day counter
- [x] Smart Emergency Detection — Simulated prompt, 3-option response

### Phase 5 — Premium UI Enhancements (Feb 2026)
- [x] **Top Nav Bar** — Bell icon + styled Edit pill button
- [x] **Enhanced I'm Home Hero Card** — Larger gradient card, pulsing animated ring, footer with circle count
- [x] **Redesigned Quick Actions** — Larger cards with descriptions (Safe Walk, Night Check, Check In)
- [x] **Latest Footprint Widget** — Card showing most recent circle member update
- [x] **Home Screen Customise Mode** — Edit pill toggles widget visibility, saved to AsyncStorage
- [x] **Enhanced Profile Popup** — Blur background, Reassura Insight card, recent activity, quick reply chips
- [x] **Personal Greeting** — Time-aware greeting ("Good afternoon, Rinade")
- [x] **Global Blur** — expo-blur intensity 85 tint dark on every modal, popup, sheet, sidebar

### Phase 6 — Onboarding Flow (Feb 2026)
- [x] **Demo Screen (3 slides)** — Swipeable intro: I'm Home, Safe Walk, Circle Updates with mini phone previews
- [x] **Role Screen** — 6 role options + custom "Other" input
- [x] **Avatar Screen** — Emoji picker (12 options) + custom emoji input + photo upload + live map pin preview
- [x] **Permissions Screen** — Enlarged UI for Location, Notifications, Bluetooth. Privacy promise card
- [x] **Add Home Screen** — 3 location slots: Home (sage), Work (blue), Custom place (amber)
- [x] **MapLocationPicker Component** — Reusable high-fidelity dark map with colored pins (sage/blue/amber), pan & zoom, search, neighbourhood display
- [x] **Map Location Integration** — Tapping any slot navigates to map picker, saving returns to location list with flash animation
- [x] **Invite Screen** — Invite code card, 4 share methods (iMessage, WhatsApp, QR, Copy), consent note
- [x] **OnboardingMessages Component** — Rotating privacy-focused animated messages visible on ALL 6 screens
- [x] **Onboarding State Management** — Zustand store + AsyncStorage persistence. Completing onboarding flags user and loads main app. Skips on subsequent visits
- [x] **E2E Flow**: Demo → Role → Avatar → Permissions → Add Locations → Invite → Main App

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
- P4: Code refactoring — break large screen files into smaller components
