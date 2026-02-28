import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapLocationPicker } from '../../src/components/MapLocationPicker';

export default function AddLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slotKey: string; slotEmoji: string; slotLabel: string; pinColour: string }>();

  const handleSave = async (neighbourhood: string, coordinates: { lat: number; lng: number }) => {
    await AsyncStorage.setItem('reassura_location_result', JSON.stringify({
      slotKey: params.slotKey || 'home',
      neighbourhood,
      coordinates,
    }));
    router.back();
  };

  const colour = (params.pinColour === 'blue' || params.pinColour === 'amber') ? params.pinColour : 'sage';

  return (
    <View style={styles.container}>
      <MapLocationPicker
        locationName={params.slotLabel || 'Home'}
        emoji={params.slotEmoji || '\ud83c\udfe0'}
        pinColour={colour as 'sage' | 'blue' | 'amber'}
        onSave={handleSave}
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1612' },
});
