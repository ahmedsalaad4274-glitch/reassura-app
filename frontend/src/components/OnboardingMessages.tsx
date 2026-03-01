import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const MESSAGES = [
  {
    emoji: '\ud83c\udf3f',
    text: ['We ', 'never', ' sell your data. We ', 'never', ' share it with advertisers. Location auto-deletes after ', '24 hours', '.'],
    bolds: [1, 3, 5],
    color: 'sage',
  },
  {
    emoji: '\ud83c\udfe1',
    text: ['Reassura. ', 'Your circle, your space.', ' Everyone you love \u2014 kept safe.'],
    bolds: [1],
    color: 'sage',
  },
  {
    emoji: '\ud83d\udc9a',
    text: ['Built by people who know what it feels like to ', 'worry', '. We made ', 'Reassura', ' so you don\u2019t have to.'],
    bolds: [1, 3],
    color: 'blue',
  },
  {
    emoji: '\ud83d\udd12',
    text: ['You can ', 'delete your account', ' and all data in ', 'one tap', '. Always.'],
    bolds: [1, 3],
    color: 'blue',
  },
  {
    emoji: '\u2728',
    text: ['Reassura works quietly in the background so you ', 'don\u2019t have to worry', '.'],
    bolds: [1],
    color: 'sage',
  },
];

interface Props {
  startIndex?: number;
}

export default function OnboardingMessages({ startIndex = 0 }: Props) {
  const [index, setIndex] = useState(startIndex % MESSAGES.length);
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  const animate = () => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animate();
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setIndex(i => (i + 1) % MESSAGES.length);
        animate();
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const msg = MESSAGES[index];
  const bubbleStyle = msg.color === 'sage' ? styles.sageBubble : styles.blueBubble;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bubble, bubbleStyle, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.emoji}>{msg.emoji}</Text>
        <Text style={styles.bodyText}>
          {msg.text.map((segment, i) =>
            msg.bolds.includes(i)
              ? <Text key={i} style={styles.boldText}>{segment}</Text>
              : segment
          )}
        </Text>
      </Animated.View>

      <View style={styles.dots}>
        {MESSAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.sig}>
        <View style={styles.sigLine} />
        <View style={styles.sigCentre}>
          <Text style={styles.sigLeaf}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.sigName}>Reassura</Text>
          <Text style={styles.sigTag}>your circle {'\u00B7'} your space</Text>
        </View>
        <View style={styles.sigLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  bubble: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, paddingHorizontal: 14,
    borderTopLeftRadius: 4, borderTopRightRadius: 14,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
    marginBottom: 8,
  },
  sageBubble: {
    backgroundColor: 'rgba(122,158,135,0.08)',
    borderWidth: 1, borderColor: 'rgba(122,158,135,0.22)',
    shadowColor: '#7A9E87', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 4,
  },
  blueBubble: {
    backgroundColor: 'rgba(61,90,153,0.08)',
    borderWidth: 1, borderColor: 'rgba(61,90,153,0.22)',
    shadowColor: '#3D5A99', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18, shadowRadius: 12, elevation: 4,
  },
  emoji:    { fontSize: 15, flexShrink: 0, marginTop: 1 },
  bodyText: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20, flex: 1 },
  boldText: { fontFamily: 'Fraunces_600SemiBold', fontStyle: 'normal', color: 'rgba(255,255,255,0.94)' },
  dots:     { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 8 },
  dot:      { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.14)' },
  dotActive:{ width: 14, height: 4, borderRadius: 2, backgroundColor: '#7A9E87' },
  sig:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  sigLine:   { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  sigCentre: { alignItems: 'center', gap: 2 },
  sigLeaf:   { fontSize: 12 },
  sigName:   { fontFamily: 'Fraunces_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 },
  sigTag:    { fontSize: 11, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', letterSpacing: 0.5 },
});
