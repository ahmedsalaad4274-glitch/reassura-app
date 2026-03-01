import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

const { width: SCREEN_W } = Dimensions.get('window');
const MAP_H = 200;
const MAP_W = SCREEN_W - 32;
const RX = [MAP_W * 0.12, MAP_W * 0.12, MAP_W * 0.55, MAP_W * 0.55, MAP_W * 0.85];
const RY = [MAP_H * 0.82, MAP_H * 0.48, MAP_H * 0.48, MAP_H * 0.18, MAP_H * 0.18];
const ROUTE_D = `M ${RX[0]} ${RY[0]} L ${RX[1]} ${RY[1]} L ${RX[2]} ${RY[2]} L ${RX[3]} ${RY[3]} L ${RX[4]} ${RY[4]}`;

export default function Demo2Screen() {
  const router = useRouter();
  const [tapped, setTapped] = useState(false);
  const [arrived, setArrived] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const promptScale = useRef(new Animated.Value(1)).current;
  const promptDotScale = useRef(new Animated.Value(1)).current;
  const promptDotOp = useRef(new Animated.Value(1)).current;
  const toastY = useRef(new Animated.Value(-60)).current;
  const toastOp = useRef(new Animated.Value(0)).current;
  const successOp = useRef(new Animated.Value(0)).current;
  const successTY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loopRef.current = Animated.loop(
      Animated.timing(progress, { toValue: 4, duration: 5000, useNativeDriver: false })
    );
    loopRef.current.start();

    const p1 = Animated.loop(Animated.sequence([
      Animated.timing(promptScale, { toValue: 0.93, duration: 900, useNativeDriver: true }),
      Animated.timing(promptScale, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]));
    const p2 = Animated.loop(Animated.sequence([
      Animated.timing(promptDotScale, { toValue: 1.3, duration: 750, useNativeDriver: true }),
      Animated.timing(promptDotScale, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    const p3 = Animated.loop(Animated.sequence([
      Animated.timing(promptDotOp, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      Animated.timing(promptDotOp, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    p1.start(); p2.start(); p3.start();
    return () => { loopRef.current?.stop(); p1.stop(); p2.stop(); p3.stop(); };
  }, []);

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);
    loopRef.current?.stop();
    Animated.timing(progress, { toValue: 4, duration: 800, useNativeDriver: false }).start(() => setArrived(true));
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(toastY, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(toastOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.sequence([
      Animated.delay(1100),
      Animated.parallel([
        Animated.timing(successOp, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(successTY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const dotLeft = progress.interpolate({ inputRange: [0, 1, 2, 3, 4], outputRange: RX });
  const dotTop = progress.interpolate({ inputRange: [0, 1, 2, 3, 4], outputRange: RY });

  const heading = tapped ? "That\u2019s the relief Reassura gives." : 'Walking home? Share your route.';
  const sub = tapped
    ? 'Everyone can breathe.'
    : 'Safe Walk shares your live location until you arrive. Your circle watches in real time. Tap the map to see a live demo.';

  return (
    <LinearGradient colors={['#0D1220', '#0A0F1A', '#0A0806']} locations={[0, 0.4, 0.65]} style={st.root}>
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => router.back()} data-testid="demo2-back">
          <Text style={st.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={st.dotsWrap}>
          {[0, 1, 2].map(i => <View key={i} style={i === 1 ? shared.progressDotActive : shared.progressDot} />)}
        </View>
        <TouchableOpacity onPress={() => router.replace('/onboarding/role')} data-testid="demo2-skip">
          <Text style={st.skipTopText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 16 }}>
        <Animated.View style={[st.toast, { opacity: toastOp, transform: [{ translateY: toastY }] }]} pointerEvents="none">
          <View style={st.toastIcon}><Text style={{ fontSize: 14 }}>{'\uD83C\uDF3F'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.toastApp}>Reassura</Text>
            <Text style={st.toastMsg}>Jamie arrived home safely {'\uD83D\uDC99'}</Text>
          </View>
        </Animated.View>

        <View style={{ alignItems: 'center', width: '100%' }}>
          <TouchableOpacity onPress={handleTap} activeOpacity={0.95} data-testid="slide2-map-tap">
            <View style={st.mapBox}>
              {[0.25, 0.5, 0.75].map(p => <View key={`h${p}`} style={[st.gridH, { top: `${p * 100}%` }]} />)}
              {[0.2, 0.4, 0.6, 0.8].map(p => <View key={`v${p}`} style={[st.gridV, { left: `${p * 100}%` }]} />)}
              <Svg width={MAP_W} height={MAP_H} style={StyleSheet.absoluteFill}>
                <Path d={ROUTE_D} stroke="rgba(90,138,224,0.35)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="8,5" />
              </Svg>
              <View style={[st.mapMarker, { left: RX[0] - 12, top: RY[0] - 12 }]}>
                <Text style={{ fontSize: 14 }}>{'\uD83D\uDEB6'}</Text>
              </View>
              <View style={[st.mapMarker, { left: RX[4] - 12, top: RY[4] - 12 }]}>
                <Text style={{ fontSize: 14 }}>{'\uD83C\uDFE0'}</Text>
              </View>
              <Animated.View style={[st.walkDot, { left: dotLeft, top: dotTop }]}>
                <View style={st.walkDotCore} />
              </Animated.View>
              <View style={st.mapPillWrap}>
                <View style={st.mapPill}>
                  <View style={[st.mapPillDot, arrived && { backgroundColor: '#5E9070' }]} />
                  <Text style={st.mapPillText}>{arrived ? '\u2713 Arrived safely' : '\uD83D\uDEB6 Safe Walk \u00B7 Live'}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          {!tapped && (
            <Animated.View style={[st.tapPrompt, { transform: [{ scale: promptScale }] }]}>
              <Animated.View style={[st.tapPromptDot, { transform: [{ scale: promptDotScale }], opacity: promptDotOp }]} />
              <Text style={st.tapPromptText}>Tap the map {'\u2014'} watch the journey</Text>
            </Animated.View>
          )}
        </View>

        {tapped && (
          <Animated.View style={[st.successCard, { opacity: successOp, transform: [{ translateY: successTY }] }]}>
            <Text style={st.successMain}>Your circle just breathed out {'\uD83D\uDC99'}</Text>
            <Text style={st.successSub}>Everyone can relax now.</Text>
          </Animated.View>
        )}

        <View>
          <Text style={st.heading}>{heading}</Text>
          <Text style={st.sub}>{sub}</Text>
        </View>
      </View>

      <OnboardingMessages startIndex={1} />
      <View style={{ paddingHorizontal: 16 }}>
        <PrimaryButton label={'Next \u2192'} onPress={() => router.push('/onboarding/demo3')} color="blue" />
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

  mapBox: {
    width: MAP_W, height: MAP_H,
    backgroundColor: '#1A1612', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  mapMarker: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(26,22,18,0.85)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  walkDot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#5A8AE0', marginLeft: -7, marginTop: -7,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5A8AE0', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 6, elevation: 4,
  },
  walkDotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  mapPillWrap: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
  mapPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(45,64,112,0.55)', borderRadius: 12,
    paddingVertical: 5, paddingHorizontal: 12,
  },
  mapPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5A8AE0' },
  mapPillText: { fontFamily: ONBOARDING.bodyMed, color: '#8AAAE0', fontSize: 13 },

  tapPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#0F1520',
    borderColor: 'rgba(74,106,170,0.5)', borderWidth: 1.5,
    borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16,
    marginTop: -14, alignSelf: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
  tapPromptDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8AAAE0' },
  tapPromptText: { fontSize: 11.5, color: '#8AAAE0', fontFamily: ONBOARDING.bodyMed },

  successCard: {
    backgroundColor: 'rgba(61,90,153,0.1)', borderWidth: 1,
    borderColor: 'rgba(61,90,153,0.2)', borderRadius: 14,
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
