import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
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

export default function HomeScreen() {
  const router = useRouter();
  const pagerRef = useRef<ScrollView>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const updateIndexRef = useRef(0);
  
  const {
    users,
    circles,
    footprints,
    currentUser,
    selectedCircleIndex,
    selectedMemberForPopup,
    sidebarOpen,
    isLoading,
    setUsers,
    setCircles,
    setFootprints,
    setCurrentUser,
    setSelectedCircleIndex,
    setSelectedMemberForPopup,
    setSidebarOpen,
    setIsLoading,
    getCircleMembers,
    activeTravel,
    setActiveTravel,
  } = useAppStore();
  
  const { isOnline, setOnline, lastRefresh, setLastRefresh, isDemoMode } = useAuthStore();
  
  // Status updates for simulation
  const STATUS_UPDATES = [
    { userId: 'user-jamie', status: 'arrived', emoji: '📍', message: 'Just arrived!', name: 'Jamie' },
    { userId: 'user-mum', status: 'home', emoji: '🏠', message: 'Making dinner 🍳', name: 'Mum' },
    { userId: 'user-dad', status: 'all_good', emoji: '❤️', message: 'Relaxing at home', name: 'Dad' },
  ];
  
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, 30000);
    
    // Simulate updates every 45 seconds
    simulationIntervalRef.current = setInterval(() => {
      simulateUpdate();
    }, 45000);
    
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, circlesRes, footprintsRes, currentUserRes, travelRes] = await Promise.all([
        userApi.getAll(),
        circleApi.getAll(),
        footprintApi.getAll(),
        userApi.getCurrent(),
        travelApi.getActive(),
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
        footprintApi.getAll(),
        userApi.getAll(),
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
        return {
          ...user,
          status: update.status,
          status_emoji: update.emoji,
          status_message: update.message,
          updated_at: new Date().toISOString(),
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    
    // Show toast
    setToastMessage(`${update.name} ${update.emoji} ${update.status.replace('_', ' ')}`);
    setToastVisible(true);
    
    // Advance Sara's flight progress
    if (activeTravel.length > 0) {
      const updatedTravel = activeTravel.map(t => ({
        ...t,
        progress: Math.min(100, t.progress + 3),
      }));
      setActiveTravel(updatedTravel);
    }
  }, [users, activeTravel]);
  
  const handlePageChange = (e: any) => {
    setSelectedCircleIndex(e.nativeEvent.position);
  };
  
  const selectedCircle = circles[selectedCircleIndex];
  const circleMembers = selectedCircle ? getCircleMembers(selectedCircle.id) : [];
  const circleFootprints = selectedCircle
    ? footprints.filter(f => selectedCircle.member_ids.includes(f.user_id))
    : [];
  
  // Sort members to put current user first
  const sortedMembers = React.useMemo(() => {
    if (!currentUser) return circleMembers;
    const current = circleMembers.find(m => m.id === currentUser.id);
    const others = circleMembers.filter(m => m.id !== currentUser.id);
    return current ? [current, ...others] : others;
  }, [circleMembers, currentUser]);
  
  const formatLastRefresh = () => {
    if (!lastRefresh) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return 'Updated just now';
    return `Updated ${Math.floor(diff / 60)}m ago`;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={styles.loadingIcon}>
          <Ionicons name="leaf" size={48} color={COLORS.sageGreen} />
        </Animated.View>
        <Text style={styles.loadingText}>Loading your circle...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <EnhancedSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        type="success"
      />
      
      {/* Demo mode overlay */}
      <DemoOverlay onNavigate={(route) => router.push(route as any)} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)}>
          <Ionicons name="menu" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={20} color={COLORS.sageGreen} />
          <Text style={styles.headerTitle}>Reassura</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Connection status dot */}
          <View style={[styles.connectionDot, { backgroundColor: isOnline ? COLORS.sageGreen : COLORS.muted }]} />
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Demo badge */}
      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO</Text>
        </View>
      )}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Peace Score */}
        <PeaceScoreBanner />
        
        {/* Circle Switcher */}
        <View style={styles.circleSwitcher}>
          <View style={styles.circleChip}>
            <Text style={styles.circleChipEmoji}>{selectedCircle?.emoji || '👥'}</Text>
            <Text style={styles.circleChipText}>{selectedCircle?.name || 'Circle'}</Text>
          </View>
          <Text style={styles.swipeHint}>Swipe to switch →</Text>
        </View>
        
        {/* Stories Row with PagerView */}
        {circles.length > 0 && (
          <View style={styles.storiesContainer}>
            <CrossPlatformPager
              style={styles.pager}
              initialPage={0}
              onPageSelected={handlePageChange}
            >
              {circles.map((circle, index) => {
                const members = getCircleMembers(circle.id);
                const sortedCircleMembers = currentUser
                  ? [
                      ...members.filter(m => m.id === currentUser.id),
                      ...members.filter(m => m.id !== currentUser.id),
                    ]
                  : members;
                
                return (
                  <View key={circle.id} style={styles.page}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.storiesRow}
                    >
                      {sortedCircleMembers.map(member => (
                        <StoryCircle
                          key={member.id}
                          user={member}
                          isCurrentUser={member.id === currentUser?.id}
                          onPress={() => {
                            if (member.id === currentUser?.id) {
                              router.push('/update-status');
                            } else {
                              setSelectedMemberForPopup(member);
                            }
                          }}
                        />
                      ))}
                    </ScrollView>
                  </View>
                );
              })}
            </CrossPlatformPager>
            
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {circles.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === selectedCircleIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        
        {/* Latest Footprints */}
        <View style={styles.footprintsSection}>
          <Text style={styles.sectionTitle}>Latest footprints</Text>
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
      
      {/* Emergency Button */}
      <EmergencyButton />
      
      {/* Profile Popup */}
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
  },
  loadingIcon: {
    marginBottom: SPACING.md,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 20,
    marginLeft: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  circleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  circleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  circleChipEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
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
    marginTop: SPACING.md,
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
    marginTop: SPACING.sm,
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
  footprintsSection: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
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
});