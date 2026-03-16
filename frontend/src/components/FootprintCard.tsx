import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS, SPACING } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface FootprintCardProps {
  footprint: {
    id: string;
    user_name: string;
    user_emoji: string;
    status: string;
    status_emoji: string;
    message: string;
    created_at: string;
  };
}

export const FootprintCard: React.FC<FootprintCardProps> = ({ footprint }) => {
  const { theme } = useTheme();
  const timeAgo = React.useMemo(() => {
    const diff = Date.now() - new Date(footprint.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [footprint.created_at]);

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <View style={styles.avatarCol}>
        <View style={[styles.avatar, { backgroundColor: theme.card }]}>
          <Text style={styles.avatarEmoji}>{footprint.user_emoji}</Text>
        </View>
      </View>
      <View style={styles.contentCol}>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>{footprint.user_name}</Text>
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
          {footprint.status_emoji} {footprint.status?.replace('_', ' ')} {footprint.message ? `\u00B7 "${footprint.message}"` : ''}
        </Text>
        <Text style={[styles.timeText, { color: theme.textTertiary }]}>{timeAgo}</Text>
      </View>
      <TouchableOpacity style={styles.reactionBtn}>
        <Text style={styles.reactionEmoji}>{'\u2764\uFE0F'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  avatarCol: { marginRight: SPACING.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 20 },
  contentCol: { flex: 1 },
  userName: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  statusText: { fontFamily: FONTS.body, fontSize: 13, marginTop: 2 },
  timeText: { fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  reactionBtn: { justifyContent: 'center', paddingLeft: SPACING.sm },
  reactionEmoji: { fontSize: 18 },
});
