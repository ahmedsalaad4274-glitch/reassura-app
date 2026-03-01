import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ONBOARDING } from '../../src/styles/onboarding';
import FeatureIcon from '../../src/components/FeatureIcon';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function WelcomeScreen() {
  const router = useRouter();
  const glowOp = useRef(new Animated.Value(0.14)).current;
  const card1Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const g = Animated.loop(Animated.sequence([
      Animated.timing(glowOp, { toValue: 0.28, duration: 1500, useNativeDriver: true }),
      Animated.timing(glowOp, { toValue: 0.14, duration: 1500, useNativeDriver: true }),
    ]));
    const c = Animated.loop(Animated.sequence([
      Animated.timing(card1Scale, { toValue: 0.93, duration: 900, useNativeDriver: true }),
      Animated.timing(card1Scale, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]));
    g.start(); c.start();
    return () => { g.stop(); c.stop(); };
  }, []);

  return (
    <LinearGradient colors={['#0D1F12', '#0B1508', '#0A0806']} locations={[0, 0.35, 0.6]} style={s.root}>
      <View style={s.logoRow}>
        <Text style={{ fontSize: 16 }}>{'\uD83C\uDF3F'}</Text>
        <Text style={s.logoText}>Reassura</Text>
      </View>

      <View style={s.hero}>
        <View style={s.iconTriangle}>
          <View style={[s.iconCol, { marginBottom: 10 }]}>
            <FeatureIcon emoji={'\uD83C\uDFE0'} color="sage" size={56} delay={800} />
            <Text style={s.iconLabel}>I{'\u2019'}m Home</Text>
          </View>
          <View style={s.iconCol}>
            <Animated.View style={[s.centreGlow, { opacity: glowOp }]} />
            <FeatureIcon emoji={'\uD83C\uDF3F'} color="sage" size={76} delay={0} />
            <Text style={s.centreLabel}>Reassura</Text>
          </View>
          <View style={[s.iconCol, { marginBottom: 10 }]}>
            <FeatureIcon emoji={'\uD83D\uDEB6'} color="blue" size={56} delay={1600} />
            <Text style={s.iconLabel}>Safe Walk</Text>
          </View>
        </View>

        <Text style={s.heading}>The app your family{'\n'}actually uses.</Text>
        <Text style={s.subtitle}>No tracking. No anxiety. Just quiet reassurance that everyone you love is safe.</Text>

        <View style={s.divider}>
          <View style={s.divLine} />
          <Text style={s.divText}>explore the app</Text>
          <View style={s.divLine} />
        </View>

        <View style={s.cardRow}>
          <Animated.View style={{ flex: 1, transform: [{ scale: card1Scale }] }}>
            <TouchableOpacity style={[s.card, s.cardSage]} onPress={() => router.push('/onboarding/demo')} data-testid="welcome-card-home">
              <FeatureIcon emoji={'\uD83C\uDFE0'} color="sage" size={42} />
              <Text style={s.cardLabel}>I{'\u2019'}m Home</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={[s.card, s.cardBlue]} onPress={() => router.push('/onboarding/demo2')} data-testid="welcome-card-walk">
            <FeatureIcon emoji={'\uD83D\uDEB6'} color="blue" size={42} />
            <Text style={s.cardLabel}>Safe Walk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.card, s.cardAmber]} onPress={() => router.push('/onboarding/demo3')} data-testid="welcome-card-circle">
            <FeatureIcon emoji={'\uD83D\uDC65'} color="amber" size={42} />
            <Text style={s.cardLabel}>Circle</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.hintText}>Tap an icon to see it in action</Text>
      </View>

      <View style={s.cta}>
        <PrimaryButton label={'Get started \uD83C\uDF3F'} onPress={() => router.push('/onboarding/demo')} />
        <TouchableOpacity onPress={() => router.push('/onboarding/role')} data-testid="welcome-skip">
          <Text style={s.skipText}>Skip intro {'\u2192'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingBottom: 20 },
  logoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 56, paddingHorizontal: 20,
  },
  logoText: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: 3,
  },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  iconTriangle: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-end', marginBottom: 20,
  },
  iconCol: { alignItems: 'center', gap: 6 },
  centreGlow: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(122,158,135,0.2)', top: -12, alignSelf: 'center',
  },
  iconLabel: {
    fontFamily: ONBOARDING.bodyMed, fontSize: 9.5,
    color: 'rgba(255,255,255,0.4)',
  },
  centreLabel: {
    fontFamily: 'Fraunces_700Bold', fontSize: 11,
    color: 'rgba(255,255,255,0.65)', letterSpacing: 1,
  },
  heading: {
    fontFamily: 'Fraunces_700Bold', fontSize: 26, color: '#fff',
    textAlign: 'center', lineHeight: 30, marginBottom: 10,
  },
  subtitle: {
    fontFamily: ONBOARDING.body, fontSize: 13, color: 'rgba(255,255,255,0.5)',
    textAlign: 'center', lineHeight: 21, marginBottom: 20, paddingHorizontal: 8,
  },
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    width: '100%', marginBottom: 16,
  },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  divText: { fontSize: 10, color: 'rgba(255,255,255,0.25)' },
  cardRow: { flexDirection: 'row', gap: 10, width: '100%' },
  card: {
    flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 6, borderWidth: 1,
  },
  cardSage: {
    backgroundColor: 'rgba(122,158,135,0.08)',
    borderColor: 'rgba(122,158,135,0.22)',
  },
  cardBlue: {
    backgroundColor: 'rgba(74,106,170,0.08)',
    borderColor: 'rgba(74,106,170,0.22)',
  },
  cardAmber: {
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderColor: 'rgba(201,168,76,0.22)',
  },
  cardLabel: {
    fontFamily: ONBOARDING.bodyMed, fontSize: 10,
    color: 'rgba(255,255,255,0.7)', textAlign: 'center',
  },
  hintText: {
    fontSize: 10.5, color: 'rgba(255,255,255,0.3)',
    textAlign: 'center', marginTop: 8,
  },
  cta: { paddingHorizontal: 16 },
  skipText: {
    fontSize: 11, color: 'rgba(255,255,255,0.22)',
    textAlign: 'center', marginTop: 6,
  },
});
