import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeWalk, DEFAULT_WATCHERS } from '../src/context/SafeWalkContext';

const DURATIONS = [5, 10, 15, 20, 30];
const W = Dimensions.get('window').width;

export default function SafeWalkSetup() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { startWalk } = useSafeWalk();

  const [destination, setDestination] = useState('');
  const [watchers, setWatchers] = useState(DEFAULT_WATCHERS.map(w => ({ ...w })));
  const [duration, setDuration] = useState(15);

  const toggleWatcher = (id: string) => {
    setWatchers(prev => prev.map(w => w.id === id ? { ...w, selected: !w.selected } : w));
  };

  const handleStart = () => {
    const selectedWatchers = watchers.filter(w => w.selected);
    startWalk(destination || 'Somewhere safe', selectedWatchers, duration);
    router.back();
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} testID="safe-walk-back" style={s.backBtn}>
            <Text style={[s.backArrow, { color: theme.textPrimary }]}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={[s.title, { color: theme.textPrimary }]}>Safe Walk {'\u{1F6B6}'}</Text>
        </View>

        {/* Field 1 — Destination */}
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.textPrimary }]}>Where are you walking to?</Text>
          <TextInput
            style={[s.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="e.g. Home, friend's house..."
            placeholderTextColor={theme.textSecondary}
            value={destination}
            onChangeText={setDestination}
            testID="safe-walk-destination-input"
          />
          <TouchableOpacity onPress={() => setDestination('')}>
            <Text style={[s.skipLink, { color: theme.sage }]}>Skip — just share my location</Text>
          </TouchableOpacity>
        </View>

        {/* Field 2 — Watchers */}
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.textPrimary }]}>Who should watch over you?</Text>
          <View style={s.chipsRow}>
            {watchers.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[
                  s.chip,
                  { borderColor: w.selected ? theme.sage : theme.border, backgroundColor: w.selected ? (isDark ? 'rgba(122,158,135,0.12)' : 'rgba(122,158,135,0.08)') : 'transparent' },
                ]}
                onPress={() => toggleWatcher(w.id)}
                testID={`watcher-chip-${w.id}`}
              >
                <Text style={s.chipEmoji}>{w.emoji}</Text>
                <Text style={[s.chipName, { color: w.selected ? theme.sage : theme.textSecondary }]}>{w.name}</Text>
                {w.selected && <Text style={[s.chipCheck, { color: theme.sage }]}>{'\u2713'}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Field 3 — Duration */}
        <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.label, { color: theme.textPrimary }]}>How long will you be walking?</Text>
          <View style={s.durRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[
                  s.durPill,
                  { backgroundColor: d === duration ? theme.sage : 'transparent', borderColor: d === duration ? theme.sage : theme.border },
                ]}
                onPress={() => setDuration(d)}
                testID={`duration-${d}`}
              >
                <Text style={[s.durText, { color: d === duration ? '#FFFFFF' : theme.textSecondary }]}>{d} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity onPress={handleStart} activeOpacity={0.85} testID="start-safe-walk-button">
          <LinearGradient
            colors={['#5E9070', '#3D6B50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.startBtn}
          >
            <Text style={s.startText}>{'\u{1F33F}'} Start Safe Walk</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, fontWeight: '600' },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 24, letterSpacing: -0.5 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 14, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: 'DMSans_400Regular' },
  skipLink: { fontSize: 12, fontFamily: 'DMSans_500Medium', marginTop: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12, gap: 6 },
  chipEmoji: { fontSize: 16 },
  chipName: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  chipCheck: { fontSize: 13, fontWeight: '700' },
  durRow: { flexDirection: 'row', gap: 8 },
  durPill: { borderWidth: 1, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14 },
  durText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  startBtn: {
    height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: '#3D6B50', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 18,
  },
  startText: { fontFamily: 'Fraunces_700Bold', fontSize: 17, color: '#FFFFFF' },
});
