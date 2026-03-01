import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import OnboardingMessages from '../../src/components/OnboardingMessages';
import PrimaryButton from '../../src/components/PrimaryButton';

const EMOJIS = [
  '\ud83d\udc69\ud83c\udffe','\ud83d\udc69\ud83c\udfff','\ud83d\udc69\ud83c\udffd','\ud83d\udc69\ud83c\udffc',
  '\ud83d\udc68\ud83c\udffe','\ud83d\udc68\ud83c\udfff','\ud83d\udc68\ud83c\udffd','\ud83d\udc68\ud83c\udffc',
  '\ud83e\uddd1\ud83c\udffe','\ud83d\udc74\ud83c\udffe','\ud83d\udc75\ud83c\udffe','\ud83e\uddd2\ud83c\udffe',
];

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

export default function AvatarScreen() {
  const router = useRouter();
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [customEmoji, setCustomEmoji] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const pinScale = useRef(new Animated.Value(1)).current;

  const isCustomValid = customEmoji.length > 0 && EMOJI_REGEX.test(customEmoji);
  const displayEmoji = isCustomValid ? customEmoji : selectedEmoji;

  const animatePin = () => {
    Animated.sequence([
      Animated.timing(pinScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(pinScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setCustomEmoji('');
    setPhoto(null);
    animatePin();
  };

  const handleCustomChange = (text: string) => {
    setCustomEmoji(text);
    setPhoto(null);
    if (EMOJI_REGEX.test(text)) animatePin();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
      setCustomEmoji('');
      animatePin();
    }
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('reassura_user_avatar', photo || displayEmoji);
    router.push('/onboarding/permissions');
  };

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="avatar-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 1 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={shared.title}>How will your circle see you?</Text>
      <Text style={shared.subtitle}>This appears on the map and in updates.</Text>

      {/* Dark Map Pin Preview */}
      <View style={styles.mapPreview}>
        <View style={[styles.road, { top: '30%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.road, { top: '55%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.road, { top: '75%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.mainRoad, { top: '42%', left: 0, right: 0, height: 5 }]} />
        <View style={[styles.vRoad, { left: '25%', top: 0, bottom: 0, width: 3 }]} />
        <View style={[styles.vRoad, { left: '70%', top: 0, bottom: 0, width: 3 }]} />
        <View style={[styles.park, { top: 12, left: 14, width: 50, height: 32 }]} />
        <View style={[styles.park, { bottom: 14, right: 20, width: 44, height: 28 }]} />

        <Animated.View style={[styles.pinWrap, { transform: [{ scale: pinScale }] }]}>
          <View style={styles.pinOuter}>
            <LinearGradient colors={['#3D6B50', '#7A9E87']} style={styles.teardrop}>
              <View style={styles.pinFace}>
                <Text style={styles.pinEmoji}>{photo ? '\ud83d\udcf7' : displayEmoji}</Text>
              </View>
            </LinearGradient>
            <View style={styles.pinPoint} />
          </View>
          <View style={styles.pinShadow} />
        </Animated.View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>CHOOSE YOUR EMOJI</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiCell, selectedEmoji === e && !isCustomValid && !photo && styles.emojiCellActive]}
              onPress={() => handleEmojiSelect(e)}
              data-testid={`emoji-${e}`}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={[styles.customInput, isCustomValid && styles.customInputActive]}
          value={customEmoji}
          onChangeText={handleCustomChange}
          placeholder="Or type your own emoji..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          data-testid="custom-emoji-input"
        />

        <Text style={styles.divider}>{'\u2014'} or {'\u2014'}</Text>

        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} data-testid="upload-photo-btn">
          <Text style={styles.uploadText}>{'\ud83d\udcf7'} Upload a photo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Standardized footer: Messages > Button */}
      <OnboardingMessages startIndex={2} />
      <View data-testid="avatar-continue-btn">
        <PrimaryButton label={'Continue \u2192'} onPress={handleContinue} color="sage" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: {
    height: 130, borderRadius: 14,
    backgroundColor: '#1E1A16',
    overflow: 'hidden', marginBottom: 16,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },
  mainRoad: { position: 'absolute', backgroundColor: 'rgba(201,168,76,0.25)' },
  vRoad: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.06)' },
  park: { position: 'absolute', backgroundColor: 'rgba(122,158,135,0.15)', borderRadius: 4 },
  pinWrap: { alignItems: 'center', zIndex: 10 },
  pinOuter: { alignItems: 'center' },
  teardrop: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 3, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  pinPoint: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#7A9E87', marginTop: -3,
  },
  pinFace: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  pinEmoji: { fontSize: 22 },
  pinShadow: { width: 14, height: 6, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.60)',
    letterSpacing: 1, fontFamily: ONBOARDING.bodyMed, marginBottom: 10,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiCell: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  emojiCellActive: { borderColor: ONBOARDING.sage, backgroundColor: 'rgba(122,158,135,0.15)' },
  emojiText: { fontSize: 20 },
  customInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, padding: 10, marginTop: 12,
    fontFamily: ONBOARDING.body, color: ONBOARDING.white, fontSize: 14,
  },
  customInputActive: { borderColor: ONBOARDING.sage, backgroundColor: 'rgba(122,158,135,0.08)' },
  divider: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.60)', marginVertical: 14 },
  uploadBtn: {
    borderWidth: 1.5, borderColor: 'rgba(122,158,135,0.3)',
    backgroundColor: 'rgba(122,158,135,0.07)',
    borderRadius: 11, paddingVertical: 11, alignItems: 'center', marginBottom: 16,
  },
  uploadText: { fontFamily: ONBOARDING.bodyMed, color: ONBOARDING.sage, fontSize: 13 },
});
