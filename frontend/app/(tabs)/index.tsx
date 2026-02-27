import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CrossPlatformPager } from '../../src/components/CrossPlatformPager';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useAuthStore } from '../../src/store/authStore';
import { userApi, circleApi, footprintApi, travelApi } from '../../src/services/api';
import { StoryCircle } from '../../src/components/StoryCircle';
import { ProfilePopup } from '../../src/components/ProfilePopup';
import { PeaceScoreBanner } from '../../src/components/PeaceScoreBanner';
import { FootprintCard } from '../../src/components/FootprintCard';
import { EmergencyButton } from '../../src/components/EmergencyButton';
import { EnhancedSidebar } from '../../src/components/EnhancedSidebar';
import { Toast } from '../../src/components/Toast';
import { DemoOverlay } from '../../src/components/DemoMode';

const { width } = Dimensions.get('window');

// Check-in request quick responses
const CHECKIN_RESPONSES = [
  { label: 'All good', emoji: '\u2764\uFE0F' },
  { label: 'Be home soon', emoji: '\u{1F697}' },
  { label: 'At work', emoji: '\u{1F4BC}' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [checkinModal, setCheckinModal] = useState<{ fromUser: string; fromName: string } | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateIndexRef = useRef(0);
  
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
    { userId: 'user-dad', status: 'all_good', emoji: '\u2764\uFE0F', message: 'Relaxing at home', name: 'Dad' },
  ];
  
  useEffect(() => {
    loadData();
    refreshIntervalRef.current = setInterval(() => refreshData(), 30000);
    simulationIntervalRef.current = setInterval(() => simulateUpdate(), 45000);
    // Simulate a check-in nudge after 60 seconds
    const checkinTimeout = setTimeout(() => {
      setCheckinModal({ fromUser: 'user-mum', fromName: 'Mum' });
    }, 60000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      clearTimeout(checkinTimeout);
    };
  }, []);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, circlesRes, footprintsRes, currentUserRes, travelRes] = await Promise.all([
        userApi.getAll(), circleApi.getAll(), footprintApi.getAll(),
        userApi.getCurrent(), travelApi.getActive(),
      ]);
      setUsers(usersRes.data);
      setCircles(circlesRes.data);
      setFootprints(footprintsRes.data);
      setCurrentUser(currentUserRes.data);
      setActiveTravel(travelRes.data);
      setOnline(true);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
      setOnline(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshData = useCallback(async () => {
    try {
      const [footprintsRes, usersRes] = await Promise.all([
        footprintApi.getAll(), userApi.getAll(),
      ]);
      setFootprints(footprintsRes.data);
      setUsers(usersRes.data);
      setLastRefresh(new Date());
      setOnline(true);
    } catch (error) {
      setOnline(false);
    }
  }, []);
  
  const simulateUpdate = useCallback(() => {
    const update = STATUS_UPDATES[updateIndexRef.current % STATUS_UPDATES.length];
    updateIndexRef.current++;
    const updatedUsers = users.map(user => {
      if (user.id === update.userId) {
        return { ...user, status: update.status, status_emoji: update.emoji, status_message: update.message, updated_at: new Date().toISOString() };
      }
      return user;
    });
    setUsers(updatedUsers);
    setToastMessage(`${update.name} ${update.emoji} ${update.status.replace('_', ' ')}`);
    setToastVisible(true);
    if (activeTravel.length > 0) {
      setActiveTravel(activeTravel.map(t => ({ ...t, progress: Math.min(100, t.progress + 3) })));
    }
  }, [users, activeTravel]);
  
  const handlePageChange = (e: any) => setSelectedCircleIndex(e.nativeEvent.position);
  const handleCheckinRespond = (response: string) => {
    setCheckinModal(null);
    setToastMessage(`You reassured ${checkinModal?.fromName}`);
    setToastVisible(true);
  };
  
  const selectedCircle = circles[selectedCircleIndex];
  const circleFootprints = selectedCircle
    ? footprints.filter(f => selectedCircle.member_ids.includes(f.user_id))
    : [];
  
  const formatLastRefresh = () => {
    if (!lastRefresh) return '';
    const diff = Math.floor((Date.now() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Updated just now';
    return `Updated ${Math.floor(diff / 60)}m ago`;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="leaf" size={48} color={COLORS.sageGreen} />
        <Text style={styles.loadingText}>Loading your circle...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <EnhancedSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} type="success" />
      <DemoOverlay onNavigate={(route) => router.push(route as any)} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} testID="sidebar-menu-button" accessibilityLabel="Open menu">
          <Ionicons name="menu" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={18} color={COLORS.sageGreen} />
          <Text style={styles.headerTitle}>Reassura</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.connectionDot, { backgroundColor: isOnline ? COLORS.sageGreen : COLORS.muted }]} />
          <TouchableOpacity onPress={() => router.push('/notifications')} testID="notifications-button">
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO</Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Peace Score Card */}
        <View style={styles.card}>
          <PeaceScoreBanner />
        </View>
        
        {/* Circle Switcher + Stories Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>YOUR CIRCLE</Text>
            <Text style={styles.refreshText}>{formatLastRefresh()}</Text>
          </View>
          
          <View style={styles.circleSwitcher}>
            <View style={styles.circleChip}>
              <Text style={styles.circleChipEmoji}>{selectedCircle?.emoji || '\u{1F465}'}</Text>
              <Text style={styles.circleChipText}>{selectedCircle?.name || 'Circle'}</Text>
            </View>
            <Text style={styles.swipeHint}>Swipe to switch</Text>
          </View>
          
          {circles.length > 0 && (
            <View style={styles.storiesContainer}>
              <CrossPlatformPager style={styles.pager} initialPage={0} onPageSelected={handlePageChange}>
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
        
        {/* Latest Footprints Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>LATEST FOOTPRINTS</Text>
          </View>
          {circleFootprints.slice(0, 5).map(footprint => (
            <FootprintCard key={footprint.id} footprint={footprint} />
          ))}
          {circleFootprints.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activity</Text>
              <Text style={styles.emptyStateHint}>
                When your circle updates their status, it'll appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <EmergencyButton />
      
      {/* Check-in Request Modal */}
      <Modal visible={!!checkinModal} transparent animationType="slide">
        <View style={styles.checkinBackdrop}>
          <View style={styles.checkinSheet}>
            <View style={styles.checkinHeader}>
              <Text style={styles.checkinEmoji}>{'\u{1F49A}'}</Text>
              <Text style={styles.checkinTitle}>{checkinModal?.fromName} is wondering if you're okay</Text>
            </View>
            <Text style={styles.checkinSubtitle}>Quick response:</Text>
            <View style={styles.checkinResponses}>
              {CHECKIN_RESPONSES.map((r, i) => (
                <TouchableOpacity key={i} style={styles.checkinResponseBtn} onPress={() => handleCheckinRespond(r.label)}>
                  <Text style={styles.checkinResponseEmoji}>{r.emoji}</Text>
                  <Text style={styles.checkinResponseText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.checkinDismiss} onPress={() => setCheckinModal(null)}>
              <Text style={styles.checkinDismissText}>Dismiss</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  demoBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  demoBadgeText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 10,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    paddingTop: SPACING.sm,
  },
  // Card style matching profile screen
  card: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1.5,
  },
  refreshText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.muted,
  },
  circleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  circleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  circleChipEmoji: {
    fontSize: 16,
  },
  circleChipText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
  },
  swipeHint: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
  },
  storiesContainer: {
    marginTop: SPACING.sm,
  },
  pager: {
    height: 130,
  },
  page: {
    flex: 1,
  },
  storiesRow: {
    paddingHorizontal: SPACING.md,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.whiteTransparent25,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.sageGreen,
  },
  emptyState: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  emptyStateHint: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  // Check-in modal
  checkinBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  checkinSheet: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  checkinHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkinEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  checkinTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.white,
    textAlign: 'center',
  },
  checkinSubtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.md,
  },
  checkinResponses: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  checkinResponseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122,158,135,0.12)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)',
    gap: SPACING.md,
  },
  checkinResponseEmoji: {
    fontSize: 22,
  },
  checkinResponseText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: COLORS.white,
  },
  checkinDismiss: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  checkinDismissText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
  },
});
