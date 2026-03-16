import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { FONTS } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

function TabIcon({ name, focused, isCenter = false, activeColor, inactiveColor, cardColor }: { name: string; focused: boolean; isCenter?: boolean; activeColor: string; inactiveColor: string; cardColor: string }) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    if (isCenter) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
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
      pulse.start();
      return () => pulse.stop();
    }
  }, [isCenter]);
  
  if (isCenter) {
    return (
      <View style={styles.centerTabContainer}>
        <Animated.View
          style={[
            styles.centerTabGlow,
            {
              backgroundColor: activeColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.15],
                outputRange: [0.4, 0.8],
              }),
            },
          ]}
        />
        <View style={[styles.centerTab, { backgroundColor: cardColor, borderColor: activeColor }, focused && { backgroundColor: `${activeColor}33` }]}>
          <Ionicons
            name="people"
            size={26}
            color={focused ? activeColor : '#FFFFFF'}
          />
        </View>
      </View>
    );
  }
  
  return (
    <Ionicons
      name={name as any}
      size={24}
      color={focused ? activeColor : inactiveColor}
    />
  );
}

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: theme.navBg, borderTopColor: theme.navBorder }],
        tabBarActiveTintColor: theme.navActive,
        tabBarInactiveTintColor: theme.navInactive,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <View style={[styles.tabBarBackground, { backgroundColor: theme.navBg }]}>
            <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} activeColor={theme.navActive} inactiveColor={theme.navInactive} cardColor={theme.background} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} activeColor={theme.navActive} inactiveColor={theme.navInactive} cardColor={theme.background} />,
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Circles',
          tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} isCenter activeColor={theme.navActive} inactiveColor={theme.navInactive} cardColor={theme.background} />,
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: 'Travel',
          tabBarIcon: ({ focused }) => <TabIcon name="airplane" focused={focused} activeColor={theme.navActive} inactiveColor={theme.navInactive} cardColor={theme.background} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} activeColor={theme.navActive} inactiveColor={theme.navInactive} cardColor={theme.background} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  tabBarLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    marginTop: 4,
  },
  centerTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerTabGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});