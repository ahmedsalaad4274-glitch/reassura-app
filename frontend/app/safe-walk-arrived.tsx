import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/context/ThemeContext';
import { useSafeWalk } from '../src/context/SafeWalkContext';

export default function SafeWalkArrived() {
  const router = useRouter();
  const { theme } = useTheme();
  const { walk, cancelWalk } = useSafeWalk();
  const bounceAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(bounceAnim, { toValue: 1.15, useNativeDriver: true, friction: 3 }),
      Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  }, []);

  const watcherNames = walk.watchers.filter(w => w.selected).map(w => w.name).join(', ');

  const handleDone = () => {
    cancelWalk();
    router.back();
  };

  return (
    <LinearGradient
      colors={['#E8F0EC', '#FDFAF7']}
      style={s.container}
    >
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <View style={s.content}>
          <Animated.Text style={[s.bigEmoji, { transform: [{ scale: bounceAnim }] }]}>
            {'\u{1F3E0}'}
          </Animated.Text>
          <Text style={s.heading}>You're home safe! {'\u{1F33F}'}</Text>
          <Text style={s.sub}>Your circle has been notified.</Text>
          <Text style={s.detail}>{watcherNames} notified {'\u00B7'} just now</Text>
          <Text style={s.muted}>Location sharing has stopped</Text>
        </View>

        <TouchableOpacity onPress={handleDone} activeOpacity={0.85} testID="safe-walk-done-button" style={s.btnWrap}>
          <LinearGradient
            colors={['#5E9070', '#3D6B50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.doneBtn}
          >
            <Text style={s.doneBtnText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  bigEmoji: { fontSize: 72, marginBottom: 20 },
  heading: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: '#3D2E22', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#5C4A3A', textAlign: 'center', marginBottom: 16 },
  detail: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: '#7A9E87', textAlign: 'center', marginBottom: 8 },
  muted: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: '#8C7B6E', textAlign: 'center' },
  btnWrap: { paddingHorizontal: 20, paddingBottom: 20 },
  doneBtn: {
    height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3D6B50', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 18,
  },
  doneBtnText: { fontFamily: 'Fraunces_700Bold', fontSize: 17, color: '#FFFFFF' },
});
