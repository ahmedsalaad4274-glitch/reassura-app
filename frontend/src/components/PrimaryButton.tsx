import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  color?: 'sage' | 'blue' | 'amber';
  disabled?: boolean;
}

const COLORS = {
  sage:  { bg: '#3D6B50', edge: '#1A3525', glowFrom: 'rgba(90,138,106,0.3)', glowTo: 'rgba(90,138,106,0.55)' },
  blue:  { bg: '#2A3D70', edge: '#16254A', glowFrom: 'rgba(61,90,153,0.3)', glowTo: 'rgba(61,90,153,0.55)' },
  amber: { bg: '#6A5020', edge: '#3A2808', glowFrom: 'rgba(201,168,76,0.3)', glowTo: 'rgba(201,168,76,0.55)' },
};

export default function PrimaryButton({ label, onPress, color = 'sage', disabled = false }: Props) {
  const glow = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(0)).current;
  const c = COLORS[color];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1400, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handlePressIn = () =>
    Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: false }).start();
  const handlePressOut = () =>
    Animated.timing(press, { toValue: 0, duration: 120, useNativeDriver: false }).start();

  const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
  const edgeHeight = press.interpolate({ inputRange: [0, 1], outputRange: [7, 3] });
  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [c.glowFrom, c.glowTo],
  });

  return (
    <Animated.View style={[
      styles.outerGlow,
      disabled && { opacity: 0.4 },
      {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 16,
      }
    ]}>
      <Animated.View style={[
        styles.edgeWrap,
        {
          transform: [{ translateY }],
          shadowColor: c.edge,
          shadowOffset: { width: 0, height: edgeHeight },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 8,
        }
      ]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          disabled={disabled}
          style={[styles.btn, { backgroundColor: c.bg }]}
        >
          <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    width: '100%',
    marginVertical: 4,
  },
  edgeWrap: {
    width: '100%',
    borderRadius: 100,
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1,
  },
  label: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.4,
  },
});
