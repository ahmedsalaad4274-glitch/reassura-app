import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');

interface DemoTooltipProps {
  visible: boolean;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'center';
  highlightArea?: { x: number; y: number; width: number; height: number };
  onNext: () => void;
  onExit: () => void;
}

export const DemoTooltip: React.FC<DemoTooltipProps> = ({
  visible,
  step,
  totalSteps,
  title,
  description,
  position,
  highlightArea,
  onNext,
  onExit,
}) => {
  if (!visible) return null;
  
  const tooltipTop = position === 'top' ? 120 : position === 'bottom' ? height - 280 : height / 2 - 80;
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Highlight cutout effect */}
        {highlightArea && (
          <View
            style={[
              styles.highlight,
              {
                left: highlightArea.x - 10,
                top: highlightArea.y - 10,
                width: highlightArea.width + 20,
                height: highlightArea.height + 20,
              },
            ]}
          />
        )}
        
        {/* Exit button */}
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Ionicons name="close" size={20} color={COLORS.white} />
          <Text style={styles.exitText}>Exit demo</Text>
        </TouchableOpacity>
        
        {/* Demo badge */}
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO</Text>
        </View>
        
        {/* Tooltip card */}
        <View style={[styles.tooltipCard, { top: tooltipTop }]}>
          <View style={styles.tooltipAccent} />
          <View style={styles.tooltipContent}>
            <Text style={styles.tooltipTitle}>{title}</Text>
            <Text style={styles.tooltipDescription}>{description}</Text>
            
            <View style={styles.tooltipFooter}>
              <Text style={styles.progressText}>{step} of {totalSteps}</Text>
              <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextButtonText}>
                  {step === totalSteps ? 'Finish' : 'Next'} →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DEMO_STEPS = [
  {
    title: 'Your Peace Score',
    description: 'This is your Peace Score — a glance tells you everyone is safe 🌿',
    position: 'top' as const,
    route: '/',
  },
  {
    title: 'Your Circle',
    description: 'Each circle shows a family member or friend. Green means safe. Tap to see their update.',
    position: 'top' as const,
    route: '/',
  },
  {
    title: 'Switch Circles',
    description: 'Swipe left and right to switch between your circles — Family, Friends, and more',
    position: 'top' as const,
    route: '/',
  },
  {
    title: 'Emergency SOS',
    description: 'This emergency button is always here. One tap notifies your entire circle instantly. Always free.',
    position: 'bottom' as const,
    route: '/',
  },
  {
    title: 'Family Map',
    description: 'See where your circle is at a glance. Pins show their status — never exact GPS.',
    position: 'center' as const,
    route: '/map',
  },
  {
    title: 'Your Circles',
    description: 'Your circles pulse gently — like a heartbeat. Tap to see who\'s inside.',
    position: 'center' as const,
    route: '/circles',
  },
  {
    title: 'Travel Mode',
    description: 'When someone travels, follow their journey here. Swipe between flight details, the map, and your travel profile.',
    position: 'top' as const,
    route: '/travel',
  },
];

interface DemoOverlayProps {
  onNavigate: (route: string) => void;
}

export const DemoOverlay: React.FC<DemoOverlayProps> = ({ onNavigate }) => {
  const { isDemoMode, demoStep, setDemoStep, setDemoMode } = useAuthStore();
  
  const handleNext = () => {
    if (demoStep >= DEMO_STEPS.length) {
      setDemoMode(false);
      return;
    }
    
    const nextStep = demoStep + 1;
    setDemoStep(nextStep);
    
    if (nextStep <= DEMO_STEPS.length) {
      const nextRoute = DEMO_STEPS[nextStep - 1]?.route;
      if (nextRoute && nextRoute !== DEMO_STEPS[demoStep - 1]?.route) {
        onNavigate(nextRoute);
      }
    }
  };
  
  const handleExit = () => {
    setDemoMode(false);
  };
  
  if (!isDemoMode || demoStep === 0 || demoStep > DEMO_STEPS.length) {
    return null;
  }
  
  const currentStep = DEMO_STEPS[demoStep - 1];
  
  return (
    <DemoTooltip
      visible={isDemoMode}
      step={demoStep}
      totalSteps={DEMO_STEPS.length}
      title={currentStep.title}
      description={currentStep.description}
      position={currentStep.position}
      onNext={handleNext}
      onExit={handleExit}
    />
  );
};

export const DemoEndScreen: React.FC<{ visible: boolean; onSignUp: () => void; onExplore: () => void }> = ({
  visible,
  onSignUp,
  onExplore,
}) => {
  if (!visible) return null;
  
  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.endScreen}>
        <Animated.View style={styles.pulsatingCircles}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </Animated.View>
        
        <Text style={styles.endTitle}>That's Reassura 🌿</Text>
        <Text style={styles.endTagline}>Presence without pressure.</Text>
        <Text style={styles.endQuestion}>Ready to invite your circle?</Text>
        
        <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
          <Text style={styles.signUpButtonText}>Sign up free →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
          <Text style={styles.exploreButtonText}>Explore on your own</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
    borderRadius: BORDER_RADIUS.lg,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  exitText: {
    fontFamily: FONTS.body,
    color: COLORS.white,
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
  demoBadge: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: COLORS.terracotta,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  demoBadgeText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.white,
    fontSize: 10,
    letterSpacing: 1,
  },
  tooltipCard: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tooltipAccent: {
    width: 4,
    backgroundColor: COLORS.sageGreen,
  },
  tooltipContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  tooltipTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 18,
    marginBottom: SPACING.sm,
  },
  tooltipDescription: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 14,
    lineHeight: 20,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  progressText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 12,
  },
  nextButton: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  nextButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 14,
  },
  endScreen: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  pulsatingCircles: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.sageGreen,
    opacity: 0.3,
  },
  circle1: {
    width: 100,
    height: 100,
  },
  circle2: {
    width: 150,
    height: 150,
  },
  circle3: {
    width: 200,
    height: 200,
  },
  endTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  endTagline: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: SPACING.xl,
  },
  endQuestion: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: SPACING.lg,
  },
  signUpButton: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  signUpButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
  },
  exploreButton: {
    paddingVertical: SPACING.md,
  },
  exploreButtonText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
});
