import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';
import FeatureIcon from '../../src/components/FeatureIcon';

// ── Mini phone previews ──

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={s.phone}>{children}</View>
);

const Slide1Preview = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseOp = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(pulse, { toValue: 1.3, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseOp, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseOp, { toValue: 0.8, duration: 750, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <PhoneFrame>
      <Text style={s.miniGreeting}>Good evening, Rinade {'\ud83d\udc4b\ud83c\udffe'}</Text>
      <View style={s.miniHomeBtn}>
        <LinearGradient colors={['#3D6B50','#7A9E87']} style={s.miniHomeBtnInner}>
          <Text style={{ fontSize: 14 }}>{'\ud83c\udfe0'}</Text>
          <Text style={s.miniHomeBtnText}>I'm Home</Text>
        </LinearGradient>
        <Animated.View style={[s.tapIndicator, { transform: [{ scale: pulse }], opacity: pulseOp }]} />
      </View>
      <View style={s.miniPillRow}>
        <View style={s.miniPill}><Text style={s.miniPillText}>{'\ud83d\udeb6'} Safe Walk</Text></View>
        <View style={s.miniPill}><Text style={s.miniPillText}>{'\ud83c\udf19'} Night</Text></View>
        <View style={s.miniPill}><Text style={s.miniPillText}>{'\ud83d\udc9a'} Check In</Text></View>
      </View>
      <View style={s.miniAvatarRow}>
        {['\ud83d\udc69\ud83c\udffe','\ud83d\udc68\ud83c\udffe','\ud83e\uddd1\ud83c\udffe'].map((e,i) => (
          <View key={i} style={s.miniAvatar}><Text style={{ fontSize: 12 }}>{e}</Text></View>
        ))}
      </View>
    </PhoneFrame>
  );
};

const Slide2Preview = () => (
  <PhoneFrame>
    <View style={s.miniMap}>
      <View style={[s.miniMapRoad, { top: '30%' }]} />
      <View style={[s.miniMapRoad, { top: '60%' }]} />
      <View style={[s.miniMapVRoad, { left: '30%' }]} />
      <View style={[s.miniMapVRoad, { left: '65%' }]} />
      <View style={s.routeLine} />
      <View style={s.miniPin}>
        <LinearGradient colors={['#2D4070','#3D5A99']} style={s.miniPinCircle}>
          <Text style={{ fontSize: 8 }}>{'\ud83d\udeb6'}</Text>
        </LinearGradient>
        <View style={s.miniPinPoint} />
      </View>
      <View style={s.miniDest}><Text style={{ fontSize: 8 }}>{'\ud83c\udfe0'}</Text></View>
      <View style={s.miniMapBadge}>
        <View style={s.miniMapDot} />
        <Text style={s.miniMapBadgeText}>Safe Walk {'\u00B7'} Live</Text>
      </View>
    </View>
  </PhoneFrame>
);

const Slide3Preview = () => {
  const cards = [
    { e: '\ud83d\udc69\ud83c\udffe', text: 'Mum arrived home \ud83c\udfe0', time: '2 min ago' },
    { e: '\ud83e\uddd1\ud83c\udffe', text: 'Jamie is on the way \ud83d\ude97', time: '18 min ago' },
    { e: '\ud83d\udc68\ud83c\udffe', text: 'Dad \u00B7 All good \u2764\ufe0f', time: '1 hour ago' },
  ];
  return (
    <PhoneFrame>
      {cards.map((c, i) => (
        <View key={i} style={s.miniNotifCard}>
          <Text style={{ fontSize: 12 }}>{c.e}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.miniNotifText}>{c.text}</Text>
            <Text style={s.miniNotifTime}>{c.time}</Text>
          </View>
        </View>
      ))}
    </PhoneFrame>
  );
};

// ── Slide data with per-slide colours ──
const SLIDES = [
  {
    preview: Slide1Preview,
    heading: "One tap. They know you're safe.",
    subtitle: "The I'm Home button tells your whole circle instantly \u2014 no message needed.",
    card: { emoji: '\ud83c\udfe0', name: "I'm Home", desc: 'One tap \u00B7 your circle gets a notification instantly', iconColor: 'sage' as const },
    btn: 'Next \u2192',
    gradient: ['#0D1F12', '#0B1810', '#0A0806'],
    glowColor: 'rgba(122,158,135,0.14)',
    cardBorder: 'rgba(122,158,135,0.22)',
    cardBg: 'rgba(122,158,135,0.07)',
  },
  {
    preview: Slide2Preview,
    heading: 'Walking home? Share your route.',
    subtitle: 'Safe Walk shares your live location until you arrive. Your circle watches in real time.',
    card: { emoji: '\ud83d\udeb6', name: 'Safe Walk', desc: 'Live location \u00B7 auto-stops when you arrive', iconColor: 'blue' as const },
    btn: 'Next \u2192',
    gradient: ['#0D1220', '#0A0F1A', '#0A0806'],
    glowColor: 'rgba(61,90,153,0.14)',
    cardBorder: 'rgba(61,90,153,0.22)',
    cardBg: 'rgba(61,90,153,0.07)',
  },
  {
    preview: Slide3Preview,
    heading: "Always know everyone's okay.",
    subtitle: "See live updates from your circle. Know when they arrive, when they're on the way, when they're safe.",
    card: { emoji: '\ud83d\udc65', name: 'Circle updates', desc: 'Real time \u00B7 warm notifications \u00B7 no anxiety', iconColor: 'amber' as const },
    btn: "Let's get started \ud83c\udf3f",
    gradient: ['#1A1408', '#141008', '#0A0806'],
    glowColor: 'rgba(201,168,76,0.12)',
    cardBorder: 'rgba(201,168,76,0.22)',
    cardBg: 'rgba(201,168,76,0.07)',
  },
];

export default function DemoScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  const animateTo = (next: number) => {
    const dir = next > slide ? 1 : -1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: -30 * dir, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setSlide(next);
      slideX.setValue(30 * dir);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideX, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (slide < 2) animateTo(slide + 1);
    else router.replace('/onboarding/role');
  };

  const current = SLIDES[slide];
  const Preview = current.preview;

  return (
    <LinearGradient
      colors={current.gradient}
      locations={[0, 0.4, 0.65]}
      style={[shared.container, shared.safeTop]}
    >
      <View style={shared.progressRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={i === slide ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 16 }}>
          {/* Phone preview with ambient glow */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideX }], alignItems: 'center' }}>
            <View style={s.phoneWrap}>
              <View style={[s.phoneGlow, { backgroundColor: current.glowColor }]} />
              <View style={{ zIndex: 1 }}>
                <Preview />
              </View>
            </View>
          </Animated.View>

          {/* Heading + feature card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideX }] }}>
            <Text style={shared.title}>{current.heading}</Text>
            <Text style={shared.subtitle}>{current.subtitle}</Text>

            <View style={[s.featureCard, { borderColor: current.cardBorder, backgroundColor: current.cardBg }]}>
              <FeatureIcon emoji={current.card.emoji} color={current.card.iconColor} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={s.featureName}>{current.card.name}</Text>
                <Text style={s.featureDesc}>{current.card.desc}</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Standardized footer */}
      <OnboardingMessages startIndex={0} />
      <View data-testid="demo-next">
        <PrimaryButton label={current.btn} onPress={handleNext} color="sage" />
      </View>
      <TouchableOpacity style={shared.btnGhost} onPress={() => router.replace('/onboarding/role')} data-testid="demo-skip">
        <Text style={shared.btnGhostText}>Skip {'\u2192'}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  phoneWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  phoneGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, zIndex: 0 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 10, marginBottom: 4,
  },
  featureName: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 13 },
  featureDesc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 1 },
  phone: { width: 160, height: 195, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', padding: 10, justifyContent: 'center', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
  miniGreeting: { fontFamily: ONBOARDING.bodyMed, color: '#fff', fontSize: 7, marginBottom: 6 },
  miniHomeBtn: { alignItems: 'center', marginBottom: 6, position: 'relative' },
  miniHomeBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  miniHomeBtnText: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 7 },
  tapIndicator: { position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#fff' },
  miniPillRow: { flexDirection: 'row', gap: 3, marginBottom: 6, justifyContent: 'center' },
  miniPill: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 4, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  miniPillText: { fontSize: 5, color: 'rgba(255,255,255,0.6)' },
  miniAvatarRow: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  miniAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: ONBOARDING.sage, backgroundColor: 'rgba(26,22,18,0.8)', alignItems: 'center', justifyContent: 'center' },
  miniMap: { flex: 1, backgroundColor: '#1E1A16', borderRadius: 10, position: 'relative', overflow: 'hidden', minHeight: 140 },
  miniMapRoad: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  miniMapVRoad: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  routeLine: { position: 'absolute', top: '25%', left: '35%', width: 3, height: '50%', backgroundColor: 'rgba(61,90,153,0.5)', borderRadius: 2, transform: [{ rotate: '15deg' }] },
  miniPin: { position: 'absolute', top: '20%', left: '32%', alignItems: 'center' },
  miniPinCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  miniPinPoint: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#3D5A99', marginTop: -1 },
  miniDest: { position: 'absolute', bottom: '22%', right: '30%', width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: ONBOARDING.sage, backgroundColor: 'rgba(26,22,18,0.8)', alignItems: 'center', justifyContent: 'center' },
  miniMapBadge: { position: 'absolute', bottom: 6, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(61,90,153,0.25)', borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6 },
  miniMapDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#5A8AE0' },
  miniMapBadgeText: { fontSize: 5, color: '#8AAAE0', fontFamily: ONBOARDING.bodyMed },
  miniNotifCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 7, marginBottom: 5 },
  miniNotifText: { fontFamily: ONBOARDING.bodyMed, color: '#fff', fontSize: 6 },
  miniNotifTime: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.4)', fontSize: 5, marginTop: 1 },
});
