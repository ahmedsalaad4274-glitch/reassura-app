import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAppStore } from '../src/store/appStore';
import { userApi } from '../src/services/api';

const STATUS_OPTIONS = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'on_the_way', emoji: '🚗', label: 'On the way' },
  { id: 'arrived', emoji: '📍', label: 'Arrived' },
  { id: 'all_good', emoji: '❤️', label: 'All good' },
  { id: 'offline', emoji: '💤', label: 'Offline for the night' },
  { id: 'travelling', emoji: '✈️', label: 'Travelling' },
];

const MESSAGE_SUGGESTIONS = [
  'Just got home 🏠',
  'On my way! 🚗',
  'All good here ❤️',
  'Be there soon',
  'Running late',
  'Safe and sound',
];

export default function UpdateStatusScreen() {
  const router = useRouter();
  const { currentUser, users, setCurrentUser, setUsers } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successAnim = React.useRef(new Animated.Value(0)).current;
  
  const handleSubmit = async () => {
    if (!selectedStatus || !currentUser) return;
    
    const statusOption = STATUS_OPTIONS.find(s => s.id === selectedStatus);
    if (!statusOption) return;
    
    setIsSubmitting(true);
    try {
      const res = await userApi.updateStatus(currentUser.id, {
        status: selectedStatus,
        status_emoji: statusOption.emoji,
        status_message: message || undefined,
      });
      
      setCurrentUser(res.data);
      
      // Update users list
      const updatedUsers = users.map(u =>
        u.id === currentUser.id ? res.data : u
      );
      setUsers(updatedUsers);
      
      // Show success animation
      setShowSuccess(true);
      Animated.sequence([
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.back();
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedOption = STATUS_OPTIONS.find(s => s.id === selectedStatus);
  const otherMembers = users.filter(u => u.id !== currentUser?.id).slice(0, 3);
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Update your circle</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>
      
      <Text style={styles.subtitle}>
        Let your people know how you are. One tap is all it takes.
      </Text>
      
      {/* Status Grid */}
      <View style={styles.statusGrid}>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.statusOption,
              selectedStatus === option.id && styles.statusOptionSelected,
            ]}
            onPress={() => setSelectedStatus(option.id)}
          >
            <Text style={styles.statusEmoji}>{option.emoji}</Text>
            <Text style={[
              styles.statusLabel,
              selectedStatus === option.id && styles.statusLabelSelected,
            ]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Message Input */}
      <View style={styles.messageSection}>
        <Text style={styles.sectionLabel}>Add a personal message (optional)</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.muted}
          value={message}
          onChangeText={text => setMessage(text.slice(0, 60))}
          maxLength={60}
          multiline
        />
        <Text style={styles.charCount}>{message.length}/60</Text>
        
        <View style={styles.suggestions}>
          {MESSAGE_SUGGESTIONS.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => setMessage(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Preview */}
      {selectedStatus && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewStatus}>
              You are {selectedOption?.emoji} {selectedOption?.label}
              {message && ` · "${message}"`} · just now
            </Text>
          </View>
          <Text style={styles.notifyText}>
            {otherMembers.map(u => u.name).join(', ')} & {users.length - otherMembers.length - 1} others will be notified quietly
          </Text>
        </View>
      )}
      
      {/* Share Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.shareButton,
            !selectedStatus && styles.shareButtonDisabled,
          ]}
          disabled={!selectedStatus || isSubmitting}
          onPress={handleSubmit}
        >
          <Text style={styles.shareButtonText}>
            {isSubmitting ? 'Updating...' : 'Share with my circle 🌿'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            { opacity: successAnim },
          ]}
        >
          <Ionicons name="leaf" size={48} color={COLORS.sageGreen} />
          <Text style={styles.successText}>Your circle has been updated</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 18,
  },
  subtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  statusOption: {
    width: '48%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusOptionSelected: {
    borderColor: COLORS.sageGreen,
    backgroundColor: 'rgba(122, 158, 135, 0.15)',
  },
  statusEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
  statusLabelSelected: {
    color: COLORS.sageGreen,
  },
  messageSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  messageInput: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  suggestionText: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 13,
  },
  preview: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  previewTitle: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  previewCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  previewStatus: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 15,
  },
  notifyText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
    marginTop: SPACING.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  shareButton: {
    backgroundColor: COLORS.sageGreen,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  shareButtonDisabled: {
    backgroundColor: COLORS.muted,
    opacity: 0.5,
  },
  shareButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 18,
    marginTop: SPACING.md,
  },
});