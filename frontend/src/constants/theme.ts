// Reassura Brand Theme
export const COLORS = {
  // Background
  backgroundDark: '#1A1612',
  backgroundCard: '#3D2E22',
  
  // Primary
  sageGreen: '#7A9E87',
  sageLight: '#A8C5B0',
  sageDark: '#2C3E2D',
  
  // Accent
  cream: '#F7F3EE',
  terracotta: '#C4694F',
  gold: '#C9A84C',
  navyBlue: '#3D5A99',
  
  // Neutral
  muted: '#8C7B6E',
  white: '#FFFFFF',
  whiteTransparent: 'rgba(255, 255, 255, 0.4)',
  whiteTransparent25: 'rgba(255, 255, 255, 0.25)',
  
  // Status colors
  statusSafe: '#5A8A6A',
  statusOnTheWay: '#C9A84C',
  statusTravelling: '#3D5A99',
  statusEmergency: '#C4694F',
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
  lg: 20,
  xl: 24,
  full: 9999,
};

export const STATUS_CONFIG = {
  home: { emoji: '🏠', color: COLORS.sageGreen, label: 'Home' },
  on_the_way: { emoji: '🚗', color: COLORS.gold, label: 'On the way' },
  arrived: { emoji: '📍', color: COLORS.sageGreen, label: 'Arrived' },
  all_good: { emoji: '❤️', color: COLORS.sageGreen, label: 'All good' },
  offline: { emoji: '💤', color: COLORS.muted, label: 'Offline for the night' },
  travelling: { emoji: '✈️', color: COLORS.navyBlue, label: 'Travelling' },
};

export const getStatusColor = (status: string): string => {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || COLORS.muted;
};