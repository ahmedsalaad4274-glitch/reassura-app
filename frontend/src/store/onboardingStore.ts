import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  isComplete: boolean | null;
  setComplete: (value: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isComplete: null,
  setComplete: (value) => {
    set({ isComplete: value });
    AsyncStorage.setItem('reassura_onboarding_v2', value ? 'true' : 'false');
  },
  loadFromStorage: async () => {
    const val = await AsyncStorage.getItem('reassura_onboarding_v2');
    set({ isComplete: val === 'true' });
  },
}));
