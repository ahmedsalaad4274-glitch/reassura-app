# Reassura — Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance. Premium glassmorphism dark UI.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router, Zustand
- **Backend**: FastAPI (Python), MongoDB

## Design System
- Background: `#1A1612` (warm dark), forest gradients per context
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
- [x] Demo Screen (3 slides), Role Screen, Avatar Screen, Permissions Screen, Add Home Screen, Invite Screen
- [x] OnboardingMessages, Zustand state management, MapLocationPicker

### Phase 7: Visual Polish — COMPLETE (Mar 2026)
- [x] PrimaryButton — 3D shadow-based pill button (edge shadow + breathing glow + press translateY)
- [x] OnboardingMessages — rotating messages, dot indicators, Reassura signature, borderRadius: 16
- [x] FeatureIcon — 3D rounded-square floating icons on demo + permissions (size 44, staggered delays)
- [x] Font size unification (shared.title 19px, shared.subtitle 13px, card names 13px, descriptions 12px)
- [x] Standardized footer layout (Messages → Button → Skip) on all screens
- [x] role.tsx flex fix, permissions.tsx cleanup, demo.tsx phone 160x195, avatar.tsx dark map

### Phase 8: Final Layout Polish — COMPLETE (Mar 2026)
- [x] Forest gradient backgrounds per demo slide (sage→blue→amber) and permissions screen
- [x] Dead space elimination with flex:1 + justifyContent: space-between + paddingHorizontal: 16
- [x] Ambient radial glow behind phone previews (colour-matched per slide: sage/blue/amber)
- [x] Feature card borders tinted to match slide colour
- [x] Permissions: 3D FeatureIcon at size 44 with staggered delays (0/600/1200ms)
- [x] Permissions: cards fill space with flex:1 column layout
- [x] Permissions: ambient sage glow behind heading area
- [x] OnboardingMessages bubble: all corners borderRadius: 16 (global fix)

## Future Backlog
- P1: Real auth (JWT/OAuth), push notifications
- P2: Real map (MapBox), GPS tracking, geofencing
- P3: Circle invites, driving mode, shareable peace streak cards
- P4: Code refactoring — break large screen files into smaller components
