import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface Props {
  emoji: string;
  name: string;
  status: 'active' | 'steady' | 'quiet' | 'off-grid';
  size?: number;
  isDark?: boolean;
}

const SAGE = '#7A9E87';
const TERRA = '#C4704A';

export const OrbitNode: React.FC<Props> = ({ emoji, name, status, size = 40, isDark = true }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const nudgeDot = useRef(new Animated.Value(0.4)).current;
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'active') {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])).start();
    }
    if (status === 'off-grid') {
      Animated.loop(Animated.sequence([
        Animated.timing(driftAnim, { toValue: 15, duration: 3000, useNativeDriver: true }),
        Animated.timing(driftAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(nudgeDot, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(nudgeDot, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])).start();
    }
  }, [status]);

  const isOffGrid = status === 'off-grid';
  const borderStyle = isOffGrid ? 'dashed' : 'solid';
  const opacity = isOffGrid ? 0.32 : 1;

  return (
    <Animated.View
      style={[
        s.wrap,
        { opacity, transform: [{ scale: status === 'active' ? pulseAnim : 1 }, { translateY: isOffGrid ? driftAnim : 0 }] },
      ]}
    >
      <View
        style={[
          s.circle,
          {
            width: size, height: size, borderRadius: size / 2,
            borderStyle: borderStyle as any,
            borderColor: SAGE,
            backgroundColor: isDark ? '#0D0B09' : '#F7F3EE',
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      </View>
      {isOffGrid && (
        <Animated.View style={[s.nudgeDot, { opacity: nudgeDot }]} />
      )}
      <Text style={[s.name, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(13,11,9,0.6)' }]} numberOfLines={1}>
        {name}
      </Text>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  wrap: { alignItems: 'center', width: 56 },
  circle: {
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    shadowColor: SAGE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 6,
  },
  nudgeDot: {
    position: 'absolute', top: -2, right: 4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: TERRA,
    shadowColor: TERRA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
  },
  name: { fontSize: 9, marginTop: 3, textAlign: 'center' },
});
