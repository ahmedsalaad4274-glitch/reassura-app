import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformPager } from '../../src/components/CrossPlatformPager';
import { COLORS, FONTS, SPACING, GLASS_CARD } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useAuthStore } from '../../src/store/authStore';
import { userApi, circleApi, footprintApi, travelApi } from '../../src/services/api';
import { StoryCircle } from '../../src/components/StoryCircle';
import { ProfilePopup } from '../../src/components/ProfilePopup';
import { FootprintCard } from '../../src/components/FootprintCard';
import { EmergencyButton } from '../../src/components/EmergencyButton';
import { EnhancedSidebar } from '../../src/components/EnhancedSidebar';
import { Toast } from '../../src/components/Toast';
import { DemoOverlay } from '../../src/components/DemoMode';

const { width } = Dimensions.get('window');

const CHECKIN_RESPONSES = [
  { label: 'All good', emoji: '\u2764\uFE0F' },
  { label: 'Be home soon', emoji: '\u{1F697}' },
  { label: 'At work', emoji: '\u{1F4BC}' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [checkinModal, setCheckinModal] = useState<{ fromName: string } | null>(null);
  const [smartCheckVisible, setSmartCheckVisible] = useState(false);
  const [imHomePressed, setImHomePressed] = useState(false);
  const [streakCount] = useState(12);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateIdx = useRef(0);
  const homeButtonScale = useRef(new Animated.Value(1)).current;
  const homeGlowAnim = useRef(new Animated.Value(0.3)).current;

  const {
    users, circles, footprints, currentUser, selectedCircleIndex,
    selectedMemberForPopup, sidebarOpen, isLoading,
    setUsers, setCircles, setFootprints, setCurrentUser,
    setSelectedCircleIndex, setSelectedMemberForPopup, setSidebarOpen,
    setIsLoading, getCircleMembers, activeTravel, setActiveTravel,
  } = useAppStore();
  const { isOnline, setOnline, lastRefresh, setLastRefresh, isDemoMode } = useAuthStore();

  const STATUS_UPDATES = [
    { userId: 'user-jamie', status: 'arrived', emoji: '\u{1F4CD}', message: 'Just arrived!', name: 'Jamie' },
    { userId: 'user-mum', status: 'home', emoji: '\u{1F3E0}', message: 'Making dinner', name: 'Mum' },
    { userId: 'user-dad', status: 'all_good', emoji: '\u2764\uFE0F', message: 'Relaxing', name: 'Dad' },
  ];

  useEffect(() => {
    loadData();
    refreshRef.current = setInterval(refreshData, 30000);
    simRef.current = setInterval(simulateUpdate, 45000);
    const checkinT = setTimeout(() => setCheckinModal({ fromName: 'Mum' }), 60000);
    const smartT = setTimeout(() => setSmartCheckVisible(true), 90000);
    // "I'm Home" pulse glow when not pressed
    if (!imHomePressed) {
      Animated.loop(Animated.sequence([
        Animated.timing(homeGlowAnim, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        Animated.timing(homeGlowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])).start();
    }
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
      if (simRef.current) clearInterval(simRef.current);
      clearTimeout(checkinT);
      clearTimeout(smartT);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [u, c, f, cu, t] = await Promise.all([
        userApi.getAll(), circleApi.getAll(), footprintApi.getAll(), userApi.getCurrent(), travelApi.getActive(),
      ]);
      setUsers(u.data); setCircles(c.data); setFootprints(f.data); setCurrentUser(cu.data); setActiveTravel(t.data);
      setOnline(true); setLastRefresh(new Date());
    } catch { setOnline(false); } finally { setIsLoading(false); }
  };

  const refreshData = useCallback(async () => {
    try {
      const [f, u] = await Promise.all([footprintApi.getAll(), userApi.getAll()]);
      setFootprints(f.data); setUsers(u.data); setLastRefresh(new Date()); setOnline(true);
    } catch { setOnline(false); }
  }, []);

  const simulateUpdate = useCallback(() => {
    const upd = STATUS_UPDATES[updateIdx.current % STATUS_UPDATES.length];
    updateIdx.current++;
    setUsers(users.map(u => u.id === upd.userId ? { ...u, status: upd.status, status_emoji: upd.emoji, status_message: upd.message, updated_at: new Date().toISOString() } : u));
    showToast(`${upd.name} ${upd.emoji} ${upd.status.replace('_', ' ')}`);
    if (activeTravel.length > 0) setActiveTravel(activeTravel.map(t => ({ ...t, progress: Math.min(100, t.progress + 3) })));
  }, [users, activeTravel]);

  const showToast = (msg: string) => { setToastMessage(msg); setToastVisible(true); };

  const handleImHome = async () => {
    Animated.sequence([
      Animated.timing(homeButtonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(homeButtonScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    setImHomePressed(true);
    if (currentUser) {
      try { await userApi.updateStatus(currentUser.id, { status: 'home', message: "I'm home" }); } catch {}
    }
    showToast("\u{1F33F} Your circle knows you're home");
  };

  const handleSmartCheckResponse = (response: string) => {
    setSmartCheckVisible(false);
    if (response === 'help') { /* would trigger emergency */ }
    showToast(`Status updated ${'\u{1F33F}'}`);
  };

  const handleCheckinRespond = (label: string) => {
    setCheckinModal(null);
    showToast(`You reassured ${checkinModal?.fromName} ${'\u{1F33F}'}`);
  };

  const selectedCircle = circles[selectedCircleIndex];
  const circleFootprints = selectedCircle ? footprints.filter(f => selectedCircle.member_ids.includes(f.user_id)) : [];
  const formatRefresh = () => {
    if (!lastRefresh) return '';
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    return diff < 60 ? 'just now' : `${Math.floor(diff / 60)}m ago`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="leaf" size={48} color={COLORS.sageGreen} />
        <Text style={styles.loadingText}>Loading your circle...</Text>
      </View>
    );
  }

  const isLateNight = new Date().getHours() >= 0 && new Date().getHours() < 6;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <EnhancedSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} type="success" />
      <DemoOverlay onNavigate={(route) => router.push(route as any)} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} testID="sidebar-menu-button">
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={16} color={COLORS.sageGreen} />
          <Text style={styles.headerTitle}>Reassura</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.connectionDot, { backgroundColor: isOnline ? COLORS.sageGreen : COLORS.textMuted }]} />
          <TouchableOpacity onPress={() => router.push('/notifications')} testID="notifications-button">
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Peace Score + Streak */}
        <View style={styles.glass}>
          <View style={styles.peaceRow}>
            <View>
              <Text style={styles.peaceLabel}>PEACE SCORE</Text>
              <Text style={styles.peaceScore}>All safe</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{'\u{1F525}'} {streakCount} day streak</Text>
            </View>
          </View>
          <Text style={styles.peaceSubtext}>Everyone in your circle is accounted for {'\u{1F33F}'}</Text>
        </View>

        {/* I'm Home Button */}
        <Animated.View style={{ transform: [{ scale: homeButtonScale }] }}>
          <TouchableOpacity
            style={[styles.imHomeButton, imHomePressed && styles.imHomeButtonPressed]}
            onPress={handleImHome}
            disabled={imHomePressed}
            activeOpacity={0.85}
          >
            {!imHomePressed ? (
              <>
                <Animated.View style={[styles.homeGlow, { opacity: homeGlowAnim }]} />
                <Text style={styles.imHomeEmoji}>{'\u{1F3E0}'}</Text>
                <Text style={styles.imHomeText}>
                  {isLateNight ? "I'm Safe" : "I'm Home"}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.imHomeDoneEmoji}>{'\u2713'}</Text>
                <Text style={styles.imHomeDoneText}>Home · just now</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/night-check')}>
            <Text style={styles.qaEmoji}>{'\u{1F319}'}</Text>
            <Text style={styles.qaText}>Night Check</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/safe-walk')}>
            <Text style={styles.qaEmoji}>{'\u{1F6B6}'}</Text>
            <Text style={styles.qaText}>Safe Walk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => { showToast("\u{1F49A} All good — your circle knows"); }}>
            <Text style={styles.qaEmoji}>{'\u{1F49A}'}</Text>
            <Text style={styles.qaText}>Check In</Text>
          </TouchableOpacity>
        </View>

        {/* Circle Switcher + Stories */}
        <View style={styles.glass}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>YOUR CIRCLE</Text>
            <Text style={styles.refreshText}>{formatRefresh()}</Text>
          </View>

          {circles.length > 0 && (
            <View style={styles.storiesContainer}>
              <CrossPlatformPager style={styles.pager} initialPage={0} onPageSelected={(e: any) => setSelectedCircleIndex(e.nativeEvent.position)}>
                {circles.map((circle) => {
                  const members = getCircleMembers(circle.id);
                  const sorted = currentUser
                    ? [...members.filter(m => m.id === currentUser.id), ...members.filter(m => m.id !== currentUser.id)]
                    : members;
                  return (
                    <View key={circle.id} style={styles.page}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
                        {sorted.map(member => (
                          <StoryCircle
                            key={member.id}
                            user={member}
                            isCurrentUser={member.id === currentUser?.id}
                            onPress={() => {
                              if (member.id === currentUser?.id) router.push('/update-status');
                              else setSelectedMemberForPopup(member);
                            }}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  );
                })}
              </CrossPlatformPager>
              <View style={styles.paginationDots}>
                {circles.map((_, i) => (
                  <View key={i} style={[styles.dot, i === selectedCircleIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Latest Footprints */}
        <View style={styles.glass}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionLabel}>LATEST FOOTPRINTS</Text>
          </View>
          {circleFootprints.slice(0, 5).map(footprint => (
            <FootprintCard key={footprint.id} footprint={footprint} />
          ))}
          {circleFootprints.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <EmergencyButton />

      {/* Check-in Request Modal */}
      <Modal visible={!!checkinModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalEmoji}>{'\u{1F49A}'}</Text>
            <Text style={styles.modalTitle}>{checkinModal?.fromName} is wondering if you're okay</Text>
            <View style={styles.modalResponses}>
              {CHECKIN_RESPONSES.map((r, i) => (
                <TouchableOpacity key={i} style={styles.modalResponseBtn} onPress={() => handleCheckinRespond(r.label)}>
                  <Text style={styles.modalResponseEmoji}>{r.emoji}</Text>
                  <Text style={styles.modalResponseText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setCheckinModal(null)}>
              <Text style={styles.modalDismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Smart Emergency Detection */}
      <Modal visible={smartCheckVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalEmoji}>{'\u{1F331}'}</Text>
            <Text style={styles.modalTitle}>We haven't heard from you in a while</Text>
            <Text style={styles.modalSubtitle}>Everything okay?</Text>
            <View style={styles.modalResponses}>
              <TouchableOpacity style={styles.modalResponseBtn} onPress={() => handleSmartCheckResponse('good')}>
                <Text style={styles.modalResponseEmoji}>{'\u2764\uFE0F'}</Text>
                <Text style={styles.modalResponseText}>All good</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalResponseBtn} onPress={() => handleSmartCheckResponse('busy')}>
                <Text style={styles.modalResponseEmoji}>{'\u{1F552}'}</Text>
                <Text style={styles.modalResponseText}>Busy, back later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalResponseBtn, { borderColor: COLORS.terracotta }]} onPress={() => handleSmartCheckResponse('help')}>
                <Text style={styles.modalResponseEmoji}>{'\u{1F6A8}'}</Text>
                <Text style={[styles.modalResponseText, { color: COLORS.terracotta }]}>I need help</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setSmartCheckVisible(false)}>
              <Text style={styles.modalDismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ProfilePopup
        user={selectedMemberForPopup}
        visible={!!selectedMemberForPopup}
        onClose={() => setSelectedMemberForPopup(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingContainer: { flex: 1, backgroundColor: COLORS.backgroundDark, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 20, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  connectionDot: { width: 7, height: 7, borderRadius: 4 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120, paddingHorizontal: SPACING.lg, gap: 12, paddingTop: SPACING.sm },
  // Glass card
  glass: { ...GLASS_CARD, overflow: 'hidden' },
  // Peace Score
  peaceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.md, paddingBottom: 0 },
  peaceLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  peaceScore: { fontFamily: FONTS.headingBold, fontSize: 22, color: COLORS.white, letterSpacing: -0.5, marginTop: 2 },
  streakBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: 20 },
  streakText: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.gold },
  peaceSubtext: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textBody, paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, paddingTop: 4 },
  // I'm Home
  imHomeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 60, borderRadius: 30, overflow: 'hidden', position: 'relative',
    backgroundColor: COLORS.sageGreen, gap: SPACING.sm,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px rgba(122,158,135,0.3)',
  },
  imHomeButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    boxShadow: 'none',
  },
  homeGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(122,158,135,0.15)' },
  imHomeEmoji: { fontSize: 24 },
  imHomeText: { fontFamily: FONTS.headingBold, fontSize: 20, color: COLORS.white, letterSpacing: -0.3 },
  imHomeDoneEmoji: { fontSize: 18, color: COLORS.textMuted },
  imHomeDoneText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMuted },
  // Quick Actions
  quickActionsRow: { flexDirection: 'row', gap: SPACING.sm },
  quickAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(122,158,135,0.3)',
    backgroundColor: 'transparent', gap: 4,
  },
  qaEmoji: { fontSize: 14 },
  qaText: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.sageGreen },
  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  sectionAccent: { width: 3, height: 14, backgroundColor: COLORS.sageGreen, borderRadius: 2, marginRight: SPACING.sm },
  sectionLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', flex: 1 },
  refreshText: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted },
  // Stories
  storiesContainer: { marginTop: 4 },
  pager: { height: 130 },
  page: { flex: 1 },
  storiesRow: { paddingHorizontal: SPACING.md },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SPACING.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 3 },
  dotActive: { backgroundColor: COLORS.sageGreen, width: 18 },
  // Empty
  emptyState: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { ...GLASS_CARD, backgroundColor: 'rgba(26,22,18,0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: SPACING.xl, paddingBottom: SPACING.xxl, alignItems: 'center' },
  modalEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  modalTitle: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.white, textAlign: 'center', letterSpacing: -0.3 },
  modalSubtitle: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textBody, textAlign: 'center', marginBottom: SPACING.md },
  modalResponses: { width: '100%', gap: SPACING.sm, marginTop: SPACING.lg },
  modalResponseBtn: { flexDirection: 'row', alignItems: 'center', ...GLASS_CARD, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.md },
  modalResponseEmoji: { fontSize: 22 },
  modalResponseText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textBody },
  modalDismiss: { marginTop: SPACING.lg, paddingVertical: SPACING.sm },
  modalDismissText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
});
