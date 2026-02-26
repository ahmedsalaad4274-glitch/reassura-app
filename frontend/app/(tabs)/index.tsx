import React, { useEffect, useState, useRef } from 'react';
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
import { userApi, circleApi, footprintApi, travelApi } from '../../src/services/api';
import { StoryCircle } from '../../src/components/StoryCircle';
import { ProfilePopup } from '../../src/components/ProfilePopup';
import { PeaceScoreBanner } from '../../src/components/PeaceScoreBanner';
import { FootprintCard } from '../../src/components/FootprintCard';
import { EmergencyButton } from '../../src/components/EmergencyButton';
import { Sidebar } from '../../src/components/Sidebar';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  
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
  } = useAppStore();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, circlesRes, footprintsRes, currentUserRes] = await Promise.all([
        userApi.getAll(),
        circleApi.getAll(),
        footprintApi.getAll(),
        userApi.getCurrent(),
      ]);
      
      setUsers(usersRes.data);
      setCircles(circlesRes.data);
      setFootprints(footprintsRes.data);
      setCurrentUser(currentUserRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)}>
          <Ionicons name="menu" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="leaf" size={20} color={COLORS.sageGreen} />
          <Text style={styles.headerTitle}>Reassura</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      
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
            <PagerView
              ref={pagerRef}
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
            </PagerView>
            
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