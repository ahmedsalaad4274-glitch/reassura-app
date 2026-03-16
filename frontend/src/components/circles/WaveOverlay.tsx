import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Modal } from 'react-native';
import * as Haptics from 'expo-haptics';

const SAGE_DK = '#4A7A5A';
const TERRA = '#C4704A';
const INK = '#0D0B09';
const CREAM = '#F7F3EE';
const SAGE = '#7A9E87';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active', steady: 'Steady', quiet: 'Quiet', offgrid: 'Off-grid',
};

const Button3D: React.FC<{
  label: string;
  baseColor: string;
  faceColor: string;
  textColor: string;
  isGlass?: boolean;
  onPress: () => void;
}> = ({ label, baseColor, faceColor, textColor, isGlass, onPress }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    Animated.spring(pressAnim, { toValue: 4, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, tension: 200, friction: 10 }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={s.btn3dWrap}
    >
      <View style={[s.btn3dBase, { backgroundColor: baseColor }]} />
      <Animated.View style={[
        s.btn3dFace,
        {
          backgroundColor: isGlass ? 'rgba(255,255,255,0.05)' : faceColor,
          borderColor: isGlass ? 'rgba(255,255,255,0.1)' : 'transparent',
          borderWidth: isGlass ? 1 : 0,
          transform: [{ translateY: pressAnim }],
        },
      ]}>
        <Text style={[s.btn3dText, { color: textColor }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface Props {
  visible: boolean;
  member: { name: string; emoji: string; status: string } | null;
  onClose: () => void;
  onWave: () => void;
}

export const WaveOverlay: React.FC<Props> = ({ visible, member, onClose, onWave }) => {
  if (!member) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet} onStartShouldSetResponder={() => true}>
          <View style={s.handle} />

          <View style={s.memberRow}>
            <View style={s.memberAvatar}>
              <Text style={{ fontSize: 28 }}>{member.emoji}</Text>
            </View>
            <Text style={s.memberName}>{member.name}</Text>
            <Text style={s.memberStatus}>{STATUS_LABELS[member.status] || 'Steady'}</Text>
          </View>

          <View style={s.buttonsCol}>
            <Button3D label="Send a Wave" baseColor="#3A6348" faceColor={SAGE_DK} textColor={CREAM} onPress={() => { onWave(); onClose(); }} />
            <Button3D label="Call me soon" baseColor="#8B4A30" faceColor={TERRA} textColor={CREAM} onPress={onClose} />
            <Button3D label="Custom" baseColor="transparent" faceColor="transparent" textColor="rgba(255,255,255,0.6)" isGlass onPress={onClose} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(13,11,9,0.82)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161412',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)', alignSelf: 'center', marginBottom: 24,
  },
  memberRow: { alignItems: 'center', marginBottom: 28 },
  memberAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(122,158,135,0.15)', borderWidth: 1.5, borderColor: SAGE,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  memberName: { fontFamily: 'Fraunces_700Bold', fontSize: 20, color: CREAM },
  memberStatus: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  buttonsCol: { gap: 12, marginBottom: 16 },
  btn3dWrap: { height: 56, position: 'relative' },
  btn3dBase: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, borderRadius: 16 },
  btn3dFace: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 48,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  btn3dText: { fontFamily: 'Fraunces_700Bold', fontSize: 15 },
});
