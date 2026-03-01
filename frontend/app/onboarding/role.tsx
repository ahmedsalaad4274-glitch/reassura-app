import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

const OTHER_IDX = 5;

const ROLES = [
  { emoji: '\ud83d\udc69\ud83c\udffe', name: 'Mum / Parent', desc: 'Keeping an eye on my family' },
  { emoji: '\ud83d\udc68\ud83c\udffe', name: 'Dad / Parent', desc: 'Keeping an eye on my family' },
  { emoji: '\ud83e\uddd1\ud83c\udffe', name: 'Son / Daughter', desc: 'Letting family know I\u2019m safe' },
  { emoji: '\ud83d\udc74\ud83c\udffe', name: 'Grandparent', desc: 'Staying connected with family' },
  { emoji: '\ud83d\udc6b\ud83c\udffe', name: 'Partner / Friend', desc: 'Staying close with someone I love' },
  { emoji: '\u270F\uFE0F', name: 'Other', desc: 'Define your own role' },
];

export default function RoleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);
  const [customRole, setCustomRole] = useState('');

  const isOther = selected === OTHER_IDX;
  const canContinue = selected !== null && (!isOther || customRole.trim().length > 0);

  const handleContinue = async () => {
    if (!canContinue) return;
    const roleName = isOther ? customRole.trim() : ROLES[selected!].name;
    await AsyncStorage.setItem('reassura_user_role', roleName);
    router.push('/onboarding/avatar');
  };

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="role-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 0 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={shared.title}>How do you fit into your circle?</Text>
      <Text style={shared.subtitle}>Personalises your Reassura experience. Change anytime.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {ROLES.map((role, idx) => {
          const active = selected === idx;
          return (
            <View key={idx} style={{ flex: 1 }}>
              <TouchableOpacity
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
              {idx === OTHER_IDX && active && (
                <TextInput
                  style={styles.customInput}
                  value={customRole}
                  onChangeText={setCustomRole}
                  placeholder="Type your role..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                  data-testid="custom-role-input"
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Standardized footer: Messages > Button */}
      <OnboardingMessages startIndex={1} />
      <View data-testid="role-continue-btn">
        <PrimaryButton label={'Continue \u2192'} onPress={handleContinue} color="sage" disabled={!canContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  name: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  desc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 },
  check: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: ONBOARDING.sage, borderColor: ONBOARDING.sage },
  tick: { color: ONBOARDING.white, fontSize: 11, fontWeight: '700' },
  customInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    marginBottom: 8, marginTop: -2,
    fontFamily: ONBOARDING.body, color: ONBOARDING.white, fontSize: 12,
  },
});
