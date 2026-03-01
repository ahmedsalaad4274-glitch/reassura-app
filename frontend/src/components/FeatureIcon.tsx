import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

const GRADIENTS: Record<string, string[]> = {
  sage:    ['#5E9070', '#2E5040'],
  blue:    ['#4A6AAA', '#2A3D70'],
  amber:   ['rgba(201,168,76,1)', '#8A6A20'],
  neutral: ['#3A3530', '#201C18'],
};
const EDGES: Record<string, string> = { sage: '#152A1E', blue: '#16254A', amber: '#4A3A10', neutral: '#0A0806' };

interface Props {
  emoji: string;
  color?: 'sage' | 'blue' | 'amber' | 'neutral';
  size?: number;
  delay?: number;
}

export default function FeatureIcon({ emoji, color = 'sage', size = 44, delay = 0 }: Props) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(float, { toValue: -3, duration: 1400, useNativeDriver: true }),
        Animated.timing(float, { toValue:  0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const radius = size * 0.27;

  return (
    <Animated.View style={[
      styles.base,
      {
        width: size, height: size,
        borderRadius: radius,
        backgroundColor: GRADIENTS[color][1],
        shadowColor: EDGES[color],
        transform: [{ translateY: float }],
      }
    ]}>
      <Animated.Text style={{ fontSize: size * 0.5 }}>{emoji}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderTopColor: 'rgba(255,255,255,0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8, shadowRadius: 0,
    elevation: 6,
  },
});
