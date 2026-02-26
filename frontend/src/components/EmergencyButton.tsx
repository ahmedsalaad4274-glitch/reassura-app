import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { emergencyApi } from '../services/api';

export const EmergencyButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [alertSent, setAlertSent] = React.useState(false);
  const glowAnim = React.useRef(new Animated.Value(0.5)).current;
  
  const currentUser = useAppStore((state) => state.currentUser);
  const circles = useAppStore((state) => state.circles);
  const users = useAppStore((state) => state.users);
  
  React.useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);
  
  const getUsersToNotify = () => {
    if (!currentUser) return [];
    const userCircles = circles.filter(c => currentUser.circle_ids.includes(c.id));
    const memberIds = new Set<string>();
    userCircles.forEach(c => {
      c.member_ids.forEach(id => {
        if (id !== currentUser.id) memberIds.add(id);
      });
    });
    return users.filter(u => memberIds.has(u.id));
  };
  
  const handleSendAlert = async () => {
    if (!currentUser) return;
    
    try {
      await emergencyApi.send({
        user_id: currentUser.id,
        circle_ids: currentUser.circle_ids,
      });
      setShowConfirm(false);
      setAlertSent(true);
      
      setTimeout(() => {
        setAlertSent(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
    }
  };
  
  const usersToNotify = getUsersToNotify();
  
  return (
    <>
      <Animated.View
        style={[
          styles.glowContainer,
          { opacity: glowAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowConfirm(true)}
        >
          <Text style={styles.buttonText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmSheet}>
            <Text style={styles.confirmTitle}>Send Emergency Alert? 🚨</Text>
            <Text style={styles.confirmSubtitle}>
              This will immediately notify:
            </Text>
            
            <View style={styles.notifyList}>
              {usersToNotify.map(user => (
                <View key={user.id} style={styles.notifyItem}>
                  <Text style={styles.notifyEmoji}>{user.emoji}</Text>
                  <Text style={styles.notifyName}>{user.name}</Text>
                </View>
              ))}
            </View>
            
            <Text style={styles.freeNote}>
              🌿 Emergency alerts are always free on every plan
            </Text>
            
            <TouchableOpacity style={styles.confirmButton} onPress={handleSendAlert}>
              <Text style={styles.confirmButtonText}>Send Alert 🚨</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Alert Sent Overlay */}
      <Modal visible={alertSent} transparent animationType="fade">
        <View style={styles.alertSentOverlay}>
          <Text style={styles.alertSentEmoji}>🚨</Text>
          <Text style={styles.alertSentTitle}>Alert Sent</Text>
          <Text style={styles.alertSentSubtitle}>
            {usersToNotify.length} people have been notified
          </Text>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    shadowColor: COLORS.terracotta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  confirmSheet: {
    backgroundColor: COLORS.backgroundCard,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  confirmTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.terracotta,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  confirmSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  notifyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  notifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    margin: SPACING.xs,
  },
  notifyEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  notifyName: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
  },
  freeNote: {
    fontFamily: FONTS.body,
    color: COLORS.sageGreen,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  confirmButton: {
    backgroundColor: COLORS.terracotta,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  confirmButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: SPACING.md,
  },
  cancelButtonText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  alertSentOverlay: {
    flex: 1,
    backgroundColor: COLORS.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertSentEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  alertSentTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  alertSentSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 16,
  },
});