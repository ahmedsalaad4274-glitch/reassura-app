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

### Phase 7: Visual Polish — COMPLETE (Mar 2026)
- [x] **PrimaryButton component** — 3D animated pill button with shimmer, pulse, glow effects. Supports sage/blue/amber variants. Integrated on all 6 onboarding screens.
- [x] **OnboardingMessages component** — Fully replaced with new design: rotating messages, active dot indicators, built-in Reassura signature. Unique startIndex per screen (0-4).
- [x] **FeatureIcon component** — 3D rounded-square floating icons. Used on demo screen (feature cards) and permissions screen (permission icons).
- [x] **Font size unification** — Strict consistent hierarchy: shared.title (19px Fraunces Bold), shared.subtitle (13px DM Sans), card names (13px Bold), descriptions (12px Regular).
- [x] **Standardized footer layout** — All screens: OnboardingMessages → PrimaryButton → Skip link.
- [x] **role.tsx flex fix** — Cards use flex:1 to fill available vertical space, eliminating dead space.
- [x] **permissions.tsx cleanup** — Hardcoded privacy box removed (duplicate of OnboardingMessages content).
- [x] **demo.tsx phone sizing** — Mini phone preview adjusted to 160x195.
- [x] **avatar.tsx dark map** — Map preview changed from light (#E4E0D6) to dark (#1E1A16) theme with muted road/park colors.

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
