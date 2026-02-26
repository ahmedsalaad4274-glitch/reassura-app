import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS } from '../../src/constants/theme';

function TabIcon({ name, focused, isCenter = false }: { name: string; focused: boolean; isCenter?: boolean }) {
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
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.15],
                outputRange: [0.4, 0.8],
              }),
            },
          ]}
        />
        <View style={[styles.centerTab, focused && styles.centerTabActive]}>
          <Ionicons
            name="people"
            size={26}
            color={focused ? COLORS.sageGreen : COLORS.white}
          />
        </View>
      </View>
    );
  }
  
  return (
    <Ionicons
      name={name as any}
      size={24}
      color={focused ? COLORS.sageGreen : COLORS.whiteTransparent}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.sageGreen,
        tabBarInactiveTintColor: COLORS.whiteTransparent,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          title: 'Circles',
          tabBarIcon: ({ focused }) => <TabIcon name="people" focused={focused} isCenter />,
        }}
      />
      <Tabs.Screen
        name="travel"
        options={{
          title: 'Travel',
          tabBarIcon: ({ focused }) => <TabIcon name="airplane" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(26, 22, 18, 0.95)',
    borderTopWidth: 0,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 18, 0.9)',
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
    backgroundColor: COLORS.sageGreen,
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.sageGreen,
  },
  centerTabActive: {
    backgroundColor: 'rgba(122, 158, 135, 0.2)',
  },
});