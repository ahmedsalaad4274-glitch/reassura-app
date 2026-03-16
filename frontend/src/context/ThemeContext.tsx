import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT = {
  background:   '#FDFAF7',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F7F3EE',
  border:       'rgba(61,46,34,0.09)',
  borderStrong: 'rgba(61,46,34,0.18)',
  textPrimary:  '#3D2E22',
  textSecondary:'#8C7B6E',
  textTertiary: 'rgba(61,46,34,0.38)',
  sage:         '#7A9E87',
  sageDark:     '#4A7A5A',
  sageLight:    '#A8C5B0',
  terra:        '#C4704A',
  amber:        '#C9A84C',
  amberDark:    '#7A5A10',
  blue:         '#4A6AAA',
  blueDark:     '#2A3D70',
  brown:        '#3D2E22',
  navBg:        '#FFFFFF',
  navBorder:    'rgba(61,46,34,0.07)',
  navActive:    '#4A7A5A',
  navInactive:  'rgba(61,46,34,0.35)',
  statusBar:    'dark-content' as const,
  isDark:       false,
  // Cards & glass
  card:         'rgba(61,46,34,0.04)',
  cardBorder:   'rgba(61,46,34,0.09)',
  // Status
  statusDot:    '#7A9E87',
  muted:        '#8C7B6E',
  // Overlays
  overlay:      'rgba(253,250,247,0.92)',
  sheetBg:      '#FFFFFF',
  // Input
  inputBg:      'rgba(61,46,34,0.04)',
  inputBorder:  'rgba(61,46,34,0.12)',
  // Specific
  streakBg:     'rgba(255,140,0,0.10)',
  streakBorder: 'rgba(255,140,0,0.22)',
  streakText:   '#C97A00',
  chipBg:       'rgba(61,46,34,0.06)',
  dotInactive:  'rgba(61,46,34,0.12)',
};

export const DARK = {
  background:   '#0A0806',
  surface:      'rgba(255,255,255,0.04)',
  surfaceAlt:   'rgba(255,255,255,0.07)',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  textPrimary:  'rgba(247,243,238,0.92)',
  textSecondary:'rgba(247,243,238,0.38)',
  textTertiary: 'rgba(247,243,238,0.22)',
  sage:         '#7A9E87',
  sageDark:     '#4A7A5A',
  sageLight:    '#A8C5B0',
  terra:        '#C4704A',
  amber:        '#C9A84C',
  amberDark:    '#A07820',
  blue:         '#4A6AAA',
  blueDark:     '#2A3D70',
  brown:        '#3D2E22',
  navBg:        'rgba(10,8,6,0.96)',
  navBorder:    'rgba(255,255,255,0.06)',
  navActive:    '#7A9E87',
  navInactive:  'rgba(247,243,238,0.35)',
  statusBar:    'light-content' as const,
  isDark:       true,
  // Cards & glass
  card:         'rgba(255,255,255,0.04)',
  cardBorder:   'rgba(255,255,255,0.1)',
  // Status
  statusDot:    '#7A9E87',
  muted:        'rgba(255,255,255,0.4)',
  // Overlays
  overlay:      'rgba(10,8,6,0.82)',
  sheetBg:      'rgba(26,22,18,0.97)',
  // Input
  inputBg:      'rgba(255,255,255,0.05)',
  inputBorder:  'rgba(255,255,255,0.08)',
  // Specific
  streakBg:     'rgba(255,140,0,0.14)',
  streakBorder: 'rgba(255,140,0,0.28)',
  streakText:   '#FF9500',
  chipBg:       'rgba(255,255,255,0.06)',
  dotInactive:  'rgba(255,255,255,0.15)',
};

export type ThemeTokens = typeof LIGHT;

interface ThemeContextType {
  theme: ThemeTokens;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: LIGHT,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('reassura_theme').then(val => {
      if (val === 'dark') setIsDark(true);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('reassura_theme', next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
