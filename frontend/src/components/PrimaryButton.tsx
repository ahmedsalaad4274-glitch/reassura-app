import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet, View } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  color?: 'sage' | 'blue' | 'amber';
  disabled?: boolean;
}

const COLORS = {
  sage:  { top: '#5E9070', bottom: '#3D6B50', edge: '#1A3525', glow: 'rgba(90,138,106,0.35)' },
  blue:  { top: '#4A6AAA', bottom: '#2A3D70', edge: '#16254A', glow: 'rgba(61,90,153,0.35)' },
  amber: { top: '#9A7A3A', bottom: '#6A5020', edge: '#3A2808', glow: 'rgba(201,168,76,0.35)' },
};

export default function PrimaryButton({ label, onPress, color = 'sage', disabled = false }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;
  const pulse   = useRef(new Animated.Value(0)).current;
  const pressed = useRef(new Animated.Value(0)).current;
  const c = COLORS[color];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(breathe, { toValue: 0, duration: 1400, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 2, duration: 900, useNativeDriver: true }),
        Animated.delay(2600),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(400),
      ])
    ).start();
  }, []);

  const handlePressIn = () =>
    Animated.timing(pressed, { toValue: 1, duration: 80, useNativeDriver: false }).start();
  const handlePressOut = () =>
    Animated.timing(pressed, { toValue: 0, duration: 120, useNativeDriver: false }).start();

  const translateY   = pressed.interpolate({ inputRange: [0,1], outputRange: [0, 5] });
  const shadowHeight = pressed.interpolate({ inputRange: [0,1], outputRange: [7, 2] });
  const shimmerX     = shimmer.interpolate({ inputRange: [-1, 2], outputRange: [-80, 320] });
  const pulseScale   = pulse.interpolate({ inputRange: [0,1], outputRange: [1, 1.08] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 0.1, 0] });

  return (
    <View style={[styles.wrap, disabled && { opacity: 0.4 }]}>
      <Animated.View style={[
        styles.pulseRing,
        { borderColor: c.glow, transform: [{ scale: pulseScale }], opacity: pulseOpacity }
      ]} />

      <Animated.View style={{ transform: [{ translateY }], width: '100%' }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled}
          style={[styles.btn, { backgroundColor: c.bottom, shadowColor: c.edge }]}
        >
          <View style={styles.highlight} />
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { skewX: '-20deg' }] }]} />
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>

        <Animated.View style={[styles.edge, { backgroundColor: c.edge, height: shadowHeight }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', position: 'relative', alignItems: 'center' },
  pulseRing: {
    position: 'absolute', top: -7, left: -7, right: -7, bottom: -7,
    borderRadius: 100, borderWidth: 2, zIndex: 0,
  },
  btn: {
    width: '100%', paddingVertical: 15, borderRadius: 100,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  highlight: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 100, borderTopRightRadius: 100,
  },
  shimmer: {
    position: 'absolute', top: 0, bottom: 0, width: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.4,
    zIndex: 2,
  },
  edge: {
    width: '94%', alignSelf: 'center',
    borderBottomLeftRadius: 100, borderBottomRightRadius: 100,
    marginTop: -4, zIndex: 0,
  },
});
