import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide, type = 'success' }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  const bgColor = type === 'success' ? COLORS.sageGreen : type === 'warning' ? COLORS.terracotta : COLORS.navyBlue;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    zIndex: 1000,
  },
  message: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
});
