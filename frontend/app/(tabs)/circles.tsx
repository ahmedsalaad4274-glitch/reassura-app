import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { BlurView } from 'expo-blur';
import { useAppStore } from '../../src/store/appStore';
import { circleApi, userApi } from '../../src/services/api';

const { width } = Dimensions.get('window');

interface CircleVisualizationProps {
  circle: any;
  members: any[];
  onPress: () => void;
}

const CircleVisualization: React.FC<CircleVisualizationProps> = ({ circle, members, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(0.5)).current;
  const ring2Anim = useRef(new Animated.Value(0.5)).current;
  const ring3Anim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    // Main pulse
    const mainPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    
    // Ring animations
    const ringAnimation = Animated.loop(
      Animated.stagger(300, [
        Animated.sequence([
          Animated.timing(ring1Anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ring1Anim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ring2Anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ring2Anim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ring3Anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ring3Anim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    
    mainPulse.start();
    ringAnimation.start();
    
    return () => {
      mainPulse.stop();
      ringAnimation.stop();
    };
  }, []);
  
  // Position members in orbit
  const memberPositions = members.map((_, index) => {
    const angle = (index * (360 / members.length) - 90) * (Math.PI / 180);
    const radius = 65;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });
  
  const travellingCount = members.filter(m => m.status === 'travelling').length;
  const allSafe = members.every(m => m.status !== 'emergency');
  
  return (
    <TouchableOpacity style={styles.circleCard} onPress={onPress}>
      <View style={styles.visualizationContainer}>
        {/* Expanding rings */}
        <Animated.View style={[
          styles.ring,
          { width: 180, height: 180, borderRadius: 90, opacity: ring1Anim }
        ]} />
        <Animated.View style={[
          styles.ring,
          { width: 150, height: 150, borderRadius: 75, opacity: ring2Anim }
        ]} />
        <Animated.View style={[
          styles.ring,
          { width: 120, height: 120, borderRadius: 60, opacity: ring3Anim }
        ]} />
        
        {/* Center circle */}
        <Animated.View
          style={[
            styles.centerCircle,
            { backgroundColor: circle.color, transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.memberCount}>{members.length} members</Text>
        </Animated.View>
        
        {/* Orbiting members */}
        {members.slice(0, 6).map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.orbitMember,
              {
                left: 90 + memberPositions[index].x - 16,
                top: 90 + memberPositions[index].y - 16,
              }
            ]}
          >
            <Text style={styles.orbitEmoji}>{member.emoji}</Text>
          </View>
        ))}
      </View>
      
      {/* Peace score */}
      <View style={styles.peaceScore}>
        <Text style={styles.peaceScoreText}>
          {allSafe ? 'All safe' : 'Needs attention'} {allSafe ? '🌿' : '⚠️'}
          {travellingCount > 0 && ` · ${travellingCount} travelling ✈️`}
        </Text>
      </View>
      
      <Text style={styles.viewLink}>View circle →</Text>
    </TouchableOpacity>
  );
};

export default function CirclesScreen() {
  const { circles, users, setCircles, setUsers } = useAppStore();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [createStep, setCreateStep] = React.useState(1);
  const [newCircle, setNewCircle] = React.useState({
    name: '',
    emoji: '👨‍👩‍👧‍👦',
    color: COLORS.sageGreen,
    member_ids: [],
    privacy: 'invite_only',
  });
  const [showCelebration, setShowCelebration] = React.useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [circlesRes, usersRes] = await Promise.all([
        circleApi.getAll(),
        userApi.getAll(),
      ]);
      setCircles(circlesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading circles:', error);
    }
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
        setNewCircle({
          name: '',
          emoji: '👨‍👩‍👧‍👦',
          color: COLORS.sageGreen,
          member_ids: [],
          privacy: 'invite_only',
        });
        loadData();
      }, 3000);
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };
  
  const emojiOptions = ['👨‍👩‍👧‍👦', '👫', '🏠', '✈️', '💼', '🏃', '🌍', '❤️', '🛡️', '🌿'];
  const colorOptions = [COLORS.sageGreen, COLORS.terracotta, COLORS.gold, COLORS.navyBlue, '#8B5CF6', '#EC4899'];
  const nameChips = ['Family', 'Friends', 'Work', 'Travel Buddies', 'Emergency', 'Custom'];
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Circles</Text>
        <Text style={styles.headerSubtitle}>People who matter, connected</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Circle visualizations */}
        {circles.map(circle => (
          <CircleVisualization
            key={circle.id}
            circle={circle}
            members={getCircleMembers(circle.id)}
            onPress={() => {}}
          />
        ))}
        
        {/* Add Circle Button */}
        <TouchableOpacity
          style={styles.addCircleButton}
          onPress={() => setShowCreateModal(true)}
        >
          <View style={styles.addCircleDashed}>
            <Ionicons name="add" size={32} color={COLORS.sageGreen} />
          </View>
          <Text style={styles.addCircleText}>Create a new circle</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Create Circle Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent statusBarTranslucent>
        <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Progress indicator */}
            <View style={styles.progressRow}>
              {[1, 2, 3, 4].map(step => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    createStep >= step && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
            
            {/* Close button */}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                setShowCreateModal(false);
                setCreateStep(1);
              }}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            
            {/* Step 1: Name */}
            {createStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>What's this circle called?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Circle name"
                  placeholderTextColor={COLORS.muted}
                  value={newCircle.name}
                  onChangeText={text => setNewCircle(prev => ({ ...prev, name: text.slice(0, 20) }))}
                  maxLength={20}
                />
                <View style={styles.chipRow}>
                  {nameChips.map(chip => (
                    <TouchableOpacity
                      key={chip}
                      style={[
                        styles.chip,
                        newCircle.name === chip && styles.chipActive,
                      ]}
                      onPress={() => setNewCircle(prev => ({ ...prev, name: chip }))}
                    >
                      <Text style={[
                        styles.chipText,
                        newCircle.name === chip && styles.chipTextActive,
                      ]}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !newCircle.name && styles.nextButtonDisabled,
                  ]}
                  disabled={!newCircle.name}
                  onPress={() => setCreateStep(2)}
                >
                  <Text style={styles.nextButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Step 2: Look */}
            {createStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Give your circle a look</Text>
                
                <Text style={styles.stepLabel}>Choose an emoji</Text>
                <View style={styles.emojiRow}>
                  {emojiOptions.map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        newCircle.emoji === emoji && styles.emojiOptionActive,
                      ]}
                      onPress={() => setNewCircle(prev => ({ ...prev, emoji }))}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.stepLabel}>Choose a color</Text>
                <View style={styles.colorRow}>
                  {colorOptions.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newCircle.color === color && styles.colorOptionActive,
                      ]}
                      onPress={() => setNewCircle(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
                
                {/* Preview */}
                <View style={[styles.previewCircle, { backgroundColor: newCircle.color }]}>
                  <Text style={styles.previewEmoji}>{newCircle.emoji}</Text>
                </View>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(1)}>
                    <Text style={styles.backText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextButton} onPress={() => setCreateStep(3)}>
                    <Text style={styles.nextButtonText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Step 3: Invite */}
            {createStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Who's in this circle?</Text>
                
                {users.map(user => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.contactRow}
                    onPress={() => {
                      const ids = newCircle.member_ids.includes(user.id)
                        ? newCircle.member_ids.filter(id => id !== user.id)
                        : [...newCircle.member_ids, user.id];
                      setNewCircle(prev => ({ ...prev, member_ids: ids }));
                    }}
                  >
                    <Text style={styles.contactEmoji}>{user.emoji}</Text>
                    <Text style={styles.contactName}>{user.name}</Text>
                    <View style={[
                      styles.checkbox,
                      newCircle.member_ids.includes(user.id) && styles.checkboxActive,
                    ]}>
                      {newCircle.member_ids.includes(user.id) && (
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                
                <Text style={styles.countText}>{newCircle.member_ids.length} people added</Text>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(2)}>
                    <Text style={styles.backText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      newCircle.member_ids.length === 0 && styles.nextButtonDisabled,
                    ]}
                    disabled={newCircle.member_ids.length === 0}
                    onPress={() => setCreateStep(4)}
                  >
                    <Text style={styles.nextButtonText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Step 4: Privacy */}
            {createStep === 4 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Circle privacy</Text>
                
                {[
                  { value: 'invite_only', icon: 'lock-closed', label: 'Invite only (recommended)', recommended: true },
                  { value: 'members_can_invite', icon: 'people', label: 'Members can invite' },
                  { value: 'open', icon: 'globe', label: 'Open (not recommended)' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.privacyOption,
                      newCircle.privacy === option.value && styles.privacyOptionActive,
                    ]}
                    onPress={() => setNewCircle(prev => ({ ...prev, privacy: option.value }))}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={22}
                      color={newCircle.privacy === option.value ? COLORS.sageGreen : COLORS.white}
                    />
                    <Text style={[
                      styles.privacyLabel,
                      newCircle.privacy === option.value && styles.privacyLabelActive,
                    ]}>
                      {option.label}
                    </Text>
                    {option.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => setCreateStep(3)}>
                    <Text style={styles.backText}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateCircle}
                  >
                    <Text style={styles.createButtonText}>Create Circle 🌿</Text>
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
          <Text style={styles.celebrationTitle}>{newCircle.name} circle created! 🎉</Text>
          <Text style={styles.celebrationSubtitle}>View my circle →</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
  },
  headerSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  circleCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  visualizationContainer: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 135, 0.15)',
  },
  centerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleName: {
    fontFamily: FONTS.heading,
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
  memberCount: {
    fontFamily: FONTS.body,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  orbitMember: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  orbitEmoji: {
    fontSize: 16,
  },
  peaceScore: {
    marginTop: SPACING.md,
  },
  peaceScoreText: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 13,
  },
  viewLink: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  addCircleButton: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  addCircleDashed: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCircleText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(26,22,18,0.97)',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    minHeight: '70%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.muted,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: COLORS.sageGreen,
  },
  stepContent: {
    flex: 1,
    marginTop: SPACING.md,
  },
  stepTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  stepLabel: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.muted,
    fontSize: 13,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  chip: {
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipActive: {
    backgroundColor: COLORS.sageGreen,
  },
  chipText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 14,
  },
  chipTextActive: {
    color: COLORS.backgroundDark,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundDark,
  },
  emojiOptionActive: {
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  emojiText: {
    fontSize: 24,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  previewCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  previewEmoji: {
    fontSize: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  backText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  contactEmoji: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  contactName: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.sageGreen,
    borderColor: COLORS.sageGreen,
  },
  countText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  privacyOptionActive: {
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  privacyLabel: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 15,
    marginLeft: SPACING.md,
  },
  privacyLabelActive: {
    color: COLORS.sageGreen,
  },
  recommendedBadge: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendedText: {
    fontFamily: FONTS.body,
    color: COLORS.backgroundDark,
    fontSize: 10,
  },
  createButton: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  createButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationEmoji: {
    fontSize: 56,
  },
  celebrationTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 24,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.sageGreen,
    fontSize: 16,
    marginTop: SPACING.md,
  },
});