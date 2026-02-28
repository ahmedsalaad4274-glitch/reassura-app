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
- Typography: Fraunces headings (700Bold, 400Regular_Italic, 600SemiBold), DM Sans body
- All modals/popups/sidebar: expo-blur intensity 85, tint dark
- Sheet backgrounds: solid `rgba(26,22,18,0.97)`
- User name: Rinade

## Implemented Features

### Phase 1-4: MVP through Premium UI + Safety Suite
- [x] 5 tab screens, backend API, MongoDB, mock data
- [x] Auth/Onboarding, Sidebar, Profile Upload, Demo Mode, Map Pins, Saved Places
- [x] Check-in Request, Circle Mood, Quiet Hours, My Places editor
- [x] Premium Glassmorphism UI, I'm Home Button, Quick Actions, Night Check, Safe Walk, Peace Streaks, Smart Emergency Detection

### Phase 5: Premium UI Enhancements (Feb 2026)
- [x] Top Nav Bar, Enhanced I'm Home Hero, Redesigned Quick Actions
- [x] Latest Footprint Widget, Customise Mode, Enhanced Profile Popup, Personal Greeting, Global Blur

### Phase 6: Onboarding Flow (Feb 2026)
- [x] Demo Screen (3 slides) with swipeable intro
- [x] Role Screen — 6 roles + custom input
- [x] Avatar Screen — emoji picker + photo upload + map pin preview
- [x] Permissions Screen — enlarged UI for 3 permissions
- [x] Add Home Screen — 3 location slots (Home/sage, Work/blue, Custom/amber)
- [x] MapLocationPicker — reusable dark map with colored pins
- [x] Invite Screen — invite code, 4 share methods
- [x] OnboardingMessages — rotating privacy messages on all 6 screens
- [x] Onboarding State (Zustand + AsyncStorage) — flag persistence, skip on re-visit

### Phase 7: Visual Polish (Feb 2026)
- [x] **Glow bubble style** — sage/blue shadow glow on message bubbles, asymmetric border radius
- [x] **Fraunces italic body text** — editorial italic for bubble body, SemiBold upright for highlights
- [x] **Gradient circle icons** — LinearGradient circles for demo feature card emojis (44px)
- [x] **Signature redesign** — horizontal rules + centered leaf + "Reassura" + tagline
- [x] **Role cards flex fill** — cards expand to fill available space between subtitle and messages
- [x] **Demo phone enlarged** — 170x260 from 130x220
- [x] **Permissions dedup** — removed privacy promise box, startIndex=1 for brand message first
- [x] **Font loading** — added Fraunces_400Regular_Italic and Fraunces_600SemiBold to root layout

## API Endpoints
- GET /api/users, /api/users/current/me
- PUT /api/users/{id}/profile, /api/users/{id}/status
- GET /api/circles, /api/footprints, /api/travel, /api/notifications
- POST /api/checkin/request, /api/checkin/respond, /api/emergency

## Future Backlog
- P1: Real auth (JWT/OAuth), push notifications
- P2: Real map (MapBox), GPS tracking, flight API, geofencing
- P3: Circle invites, driving mode, shareable peace streak cards
- P4: Code refactoring — break large screen files into smaller components
