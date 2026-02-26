import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedPlace {
  id: string;
  name: string;
  type: 'home' | 'work' | 'gym' | 'church' | 'school' | 'shopping' | 'custom';
  emoji: string;
  x: number;
  y: number;
}

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isDemoMode: boolean;
  demoStep: number;
  userName: string;
  userEmoji: string;
  userPhoto: string | null;
  savedPlaces: SavedPlace[];
  isOnline: boolean;
  lastRefresh: Date | null;
  
  setAuthenticated: (value: boolean) => void;
  setOnboarded: (value: boolean) => void;
  setDemoMode: (value: boolean) => void;
  setDemoStep: (step: number) => void;
  setUserName: (name: string) => void;
  setUserEmoji: (emoji: string) => void;
  setUserPhoto: (photo: string | null) => void;
  addSavedPlace: (place: SavedPlace) => void;
  removeSavedPlace: (id: string) => void;
  updateSavedPlace: (id: string, place: Partial<SavedPlace>) => void;
  setOnline: (value: boolean) => void;
  setLastRefresh: (date: Date) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  logout: () => void;
  completeOnboarding: (name: string, emoji: string, photo: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true, // Set to true for existing users
  isOnboarded: true,
  isDemoMode: false,
  demoStep: 0,
  userName: 'You',
  userEmoji: '\ud83d\udc69\ud83c\udffe',
  userPhoto: null,
  savedPlaces: [
    { id: 'home', name: 'Home', type: 'home', emoji: '\ud83c\udfe0', x: 0.3, y: 0.4 },
    { id: 'work', name: 'Work', type: 'work', emoji: '\ud83d\udcbc', x: 0.7, y: 0.25 },
  ],
  isOnline: true,
  lastRefresh: null,
  
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboarded: (value) => set({ isOnboarded: value }),
  setDemoMode: (value) => set({ isDemoMode: value, demoStep: value ? 1 : 0 }),
  setDemoStep: (step) => set({ demoStep: step }),
  setUserName: (name) => set({ userName: name }),
  setUserEmoji: (emoji) => set({ userEmoji: emoji }),
  setUserPhoto: (photo) => set({ userPhoto: photo }),
  addSavedPlace: (place) => set((state) => ({ savedPlaces: [...state.savedPlaces, place] })),
  removeSavedPlace: (id) => set((state) => ({ savedPlaces: state.savedPlaces.filter(p => p.id !== id) })),
  updateSavedPlace: (id, updates) => set((state) => ({
    savedPlaces: state.savedPlaces.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  setOnline: (value) => set({ isOnline: value }),
  setLastRefresh: (date) => set({ lastRefresh: date }),
  
  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('reassura_auth');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          isAuthenticated: parsed.isAuthenticated ?? true,
          isOnboarded: parsed.isOnboarded ?? true,
          userName: parsed.userName || 'You',
          userEmoji: parsed.userEmoji || '\ud83d\udc69\ud83c\udffe',
          userPhoto: parsed.userPhoto || null,
          savedPlaces: parsed.savedPlaces || [],
        });
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
    }
  },
  
  saveToStorage: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem('reassura_auth', JSON.stringify({
        isAuthenticated: state.isAuthenticated,
        isOnboarded: state.isOnboarded,
        userName: state.userName,
        userEmoji: state.userEmoji,
        userPhoto: state.userPhoto,
        savedPlaces: state.savedPlaces,
      }));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      isOnboarded: false,
      isDemoMode: false,
      demoStep: 0,
      userName: '',
      userEmoji: '\ud83d\udc69\ud83c\udffe',
      userPhoto: null,
    });
    AsyncStorage.removeItem('reassura_auth');
  },
  
  completeOnboarding: (name, emoji, photo) => {
    set({
      isAuthenticated: true,
      isOnboarded: true,
      userName: name,
      userEmoji: emoji,
      userPhoto: photo,
    });
    get().saveToStorage();
  },
}));
