// Reassura Brand Theme — Premium Glassmorphism
export const COLORS = {
  // Background
  backgroundDark: '#1A1612',
  backgroundCard: 'rgba(255,255,255,0.04)',

  // Primary
  sageGreen: '#7A9E87',
  sageLight: '#A8C5B0',
  sageDark: '#5A8A6A',

  // Accent
  cream: '#F7F3EE',
  terracotta: '#C4694F',
  gold: '#C9A84C',
  navyBlue: '#3D5A99',

  // Neutral
  muted: 'rgba(255,255,255,0.4)',
  white: '#FFFFFF',
  whiteTransparent: 'rgba(255,255,255,0.4)',
  whiteTransparent25: 'rgba(255,255,255,0.25)',

  // Text hierarchy
  textPrimary: '#FFFFFF',
  textBody: 'rgba(255,255,255,0.75)',
  textMuted: 'rgba(255,255,255,0.4)',

  // Status colors
  statusSafe: '#5A8A6A',
  statusOnTheWay: '#C9A84C',
  statusTravelling: '#3D5A99',
  statusEmergency: '#C4694F',

  // Card
  cardBorder: 'rgba(255,255,255,0.1)',
  cardShadow: '0 4px 24px rgba(0,0,0,0.2)',
};

export const FONTS = {
  heading: 'Fraunces_400Regular',
  headingBold: 'Fraunces_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Glassmorphism card style — use spread in StyleSheet
export const GLASS_CARD = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
};

export const STATUS_CONFIG = {
  home: { emoji: '\u{1F3E0}', color: COLORS.sageGreen, label: 'Home' },
  on_the_way: { emoji: '\u{1F697}', color: COLORS.gold, label: 'On the way' },
  arrived: { emoji: '\u{1F4CD}', color: COLORS.sageGreen, label: 'Arrived' },
  all_good: { emoji: '\u2764\uFE0F', color: COLORS.sageGreen, label: 'All good' },
  offline: { emoji: '\u{1F4A4}', color: 'rgba(255,255,255,0.4)', label: 'Offline for the night' },
  travelling: { emoji: '\u2708\uFE0F', color: COLORS.navyBlue, label: 'Travelling' },
  goodnight: { emoji: '\u{1F319}', color: COLORS.gold, label: 'Goodnight' },
  safe_walk: { emoji: '\u{1F6B6}', color: COLORS.sageGreen, label: 'Safe Walk' },
};

export const getStatusColor = (status: string): string => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || 'rgba(255,255,255,0.4)';
};
