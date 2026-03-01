import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

export default function Demo3Screen() {
  const router = useRouter();
  const cardOp = useRef(new Animated.Value(0)).current;
  const cardTY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(cardTY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#1A1408', '#141008', '#0A0806']} locations={[0, 0.4, 0.65]} style={st.root}>
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => router.back()} data-testid="demo3-back">
          <Text style={st.backArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <View style={st.dotsWrap}>
          {[0, 1, 2].map(i => <View key={i} style={i === 2 ? shared.progressDotActive : shared.progressDot} />)}
        </View>
        <TouchableOpacity onPress={() => router.replace('/onboarding/role')} data-testid="demo3-skip">
          <Text style={st.skipTopText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'space-evenly', paddingHorizontal: 16 }}>
        <Animated.View style={[st.connectionCard, { opacity: cardOp, transform: [{ translateY: cardTY }] }]}>
          <Text style={st.cardHeader}>YOUR CIRCLE</Text>
          <Text style={st.cardDesc}>The people you choose to stay connected with. That{'\u2019'}s it.</Text>

          <View style={st.connRow}>
            <View style={st.youCol}>
              <LinearGradient colors={['#3D6B50', '#7A9E87']} style={st.youAvatar}>
                <Text style={{ fontSize: 20 }}>{'\uD83D\uDE0A'}</Text>
              </LinearGradient>
              <Text style={st.youLabel}>You</Text>
            </View>

            <LinearGradient
              colors={['rgba(201,168,76,0.5)', 'rgba(201,168,76,0.2)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={st.connLine}
            />

            <View style={st.familyCol}>
              <View style={st.familyItem}>
                <LinearGradient colors={['#2A3D70', '#4A6AAA']} style={[st.familyAvatar, { borderColor: 'rgba(74,106,170,0.5)' }]}>
                  <Text style={{ fontSize: 14 }}>{'\uD83D\uDC69\uD83C\uDFFE'}</Text>
                </LinearGradient>
                <Text style={st.familyLabel}>Mum</Text>
              </View>
              <View style={st.familyItem}>
                <LinearGradient colors={['#8A6A20', '#C9A84C']} style={[st.familyAvatar, { borderColor: 'rgba(201,168,76,0.5)' }]}>
                  <Text style={{ fontSize: 14 }}>{'\uD83D\uDC68\uD83C\uDFFE'}</Text>
                </LinearGradient>
                <Text style={st.familyLabel}>Dad</Text>
              </View>
              <View style={st.familyItem}>
                <LinearGradient colors={['#3D4A2A', '#6A8050']} style={[st.familyAvatar, { borderColor: 'rgba(100,130,70,0.5)' }]}>
                  <Text style={{ fontSize: 14 }}>{'\uD83E\uDDD1\uD83C\uDFFE'}</Text>
                </LinearGradient>
                <Text style={st.familyLabel}>Jamie</Text>
              </View>
            </View>
          </View>

          <View style={st.chipsBox}>
            <Text style={st.chipsLabel}>They see when you{'\u2019'}re safe. You see when they are.</Text>
            <View style={st.chipsRow}>
              <View style={[st.chip, st.chipSage]}><Text style={st.chipTxtSage}>{'\u2713'} Arrived home</Text></View>
              <View style={[st.chip, st.chipBlue]}><Text style={st.chipTxtBlue}>{'\uD83D\uDEB6'} Walking</Text></View>
              <View style={[st.chip, st.chipAmber]}><Text style={st.chipTxtAmber}>{'\u2764\uFE0F'} All good</Text></View>
            </View>
          </View>
        </Animated.View>

        <View>
          <Text style={st.heading}>Always know everyone{'\u2019'}s okay.</Text>
          <Text style={st.sub}>Your circle is the people you invite {'\u2014'} family, a partner, a friend. They see your status. You see theirs. No one else. Ever.</Text>
        </View>
      </View>

      <OnboardingMessages startIndex={2} />
      <View style={{ paddingHorizontal: 16 }}>
        <PrimaryButton label={"Let\u2019s get started \uD83C\uDF3F"} onPress={() => router.push('/onboarding/role')} color="amber" />
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

  connectionCard: {
    width: '100%',
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderColor: 'rgba(201,168,76,0.2)', borderWidth: 1.5,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 6,
  },
  cardHeader: {
    fontSize: 11, color: 'rgba(201,168,76,0.8)',
    fontFamily: ONBOARDING.bodyMed, letterSpacing: 0.5,
    textAlign: 'center', marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12, color: 'rgba(255,255,255,0.45)',
    fontFamily: ONBOARDING.body, textAlign: 'center',
    lineHeight: 17, marginBottom: 14,
  },

  connRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 14,
  },
  youCol: { alignItems: 'center' },
  youAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#7A9E87',
    shadowColor: 'rgba(122,158,135,0.4)',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1,
    shadowRadius: 16, elevation: 4,
  },
  youLabel: { fontSize: 9, color: '#7A9E87', fontFamily: ONBOARDING.bodyMed, marginTop: 4 },
  connLine: { flex: 1, height: 1, marginHorizontal: 10 },
  familyCol: { gap: 6 },
  familyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  familyAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  familyLabel: { fontSize: 8.5, color: 'rgba(255,255,255,0.4)', fontFamily: ONBOARDING.body },

  chipsBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8,
  },
  chipsLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.35)',
    fontFamily: ONBOARDING.bodyMed, marginBottom: 5, textAlign: 'center',
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' },
  chip: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  chipSage: { backgroundColor: 'rgba(122,158,135,0.15)' },
  chipBlue: { backgroundColor: 'rgba(74,106,170,0.15)' },
  chipAmber: { backgroundColor: 'rgba(201,168,76,0.15)' },
  chipTxtSage: { fontSize: 9.5, color: '#7A9E87' },
  chipTxtBlue: { fontSize: 9.5, color: '#8AAAE0' },
  chipTxtAmber: { fontSize: 9.5, color: '#C9A84C' },

  heading: {
    fontFamily: ONBOARDING.heading, color: '#fff', fontSize: 24,
    lineHeight: 32, textAlign: 'center', marginBottom: 6,
  },
  sub: {
    fontFamily: ONBOARDING.body, fontSize: 13,
    color: 'rgba(255,255,255,0.52)', textAlign: 'center', lineHeight: 20,
  },
});
