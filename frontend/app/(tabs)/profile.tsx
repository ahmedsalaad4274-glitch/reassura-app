import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { userApi } from '../../src/services/api';

const emojiOptions = [
  '👩🏾', '👨🏾', '🧑🏾', '👧🏾', '👦🏾', '👴🏾', '👵🏾',
  '👩🏿', '👨🏿', '🧑🏿', '👩🏽', '👨🏽', '👩🏼', '👨🏼',
  '👩🏻', '👨🏻', '🧑', '👩', '👨', '🧓', '👶', '🧒', '👽', '🤖', '👤'
];

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [emoji, setEmoji] = useState(currentUser?.emoji || '👩🏾');
  const [homeCity, setHomeCity] = useState(currentUser?.home_city || 'London, UK');
  const [ghostMode, setGhostMode] = useState(currentUser?.ghost_mode || false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
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
      });
      setCurrentUser(res.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated! 🌿');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
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
            onPress={() => setShowEmojiPicker(true)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </View>
            {isEditing && (
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color={COLORS.white} />
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
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
        
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
              {emojiOptions.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiOption,
                    emoji === e && styles.emojiOptionSelected,
                  ]}
                  onPress={() => {
                    setEmoji(e);
                    setShowEmojiPicker(false);
                  }}
                >
                  <Text style={styles.emojiOptionText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Profile Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.fieldCard}>
            <View style={styles.fieldRow}>
              <Ionicons name="person" size={20} color={COLORS.sageGreen} />
              <Text style={styles.fieldLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={COLORS.muted}
                />
              ) : (
                <Text style={styles.fieldValue}>{name}</Text>
              )}
            </View>
            
            <View style={styles.fieldRow}>
              <Ionicons name="location" size={20} color={COLORS.sageGreen} />
              <Text style={styles.fieldLabel}>Home city</Text>
              {isEditing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={homeCity}
                  onChangeText={setHomeCity}
                  placeholder="Your city"
                  placeholderTextColor={COLORS.muted}
                />
              ) : (
                <Text style={styles.fieldValue}>{homeCity}</Text>
              )}
            </View>
            
            <View style={styles.fieldRow}>
              <Ionicons name="people" size={20} color={COLORS.sageGreen} />
              <Text style={styles.fieldLabel}>Default circle</Text>
              <View style={styles.circleChips}>
                <View style={[styles.circleChip, styles.circleChipActive]}>
                  <Text style={styles.circleChipText}>Family</Text>
                </View>
                <View style={styles.circleChip}>
                  <Text style={styles.circleChipText}>Friends</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.fieldCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye-off" size={20} color={COLORS.terracotta} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Ghost Mode</Text>
                  <Text style={styles.settingDescription}>
                    When on, you appear offline to your circle
                  </Text>
                </View>
              </View>
              <Switch
                value={ghostMode}
                onValueChange={setGhostMode}
                trackColor={{ false: COLORS.muted, true: COLORS.terracotta }}
                thumbColor={COLORS.white}
              />
            </View>
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed" size={20} color={COLORS.sageGreen} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Share status with</Text>
                  <Text style={styles.settingDescription}>Everyone</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={20} color={COLORS.sageGreen} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto-clear status</Text>
                  <Text style={styles.settingDescription}>Never</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/update-status')}
          >
            <Ionicons name="radio" size={20} color={COLORS.sageGreen} />
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/pricing')}
          >
            <Ionicons name="diamond" size={20} color={COLORS.gold} />
            <Text style={styles.actionButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
        
        {/* Plan Badge */}
        <View style={styles.planBadge}>
          <Text style={styles.planText}>Free Forever</Text>
          <TouchableOpacity onPress={() => router.push('/pricing')}>
            <Text style={styles.upgradeText}>Upgrade →</Text>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Reassura · Built with care 🌿</Text>
          <Text style={styles.footerEmail}>hello@reassura.co.uk</Text>
        </View>
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
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 52,
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
    borderWidth: 3,
    borderColor: COLORS.backgroundDark,
  },
  name: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
    marginTop: SPACING.md,
  },
  nameInput: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
    marginTop: SPACING.md,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.sageGreen,
    paddingBottom: SPACING.xs,
  },
  status: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  editButton: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
  },
  editButtonText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
  },
  emojiPicker: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emojiPickerTitle: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiOption: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundDark,
  },
  emojiOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  emojiOptionText: {
    fontSize: 26,
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fieldCard: {
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  fieldLabel: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 15,
    marginLeft: SPACING.md,
    flex: 1,
  },
  fieldValue: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 15,
  },
  fieldInput: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 15,
    textAlign: 'right',
    flex: 1,
  },
  circleChips: {
    flexDirection: 'row',
  },
  circleChip: {
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: SPACING.xs,
  },
  circleChipActive: {
    backgroundColor: COLORS.sageGreen,
  },
  circleChipText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  settingLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 15,
  },
  settingDescription: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionButtonText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 15,
    marginLeft: SPACING.md,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  planText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  upgradeText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 14,
    marginLeft: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 13,
  },
  footerEmail: {
    fontFamily: FONTS.body,
    color: COLORS.sageGreen,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});