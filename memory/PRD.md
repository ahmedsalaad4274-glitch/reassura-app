# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. It's a high-fidelity React Native (Expo) prototype with interactive onboarding, tab-based navigation, and rich animated UI.

## Tech Stack
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Backend**: FastAPI + MongoDB (mock data)
- **Animation**: react-native-reanimated, Animated API, expo-linear-gradient
- **SVG**: react-native-svg
- **State**: zustand, ThemeContext (React Context)

## Architecture
```
/app/frontend/
  app/
    (onboarding)/ - welcome, demo, permissions, role
    (tabs)/ - index (home), map, circles, travel, profile
    _layout.tsx - root layout (wraps ThemeProvider)
  src/
    components/
      circles/ - OrbitCanvas, BentoGrid, WaveOverlay, ReassuraLogo
      ThemeToggle.tsx - Sun/moon toggle button
      FootprintCard.tsx, StoryCircle.tsx, etc.
    context/
      ThemeContext.tsx - LIGHT/DARK tokens, ThemeProvider, useTheme
    constants/theme.ts
    store/appStore.ts, onboardingStore.ts
    services/api.ts
```

## What's Been Implemented

### Light/Dark Mode Toggle (Complete - Mar 2026)
- **ThemeContext** with LIGHT and DARK color token objects
- **ThemeProvider** wrapping entire app at root layout level
- **ThemeToggle** component: 34px circle button with sun/moon emoji
- Toggle visible in top-right header of ALL 5 screens
- Light mode (cream #FDFAF7) is default on first install
- Dark mode (#0A0806) activated via toggle
- Preference persisted via AsyncStorage (`reassura_theme`)
- StatusBar adapts to mode
- Sub-components (FootprintCard, StoryCircle, BentoGrid) theme-aware
- **Exceptions preserved**: I'm Home button (always green), boarding pass (always brown), flight path (always dark night sky)
- Tab bar adapts background/icon colors to theme

### Circles Screen (Complete - Mar 2026)
- BentoGrid for 2+ circles, 3D orbit view for single circle
- Two-layer OrbitCanvas: visual 3D plane + flat touch overlay
- WaveOverlay bottom sheet on node tap
- Evening Horizon progress bar, I'm Home 3D button
- isDark prop support

### Onboarding (Complete)
- Welcome screen, animated demo slides, permissions, circle connection

### Home Screen (Complete)
- I'm Home card, streak counter, circle member strip
- Quick actions: Safe Walk + Check In
- Latest footprints feed

### Map Screen (Complete)
- Custom dark-themed map, avatar pins, search, filter pills

### Travel Screen (Complete)
- Boarding pass, night sky flight path, travel profile

### Profile Screen (Complete)
- Profile card, mood picker, settings

## Design Tokens
| Token | Light | Dark |
|-------|-------|------|
| background | #FDFAF7 | #0A0806 |
| surface | #FFFFFF | rgba(255,255,255,0.04) |
| textPrimary | #3D2E22 | rgba(247,243,238,0.92) |
| textSecondary | #8C7B6E | rgba(247,243,238,0.38) |
| sage | #7A9E87 | #7A9E87 |
| terra | #C4704A | #C4704A |
| navBg | #FFFFFF | rgba(10,8,6,0.96) |

## Backlog (Prioritized)
- P1: Real authentication (JWT/OAuth)
- P1: Live map integration (Mapbox)
- P2: Push notifications
- P2: GPS tracking, geofencing
- P3: Circle invites flow, driving mode
- P3: Shareable peace streak cards
- P4: Component refactoring
