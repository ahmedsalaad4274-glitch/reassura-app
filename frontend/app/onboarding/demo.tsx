import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function DemoScreen() {
  const router = useRouter();
  const [tapped, setTapped] = useState(false);

  const floatY = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const dotOp = useRef(new Animated.Value(1)).current;
  const ripple1Scale = useRef(new Animated.Value(1)).current;
  const ripple1Op = useRef(new Animated.Value(0)).current;
  const ripple2Scale = useRef(new Animated.Value(1)).current;
  const ripple2Op = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(-60)).current;
  const toastOp = useRef(new Animated.Value(0)).current;
  const successOp = useRef(new Animated.Value(0)).current;
  const successTY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const a1 = Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue: -8, duration: 1750, useNativeDriver: true }),
      Animated.timing(floatY, { toValue: 0, duration: 1750, useNativeDriver: true }),
    ]));
    const a2 = Animated.loop(Animated.sequence([
      Animated.timing(dotScale, { toValue: 1.3, duration: 750, useNativeDriver: true }),
      Animated.timing(dotScale, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    const a3 = Animated.loop(Animated.sequence([
      Animated.timing(dotOp, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      Animated.timing(dotOp, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);
    ripple1Op.setValue(0.5);
    Animated.parallel([
      Animated.timing(ripple1Scale, { toValue: 2.5, duration: 700, useNativeDriver: true }),
      Animated.timing(ripple1Op, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      ripple2Op.setValue(0.4);
      Animated.parallel([
        Animated.timing(ripple2Scale, { toValue: 3, duration: 800, useNativeDriver: true }),
        Animated.timing(ripple2Op, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }, 150);
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(toastY, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(toastOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(successOp, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(successTY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const heading = tapped ? "That\u2019s what Reassura feels like." : "One tap. They know you\u2019re safe.";
  const sub = tapped ? 'Peace of mind, delivered.' : "The I\u2019m Home button tells your whole circle instantly \u2014 no message needed.";

  return (
    <LinearGradient colors={['#0D1F12', '#0B1810', '#0A0806']} locations={[0, 0.4, 0.65]} style={st.root}>
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => router.back()} data-testid="demo1-back">
          <Text style={st.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={st.dotsWrap}>
          {[0, 1, 2].map(i => <View key={i} style={i === 0 ? shared.progressDotActive : shared.progressDot} />)}
        </View>
        <TouchableOpacity onPress={() => router.replace('/onboarding/role')} data-testid="demo1-skip">
          <Text style={st.skipTopText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 16 }}>
        <Animated.View style={[st.toast, { opacity: toastOp, transform: [{ translateY: toastY }] }]} pointerEvents="none">
          <View style={st.toastIcon}><Text style={{ fontSize: 14 }}>{'\uD83C\uDF3F'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.toastApp}>Reassura</Text>
            <Text style={st.toastMsg}>Mum is home safe {'\uD83C\uDFE0'}</Text>
          </View>
        </Animated.View>

        <View style={{ alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <TouchableOpacity onPress={handleTap} activeOpacity={0.85} data-testid="slide1-tap-btn">
              <View style={st.heroBtnOuter}>
                <Animated.View style={[st.rippleRing, { transform: [{ scale: ripple1Scale }], opacity: ripple1Op }]} />
                <Animated.View style={[st.rippleRing, { transform: [{ scale: ripple2Scale }], opacity: ripple2Op }]} />
                <LinearGradient colors={['#5E9070', '#3D6B50']} style={st.heroBtn}>
                  {tapped
                    ? <Text style={st.heroBtnSent}>Sent! {'\u2713'}</Text>
                    : <>
                        <Text style={{ fontSize: 60 }}>{'\uD83C\uDFE0'}</Text>
                        <Text style={st.heroBtnLabel}>I{'\u2019'}m Home</Text>
                      </>
                  }
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Animated.View>
          {!tapped && (
            <View style={st.tapPill}>
              <Animated.View style={[st.tapDot, { transform: [{ scale: dotScale }], opacity: dotOp }]} />
              <Text style={st.tapPillText}>Tap it {'\u2014'} see what happens</Text>
            </View>
          )}
        </View>

        {tapped && (
          <Animated.View style={[st.successCard, { opacity: successOp, transform: [{ translateY: successTY }] }]}>
            <Text style={st.successMain}>Your circle just got notified {'\uD83D\uDC9A'}</Text>
            <Text style={st.successSub}>That{'\u2019'}s all it takes. One tap.</Text>
          </Animated.View>
        )}

        <View>
          <Text style={st.heading}>{heading}</Text>
          <Text style={st.sub}>{sub}</Text>
        </View>
      </View>

      <OnboardingMessages startIndex={0} />
      <View style={{ paddingHorizontal: 16 }}>
        <PrimaryButton label={'Next \u2192'} onPress={() => router.push('/onboarding/demo2')} color="sage" />
      </View>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, paddingBottom: 20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 54, paddingBottom: 8,
  },
  backArrow: { fontSize: 22, color: 'rgba(255,255,255,0.45)' },
  dotsWrap: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  skipTopText: { fontFamily: ONBOARDING.body, fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  toast: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(30,28,24,0.94)', borderRadius: 14,
    padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  toastIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(122,158,135,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  toastApp: { fontFamily: ONBOARDING.bodyBold, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  toastMsg: { fontFamily: ONBOARDING.bodyMed, color: '#fff', fontSize: 14, marginTop: 1 },

  heroBtnOuter: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center' },
  heroBtn: {
    width: 140, height: 140, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderTopColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#3D6B50', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
  },
  heroBtnLabel: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 13, marginTop: 4 },
  heroBtnSent: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 18 },
  rippleRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 38,
    borderWidth: 2, borderColor: 'rgba(122,158,135,0.5)',
  },

  tapPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(122,158,135,0.15)',
    borderColor: 'rgba(122,158,135,0.45)', borderWidth: 1.5,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16, marginTop: 14,
  },
  tapDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7A9E87' },
  tapPillText: { fontSize: 12, color: '#7A9E87', fontFamily: ONBOARDING.bodyMed },

  successCard: {
    backgroundColor: 'rgba(122,158,135,0.1)', borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)', borderRadius: 14,
    padding: 16, alignItems: 'center', alignSelf: 'stretch',
  },
  successMain: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 15, textAlign: 'center' },
  successSub: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 14, textAlign: 'center', marginTop: 4 },

  heading: {
    fontFamily: ONBOARDING.heading, color: '#fff', fontSize: 24,
    lineHeight: 32, textAlign: 'center', marginBottom: 6,
  },
  sub: {
    fontFamily: ONBOARDING.body, fontSize: 14,
    color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 21,
  },
});
