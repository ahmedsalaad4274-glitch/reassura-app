import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

type Slot = { key: string; emoji: string; label: string; neighbourhood: string | null; editable?: boolean };

const STORAGE_KEY = 'reassura_saved_places';

export default function AddHomeScreen() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([
    { key: 'home', emoji: '\ud83c\udfe0', label: 'Home', neighbourhood: null },
    { key: 'work', emoji: '\ud83d\udcbc', label: 'Work', neighbourhood: null },
    { key: 'custom', emoji: '\ud83d\udccd', label: '', neighbourhood: null, editable: true },
  ]);
  const [customLabel, setCustomLabel] = useState('');

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSlots(prev => prev.map(s => {
          const saved = parsed[s.key];
          if (saved) return { ...s, neighbourhood: saved.neighbourhood, label: saved.label || s.label };
          return s;
        }));
        if (parsed.custom?.label) setCustomLabel(parsed.custom.label);
      }
      // Check if home was already set from a previous step
      const homeLoc = await AsyncStorage.getItem('reassura_home_location');
      if (homeLoc) {
        const home = JSON.parse(homeLoc);
        setSlots(prev => prev.map(s => s.key === 'home' ? { ...s, neighbourhood: home.neighbourhood } : s));
      }
    } catch {}
  };

  const handleAddLocation = (slotKey: string) => {
    const slot = slots.find(s => s.key === slotKey);
    const label = slotKey === 'custom' ? (customLabel || 'Place') : (slot?.label || 'Place');
    router.push({ pathname: '/onboarding/add-location', params: { slotKey, slotEmoji: slot?.emoji || '\ud83d\udccd', slotLabel: label } });
  };

  const handleContinue = async () => {
    const data: Record<string, any> = {};
    slots.forEach(s => {
      if (s.neighbourhood) {
        data[s.key] = { neighbourhood: s.neighbourhood, label: s.key === 'custom' ? (customLabel || 'Place') : s.label };
      }
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    router.push('/onboarding/invite');
  };

  // Listen for returning from add-location screen
  useEffect(() => {
    const check = async () => {
      const result = await AsyncStorage.getItem('reassura_location_result');
      if (result) {
        const { slotKey, neighbourhood } = JSON.parse(result);
        setSlots(prev => prev.map(s => s.key === slotKey ? { ...s, neighbourhood } : s));
        await AsyncStorage.removeItem('reassura_location_result');
      }
    };
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="home-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 3 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={shared.title}>Your saved places {'\ud83d\udccd'}</Text>
      <Text style={shared.subtitle}>Add up to 3 places so Reassura knows when you{'\u2019'}re somewhere familiar.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {slots.map((slot) => (
          <View key={slot.key} style={[styles.slotCard, slot.neighbourhood && styles.slotFilled]} data-testid={`slot-${slot.key}`}>
            <Text style={styles.slotEmoji}>{slot.emoji}</Text>
            <View style={{ flex: 1 }}>
              {slot.editable && !slot.neighbourhood ? (
                <TextInput
                  style={styles.customLabelInput}
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="Name this place (Gym, School...)"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  data-testid="custom-place-label"
                />
              ) : (
                <Text style={styles.slotLabel}>{slot.key === 'custom' ? (customLabel || 'Custom place') : slot.label}</Text>
              )}
              {slot.neighbourhood ? (
                <Text style={styles.slotNeighbourhood}>{slot.neighbourhood}</Text>
              ) : (
                <Text style={styles.slotPlaceholder}>Tap to add</Text>
              )}
            </View>
            {slot.neighbourhood ? (
              <TouchableOpacity onPress={() => handleAddLocation(slot.key)} data-testid={`edit-${slot.key}`}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddLocation(slot.key)} data-testid={`add-${slot.key}`}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.infoText}>
            When you{'\u2019'}re at these places Reassura can suggest a quick check-in. Your circle will recognise where you are.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleContinue} activeOpacity={0.8} data-testid="home-continue-btn">
        <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
          <Text style={shared.btnPrimaryText}>Continue {'\u2192'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={shared.btnGhost} onPress={() => router.push('/onboarding/invite')} data-testid="home-skip-btn">
        <Text style={shared.btnGhostText}>Skip {'\u2014'} add later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 8,
    gap: 12,
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(122,158,135,0.25)',
    backgroundColor: 'rgba(122,158,135,0.06)',
  },
  slotEmoji: { fontSize: 24 },
  slotLabel: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  slotNeighbourhood: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 },
  slotPlaceholder: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 1 },
  customLabelInput: {
    fontFamily: ONBOARDING.bodyBold,
    color: ONBOARDING.white,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  editText: { fontFamily: ONBOARDING.bodyMed, color: ONBOARDING.sage, fontSize: 12 },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(122,158,135,0.35)',
    backgroundColor: 'rgba(122,158,135,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: ONBOARDING.sage, fontSize: 18, fontWeight: '300', marginTop: -1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(122,158,135,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.15)',
    borderRadius: 11,
    padding: 12,
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoText: {
    flex: 1,
    fontFamily: ONBOARDING.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 17,
  },
});
