import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const MenuItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}> = ({ icon, label, onPress, color = COLORS.white }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={color} />
    <Text style={[styles.menuLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  
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
          duration: 200,
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
    onClose();
    setTimeout(() => router.push(path as any), 100);
  };
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim },
          ]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{currentUser?.emoji || '👤'}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerName}>{currentUser?.name || 'You'}</Text>
                <Text style={styles.headerStatus}>
                  {currentUser?.status_emoji} {currentUser?.status?.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            {/* Navigation */}
            <View style={styles.section}>
              <MenuItem icon="home" label="Home" onPress={() => navigate('/')} />
              <MenuItem icon="people" label="Circles" onPress={() => navigate('/circles')} />
              <MenuItem icon="map" label="Map" onPress={() => navigate('/map')} />
              <MenuItem icon="airplane" label="Travel" onPress={() => navigate('/travel')} />
              <MenuItem icon="notifications" label="Notifications" onPress={() => navigate('/notifications')} />
              <MenuItem icon="person" label="Profile" onPress={() => navigate('/profile')} />
            </View>
            
            {/* Settings */}
            <View style={styles.divider} />
            <View style={styles.section}>
              <MenuItem icon="eye-off" label="Privacy & Ghost Mode" onPress={() => navigate('/profile')} />
              <MenuItem icon="shield" label="Security" onPress={() => navigate('/profile')} />
              <MenuItem icon="leaf" label="Reassura Promise" onPress={() => navigate('/pricing')} color={COLORS.sageGreen} />
              <MenuItem icon="card" label="Plan" onPress={() => navigate('/pricing')} />
              <MenuItem icon="settings" label="Settings" onPress={() => navigate('/profile')} />
            </View>
            
            {/* Emergency */}
            <View style={styles.emergencySection}>
              <TouchableOpacity style={styles.emergencyButton}>
                <Ionicons name="warning" size={20} color={COLORS.white} />
                <Text style={styles.emergencyText}>Emergency Alert</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: COLORS.backgroundDark,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundCard,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  headerName: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 18,
  },
  headerStatus: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 13,
  },
  section: {
    paddingVertical: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  menuLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
  },
  emergencySection: {
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.terracotta,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  emergencyText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 15,
    marginLeft: SPACING.sm,
  },
});