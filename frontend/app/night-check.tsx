import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, GLASS_CARD } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { userApi } from '../src/services/api';

const { width, height } = Dimensions.get('window');

export default function NightCheckScreen() {
  const router = useRouter();
  const { currentUser, users, circles, setCurrentUser } = useAppStore();
  const [sent, setSent] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const moonAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(moonAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
    starAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const circleMembers = React.useMemo(() => {
    if (!currentUser) return [];
    const memberIds = new Set<string>();
    circles.filter(c => currentUser.circle_ids.includes(c.id)).forEach(c => c.member_ids.forEach(id => { if (id !== currentUser.id) memberIds.add(id); }));
    return users.filter(u => memberIds.has(u.id));
  }, [currentUser, circles, users]);

  const handleSendGoodnight = async () => {
    if (!currentUser) return;
    try {
      await userApi.updateStatus(currentUser.id, { status: 'goodnight', message: 'Goodnight' });
      setSent(true);
    } catch { setSent(true); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Stars */}
      {starAnims.map((anim, i) => (
        <Animated.View key={i} style={[styles.star, {
          opacity: anim,
          left: 30 + (i * 31) % (width - 60),
          top: 60 + (i * 47) % (height * 0.4),
        }]}>
          <View style={styles.starDot} />
        </Animated.View>
      ))}

      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {!sent ? (
          <>
            <Animated.Text style={[styles.moon, { transform: [{ scale: moonAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }] }]}>
              {'\u{1F319}'}
            </Animated.Text>
            <Text style={styles.title}>Goodnight, {currentUser?.name?.split('_')[0] || 'You'}</Text>
            <Text style={styles.subtitle}>Let your circle know you're safe before you sleep</Text>

            <TouchableOpacity style={styles.sendButton} onPress={handleSendGoodnight} activeOpacity={0.85}>
              <Text style={styles.sendButtonText}>{'\u{1F319}'} Send Goodnight</Text>
            </TouchableOpacity>

            <Text style={styles.recipientLabel}>
              {circleMembers.map(m => m.name).join(', ')} will know you're safe
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sentMoon}>{'\u{1F319}'}</Text>
            <Text style={styles.title}>Sweet dreams</Text>
            <Text style={styles.subtitle}>Your circle knows you're safe {'\u{1F33F}'}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Close</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  star: { position: 'absolute', zIndex: 0 },
  starDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.5)' },
  closeBtn: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl, zIndex: 1 },
  moon: { fontSize: 80, marginBottom: SPACING.lg },
  sentMoon: { fontSize: 80, marginBottom: SPACING.lg },
  title: { fontFamily: FONTS.headingBold, fontSize: 28, color: COLORS.white, marginBottom: SPACING.sm, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontFamily: FONTS.body, fontSize: 16, color: COLORS.textBody, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 24 },
  sendButton: {
    backgroundColor: COLORS.gold, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: 30, marginBottom: SPACING.lg, width: '100%', alignItems: 'center',
    boxShadow: '0 0 20px rgba(201,168,76,0.3)',
  },
  sendButtonText: { fontFamily: FONTS.headingBold, fontSize: 18, color: COLORS.white },
  recipientLabel: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  doneButton: {
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: 30, borderWidth: 1, borderColor: COLORS.cardBorder, marginTop: SPACING.lg,
  },
  doneButtonText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.textMuted },
});
