# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. High-fidelity React Native (Expo) prototype with interactive onboarding, tab-based navigation, animated UI, light/dark theme, and Safe Walk feature.

## Tech Stack
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Animation**: react-native-reanimated, Animated API, expo-linear-gradient
- **SVG**: react-native-svg
- **State**: zustand, ThemeContext, SafeWalkContext

## Architecture
```
/app/frontend/
  app/
    (onboarding)/ - welcome, demo, permissions, role
    (tabs)/ - index (home), map, circles, travel, profile
    _layout.tsx - ThemeProvider + SafeWalkProvider wrap
    safe-walk-setup.tsx - Setup modal (3 fields)
    safe-walk-arrived.tsx - Celebration screen
    safe-walk-overdue.tsx - Overdue alert (3 buttons)
  src/
    context/
      ThemeContext.tsx - LIGHT/DARK tokens, useTheme
      SafeWalkContext.tsx - Walk state, timer, overdue detection
    components/
      ThemeToggle.tsx - Sun/moon toggle
      circles/ - OrbitCanvas, BentoGrid, WaveOverlay, ReassuraLogo
      FootprintCard.tsx, StoryCircle.tsx, etc.
    constants/theme.ts
    store/ - appStore, onboardingStore, authStore
```

## Implemented Features

### Safe Walk (Complete - Mar 2026)
- **Quick Actions Row**: 3 pill buttons on Home (Safe Walk, Check In, Night Check)
- **Setup Modal**: Destination input, watcher chips (4 pre-selected), duration selector (5-30 min)
- **Active Walk Banner**: Blue-themed banner on Home with timer, progress bar, "I've Arrived" button, location sharing notice
- **Celebration Screen**: Sage gradient, bouncing house emoji, "You're home safe!", Done button
- **Overdue Alert**: Amber-tinted screen with 3 response buttons (All good / Extend / Help)
- **Profile History**: SAFE WALKS section with 3 MOCKED walk entries
- **State**: SafeWalkContext manages isActive, timer, overdue (auto-triggers at duration + 5 min), auto-clear at 2 hours
- No new tabs — accessed from Home only

### Light/Dark Mode (Complete - Mar 2026)
- ThemeContext with LIGHT/DARK token objects, ThemeProvider wraps entire app
- ThemeToggle (34px sun/moon emoji button) on all 5 screens
- Light (#FDFAF7) default, dark (#0A0806) via toggle, persisted in AsyncStorage
- Exceptions: I'm Home (always green), boarding pass (always brown), flight path (always dark)

### Circles Screen (Complete - Mar 2026)
- BentoGrid + 3D OrbitCanvas with two-layer touch architecture
- WaveOverlay, Evening Horizon, I'm Home 3D button

### Other Screens (Complete)
- Onboarding (4-step flow), Home, Map, Travel, Profile, Create Circle modal

## Design Tokens
| Token | Light | Dark |
|-------|-------|------|
| background | #FDFAF7 | #0A0806 |
| surface | #FFFFFF | rgba(255,255,255,0.04) |
| textPrimary | #3D2E22 | rgba(247,243,238,0.92) |
| sage | #7A9E87 | #7A9E87 |
| terra | #C4704A | #C4704A |
| blue (Safe Walk) | #4A6AAA | #4A6AAA |

## Backlog
- P1: Real authentication (JWT/OAuth)
- P1: Live map integration (Mapbox)
- P2: Push notifications, GPS tracking
- P3: Circle invites, driving mode
- P3: Shareable peace streak cards
