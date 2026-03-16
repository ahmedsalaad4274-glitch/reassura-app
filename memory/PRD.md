# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. High-fidelity React Native (Expo) prototype with interactive onboarding, tab-based navigation, animated UI, light/dark theme, Safe Walk, and Circle Invites.

## Tech Stack
- **Frontend**: React Native, Expo, Expo Router, TypeScript
- **Animation**: react-native-reanimated, Animated API, expo-linear-gradient
- **SVG**: react-native-svg
- **State**: zustand, ThemeContext, SafeWalkContext, InviteContext

## Architecture
```
/app/frontend/
  app/
    (onboarding)/ - welcome, demo, permissions, role
    (tabs)/ - index (home), map, circles, travel, profile
    _layout.tsx - ThemeProvider + SafeWalkProvider + InviteProvider
    safe-walk-setup.tsx - Setup modal
    safe-walk-arrived.tsx - Celebration screen
    safe-walk-overdue.tsx - Overdue alert
    circle-invite.tsx - Invite form modal
  src/
    context/
      ThemeContext.tsx - LIGHT/DARK tokens
      SafeWalkContext.tsx - Walk state management
      InviteContext.tsx - Pending invites state
    components/
      ThemeToggle.tsx, circles/, FootprintCard, StoryCircle, etc.
```

## Implemented Features

### Circle Invites (Complete - Mar 2026)
- "+" button in Circles header opens invite form modal
- Form: name input + optional contact + Send Invite button (disabled when empty)
- Confirmation screen: "Invite sent!" with invitee name + Back to Circle button
- PENDING INVITES section appears in circle view with dashed avatar, name, amber "Pending" badge
- MOCKED: Invites stored in InviteContext React state, no backend

### Safe Walk (Complete - Mar 2026)
- 3-pill quick actions on Home (Safe Walk, Check In, Night Check)
- Setup modal: destination, watchers, duration
- Active walk banner with timer + progress + I've Arrived
- Celebration + overdue alert screens
- MOCKED: Location sharing simulated

### Light/Dark Mode (Complete - Mar 2026)
- ThemeContext, ThemeToggle on all screens, light default, AsyncStorage persistence

### Circles Screen (Complete)
- BentoGrid, 3D OrbitCanvas, WaveOverlay, Evening Horizon

### Other: Onboarding, Home, Map, Travel, Profile

## Backlog
- P1: Real authentication
- P1: Live map (Mapbox)
- P2: Push notifications, GPS
- P3: Driving mode, shareable streak cards
