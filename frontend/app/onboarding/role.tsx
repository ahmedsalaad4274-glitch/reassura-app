import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

const ROLES = [
  { emoji: '\ud83d\udc69\ud83c\udffe', name: 'Mum / Parent', desc: 'Keeping an eye on my family' },
  { emoji: '\ud83d\udc68\ud83c\udffe', name: 'Dad / Parent', desc: 'Keeping an eye on my family' },
  { emoji: '\ud83e\uddd1\ud83c\udffe', name: 'Son / Daughter', desc: 'Letting family know I\u2019m safe' },
  { emoji: '\ud83d\udc74\ud83c\udffe', name: 'Grandparent', desc: 'Staying connected with family' },
  { emoji: '\ud83d\udc6b\ud83c\udffe', name: 'Partner / Friend', desc: 'Staying close with someone I love' },
];

export default function RoleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  const handleContinue = async () => {
    if (selected === null) return;
    await AsyncStorage.setItem('reassura_user_role', ROLES[selected].name);
    router.push('/onboarding/avatar');
  };

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="role-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      {/* Progress dots */}
      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 0 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={shared.title}>How do you fit into your circle?</Text>
      <Text style={shared.subtitle}>Personalises your Reassura experience. Change anytime.</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {ROLES.map((role, idx) => {
          const active = selected === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelected(idx)}
              activeOpacity={0.7}
              data-testid={`role-card-${idx}`}
            >
              <Text style={styles.emoji}>{role.emoji}</Text>
              <View style={styles.textCol}>
                <Text style={styles.name}>{role.name}</Text>
                <Text style={styles.desc}>{role.desc}</Text>
              </View>
              <View style={[styles.check, active && styles.checkActive]}>
                {active && <Text style={styles.tick}>{'\u2713'}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Continue button */}
      <TouchableOpacity onPress={handleContinue} disabled={selected === null} activeOpacity={0.8} data-testid="role-continue-btn">
        <LinearGradient
          colors={selected !== null ? ['#5A8A6A', '#7A9E87'] : ['#333', '#444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[shared.btnPrimary, selected === null && { opacity: 0.4 }]}
        >
          <Text style={shared.btnPrimaryText}>Continue {'\u2192'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
  },
  cardActive: {
    borderColor: ONBOARDING.sage,
    backgroundColor: 'rgba(122,158,135,0.10)',
  },
  emoji: { fontSize: 22, marginRight: 12 },
  textCol: { flex: 1 },
  name: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 12 },
  desc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.45)', fontSize: 9, marginTop: 1 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: ONBOARDING.sage,
    borderColor: ONBOARDING.sage,
  },
  tick: { color: ONBOARDING.white, fontSize: 11, fontWeight: '700' },
});
