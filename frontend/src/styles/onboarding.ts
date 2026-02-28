import { StyleSheet } from 'react-native';

export const ONBOARDING = {
  bg: '#1A1612',
  sage: '#7A9E87',
  white: '#FFFFFF',
  muted: 'rgba(255,255,255,0.68)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.08)',
  heading: 'Fraunces_700Bold',
  body: 'DMSans_400Regular',
  bodyMed: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING.bg,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  safeTop: {
    paddingTop: 54,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.45)',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressDotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: ONBOARDING.sage,
  },
  title: {
    fontFamily: ONBOARDING.heading,
    color: ONBOARDING.white,
    fontSize: 19,
    lineHeight: 26,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: ONBOARDING.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    marginBottom: 16,
    lineHeight: 19,
  },
  btnPrimary: {
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  btnPrimaryText: {
    fontFamily: ONBOARDING.heading,
    color: ONBOARDING.white,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  btnGhost: {
    paddingVertical: 10,
    alignItems: 'center' as const,
  },
  btnGhostText: {
    fontFamily: ONBOARDING.body,
    textAlign: 'center' as const,
    fontSize: 12,
    color: 'rgba(255,255,255,0.60)',
  },
});
