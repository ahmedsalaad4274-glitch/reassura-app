# Reassura — Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router, Zustand
- **Backend**: FastAPI (Python), MongoDB
- **Key deps**: expo-linear-gradient, react-native-reanimated, react-native-svg, expo-blur, zustand

## Design System
- Background: `#1A1612` (warm dark), forest gradients per context
- Cards: `rgba(255,255,255,0.04)` glassmorphism + `rgba(255,255,255,0.1)` borders
- Primary: Sage green `#7A9E87` / Secondary: Gold `#C9A84C`
- Typography: Fraunces headings, DM Sans body
- User name: Rinade

## Onboarding Flow (Route Order)
1. `/onboarding/welcome` — Brand welcome, icon triangle, feature cards
2. `/onboarding/demo` — I'm Home interactive demo (tappable button)
3. `/onboarding/demo2` — Safe Walk interactive demo (animated map)
4. `/onboarding/demo3` — Circle connection visual
5. `/onboarding/role` — Role selection
6. `/onboarding/avatar` — Avatar selection
7. `/onboarding/permissions` — Location/notification permissions
8. `/onboarding/add-home` — Saved places
9. `/onboarding/invite` — Circle invites

## Implemented Features

### Phases 1-6: MVP through Onboarding Flow — COMPLETE
- 5 tab screens, backend API, MongoDB, mock data
- Auth/Onboarding, Sidebar, Profile Upload, Demo Mode
- Premium Glassmorphism UI, I'm Home, Safe Walk, Peace Streaks

### Phase 7-8: Visual Polish — COMPLETE
- PrimaryButton 3D, FeatureIcon 3D, OnboardingMessages
- Forest gradients, layout fixes, font unification

### Phase 9: Interactive Onboarding — COMPLETE
- Tappable I'm Home, Safe Walk map demo, Circle feed

### Phase 10: Onboarding Overhaul — COMPLETE (Mar 2026)
- [x] **Welcome screen** (`welcome.tsx`): Brand intro, icon triangle with breathing glow, 3 tappable feature cards (sage/blue/amber) with card 1 scale animation, "explore the app" divider, "Get started" CTA
- [x] **I'm Home** (`demo.tsx`): Bigger 140x140 hero button (borderRadius 38, emoji 60px), styled tap prompt pill with pulsing dot ("Tap it — see what happens"), back button + centered dots + skip top bar
- [x] **Safe Walk** (`demo2.tsx`): Tap prompt overlay on map ("Tap the map — watch the journey") with scale animation and pulsing dot, updated subtitle, back button top bar
- [x] **Circle** (`demo3.tsx`): Connection visual card replacing feed — "YOUR CIRCLE" header, You avatar connected to Mum/Dad/Jamie family avatars via gradient line, status chips (Arrived/Walking/All good), updated subtitle
- [x] **Back buttons**: All onboarding screens have back navigation (existing screens already had them, new screens added inline top bar)
- [x] **Route split**: Demo slides split into 3 separate route files (demo.tsx, demo2.tsx, demo3.tsx) for clean stack navigation

## Future Backlog
- P1: Real auth (JWT/OAuth), push notifications
- P2: Real map (MapBox), GPS tracking, geofencing
- P3: Circle invites, driving mode, shareable peace streak cards
- P4: Code refactoring — break large screen files into smaller components
