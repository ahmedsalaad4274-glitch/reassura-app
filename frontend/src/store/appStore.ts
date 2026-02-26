import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  emoji: string;
  circle_ids: string[];
  status: string;
  status_emoji: string;
  status_message?: string;
  updated_at: string;
  home_city: string;
  battery_level?: number;
  is_driving: boolean;
  driving_behavior?: string;
  speed_mph?: number;
  ghost_mode: boolean;
  is_current_user: boolean;
}

export interface Circle {
  id: string;
  name: string;
  emoji: string;
  color: string;
  member_ids: string[];
  privacy: string;
  show_last_updated: boolean;
  show_peace_score: boolean;
}

export interface Footprint {
  id: string;
  user_id: string;
  user_name: string;
  user_emoji: string;
  status: string;
  status_emoji: string;
  message?: string;
  created_at: string;
}

export interface Travel {
  id: string;
  user_id: string;
  user_name: string;
  user_emoji: string;
  flight_number?: string;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  departure_time: string;
  arrival_time: string;
  progress: number;
  altitude_ft?: number;
  status: string;
}

interface AppState {
  users: User[];
  circles: Circle[];
  footprints: Footprint[];
  activeTravel: Travel[];
  currentUser: User | null;
  selectedCircleIndex: number;
  sidebarOpen: boolean;
  selectedMemberForPopup: User | null;
  isLoading: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  setCircles: (circles: Circle[]) => void;
  setFootprints: (footprints: Footprint[]) => void;
  setActiveTravel: (travel: Travel[]) => void;
  setCurrentUser: (user: User | null) => void;
  setSelectedCircleIndex: (index: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedMemberForPopup: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  getCircleMembers: (circleId: string) => User[];
}

export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  circles: [],
  footprints: [],
  activeTravel: [],
  currentUser: null,
  selectedCircleIndex: 0,
  sidebarOpen: false,
  selectedMemberForPopup: null,
  isLoading: true,
  
  setUsers: (users) => set({ users }),
  setCircles: (circles) => set({ circles }),
  setFootprints: (footprints) => set({ footprints }),
  setActiveTravel: (travel) => set({ activeTravel: travel }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedCircleIndex: (index) => set({ selectedCircleIndex: index }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedMemberForPopup: (user) => set({ selectedMemberForPopup: user }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  getCircleMembers: (circleId: string) => {
    const state = get();
    const circle = state.circles.find(c => c.id === circleId);
    if (!circle) return [];
    return state.users.filter(u => circle.member_ids.includes(u.id));
  },
}));