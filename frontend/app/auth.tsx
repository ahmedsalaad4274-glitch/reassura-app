import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';
import { CrossPlatformPager } from '../src/components/CrossPlatformPager';

const { width, height } = Dimensions.get('window');

// Splash Screen Component
const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
    
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    
    const timer = setTimeout(onComplete, 2500);
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, []);
  
  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
      <Animated.Text style={[styles.splashEmoji, { transform: [{ scale: pulseAnim }] }]}>
        🌿
      </Animated.Text>
      <Text style={styles.splashTitle}>Reassura</Text>
      <Text style={styles.splashTagline}>Presence without pressure.</Text>
    </Animated.View>
  );
};

// Onboarding Carousel
const OnboardingCarousel: React.FC<{ onComplete: () => void; onDemo: () => void }> = ({ onComplete, onDemo }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const pages = [
    {
      emoji: '💚',
      title: 'Stay close without checking',
      body: 'Know your people are safe with one quiet glance. No feeds, no noise, just peace of mind.',
    },
    {
      emoji: '📍',
      title: 'Presence without pressure',
      body: 'Your circle shares where they are voluntarily. No tracking. No surveillance. Just care.',
    },
    {
      emoji: '🚨',
      title: 'Safety is never behind a paywall',
      body: 'Emergency alerts, travel mode and core features are free forever. Because some things shouldn\'t cost money.',
    },
  ];
  
  return (
    <View style={styles.carouselContainer}>
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <CrossPlatformPager
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.carouselPage}>
            <View style={styles.illustrationContainer}>
              <View style={styles.pulsatingCircles}>
                <Animated.View style={[styles.circleRing, styles.ring1]} />
                <Animated.View style={[styles.circleRing, styles.ring2]} />
                <Animated.View style={[styles.circleRing, styles.ring3]} />
              </View>
              <Text style={styles.pageEmoji}>{page.emoji}</Text>
            </View>
            <Text style={styles.pageTitle}>{page.title}</Text>
            <Text style={styles.pageBody}>{page.body}</Text>
          </View>
        ))}
      </CrossPlatformPager>
      
      <View style={styles.paginationDots}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentPage === index && styles.dotActive]}
          />
        ))}
      </View>
      
      <View style={styles.carouselFooter}>
        <TouchableOpacity style={styles.demoLink} onPress={onDemo}>
          <Text style={styles.demoLinkText}>See a demo first →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={onComplete}>
          <Text style={styles.nextButtonText}>Get Started →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Sign Up Screen
const SignUpScreen: React.FC<{ onContinue: (method: string) => void }> = ({ onContinue }) => {
  return (
    <View style={styles.signUpContainer}>
      <Text style={styles.signUpTitle}>Join Reassura</Text>
      <Text style={styles.signUpSubtitle}>Create your circle in seconds</Text>
      
      <TouchableOpacity style={styles.authOption} onPress={() => onContinue('phone')}>
        <Text style={styles.authOptionIcon}>📱</Text>
        <Text style={styles.authOptionText}>Continue with phone number</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.authOption} onPress={() => onContinue('email')}>
        <Text style={styles.authOptionIcon}>📧</Text>
        <Text style={styles.authOptionText}>Continue with email</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.authOption, styles.authOptionDisabled]}>
        <Text style={styles.authOptionIcon}>🍎</Text>
        <Text style={[styles.authOptionText, styles.authOptionTextDisabled]}>Continue with Apple</Text>
        <Text style={styles.comingSoonBadge}>Coming soon</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.authOption, styles.authOptionDisabled]}>
        <Text style={styles.authOptionIcon}>🔵</Text>
        <Text style={[styles.authOptionText, styles.authOptionTextDisabled]}>Continue with Google</Text>
        <Text style={styles.comingSoonBadge}>Coming soon</Text>
      </TouchableOpacity>
      
      <Text style={styles.signInLink}>
        Already have an account? <Text style={styles.signInLinkBold}>Sign in</Text>
      </Text>
    </View>
  );
};

// OTP Input Screen
const OTPScreen: React.FC<{ method: string; onVerify: () => void; onBack: () => void }> = ({ method, onVerify, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newCode.every(c => c !== '')) {
      setTimeout(onVerify, 500);
    }
  };
  
  return (
    <KeyboardAvoidingView style={styles.otpContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      <Text style={styles.otpTitle}>Enter the code</Text>
      <Text style={styles.otpSubtitle}>
        We sent a 6-digit code to your {method === 'phone' ? 'phone' : 'email'}
      </Text>
      
      <View style={styles.otpInputs}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => inputRefs.current[index] = ref}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </View>
      
      <Text style={styles.otpHint}>For demo, enter any 6 digits</Text>
      
      <TouchableOpacity style={styles.resendLink}>
        <Text style={styles.resendText}>Didn't receive it? Resend code</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// Profile Setup Screen
const ProfileSetupScreen: React.FC<{ onComplete: (name: string, emoji: string, photo: string | null) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👩🏾');
  const [photo, setPhoto] = useState<string | null>(null);
  
  const emojis = [
    '👩🏾', '👨🏾', '🧑🏾', '👧🏾', '👦🏾', '👴🏾', '👵🏾',
    '👩🏿', '👨🏿', '🧑🏿', '👩🏽', '👨🏽', '🧑🏽',
    '👩🏼', '👨🏼', '👩🏻', '👨🏻', '👶🏾', '👩🏾‍🦱', '👨🏾‍🦱',
    '👩🏾‍🦳', '👨🏾‍🦳', '🧔🏾', '👱🏾', '👱🏾‍♀️',
  ];
  
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
    }
  };
  
  const handleContinue = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      onComplete(name, selectedEmoji, photo);
    }
  };
  
  return (
    <KeyboardAvoidingView style={styles.profileContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
      </View>
      
      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>What should your circle call you?</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={COLORS.muted}
            autoFocus
          />
        </View>
      )}
      
      {step === 2 && (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Pick your look</Text>
          
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
                <Ionicons name="close-circle" size={28} color={COLORS.terracotta} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.emojiGrid}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiOptionSelected]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color={COLORS.sageGreen} />
                <Text style={styles.uploadButtonText}>Upload a photo instead</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
      
      <TouchableOpacity
        style={[styles.continueButton, (!name.trim() && step === 1) && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={!name.trim() && step === 1}
      >
        <Text style={styles.continueButtonText}>Continue →</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// Welcome Complete Screen
const WelcomeCompleteScreen: React.FC<{ name: string; onStart: () => void }> = ({ name, onStart }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <View style={styles.welcomeContainer}>
      <Animated.View style={[styles.welcomeCircles, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.circleRing, styles.ring1]} />
        <View style={[styles.circleRing, styles.ring2]} />
        <View style={[styles.circleRing, styles.ring3]} />
      </Animated.View>
      
      <Text style={styles.welcomeTitle}>Welcome to Reassura 🌿</Text>
      <Text style={styles.welcomeSubtitle}>{name}'s circle is ready.</Text>
      <Text style={styles.welcomeMessage}>Let your people know you're safe</Text>
      
      <TouchableOpacity style={styles.goButton} onPress={onStart}>
        <Text style={styles.goButtonText}>Go to my circle →</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Onboarding Screen
export default function OnboardingScreen() {
  const router = useRouter();
  const { setDemoMode, completeOnboarding } = useAuthStore();
  const [stage, setStage] = useState<'splash' | 'carousel' | 'signup' | 'otp' | 'profile' | 'complete'>('splash');
  const [authMethod, setAuthMethod] = useState<string>('');
  const [userName, setUserName] = useState('');
  
  const handleDemo = () => {
    setDemoMode(true);
    router.replace('/');
  };
  
  const handleSignUpContinue = (method: string) => {
    setAuthMethod(method);
    setStage('otp');
  };
  
  const handleOTPVerify = () => {
    setStage('profile');
  };
  
  const handleProfileComplete = (name: string, emoji: string, photo: string | null) => {
    setUserName(name);
    completeOnboarding(name, emoji, photo);
    setStage('complete');
  };
  
  const handleStart = () => {
    router.replace('/');
  };
  
  return (
    <View style={styles.container}>
      {stage === 'splash' && <SplashScreen onComplete={() => setStage('carousel')} />}
      {stage === 'carousel' && <OnboardingCarousel onComplete={() => setStage('signup')} onDemo={handleDemo} />}
      {stage === 'signup' && <SignUpScreen onContinue={handleSignUpContinue} />}
      {stage === 'otp' && <OTPScreen method={authMethod} onVerify={handleOTPVerify} onBack={() => setStage('signup')} />}
      {stage === 'profile' && <ProfileSetupScreen onComplete={handleProfileComplete} />}
      {stage === 'complete' && <WelcomeCompleteScreen name={userName} onStart={handleStart} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  // Splash styles
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  splashTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  splashTagline: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 16,
    fontStyle: 'italic',
  },
  // Carousel styles
  carouselContainer: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  pager: {
    flex: 1,
  },
  carouselPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pulsatingCircles: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  circleRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.sageGreen,
    opacity: 0.3,
    top: '50%',
    left: '50%',
  },
  ring1: {
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
  },
  ring2: {
    width: 150,
    height: 150,
    marginLeft: -75,
    marginTop: -75,
  },
  ring3: {
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
  },
  pageEmoji: {
    fontSize: 60,
  },
  pageTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pageBody: {
    fontFamily: FONTS.body,
    color: COLORS.cream,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.muted,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.sageGreen,
    width: 24,
  },
  carouselFooter: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
  },
  demoLink: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  demoLinkText: {
    fontFamily: FONTS.body,
    color: COLORS.sageGreen,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: COLORS.sageGreen,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  nextButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
    textAlign: 'center',
  },
  // Sign up styles
  signUpContainer: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: SPACING.lg,
  },
  signUpTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  signUpSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 16,
    marginBottom: SPACING.xl,
  },
  authOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCard,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  authOptionDisabled: {
    opacity: 0.5,
  },
  authOptionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  authOptionText: {
    flex: 1,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 15,
  },
  authOptionTextDisabled: {
    color: COLORS.muted,
  },
  comingSoonBadge: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 11,
  },
  signInLink: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  signInLinkBold: {
    color: COLORS.sageGreen,
    fontFamily: FONTS.bodyMedium,
  },
  // OTP styles
  otpContainer: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  otpTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  otpSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: SPACING.xl,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.md,
    textAlign: 'center',
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 24,
  },
  otpHint: {
    fontFamily: FONTS.body,
    color: COLORS.sageGreen,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resendLink: {
    alignItems: 'center',
  },
  resendText: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
  },
  // Profile styles
  profileContainer: {
    flex: 1,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.backgroundCard,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
    marginBottom: SPACING.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.sageGreen,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  nameInput: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    fontFamily: FONTS.heading,
    color: COLORS.white,
    fontSize: 24,
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emojiOption: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundCard,
  },
  emojiOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.sageGreen,
  },
  emojiText: {
    fontSize: 28,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  uploadButtonText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.sageGreen,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  photoPreview: {
    alignItems: 'center',
  },
  photoImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.sageGreen,
  },
  removePhoto: {
    position: 'absolute',
    top: 0,
    right: width / 2 - 85,
  },
  continueButton: {
    backgroundColor: COLORS.sageGreen,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: 50,
    borderRadius: BORDER_RADIUS.lg,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
    textAlign: 'center',
  },
  // Welcome styles
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  welcomeCircles: {
    position: 'absolute',
    width: 300,
    height: 300,
  },
  welcomeTitle: {
    fontFamily: FONTS.headingBold,
    color: COLORS.white,
    fontSize: 28,
    marginBottom: SPACING.sm,
    zIndex: 1,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.body,
    color: COLORS.sageLight,
    fontSize: 18,
    marginBottom: SPACING.md,
    zIndex: 1,
  },
  welcomeMessage: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: SPACING.xl,
    zIndex: 1,
  },
  goButton: {
    backgroundColor: COLORS.sageGreen,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    zIndex: 1,
  },
  goButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundDark,
    fontSize: 16,
  },
});
