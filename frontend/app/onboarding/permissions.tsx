import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

const PERMISSIONS = [
  {
    icon: '\ud83d\udccd',
    name: 'Location \u00B7 While Using App only',
    desc: 'Only when you choose to share \u2014 during Safe Walk or check-in. Never tracked in the background. You control this completely.',
    bg: 'rgba(122,158,135,0.07)',
    border: 'rgba(122,158,135,0.17)',
  },
  {
    icon: '\ud83d\udd14',
    name: 'Notifications',
    desc: 'For circle updates, safe arrivals and emergency alerts only. Never marketing. Never ads.',
    bg: 'rgba(61,90,153,0.07)',
    border: 'rgba(61,90,153,0.17)',
  },
  {
    icon: '\ud83d\udeab',
    name: 'Bluetooth \u00B7 Not requested',
    desc: 'We don\u2019t need it. We will never ask for it.',
    bg: 'rgba(255,255,255,0.02)',
    border: 'rgba(255,255,255,0.07)',
  },
];

export default function PermissionsScreen() {
  const router = useRouter();

  const handleAllow = async () => {
    // On native, request permissions here. On web, skip gracefully.
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

      {/* Hero emoji */}
      <Text style={styles.hero}>{'\ud83c\udf3f'}</Text>

      <Text style={[shared.title, { textAlign: 'center' }]}>What Reassura needs from you</Text>
      <Text style={[shared.subtitle, { textAlign: 'center' }]}>Only the minimum. We{'\u2019'}ll tell you exactly why {'\u2014'} no small print.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Permission cards */}
        {PERMISSIONS.map((p, idx) => (
          <View key={idx} style={[styles.permCard, { backgroundColor: p.bg, borderColor: p.border }]} data-testid={`perm-card-${idx}`}>
            <Text style={styles.permIcon}>{p.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.permName}>{p.name}</Text>
              <Text style={styles.permDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}

        {/* Privacy promise */}
        <View style={styles.promiseBox}>
          <Text style={styles.promiseIcon}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.promiseText}>
            We never sell your data. We never share it with advertisers.{'\n'}
            Location data auto-deletes after 24 hours.{'\n'}
            You can delete your account and all data in one tap.
          </Text>
        </View>
      </ScrollView>

      {/* Allow button */}
      <TouchableOpacity onPress={handleAllow} activeOpacity={0.8} data-testid="permissions-allow-btn">
        <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
          <Text style={shared.btnPrimaryText}>Allow location & notifications {'\u2192'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Skip link */}
      <TouchableOpacity style={shared.btnGhost} onPress={handleSkip} data-testid="permissions-skip-btn">
        <Text style={shared.btnGhostText}>Skip {'\u2014'} set up later in settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { fontSize: 32, textAlign: 'center', marginBottom: 10 },
  permCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 13,
    borderWidth: 1.5,
    padding: 13,
    marginBottom: 8,
    gap: 11,
  },
  permIcon: { fontSize: 20, marginTop: 1 },
  permName: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13, marginBottom: 3 },
  permDesc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 17 },
  promiseBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(122,158,135,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.15)',
    borderRadius: 11,
    padding: 12,
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  promiseIcon: { fontSize: 14, marginTop: 1 },
  promiseText: {
    flex: 1,
    fontFamily: ONBOARDING.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.42)',
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
