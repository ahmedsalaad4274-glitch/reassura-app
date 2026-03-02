import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import FeatureIcon from '../../src/components/FeatureIcon';

const { width } = Dimensions.get('window');
const WIDGET_PREFS_KEY = 'reassura_widget_prefs';

const DEFAULT_WIDGETS = {
  imHome: { visible: true, locked: true, order: 0 },
  quickActions: { visible: true, locked: false, order: 1 },
  circleStories: { visible: true, locked: false, order: 2 },
  latestFootprint: { visible: true, locked: false, order: 3 },
  miniMap: { visible: false, locked: false, order: 4 },
  travelStatus: { visible: false, locked: false, order: 5 },
  peaceStreak: { visible: false, locked: false, order: 6 },
};

const WIDGET_META: Record<string, { emoji: string; label: string }> = {
  imHome: { emoji: '\u{1F3E0}', label: "I'm Home Button" },
  quickActions: { emoji: '\u{1F6B6}', label: 'Quick Actions' },
  circleStories: { emoji: '\u{1F465}', label: 'Circle Stories' },
  latestFootprint: { emoji: '\u{1F463}', label: 'Latest Footprint' },
  miniMap: { emoji: '\u{1F5FA}\uFE0F', label: 'Mini Map' },
  travelStatus: { emoji: '\u2708\uFE0F', label: 'Travel Status' },
  peaceStreak: { emoji: '\u{1F525}', label: 'Peace Streak' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export default function HomeScreen() {
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState('');
  const [toastVis, setToastVis] = useState(false);
  const [checkinModal, setCheckinModal] = useState<{ fromName: string } | null>(null);
  const [smartCheck, setSmartCheck] = useState(false);
  const [imHomePressed, setImHomePressed] = useState(false);
  const [isCustomising, setIsCustomising] = useState(false);
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [streakCount] = useState(12);
  const [safeWalkSheet, setSafeWalkSheet] = useState(false);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateIdx = useRef(0);

  // Animations
  const homeScale = useRef(new Animated.Value(1)).current;
  const tapRingScale = useRef(new Animated.Value(1)).current;
  const tapRingOpacity = useRef(new Animated.Value(0.65)).current;
  const outerRingScale = useRef(new Animated.Value(1)).current;
  const outerRingOpacity = useRef(new Animated.Value(0)).current;
  const statusDotAnim = useRef(new Animated.Value(0.6)).current;

  const {
    users, circles, footprints, currentUser, selectedCircleIndex,
    selectedMemberForPopup, sidebarOpen, isLoading,
    setUsers, setCircles, setFootprints, setCurrentUser,
    setSelectedCircleIndex, setSelectedMemberForPopup, setSidebarOpen,
    setIsLoading, getCircleMembers, activeTravel, setActiveTravel,
  } = useAppStore();
  const { isOnline, setOnline, lastRefresh, setLastRefresh, isDemoMode } = useAuthStore();

  const UPDATES = [
    { userId: 'user-jamie', status: 'arrived', emoji: '\u{1F4CD}', message: 'Just arrived!', name: 'Jamie' },
    { userId: 'user-mum', status: 'home', emoji: '\u{1F3E0}', message: 'Making dinner', name: 'Mum' },
    { userId: 'user-dad', status: 'all_good', emoji: '\u2764\uFE0F', message: 'Relaxing', name: 'Dad' },
  ];

  useEffect(() => {
    loadData();
    loadWidgetPrefs();
    refreshRef.current = setInterval(refreshData, 30000);
    simRef.current = setInterval(simulateUpdate, 45000);
    const t1 = setTimeout(() => setCheckinModal({ fromName: 'Mum' }), 60000);
    const t2 = setTimeout(() => setSmartCheck(true), 90000);
    // Animations
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(tapRingScale, { toValue: 1.12, duration: 1000, useNativeDriver: true }),
        Animated.timing(tapRingOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tapRingScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(tapRingOpacity, { toValue: 0.65, duration: 1000, useNativeDriver: true }),
      ]),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(outerRingOpacity, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(outerRingScale, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(outerRingOpacity, { toValue: 0, duration: 1100, useNativeDriver: true }),
        Animated.timing(outerRingScale, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(statusDotAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(statusDotAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
    ])).start();
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); if (simRef.current) clearInterval(simRef.current); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const loadWidgetPrefs = async () => {
    try {
      const data = await AsyncStorage.getItem(WIDGET_PREFS_KEY);
      if (data) setWidgets(JSON.parse(data));
    } catch {}
  };

  const saveWidgetPrefs = async (w: typeof DEFAULT_WIDGETS) => {
    setWidgets(w);
    await AsyncStorage.setItem(WIDGET_PREFS_KEY, JSON.stringify(w));
  };

  const toggleWidget = (key: string) => {
    const updated = { ...widgets, [key]: { ...widgets[key as keyof typeof widgets], visible: !widgets[key as keyof typeof widgets].visible } };
    saveWidgetPrefs(updated);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [u, c, f, cu, t] = await Promise.all([userApi.getAll(), circleApi.getAll(), footprintApi.getAll(), userApi.getCurrent(), travelApi.getActive()]);
      setUsers(u.data); setCircles(c.data); setFootprints(f.data); setCurrentUser(cu.data); setActiveTravel(t.data);
      setOnline(true); setLastRefresh(new Date());
    } catch { setOnline(false); } finally { setIsLoading(false); }
  };

  const refreshData = useCallback(async () => {
    try { const [f, u] = await Promise.all([footprintApi.getAll(), userApi.getAll()]); setFootprints(f.data); setUsers(u.data); setLastRefresh(new Date()); setOnline(true); } catch { setOnline(false); }
  }, []);

  const simulateUpdate = useCallback(() => {
    const upd = UPDATES[updateIdx.current % UPDATES.length]; updateIdx.current++;
    setUsers(users.map(u => u.id === upd.userId ? { ...u, status: upd.status, status_emoji: upd.emoji, status_message: upd.message, updated_at: new Date().toISOString() } : u));
    toast(`${upd.name} ${upd.emoji} ${upd.status.replace('_', ' ')}`);
  }, [users]);

  const toast = (msg: string) => { setToastMsg(msg); setToastVis(true); };

  const handleImHome = async () => {
    try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    Animated.sequence([
      Animated.timing(homeScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(homeScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    setImHomePressed(true);
    if (currentUser) { try { await userApi.updateStatus(currentUser.id, { status: 'home', message: "I'm home" }); } catch {} }
    toast("\u{1F33F} Your circle knows you're home");
  };

  const selectedCircle = circles[selectedCircleIndex];
  const circleFootprints = selectedCircle ? footprints.filter(f => selectedCircle.member_ids.includes(f.user_id)) : [];
  const latestFp = circleFootprints[0];
  const userName = currentUser?.name || 'Rinade';

  if (isLoading) {
    return (<View style={s.loadingBox}><Ionicons name="leaf" size={48} color={COLORS.sageGreen} /><Text style={s.loadingText}>Loading...</Text></View>);
  }

  const renderWidget = (key: string) => {
    if (!widgets[key as keyof typeof widgets]?.visible && !isCustomising) return null;
    const w = widgets[key as keyof typeof widgets];
    const meta = WIDGET_META[key];
    if (!w || !meta) return null;

    const content = (() => {
      switch (key) {
        case 'imHome': return renderImHome();
        case 'quickActions': return renderQuickActions();
        case 'circleStories': return renderStories();
        case 'latestFootprint': return renderLatestFootprint();
        default: return null;
      }
    })();

    if (isCustomising) {
      return (
        <View key={key} style={s.customiseRow}>
          <Text style={s.dragHandle}>{'\u2807'}</Text>
          <Text style={s.cwEmoji}>{meta.emoji}</Text>
          <Text style={s.cwLabel}>{meta.label}</Text>
          {w.locked ? <Text style={s.cwLocked}>ALWAYS ON</Text> : (
            <Switch value={w.visible} onValueChange={() => toggleWidget(key)}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#5A8A6A' }} thumbColor={COLORS.white} />
          )}
        </View>
      );
    }
    return <View key={key}>{content}</View>;
  };

  const renderImHome = () => (
    <Animated.View style={{ transform: [{ scale: homeScale }] }}>
      <TouchableOpacity onPress={handleImHome} disabled={imHomePressed} activeOpacity={0.85} data-testid="im-home-button">
        <LinearGradient colors={imHomePressed ? ['#2A2A2A', '#333', '#3A3A3A'] : ['#1E3A2B', '#2C5740', '#3D6B50', '#5A8A6A']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.imHomeGrad}>
          {/* Outer pulsing ring */}
          {!imHomePressed && (
            <Animated.View style={[s.imHomePulseOuter, { opacity: outerRingOpacity, transform: [{ scale: outerRingScale }] }]} />
          )}
          <View style={s.imHomeContent}>
            <View style={s.imHomeLeft}>
              <Text style={s.imHomeIcon}>{imHomePressed ? '\u2705' : '\u{1F3E0}'}</Text>
              <View>
                <Text style={s.imHomeTitle}>{imHomePressed ? "You're Home" : "I'm Home"}</Text>
                <Text style={s.imHomeSub}>{imHomePressed ? 'Just now \u00B7 your circle knows you\u2019re safe' : 'One tap to let everyone know you\u2019re safe'}</Text>
              </View>
            </View>
            {!imHomePressed && (
              <Animated.View style={[s.tapRing, { transform: [{ scale: tapRingScale }], opacity: tapRingOpacity }]}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </Animated.View>
            )}
          </View>
          {/* Bottom context line */}
          <View style={s.imHomeFooter}>
            <Animated.View style={[s.imHomeDot, { opacity: statusDotAnim }]} />
            <Text style={s.imHomeFooterText}>{imHomePressed ? 'Confirmed \u00B7 everyone is accounted for' : `${circles.length} circle${circles.length !== 1 ? 's' : ''} will be notified`}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <View style={s.qaRow}>
      <TouchableOpacity style={s.qaSafe} onPress={() => setSafeWalkSheet(true)} data-testid="safe-walk-action">
        <FeatureIcon emoji={'\u{1F6B6}'} color="blue" size={36} />
        <View>
          <Text style={s.qaSafeTitle}>Safe Walk</Text>
          <Text style={s.qaSafeSub}>Share live route</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={s.qaCheck} onPress={() => { toast('Circle notified \u2713'); }} data-testid="check-in-action">
        <FeatureIcon emoji={'\u{1F49A}'} color="sage" size={36} />
        <View>
          <Text style={s.qaCheckTitle}>Check In</Text>
          <Text style={s.qaCheckSub}>All good</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStories = () => (
    <View style={s.glass}>
      <View style={s.sectionHeader}>
        <View style={s.sectionAccent} />
        <Text style={s.sectionLabel}>YOUR CIRCLE</Text>
      </View>
      {circles.length > 0 && (
        <View style={s.storiesWrap}>
          <CrossPlatformPager style={s.pager} initialPage={0} onPageSelected={(e: any) => setSelectedCircleIndex(e.nativeEvent.position)}>
            {circles.map((circle) => {
              const members = getCircleMembers(circle.id);
              const sorted = currentUser ? [...members.filter(m => m.id === currentUser.id), ...members.filter(m => m.id !== currentUser.id)] : members;
              return (
                <View key={circle.id} style={s.page}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.storiesRow}>
                    {sorted.map(m => (
                      <StoryCircle key={m.id} user={m} isCurrentUser={m.id === currentUser?.id}
                        onPress={() => { if (m.id === currentUser?.id) router.push('/update-status'); else setSelectedMemberForPopup(m); }} />
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </CrossPlatformPager>
          <View style={s.dots}>{circles.map((_, i) => <View key={i} style={[s.dot, i === selectedCircleIndex && s.dotActive]} />)}</View>
        </View>
      )}
    </View>
  );

  const renderLatestFootprint = () => {
    if (!latestFp) return null;
    const timeAgo = (() => { const d = Date.now() - new Date(latestFp.created_at).getTime(); const m = Math.floor(d / 60000); return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`; })();
    return (
      <View style={s.fpCard}>
        <Text style={s.fpLabel}>{'\u{1F463}'} Latest Footprint</Text>
        <View style={s.fpRow}>
          <View style={s.fpAvatar}><Text style={{ fontSize: 14 }}>{latestFp.user_emoji}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.fpName}>{latestFp.user_name} · {latestFp.status?.replace('_', ' ')}</Text>
            <Text style={s.fpMsg}>"{latestFp.message}" · {timeAgo}</Text>
          </View>
          <TouchableOpacity><Text style={{ fontSize: 18 }}>{'\u2764\uFE0F'}</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <EnhancedSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toast message={toastMsg} visible={toastVis} onHide={() => setToastVis(false)} type="success" />
      <DemoOverlay onNavigate={(route) => router.push(route as any)} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} testID="sidebar-menu-button">
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Ionicons name="leaf" size={16} color={COLORS.sageGreen} />
          <Text style={s.headerTitle}>Reassura</Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity onPress={() => router.push('/notifications')} testID="notifications-button">
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.editPill, isCustomising && s.editPillActive]} onPress={() => setIsCustomising(!isCustomising)}>
            <Text style={[s.editPillText, isCustomising && s.editPillTextActive]}>
              {isCustomising ? '\u2713 Done' : '\u270F\uFE0F Edit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={s.greetingRow}>
          <View>
            <Text style={s.greetingText}>{getGreeting()}, {userName} {'\u{1F44B}\u{1F3FE}'}</Text>
            <View style={s.statusRow}>
              <Animated.View style={[s.statusDot, { opacity: statusDotAnim }]} />
              <Text style={s.statusText}>All safe · everyone accounted for</Text>
            </View>
          </View>
          <View style={s.streakPill}>
            <Text style={s.streakText}>{'\u{1F525}'} {streakCount}</Text>
          </View>
        </View>

        {/* Customise Banner */}
        {isCustomising && (
          <View style={s.customiseBanner}>
            <Text style={{ fontSize: 16 }}>{'\u270F\uFE0F'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.cbTitle}>Customising home</Text>
              <Text style={s.cbSub}>Toggle widgets on/off</Text>
            </View>
          </View>
        )}

        {/* Widgets */}
        {isCustomising ? (
          Object.keys(widgets).map(renderWidget)
        ) : (
          <>
            {renderWidget('imHome')}
            {renderWidget('quickActions')}
            {renderWidget('circleStories')}
            {renderWidget('latestFootprint')}
            {/* Footprints Feed */}
            <View style={s.glass}>
              <View style={s.sectionHeader}>
                <View style={s.sectionAccent} />
                <Text style={s.sectionLabel}>LATEST FOOTPRINTS</Text>
              </View>
              {circleFootprints.slice(0, 5).map(fp => <FootprintCard key={fp.id} footprint={fp} />)}
              {circleFootprints.length === 0 && <View style={s.empty}><Text style={s.emptyText}>No recent activity</Text></View>}
            </View>
          </>
        )}
      </ScrollView>

      <EmergencyButton />

      {/* Check-in Modal */}
      <Modal visible={!!checkinModal} transparent animationType="slide" statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={s.modalBottom}>
          <View style={s.modalSheet}>
            <Text style={s.modalEmoji}>{'\u{1F49A}'}</Text>
            <Text style={s.modalTitle}>{checkinModal?.fromName} is wondering if you're okay</Text>
            {[{ l: 'All good', e: '\u2764\uFE0F' }, { l: 'Be home soon', e: '\u{1F697}' }, { l: 'At work', e: '\u{1F4BC}' }].map((r, i) => (
              <TouchableOpacity key={i} style={s.modalBtn} onPress={() => { setCheckinModal(null); toast(`You reassured ${checkinModal?.fromName} \u{1F33F}`); }}>
                <Text style={{ fontSize: 20 }}>{r.e}</Text><Text style={s.modalBtnText}>{r.l}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalDismiss} onPress={() => setCheckinModal(null)}><Text style={s.modalDismissText}>Dismiss</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Smart Emergency */}
      <Modal visible={smartCheck} transparent animationType="fade" statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={s.modalBottom}>
          <View style={s.modalSheet}>
            <Text style={s.modalEmoji}>{'\u{1F331}'}</Text>
            <Text style={s.modalTitle}>We haven't heard from you in a while</Text>
            <Text style={s.modalSub}>Everything okay?</Text>
            {[{ l: 'All good', e: '\u2764\uFE0F', c: false }, { l: 'Busy, back later', e: '\u{1F552}', c: false }, { l: 'I need help', e: '\u{1F6A8}', c: true }].map((r, i) => (
              <TouchableOpacity key={i} style={[s.modalBtn, r.c && { borderColor: COLORS.terracotta }]} onPress={() => { setSmartCheck(false); toast('Status updated \u{1F33F}'); }}>
                <Text style={{ fontSize: 20 }}>{r.e}</Text><Text style={[s.modalBtnText, r.c && { color: COLORS.terracotta }]}>{r.l}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalDismiss} onPress={() => setSmartCheck(false)}><Text style={s.modalDismissText}>Dismiss</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safe Walk Bottom Sheet */}
      <Modal visible={safeWalkSheet} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={() => setSafeWalkSheet(false)}>
          <View style={s.sheetContainer} onStartShouldSetResponder={() => true}>
            <View style={s.sheetHandle} />

            {/* Mini map */}
            <View style={s.sheetMap}>
              <View style={s.sheetRoutePath} />
              <View style={s.sheetWalkDot}>
                <Animated.View style={[s.sheetWalkPulse, { opacity: statusDotAnim }]} />
                <Text style={{ fontSize: 12 }}>{'\u{1F6B6}'}</Text>
              </View>
              <View style={s.sheetHomePin}>
                <Text style={{ fontSize: 14 }}>{'\u{1F3E0}'}</Text>
              </View>
              <View style={s.sheetMapPill}>
                <Text style={s.sheetMapPillText}>{'\u{1F6B6}'} Safe Walk {'\u00B7'} Live {'\u00B7'} 8 min away</Text>
              </View>
            </View>

            {/* Circle watching */}
            <Text style={s.sheetWatchLabel}>CIRCLE IS WATCHING</Text>
            <View style={s.sheetWatchRow}>
              <View style={s.sheetAvatarGroup}>
                {[{ e: '\u{1F469}\u{1F3FE}', n: 'Mum' }, { e: '\u{1F468}\u{1F3FE}', n: 'Dad' }, { e: '\u{1F9D1}\u{1F3FE}', n: 'Jamie' }].map((m, i) => (
                  <View key={i} style={s.sheetAvatarItem}>
                    <View style={s.sheetAvatarCircle}><Text style={{ fontSize: 14 }}>{m.e}</Text></View>
                    <Text style={s.sheetAvatarName}>{m.n}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.sheetWatchNote}>watching your route live</Text>
            </View>

            {/* Stop button */}
            <TouchableOpacity style={s.sheetStopBtn} onPress={() => setSafeWalkSheet(false)} data-testid="stop-safe-walk-button">
              <Text style={s.sheetStopText}>Stop Safe Walk</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ProfilePopup user={selectedMemberForPopup} visible={!!selectedMemberForPopup} onClose={() => setSelectedMemberForPopup(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  loadingBox: { flex: 1, backgroundColor: COLORS.backgroundDark, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 14 },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 20, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editPill: { backgroundColor: 'rgba(122,158,135,0.15)', borderWidth: 1, borderColor: 'rgba(122,158,135,0.3)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  editPillActive: { backgroundColor: '#5A8A6A', borderColor: '#5A8A6A' },
  editPillText: { fontSize: 11, color: '#7A9E87', fontWeight: '600' },
  editPillTextActive: { color: COLORS.white },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120, paddingHorizontal: SPACING.lg, gap: 12, paddingTop: SPACING.sm },
  // Greeting
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetingText: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 18, letterSpacing: -0.3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.sageGreen },
  statusText: { fontSize: 10, color: COLORS.textMuted },
  streakPill: { backgroundColor: 'rgba(255,140,0,0.14)', borderWidth: 1, borderColor: 'rgba(255,140,0,0.28)', borderRadius: 18, paddingHorizontal: 9, paddingVertical: 3 },
  streakText: { fontSize: 10, color: '#FF9500' },
  // I'm Home hero
  imHomeGrad: { borderRadius: 22, padding: 22, paddingBottom: 14, overflow: 'hidden', position: 'relative' },
  imHomePulseOuter: { position: 'absolute', top: -3, left: -3, right: -3, bottom: -3, borderRadius: 25, borderWidth: 1.5, borderColor: 'rgba(122,158,135,0.35)' },
  imHomeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  imHomeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  imHomeIcon: { fontSize: 38 },
  imHomeTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 24, letterSpacing: -0.4 },
  imHomeSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3, maxWidth: 220 },
  tapRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  imHomeFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  imHomeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.sageGreen },
  imHomeFooterText: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  // Quick Actions — two-card row
  qaRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginBottom: 10 },
  qaSafe: {
    flex: 1, backgroundColor: 'rgba(74,106,170,0.08)', borderColor: 'rgba(74,106,170,0.25)', borderWidth: 1.5,
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  qaSafeTitle: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  qaSafeSub: { fontSize: 10, color: 'rgba(255,255,255,0.38)' },
  qaCheck: {
    flex: 1, backgroundColor: 'rgba(122,158,135,0.08)', borderColor: 'rgba(122,158,135,0.2)', borderWidth: 1.5,
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  qaCheckTitle: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  qaCheckSub: { fontSize: 10, color: 'rgba(255,255,255,0.38)' },
  // Safe Walk Bottom Sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContainer: {
    backgroundColor: '#12161E', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: 'rgba(74,106,170,0.3)', paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.8, shadowRadius: 20,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetMap: {
    height: 160, borderRadius: 18, backgroundColor: '#0F1520',
    borderWidth: 1.5, borderColor: 'rgba(74,106,170,0.3)', marginBottom: 14, marginHorizontal: 18,
    overflow: 'hidden', position: 'relative',
  },
  sheetRoutePath: { position: 'absolute', top: '50%', left: 30, right: 40, height: 2, backgroundColor: 'rgba(74,106,170,0.3)', borderRadius: 1 },
  sheetWalkDot: { position: 'absolute', top: '42%', left: '55%', alignItems: 'center', justifyContent: 'center' },
  sheetWalkPulse: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(74,106,170,0.3)' },
  sheetHomePin: { position: 'absolute', top: '38%', right: 30, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(122,158,135,0.2)', borderWidth: 1, borderColor: COLORS.sageGreen, alignItems: 'center', justifyContent: 'center' },
  sheetMapPill: { position: 'absolute', bottom: 10, alignSelf: 'center', backgroundColor: 'rgba(14,18,36,0.9)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(74,106,170,0.3)' },
  sheetMapPillText: { fontSize: 10, color: '#8AAAE0', fontWeight: '600' },
  sheetWatchLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 8, marginHorizontal: 18 },
  sheetWatchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 18 },
  sheetAvatarGroup: { flexDirection: 'row', gap: 12 },
  sheetAvatarItem: { alignItems: 'center', gap: 3 },
  sheetAvatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  sheetAvatarName: { fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  sheetWatchNote: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginLeft: 12, flex: 1 },
  sheetStopBtn: {
    backgroundColor: 'rgba(196,105,79,0.1)', borderColor: 'rgba(196,105,79,0.3)', borderWidth: 1.5,
    borderRadius: 100, padding: 14, marginHorizontal: 18, alignItems: 'center',
  },
  sheetStopText: { fontFamily: FONTS.heading, fontSize: 14, fontWeight: '600', color: '#E07A5F' },
  // Glass card
  glass: { ...GLASS_CARD, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  sectionAccent: { width: 3, height: 14, backgroundColor: COLORS.sageGreen, borderRadius: 2, marginRight: SPACING.sm },
  sectionLabel: { fontFamily: FONTS.bodyMedium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', flex: 1 },
  storiesWrap: { marginTop: 4 },
  pager: { height: 130 },
  page: { flex: 1 },
  storiesRow: { paddingHorizontal: SPACING.md },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SPACING.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 3 },
  dotActive: { backgroundColor: COLORS.sageGreen, width: 18 },
  // Footprint widget
  fpCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 },
  fpLabel: { fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, fontWeight: '600' },
  fpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fpAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(122,158,135,0.15)', borderWidth: 1.5, borderColor: COLORS.sageGreen, alignItems: 'center', justifyContent: 'center' },
  fpName: { fontSize: 11, color: COLORS.white, fontWeight: '500' },
  fpMsg: { fontSize: 9, color: 'rgba(255,255,255,0.32)', marginTop: 1 },
  empty: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
  // Customise
  customiseBanner: { backgroundColor: 'rgba(122,158,135,0.09)', borderWidth: 1, borderColor: 'rgba(122,158,135,0.22)', borderRadius: 13, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cbTitle: { fontSize: 11, color: COLORS.sageGreen, fontWeight: '600' },
  cbSub: { fontSize: 9, color: COLORS.textMuted, marginTop: 1 },
  customiseRow: { flexDirection: 'row', alignItems: 'center', ...GLASS_CARD, padding: 12, gap: 10 },
  dragHandle: { fontSize: 14, color: COLORS.textMuted },
  cwEmoji: { fontSize: 16 },
  cwLabel: { flex: 1, fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textBody },
  cwLocked: { fontFamily: FONTS.bodyMedium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5 },
  // Modals
  modalBottom: { flex: 1, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: 'rgba(26,22,18,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 20, paddingBottom: 36, alignItems: 'center' },
  modalEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  modalTitle: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.white, textAlign: 'center', letterSpacing: -0.3 },
  modalSub: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textBody, textAlign: 'center', marginBottom: SPACING.sm },
  modalBtn: { flexDirection: 'row', alignItems: 'center', width: '100%', ...GLASS_CARD, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, gap: SPACING.md, marginTop: SPACING.sm },
  modalBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textBody },
  modalDismiss: { marginTop: SPACING.lg, paddingVertical: SPACING.sm },
  modalDismissText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textMuted },
});
