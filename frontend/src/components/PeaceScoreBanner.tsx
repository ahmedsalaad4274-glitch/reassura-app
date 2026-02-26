import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAppStore } from '../store/appStore';

export const PeaceScoreBanner: React.FC = () => {
  const users = useAppStore((state) => state.users);
  const circles = useAppStore((state) => state.circles);
  const selectedCircleIndex = useAppStore((state) => state.selectedCircleIndex);
  
  const selectedCircle = circles[selectedCircleIndex];
  const circleMembers = selectedCircle
    ? users.filter(u => selectedCircle.member_ids.includes(u.id))
    : [];
  
  const travellingCount = circleMembers.filter(u => u.status === 'travelling').length;
  const onTheWayCount = circleMembers.filter(u => u.status === 'on_the_way').length;
  const emergencyCount = circleMembers.filter(u => u.status === 'emergency').length;
  
  const getStatusMessage = () => {
    if (emergencyCount > 0) {
      return { text: `${emergencyCount} needs help`, color: COLORS.terracotta };
    }
    if (travellingCount > 0) {
      return { text: `${travellingCount} travelling`, color: COLORS.navyBlue };
    }
    if (onTheWayCount > 0) {
      return { text: `${onTheWayCount} on the way`, color: COLORS.gold };
    }
    return { text: 'All safe', color: COLORS.sageGreen };
  };
  
  const status = getStatusMessage();
  
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="leaf" size={18} color={COLORS.sageLight} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Peace Score</Text>
          <Text style={styles.subtitle}>
            {emergencyCount > 0
              ? 'Someone in your circle needs help'
              : 'Everyone in your circles is safe'}
          </Text>
        </View>
      </View>
      <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.sageDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 12,
  },
  status: {
    fontFamily: FONTS.heading,
    fontSize: 14,
  },
});