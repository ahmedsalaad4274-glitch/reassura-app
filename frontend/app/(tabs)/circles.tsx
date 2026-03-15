import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../src/store/appStore';
import { circleApi, userApi } from '../../src/services/api';
import { OrbitCanvas } from '../../src/components/circles/OrbitCanvas';
import { BentoGrid } from '../../src/components/circles/BentoGrid';
import { WaveOverlay } from '../../src/components/circles/WaveOverlay';
import { Toast } from '../../src/components/Toast';

const { width } = Dimensions.get('window');
const IS_DARK = true;

function getStatusLabel(status: string): 'active' | 'steady' | 'quiet' {
  if (status === 'on_the_way' || status === 'travelling' || status === 'safe_walk') return 'active';
  if (status === 'home' || status === 'arrived' || status === 'all_good') return 'steady';
  if (status === 'offline' || status === 'goodnight') return 'quiet';
  return 'steady';
}

function getStatusSummary(members: any[]): string {
  const counts = { active: 0, steady: 0, quiet: 0 };
  members.forEach(m => { counts[getStatusLabel(m.status)]++; });
  if (counts.quiet > 0 && counts.active === 0) return `${counts.quiet} quiet`;
  if (counts.active > 0) return `${counts.active} active`;
  return 'All steady';
}

export default function CirclesScreen() {
  const { circles, users, setCircles, setUsers } = useAppStore();
  const [selectedCircleId, setSelectedCircleId] = React.useState<string | null>(null);
  const [waveTarget, setWaveTarget] = React.useState<any>(null);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastVis, setToastVis] = React.useState(false);

  // Create circle modal state (preserved from original)
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createStep, setCreateStep] = React.useState(1);
  const [newCircle, setNewCircle] = React.useState({
    name: '', emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}',
    color: COLORS.sageGreen, member_ids: [] as string[], privacy: 'invite_only',
  });
  const [showCelebration, setShowCelebration] = React.useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [circlesRes, usersRes] = await Promise.all([circleApi.getAll(), userApi.getAll()]);
      setCircles(circlesRes.data);
      setUsers(usersRes.data);
    } catch (error) { console.error('Error loading circles:', error); }
  };

  const getCircleMembers = (circleId: string) => {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) return [];
    return users.filter(u => circle.member_ids.includes(u.id));
  };

  const handleCreateCircle = async () => {
    try {
      await circleApi.create(newCircle);
      setShowCreateModal(false);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        setCreateStep(1);
        setNewCircle({ name: '', emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', color: COLORS.sageGreen, member_ids: [], privacy: 'invite_only' });
        loadData();
      }, 3000);
    } catch (error) { console.error('Error creating circle:', error); }
  };

  const toast = (msg: string) => { setToastMsg(msg); setToastVis(true); };

  const handleWave = () => {
    if (waveTarget) toast(`Wave sent to ${waveTarget.name}`);
  };

  // Determine view mode
  const hasMultiple = circles.length >= 2;
  const showGrid = hasMultiple && !selectedCircleId;
  const activeCircle = selectedCircleId
    ? circles.find(c => c.id === selectedCircleId)
    : circles.length === 1 ? circles[0] : null;

  const activeMembers = activeCircle ? getCircleMembers(activeCircle.id) : [];
  const orbitMembers = activeMembers.map(m => ({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    status: m.status,
    isOffGrid: m.status === 'offline' || m.status === 'goodnight',
  }));

  const gridCircles = circles.map(c => {
    const members = getCircleMembers(c.id);
    return {
      id: c.id, name: c.name, emoji: c.emoji, color: c.color,
      memberCount: members.length, statusSummary: getStatusSummary(members),
    };
  });

  const bg = IS_DARK ? '#0D0B09' : '#F7F3EE';
  const textColor = IS_DARK ? '#FFFFFF' : '#0D0B09';
  const mutedColor = IS_DARK ? 'rgba(255,255,255,0.4)' : 'rgba(13,11,9,0.4)';

  const emojiOptions = ['\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}', '\u{1F46B}', '\u{1F3E0}', '\u2708\uFE0F', '\u{1F4BC}', '\u{1F3C3}', '\u{1F30D}', '\u2764\uFE0F', '\u{1F6E1}\uFE0F', '\u{1F33F}'];
  const colorOptions = [COLORS.sageGreen, COLORS.terracotta, COLORS.gold, COLORS.navyBlue, '#8B5CF6', '#EC4899'];
  const nameChips = ['Family', 'Friends', 'Work', 'Travel Buddies', 'Emergency', 'Custom'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <Toast message={toastMsg} visible={toastVis} onHide={() => setToastVis(false)} type="success" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {selectedCircleId && hasMultiple && (
            <TouchableOpacity onPress={() => setSelectedCircleId(null)} data-testid="back-to-grid">
              <Ionicons name="arrow-back" size={22} color={textColor} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              {activeCircle ? activeCircle.name : 'Your Circles'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: mutedColor }]}>
              {activeCircle
                ? `${activeMembers.length} members \u00B7 ${getStatusSummary(activeMembers)}`
                : 'People who matter, connected'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} data-testid="create-circle-button">
            <Ionicons name="add-circle-outline" size={26} color={COLORS.sageGreen} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      {showGrid ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
          <BentoGrid circles={gridCircles} onSelect={setSelectedCircleId} isDark={IS_DARK} />

          {/* Add circle card */}
          <TouchableOpacity
            style={[styles.addCircleButton, { borderColor: IS_DARK ? 'rgba(122,158,135,0.2)' : 'rgba(122,158,135,0.3)' }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.sageGreen} />
            <Text style={[styles.addCircleText, { color: mutedColor }]}>Create a new circle</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : activeCircle ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <OrbitCanvas
            circleName={activeCircle.name}
            members={orbitMembers}
            onNodePress={(m) => setWaveTarget(m)}
            isDark={IS_DARK}
          />
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: mutedColor }]}>No circles yet</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.emptyBtnText}>Create your first circle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Wave Overlay */}
      <WaveOverlay
        visible={!!waveTarget}
        member={waveTarget}
        onClose={() => setWaveTarget(null)}
        onWave={handleWave}
        isDark={IS_DARK}
      />

      {/* Create Circle Modal — preserved */}
      <Modal visible={showCreateModal} animationType="slide" transparent statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.progressRow}>
              {[1, 2, 3, 4].map(step => (
                <View key={step} style={[styles.progressDot, createStep >= step && styles.progressDotActive]} />
              ))}
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => { setShowCreateModal(false); setCreateStep(1); }}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>

            {createStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>What's this circle called?</Text>
                <TextInput style={styles.input} placeholder="Circle name" placeholderTextColor={COLORS.muted}
                  value={newCircle.name} onChangeText={text => setNewCircle(prev => ({ ...prev, name: text.slice(0, 20) }))} maxLength={20} />
                <View style={styles.chipRow}>
                  {nameChips.map(chip => (
                    <TouchableOpacity key={chip} style={[styles.chip, newCircle.name === chip && styles.chipActive]}
                      onPress={() => setNewCircle(prev => ({ ...prev, name: chip }))}>
                      <Text style={[styles.chipText, newCircle.name === chip && styles.chipTextActive]}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.nextButton, !newCircle.name && styles.nextButtonDisabled]}
                  disabled={!newCircle.name} onPress={() => setCreateStep(2)}>
                  <Text style={styles.nextButtonText}>Next {'\u2192'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {createStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Give your circle a look</Text>
                <Text style={styles.stepLabel}>Choose an emoji</Text>
                <View style={styles.emojiRow}>
                  {emojiOptions.map(emoji => (
                    <TouchableOpacity key={emoji} style={[styles.emojiOption, newCircle.emoji === emoji && styles.emojiOptionActive]}
                      onPress={() => setNewCircle(prev => ({ ...prev, emoji }))}>
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.stepLabel}>Choose a color</Text>
                <View style={styles.colorRow}>
                  {colorOptions.map(color => (
                    <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }, newCircle.color === color && styles.colorOptionActive]}
                      onPress={() => setNewCircle(prev => ({ ...prev, color }))} />
                  ))}
                </View>
                <View style={[styles.previewCircle, { backgroundColor: newCircle.color }]}>
                  <Text style={styles.previewEmoji}>{newCircle.emoji}</Text>
                </View>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(1)}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.nextButton} onPress={() => setCreateStep(3)}>
                    <Text style={styles.nextButtonText}>Next {'\u2192'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {createStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Who's in this circle?</Text>
                {users.map(user => (
                  <TouchableOpacity key={user.id} style={styles.contactRow}
                    onPress={() => {
                      const ids = newCircle.member_ids.includes(user.id)
                        ? newCircle.member_ids.filter(id => id !== user.id) : [...newCircle.member_ids, user.id];
                      setNewCircle(prev => ({ ...prev, member_ids: ids }));
                    }}>
                    <Text style={styles.contactEmoji}>{user.emoji}</Text>
                    <Text style={styles.contactName}>{user.name}</Text>
                    <View style={[styles.checkbox, newCircle.member_ids.includes(user.id) && styles.checkboxActive]}>
                      {newCircle.member_ids.includes(user.id) && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                    </View>
                  </TouchableOpacity>
                ))}
                <Text style={styles.countText}>{newCircle.member_ids.length} people added</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(2)}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.nextButton, newCircle.member_ids.length === 0 && styles.nextButtonDisabled]}
                    disabled={newCircle.member_ids.length === 0} onPress={() => setCreateStep(4)}>
                    <Text style={styles.nextButtonText}>Next {'\u2192'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {createStep === 4 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Circle privacy</Text>
                {[
                  { value: 'invite_only', icon: 'lock-closed', label: 'Invite only (recommended)', recommended: true },
                  { value: 'members_can_invite', icon: 'people', label: 'Members can invite' },
                  { value: 'open', icon: 'globe', label: 'Open (not recommended)' },
                ].map(option => (
                  <TouchableOpacity key={option.value}
                    style={[styles.privacyOption, newCircle.privacy === option.value && styles.privacyOptionActive]}
                    onPress={() => setNewCircle(prev => ({ ...prev, privacy: option.value }))}>
                    <Ionicons name={option.icon as any} size={22} color={newCircle.privacy === option.value ? COLORS.sageGreen : COLORS.white} />
                    <Text style={[styles.privacyLabel, newCircle.privacy === option.value && styles.privacyLabelActive]}>{option.label}</Text>
                    {option.recommended && <View style={styles.recommendedBadge}><Text style={styles.recommendedText}>Recommended</Text></View>}
                  </TouchableOpacity>
                ))}
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(3)}><Text style={styles.backText}>{'\u2190'} Back</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.createButton} onPress={handleCreateCircle}>
                    <Text style={styles.createButtonText}>Create Circle {'\u{1F33F}'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} animationType="fade" transparent statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.celebrationOverlay}>
          <View style={[styles.celebrationCircle, { backgroundColor: newCircle.color }]}>
            <Text style={styles.celebrationEmoji}>{newCircle.emoji}</Text>
          </View>
          <Text style={styles.celebrationTitle}>{newCircle.name} circle created!</Text>
          <Text style={styles.celebrationSubtitle}>View my circle {'\u2192'}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: FONTS.headingBold, fontSize: 28 },
  headerSubtitle: { fontFamily: FONTS.body, fontSize: 14, marginTop: SPACING.xs },
  // Add circle
  addCircleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 16, paddingVertical: 16,
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 20,
  },
  addCircleText: { fontFamily: FONTS.body, fontSize: 14 },
  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 14 },
  emptyBtn: { backgroundColor: COLORS.sageGreen, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  emptyBtnText: { fontFamily: FONTS.bodyBold, color: '#0D0B09', fontSize: 14 },
  // Modal (preserved from original)
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: 'rgba(26,22,18,0.97)', borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, paddingBottom: SPACING.xxl, minHeight: '70%', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  modalClose: { position: 'absolute', top: SPACING.md, right: SPACING.md, zIndex: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.muted, marginHorizontal: 4 },
  progressDotActive: { backgroundColor: COLORS.sageGreen },
  stepContent: { flex: 1, marginTop: SPACING.md },
  stepTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 22, textAlign: 'center', marginBottom: SPACING.lg },
  stepLabel: { fontFamily: FONTS.bodyMedium, color: COLORS.muted, fontSize: 13, marginTop: SPACING.md, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.backgroundDark, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontFamily: FONTS.body, color: COLORS.white, fontSize: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md },
  chip: { backgroundColor: COLORS.backgroundDark, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  chipActive: { backgroundColor: COLORS.sageGreen },
  chipText: { fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 14 },
  chipTextActive: { color: COLORS.backgroundDark },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  emojiOption: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', margin: 4, borderRadius: 25, backgroundColor: COLORS.backgroundDark },
  emojiOptionActive: { borderWidth: 2, borderColor: COLORS.sageGreen },
  emojiText: { fontSize: 24 },
  colorRow: { flexDirection: 'row', justifyContent: 'center' },
  colorOption: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 8 },
  colorOptionActive: { borderWidth: 3, borderColor: COLORS.white },
  previewCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: SPACING.lg },
  previewEmoji: { fontSize: 28 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xl },
  backText: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 16 },
  nextButton: { backgroundColor: COLORS.sageGreen, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full },
  nextButtonDisabled: { opacity: 0.5 },
  nextButtonText: { fontFamily: FONTS.bodyBold, color: COLORS.backgroundDark, fontSize: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundDark },
  contactEmoji: { fontSize: 24, marginRight: SPACING.md },
  contactName: { flex: 1, fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 16 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.muted, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: COLORS.sageGreen, borderColor: COLORS.sageGreen },
  countText: { fontFamily: FONTS.body, color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: SPACING.md },
  privacyOption: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.backgroundDark, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm },
  privacyOptionActive: { borderWidth: 2, borderColor: COLORS.sageGreen },
  privacyLabel: { flex: 1, fontFamily: FONTS.bodyMedium, color: COLORS.white, fontSize: 15, marginLeft: SPACING.md },
  privacyLabelActive: { color: COLORS.sageGreen },
  recommendedBadge: { backgroundColor: COLORS.sageGreen, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm },
  recommendedText: { fontFamily: FONTS.body, color: COLORS.backgroundDark, fontSize: 10 },
  createButton: { backgroundColor: COLORS.sageGreen, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.full },
  createButtonText: { fontFamily: FONTS.bodyBold, color: COLORS.backgroundDark, fontSize: 16 },
  celebrationOverlay: { flex: 1, backgroundColor: COLORS.backgroundDark, justifyContent: 'center', alignItems: 'center' },
  celebrationCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  celebrationEmoji: { fontSize: 56 },
  celebrationTitle: { fontFamily: FONTS.headingBold, color: COLORS.white, fontSize: 24, textAlign: 'center' },
  celebrationSubtitle: { fontFamily: FONTS.body, color: COLORS.sageGreen, fontSize: 16, marginTop: SPACING.md },
});
