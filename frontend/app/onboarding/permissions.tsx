import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';
import FeatureIcon from '../../src/components/FeatureIcon';

const PERMISSIONS = [
  {
    icon: '\ud83d\udccd',
    name: 'Location \u00B7 While Using App only',
    desc: 'Only when you choose to share \u2014 during Safe Walk or check-in. Never tracked in the background. You control this completely.',
    iconColor: 'sage' as const,
  },
  {
    icon: '\ud83d\udd14',
    name: 'Notifications',
    desc: 'For circle updates, safe arrivals and emergency alerts only. Never marketing. Never ads.',
    iconColor: 'blue' as const,
  },
  {
    icon: '\ud83d\udeab',
    name: 'Bluetooth \u00B7 Not requested',
    desc: 'We don\u2019t need it. We will never ask for it.',
    iconColor: 'neutral' as const,
  },
];

export default function PermissionsScreen() {
  const router = useRouter();

  const handleAllow = async () => {
    if (Platform.OS !== 'web') {
      try {
        const Location = require('expo-location');
        await Location.requestForegroundPermissionsAsync();
      } catch {}
      try {
        const Notifications = require('expo-notifications');
        await Notifications.requestPermissionsAsync();
      } catch {}
    }
    router.push('/onboarding/add-home');
  };

  const handleSkip = () => {
    router.push('/onboarding/add-home');
  };

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="permissions-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 2 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={[shared.title, { textAlign: 'center' }]}>What Reassura needs from you</Text>
      <Text style={[shared.subtitle, { textAlign: 'center' }]}>Only the minimum. We{'\u2019'}ll tell you exactly why {'\u2014'} no small print.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {PERMISSIONS.map((p, idx) => (
          <View key={idx} style={styles.permCard} data-testid={`perm-card-${idx}`}>
            <FeatureIcon emoji={p.icon} color={p.iconColor} size={36} delay={idx * 200} />
            <View style={{ flex: 1 }}>
              <Text style={styles.permName}>{p.name}</Text>
              <Text style={styles.permDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Standardized footer: Messages > Button > Skip */}
      <OnboardingMessages startIndex={3} />
      <View data-testid="permissions-allow-btn">
        <PrimaryButton label={'Allow location & notifications \u2192'} onPress={handleAllow} color="sage" />
      </View>
      <TouchableOpacity style={shared.btnGhost} onPress={handleSkip} data-testid="permissions-skip-btn">
        <Text style={shared.btnGhostText}>Skip {'\u2014'} set up later in settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  permCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 13, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 14, paddingHorizontal: 14,
    marginBottom: 8, gap: 11,
  },
  permName: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13, marginBottom: 3 },
  permDesc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18 },
});
