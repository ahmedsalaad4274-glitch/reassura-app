import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useOnboardingStore } from '../../src/store/onboardingStore';

const INVITE_CODE = 'RIN\u00B72026';
const INVITE_MSG = 'I\u2019m using Reassura to stay connected with my circle \ud83c\udf3f\n\nJoin using my code: RIN\u00B72026\nDownload: reassura.app';

const METHODS = [
  { emoji: '\ud83d\udcac', label: 'iMessage', action: 'sms' },
  { emoji: '\ud83d\udcf1', label: 'WhatsApp', action: 'whatsapp' },
  { emoji: '\ud83d\udcf7', label: 'QR Code', action: 'qr' },
  { emoji: '\ud83d\udccb', label: 'Copy link', action: 'copy' },
];

export default function InviteScreen() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const setOnboardingComplete = useOnboardingStore(s => s.setComplete);

  const handleShare = async () => {
    try {
      await Share.share({ message: INVITE_MSG });
    } catch {}
  };

  const handleMethod = async (action: string) => {
    if (action === 'copy') {
      try { await navigator.clipboard.writeText(INVITE_MSG); } catch {}
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (action === 'sms') {
      window.open?.(`sms:?body=${encodeURIComponent(INVITE_MSG)}`);
    } else if (action === 'whatsapp') {
      window.open?.(`https://wa.me/?text=${encodeURIComponent(INVITE_MSG)}`);
    } else if (action === 'qr') {
      setShowQR(!showQR);
    }
  };

  const handleDone = () => {
    setOnboardingComplete(true);
    router.replace('/');
  };

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="invite-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={shared.progressDotActive} />
        ))}
      </View>

      <Text style={shared.title}>Invite your first person {'\ud83c\udf3f'}</Text>
      <Text style={shared.subtitle}>Share your code any way you like. They join your circle in seconds {'\u2014'} on their terms.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Invite Code Card */}
        <View style={styles.codeCard}>
          <View style={styles.codeGlow} />
          <Text style={styles.codeText}>{INVITE_CODE}</Text>
          <Text style={styles.codeHint}>Active for 7 days {'\u00B7'} one person at a time</Text>
        </View>

        {/* Consent Note */}
        <View style={styles.consentCard}>
          <Text style={styles.consentIcon}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.consentText}>
            The person you invite is in control. They choose to join.{'\n'}
            They only see your updates if they accept.{'\n'}
            You can remove anyone at any time.
          </Text>
        </View>

        {/* 4 Share Method Grid */}
        <View style={styles.methodGrid}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.action}
              style={styles.methodCard}
              onPress={() => handleMethod(m.action)}
              data-testid={`invite-method-${m.action}`}
            >
              <Text style={styles.methodEmoji}>{m.emoji}</Text>
              <Text style={styles.methodLabel}>
                {m.action === 'copy' && copied ? 'Copied!' : m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* QR Code display */}
        {showQR && (
          <View style={styles.qrBox}>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrCode}>{INVITE_CODE}</Text>
              <Text style={styles.qrHint}>Scan to join Rinade{'\u2019'}s circle</Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Standardized footer: Messages > Button > Skip */}
      <OnboardingMessages startIndex={0} />
      <View data-testid="invite-share-btn">
        <PrimaryButton label={'\ud83d\udce4 Share invite link'} onPress={handleShare} color="sage" />
      </View>
      <TouchableOpacity style={styles.doneBtn} onPress={handleDone} data-testid="invite-done-btn">
        <Text style={styles.doneText}>I{'\u2019'}m done sharing {'\u2192'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    backgroundColor: 'rgba(122,158,135,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(122,158,135,0.22)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  codeGlow: {
    position: 'absolute',
    top: -30,
    width: 120,
    height: 60,
    borderRadius: 60,
    backgroundColor: 'rgba(122,158,135,0.2)',
  },
  codeText: {
    fontFamily: ONBOARDING.heading,
    color: ONBOARDING.sage,
    fontSize: 28,
    letterSpacing: 5,
  },
  codeHint: {
    fontFamily: ONBOARDING.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.60)',
    marginTop: 6,
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 11,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  consentIcon: { fontSize: 14, marginTop: 1 },
  consentText: {
    flex: 1,
    fontFamily: ONBOARDING.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.60)',
    lineHeight: 17,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  methodCard: {
    width: '48%',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  methodEmoji: { fontSize: 18 },
  methodLabel: { fontFamily: ONBOARDING.bodyMed, fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  qrBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    fontFamily: ONBOARDING.heading,
    color: '#1A1612',
    fontSize: 18,
    letterSpacing: 3,
  },
  qrHint: { fontSize: 8, color: '#666', marginTop: 6 },
  doneBtn: { alignItems: 'center', paddingVertical: 10 },
  doneText: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.sage, fontSize: 13 },
});
