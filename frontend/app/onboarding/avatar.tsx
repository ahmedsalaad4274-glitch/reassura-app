import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

const EMOJIS = [
  '\ud83d\udc69\ud83c\udffe','\ud83d\udc69\ud83c\udfff','\ud83d\udc69\ud83c\udffd','\ud83d\udc69\ud83c\udffc',
  '\ud83d\udc68\ud83c\udffe','\ud83d\udc68\ud83c\udfff','\ud83d\udc68\ud83c\udffd','\ud83d\udc68\ud83c\udffc',
  '\ud83e\uddd1\ud83c\udffe','\ud83d\udc74\ud83c\udffe','\ud83d\udc75\ud83c\udffe','\ud83e\uddd2\ud83c\udffe',
];

export default function AvatarScreen() {
  const router = useRouter();
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const pinScale = useRef(new Animated.Value(1)).current;

  const animatePin = () => {
    Animated.sequence([
      Animated.timing(pinScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(pinScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setPhoto(null);
    animatePin();
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
      animatePin();
    }
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('reassura_user_avatar', photo || selectedEmoji);
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

      {/* Map Pin Preview */}
      <View style={styles.mapPreview}>
        {/* Hand-drawn map roads */}
        <View style={[styles.road, { top: '30%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.road, { top: '55%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.road, { top: '75%', left: 0, right: 0, height: 3 }]} />
        <View style={[styles.mainRoad, { top: '42%', left: 0, right: 0, height: 5 }]} />
        <View style={[styles.vRoad, { left: '25%', top: 0, bottom: 0, width: 3 }]} />
        <View style={[styles.vRoad, { left: '70%', top: 0, bottom: 0, width: 3 }]} />
        <View style={[styles.park, { top: 12, left: 14, width: 50, height: 32 }]} />
        <View style={[styles.park, { bottom: 14, right: 20, width: 44, height: 28 }]} />

        {/* Map Pin — teardrop */}
        <Animated.View style={[styles.pinWrap, { transform: [{ scale: pinScale }] }]}>
          <LinearGradient colors={['#3D6B50', '#7A9E87']} style={styles.teardrop}>
            <View style={styles.pinFace}>
              {photo ? (
                <View style={styles.pinPhoto}>
                  <Text style={{ fontSize: 22 }}>{selectedEmoji}</Text>
                </View>
              ) : (
                <Text style={styles.pinEmoji}>{selectedEmoji}</Text>
              )}
            </View>
          </LinearGradient>
          <View style={styles.pinShadow} />
        </Animated.View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Emoji grid */}
        <Text style={styles.sectionLabel}>CHOOSE YOUR EMOJI</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiCell, selectedEmoji === e && !photo && styles.emojiCellActive]}
              onPress={() => handleEmojiSelect(e)}
              data-testid={`emoji-${e}`}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <Text style={styles.divider}>{'\u2014'} or {'\u2014'}</Text>

        {/* Upload photo */}
        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} data-testid="upload-photo-btn">
          <Text style={styles.uploadText}>{'\ud83d\udcf7'} Upload a photo</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity onPress={handleContinue} activeOpacity={0.8} data-testid="avatar-continue-btn">
        <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
          <Text style={shared.btnPrimaryText}>Continue {'\u2192'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mapPreview: {
    height: 130,
    borderRadius: 14,
    backgroundColor: '#E4E0D6',
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.75)' },
  mainRoad: { position: 'absolute', backgroundColor: '#F0CD7A' },
  vRoad: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.75)' },
  park: { position: 'absolute', backgroundColor: '#BAD09A', borderRadius: 4 },
  pinWrap: { alignItems: 'center', zIndex: 10 },
  teardrop: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  pinFace: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pinEmoji: { fontSize: 22 },
  pinPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pinShadow: {
    width: 14,
    height: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    fontFamily: ONBOARDING.bodyMed,
    marginBottom: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiCell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiCellActive: {
    borderColor: ONBOARDING.sage,
    backgroundColor: 'rgba(122,158,135,0.15)',
  },
  emojiText: { fontSize: 20 },
  divider: {
    textAlign: 'center',
    fontSize: 9,
    color: 'rgba(255,255,255,0.25)',
    marginVertical: 14,
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(122,158,135,0.3)',
    backgroundColor: 'rgba(122,158,135,0.07)',
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontFamily: ONBOARDING.bodyMed,
    color: ONBOARDING.sage,
    fontSize: 12,
  },
});
