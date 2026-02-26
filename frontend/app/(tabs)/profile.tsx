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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useAuthStore } from '../../src/store/authStore';
import { userApi } from '../../src/services/api';

const emojiOptions = [
  '\u{1F469}\u{1F3FE}', '\u{1F468}\u{1F3FE}', '\u{1F9D1}\u{1F3FE}', '\u{1F467}\u{1F3FE}', '\u{1F466}\u{1F3FE}', '\u{1F474}\u{1F3FE}', '\u{1F475}\u{1F3FE}',
  '\u{1F469}\u{1F3FF}', '\u{1F468}\u{1F3FF}', '\u{1F9D1}\u{1F3FF}', '\u{1F469}\u{1F3FD}', '\u{1F468}\u{1F3FD}', '\u{1F469}\u{1F3FC}', '\u{1F468}\u{1F3FC}',
  '\u{1F469}\u{1F3FB}', '\u{1F468}\u{1F3FB}', '\u{1F9D1}', '\u{1F469}', '\u{1F468}', '\u{1F9D3}', '\u{1F476}', '\u{1F9D2}', '\u{1F47D}', '\u{1F916}', '\u{1F464}'
];

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAppStore();
  const { logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState(currentUser?.emoji || '\u{1F469}\u{1F3FE}');
  const [homeCity, setHomeCity] = useState(currentUser?.home_city || 'London, UK');
  const [ghostMode, setGhostMode] = useState(currentUser?.ghost_mode || false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser?.profile_picture || null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const webFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await userApi.getCurrent();
      setCurrentUser(res.data);
      setName(res.data.name);
      setEmoji(res.data.emoji);
      setHomeCity(res.data.home_city || 'London, UK');
      setGhostMode(res.data.ghost_mode || false);
      if (res.data.profile_picture) {
        setProfilePicture(res.data.profile_picture);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const res = await userApi.updateProfile(currentUser.id, {
        name,
        emoji,
        home_city: homeCity,
        ghost_mode: ghostMode,
        profile_picture: profilePicture,
      });
      setCurrentUser(res.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // Web fallback: trigger hidden file input
      if (webFileInputRef.current) {
        webFileInputRef.current.click();
      }
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setProfilePicture(uri);
      setShowAvatarOptions(false);
    }
  };

  const handleWebFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfilePicture(result);
      setShowAvatarOptions(false);
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setShowAvatarOptions(false);
  };

  const handleSignOut = () => {
    logout();
    router.replace('/onboarding');
  };

  const statusColor = currentUser ? getStatusColor(currentUser.status) : COLORS.sageGreen;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={[styles.avatarRing, { borderColor: statusColor }]}
            onPress={() => isEditing ? setShowAvatarOptions(true) : null}
            data-testid="profile-avatar-button"
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
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
              data-testid="profile-name-input"
            />
          ) : (
            <Text style={styles.name}>{currentUser?.name || 'You'}</Text>
          )}

          <Text style={styles.status}>
            {currentUser?.status_emoji} {currentUser?.status?.replace('_', ' ')} · just now
          </Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            data-testid="profile-edit-button"
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Options (Photo vs Emoji) */}
        {showAvatarOptions && (
          <View style={styles.avatarOptions}>
            <View style={styles.avatarOptionsHeader}>
              <Text style={styles.avatarOptionsTitle}>Change Avatar</Text>
              <TouchableOpacity onPress={() => setShowAvatarOptions(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.avatarOptionButtons}>
              <TouchableOpacity
                style={styles.avatarOptionBtn}
                onPress={pickImage}
                data-testid="upload-photo-button"
              >
                <View style={styles.avatarOptionIcon}>
                  <Ionicons name="camera-outline" size={28} color={COLORS.sageGreen} />
                </View>
                <Text style={styles.avatarOptionText}>Upload Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarOptionBtn}
                onPress={() => {
                  setShowAvatarOptions(false);
                  setShowEmojiPicker(true);
                }}
                data-testid="choose-emoji-button"
              >
                <View style={styles.avatarOptionIcon}>
                  <Text style={{ fontSize: 28 }}>{'\u{1F60A}'}</Text>
                </View>
                <Text style={styles.avatarOptionText}>Choose Emoji</Text>
              </TouchableOpacity>

              {profilePicture && (
                <TouchableOpacity
                  style={styles.avatarOptionBtn}
                  onPress={removeProfilePicture}
                  data-testid="remove-photo-button"
                >
                  <View style={[styles.avatarOptionIcon, { backgroundColor: 'rgba(220, 80, 80, 0.15)' }]}>
                    <Ionicons name="trash-outline" size={28} color="#DC5050" />
                  </View>
                  <Text style={[styles.avatarOptionText, { color: '#DC5050' }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Web file input (hidden) */}
        {Platform.OS === 'web' && (
          <input
            ref={webFileInputRef as any}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleWebFileChange}
          />
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <View style={styles.emojiPicker}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>Choose your avatar</Text>
              <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.emojiGrid}>
              {emojiOptions.map((e, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.emojiOption, emoji === e && styles.emojiOptionSelected]}
                  onPress={() => {
                    setEmoji(e);
                    setProfilePicture(null);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="location-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Home City</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.settingInput}
                    value={homeCity}
                    onChangeText={setHomeCity}
                    placeholder="Your city"
                    placeholderTextColor={COLORS.muted}
                  />
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
                <Text style={styles.settingValue}>
                  {currentUser?.circle_ids?.length || 1} active circle(s)
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="eye-off-outline" size={20} color={COLORS.warmAmber} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Ghost Mode</Text>
                <Text style={styles.settingValue}>
                  {ghostMode ? 'Your location is hidden' : 'Location shared with circles'}
                </Text>
              </View>
            </View>
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{ false: COLORS.cardBorder, true: COLORS.warmAmber }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="battery-half-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Battery Sharing</Text>
                <Text style={styles.settingValue}>Share battery with circles</Text>
              </View>
            </View>
            <Switch
              value={true}
              trackColor={{ false: COLORS.cardBorder, true: COLORS.sageGreen }}
              thumbColor={COLORS.white}
            />
          </View>

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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/notifications')}
            data-testid="notifications-setting"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>Manage alerts</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="color-palette-outline" size={20} color={COLORS.sageGreen} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Appearance</Text>
                <Text style={styles.settingValue}>Dark mode (default)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/pricing')}
            data-testid="subscription-setting"
          >
            <View style={styles.settingLeft}>
              <Ionicons name="diamond-outline" size={20} color={COLORS.warmAmber} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Subscription</Text>
                <Text style={styles.settingValue}>Free plan</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          data-testid="sign-out-button"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC5050" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Reassura v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
  },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 4,
  },
  nameInput: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sageGreen,
    paddingBottom: 4,
    marginBottom: 4,
    minWidth: 150,
  },
  status: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.md,
  },
  editButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(122, 158, 135, 0.15)',
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.sageGreen,
  },
  editButtonText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.sageGreen,
  },
  avatarOptions: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarOptionsTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.white,
  },
  avatarOptionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  avatarOptionBtn: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatarOptionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(122, 158, 135, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOptionText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.white,
  },
  emojiPicker: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emojiPickerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.white,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emojiOptionSelected: {
    backgroundColor: 'rgba(122, 158, 135, 0.3)',
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  emojiOptionText: {
    fontSize: 24,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardDark,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1.5,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 15,
    color: COLORS.white,
  },
  settingValue: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  settingInput: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sageGreen,
    paddingBottom: 2,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  signOutText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: '#DC5050',
  },
  versionText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    opacity: 0.5,
  },
});
