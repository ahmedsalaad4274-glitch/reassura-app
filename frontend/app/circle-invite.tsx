import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useInvites } from '../src/context/InviteContext';

export default function CircleInvite() {
  const router = useRouter();
  const params = useLocalSearchParams<{ circleId: string; circleName: string }>();
  const { theme, isDark } = useTheme();
  const { addInvite } = useInvites();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [sent, setSent] = useState(false);

  const circleId = params.circleId || '1';
  const circleName = params.circleName || 'your circle';

  const handleSend = () => {
    if (!name.trim()) return;
    addInvite(circleId, name.trim(), contact.trim() || 'No contact');
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={s.sentContent}>
          <Text style={s.sentEmoji}>{'\u{1F48C}'}</Text>
          <Text style={[s.sentHeading, { color: theme.textPrimary }]}>Invite sent!</Text>
          <Text style={[s.sentSub, { color: theme.textSecondary }]}>
            {name} will appear as pending in {circleName}.
          </Text>
          <TouchableOpacity
            style={[s.doneBtn, { backgroundColor: theme.sage }]}
            onPress={() => router.back()}
            testID="invite-done-button"
          >
            <Text style={s.doneBtnText}>Back to Circle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={s.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} testID="invite-back-button">
            <Text style={[s.backArrow, { color: theme.textPrimary }]}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={[s.title, { color: theme.textPrimary }]}>Invite to {circleName}</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[s.label, { color: theme.textPrimary }]}>Their name</Text>
            <TextInput
              style={[s.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="e.g. Auntie Bev"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              autoFocus
              testID="invite-name-input"
            />
          </View>

          <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[s.label, { color: theme.textPrimary }]}>Phone or email (optional)</Text>
            <TextInput
              style={[s.input, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="e.g. 07700 900123 or name@email.com"
              placeholderTextColor={theme.textSecondary}
              value={contact}
              onChangeText={setContact}
              keyboardType="email-address"
              testID="invite-contact-input"
            />
            <Text style={[s.hint, { color: theme.textTertiary }]}>
              We'll send them a link to join Reassura.
            </Text>
          </View>
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: name.trim() ? theme.sage : theme.border }]}
          onPress={handleSend}
          disabled={!name.trim()}
          testID="send-invite-button"
        >
          <Text style={[s.sendBtnText, { opacity: name.trim() ? 1 : 0.5 }]}>
            Send Invite {'\u{1F33F}'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  backArrow: { fontSize: 22, fontWeight: '600' },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 22, letterSpacing: -0.4 },
  form: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 14, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: 'DMSans_400Regular' },
  hint: { fontSize: 11, fontFamily: 'DMSans_400Regular', marginTop: 6 },
  sendBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  sendBtnText: { fontFamily: 'Fraunces_700Bold', fontSize: 16, color: '#FFFFFF' },
  // Sent state
  sentContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  sentEmoji: { fontSize: 56, marginBottom: 16 },
  sentHeading: { fontFamily: 'Fraunces_700Bold', fontSize: 26, letterSpacing: -0.4, marginBottom: 8, textAlign: 'center' },
  sentSub: { fontFamily: 'DMSans_400Regular', fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  doneBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  doneBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#FFFFFF' },
});
