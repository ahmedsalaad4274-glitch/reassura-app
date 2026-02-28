import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { useOnboardingStore } from '../src/store/onboardingStore';

export default function RootLayout() {
  const { isAuthenticated, isOnboarded, loadFromStorage } = useAuthStore();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Re-check onboarding flag whenever segments change (e.g. after completing onboarding)
  useEffect(() => {
    AsyncStorage.getItem('reassura_onboarding_complete').then((val) => {
      setOnboardingDone(val === 'true');
    });
  }, [segments]);

  useEffect(() => {
    if (onboardingDone === null || !fontsLoaded) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingDone && !inOnboarding) {
      router.replace('/onboarding/demo');
    }
  }, [onboardingDone, fontsLoaded, segments]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.sageGreen} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.backgroundDark },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="update-status"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="pricing"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="night-check"
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="safe-walk"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
