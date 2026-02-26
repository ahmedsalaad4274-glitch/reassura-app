import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor } from '../constants/theme';
import { Footprint } from '../store/appStore';

interface FootprintCardProps {
  footprint: Footprint;
  onReact?: () => void;
}

export const FootprintCard: React.FC<FootprintCardProps> = ({ footprint, onReact }) => {
  const statusColor = getStatusColor(footprint.status);
  
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
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarRing, { borderColor: statusColor }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{footprint.user_emoji}</Text>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{footprint.user_name}</Text>
        <Text style={styles.status}>
          {footprint.status_emoji} {footprint.status.replace('_', ' ')}
          {footprint.message && ` · "${footprint.message}"`}
        </Text>
        <Text style={styles.time}>{formatTime(footprint.created_at)}</Text>
      </View>
      
      <TouchableOpacity style={styles.reactionButton} onPress={onReact}>
        <Text style={styles.reactionEmoji}>❤️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.backgroundCard,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 15,
  },
  status: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 13,
    marginTop: 2,
  },
  time: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  reactionButton: {
    padding: SPACING.sm,
  },
  reactionEmoji: {
    fontSize: 20,
  },
});