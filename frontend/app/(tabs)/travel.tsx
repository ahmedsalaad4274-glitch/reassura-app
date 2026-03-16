import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, Switch, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CrossPlatformPager } from '../../src/components/CrossPlatformPager';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../src/store/appStore';
import { travelApi, userApi } from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeToggle } from '../../src/components/ThemeToggle';

const { width, height } = Dimensions.get('window');

export default function TravelScreen() {
  const { theme, isDark } = useTheme();
  const [pageIndex, setPageIndex] = useState(0);
  const [showLandingCelebration, setShowLandingCelebration] = useState(false);
  const { activeTravel, setActiveTravel, setUsers, users } = useAppStore();
  const planeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(planeAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    try {
      const [travelRes, usersRes] = await Promise.all([travelApi.getActive(), userApi.getAll()]);
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
        setTimeout(() => { setShowLandingCelebration(false); loadData(); }, 5000);
      } catch (error) { console.error('Error marking landed:', error); }
    }
  };

  const travel = activeTravel[0];

  const starsData = React.useMemo(() =>
    [...Array(40)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 55,
      opacity: 0.4 + Math.random() * 0.5,
      size: 1 + Math.random() * 2,
    })), []
  );

  const cityLights = [
    { bottom: 88, left: 30, size: 4, color: 'rgba(201,168,76,0.6)', glow: 'rgba(201,168,76,0.4)' },
    { bottom: 72, left: 46, size: 3, color: 'rgba(201,168,76,0.4)', glow: undefined },
    { bottom: 95, left: 22, size: 2, color: 'rgba(201,168,76,0.3)', glow: undefined },
    { bottom: 78, right: 38, size: 5, color: 'rgba(201,168,76,0.5)', glow: 'rgba(201,168,76,0.3)' },
    { bottom: 62, right: 58, size: 3, color: 'rgba(201,168,76,0.35)', glow: undefined },
    { bottom: 88, right: 50, size: 2, color: 'rgba(201,168,76,0.3)', glow: undefined },
  ];

  const renderEmptyState = () => (
    <View style={s.emptyState} data-testid="travel-empty-state">
      <LinearGradient colors={['#141824', '#0F1420']} style={s.emptyIcon}>
        <Text style={{ fontSize: 36 }}>{'\u2708\uFE0F'}</Text>
      </LinearGradient>
      <Text style={s.emptyTitle}>No journeys yet</Text>
      <Text style={s.emptySubtitle}>
        When you or your circle travel, their journey appears here as a live boarding pass.
      </Text>
      <TouchableOpacity style={s.addJourneyBtn} data-testid="add-journey-button">
        <Text style={s.addJourneyText}>+ Add journey</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBoardingPass = () => (
    <View data-testid="boarding-pass-card">
      <LinearGradient
        colors={['#141824', '#0F1420']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.bpCard}
      >
        {/* Top section */}
        <View style={s.bpTop}>
          <View style={s.bpHeaderRow}>
            <Text style={s.bpLabel}>BOARDING PASS</Text>
            <View style={s.bpOnTimeBadge}>
              <Text style={s.bpOnTimeText}>On time {'\u2713'}</Text>
            </View>
          </View>

          <View style={s.bpAvatarRow}>
            <LinearGradient colors={['#4A6AAA', '#2A3D70']} style={s.bpAvatar}>
              <Text style={{ fontSize: 20 }}>{travel?.user_emoji || '\u{1F469}\u{1F3FE}'}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={s.bpName}>{travel?.user_name || 'Sara'}</Text>
              <Text style={s.bpFlightInfo}>Flight {travel?.flight_number || 'BA75'} {'\u00B7'} Economy</Text>
            </View>
          </View>

          <View style={s.bpRouteRow}>
            <View style={s.bpRouteEnd}>
              <Text style={s.bpCode}>{travel?.origin_code || 'LHR'}</Text>
              <Text style={s.bpCity}>{travel?.origin_name || 'London'}</Text>
              <Text style={s.bpTime}>{travel?.departure_time?.split(' ')[0] || '14:30'}</Text>
            </View>
            <View style={s.bpRouteCenter}>
              <Text style={s.bpDuration}>4h 25m</Text>
              <View style={s.bpRouteLine}>
                <View style={s.bpRouteTrack} />
                <Text style={s.bpRoutePlane}>{'\u2708\uFE0F'}</Text>
              </View>
              <Text style={s.bpAltitude}>{'\u25CF'} In flight {'\u00B7'} 35,000ft</Text>
            </View>
            <View style={[s.bpRouteEnd, { alignItems: 'flex-end' }]}>
              <Text style={s.bpCode}>{travel?.destination_code || 'LOS'}</Text>
              <Text style={s.bpCity}>{travel?.destination_name || 'Lagos'}</Text>
              <Text style={s.bpTime}>{travel?.arrival_time?.split(' ')[0] || '18:55'}</Text>
            </View>
          </View>
        </View>

        {/* Torn edge divider */}
        <View style={s.bpTornEdge}>
          <View style={s.bpNotch} />
          <View style={s.bpDashedLine} />
          <View style={s.bpNotch} />
        </View>

        {/* Bottom section */}
        <View style={s.bpBottom}>
          <View style={s.bpInfoCol}>
            <Text style={s.bpInfoLabel}>SEAT</Text>
            <Text style={s.bpInfoValue}>14A</Text>
          </View>
          <View style={s.bpInfoCol}>
            <Text style={s.bpInfoLabel}>GATE</Text>
            <Text style={s.bpInfoValue}>B22</Text>
          </View>
          <View style={s.bpInfoCol}>
            <Text style={s.bpInfoLabel}>CLASS</Text>
            <Text style={s.bpInfoValue}>Econ</Text>
          </View>
          <View style={[s.bpInfoCol, { alignItems: 'flex-end' }]}>
            <Text style={s.bpInfoLabel}>NOTIFIED</Text>
            <Text style={[s.bpInfoValue, { color: COLORS.sageGreen }]}>Mum, Dad</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Circle tracking section */}
      <View style={s.bpTracking}>
        <Text style={s.bpTrackingLabel}>CIRCLE TRACKING YOUR FLIGHT</Text>
        <View style={s.bpTrackingRow}>
          {[
            { emoji: '\u{1F469}\u{1F3FE}', name: 'Mum' },
            { emoji: '\u{1F468}\u{1F3FE}', name: 'Dad' },
            { emoji: '\u{1F9D1}\u{1F3FE}', name: 'Jamie' },
          ].map((m, i) => (
            <View key={i} style={s.bpTrackingCard}>
              <View style={s.bpTrackingAvatar}>
                <Text style={{ fontSize: 14 }}>{m.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.bpTrackingName}>{m.name}</Text>
                <Text style={s.bpTrackingStatus}>Watching</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={s.simulateButton} onPress={handleSimulateLanding} data-testid="simulate-landing-button">
        <Text style={s.simulateButtonText}>Simulate Landing</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <CrossPlatformPager style={s.pager} initialPage={0} onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}>
        {/* Page 1: Live Flight / Empty */}
        <View key="1" style={s.page}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.pageContent}>
            <View style={s.header}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Travel</Text>
                <ThemeToggle />
              </View>
              <Text style={[s.headerSubtitle, { color: theme.muted }]}>Your circle, wherever they are {'\u{1F30D}'}</Text>
            </View>
            {travel ? renderBoardingPass() : renderEmptyState()}
          </ScrollView>
        </View>

        {/* Page 2: Flight Path — Night Sky */}
        <View key="2" style={s.page}>
          <View style={s.nightContainer}>
            <LinearGradient
              colors={['#05081A', '#080D20', '#0A1018', '#0D1A12']}
              locations={[0, 0.4, 0.7, 1.0]}
              style={StyleSheet.absoluteFill}
            />

            {/* Stars with opacity and size variation */}
            {starsData.map((star, i) => (
              <View key={i} style={{
                position: 'absolute',
                left: `${star.left}%` as any,
                top: `${star.top}%` as any,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                backgroundColor: COLORS.white,
                opacity: star.opacity,
              }} />
            ))}

            {/* Flight arc */}
            <View style={s.flightArc}>
              <View style={s.flightArcDashed} />
              <View style={[s.flightArcComplete, { width: '62%' }]} />

              <View style={s.originDot}>
                <Text style={s.locationLabel}>{'\u{1F3E0}'} London</Text>
              </View>
              <View style={s.destDot}>
                <Text style={s.locationLabel}>{'\u{1F4CD}'} Lagos</Text>
              </View>

              {/* Polished avatar pin */}
              <Animated.View style={[s.planePosition, { left: '62%' }]}>
                <View style={s.planePinGlow} />
                <View style={s.planePin}>
                  <Text style={s.planePinEmoji}>{'\u{1F469}\u{1F3FE}'}</Text>
                </View>
                <View style={s.planePinCard}>
                  <Text style={s.planePinName}>{travel?.user_name || 'Sara'} {'\u00B7'} {travel?.flight_number || 'BA75'}</Text>
                  <Text style={s.planePinAlt}>35,000ft {'\u00B7'} On time</Text>
                </View>
              </Animated.View>
            </View>

            {/* Earth curve */}
            <View style={s.earthCurve}>
              <LinearGradient colors={['#0A1A0E', '#0D2010', '#081408']} style={s.earthCurveInner} />
            </View>

            {/* City lights on earth surface */}
            {cityLights.map((light, i) => (
              <View key={`light-${i}`} style={[s.cityLight, {
                bottom: light.bottom,
                ...(light.left !== undefined ? { left: light.left } : {}),
                ...(light.right !== undefined ? { right: light.right } : {}),
                width: light.size,
                height: light.size,
                borderRadius: light.size / 2,
                backgroundColor: light.color,
                shadowColor: light.glow || light.color,
                shadowOpacity: light.glow ? 0.8 : 0,
                shadowRadius: light.size * 2,
              }]} />
            ))}

            {/* Bottom overlay card */}
            <View style={s.mapOverlayCard}>
              <View style={s.overlayRow}>
                <Text style={s.overlayName}>{travel?.user_name || 'Sara'}</Text>
                <Text style={s.overlayAlt}> {'\u00B7'} {travel?.altitude_ft?.toLocaleString() || '35,000'}ft</Text>
                <Text style={s.overlayStatus}> {'\u00B7'} {'\u2708\uFE0F'} In flight</Text>
              </View>
              <Text style={s.overlayFlight}>Flight {travel?.flight_number || 'BA75'} {'\u00B7'} {travel?.origin_code || 'LHR'} {'\u2192'} {travel?.destination_code || 'LOS'}</Text>
              <Text style={s.overlayTime}>London 20:16 BST {'\u00B7'} Lagos 21:16 WAT</Text>
              <View style={s.onTimeBadgeSmall}>
                <Text style={s.onTimeTextSmall}>On time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Page 3: My Travel Profile */}
        <View key="3" style={s.page}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.pageContent}>
            <View style={s.header}>
              <Text style={s.headerTitle}>My Travel Profile</Text>
              <Text style={s.headerSubtitle}>Set up your travel details so your circle always knows your plans</Text>
            </View>

            <View style={s.profileCard}>
              <View style={s.profileRow}>
                <View style={s.profileAvatar}>
                  <Text style={s.profileEmoji}>{'\u{1F469}\u{1F3FE}'}</Text>
                </View>
                <View style={s.profileInfo}>
                  <Text style={s.profileName}>You</Text>
                  <Text style={s.profileCity}>London, UK</Text>
                </View>
              </View>
            </View>

            <Text style={s.sectionTitle}>Default Settings</Text>
            <View style={s.settingsCard}>
              {['Auto-activate Travel Mode when boarding', 'Send landing notification automatically', 'Share flight number with circle'].map((label, i) => (
                <View key={i} style={s.settingRow}>
                  <Text style={s.settingLabel}>{label}</Text>
                  <Switch value={true} trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }} thumbColor={COLORS.white} />
                </View>
              ))}
            </View>

            <Text style={s.sectionTitle}>Emergency Contacts for Travel</Text>
            <View style={s.contactsRow}>
              {[{ e: '\u{1F469}\u{1F3FE}', n: 'Mum' }, { e: '\u{1F468}\u{1F3FE}', n: 'Dad' }, { e: '\u{1F9D1}\u{1F3FE}', n: 'Jamie' }].map((c, i) => (
                <View key={i} style={s.contactChip}>
                  <Text style={s.contactEmoji}>{c.e}</Text>
                  <Text style={s.contactName}>{c.n} {'\u2713'}</Text>
                </View>
              ))}
            </View>

            <Text style={s.sectionTitle}>Past Journeys</Text>
            {[{ d: '\u{1F4CD} Lagos', i: '3 weeks ago \u00B7 6h 25m' }, { d: '\u{1F4CD} New York', i: '2 months ago \u00B7 7h 10m' }].map((j, idx) => (
              <View key={idx} style={s.journeyCard}>
                <Text style={s.journeyDest}>{j.d}</Text>
                <Text style={s.journeyInfo}>{j.i}</Text>
              </View>
            ))}

            <TouchableOpacity style={s.saveButton}>
              <Text style={s.saveButtonText}>Save Travel Profile {'\u{1F33F}'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </CrossPlatformPager>

      <View style={s.pagination}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[s.paginationDot, pageIndex === i && s.paginationDotActive]} />
        ))}
      </View>

      <Modal visible={showLandingCelebration} animationType="fade" transparent statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={s.celebrationOverlay}>
          <Text style={s.celebrationEmoji}>{'\u{1F30D}'}</Text>
          <Text style={s.celebrationTitle}>{travel?.user_name || 'Sara'} has landed safely in Lagos!</Text>
          <TouchableOpacity style={s.messageButton}>
            <Text style={s.messageButtonText}>Send a welcome message {'\u{1F4AC}'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  pager: { flex: 1 },
  page: { flex: 1 },
  pageContent: { paddingBottom: 100 },
  header: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.lg },
  headerTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 28 },
  headerSubtitle: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 14, marginTop: SPACING.xs },

  // Empty state (Change 3)
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, gap: 16, paddingTop: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(74,106,170,0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 10,
  },
  emptyTitle: { fontFamily: FONTS.headingBold, fontSize: 20, color: COLORS.white },
  emptySubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 21 },
  addJourneyBtn: {
    backgroundColor: 'rgba(74,106,170,0.1)', borderColor: 'rgba(74,106,170,0.3)', borderWidth: 1.5,
    borderRadius: 100, paddingVertical: 12, paddingHorizontal: 24,
  },
  addJourneyText: { fontSize: 13, color: '#8AAAE0', fontWeight: '600' },

  // Boarding pass card (Change 3)
  bpCard: {
    marginHorizontal: 18, borderColor: 'rgba(74,106,170,0.3)', borderWidth: 1.5, borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12,
  },
  bpTop: { padding: 16, paddingHorizontal: 18 },
  bpHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  bpLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: 0.5 },
  bpOnTimeBadge: { backgroundColor: 'rgba(74,106,170,0.2)', borderWidth: 1, borderColor: 'rgba(74,106,170,0.4)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  bpOnTimeText: { fontSize: 9, color: '#8AAAE0', fontWeight: '600' },
  bpAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  bpAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  bpName: { fontFamily: FONTS.headingBold, fontSize: 14, color: COLORS.white },
  bpFlightInfo: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  bpRouteRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  bpRouteEnd: { width: 70 },
  bpCode: { fontFamily: FONTS.headingBold, fontSize: 26, color: COLORS.white },
  bpCity: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  bpTime: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  bpRouteCenter: { flex: 1, alignItems: 'center', paddingTop: 4 },
  bpDuration: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  bpRouteLine: { width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1, position: 'relative', justifyContent: 'center' },
  bpRouteTrack: { position: 'absolute', left: 0, width: '62%', height: 2, backgroundColor: '#4A6AAA', borderRadius: 1 },
  bpRoutePlane: { position: 'absolute', left: '55%', top: -10, fontSize: 16 },
  bpAltitude: { fontSize: 9, color: 'rgba(74,106,170,0.8)', marginTop: 6 },

  // Torn edge
  bpTornEdge: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -1 },
  bpNotch: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.backgroundDark },
  bpDashedLine: { flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.08)' },

  // Bottom section
  bpBottom: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 18, paddingBottom: 16 },
  bpInfoCol: { flex: 1 },
  bpInfoLabel: { fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5, marginBottom: 3 },
  bpInfoValue: { fontSize: 14, color: COLORS.white, fontWeight: '700' },

  // Circle tracking
  bpTracking: { marginHorizontal: 18, marginTop: 16 },
  bpTrackingLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 8 },
  bpTrackingRow: { flexDirection: 'row', gap: 8 },
  bpTrackingCard: {
    flex: 1, backgroundColor: 'rgba(122,158,135,0.07)', borderWidth: 1, borderColor: 'rgba(122,158,135,0.18)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 7,
  },
  bpTrackingAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(122,158,135,0.15)', alignItems: 'center', justifyContent: 'center' },
  bpTrackingName: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  bpTrackingStatus: { fontSize: 9, color: 'rgba(255,255,255,0.35)' },

  simulateButton: { backgroundColor: COLORS.navyBlue, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginTop: SPACING.lg, marginHorizontal: 18 },
  simulateButtonText: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 14, textAlign: 'center' },

  // Night sky (Change 4)
  nightContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  flightArc: { position: 'absolute', top: '30%', left: '10%', right: '10%', height: 100 },
  flightArcDashed: { position: 'absolute', top: 50, left: 0, right: 0, height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.whiteTransparent },
  flightArcComplete: { position: 'absolute', top: 50, left: 0, height: 3, backgroundColor: COLORS.sageGreen, borderRadius: 2 },
  originDot: { position: 'absolute', left: 0, top: 40 },
  destDot: { position: 'absolute', right: 0, top: 40 },
  locationLabel: { fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 12 },
  planePosition: { position: 'absolute', top: 20, alignItems: 'center' },
  planePinGlow: {
    position: 'absolute', width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(74,106,170,0.15)', top: -10, left: -10,
    shadowColor: 'rgba(74,106,170,0.5)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20,
  },
  planePin: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(20,28,50,0.95)', borderWidth: 2, borderColor: '#4A6AAA',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(74,106,170,0.5)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 20, elevation: 10,
  },
  planePinEmoji: { fontSize: 18 },
  planePinCard: {
    backgroundColor: 'rgba(14,18,36,0.95)', borderWidth: 1, borderColor: 'rgba(74,106,170,0.4)',
    borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginTop: 4, alignItems: 'center',
  },
  planePinName: { fontSize: 9, color: COLORS.white, fontWeight: '700' },
  planePinAlt: { fontSize: 8, color: '#8AAAE0' },

  // Earth curve
  earthCurve: {
    position: 'absolute', bottom: -40, left: -20, right: -20, height: 180,
    borderRadius: 200, overflow: 'hidden',
    borderTopWidth: 1, borderTopColor: 'rgba(122,158,135,0.2)',
    shadowColor: 'rgba(122,158,135,0.08)', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 1, shadowRadius: 10,
    zIndex: 1,
  },
  earthCurveInner: { flex: 1, borderRadius: 200 },

  // City lights
  cityLight: {
    position: 'absolute', zIndex: 2,
    shadowOffset: { width: 0, height: 0 },
  },

  // Overlay card
  mapOverlayCard: {
    position: 'absolute', bottom: 100, left: SPACING.md, right: SPACING.md,
    backgroundColor: 'rgba(61,46,34,0.95)', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
  },
  overlayRow: { flexDirection: 'row', alignItems: 'center' },
  overlayName: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 16 },
  overlayAlt: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 14 },
  overlayStatus: { fontFamily: FONTS.body, color: COLORS.navyBlue, fontSize: 14 },
  overlayFlight: { fontFamily: FONTS.body, color: COLORS.cream, fontSize: 13, marginTop: 4 },
  overlayTime: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 12, marginTop: 2 },
  onTimeBadgeSmall: { position: 'absolute', top: SPACING.md, right: SPACING.md, backgroundColor: COLORS.sageGreen, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  onTimeTextSmall: { fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 11 },

  // Profile page (unchanged)
  profileCard: { backgroundColor: COLORS.backgroundCard, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginHorizontal: SPACING.md },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.backgroundDark, justifyContent: 'center', alignItems: 'center' },
  profileEmoji: { fontSize: 32 },
  profileInfo: { marginLeft: SPACING.md },
  profileName: { fontFamily: FONTS.bodyBold, color: COLORS.white, fontSize: 18 },
  profileCity: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 14 },
  sectionTitle: { fontFamily: FONTS.bodyMedium, color: COLORS.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  settingsCard: { backgroundColor: COLORS.backgroundCard, borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING.md, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundDark },
  settingLabel: { flex: 1, fontFamily: FONTS.body, color: COLORS.white, fontSize: 14, marginRight: SPACING.md },
  contactsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md },
  contactChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, marginRight: SPACING.sm },
  contactEmoji: { fontSize: 18, marginRight: SPACING.xs },
  contactName: { fontFamily: FONTS.bodyMedium, color: COLORS.sageGreen, fontSize: 13 },
  journeyCard: { backgroundColor: COLORS.backgroundCard, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  journeyDest: { fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 16 },
  journeyInfo: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 13, marginTop: 2 },
  saveButton: { backgroundColor: COLORS.sageGreen, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginHorizontal: SPACING.md, marginTop: SPACING.lg },
  saveButtonText: { fontFamily: FONTS.bodyBold, color: COLORS.backgroundDark, fontSize: 16, textAlign: 'center' },

  // Pagination
  pagination: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 90, left: 0, right: 0 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  paginationDotActive: { backgroundColor: COLORS.sageGreen },

  // Celebration
  celebrationOverlay: { flex: 1, backgroundColor: COLORS.sageGreen, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.lg },
  celebrationEmoji: { fontSize: 64, marginBottom: SPACING.md },
  celebrationTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 24, textAlign: 'center' },
  messageButton: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.lg },
  messageButtonText: { fontFamily: FONTS.bodyBold, color: COLORS.sageGreen, fontSize: 14 },
});
