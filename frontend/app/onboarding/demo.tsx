import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

const { width: SCREEN_W } = Dimensions.get('window');

/* ═══════════════════════════════════════════
   Slide 1 — I'm Home
   ═══════════════════════════════════════════ */

const Slide1: React.FC<{ tapped: boolean; onTap: () => void }> = ({ tapped, onTap }) => {
  const floatY = useRef(new Animated.Value(0)).current;
  const promptOp = useRef(new Animated.Value(1)).current;
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
      Animated.timing(promptOp, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      Animated.timing(promptOp, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]));
    a1.start();
    a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, []);

  const handlePress = () => {
    if (tapped) return;
    onTap();
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

  return (
    <>
      <Animated.View style={[st.toast, { opacity: toastOp, transform: [{ translateY: toastY }] }]} pointerEvents="none">
        <View style={st.toastIcon}><Text style={{ fontSize: 14 }}>{'\uD83C\uDF3F'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={st.toastApp}>Reassura</Text>
          <Text style={st.toastMsg}>Mum is home safe {'\uD83C\uDFE0'}</Text>
        </View>
      </Animated.View>

      <View style={{ alignItems: 'center' }}>
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <TouchableOpacity onPress={handlePress} activeOpacity={0.85} data-testid="slide1-tap-btn">
            <View style={st.heroBtnOuter}>
              <Animated.View style={[st.rippleRing, { transform: [{ scale: ripple1Scale }], opacity: ripple1Op }]} />
              <Animated.View style={[st.rippleRing, { transform: [{ scale: ripple2Scale }], opacity: ripple2Op }]} />
              <LinearGradient colors={['#5E9070', '#3D6B50']} style={st.heroBtn}>
                {tapped
                  ? <Text style={st.heroBtnSent}>Sent! {'\u2713'}</Text>
                  : <>
                      <Text style={{ fontSize: 36 }}>{'\uD83C\uDFE0'}</Text>
                      <Text style={st.heroBtnLabel}>I'm Home</Text>
                    </>
                }
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Animated.View>
        {!tapped && (
          <Animated.Text style={[st.tapHint, { opacity: promptOp }]}>Tap it</Animated.Text>
        )}
      </View>

      {tapped && (
        <Animated.View style={[st.successCard, { opacity: successOp, transform: [{ translateY: successTY }] }]}>
          <Text style={st.successMain}>Your circle just got notified {'\uD83D\uDC9A'}</Text>
          <Text style={st.successSub}>That's all it takes. One tap.</Text>
        </Animated.View>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════
   Slide 2 — Safe Walk
   ═══════════════════════════════════════════ */

const MAP_H = 200;
const MAP_W = SCREEN_W - 32;
const RX = [MAP_W * 0.12, MAP_W * 0.12, MAP_W * 0.55, MAP_W * 0.55, MAP_W * 0.85];
const RY = [MAP_H * 0.82, MAP_H * 0.48, MAP_H * 0.48, MAP_H * 0.18, MAP_H * 0.18];
const ROUTE_D = `M ${RX[0]} ${RY[0]} L ${RX[1]} ${RY[1]} L ${RX[2]} ${RY[2]} L ${RX[3]} ${RY[3]} L ${RX[4]} ${RY[4]}`;

const Slide2: React.FC<{ tapped: boolean; onTap: () => void }> = ({ tapped, onTap }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [arrived, setArrived] = useState(false);
  const toastY = useRef(new Animated.Value(-60)).current;
  const toastOp = useRef(new Animated.Value(0)).current;
  const successOp = useRef(new Animated.Value(0)).current;
  const successTY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loopRef.current = Animated.loop(
      Animated.timing(progress, { toValue: 4, duration: 5000, useNativeDriver: false })
    );
    loopRef.current.start();
    return () => { loopRef.current?.stop(); };
  }, []);

  const handlePress = () => {
    if (tapped) return;
    onTap();
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

  return (
    <>
      <Animated.View style={[st.toast, { opacity: toastOp, transform: [{ translateY: toastY }] }]} pointerEvents="none">
        <View style={st.toastIcon}><Text style={{ fontSize: 14 }}>{'\uD83C\uDF3F'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={st.toastApp}>Reassura</Text>
          <Text style={st.toastMsg}>Jamie arrived home safely {'\uD83D\uDC99'}</Text>
        </View>
      </Animated.View>

      <TouchableOpacity onPress={handlePress} activeOpacity={0.95} data-testid="slide2-map-tap">
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

      {tapped && (
        <Animated.View style={[st.successCard, st.successBlue, { opacity: successOp, transform: [{ translateY: successTY }] }]}>
          <Text style={st.successMain}>Your circle just breathed out {'\uD83D\uDC99'}</Text>
          <Text style={st.successSub}>Everyone can relax now.</Text>
        </Animated.View>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════
   Slide 3 — Circle Feed
   ═══════════════════════════════════════════ */

const FEED = [
  { emoji: '\uD83D\uDC69\uD83C\uDFFE', text: 'Mum arrived home \uD83C\uDFE0', time: '2 min ago' },
  { emoji: '\uD83E\uDDD1\uD83C\uDFFE', text: 'Jamie is on the way \uD83D\uDE97', time: '18 min ago' },
  { emoji: '\uD83D\uDC68\uD83C\uDFFE', text: 'Dad \u00B7 All good \u2764\uFE0F', time: '1 hour ago' },
];

const Slide3: React.FC = () => {
  const ops = useRef(FEED.map(() => new Animated.Value(0))).current;
  const tys = useRef(FEED.map(() => new Animated.Value(16))).current;

  useEffect(() => {
    const anims = FEED.map((_, i) =>
      Animated.sequence([
        Animated.delay(i * 500),
        Animated.parallel([
          Animated.timing(ops[i], { toValue: 1, duration: 450, useNativeDriver: true }),
          Animated.timing(tys[i], { toValue: 0, duration: 450, useNativeDriver: true }),
        ]),
      ])
    );
    Animated.parallel(anims).start();
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ gap: 10 }}>
      {FEED.map((item, i) => (
        <Animated.View key={i} style={[st.feedCard, { opacity: ops[i], transform: [{ translateY: tys[i] }] }]} data-testid={`feed-card-${i}`}>
          <View style={st.feedAvatar}><Text style={{ fontSize: 22 }}>{item.emoji}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={st.feedText}>{item.text}</Text>
            <Text style={st.feedTime}>{item.time}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

/* ═══════════════════════════════════════════
   Slide configuration
   ═══════════════════════════════════════════ */

const SLIDES = [
  {
    gradient: ['#0D1F12', '#0B1810', '#0A0806'] as const,
    heading: "One tap. They know you\u2019re safe.",
    headingAfter: "That\u2019s what Reassura feels like.",
    sub: "The I\u2019m Home button tells your whole circle instantly \u2014 no message needed.",
    subAfter: 'Peace of mind, delivered.',
    btn: 'Next \u2192', color: 'sage' as const,
  },
  {
    gradient: ['#0D1220', '#0A0F1A', '#0A0806'] as const,
    heading: 'Walking home? Share your route.',
    headingAfter: "That\u2019s the relief Reassura gives.",
    sub: 'Safe Walk shares your live location until you arrive. Your circle watches in real time.',
    subAfter: 'Everyone can breathe.',
    btn: 'Next \u2192', color: 'blue' as const,
  },
  {
    gradient: ['#1A1408', '#141008', '#0A0806'] as const,
    heading: "Always know everyone\u2019s okay.",
    sub: "See live updates from your circle. Know when they arrive, when they\u2019re on the way, when they\u2019re safe.",
    btn: "Let\u2019s get started \uD83C\uDF3F", color: 'amber' as const,
  },
];

/* ═══════════════════════════════════════════
   Main Screen
   ═══════════════════════════════════════════ */

export default function DemoScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [tapped, setTapped] = useState([false, false, false]);
  const fadeOp = useRef(new Animated.Value(1)).current;
  const slideXA = useRef(new Animated.Value(0)).current;

  const goTo = (next: number) => {
    const dir = next > slide ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeOp, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slideXA, { toValue: -28 * dir, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setSlide(next);
      slideXA.setValue(28 * dir);
      Animated.parallel([
        Animated.timing(fadeOp, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideXA, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (slide < 2) goTo(slide + 1);
    else router.replace('/onboarding/role');
  };

  const tap = (i: number) => setTapped(p => { const n = [...p]; n[i] = true; return n; });

  const c = SLIDES[slide];
  const t = tapped[slide];
  const heading = t && (c as any).headingAfter ? (c as any).headingAfter : c.heading;
  const sub = t && (c as any).subAfter ? (c as any).subAfter : c.sub;

  return (
    <LinearGradient colors={[...c.gradient]} locations={[0, 0.4, 0.65]} style={[shared.container, shared.safeTop]}>
      <View style={shared.progressRow}>
        {[0, 1, 2].map(i => <View key={i} style={i === slide ? shared.progressDotActive : shared.progressDot} />)}
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeOp, transform: [{ translateX: slideXA }] }}>
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          {slide === 0 && <Slide1 tapped={tapped[0]} onTap={() => tap(0)} />}
          {slide === 1 && <Slide2 tapped={tapped[1]} onTap={() => tap(1)} />}
          {slide === 2 && <Slide3 />}

          <View style={{ paddingHorizontal: 4 }}>
            <Text style={st.heading} data-testid="demo-heading">{heading}</Text>
            <Text style={st.sub}>{sub}</Text>
          </View>
        </View>
      </Animated.View>

      <OnboardingMessages startIndex={0} />
      <View data-testid="demo-next">
        <PrimaryButton label={c.btn} onPress={handleNext} color={c.color} />
      </View>
      <TouchableOpacity style={shared.btnGhost} onPress={() => router.replace('/onboarding/role')} data-testid="demo-skip">
        <Text style={shared.btnGhostText}>Skip {'\u2192'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */

const st = StyleSheet.create({
  heading: {
    fontFamily: ONBOARDING.heading,
    color: '#fff',
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontFamily: ONBOARDING.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 21,
  },

  /* Toast notification */
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30,28,24,0.94)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(122,158,135,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastApp: {
    fontFamily: ONBOARDING.bodyBold,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  toastMsg: {
    fontFamily: ONBOARDING.bodyMed,
    color: '#fff',
    fontSize: 14,
    marginTop: 1,
  },

  /* Hero button — Slide 1 */
  heroBtnOuter: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtn: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#3D6B50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  heroBtnLabel: {
    fontFamily: ONBOARDING.bodyBold,
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  heroBtnSent: {
    fontFamily: ONBOARDING.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  rippleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(122,158,135,0.5)',
  },
  tapHint: {
    fontFamily: ONBOARDING.bodyMed,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },

  /* Success cards */
  successCard: {
    backgroundColor: 'rgba(122,158,135,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  successBlue: {
    backgroundColor: 'rgba(61,90,153,0.1)',
    borderColor: 'rgba(61,90,153,0.2)',
  },
  successMain: {
    fontFamily: ONBOARDING.bodyBold,
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: ONBOARDING.body,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },

  /* Map — Slide 2 */
  mapBox: {
    width: MAP_W,
    height: MAP_H,
    backgroundColor: '#1A1612',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(26,22,18,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5A8AE0',
    marginLeft: -7,
    marginTop: -7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5A8AE0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  walkDotCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  mapPillWrap: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(45,64,112,0.55)',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  mapPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5A8AE0',
  },
  mapPillText: {
    fontFamily: ONBOARDING.bodyMed,
    color: '#8AAAE0',
    fontSize: 13,
  },

  /* Feed cards — Slide 3 */
  feedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    borderRadius: 14,
    padding: 14,
  },
  feedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26,22,18,0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedText: {
    fontFamily: ONBOARDING.bodyMed,
    color: '#fff',
    fontSize: 15,
  },
  feedTime: {
    fontFamily: ONBOARDING.body,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
  },
});
