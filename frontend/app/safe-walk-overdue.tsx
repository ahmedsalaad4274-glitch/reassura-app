import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeWalk } from '../src/context/SafeWalkContext';

export default function SafeWalkOverdue() {
  const router = useRouter();
  const { theme } = useTheme();
  const { walk, dismissOverdue, markArrived } = useSafeWalk();

  const overdueMin = Math.max(0, Math.floor((Date.now() - (walk.startTime || 0)) / 60000) - walk.durationMin);

  const handleAllGood = () => {
    dismissOverdue('ok');
    markArrived();
    router.replace('/safe-walk-arrived');
  };

  const handleExtend = () => {
    dismissOverdue('extend');
    router.back();
  };

  const handleHelp = () => {
    dismissOverdue('help');
    router.back();
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.isDark ? 'rgba(196,112,74,0.08)' : 'rgba(196,112,74,0.06)' }]} edges={['top', 'bottom']}>
      <View style={s.content}>
        <Text style={s.icon}>{'\u26A0\uFE0F'}</Text>
        <Text style={[s.heading, { color: theme.textPrimary }]}>Your circle is checking on you</Text>
        <Text style={[s.sub, { color: theme.textSecondary }]}>
          You're {overdueMin} minute{overdueMin !== 1 ? 's' : ''} past your expected arrival time.
        </Text>

        <View style={s.buttons}>
          <TouchableOpacity style={[s.btn, s.btnGreen]} onPress={handleAllGood} testID="overdue-all-good">
            <Text style={s.btnGreenText}>All good, almost home {'\u{1F697}'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, s.btnBlue]} onPress={handleExtend} testID="overdue-extend">
            <Text style={s.btnBlueText}>Running late, 10 more mins {'\u23F1'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.btn, s.btnRed]} onPress={handleHelp} testID="overdue-help">
            <Text style={s.btnRedText}>I need help {'\u{1F6A8}'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  icon: { fontSize: 56, marginBottom: 20 },
  heading: { fontFamily: 'Fraunces_700Bold', fontSize: 24, letterSpacing: -0.4, textAlign: 'center', marginBottom: 10 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  buttons: { width: '100%', gap: 12 },
  btn: { borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, borderWidth: 1.5, alignItems: 'center' },
  btnGreen: { backgroundColor: 'rgba(122,158,135,0.1)', borderColor: 'rgba(122,158,135,0.35)' },
  btnGreenText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#5E9070' },
  btnBlue: { backgroundColor: 'rgba(74,106,170,0.08)', borderColor: 'rgba(74,106,170,0.25)' },
  btnBlueText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#4A6AAA' },
  btnRed: { backgroundColor: 'rgba(196,105,79,0.08)', borderColor: 'rgba(196,105,79,0.3)' },
  btnRedText: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: '#C4694F' },
});
