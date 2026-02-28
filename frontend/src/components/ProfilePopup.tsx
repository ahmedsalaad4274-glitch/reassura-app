import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor, STATUS_CONFIG } from '../constants/theme';
import { User } from '../store/appStore';
import { reactionApi, checkinApi } from '../services/api';
import { useAppStore } from '../store/appStore';

interface ProfilePopupProps {
  user: User | null;
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

const QUICK_REPLIES = [
  { label: 'Glad you\u2019re safe', emoji: '\u2764\uFE0F', type: 'heart' },
  { label: 'Got it', emoji: '\u{1F44D}', type: 'thumbs_up' },
  { label: 'Thinking of you', emoji: '\u{1F33F}', type: 'thinking' },
  { label: 'Check in', emoji: '\u{1F44B}', type: 'check_in' },
  { label: 'Call me', emoji: '\u{1F4DE}', type: 'call' },
  { label: 'On my way', emoji: '\u{1F697}', type: 'on_way' },
];

function getInsight(user: User): string {
  const h = new Date().getHours();
  const status = user.status;
  if (status === 'home' && h >= 21) return `${user.name} is settled in for the night. Everyone\u2019s safe.`;
  if (status === 'home') return `${user.name} has been home for a while. No need to worry.`;
  if (status === 'on_the_way') return `${user.name} is on the move. They should arrive soon.`;
  if (status === 'goodnight') return `${user.name} said goodnight. They\u2019re winding down.`;
  if (status === 'all_good') return `${user.name} checked in recently. All is well.`;
  if (status === 'safe_walk') return `${user.name} is on a safe walk. Live route is active.`;
  if (status === 'travelling') return `${user.name} is travelling. Flight tracking is on.`;
  if (user.battery_level && user.battery_level < 20) return `${user.name}\u2019s battery is low (${user.battery_level}%). They may go offline soon.`;
  return `${user.name} last updated their status recently.`;
}

export const ProfilePopup: React.FC<ProfilePopupProps> = ({ user, visible, onClose }) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const currentUser = useAppStore((state) => state.currentUser);
  const footprints = useAppStore((state) => state.footprints);

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!user) return null;

  const statusColor = getStatusColor(user.status);
  const statusCfg = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG];
  const userFootprints = footprints.filter(f => f.user_id === user.id).slice(0, 3);
  const insight = getInsight(user);

  const handleReaction = async (type: string) => {
    if (!currentUser) return;
    try {
      if (type === 'check_in') { await checkinApi.send(currentUser.id, user.id); }
      else { await reactionApi.create({ from_user_id: currentUser.id, to_user_id: user.id, reaction_type: type }); }
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const d = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity activeOpacity={1}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} data-testid="profile-popup-close">
              <Ionicons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Avatar + status */}
            <View style={styles.avatarArea}>
              <View style={[styles.avatarRing, { borderColor: statusColor }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>{user.emoji}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>{statusCfg?.emoji || '\u2764\uFE0F'}</Text>
              </View>
            </View>

            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.statusLine}>
              {user.status_emoji} {user.status.replace('_', ' ')} {'\u00B7'} {formatTime(user.updated_at)}
            </Text>
            {user.status_message && <Text style={styles.message}>{'\u201C'}{user.status_message}{'\u201D'}</Text>}

            {/* Battery / Driving indicators */}
            <View style={styles.indicators}>
              {user.battery_level !== undefined && user.battery_level < 30 && (
                <View style={styles.indicator}>
                  <Text style={styles.indicatorText}>{'\u{1F50B}'} Battery {user.battery_level}%</Text>
                </View>
              )}
              {user.is_driving && (
                <View style={[styles.indicator, { borderColor: 'rgba(201,168,76,0.3)' }]}>
                  <Text style={styles.indicatorText}>{'\u{1F697}'} Driving{user.speed_mph ? ` \u00B7 ${user.speed_mph}mph` : ''}</Text>
                </View>
              )}
            </View>

            {/* Reassura Insight */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name="leaf" size={14} color={COLORS.sageGreen} />
                <Text style={styles.insightLabel}>REASSURA INSIGHT</Text>
              </View>
              <Text style={styles.insightText}>{insight}</Text>
            </View>

            {/* Recent Activity */}
            {userFootprints.length > 0 && (
              <View style={styles.activitySection}>
                <Text style={styles.activityLabel}>RECENT ACTIVITY</Text>
                {userFootprints.map((fp, i) => (
                  <View key={fp.id || i} style={styles.activityRow}>
                    <Text style={styles.activityEmoji}>{fp.status_emoji || statusCfg?.emoji || '\u{1F4CD}'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>{fp.status?.replace('_', ' ') || 'update'}</Text>
                      {fp.message && <Text style={styles.activityMsg}>{fp.message}</Text>}
                    </View>
                    <Text style={styles.activityTime}>{formatTime(fp.created_at)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Reply Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {QUICK_REPLIES.map((r) => (
                <TouchableOpacity key={r.type} style={styles.chip} onPress={() => { handleReaction(r.type); onClose(); }}
                  data-testid={`quick-reply-${r.type}`}>
                  <Text style={styles.chipEmoji}>{r.emoji}</Text>
                  <Text style={styles.chipLabel}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Privacy note */}
            <Text style={styles.privacy}>{'\u{1F33F}'} Status shared voluntarily {'\u00B7'} No precise GPS stored</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(26,22,18,0.97)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    paddingBottom: 36,
    maxHeight: height * 0.85,
  },
  handleBar: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
  closeBtn: { position: 'absolute', top: 0, right: 0, padding: SPACING.sm, zIndex: 10 },
  avatarArea: { alignItems: 'center', position: 'relative' },
  avatarRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 78, height: 78, borderRadius: 39, backgroundColor: COLORS.backgroundDark, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 42 },
  statusBadge: { position: 'absolute', bottom: -2, right: '38%', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(26,22,18,0.97)' },
  statusBadgeText: { fontSize: 12 },
  name: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 22, textAlign: 'center', marginTop: SPACING.md, letterSpacing: -0.3 },
  statusLine: { fontFamily: FONTS.bodyMedium, color: COLORS.sageLight, fontSize: 14, textAlign: 'center', marginTop: 4 },
  message: { fontFamily: FONTS.body, color: COLORS.cream, fontSize: 13, textAlign: 'center', marginTop: SPACING.sm, fontStyle: 'italic' },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: SPACING.sm },
  indicator: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  indicatorText: { fontSize: 11, color: COLORS.textMuted },
  // Insight
  insightCard: { backgroundColor: 'rgba(122,158,135,0.08)', borderWidth: 1, borderColor: 'rgba(122,158,135,0.18)', borderRadius: 14, padding: 12, marginTop: SPACING.md },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  insightLabel: { fontSize: 9, color: COLORS.sageGreen, fontWeight: '600', letterSpacing: 1 },
  insightText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textBody, lineHeight: 18 },
  // Activity
  activitySection: { marginTop: SPACING.md },
  activityLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  activityEmoji: { fontSize: 16, width: 24, textAlign: 'center' },
  activityText: { fontSize: 12, color: COLORS.textBody, fontWeight: '500', textTransform: 'capitalize' },
  activityMsg: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  activityTime: { fontSize: 10, color: COLORS.textMuted },
  // Chips
  chipsRow: { paddingVertical: SPACING.md, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textBody },
  privacy: { fontFamily: FONTS.body, color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 },
});
