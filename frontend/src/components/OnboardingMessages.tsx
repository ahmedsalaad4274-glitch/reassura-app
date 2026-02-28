import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ONBOARDING } from '../styles/onboarding';

interface Segment { text: string; bright?: boolean }

const MESSAGES: { emoji: string; segments: Segment[]; shadowColor: string; bg: string; border: string }[] = [
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
    bg: 'rgba(122,158,135,0.08)',
    border: 'rgba(122,158,135,0.22)',
    shadowColor: '#7A9E87',
  },
  {
    emoji: '\ud83c\udfe1',
    segments: [
      { text: 'Reassura', bright: true },
      { text: '. Your circle, your space. ' },
      { text: 'Everyone you love', bright: true },
      { text: ' \u2014 kept safe.' },
    ],
    bg: 'rgba(122,158,135,0.08)',
    border: 'rgba(122,158,135,0.22)',
    shadowColor: '#7A9E87',
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
    bg: 'rgba(61,90,153,0.08)',
    border: 'rgba(61,90,153,0.22)',
    shadowColor: '#3D5A99',
  },
];

interface Props {
  startIndex?: number;
}

export const OnboardingMessages: React.FC<Props> = ({ startIndex = 0 }) => {
  const [index, setIndex] = useState(startIndex % MESSAGES.length);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    let mounted = true;
    const cycle = () => {
      if (!mounted) return;
      opacity.setValue(0);
      translateY.setValue(12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => {
        if (!mounted) return;
        setTimeout(() => {
          if (!mounted) return;
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -6, duration: 600, useNativeDriver: true }),
          ]).start(() => {
            if (!mounted) return;
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
      <Animated.View style={[
        styles.bubble,
        {
          backgroundColor: msg.bg,
          borderColor: msg.border,
          shadowColor: msg.shadowColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
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

      {/* Signature with horizontal rules */}
      <View style={styles.signatureRow}>
        <View style={styles.ruleLine} />
        <View style={styles.signatureCenter}>
          <Text style={{ fontSize: 13 }}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.signatureName}>Reassura</Text>
          <Text style={styles.signatureTagline}>your circle {'\u00B7'} your space</Text>
        </View>
        <View style={styles.ruleLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16, gap: 12 },
  bubble: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 12,
    paddingHorizontal: 14,
    maxWidth: '92%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  msgText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.62)',
  },
  bright: {
    fontFamily: 'Fraunces_600SemiBold',
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'normal',
  },
  dim: { color: 'rgba(255,255,255,0.62)' },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: { width: 14, height: 5, borderRadius: 2.5, backgroundColor: '#7A9E87' },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: '100%',
  },
  ruleLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  signatureCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  signatureName: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 2,
  },
  signatureTagline: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
});
