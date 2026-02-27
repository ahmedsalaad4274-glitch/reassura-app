import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Image,
  Dimensions,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.82;

interface NavItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onPress, isActive }) => (
  <TouchableOpacity style={[styles.navItem, isActive && styles.navItemActive]} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={isActive ? COLORS.sageGreen : COLORS.white} />
    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

interface SettingsItemProps {
  emoji: string;
  label: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  iconBg?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ emoji, label, onPress, toggle, toggleValue, onToggle, iconBg }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} disabled={toggle}>
    <View style={[styles.settingsIconContainer, { backgroundColor: `${iconBg || COLORS.muted}22` }]}>
      <Text style={styles.settingsEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.settingsLabel}>{label}</Text>
    {toggle && (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }}
        thumbColor={COLORS.white}
        style={{ marginLeft: 'auto' }}
      />
    )}
    {!toggle && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} style={{ marginLeft: 'auto' }} />}
  </TouchableOpacity>
);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const EnhancedSidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { currentUser } = useAppStore();
  const { userPhoto, userEmoji, userName, setDemoMode, savedPlaces } = useAuthStore();
  const [ghostMode, setGhostMode] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState('/');
  
  // Get Started checklist
  const hasProfilePhoto = !!userPhoto;
  const hasHomeLocation = savedPlaces.some(p => p.type === 'home');
  const hasCreatedCircle = true; // Default circles exist
  const hasInvitedSomeone = false;
  const hasUpdatedStatus = !!currentUser?.status_message;
  
  const checklistItems = [
    { label: 'Create your account', done: true, route: null },
    { label: 'Add your profile photo or emoji', done: hasProfilePhoto, route: '/profile' },
    { label: 'Set your home location', done: hasHomeLocation, route: '/map' },
    { label: 'Create your first circle', done: hasCreatedCircle, route: '/circles' },
    { label: 'Invite someone to your circle', done: hasInvitedSomeone, route: '/circles' },
    { label: 'Send your first status update', done: hasUpdatedStatus, route: '/update-status' },
  ];
  
  const completedCount = checklistItems.filter(i => i.done).length;
  const allComplete = completedCount === checklistItems.length;
  const progressPercent = (completedCount / checklistItems.length) * 100;
  
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
  
  const navigate = (path: string) => {
    setCurrentPath(path);
    onClose();
    setTimeout(() => router.push(path as any), 150);
  };
  
  const startDemo = () => {
    setDemoMode(true);
    onClose();
    router.push('/');
  };
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        </Animated.View>
        
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarRing}>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarEmoji}>{currentUser?.emoji || userEmoji}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.headerName}>{currentUser?.name || userName || 'You'}</Text>
              <Text style={styles.headerStatus}>
                {currentUser?.status_emoji || '\u{1F3E0}'} {currentUser?.status?.replace('_', ' ') || 'Home'}
              </Text>
            </View>
            
            {/* Get Started Card */}
            {!allComplete ? (
              <View style={styles.getStartedCard}>
                <Text style={styles.getStartedTitle}>Get Started</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressText}>{completedCount}/{checklistItems.length} complete</Text>
                {checklistItems.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.checklistItem}
                    onPress={() => item.route ? navigate(item.route) : null}
                    disabled={!item.route || item.done}
                  >
                    <View style={[styles.checkBox, item.done && styles.checkBoxDone]}>
                      {item.done && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                    <Text style={[styles.checklistLabel, item.done && styles.checklistLabelDone]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.welcomeCard}>
                <Ionicons name="leaf" size={20} color={COLORS.sageGreen} />
                <Text style={styles.welcomeText}>Welcome to Reassura</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            {/* Main Navigation */}
            <View style={styles.section}>
              <NavItem icon="home" label="Home" onPress={() => navigate('/')} isActive={currentPath === '/'} />
              <NavItem icon="people" label="My Circles" onPress={() => navigate('/circles')} />
              <NavItem icon="map" label="Map" onPress={() => navigate('/map')} />
              <NavItem icon="airplane" label="Travel" onPress={() => navigate('/travel')} />
              <NavItem icon="notifications" label="Notifications" onPress={() => navigate('/notifications')} />
              <NavItem icon="person" label="My Profile" onPress={() => navigate('/profile')} />
            </View>
            
            <View style={styles.divider} />
            
            {/* Settings */}
            <View style={styles.section}>
              <SettingsItem emoji="\u{1F47B}" label="Ghost Mode" toggle toggleValue={ghostMode} onToggle={setGhostMode} iconBg={COLORS.terracotta} />
              <SettingsItem emoji="\u{1F512}" label="Privacy Settings" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\u{1F6E1}\uFE0F" label="Security" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\u{1F33F}" label="The Reassura Promise" onPress={() => navigate('/pricing')} iconBg={COLORS.sageGreen} />
              <SettingsItem emoji="\u{1F4B3}" label="Subscription & Plan" onPress={() => navigate('/pricing')} iconBg={COLORS.gold} />
              <SettingsItem emoji="\u2699\uFE0F" label="App Settings" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\u{1F3AC}" label="Demo Mode" onPress={startDemo} iconBg={COLORS.navyBlue} />
            </View>
            
            <View style={styles.divider} />
            
            {/* Emergency */}
            <View style={styles.emergencySection}>
              <TouchableOpacity style={styles.emergencyButton}>
                <Ionicons name="warning" size={18} color={COLORS.terracotta} />
                <Text style={styles.emergencyText}>Emergency Alert</Text>
              </TouchableOpacity>
              <Text style={styles.emergencyNote}>Immediately notifies your entire circle</Text>
            </View>
            
            {/* Sign Out */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => {
                onClose();
                const { logout } = useAuthStore.getState();
                logout();
                router.replace('/onboarding');
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.muted} />
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
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: COLORS.backgroundCard,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarEmoji: {
    fontSize: 32,
  },
  headerName: {
    fontFamily: FONTS.heading,
    color: COLORS.white,
    fontSize: 18,
    marginTop: SPACING.sm,
  },
  headerStatus: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  // Get Started Card
  getStartedCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(122,158,135,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)',
  },
  getStartedTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.sageGreen,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.sageGreen,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: SPACING.sm,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxDone: {
    backgroundColor: COLORS.sageGreen,
    borderColor: COLORS.sageGreen,
  },
  checklistLabel: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.white,
    flex: 1,
  },
  checklistLabelDone: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  welcomeCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(122,158,135,0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)',
  },
  welcomeText: {
    fontFamily: FONTS.heading,
    color: COLORS.sageGreen,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  section: {
    paddingHorizontal: SPACING.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  navItemActive: {
    backgroundColor: 'rgba(122, 158, 135, 0.15)',
  },
  navLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 15,
  },
  navLabelActive: {
    color: COLORS.sageGreen,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    gap: SPACING.md,
  },
  settingsIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsEmoji: {
    fontSize: 16,
  },
  settingsLabel: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 14,
  },
  emergencySection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(196,105,79,0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(196,105,79,0.3)',
  },
  emergencyText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.terracotta,
    fontSize: 14,
  },
  emergencyNote: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  signOutText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  version: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    paddingBottom: SPACING.xxl,
    opacity: 0.5,
  },
});
