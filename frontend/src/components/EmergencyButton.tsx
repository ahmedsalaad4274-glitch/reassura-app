import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';
import { emergencyApi } from '../services/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BTN_SIZE = 52;
const MIN_BOTTOM = 90; // Above tab bar
const STORAGE_KEY = 'reassura_sos_position';

export const EmergencyButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [alertSent, setAlertSent] = React.useState(false);
  const glowAnim = React.useRef(new Animated.Value(0.5)).current;
  const pan = React.useRef(new Animated.ValueXY({ x: SCREEN_W - BTN_SIZE - 20, y: SCREEN_H - MIN_BOTTOM - BTN_SIZE })).current;
  const posRef = React.useRef({ x: SCREEN_W - BTN_SIZE - 20, y: SCREEN_H - MIN_BOTTOM - BTN_SIZE });
  
  const currentUser = useAppStore((state) => state.currentUser);
  const circles = useAppStore((state) => state.circles);
  const users = useAppStore((state) => state.users);
  
  React.useEffect(() => {
    // Load saved position
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        const pos = JSON.parse(data);
        pan.setValue(pos);
        posRef.current = pos;
      }
    });
    
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);
  
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: posRef.current.x, y: posRef.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();
        // Clamp to screen bounds
        let finalX = posRef.current.x + gs.dx;
        let finalY = posRef.current.y + gs.dy;
        finalX = Math.max(0, Math.min(SCREEN_W - BTN_SIZE, finalX));
        finalY = Math.max(60, Math.min(SCREEN_H - MIN_BOTTOM - BTN_SIZE, finalY));
        
        posRef.current = { x: finalX, y: finalY };
        pan.setValue({ x: finalX, y: finalY });
        
        // Save position
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ x: finalX, y: finalY }));
        
        // If barely moved, treat as tap
        if (Math.abs(gs.dx) < 5 && Math.abs(gs.dy) < 5) {
          setShowConfirm(true);
        }
      },
    })
  ).current;
  
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
      setTimeout(() => setAlertSent(false), 3000);
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
    }
  };
  
  const usersToNotify = getUsersToNotify();
  
  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.glowContainer,
          {
            opacity: glowAnim,
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        <View style={styles.button}>
          <Text style={styles.buttonText}>SOS</Text>
        </View>
      </Animated.View>
      
      <Modal visible={showConfirm} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmSheet}>
            <Text style={styles.confirmTitle}>Send Emergency Alert?</Text>
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
              Emergency alerts are always free on every plan
            </Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleSendAlert}>
              <Text style={styles.confirmButtonText}>Send Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal visible={alertSent} transparent animationType="fade">
        <View style={styles.alertSentOverlay}>
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
    top: 0,
    left: 0,
    zIndex: 100,
  },
  button: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: COLORS.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0 0 15px ${COLORS.terracotta}`,
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
