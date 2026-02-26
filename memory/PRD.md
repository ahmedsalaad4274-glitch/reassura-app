# Reassura - Product Requirements Document

## Overview
Reassura is a private, invite-only peace-of-mind and family safety app. Users voluntarily share their status with trusted circles. Built on trust and privacy, not surveillance.

## Tech Stack
- **Frontend**: React Native (Expo, TypeScript), Expo Router (file-based navigation), Zustand (state management)
- **Backend**: FastAPI (Python), MongoDB (NoSQL)
- **UI/UX**: Dark mode, gesture-driven navigation, custom animations, "warm, dark, organic" aesthetic

## Core Screens
1. **Home**: Peace Score, swipeable Circle switcher, Stories row, Latest Footprints feed, floating SOS button
2. **Map**: 3D-styled dark map, custom teardrop pins with status colors, Saved Places with amber markers
3. **Circles**: Visual circle representation with pulsating animations and member emojis
4. **Travel**: Multi-page view with flight tracking, night sky map, travel profile
5. **Profile**: Avatar/photo management, privacy settings, account management, Sign Out
6. **Onboarding**: Splash → Carousel → Signup → OTP → Profile Setup

## Implemented Features (Feb 26, 2026)

### P0 - Core Features (All Complete)
- [x] Full tab navigation (5 screens)
- [x] Home screen with Peace Score, Stories row, Footprints feed
- [x] Map screen with animated teardrop pins, 3D map visuals
- [x] Circles screen with orbital member animations
- [x] Travel screen with flight tracking
- [x] Profile screen with settings management
- [x] Backend API with all endpoints (users, circles, footprints, travel, emergency)
- [x] MongoDB with seeded mock data

### P0 - 7 Feature Update (All Complete)
1. [x] **Authentication/Onboarding Flow** - Multi-step onboarding (splash, carousel, signup, OTP, profile setup), conditional routing in root layout
2. [x] **Sidebar Drawer Navigation** - Slide-out menu with navigation items, settings toggles, Ghost Mode, Demo Mode trigger, Sign Out, Emergency Alert
3. [x] **Profile Picture Upload** - expo-image-picker for mobile + HTML file input web fallback, avatar options (Upload Photo / Choose Emoji / Remove)
4. [x] **Guided Demo Mode** - Interactive walkthrough overlay with step-by-step guidance
5. [x] **Enhanced Map Pins & Animations** - Animated bounce-in, pulse for travelling users, status-colored teardrop pins, travel/battery badges
6. [x] **Saved Places on Map** - Home/Work default markers, toggle visibility, Add Place modal with type selection, long-press to remove
7. [x] **Simulated Real-Time Updates** - Auto-refresh (30s), simulated status changes (45s), toast notifications, flight progress advancement

## API Endpoints
- GET /api/ - Health check
- GET /api/users - List all users
- GET /api/users/current/me - Current user
- PUT /api/users/{id}/profile - Update profile (name, emoji, home_city, ghost_mode, profile_picture)
- POST /api/users/{id}/status - Update status
- GET /api/circles - List circles
- GET /api/circles/{id}/members - Circle members
- GET /api/footprints - Activity feed
- GET /api/travel - Travel sessions
- POST /api/emergency - Emergency alert
- GET /api/notifications - Notifications

## DB Schema
- **users**: {id, name, emoji, circle_ids, status, status_emoji, status_message, home_city, ghost_mode, profile_picture, battery_level, updated_at}
- **circles**: {id, name, emoji, member_ids}
- **footprints**: {id, user_id, type, status, message, timestamp}
- **travel_sessions**: {id, user_id, flight_number, origin, destination, status, progress}
- **notifications**: {id, type, title, message, timestamp, read}

## Architecture
```
/app
├── backend/
│   ├── server.py          # FastAPI app, all endpoints, MongoDB models
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx    # Root layout with auth routing
│   │   ├── onboarding.tsx # Multi-step onboarding flow
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # Tab navigator
│   │   │   ├── index.tsx      # Home screen
│   │   │   ├── map.tsx        # Map with pins & saved places
│   │   │   ├── circles.tsx    # Circle visualizations
│   │   │   ├── travel.tsx     # Flight tracking
│   │   │   └── profile.tsx    # Profile with image upload
│   │   ├── update-status.tsx  # Status update modal
│   │   ├── notifications.tsx  # Notifications screen
│   │   └── pricing.tsx        # Subscription plans
│   └── src/
│       ├── components/
│       │   ├── CrossPlatformPager.tsx  # Custom swipeable view
│       │   ├── EnhancedSidebar.tsx     # Drawer navigation
│       │   ├── DemoMode.tsx            # Demo guide overlay
│       │   ├── Toast.tsx               # Notification toasts
│       │   ├── StoryCircle.tsx         # Status story circles
│       │   ├── PeaceScoreBanner.tsx    # Peace score widget
│       │   ├── FootprintCard.tsx       # Activity feed cards
│       │   ├── EmergencyButton.tsx     # SOS button
│       │   └── ProfilePopup.tsx        # Member profile popup
│       ├── services/api.ts             # API service layer
│       ├── store/
│       │   ├── appStore.ts             # App state (users, circles, etc.)
│       │   └── authStore.ts            # Auth state, saved places
│       └── constants/theme.ts          # Colors, fonts, spacing
```

## Known Issues
- Shadow style deprecation warnings (cosmetic, use boxShadow instead)
- All data is MOCKED - uses seeded backend data and simulated real-time updates

## Future Backlog
- P1: Real authentication with backend (JWT/OAuth)
- P1: Real-time push notifications
- P2: Actual map integration (MapBox/Google Maps)
- P2: Real GPS location tracking (opt-in)
- P2: Real flight tracking API integration
- P3: Circle invite system
- P3: Check-in requests between members
- P3: Driving mode detection
