import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getStatusColor } from '../../src/constants/theme';
import { useAppStore } from '../../src/store/appStore';
import { useAuthStore, SavedPlace } from '../../src/store/authStore';
import { userApi, circleApi } from '../../src/services/api';
import { ProfilePopup } from '../../src/components/ProfilePopup';

const { width, height } = Dimensions.get('window');

interface MapPinProps {
  user: any;
  x: number;
  y: number;
  onPress: () => void;
  delay?: number;
  isCurrentUser?: boolean;
}

const MapPin: React.FC<MapPinProps> = ({ user, x, y, onPress, delay = 0, isCurrentUser = false }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusColor = getStatusColor(user.status);
  
  useEffect(() => {
    // Bounce in animation
    setTimeout(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, delay);
    
    // Pulse animation for travelling users
    if (user.status === 'travelling') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [delay, user.status]);
  
  return (
    <Animated.View
      style={[
        styles.pinContainer,
        {
          left: x,
          top: y,
          transform: [
            { scale: bounceAnim },
            { translateY: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress}>
        <Animated.View style={[styles.pinGlow, { backgroundColor: statusColor, transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.pinTeardrop, { backgroundColor: statusColor }]}>
          <View style={styles.pinInner}>
            <Text style={styles.pinEmoji}>{user.emoji}</Text>
          </View>
          <View style={styles.pinPoint} />
        </View>
        {isCurrentUser && (
          <View style={styles.starBadge}>
            <Text style={styles.starText}>★</Text>
          </View>
        )}
        {user.status === 'travelling' && (
          <View style={styles.travelBadge}>
            <Text style={styles.travelBadgeText}>✈️</Text>
          </View>
        )}
        {user.battery_level && user.battery_level < 20 && (
          <View style={styles.batteryBadge}>
            <Text style={styles.batteryText}>🔋{user.battery_level}%</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.pinLabel}>
        <Text style={styles.pinName}>{user.name}</Text>
        <Text style={styles.pinStatus}>{user.status_emoji}</Text>
      </View>
    </Animated.View>
  );
};

export default function MapScreen() {
  const { users, circles, currentUser, selectedMemberForPopup, setSelectedMemberForPopup, setUsers, setCircles, setCurrentUser } = useAppStore();
  const { savedPlaces, addSavedPlace, removeSavedPlace } = useAuthStore();
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceType, setNewPlaceType] = useState<SavedPlace['type']>('custom');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [usersRes, circlesRes, currentUserRes] = await Promise.all([
        userApi.getAll(),
        circleApi.getAll(),
        userApi.getCurrent(),
      ]);
      setUsers(usersRes.data);
      setCircles(circlesRes.data);
      setCurrentUser(currentUserRes.data);
      if (circlesRes.data.length > 0) {
        setSelectedCircle(circlesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };
  
  const filteredUsers = selectedCircle
    ? users.filter(u => {
        const circle = circles.find(c => c.id === selectedCircle);
        return circle?.member_ids.includes(u.id);
      })
    : users;
  
  // Mock positions for users on map
  const pinPositions = [
    { x: width * 0.3, y: height * 0.25 },
    { x: width * 0.6, y: height * 0.2 },
    { x: width * 0.2, y: height * 0.35 },
    { x: width * 0.7, y: height * 0.4 },
    { x: width * 0.5, y: height * 0.15 },
  ];
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.muted} />
          <Text style={styles.searchPlaceholder}>Search your circles...</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCircle && styles.filterChipActive]}
            onPress={() => setSelectedCircle(null)}
          >
            <Text style={[styles.filterChipText, !selectedCircle && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {circles.map(circle => (
            <TouchableOpacity
              key={circle.id}
              style={[styles.filterChip, selectedCircle === circle.id && styles.filterChipActive]}
              onPress={() => setSelectedCircle(circle.id)}
            >
              <Text style={styles.filterChipEmoji}>{circle.emoji}</Text>
              <Text style={[styles.filterChipText, selectedCircle === circle.id && styles.filterChipTextActive]}>
                {circle.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Map */}
      <View style={styles.map}>
        {/* Sky gradient */}
        <View style={styles.sky} />
        
        {/* Ground */}
        <View style={styles.ground}>
          {/* Roads */}
          <View style={styles.mainRoad} />
          <View style={[styles.road, { left: '30%', top: '20%', width: 150, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.road, { right: '20%', top: '40%', width: 100, transform: [{ rotate: '-30deg' }] }]} />
          
          {/* Parks */}
          <View style={[styles.park, { left: '10%', top: '30%' }]} />
          <View style={[styles.park, { right: '15%', bottom: '25%', width: 80, height: 60 }]} />
          
          {/* Water */}
          <View style={styles.water} />
          
          {/* Buildings */}
          <View style={[styles.building, { left: '20%', top: '15%' }]} />
          <View style={[styles.building, { left: '45%', top: '25%', width: 40, height: 50 }]} />
          <View style={[styles.building, { right: '25%', top: '35%', width: 35, height: 40 }]} />
        </View>
        
        {/* Pins */}
        {filteredUsers.map((user, index) => (
          <MapPin
            key={user.id}
            user={user}
            x={pinPositions[index % pinPositions.length].x}
            y={pinPositions[index % pinPositions.length].y}
            delay={index * 200}
            isCurrentUser={user.id === currentUser?.id}
            onPress={() => setSelectedMemberForPopup(user)}
          />
        ))}
      </View>
      
      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="compass" size={18} color={COLORS.backgroundCard} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlButtonText}>3D</Text>
        </TouchableOpacity>
      </View>
      
      {/* Members Strip */}
      <View style={styles.membersStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={styles.memberChip}
              onPress={() => setSelectedMemberForPopup(user)}
            >
              <Text style={styles.memberEmoji}>{user.emoji}</Text>
              <Text style={styles.memberName}>{user.name}</Text>
              <View style={[styles.memberDot, { backgroundColor: getStatusColor(user.status) }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ProfilePopup
        user={selectedMemberForPopup}
        visible={!!selectedMemberForPopup}
        onClose={() => setSelectedMemberForPopup(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 46, 34, 0.95)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchPlaceholder: {
    fontFamily: FONTS.body,
    color: COLORS.muted,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  filterRow: {
    marginTop: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 46, 34, 0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.sageGreen,
  },
  filterChipEmoji: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  filterChipText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: COLORS.backgroundDark,
  },
  map: {
    flex: 1,
    position: 'relative',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#0A1628',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: '#C8D8A8',
  },
  mainRoad: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 220, 80, 0.6)',
  },
  road: {
    position: 'absolute',
    height: 12,
    backgroundColor: 'rgba(255, 220, 80, 0.4)',
  },
  park: {
    position: 'absolute',
    width: 60,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#7A9E87',
    opacity: 0.6,
  },
  water: {
    position: 'absolute',
    bottom: '10%',
    right: '5%',
    width: 120,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7EC8E3',
    opacity: 0.7,
  },
  building: {
    position: 'absolute',
    width: 30,
    height: 45,
    backgroundColor: '#E8E0D0',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  pinTeardrop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  pinInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinEmoji: {
    fontSize: 20,
  },
  pinPoint: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'inherit',
  },
  starBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: {
    color: COLORS.white,
    fontSize: 10,
  },
  travelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.navyBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  travelBadgeText: {
    fontSize: 10,
  },
  batteryBadge: {
    position: 'absolute',
    top: -20,
    left: -10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  batteryText: {
    fontFamily: FONTS.body,
    color: COLORS.gold,
    fontSize: 10,
  },
  pinLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
  },
  pinName: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 11,
  },
  pinStatus: {
    fontSize: 10,
    marginLeft: 4,
  },
  mapControls: {
    position: 'absolute',
    right: SPACING.md,
    top: '35%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  controlButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.backgroundCard,
    fontSize: 18,
  },
  membersStrip: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 46, 34, 0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  memberEmoji: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  memberName: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.white,
    fontSize: 13,
  },
  memberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: SPACING.sm,
  },
});