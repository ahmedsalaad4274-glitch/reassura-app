# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. It's a high-fidelity React Native (Expo) prototype with interactive onboarding, tab-based navigation, and rich animated UI.

## Tech Stack
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Backend**: FastAPI + MongoDB (mock data)
- **Animation**: react-native-reanimated, Animated API, expo-linear-gradient
- **SVG**: react-native-svg
- **State**: zustand

## Architecture
```
/app/frontend/
  app/
    (onboarding)/ - welcome, demo, permissions, role
    (tabs)/ - index (home), map, circles, travel, profile
    _layout.tsx - root layout
  src/
    components/
      circles/ - OrbitCanvas, BentoGrid, WaveOverlay, ReassuraLogo
      FeatureIcon, PrimaryButton, Toast, etc.
    constants/theme.ts
    store/appStore.ts, onboardingStore.ts
    services/api.ts
```

## What's Been Implemented

### Onboarding (Complete)
- Welcome screen, 3 animated demo slides, permissions screen
- Back buttons, styled tap prompts, circle connection visual

### Home Screen (tabs/index.tsx)
- I'm Home card, streak counter, circle member strip
- Quick actions: Safe Walk (opens bottom sheet) + Check In (toast)
- Safe Walk bottom sheet with mini map, circle watching, stop button
- Latest footprints feed

### Map Screen (tabs/map.tsx)
- Custom-drawn dark-themed map (colors matching mapbox dark-v11)
- Avatar pins, search bar, filter pills, member strip
- Road edge styling (#212a37)

### Circles Screen (tabs/circles.tsx) - COMPLETE
- **BentoGrid**: 2x2 grid for 2+ circles with mini orbit previews
- **OrbitCanvas**: Full-screen planetary orbit view with continuously orbiting nodes
  - **Two-layer architecture**: Visual 3D-transformed plane (rings + hub + visual nodes with `pointerEvents="none"`) overlaid by a flat touch layer for reliable node press handling
- **Reassura SVG logomark hub**: Pin+heart SVG, Terra (#C4704A) background, pulse animation
- **Status language**: Active/Steady/Quiet (replaced "safe" everywhere)
- **Node design**: Emoji in 1.5px Sage (#7A9E87) bordered circles, active nodes pulse
- **Off-grid nodes**: opacity 0.32, dashed border, 15px drift, Terra nudge dot
- **Wave Overlay**: Blur backdrop bottom sheet with 3 tactile 3D buttons (Send a Wave, Call me soon, Custom), spring animation + haptics. Triggered by node tap - VERIFIED WORKING
- **Evening Horizon**: Progress bar with gradient fill, sun indicator, member pips
- **I'm Home 3D button**: 3D press effect with spring animation
- **isDark prop**: All new components accept isDark (default true)
- Sub-components: `/src/components/circles/` (4 files: OrbitCanvas, BentoGrid, WaveOverlay, ReassuraLogo)

### Travel Screen (tabs/travel.tsx)
- Page 1: Boarding pass design (active) / empty state with gradient icon
- Page 2: Night sky flight path with LinearGradient, earth curve, city lights, polished avatar pin
- Page 3: Travel profile with settings

### Create Circle Modal
- 4-step flow: Name, Look (emoji+color), Invite members, Privacy
- Celebration modal on creation

## Backlog (Prioritized)
- P1: Real authentication (JWT/OAuth)
- P1: Live map integration (Mapbox)
- P2: Push notifications
- P2: GPS tracking, geofencing
- P3: Circle invites flow, driving mode
- P3: Shareable peace streak cards
- P4: Light mode toggle (isDark wiring)
- P4: Component refactoring (break large screens into smaller components)

## Design Tokens
- Sage: #7A9E87 (node borders, green accents)
- Terra: #C4704A (hub, nudge dots, call buttons)
- Dark bg: #0D0B09
- Light bg: #F7F3EE
- Brown tokens shared across both themes
