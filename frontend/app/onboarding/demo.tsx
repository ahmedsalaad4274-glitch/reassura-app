import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import { OnboardingMessages } from '../../src/components/OnboardingMessages';

const { width: SW } = Dimensions.get('window');

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
      {/* Route line */}
      <View style={s.routeLine} />
      {/* User pin */}
      <View style={s.miniPin}>
        <LinearGradient colors={['#2D4070','#3D5A99']} style={s.miniPinCircle}>
          <Text style={{ fontSize: 8 }}>{'\ud83d\udeb6'}</Text>
        </LinearGradient>
        <View style={s.miniPinPoint} />
      </View>
      {/* Home dest */}
      <View style={s.miniDest}><Text style={{ fontSize: 8 }}>{'\ud83c\udfe0'}</Text></View>
      {/* Badge */}
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

// ── Feature cards data ──
const SLIDES = [
  {
    preview: Slide1Preview,
    heading: "One tap. They know you're safe.",
    subtitle: "The I'm Home button tells your whole circle instantly \u2014 no message needed.",
    card: { emoji: '\ud83c\udfe0', name: "I'm Home", desc: 'One tap \u00B7 your circle gets a notification instantly', bg: 'rgba(122,158,135,0.08)', border: 'rgba(122,158,135,0.18)' },
    btn: 'Next \u2192',
  },
  {
    preview: Slide2Preview,
    heading: 'Walking home? Share your route.',
    subtitle: 'Safe Walk shares your live location until you arrive. Your circle watches in real time.',
    card: { emoji: '\ud83d\udeb6', name: 'Safe Walk', desc: 'Live location \u00B7 auto-stops when you arrive', bg: 'rgba(61,90,153,0.08)', border: 'rgba(61,90,153,0.18)' },
    btn: 'Next \u2192',
  },
  {
    preview: Slide3Preview,
    heading: "Always know everyone's okay.",
    subtitle: "See live updates from your circle. Know when they arrive, when they're on the way, when they're safe.",
    card: { emoji: '\ud83d\udc65', name: 'Circle updates', desc: 'Real time \u00B7 warm notifications \u00B7 no anxiety', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.18)' },
    btn: "Let's get started \ud83c\udf3f",
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
    <View style={[shared.container, shared.safeTop]}>
      {/* Skip */}
      <TouchableOpacity style={s.skip} onPress={() => router.replace('/onboarding/role')} data-testid="demo-skip">
        <Text style={s.skipText}>Skip {'\u2192'}</Text>
      </TouchableOpacity>

      {/* Progress */}
      <View style={shared.progressRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={i === slide ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
        {/* Phone preview */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideX }], alignItems: 'center' }}>
          <Preview />
        </Animated.View>

        {/* Heading */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideX }] }}>
          <Text style={s.heading}>{current.heading}</Text>
          <Text style={s.subtitle}>{current.subtitle}</Text>

          {/* Feature card */}
          <View style={[s.featureCard, { backgroundColor: current.card.bg, borderColor: current.card.border }]}>
            <LinearGradient
              colors={['rgba(61,107,80,0.7)', 'rgba(122,158,135,0.35)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.featureIconCircle}
            >
              <Text style={s.featureEmoji}>{current.card.emoji}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={s.featureName}>{current.card.name}</Text>
              <Text style={s.featureDesc}>{current.card.desc}</Text>
            </View>
          </View>
        </Animated.View>

        <OnboardingMessages />
      </ScrollView>

      {/* Button */}
      <TouchableOpacity onPress={handleNext} activeOpacity={0.8} data-testid="demo-next">
        <LinearGradient colors={slide === 2 ? ['#3D6B50', '#7A9E87'] : ['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
          <Text style={shared.btnPrimaryText}>{current.btn}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  skip: { position: 'absolute', top: 54, right: 16, zIndex: 10, padding: 8 },
  skipText: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: ONBOARDING.body },
  heading: { fontFamily: ONBOARDING.heading, color: '#fff', fontSize: 20, marginTop: 16, marginBottom: 4 },
  subtitle: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  featureCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 10, marginBottom: 4 },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  featureEmoji: { fontSize: 22 },
  featureName: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 12 },
  featureDesc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 1 },
  // Phone frame
  phone: { width: 170, height: 260, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', padding: 10, justifyContent: 'center', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12 },
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
  // Slide 2 mini map
  miniMap: { flex: 1, backgroundColor: '#1E1A16', borderRadius: 10, position: 'relative', overflow: 'hidden', minHeight: 190 },
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
  // Slide 3 notif cards
  miniNotifCard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 7, marginBottom: 5 },
  miniNotifText: { fontFamily: ONBOARDING.bodyMed, color: '#fff', fontSize: 6 },
  miniNotifTime: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.4)', fontSize: 5, marginTop: 1 },
});
