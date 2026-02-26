import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor } from '../constants/theme';
import { User } from '../store/appStore';
import { reactionApi, checkinApi } from '../services/api';
import { useAppStore } from '../store/appStore';

interface ProfilePopupProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ user, visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const currentUser = useAppStore((state) => state.currentUser);
  
  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);
  
  if (!user) return null;
  
  const statusColor = getStatusColor(user.status);
  
  const handleReaction = async (type: string) => {
    if (!currentUser) return;
    try {
      await reactionApi.create({
        from_user_id: currentUser.id,
        to_user_id: user.id,
        reaction_type: type,
      });
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };
  
  const handleCheckIn = async () => {
    if (!currentUser) return;
    try {
      await checkinApi.send(currentUser.id, user.id);
    } catch (error) {
      console.error('Error sending check-in:', error);
    }
  };
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarRing, { borderColor: statusColor }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>{user.emoji}</Text>
                </View>
              </View>
            </View>
            
            {/* Info */}
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.status}>
              {user.status_emoji} {user.status.replace('_', ' ')} · {formatTime(user.updated_at)}
            </Text>
            {user.status_message && (
              <Text style={styles.message}>"{user.status_message}"</Text>
            )}
            
            {/* Battery indicator */}
            {user.battery_level && user.battery_level < 30 && (
              <Text style={styles.battery}>
                🔋 Battery at {user.battery_level}%
              </Text>
            )}
            
            {/* Driving indicator */}
            {user.is_driving && (
              <View style={styles.drivingBadge}>
                <Text style={styles.drivingText}>
                  🚗 Driving {user.speed_mph ? `· ${user.speed_mph}mph` : ''}
                </Text>
              </View>
            )}
            
            {/* Privacy note */}
            <Text style={styles.privacyNote}>
              🌿 Status shared voluntarily · No precise GPS stored
            </Text>
            
            {/* Reactions */}
            <View style={styles.reactionsContainer}>
              <TouchableOpacity style={styles.reactionButton} onPress={() => handleReaction('heart')}>
                <Text style={styles.reactionEmoji}>❤️</Text>
                <Text style={styles.reactionText}>Glad you're safe</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.reactionButton} onPress={() => handleReaction('thumbs_up')}>
                <Text style={styles.reactionEmoji}>👍</Text>
                <Text style={styles.reactionText}>Got it</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.reactionButton} onPress={() => handleReaction('thinking')}>
                <Text style={styles.reactionEmoji}>🌿</Text>
                <Text style={styles.reactionText}>Thinking of you</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.reactionButton} onPress={handleCheckIn}>
                <Text style={styles.reactionEmoji}>👋</Text>
                <Text style={styles.reactionText}>Check in</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SPACING.sm,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  name: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 24,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  status: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageLight,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  message: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  battery: {
    fontFamily: FONTS.body,
    color: COLORS.gold,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  drivingBadge: {
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  drivingText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.gold,
    fontSize: 12,
  },
  privacyNote: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  reactionButton: {
    alignItems: 'center',
    flex: 1,
  },
  reactionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  reactionText: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 11,
    textAlign: 'center',
  },
});