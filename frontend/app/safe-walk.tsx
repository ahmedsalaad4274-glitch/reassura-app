import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, GLASS_CARD } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';

const { width } = Dimensions.get('window');

export default function SafeWalkScreen() {
  const router = useRouter();
  const { currentUser, users, circles } = useAppStore();
  const [phase, setPhase] = useState<'setup' | 'active' | 'arrived'>('setup');
  const [destination, setDestination] = useState('');
  const [eta, setEta] = useState('15 min');
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const circleMembers = React.useMemo(() => {
    if (!currentUser) return [];
    const ids = new Set<string>();
    circles.filter(c => currentUser.circle_ids.includes(c.id)).forEach(c => c.member_ids.forEach(id => { if (id !== currentUser.id) ids.add(id); }));
    return users.filter(u => ids.has(u.id));
  }, [currentUser, circles, users]);

  useEffect(() => {
    if (phase === 'active') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])).start();
      const interval = setInterval(() => {
        setProgress(p => {
          const next = Math.min(100, p + 8);
          Animated.timing(progressAnim, { toValue: next / 100, duration: 500, useNativeDriver: false }).start();
          if (next >= 100) clearInterval(interval);
          return next;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const startWalk = () => setPhase('active');
  const arrivesSafely = () => setPhase('arrived');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{'\u{1F6B6}'} Safe Walk</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {phase === 'setup' && (
          <>
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>WHERE ARE YOU WALKING?</Text>
              <TextInput
                style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Home, friend's house..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>EXPECTED TIME</Text>
              <View style={styles.etaRow}>
                {['10 min', '15 min', '20 min', '30 min'].map(t => (
                  <TouchableOpacity key={t} style={[styles.etaChip, eta === t && styles.etaChipActive]} onPress={() => setEta(t)}>
                    <Text style={[styles.etaText, eta === t && styles.etaTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>WHO'S WATCHING OVER YOU</Text>
              <View style={styles.memberRow}>
                {circleMembers.map(m => (
                  <View key={m.id} style={styles.memberChip}>
                    <Text style={styles.memberEmoji}>{m.emoji}</Text>
                    <Text style={styles.memberName}>{m.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startWalk} activeOpacity={0.85}>
              <Text style={styles.startButtonText}>{'\u{1F33F}'} Start Safe Walk</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'active' && (
          <>
            <Animated.View style={[styles.activeIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.activeEmoji}>{'\u{1F6B6}'}</Text>
            </Animated.View>
            <Text style={styles.activeTitle}>Safe Walk Active</Text>
            <Text style={styles.activeSubtitle}>
              {destination ? `Walking to ${destination}` : 'Walking safely'} · {eta}
            </Text>

            <View style={styles.progressCard}>
              <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, {
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]} />
              </View>
              <Text style={styles.progressText}>
                {progress < 100 ? `${progress}% of the way` : 'You should be arriving!'}
              </Text>
            </View>

            <View style={styles.glassCard}>
              <Text style={styles.watchingLabel}>
                {circleMembers.map(m => m.name).join(', ')} are watching over you
              </Text>
            </View>

            <TouchableOpacity style={styles.arriveButton} onPress={arrivesSafely} activeOpacity={0.85}>
              <Text style={styles.arriveButtonText}>{'\u{1F3E0}'} I've Arrived Safely</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'arrived' && (
          <View style={styles.arrivedContent}>
            <Text style={styles.arrivedEmoji}>{'\u{1F33F}'}</Text>
            <Text style={styles.arrivedTitle}>You arrived safely!</Text>
            <Text style={styles.arrivedSubtitle}>Your circle has been notified {'\u{1F33F}'}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { fontFamily: FONTS.headingBold, fontSize: 20, color: COLORS.white, letterSpacing: -0.5 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: 40, gap: SPACING.md },
  glassCard: { ...GLASS_CARD, padding: SPACING.md },
  cardLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, marginBottom: SPACING.sm, textTransform: 'uppercase' },
  input: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.white, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  etaRow: { flexDirection: 'row', gap: SPACING.sm },
  etaChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  etaChipActive: { borderColor: COLORS.sageGreen, backgroundColor: 'rgba(122,158,135,0.12)' },
  etaText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textMuted },
  etaTextActive: { color: COLORS.sageGreen },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: 20 },
  memberEmoji: { fontSize: 18 },
  memberName: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textBody },
  startButton: { backgroundColor: COLORS.sageGreen, paddingVertical: SPACING.md, borderRadius: 30, alignItems: 'center', boxShadow: '0 0 20px rgba(122,158,135,0.3)' },
  startButtonText: { fontFamily: FONTS.headingBold, fontSize: 18, color: COLORS.white },
  activeIndicator: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(122,158,135,0.15)', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: SPACING.xl },
  activeEmoji: { fontSize: 48 },
  activeTitle: { fontFamily: FONTS.headingBold, fontSize: 24, color: COLORS.white, textAlign: 'center', marginTop: SPACING.md, letterSpacing: -0.5 },
  activeSubtitle: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textBody, textAlign: 'center', marginBottom: SPACING.lg },
  progressCard: { ...GLASS_CARD, padding: SPACING.md },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: COLORS.sageGreen, borderRadius: 3 },
  progressText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.sageGreen, marginTop: SPACING.sm, textAlign: 'center' },
  watchingLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textBody, textAlign: 'center' },
  arriveButton: { backgroundColor: COLORS.sageGreen, paddingVertical: SPACING.md, borderRadius: 30, alignItems: 'center', marginTop: SPACING.md },
  arriveButtonText: { fontFamily: FONTS.headingBold, fontSize: 18, color: COLORS.white },
  arrivedContent: { alignItems: 'center', paddingTop: SPACING.xxl * 2 },
  arrivedEmoji: { fontSize: 80, marginBottom: SPACING.lg },
  arrivedTitle: { fontFamily: FONTS.headingBold, fontSize: 28, color: COLORS.white, letterSpacing: -0.5, marginBottom: SPACING.sm },
  arrivedSubtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textBody, marginBottom: SPACING.xl },
  doneButton: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: 30, borderWidth: 1, borderColor: COLORS.cardBorder },
  doneButtonText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMuted },
});
