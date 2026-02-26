import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

interface EnhancedSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  isActive?: boolean;
}> = ({ icon, label, onPress, isActive = false }) => (
  <TouchableOpacity
    style={[styles.navItem, isActive && styles.navItemActive]}
    onPress={onPress}
  >
    <View style={[styles.navIconContainer, isActive && styles.navIconContainerActive]}>
      <Ionicons name={icon as any} size={18} color={isActive ? COLORS.sageGreen : COLORS.white} />
    </View>
    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const SettingsItem: React.FC<{
  emoji: string;
  label: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  iconBg?: string;
}> = ({ emoji, label, onPress, toggle, toggleValue, onToggle, iconBg = COLORS.sageGreen }) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={toggle}
  >
    <View style={[styles.settingsIconContainer, { backgroundColor: `${iconBg}20` }]}>
      <Text style={styles.settingsEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.settingsLabel}>{label}</Text>
    {toggle && (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.muted, true: COLORS.sageGreen }}
        thumbColor={COLORS.white}
        style={styles.toggle}
      />
    )}
    {!toggle && (
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    )}
  </TouchableOpacity>
);

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { currentUser } = useAppStore();
  const { userPhoto, userEmoji, userName, setDemoMode } = useAuthStore();
  const [ghostMode, setGhostMode] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState('/');
  
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
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
                {currentUser?.status_emoji || '\ud83c\udfe0'} {currentUser?.status?.replace('_', ' ') || 'Home'} · just now
              </Text>
            </View>
            
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
              <SettingsItem
                emoji="\ud83d\udc7b"
                label="Ghost Mode"
                toggle
                toggleValue={ghostMode}
                onToggle={setGhostMode}
                iconBg={COLORS.terracotta}
              />
              <SettingsItem emoji="\ud83d\udd12" label="Privacy Settings" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\ud83d\udee1\ufe0f" label="Security" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\ud83c\udf3f" label="The Reassura Promise" onPress={() => navigate('/pricing')} iconBg={COLORS.sageGreen} />
              <SettingsItem emoji="\ud83d\udcb3" label="Subscription & Plan" onPress={() => navigate('/pricing')} iconBg={COLORS.gold} />
              <SettingsItem emoji="\u2699\ufe0f" label="App Settings" onPress={() => navigate('/profile')} />
              <SettingsItem emoji="\ud83c\udfac" label="Demo Mode" onPress={startDemo} iconBg={COLORS.navyBlue} />
            </View>
            
            <View style={styles.divider} />
            
            {/* Emergency Section */}
            <View style={styles.emergencySection}>
              <TouchableOpacity style={styles.emergencyButton}>
                <Text style={styles.emergencyIcon}>\ud83d\udea8</Text>
                <Text style={styles.emergencyText}>Emergency Alert</Text>
              </TouchableOpacity>
              <Text style={styles.emergencyNote}>Immediately notifies your entire circle</Text>
            </View>
            
            {/* Sign Out */}
            <View style={styles.signOutSection}>
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
            </View>
            
            {/* Version */}
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  headerName: {
    fontFamily: FONTS.heading,
    color: COLORS.white,
    fontSize: 20,
    marginTop: SPACING.md,
  },
  headerStatus: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  section: {
    paddingVertical: SPACING.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  navItemActive: {
    backgroundColor: 'rgba(122, 158, 135, 0.15)',
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(122, 158, 135, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconContainerActive: {
    backgroundColor: 'rgba(122, 158, 135, 0.3)',
  },
  navLabel: {
    fontFamily: FONTS.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginLeft: SPACING.md,
  },
  navLabelActive: {
    color: COLORS.sageGreen,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  settingsIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsEmoji: {
    fontSize: 14,
  },
  settingsLabel: {
    flex: 1,
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: SPACING.md,
  },
  toggle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  emergencySection: {
    padding: SPACING.lg,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.terracotta,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emergencyIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  emergencyText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 15,
  },
  emergencyNote: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  signOutSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  signOutText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginLeft: SPACING.sm,
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
