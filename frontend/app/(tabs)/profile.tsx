import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Image,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useAuthStore, SavedPlace } from '../../src/store/authStore';
import { userApi } from '../../src/services/api';
import { useTheme } from '../../src/context/ThemeContext';
import { ThemeToggle } from '../../src/components/ThemeToggle';

const { width: SCREEN_W } = Dimensions.get('window');
const MAP_HEIGHT = 240;

const PLACE_TYPES: { type: SavedPlace['type']; emoji: string; label: string; color: string }[] = [
  { type: 'home', emoji: '\u{1F3E0}', label: 'Home', color: COLORS.sageGreen },
  { type: 'work', emoji: '\u{1F4BC}', label: 'Work', color: COLORS.navyBlue },
  { type: 'gym', emoji: '\u{1F3CB}\uFE0F', label: 'Gym', color: COLORS.gold },
  { type: 'church', emoji: '\u26EA', label: 'Church', color: '#8B5CF6' },
  { type: 'custom', emoji: '\u2795', label: 'Custom', color: COLORS.terracotta },
];

const MOOD_OPTIONS = [
  { emoji: '\u{1F60A}', label: 'Good' },
  { emoji: '\u{1F634}', label: 'Tired' },
  { emoji: '\u{1F630}', label: 'Stressed' },
  { emoji: '\u{1F912}', label: 'Unwell' },
  { emoji: '\u{1F604}', label: 'Great' },
  { emoji: '\u{1F64F}', label: 'Grateful' },
];

const emojiOptions = [
  '\u{1F469}\u{1F3FE}', '\u{1F468}\u{1F3FE}', '\u{1F9D1}\u{1F3FE}', '\u{1F467}\u{1F3FE}', '\u{1F466}\u{1F3FE}', '\u{1F474}\u{1F3FE}', '\u{1F475}\u{1F3FE}',
  '\u{1F469}\u{1F3FF}', '\u{1F468}\u{1F3FF}', '\u{1F9D1}\u{1F3FF}', '\u{1F469}\u{1F3FD}', '\u{1F468}\u{1F3FD}', '\u{1F469}\u{1F3FC}', '\u{1F468}\u{1F3FC}',
  '\u{1F469}\u{1F3FB}', '\u{1F468}\u{1F3FB}', '\u{1F9D1}', '\u{1F469}', '\u{1F468}', '\u{1F9D3}',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { currentUser, setCurrentUser } = useAppStore();
  const { logout, savedPlaces, addSavedPlace, removeSavedPlace, updateSavedPlace } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState(currentUser?.emoji || '\u{1F469}\u{1F3FE}');
  const [homeCity, setHomeCity] = useState(currentUser?.home_city || 'London, UK');
  const [ghostMode, setGhostMode] = useState(currentUser?.ghost_mode || false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mood, setMood] = useState<string | null>((currentUser as any)?.mood || null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  // Places
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceType, setNewPlaceType] = useState<SavedPlace['type']>('custom');
  const [editingPlace, setEditingPlace] = useState<string | null>(null);
  const webFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { loadCurrentUser(); }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await userApi.getCurrent();
      setCurrentUser(res.data);
      setName(res.data.name);
      setEmoji(res.data.emoji);
      setHomeCity(res.data.home_city || 'London, UK');
      setGhostMode(res.data.ghost_mode || false);
      if (res.data.profile_picture && (res.data.profile_picture.startsWith('data:') || res.data.profile_picture.startsWith('http'))) {
        setProfilePicture(res.data.profile_picture);
      }
      setMood(res.data.mood || null);
      setQuietHoursEnabled(res.data.quiet_hours_enabled || false);
      setQuietStart(res.data.quiet_hours_start || '23:00');
      setQuietEnd(res.data.quiet_hours_end || '07:00');
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const res = await userApi.updateProfile(currentUser.id, {
        name, emoji, home_city: homeCity, ghost_mode: ghostMode,
        profile_picture: profilePicture, mood,
        quiet_hours_enabled: quietHoursEnabled, quiet_hours_start: quietStart, quiet_hours_end: quietEnd,
      });
      setCurrentUser(res.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleMoodUpdate = async (selectedMood: string | null) => {
    setMood(selectedMood);
    setShowMoodPicker(false);
    if (currentUser) {
      try {
        await userApi.updateProfile(currentUser.id, { mood: selectedMood });
      } catch {}
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      if (webFileInputRef.current) webFileInputRef.current.click();
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePicture(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri);
      setShowAvatarOptions(false);
    }
  };

  const handleWebFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => { setProfilePicture(e.target?.result as string); setShowAvatarOptions(false); };
    reader.readAsDataURL(file);
  };

  const handleAddPlace = () => {
    if (!newPlaceName.trim()) return;
    const typeInfo = PLACE_TYPES.find(p => p.type === newPlaceType);
    addSavedPlace({
      id: `place_${Date.now()}`,
      name: newPlaceName.trim(),
      type: newPlaceType,
      emoji: typeInfo?.emoji || '\u{1F4CD}',
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.5,
    });
    setNewPlaceName('');
    setNewPlaceType('custom');
    setShowAddPlace(false);
  };

  const handleSignOut = () => { logout(); router.replace('/auth'); };
  const statusColor = COLORS.sageGreen;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm }}>
          <ThemeToggle />
        </View>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={[styles.avatarRing, { borderColor: statusColor }]}
            onPress={() => isEditing ? setShowAvatarOptions(true) : null}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </View>
            )}
            {isEditing && (
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={12} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <TextInput style={[styles.nameInput, { color: theme.textPrimary }]} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={theme.muted} />
          ) : (
            <Text style={[styles.name, { color: theme.textPrimary }]}>{currentUser?.name || 'You'}</Text>
          )}

          {/* Mood */}
          <TouchableOpacity style={[styles.moodRow, { backgroundColor: theme.card }]} onPress={() => setShowMoodPicker(true)}>
            <Text style={[styles.moodText, { color: theme.textPrimary }]}>{mood || '\u{1F60A}'} {mood ? MOOD_OPTIONS.find(m => m.emoji === mood)?.label || 'Mood' : 'Set mood'}</Text>
            <Ionicons name="chevron-down" size={14} color={theme.muted} />
          </TouchableOpacity>

          <Text style={[styles.status, { color: theme.muted }]}>
            {currentUser?.status_emoji} {currentUser?.status?.replace('_', ' ')}
          </Text>

          <TouchableOpacity style={styles.editButton} onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={styles.editButtonText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Options */}
        {showAvatarOptions && (
          <View style={styles.optionCard}>
            <View style={styles.optionCardHeader}>
              <Text style={styles.optionCardTitle}>Change Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarOptions(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarOptionBtns}>
              <TouchableOpacity style={styles.avatarOptBtn} onPress={pickImage}>
                <View style={styles.avatarOptIcon}><Ionicons name="camera-outline" size={28} color={COLORS.sageGreen} /></View>
                <Text style={styles.avatarOptText}>Upload Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarOptBtn} onPress={() => { setShowAvatarOptions(false); setShowEmojiPicker(true); }}>
                <View style={styles.avatarOptIcon}><Text style={{ fontSize: 28 }}>{'\u{1F60A}'}</Text></View>
                <Text style={styles.avatarOptText}>Choose Emoji</Text>
              </TouchableOpacity>
              {profilePicture && (
                <TouchableOpacity style={styles.avatarOptBtn} onPress={() => { setProfilePicture(null); setShowAvatarOptions(false); }}>
                  <View style={[styles.avatarOptIcon, { backgroundColor: 'rgba(220,80,80,0.15)' }]}>
                    <Ionicons name="trash-outline" size={28} color="#DC5050" />
                  </View>
                  <Text style={[styles.avatarOptText, { color: '#DC5050' }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {Platform.OS === 'web' && (
          <input ref={webFileInputRef as any} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWebFileChange} />
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <View style={styles.optionCard}>
            <View style={styles.optionCardHeader}>
              <Text style={styles.optionCardTitle}>Choose your avatar</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {emojiOptions.map((e, i) => (
                <TouchableOpacity key={i} style={[styles.emojiOpt, emoji === e && styles.emojiOptActive]} onPress={() => { setEmoji(e); setProfilePicture(null); setShowEmojiPicker(false); }}>
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Mood Picker */}
        {showMoodPicker && (
          <View style={styles.optionCard}>
            <View style={styles.optionCardHeader}>
              <Text style={styles.optionCardTitle}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setShowMoodPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((m, i) => (
                <TouchableOpacity key={i} style={[styles.moodOption, mood === m.emoji && styles.moodOptionActive]} onPress={() => handleMoodUpdate(m.emoji)}>
                  <Text style={styles.moodOptionEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodOptionLabel}>{m.label}</Text>
                </TouchableOpacity>
              ))}
              {mood && (
                <TouchableOpacity style={styles.moodOption} onPress={() => handleMoodUpdate(null)}>
                  <Ionicons name="close-circle-outline" size={24} color={COLORS.muted} />
                  <Text style={styles.moodOptionLabel}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* My Places Section (visible when editing) */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MY PLACES</Text>
            <Text style={styles.sectionSubtitle}>Tap a place type to add. These enable auto-status detection.</Text>

            {/* Mini Map */}
            <View style={styles.miniMap}>
              <View style={styles.miniMapBg}>
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map(p => (
                  <View key={`h${p}`} style={[styles.gridLine, { top: `${p * 100}%`, width: '100%', height: 1 }]} />
                ))}
                {[0.25, 0.5, 0.75].map(p => (
                  <View key={`v${p}`} style={[styles.gridLine, { left: `${p * 100}%`, height: '100%', width: 1 }]} />
                ))}
                
                {/* Saved place pins */}
                {savedPlaces.map(place => {
                  const typeInfo = PLACE_TYPES.find(t => t.type === place.type);
                  return (
                    <TouchableOpacity
                      key={place.id}
                      style={[styles.mapPin, { left: `${place.x * 90 + 5}%`, top: `${place.y * 85 + 5}%` }]}
                      onLongPress={() => {
                        Alert.alert('Delete Place', `Remove ${place.name}?`, [
                          { text: 'Cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => removeSavedPlace(place.id) },
                        ]);
                      }}
                    >
                      <View style={[styles.mapPinDot, { backgroundColor: typeInfo?.color || COLORS.muted }]}>
                        <Text style={styles.mapPinEmoji}>{place.emoji}</Text>
                      </View>
                      <Text style={[styles.mapPinLabel, { color: typeInfo?.color || COLORS.muted }]}>{place.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Place type buttons */}
            <View style={styles.placeTypes}>
              {PLACE_TYPES.map(pt => (
                <TouchableOpacity
                  key={pt.type}
                  style={[styles.placeTypeBtn, { borderColor: pt.color }]}
                  onPress={() => { setNewPlaceType(pt.type); setNewPlaceName(pt.label === 'Custom' ? '' : pt.label); setShowAddPlace(true); }}
                >
                  <Text style={styles.placeTypeEmoji}>{pt.emoji}</Text>
                  <Text style={[styles.placeTypeLabel, { color: pt.color }]}>{pt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Place list */}
            {savedPlaces.map(place => {
              const typeInfo = PLACE_TYPES.find(t => t.type === place.type);
              return (
                <View key={place.id} style={styles.placeRow}>
                  <View style={[styles.placeIcon, { backgroundColor: `${typeInfo?.color || COLORS.muted}22` }]}>
                    <Text style={styles.placeIconEmoji}>{place.emoji}</Text>
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeType}>{typeInfo?.label || place.type}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeSavedPlace(place.id)}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.muted} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Add Place Modal */}
        <Modal visible={showAddPlace} transparent animationType="slide" statusBarTranslucent>
          <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.optionCardHeader}>
                <Text style={styles.optionCardTitle}>Add Place</Text>
                <TouchableOpacity onPress={() => setShowAddPlace(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                value={newPlaceName}
                onChangeText={setNewPlaceName}
                placeholder="Place name"
                placeholderTextColor={COLORS.muted}
              />
              <View style={styles.placeTypePicker}>
                {PLACE_TYPES.map(pt => (
                  <TouchableOpacity
                    key={pt.type}
                    style={[styles.placeTypeChip, newPlaceType === pt.type && { borderColor: pt.color, backgroundColor: `${pt.color}15` }]}
                    onPress={() => setNewPlaceType(pt.type)}
                  >
                    <Text>{pt.emoji}</Text>
                    <Text style={[styles.placeTypeChipText, newPlaceType === pt.type && { color: pt.color }]}>{pt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.saveBtn, !newPlaceName.trim() && { opacity: 0.4 }]}
                onPress={handleAddPlace}
                disabled={!newPlaceName.trim()}
              >
                <Text style={styles.saveBtnText}>Save Place</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Home City</Text>
                {isEditing ? (
                  <TextInput style={styles.settingInput} value={homeCity} onChangeText={setHomeCity} placeholderTextColor={COLORS.muted} />
                ) : (
                  <Text style={styles.settingValue}>{homeCity}</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="people-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>My Circles</Text>
                <Text style={styles.settingValue}>{currentUser?.circle_ids?.length || 1} active circle(s)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="eye-off-outline" size={20} color={COLORS.warmAmber} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Ghost Mode</Text>
                <Text style={styles.settingValue}>{ghostMode ? 'Location hidden' : 'Location shared'}</Text>
              </View>
            </View>
            <Switch value={ghostMode} onValueChange={setGhostMode} trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.warmAmber }} thumbColor={COLORS.white} />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="battery-half-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Battery Sharing</Text>
                <Text style={styles.settingValue}>Share battery with circles</Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.sageGreen }} thumbColor={COLORS.white} />
          </View>
          {/* Quiet Hours */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color="#8B5CF6" />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Quiet Hours</Text>
                <Text style={styles.settingValue}>
                  {quietHoursEnabled ? `${quietStart} - ${quietEnd}` : 'No notifications during set hours'}
                </Text>
              </View>
            </View>
            <Switch value={quietHoursEnabled} onValueChange={setQuietHoursEnabled} trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#8B5CF6' }} thumbColor={COLORS.white} />
          </View>
          {quietHoursEnabled && (
            <View style={styles.quietHoursConfig}>
              <View style={styles.quietTimeRow}>
                <Text style={styles.quietTimeLabel}>From</Text>
                <TextInput style={styles.quietTimeInput} value={quietStart} onChangeText={setQuietStart} placeholder="23:00" placeholderTextColor={COLORS.muted} />
              </View>
              <View style={styles.quietTimeRow}>
                <Text style={styles.quietTimeLabel}>To</Text>
                <TextInput style={styles.quietTimeInput} value={quietEnd} onChangeText={setQuietEnd} placeholder="07:00" placeholderTextColor={COLORS.muted} />
              </View>
              <Text style={styles.quietNote}>Status shows as "{'\u{1F4A4}'} Quiet hours" to your circle</Text>
            </View>
          )}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Safety Windows</Text>
                <Text style={styles.settingValue}>Opt-in check-in reminders</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </View>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/night-check')}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={20} color={COLORS.gold} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Night Check</Text>
                <Text style={styles.settingValue}>Nightly safety ritual for your circle</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/notifications')}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>Manage alerts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/pricing')}>
            <View style={styles.settingLeft}>
              <Ionicons name="diamond-outline" size={20} color={COLORS.gold} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Subscription</Text>
                <Text style={styles.settingValue}>Free plan</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Safe Walks History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAFE WALKS</Text>
          <Text style={[styles.settingValue, { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, color: theme.sage }]}>
            You completed 3 safe walks this month {'\u{1F33F}'}
          </Text>
          {[
            { dest: 'Home from work', date: 'Today', dur: '18 min' },
            { dest: "To Mia's house", date: 'Yesterday', dur: '11 min' },
            { dest: 'Late night walk', date: 'Mon', dur: '22 min' },
          ].map((w, i) => (
            <View key={i} style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLeft}>
                <Text style={{ fontSize: 16 }}>{'\u{1F6B6}'}</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>{w.dest}</Text>
                  <Text style={[styles.settingValue, { color: theme.sage }]}>All safe {'\u00B7'} {w.date}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>{w.dur}</Text>
                <Text style={{ color: theme.sage, fontWeight: '700', fontSize: 13 }}>{'\u2713'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#DC5050" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Reassura v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const warmAmber = '#C9A84C';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundDark },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  profileCard: {
    alignItems: 'center', padding: SPACING.xl, paddingTop: SPACING.lg,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 3,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, overflow: 'hidden',
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.backgroundCard, justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarEmoji: { fontSize: 48 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.sageGreen, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.backgroundDark,
  },
  name: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.white, marginBottom: 4 },
  nameInput: {
    fontFamily: FONTS.heading, fontSize: 24, color: COLORS.white, textAlign: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.sageGreen, paddingBottom: 4, marginBottom: 4, minWidth: 150,
  },
  moodRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.xs,
  },
  moodText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.cream },
  status: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.muted, marginBottom: SPACING.md },
  editButton: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(122,158,135,0.15)', borderRadius: BORDER_RADIUS.full,
    borderWidth: 1, borderColor: COLORS.sageGreen,
  },
  editButtonText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.sageGreen },
  optionCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.backgroundCard, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  optionCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
  },
  optionCardTitle: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.white },
  avatarOptionBtns: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl },
  avatarOptBtn: { alignItems: 'center', gap: SPACING.sm },
  avatarOptIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(122,158,135,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  avatarOptText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.white },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emojiOpt: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emojiOptActive: { backgroundColor: 'rgba(122,158,135,0.3)', borderWidth: 2, borderColor: COLORS.sageGreen },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  moodOption: {
    alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: 'transparent',
  },
  moodOptionActive: { borderColor: COLORS.sageGreen, backgroundColor: 'rgba(122,158,135,0.15)' },
  moodOptionEmoji: { fontSize: 28, marginBottom: 2 },
  moodOptionLabel: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.muted },
  // My Places
  miniMap: {
    marginTop: SPACING.sm, marginBottom: SPACING.md,
    height: MAP_HEIGHT, borderRadius: BORDER_RADIUS.md, overflow: 'hidden',
  },
  miniMapBg: {
    flex: 1, backgroundColor: '#1E2A1E', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(122,158,135,0.2)', borderRadius: BORDER_RADIUS.md,
  },
  gridLine: {
    position: 'absolute', backgroundColor: 'rgba(122,158,135,0.08)',
  },
  mapPin: {
    position: 'absolute', alignItems: 'center', zIndex: 5,
  },
  mapPinDot: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  mapPinEmoji: { fontSize: 16 },
  mapPinLabel: { fontFamily: FONTS.body, fontSize: 9, marginTop: 1 },
  placeTypes: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md,
  },
  placeTypeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  placeTypeEmoji: { fontSize: 14 },
  placeTypeLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  placeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: SPACING.md,
  },
  placeIcon: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  placeIconEmoji: { fontSize: 18 },
  placeInfo: { flex: 1 },
  placeName: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.white },
  placeType: { fontFamily: FONTS.body, fontSize: 11, color: COLORS.muted, textTransform: 'capitalize' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: 'rgba(26,22,18,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  modalInput: {
    fontFamily: FONTS.body, fontSize: 16, color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: SPACING.md,
  },
  placeTypePicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  placeTypeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  placeTypeChipText: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted },
  saveBtn: {
    backgroundColor: COLORS.sageGreen, borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  saveBtnText: { fontFamily: FONTS.bodyBold, fontSize: 16, color: COLORS.white },
  // Settings sections
  section: {
    marginHorizontal: SPACING.lg, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold, fontSize: 11, color: COLORS.muted,
    letterSpacing: 1.5, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingInfo: { marginLeft: SPACING.md, flex: 1 },
  settingLabel: { fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.white },
  settingValue: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.muted, marginTop: 2 },
  settingInput: {
    fontFamily: FONTS.body, fontSize: 13, color: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.sageGreen, paddingBottom: 2, marginTop: 2,
  },
  quietHoursConfig: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  quietTimeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm,
  },
  quietTimeLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.muted },
  quietTimeInput: {
    fontFamily: FONTS.bodyMedium, fontSize: 16, color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm, width: 80, textAlign: 'center',
  },
  quietNote: {
    fontFamily: FONTS.body, fontSize: 12, color: '#8B5CF6', fontStyle: 'italic',
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: SPACING.lg, marginTop: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.sm,
  },
  signOutText: { fontFamily: FONTS.bodyMedium, fontSize: 16, color: '#DC5050' },
  versionText: {
    fontFamily: FONTS.body, fontSize: 12, color: COLORS.muted,
    textAlign: 'center', marginTop: SPACING.xs, opacity: 0.5,
  },
});
