import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { FONTS } from '../../constants/theme';

const SAGE = '#7A9E87';
const SAGE_DK = '#4A7A5A';
const TERRA = '#C4704A';

interface Props {
  visible: boolean;
  member: { name: string; emoji: string } | null;
  onClose: () => void;
  onWave: () => void;
  isDark?: boolean;
}

const Button3D: React.FC<{
  label: string;
  baseColor: string;
  faceColor: string;
  textColor: string;
  isGlass?: boolean;
  onPress: () => void;
  isDark?: boolean;
}> = ({ label, baseColor, faceColor, textColor, isGlass, onPress, isDark = true }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  const faceTranslate = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={s.btn3dWrap}
    >
      {/* Base (shadow layer) */}
      <View style={[s.btn3dBase, { backgroundColor: baseColor }]} />
      {/* Face (depresses on press) */}
      <Animated.View style={[
        s.btn3dFace,
        {
          backgroundColor: isGlass ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)') : faceColor,
          borderColor: isGlass ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)') : 'transparent',
          borderWidth: isGlass ? 1 : 0,
          transform: [{ translateY: faceTranslate }],
        },
      ]}>
        <Text style={[s.btn3dText, { color: textColor }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const WaveOverlay: React.FC<Props> = ({ visible, member, onClose, onWave, isDark = true }) => {
  if (!member) return null;

  const bg = isDark ? 'rgba(13,11,9,0.95)' : 'rgba(247,243,238,0.95)';
  const textColor = isDark ? '#FFFFFF' : '#0D0B09';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,11,9,0.4)';

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
          <View style={[s.sheet, { backgroundColor: bg }]} onStartShouldSetResponder={() => true}>
            <View style={s.handle} />

            <View style={s.memberRow}>
              <View style={s.memberAvatar}>
                <Text style={{ fontSize: 28 }}>{member.emoji}</Text>
              </View>
              <Text style={[s.memberName, { color: textColor }]}>{member.name}</Text>
            </View>

            <View style={s.buttonsCol}>
              <Button3D
                label="Send a Wave"
                baseColor="#3A6348"
                faceColor={SAGE_DK}
                textColor="#FFFFFF"
                onPress={() => { onWave(); onClose(); }}
                isDark={isDark}
              />
              <Button3D
                label="Call me soon"
                baseColor="#8B4A30"
                faceColor={TERRA}
                textColor="#FFFFFF"
                onPress={onClose}
                isDark={isDark}
              />
              <Button3D
                label="Custom"
                baseColor="transparent"
                faceColor="transparent"
                textColor={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(13,11,9,0.7)'}
                isGlass
                onPress={onClose}
                isDark={isDark}
              />
            </View>

            <TouchableOpacity style={s.dismissBtn} onPress={onClose}>
              <Text style={[s.dismissText, { color: mutedColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.5, shadowRadius: 16,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20,
  },
  memberRow: { alignItems: 'center', marginBottom: 24 },
  memberAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(122,158,135,0.1)', borderWidth: 1.5, borderColor: SAGE,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  memberName: { fontFamily: FONTS.headingBold, fontSize: 18 },
  buttonsCol: { gap: 12, marginBottom: 16 },
  btn3dWrap: { height: 56, position: 'relative' },
  btn3dBase: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, borderRadius: 16 },
  btn3dFace: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 48,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  btn3dText: { fontFamily: FONTS.headingBold, fontSize: 15 },
  dismissBtn: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { fontSize: 14 },
});
