import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { useInvites } from '../../src/context/InviteContext';
import { OrbitCanvas, OrbitMember } from '../../src/components/circles/OrbitCanvas';
import { BentoGrid } from '../../src/components/circles/BentoGrid';
import { WaveOverlay } from '../../src/components/circles/WaveOverlay';

const { width: W, height: H } = Dimensions.get('window');
const INK = '#0D0B09';
const SAGE = '#7A9E87';
const SAGE_DK = '#4A7A5A';
const CREAM = '#F7F3EE';
const TERRA = '#C4704A';
const ARENA_H = H * 0.42;

// ── Mock Data ─────────────────────────────────────────────
const CIRCLES = [
  { id: '1', name: 'Family', members: [
    { id: 'm1', name: 'Mum', emoji: '\u{1F9D1}\u{1F3FE}', status: 'steady' as const },
    { id: 'm2', name: 'Dad', emoji: '\u{1F9D4}\u{1F3FE}', status: 'active' as const },
    { id: 'm3', name: 'Sara', emoji: '\u{1F9D5}\u{1F3FE}', status: 'quiet' as const },
    { id: 'm4', name: 'Jamie', emoji: '\u{1F464}', status: 'offgrid' as const },
  ]},
  { id: '2', name: 'Friends', members: [
    { id: 'm5', name: 'Alex', emoji: '\u{1F9D1}\u{1F3FB}', status: 'active' as const },
    { id: 'm6', name: 'Jay', emoji: '\u{1F469}\u{1F3FD}', status: 'steady' as const },
  ]},
];

// ── Helpers ───────────────────────────────────────────────
function statusSummary(members: OrbitMember[]): string {
  const active = members.filter(m => m.status === 'active').length;
  const offgrid = members.filter(m => m.status === 'offgrid').length;
  if (active > 0) return `${active} active`;
  if (offgrid > 0) return `${offgrid} off-grid`;
  return 'All steady';
}

function pipColor(status: string): string {
  if (status === 'active') return SAGE;
  if (status === 'steady') return 'rgba(122,158,135,0.5)';
  if (status === 'quiet') return 'rgba(255,255,255,0.15)';
  return TERRA;
}

// ── I'm Home 3D Button ───────────────────────────────────
const ImHomeButton = () => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const handlePressIn = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    Animated.spring(pressAnim, { toValue: 4, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  return (
    <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} style={s.homeWrap}>
      <View style={s.homeBase}>
        <Animated.View style={[s.homeFace, { transform: [{ translateY: pressAnim }] }]}>
          <Text style={s.homeText}>{'\u{1F3E0}'}  I'm Home</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ──────────────────────────────────────────
export default function CirclesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { getInvitesForCircle } = useInvites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [waveTarget, setWaveTarget] = useState<OrbitMember | null>(null);

  const totalMembers = CIRCLES.reduce((sum, c) => sum + c.members.length, 0);
  const selected = CIRCLES.find(c => c.id === selectedId);
  const current = CIRCLES.length === 1 ? CIRCLES[0] : selected;
  const showGrid = CIRCLES.length >= 2 && !selectedId;
  const pendingInvites = current ? getInvitesForCircle(current.id) : [];

  const handleWave = () => {};

  const handleInvite = () => {
    const cId = current?.id || '1';
    const cName = current?.name || 'your circle';
    router.push({ pathname: '/circle-invite', params: { circleId: cId, circleName: cName } });
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* ── 1. Header ────────────────────── */}
        <View style={s.header}>
          {selectedId && CIRCLES.length >= 2 && (
            <TouchableOpacity onPress={() => setSelectedId(null)} style={s.backBtn} data-testid="back-to-grid">
              <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={[s.title, { color: theme.textPrimary }]}>Your Circles</Text>
          <View style={[s.memberChip, { backgroundColor: isDark ? 'rgba(122,158,135,0.12)' : 'rgba(74,122,90,0.1)' }]}>
            <Text style={[s.memberChipText, { color: theme.sage }]}>{totalMembers} members</Text>
          </View>
          <ThemeToggle />
          <TouchableOpacity style={[s.addBtn, { backgroundColor: isDark ? 'rgba(122,158,135,0.1)' : 'rgba(74,122,90,0.08)' }]} onPress={handleInvite} testID="invite-circle-button">
            <Ionicons name="add" size={22} color={theme.sage} />
          </TouchableOpacity>
        </View>

        {/* ── 2. BentoGrid ─────────────────── */}
        {showGrid && <BentoGrid circles={CIRCLES} onSelect={setSelectedId} isDark={isDark} />}

        {/* ── 3-7. Circle detail ────────────── */}
        {current && (
          <>
            {/* 3. Orbit Arena */}
            <OrbitCanvas key={current.id} members={current.members as OrbitMember[]} onNodePress={setWaveTarget} arenaHeight={ARENA_H} />

            {/* 4. Circle Name + Subtitle */}
            <View style={s.circleInfo}>
              <Text style={[s.circleName, { color: theme.textPrimary }]}>{current.name}</Text>
              <Text style={[s.circleSubtitle, { color: theme.textSecondary }]}>
                {current.members.length} members {'\u00B7'} {statusSummary(current.members as OrbitMember[])}
              </Text>
            </View>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <View style={[s.pendingSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                <Text style={[s.pendingTitle, { color: theme.textSecondary }]}>PENDING INVITES</Text>
                {pendingInvites.map(inv => (
                  <View key={inv.id} style={[s.pendingRow, { borderBottomColor: theme.border }]}>
                    <View style={[s.pendingAvatar, { borderColor: theme.amber }]}>
                      <Text style={s.pendingAvatarText}>{'\u{1F4E8}'}</Text>
                    </View>
                    <View style={s.pendingInfo}>
                      <Text style={[s.pendingName, { color: theme.textPrimary }]}>{inv.name}</Text>
                      <Text style={[s.pendingSub, { color: theme.textTertiary }]}>Invite sent {'\u00B7'} pending</Text>
                    </View>
                    <View style={[s.pendingBadge, { backgroundColor: isDark ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.1)' }]}>
                      <Text style={[s.pendingBadgeText, { color: theme.amber }]}>Pending</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 5. Evening Horizon */}
            <View style={[s.horizonSection, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={s.horizonHeader}>
                <Text style={[s.horizonTitle, { color: theme.textPrimary }]}>Evening Horizon</Text>
                <Text style={[s.horizonCount, { color: theme.textSecondary }]}>
                  {current.members.filter(m => m.status === 'active').length} of {current.members.length} active
                </Text>
              </View>
              <View style={[s.horizonBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(61,46,34,0.08)' }]}>
                <LinearGradient
                  colors={[SAGE_DK, SAGE]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.horizonBarFill, {
                    width: `${Math.max(8, (current.members.filter(m => m.status === 'active').length / current.members.length) * 100)}%`,
                  }]}
                />
                <View style={[s.horizonSun, {
                  left: `${Math.max(5, (current.members.filter(m => m.status === 'active').length / current.members.length) * 100)}%`,
                }]} />
              </View>
              <View style={s.pipRow}>
                {current.members.map(m => (
                  <View key={m.id} style={s.pipItem}>
                    <View style={[s.pip, { backgroundColor: pipColor(m.status) }]} />
                    <Text style={[s.pipName, { color: theme.textSecondary }]}>{m.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 6. I'm Home CTA — always green gradient (exception) */}
            <ImHomeButton />

            {/* 7. Sub-label */}
            <Text style={[s.subLabel, { color: theme.textTertiary }]}>One tap {'\u00B7'} your whole circle knows</Text>
          </>
        )}
      </ScrollView>

      {/* Wave Overlay */}
      <WaveOverlay visible={!!waveTarget} member={waveTarget} onClose={() => setWaveTarget(null)} onWave={handleWave} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: INK },
  scrollContent: { paddingBottom: 120 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 8 },
  backBtn: { marginRight: 4 },
  title: { fontFamily: 'Fraunces_900Black', fontSize: 26, color: CREAM, flex: 1 },
  memberChip: { backgroundColor: 'rgba(122,158,135,0.12)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  memberChipText: { fontSize: 11, color: SAGE, fontWeight: '600' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(122,158,135,0.1)', alignItems: 'center', justifyContent: 'center' },

  // Circle info
  circleInfo: { alignItems: 'center', paddingVertical: 12 },
  circleName: { fontFamily: 'Fraunces_700Bold', fontSize: 22, color: CREAM, fontStyle: 'italic' },
  circleSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 3 },

  // Evening Horizon
  horizonSection: { marginHorizontal: 20, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  horizonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  horizonTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 14, color: CREAM },
  horizonCount: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  horizonBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1.5, position: 'relative', overflow: 'visible' },
  horizonBarFill: { height: 3, borderRadius: 1.5 },
  horizonSun: { position: 'absolute', top: -2.5, width: 8, height: 8, borderRadius: 4, backgroundColor: TERRA, marginLeft: -4, shadowColor: TERRA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4 },
  pipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
  pipItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pip: { width: 5, height: 5, borderRadius: 2.5 },
  pipName: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },

  // I'm Home
  homeWrap: { marginHorizontal: 20, marginTop: 18 },
  homeBase: { height: 56, borderRadius: 16, backgroundColor: '#1e4a2e', position: 'relative' },
  homeFace: { position: 'absolute', top: 0, left: 0, right: 0, height: 52, borderRadius: 16, backgroundColor: SAGE_DK, alignItems: 'center', justifyContent: 'center' },
  homeText: { fontFamily: 'Fraunces_700Bold', fontSize: 16, color: CREAM },

  // Sub-label
  subLabel: { textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10, marginBottom: 20 },

  // Pending Invites
  pendingSection: { marginHorizontal: 20, marginTop: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  pendingTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  pendingAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  pendingAvatarText: { fontSize: 16 },
  pendingInfo: { flex: 1 },
  pendingName: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
  pendingSub: { fontSize: 11, marginTop: 1 },
  pendingBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadgeText: { fontSize: 10, fontWeight: '700' },
});
