import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CrossPlatformPager } from '../../src/components/CrossPlatformPager';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../src/store/appStore';
import { travelApi, userApi } from '../../src/services/api';

const { width, height } = Dimensions.get('window');

export default function TravelScreen() {
  const [pageIndex, setPageIndex] = useState(0);
  const [showLandingCelebration, setShowLandingCelebration] = useState(false);
  const { activeTravel, setActiveTravel, setUsers, users } = useAppStore();
  const planeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    loadData();
    // Plane animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(planeAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const loadData = async () => {
    try {
      const [travelRes, usersRes] = await Promise.all([
        travelApi.getActive(),
        userApi.getAll(),
      ]);
      setActiveTravel(travelRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading travel data:', error);
    }
  };
  
  const handleSimulateLanding = async () => {
    if (activeTravel.length > 0) {
      try {
        await travelApi.markLanded(activeTravel[0].id);
        setShowLandingCelebration(true);
        setTimeout(() => {
          setShowLandingCelebration(false);
          loadData();
        }, 5000);
      } catch (error) {
        console.error('Error marking landed:', error);
      }
    }
  };
  
  const travel = activeTravel[0]; // Sara's flight
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CrossPlatformPager
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
      >
        {/* Page 1: Live Flight */}
        <View key="1" style={styles.page}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Travel</Text>
              <Text style={styles.headerSubtitle}>Your circle, wherever they are 🌍</Text>
            </View>
            
            {travel ? (
              <View style={styles.flightCard}>
                <View style={styles.flightHeader}>
                  <View style={styles.avatarRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarEmoji}>{travel.user_emoji}</Text>
                    </View>
                    <View>
                      <Text style={styles.travellerName}>{travel.user_name} is travelling</Text>
                      <Text style={styles.flightNumber}>Flight {travel.flight_number}</Text>
                    </View>
                  </View>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>✈️ Live</Text>
                  </View>
                </View>
                
                {/* Route */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <Text style={styles.airportCode}>{travel.origin_code}</Text>
                    <Text style={styles.airportName}>{travel.origin_name}</Text>
                  </View>
                  
                  <View style={styles.routeLine}>
                    <View style={[styles.routeProgress, { width: `${travel.progress}%` }]} />
                    <Animated.Text
                      style={[
                        styles.planeEmoji,
                        {
                          left: `${travel.progress}%`,
                          transform: [{
                            translateY: planeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-3, 3],
                            })
                          }],
                        },
                      ]}
                    >
                      ✈️
                    </Animated.Text>
                  </View>
                  
                  <View style={styles.routePoint}>
                    <Text style={styles.airportCode}>{travel.destination_code}</Text>
                    <Text style={styles.airportName}>{travel.destination_name}</Text>
                  </View>
                </View>
                
                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>2h 14m</Text>
                    <Text style={styles.statLabel}>Remaining</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{travel.arrival_time.split(' ')[0]}</Text>
                    <Text style={styles.statLabel}>ETA</Text>
                  </View>
                  <View style={styles.stat}>
                    <View style={styles.onTimeBadge}>
                      <Text style={styles.onTimeText}>🟢 On time</Text>
                    </View>
                    <Text style={styles.statLabel}>Status</Text>
                  </View>
                </View>
                
                <Text style={styles.timesText}>
                  Departed {travel.departure_time} · Arriving {travel.arrival_time}
                </Text>
                <Text style={styles.timezoneText}>
                  Lagos is +1hr ahead of London
                </Text>
                
                {/* Reactions */}
                <View style={styles.reactionsRow}>
                  <TouchableOpacity style={styles.reactionBtn}>
                    <Text style={styles.reactionEmoji}>❤️</Text>
                    <Text style={styles.reactionText}>Thinking of you</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reactionBtn}>
                    <Text style={styles.reactionEmoji}>✈️</Text>
                    <Text style={styles.reactionText}>Safe travels</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reactionBtn}>
                    <Text style={styles.reactionEmoji}>🌿</Text>
                    <Text style={styles.reactionText}>We've got you</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.simulateButton} onPress={handleSimulateLanding}>
                  <Text style={styles.simulateButtonText}>Simulate Landing</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="airplane" size={48} color={COLORS.muted} />
                <Text style={styles.emptyTitle}>No active travels</Text>
                <Text style={styles.emptySubtitle}>When someone in your circle travels, their journey will appear here</Text>
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Page 2: Night Sky Map */}
        <View key="2" style={styles.page}>
          <View style={styles.nightSkyContainer}>
            {/* Sky */}
            <View style={styles.nightSky}>
              {/* Stars */}
              {[...Array(30)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.star,
                    {
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60}%`,
                      opacity: Math.random() * 0.5 + 0.5,
                    },
                  ]}
                />
              ))}
            </View>
            
            {/* Ocean */}
            <View style={styles.ocean} />
            
            {/* Landmasses */}
            <View style={[styles.landmass, { left: '5%', bottom: '20%' }]} />
            <View style={[styles.landmass, { right: '10%', bottom: '25%', width: 80, height: 100 }]} />
            
            {/* Flight arc */}
            <View style={styles.flightArc}>
              <View style={styles.flightArcDashed} />
              <View style={[styles.flightArcComplete, { width: '62%' }]} />
              
              {/* Origin */}
              <View style={styles.originDot}>
                <Text style={styles.locationLabel}>🏠 London</Text>
              </View>
              
              {/* Destination */}
              <View style={styles.destDot}>
                <Text style={styles.locationLabel}>📍 Lagos</Text>
              </View>
              
              {/* Plane position */}
              <Animated.View
                style={[
                  styles.planePosition,
                  { left: '62%' },
                ]}
              >
                <View style={styles.planePinGlow} />
                <View style={styles.planePin}>
                  <Text style={styles.planePinEmoji}>👩🏾</Text>
                </View>
              </Animated.View>
            </View>
            
            {/* Bottom overlay card */}
            <View style={styles.mapOverlayCard}>
              <View style={styles.overlayRow}>
                <Text style={styles.overlayName}>{travel?.user_name || 'Sara'}</Text>
                <Text style={styles.overlayAlt}>· {travel?.altitude_ft?.toLocaleString() || '35,000'}ft</Text>
                <Text style={styles.overlayStatus}>· ✈️ In flight</Text>
              </View>
              <Text style={styles.overlayFlight}>Flight {travel?.flight_number || 'BA75'} · {travel?.origin_code || 'LHR'} → {travel?.destination_code || 'LOS'}</Text>
              <Text style={styles.overlayTime}>London 20:16 BST · Lagos 21:16 WAT</Text>
              <View style={styles.onTimeBadgeSmall}>
                <Text style={styles.onTimeTextSmall}>On time</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Page 3: My Travel Profile */}
        <View key="3" style={styles.page}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Travel Profile</Text>
              <Text style={styles.headerSubtitle}>Set up your travel details so your circle always knows your plans</Text>
            </View>
            
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileEmoji}>👩🏾</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>You</Text>
                  <Text style={styles.profileCity}>London, UK</Text>
                </View>
              </View>
            </View>
            
            {/* Settings */}
            <Text style={styles.sectionTitle}>Default Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Auto-activate Travel Mode when boarding</Text>
                <Switch
                  value={true}
                  trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }}
                  thumbColor={COLORS.white}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Send landing notification automatically</Text>
                <Switch
                  value={true}
                  trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }}
                  thumbColor={COLORS.white}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Share flight number with circle</Text>
                <Switch
                  value={true}
                  trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }}
                  thumbColor={COLORS.white}
                />
              </View>
            </View>
            
            {/* Emergency contacts */}
            <Text style={styles.sectionTitle}>Emergency Contacts for Travel</Text>
            <View style={styles.contactsRow}>
              <View style={styles.contactChip}>
                <Text style={styles.contactEmoji}>👩🏾</Text>
                <Text style={styles.contactName}>Mum ✓</Text>
              </View>
              <View style={styles.contactChip}>
                <Text style={styles.contactEmoji}>👨🏾</Text>
                <Text style={styles.contactName}>Dad ✓</Text>
              </View>
              <View style={styles.contactChip}>
                <Text style={styles.contactEmoji}>🧑🏾</Text>
                <Text style={styles.contactName}>Jamie ✓</Text>
              </View>
            </View>
            
            {/* Past journeys */}
            <Text style={styles.sectionTitle}>Past Journeys</Text>
            <View style={styles.journeyCard}>
              <Text style={styles.journeyDest}>📍 Lagos</Text>
              <Text style={styles.journeyInfo}>3 weeks ago · 6h 25m</Text>
            </View>
            <View style={styles.journeyCard}>
              <Text style={styles.journeyDest}>📍 New York</Text>
              <Text style={styles.journeyInfo}>2 months ago · 7h 10m</Text>
            </View>
            
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Travel Profile 🌿</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </CrossPlatformPager>
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.paginationDot, pageIndex === i && styles.paginationDotActive]}
          />
        ))}
      </View>
      
      {/* Landing Celebration Modal */}
      <Modal visible={showLandingCelebration} animationType="fade" transparent statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.celebrationOverlay}>
          <Text style={styles.celebrationEmoji}>🌍</Text>
          <Text style={styles.celebrationTitle}>{travel?.user_name || 'Sara'} has landed safely in Lagos!</Text>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Send a welcome message 💬</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
  },
  headerSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  flightCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 3,
    borderTopColor: COLORS.sageGreen,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  travellerName: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 16,
  },
  flightNumber: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
  },
  liveBadge: {
    backgroundColor: COLORS.navyBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  liveBadgeText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  routePoint: {
    alignItems: 'center',
    width: 80,
  },
  airportCode: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 20,
  },
  airportName: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  routeLine: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 2,
    position: 'relative',
    marginHorizontal: SPACING.sm,
  },
  routeProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.navyBlue,
    borderRadius: 2,
  },
  planeEmoji: {
    position: 'absolute',
    top: -12,
    fontSize: 20,
    marginLeft: -10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundDark,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 18,
  },
  statLabel: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
  },
  onTimeBadge: {
    backgroundColor: 'rgba(122, 158, 135, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  onTimeText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 14,
  },
  timesText: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  timezoneText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  reactionBtn: {
    alignItems: 'center',
  },
  reactionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  reactionText: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 11,
  },
  simulateButton: {
    backgroundColor: COLORS.navyBlue,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
  },
  simulateButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 18,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  nightSkyContainer: {
    flex: 1,
    position: 'relative',
  },
  nightSky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#0A1628',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.white,
  },
  ocean: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#0D2340',
  },
  landmass: {
    position: 'absolute',
    width: 60,
    height: 80,
    backgroundColor: '#1A2E1E',
    borderRadius: 30,
  },
  flightArc: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    height: 100,
  },
  flightArcDashed: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.whiteTransparent,
  },
  flightArcComplete: {
    position: 'absolute',
    top: 50,
    left: 0,
    height: 3,
    backgroundColor: COLORS.sageGreen,
    borderRadius: 2,
  },
  originDot: {
    position: 'absolute',
    left: 0,
    top: 40,
  },
  destDot: {
    position: 'absolute',
    right: 0,
    top: 40,
  },
  locationLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 12,
  },
  planePosition: {
    position: 'absolute',
    top: 30,
    alignItems: 'center',
  },
  planePinGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.navyBlue,
    opacity: 0.5,
  },
  planePin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navyBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planePinEmoji: {
    fontSize: 18,
  },
  mapOverlayCard: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(61, 46, 34, 0.95)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayName: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 16,
  },
  overlayAlt: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginLeft: 4,
  },
  overlayStatus: {
    fontFamily: FONTS.body,
    color: COLORS.navyBlue,
    fontSize: 14,
    marginLeft: 4,
  },
  overlayFlight: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 13,
    marginTop: 4,
  },
  overlayTime: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  onTimeBadgeSmall: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  onTimeTextSmall: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 11,
  },
  profileCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    marginLeft: SPACING.md,
  },
  profileName: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 18,
  },
  profileCity: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  settingsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  settingLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 14,
    marginRight: SPACING.md,
  },
  contactsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  contactEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  contactName: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 13,
  },
  journeyCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  journeyDest: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 16,
  },
  journeyInfo: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: COLORS.sageGreen,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.sageGreen,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  celebrationTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 24,
    textAlign: 'center',
  },
  messageButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.lg,
  },
  messageButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.sageGreen,
    fontSize: 14,
  },
});