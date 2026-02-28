import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView, Image, Dimensions, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, GLASS_CARD } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.82;

const NavItem = ({ icon, label, onPress, isActive }: { icon: string; label: string; onPress: () => void; isActive?: boolean }) => (
  <TouchableOpacity style={[styles.navItem, isActive && styles.navItemActive]} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={isActive ? COLORS.sageGreen : COLORS.textBody} />
    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
    {isActive && <View style={styles.navActiveBar} />}
  </TouchableOpacity>
);

interface SidebarProps { visible: boolean; onClose: () => void; }

export const EnhancedSidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { currentUser } = useAppStore();
  const { userPhoto, userEmoji, userName, setDemoMode, savedPlaces } = useAuthStore();
  const [ghostMode, setGhostMode] = React.useState(false);

  const hasProfilePhoto = !!userPhoto;
  const hasHomeLocation = savedPlaces.some(p => p.type === 'home');
  const hasUpdatedStatus = !!currentUser?.status_message;
  const checklistItems = [
    { label: 'Create your account', done: true, route: null },
    { label: 'Add profile photo or emoji', done: hasProfilePhoto, route: '/profile' },
    { label: 'Set your home location', done: hasHomeLocation, route: '/map' },
    { label: 'Create your first circle', done: true, route: '/circles' },
    { label: 'Invite someone', done: false, route: '/circles' },
    { label: 'Send your first status', done: hasUpdatedStatus, route: '/update-status' },
  ];
  const completedCount = checklistItems.filter(i => i.done).length;
  const allComplete = completedCount === checklistItems.length;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const navigate = (path: string) => { onClose(); setTimeout(() => router.push(path as any), 150); };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
              <View style={styles.avatarRing}>
                {userPhoto ? <Image source={{ uri: userPhoto }} style={styles.avatarImg} /> : (
                  <View style={styles.avatarInner}><Text style={styles.avatarEmoji}>{currentUser?.emoji || userEmoji}</Text></View>
                )}
              </View>
              <Text style={styles.headerName}>{currentUser?.name || userName || 'Rinade'}</Text>
              <Text style={styles.headerStatus}>{currentUser?.status_emoji || '\u{1F3E0}'} {currentUser?.status?.replace('_', ' ') || 'Home'}</Text>
            </View>

            {!allComplete ? (
              <View style={styles.getStartedCard}>
                <Text style={styles.gsTitle}>Get Started</Text>
                <View style={styles.progressBg}><View style={[styles.progressFill, { width: `${(completedCount / 6) * 100}%` }]} /></View>
                <Text style={styles.progressLabel}>{completedCount}/6 complete</Text>
                {checklistItems.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.checkItem} onPress={() => item.route ? navigate(item.route) : null} disabled={!item.route || item.done}>
                    <View style={[styles.checkBox, item.done && styles.checkBoxDone]}>{item.done && <Ionicons name="checkmark" size={11} color={COLORS.white} />}</View>
                    <Text style={[styles.checkLabel, item.done && styles.checkLabelDone]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.welcomeCard}><Ionicons name="leaf" size={18} color={COLORS.sageGreen} /><Text style={styles.welcomeText}>Welcome to Reassura</Text></View>
            )}

            <View style={styles.divider} />

            {/* Safe Walk CTA */}
            <TouchableOpacity style={styles.safeWalkBtn} onPress={() => navigate('/safe-walk')}>
              <Text style={styles.swEmoji}>{'\u{1F6B6}'}</Text>
              <Text style={styles.swText}>Start Safe Walk</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.section}>
              <NavItem icon="home" label="Home" onPress={() => navigate('/')} isActive />
              <NavItem icon="people" label="My Circles" onPress={() => navigate('/circles')} />
              <NavItem icon="map" label="Map" onPress={() => navigate('/map')} />
              <NavItem icon="airplane" label="Travel" onPress={() => navigate('/travel')} />
              <NavItem icon="notifications" label="Notifications" onPress={() => navigate('/notifications')} />
              <NavItem icon="person" label="My Profile" onPress={() => navigate('/profile')} />
              <NavItem icon="play-circle" label="Get Started" onPress={() => {
                useOnboardingStore.getState().setComplete(false);
                onClose();
                setTimeout(() => router.replace('/onboarding/demo'), 150);
              }} />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingEmoji}>{'\u{1F47B}'}</Text>
                  <Text style={styles.settingLabel}>Ghost Mode</Text>
                </View>
                <Switch value={ghostMode} onValueChange={setGhostMode} trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.sageGreen }} thumbColor={COLORS.white} />
              </View>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigate('/profile')}>
                <View style={styles.settingLeft}><Text style={styles.settingEmoji}>{'\u{1F512}'}</Text><Text style={styles.settingLabel}>Privacy</Text></View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => navigate('/pricing')}>
                <View style={styles.settingLeft}><Text style={styles.settingEmoji}>{'\u{1F33F}'}</Text><Text style={styles.settingLabel}>The Reassura Promise</Text></View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem} onPress={() => { setDemoMode(true); onClose(); router.push('/'); }}>
                <View style={styles.settingLeft}><Text style={styles.settingEmoji}>{'\u{1F3AC}'}</Text><Text style={styles.settingLabel}>Demo Mode</Text></View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.signOutBtn} onPress={() => { onClose(); useAuthStore.getState().logout(); router.replace('/auth'); }}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.version}>Reassura v1.0.0</Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: { width: SIDEBAR_WIDTH, height: '100%', backgroundColor: 'rgba(26,22,18,0.97)', paddingTop: 60, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  header: { alignItems: 'center', paddingVertical: SPACING.lg, paddingHorizontal: SPACING.md },
  avatarRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: COLORS.sageGreen, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarEmoji: { fontSize: 30 },
  headerName: { fontFamily: FONTS.heading, color: COLORS.white, fontSize: 18, marginTop: SPACING.sm, letterSpacing: -0.3 },
  headerStatus: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 13 },
  getStartedCard: { marginHorizontal: SPACING.md, marginTop: SPACING.sm, ...GLASS_CARD, borderColor: 'rgba(122,158,135,0.2)', padding: SPACING.md },
  gsTitle: { fontFamily: FONTS.headingBold, color: COLORS.sageGreen, fontSize: 16, marginBottom: SPACING.sm, letterSpacing: -0.3 },
  progressBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 4, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: COLORS.sageGreen, borderRadius: 2 },
  progressLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.textMuted, marginBottom: SPACING.sm },
  checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: SPACING.sm },
  checkBox: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  checkBoxDone: { backgroundColor: COLORS.sageGreen, borderColor: COLORS.sageGreen },
  checkLabel: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textBody, flex: 1 },
  checkLabelDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  welcomeCard: { marginHorizontal: SPACING.md, marginTop: SPACING.sm, ...GLASS_CARD, borderColor: 'rgba(122,158,135,0.2)', padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  welcomeText: { fontFamily: FONTS.heading, color: COLORS.sageGreen, fontSize: 16, letterSpacing: -0.3 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: SPACING.md, marginVertical: SPACING.sm },
  safeWalkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.md, paddingVertical: SPACING.md, borderRadius: 30,
    borderWidth: 1, borderColor: COLORS.sageGreen, backgroundColor: 'transparent',
  },
  swEmoji: { fontSize: 18 },
  swText: { fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.sageGreen },
  section: { paddingHorizontal: SPACING.sm },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderRadius: 12, gap: SPACING.md, position: 'relative' },
  navItemActive: { backgroundColor: 'transparent' },
  navActiveBar: { position: 'absolute', left: 0, top: '25%', bottom: '25%', width: 3, backgroundColor: COLORS.sageGreen, borderRadius: 2 },
  navLabel: { fontFamily: FONTS.bodyMedium, color: COLORS.textBody, fontSize: 15 },
  navLabelActive: { color: COLORS.sageGreen },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: 10 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  settingEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  settingLabel: { fontFamily: FONTS.body, color: COLORS.textBody, fontSize: 14 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  signOutText: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 14 },
  version: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 10, textAlign: 'center', paddingBottom: SPACING.xxl, opacity: 0.4 },
});
