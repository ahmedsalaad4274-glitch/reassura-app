import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, getStatusColor } from '../constants/theme';
import { User } from '../store/appStore';
import { useTheme } from '../context/ThemeContext';

interface StoryCircleProps {
  user: User;
  onPress: () => void;
  isCurrentUser?: boolean;
  size?: number;
}

export const StoryCircle: React.FC<StoryCircleProps> = ({
  user,
  onPress,
  isCurrentUser = false,
  size = 70,
}) => {
  const { theme } = useTheme();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const statusColor = getStatusColor(user.status);
  const mood = (user as any).mood;
  
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.circleOuter,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: statusColor,
            borderStyle: isCurrentUser && !user.status_message ? 'dashed' : 'solid',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View
          style={[
            styles.circleInner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: theme.card,
            },
          ]}
        >
          <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{user.emoji}</Text>
        </View>
      </Animated.View>
      
      {isCurrentUser && (
        <View style={styles.addBadge}>
          <Text style={styles.addBadgeText}>+</Text>
        </View>
      )}
      
      {/* Mood badge */}
      {mood && (
        <View style={styles.moodBadge}>
          <Text style={styles.moodText}>{mood}</Text>
        </View>
      )}
      
      {user.battery_level && user.battery_level < 20 && !mood && (
        <View style={styles.batteryBadge}>
          <Text style={styles.batteryText}>{'\u{1F50B}'}</Text>
        </View>
      )}
      
      {/* Quiet hours indicator */}
      {(user as any).quiet_hours_enabled && (
        <View style={styles.quietBadge}>
          <Text style={styles.quietText}>{'\u{1F4A4}'}</Text>
        </View>
      )}
      
      <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>{user.name}</Text>
      {isCurrentUser && (
        <Text style={[styles.tapHint, { color: theme.textTertiary }]}>(tap to update)</Text>
      )}
      {!isCurrentUser && user.status_message && (
        <Text style={[styles.statusMessage, { color: theme.textTertiary }]} numberOfLines={1}>
          {user.status_message}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  circleOuter: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  addBadge: {
    position: 'absolute',
    bottom: 30,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  moodBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.backgroundCard,
  },
  moodText: {
    fontSize: 11,
  },
  batteryBadge: {
    position: 'absolute',
    top: 0,
    right: 5,
  },
  batteryText: {
    fontSize: 12,
  },
  quietBadge: {
    position: 'absolute',
    top: -2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quietText: {
    fontSize: 10,
  },
  name: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  tapHint: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 2,
  },
  statusMessage: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },
});
