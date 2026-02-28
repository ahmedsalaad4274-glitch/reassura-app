import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';
import { OnboardingMessages } from '../../src/components/OnboardingMessages';

const { height: SCREEN_H } = Dimensions.get('window');
const STORAGE_KEY = 'reassura_saved_places';

const PLACE_EMOJIS = ['\ud83c\udfcb\ufe0f', '\ud83d\udcaa', '\ud83c\udfc3', '\ud83c\udfaf', '\ud83c\udf7d\ufe0f', '\ud83c\udfe5', '\ud83c\udf93', '\u2b50', '\ud83d\udccd', '\ud83d\uded2'];
const MOCK_SUGGESTIONS = ['Hackney, London', 'Shoreditch, London', 'Dalston, London', 'Clapton, Hackney', 'Islington, London', 'Bethnal Green'];

type SavedPlace = { key: string; emoji: string; label: string; neighbourhood: string };

export default function AddHomeScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Modal form state
  const [formName, setFormName] = useState('');
  const [formEmoji, setFormEmoji] = useState('\ud83d\udccd');
  const [formLocation, setFormLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [toast, setToast] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadPlaces(); }, []);

  const loadPlaces = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setPlaces(JSON.parse(stored));
    } catch {}
  };

  const savePlaces = async (updated: SavedPlace[]) => {
    setPlaces(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Modal animation
  useEffect(() => {
    if (showModal) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 200, useNativeDriver: true }).start();
    }
  }, [showModal]);

  const openAddModal = (idx?: number) => {
    if (idx !== undefined && idx !== null) {
      const p = places[idx];
      setFormName(p.label);
      setFormEmoji(p.emoji);
      setFormLocation(p.neighbourhood);
      setEditIdx(idx);
    } else {
      setFormName('');
      setFormEmoji('\ud83d\udccd');
      setFormLocation('');
      setEditIdx(null);
    }
    setSuggestions([]);
    setShowModal(true);
  };

  const handleLocationSearch = (text: string) => {
    setFormLocation(text);
    if (text.length >= 2) {
      setSuggestions(MOCK_SUGGESTIONS.filter(s => s.toLowerCase().includes(text.toLowerCase())).slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const pickSuggestion = (s: string) => {
    setFormLocation(s);
    setSuggestions([]);
  };

  const canSave = formName.trim().length > 0 && formLocation.trim().length > 0;

  const handleSavePlace = async () => {
    if (!canSave) return;
    const place: SavedPlace = { key: `place_${Date.now()}`, emoji: formEmoji, label: formName.trim(), neighbourhood: formLocation.trim() };
    let updated: SavedPlace[];
    if (editIdx !== null) {
      updated = [...places];
      updated[editIdx] = { ...updated[editIdx], emoji: formEmoji, label: formName.trim(), neighbourhood: formLocation.trim() };
    } else {
      updated = [...places, place];
    }
    await savePlaces(updated);
    setShowModal(false);
    // Flash animation on new item
    const newIdx = editIdx !== null ? editIdx : updated.length - 1;
    setFlashIdx(newIdx);
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 1200, useNativeDriver: false }).start(() => setFlashIdx(null));
    // Toast
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  const handleContinue = () => { router.push('/onboarding/invite'); };

  // Default slots that aren't saved yet
  const defaultSlots = [
    { emoji: '\ud83c\udfe0', label: 'Home', key: 'home' },
    { emoji: '\ud83d\udcbc', label: 'Work', key: 'work' },
  ];

  return (
    <View style={[shared.container, shared.safeTop]}>
      <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="home-back-btn">
        <Text style={shared.backText}>{'\u2190'}</Text>
      </TouchableOpacity>

      <View style={shared.progressRow}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={i === 3 ? shared.progressDotActive : shared.progressDot} />
        ))}
      </View>

      <Text style={shared.title}>Your saved places {'\ud83d\udccd'}</Text>
      <Text style={shared.subtitle}>Add up to 3 places so Reassura knows when you{'\u2019'}re somewhere familiar.</Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Default slots */}
        {defaultSlots.map((slot) => {
          const saved = places.find(p => p.key === slot.key);
          return (
            <View key={slot.key} style={[styles.slotCard, saved && styles.slotFilled]}>
              <Text style={styles.slotEmoji}>{slot.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                {saved ? (
                  <Text style={styles.slotNeighbourhood}>{saved.neighbourhood}</Text>
                ) : (
                  <Text style={styles.slotPlaceholder}>Tap to add</Text>
                )}
              </View>
              {saved ? (
                <TouchableOpacity onPress={() => openAddModal(places.indexOf(saved))}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.addCircle} onPress={() => {
                  setFormName(slot.label);
                  setFormEmoji(slot.emoji);
                  setFormLocation('');
                  setEditIdx(null);
                  setSuggestions([]);
                  // Pre-set key for default slot
                  setShowModal(true);
                }}>
                  <Text style={styles.addCircleText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Custom saved places */}
        {places.filter(p => p.key !== 'home' && p.key !== 'work').map((p, i) => {
          const realIdx = places.indexOf(p);
          const isFlash = flashIdx === realIdx;
          return (
            <Animated.View key={p.key} style={[styles.slotCard, styles.slotFilled, isFlash && { borderColor: flashAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(122,158,135,0.25)', 'rgba(122,158,135,0.8)'] }) }]}>
              <Text style={styles.slotEmoji}>{p.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{p.label}</Text>
                <Text style={styles.slotNeighbourhood}>{p.neighbourhood}</Text>
              </View>
              <TouchableOpacity onPress={() => openAddModal(realIdx)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* + Add another place */}
        {places.filter(p => p.key !== 'home' && p.key !== 'work').length < 1 && (
          <TouchableOpacity style={styles.addCard} onPress={() => openAddModal()}>
            <Text style={styles.addCardPlus}>+</Text>
            <Text style={styles.addCardText}>Add another place</Text>
          </TouchableOpacity>
        )}

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>{'\ud83c\udf3f'}</Text>
          <Text style={styles.infoText}>
            When you{'\u2019'}re at these places Reassura can suggest a quick check-in. Your circle will recognise where you are.
          </Text>
        </View>

        {/* Rotating messages fill the dead space */}
        <OnboardingMessages />
      </ScrollView>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}><Text style={styles.toastText}>Saved {'\ud83c\udf3f'}</Text></View>
      )}

      <TouchableOpacity onPress={handleContinue} activeOpacity={0.8}>
        <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
          <Text style={shared.btnPrimaryText}>Continue {'\u2192'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={shared.btnGhost} onPress={() => router.push('/onboarding/invite')}>
        <Text style={shared.btnGhostText}>Skip {'\u2014'} add later</Text>
      </TouchableOpacity>

      {/* ─── Add Place Modal ─── */}
      <Modal visible={showModal} transparent animationType="none" statusBarTranslucent onRequestClose={() => setShowModal(false)}>
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowModal(false)}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={1}>
              {/* Handle */}
              <View style={styles.handle} />

              <Text style={styles.sheetTitle}>Add a place</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Input 1 — Name */}
                <Text style={styles.inputLabel}>WHAT DO YOU CALL THIS PLACE?</Text>
                <TextInput
                  style={styles.textInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Gym, Mum\u2019s house, School..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />

                {/* Input 2 — Icon */}
                <Text style={styles.inputLabel}>CHOOSE AN ICON</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
                  {PLACE_EMOJIS.map(e => (
                    <TouchableOpacity key={e} style={[styles.emojiBtn, formEmoji === e && styles.emojiBtnActive]} onPress={() => setFormEmoji(e)}>
                      <Text style={{ fontSize: 18 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Input 3 — Location search */}
                <Text style={styles.inputLabel}>LOCATION</Text>
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={14} color="rgba(255,255,255,0.35)" />
                  <TextInput
                    style={styles.searchInput}
                    value={formLocation}
                    onChangeText={handleLocationSearch}
                    placeholder="Search address or postcode"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <View style={styles.suggestBox}>
                    {suggestions.map((s, i) => (
                      <TouchableOpacity key={i} style={styles.suggestRow} onPress={() => pickSuggestion(s)}>
                        <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Live preview */}
                {(formName.trim() || formLocation.trim()) ? (
                  <View style={styles.preview}>
                    <Text style={styles.previewEmoji}>{formEmoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.previewName}>{formName || 'Unnamed'}</Text>
                      <Text style={styles.previewLoc}>{formLocation || 'No location set'}</Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>

              {/* Save button */}
              <TouchableOpacity onPress={handleSavePlace} disabled={!canSave} activeOpacity={0.8} style={{ marginTop: 12 }}>
                <LinearGradient
                  colors={canSave ? ['#5A8A6A', '#7A9E87'] : ['#333', '#444']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[shared.btnPrimary, !canSave && { opacity: 0.4 }]}
                >
                  <Text style={shared.btnPrimaryText}>Save this place {'\u2192'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 8,
    gap: 12,
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(122,158,135,0.25)',
    backgroundColor: 'rgba(122,158,135,0.06)',
  },
  slotEmoji: { fontSize: 24 },
  slotLabel: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  slotNeighbourhood: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 1 },
  slotPlaceholder: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 1 },
  editText: { fontFamily: ONBOARDING.bodyMed, color: ONBOARDING.sage, fontSize: 12 },
  addCircle: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, borderColor: 'rgba(122,158,135,0.35)',
    backgroundColor: 'rgba(122,158,135,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  addCircleText: { color: ONBOARDING.sage, fontSize: 18, fontWeight: '300', marginTop: -1 },
  addCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 13, paddingVertical: 14, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: 'rgba(122,158,135,0.2)',
    backgroundColor: 'rgba(122,158,135,0.04)', marginBottom: 8,
  },
  addCardPlus: { color: ONBOARDING.sage, fontSize: 18, fontWeight: '300' },
  addCardText: { fontFamily: ONBOARDING.bodyMed, color: ONBOARDING.sage, fontSize: 12 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(122,158,135,0.06)', borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.15)', borderRadius: 11,
    padding: 12, gap: 10, marginTop: 4, marginBottom: 4,
  },
  infoIcon: { fontSize: 14, marginTop: 1 },
  infoText: { flex: 1, fontFamily: ONBOARDING.body, fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 17 },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: 'rgba(122,158,135,0.25)', borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.4)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  toastText: { fontFamily: ONBOARDING.bodyMed, color: ONBOARDING.sage, fontSize: 12 },
  // Modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'rgba(26,22,18,0.97)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 20, paddingBottom: 32, maxHeight: SCREEN_H * 0.85,
  },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: ONBOARDING.heading, color: ONBOARDING.white, fontSize: 17, marginBottom: 16 },
  inputLabel: { fontSize: 9, color: ONBOARDING.sage, letterSpacing: 1, fontFamily: ONBOARDING.bodyMed, marginBottom: 6, marginTop: 12 },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 11,
    paddingVertical: 11, paddingHorizontal: 13,
    fontFamily: ONBOARDING.body, color: ONBOARDING.white, fontSize: 13,
  },
  emojiRow: { gap: 6, paddingVertical: 4 },
  emojiBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5,
    borderColor: 'transparent', alignItems: 'center', justifyContent: 'center',
  },
  emojiBtnActive: { borderColor: 'rgba(122,158,135,0.5)', backgroundColor: 'rgba(122,158,135,0.12)' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 11,
    paddingVertical: 11, paddingHorizontal: 13,
  },
  searchInput: { flex: 1, fontFamily: ONBOARDING.body, color: ONBOARDING.white, fontSize: 13, padding: 0 },
  suggestBox: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  suggestText: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(122,158,135,0.07)', borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.2)', borderRadius: 11,
    padding: 12, marginTop: 14,
  },
  previewEmoji: { fontSize: 22 },
  previewName: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  previewLoc: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 },
});
