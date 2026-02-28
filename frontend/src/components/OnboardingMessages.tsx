import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ONBOARDING } from '../styles/onboarding';

interface Segment { text: string; bright?: boolean }

const MESSAGES: { emoji: string; segments: Segment[]; bg: string; border: string }[] = [
  {
    emoji: '\ud83c\udf3f',
    segments: [
      { text: 'We ' },
      { text: 'never sell your data', bright: true },
      { text: '. We ' },
      { text: 'never share it with advertisers', bright: true },
      { text: '. Location data ' },
      { text: 'auto-deletes after 24 hours', bright: true },
      { text: '.' },
    ],
    bg: 'rgba(122,158,135,0.09)',
    border: 'rgba(122,158,135,0.18)',
  },
  {
    emoji: '\ud83c\udfe1',
    segments: [
      { text: 'Reassura', bright: true },
      { text: '. Your circle, your space. ' },
      { text: 'Everyone you love', bright: true },
      { text: ' \u2014 kept safe.' },
    ],
    bg: 'rgba(122,158,135,0.09)',
    border: 'rgba(122,158,135,0.18)',
  },
  {
    emoji: '\ud83d\udc9a',
    segments: [
      { text: 'Built by people who know what it feels like to ' },
      { text: 'worry', bright: true },
      { text: '. We made ' },
      { text: 'Reassura', bright: true },
      { text: ' so you don\u2019t have to.' },
    ],
    bg: 'rgba(61,90,153,0.09)',
    border: 'rgba(61,90,153,0.18)',
  },
];

export const OnboardingMessages: React.FC = () => {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let mounted = true;
    const cycle = () => {
      if (!mounted) return;
      // Fade in from below
      opacity.setValue(0);
      translateY.setValue(12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => {
        if (!mounted) return;
        // Hold
        setTimeout(() => {
          if (!mounted) return;
          // Fade out upward
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -6, duration: 600, useNativeDriver: true }),
          ]).start(() => {
            if (!mounted) return;
            // Next message after pause
            setTimeout(() => {
              if (!mounted) return;
              setIndex(prev => (prev + 1) % MESSAGES.length);
            }, 300);
          });
        }, 3500);
      });
    };
    cycle();
    return () => { mounted = false; };
  }, [index]);

  const msg = MESSAGES[index];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bubble, { backgroundColor: msg.bg, borderColor: msg.border, opacity, transform: [{ translateY }] }]}>
        <Text style={styles.msgText}>
          {msg.emoji}{' '}
          {msg.segments.map((s, i) => (
            <Text key={i} style={s.bright ? styles.bright : styles.dim}>{s.text}</Text>
          ))}
        </Text>
      </Animated.View>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {MESSAGES.map((_, i) => (
          <View key={i} style={i === index ? styles.dotActive : styles.dot} />
        ))}
      </View>

      <Text style={styles.signature}>{'\ud83c\udf3f'} REASSURA</Text>
    </View>
  );
};
