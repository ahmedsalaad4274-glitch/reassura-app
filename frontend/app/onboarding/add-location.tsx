import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

const { width: SCREEN_W } = Dimensions.get('window');

const MOCK_RESULTS: Record<string, string> = {
  'london': 'Central London',
  'clapton': 'Clapton, Hackney',
  'hackney': 'Hackney, London',
  'shoreditch': 'Shoreditch, London',
  'brixton': 'Brixton, Lambeth',
  'camden': 'Camden Town',
  'islington': 'Islington, London',
  'stratford': 'Stratford, Newham',
  'bethnal': 'Bethnal Green',
  'dalston': 'Dalston, Hackney',
  'peckham': 'Peckham, Southwark',
  'clapham': 'Clapham, Wandsworth',
  'gym': 'Local Gym Area',
  'school': 'School District',
  'office': 'Business District',
};

export default function AddLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slotKey: string; slotEmoji: string; slotLabel: string }>();
  const [search, setSearch] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('Clapton, London');
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const panRef = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        panRef.setValue({ x: g.dx, y: g.dy });
      },
      onPanResponderRelease: (_, g) => {
        setMapOffset(prev => ({ x: prev.x + g.dx, y: prev.y + g.dy }));
        panRef.flattenOffset();
        panRef.setValue({ x: 0, y: 0 });
        // Simulate neighbourhood change based on drag
        const names = ['Clapton, London', 'Hackney Wick', 'Dalston', 'Homerton', 'Stoke Newington', 'Stamford Hill'];
        setNeighbourhood(names[Math.floor(Math.random() * names.length)]);
      },
    })
  ).current;

  useEffect(() => {
    if (search.length >= 3) {
      const key = Object.keys(MOCK_RESULTS).find(k => search.toLowerCase().includes(k));
      if (key) setNeighbourhood(MOCK_RESULTS[key]);
    }
  }, [search]);

  const handleSave = async () => {
    await AsyncStorage.setItem('reassura_location_result', JSON.stringify({
      slotKey: params.slotKey || 'home',
      neighbourhood,
    }));
    router.back();
  };

  return (
    <View style={[styles.container, shared.safeTop]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} data-testid="loc-back-btn">
          <Text style={shared.backText}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add {params.slotLabel || 'location'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Type address or postcode..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            data-testid="location-search-input"
          />
        </View>
        <Text style={styles.searchDivider}>{'\u2014'} or drag the map below {'\u2014'}</Text>
      </View>

      {/* Map area with draggable content */}
      <View style={styles.mapContainer} {...panResponder.panHandlers}>
        <Animated.View style={[styles.mapContent, {
          transform: [
            { translateX: Animated.add(panRef.x, mapOffset.x) },
            { translateY: Animated.add(panRef.y, mapOffset.y) },
          ]
        }]}>
          {/* Grid roads */}
          <View style={[styles.hRoad, { top: '15%' }]} />
          <View style={[styles.hRoad, { top: '30%' }]} />
          <View style={[styles.hRoad, { top: '45%' }]} />
          <View style={[styles.hRoad, { top: '60%' }]} />
          <View style={[styles.hRoad, { top: '75%' }]} />
          <View style={[styles.hRoad, { top: '90%' }]} />
          <View style={[styles.vRoad, { left: '12%' }]} />
          <View style={[styles.vRoad, { left: '28%' }]} />
          <View style={[styles.vRoad, { left: '44%' }]} />
          <View style={[styles.vRoad, { left: '60%' }]} />
          <View style={[styles.vRoad, { left: '76%' }]} />
          <View style={[styles.vRoad, { left: '92%' }]} />
          {/* Main roads */}
          <View style={[styles.mainH, { top: '50%' }]} />
          <View style={[styles.mainV, { left: '50%' }]} />
          {/* Parks */}
          <View style={[styles.park, { top: '10%', left: '5%', width: 80, height: 55 }]} />
          <View style={[styles.park, { bottom: '10%', right: '8%', width: 65, height: 42 }]} />
          <View style={[styles.park, { top: '55%', left: '20%', width: 50, height: 35 }]} />
          {/* Buildings */}
          <View style={[styles.block, { top: '22%', left: '52%', width: 40, height: 25 }]} />
          <View style={[styles.block, { top: '35%', right: '15%', width: 35, height: 20 }]} />
          <View style={[styles.block, { bottom: '30%', left: '12%', width: 38, height: 22 }]} />
          <View style={[styles.block, { top: '15%', right: '25%', width: 32, height: 18 }]} />
        </Animated.View>

        {/* Fixed elements on top of draggable map */}
        {/* Crosshair lines */}
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />

        {/* Neighbourhood ring */}
        <View style={styles.neighbourhoodRing} />

        {/* Pin — fixed at centre, pointing DOWN */}
        <View style={styles.pinContainer}>
          <View style={styles.pinOuter}>
            <LinearGradient colors={['#3D6B50', '#7A9E87']} style={styles.teardrop}>
              <View style={styles.pinFace}>
                <Text style={styles.pinEmoji}>{params.slotEmoji || '\ud83c\udfe0'}</Text>
              </View>
            </LinearGradient>
            <View style={styles.pinPoint} />
          </View>
          <View style={styles.pinShadow} />
        </View>
      </View>

      {/* Bottom overlay panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.addressRow}>
          <Text style={styles.addressIcon}>{params.slotEmoji || '\ud83c\udfe0'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>{params.slotLabel || 'Home'} <Text style={styles.addressName}>{neighbourhood}</Text></Text>
            <Text style={styles.addressNote}>{'\ud83c\udf3f'} Neighbourhood stored only {'\u00B7'} never your exact address</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleSave} activeOpacity={0.8} data-testid="loc-save-btn">
          <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
            <Text style={shared.btnPrimaryText}>Save {params.slotLabel || 'location'} {'\u2192'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ONBOARDING.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  headerTitle: { fontFamily: ONBOARDING.heading, color: ONBOARDING.white, fontSize: 16 },
  searchWrap: { paddingHorizontal: 16, marginBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(122,158,135,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: ONBOARDING.body, color: ONBOARDING.white, fontSize: 13, padding: 0 },
  searchDivider: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 },
  mapContainer: { flex: 1, backgroundColor: '#1E1A16', overflow: 'hidden', position: 'relative' },
  mapContent: { position: 'absolute', top: -200, left: -200, right: -200, bottom: -200 },
  hRoad: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  vRoad: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  mainH: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'rgba(240,205,122,0.18)' },
  mainV: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(240,205,122,0.18)' },
  park: { position: 'absolute', backgroundColor: 'rgba(122,158,135,0.12)', borderRadius: 6 },
  block: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  crosshairH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(122,158,135,0.2)' },
  crosshairV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(122,158,135,0.2)' },
  neighbourhoodRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 180,
    height: 180,
    marginLeft: -90,
    marginTop: -90,
    borderRadius: 90,
    backgroundColor: 'rgba(122,158,135,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(122,158,135,0.4)',
  },
  pinContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -22, marginTop: -48, alignItems: 'center', zIndex: 10 },
  pinOuter: { alignItems: 'center' },
  teardrop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7A9E87',
    marginTop: -3,
  },
  pinFace: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  pinEmoji: { fontSize: 18 },
  pinShadow: { width: 14, height: 6, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 2 },
  bottomPanel: {
    backgroundColor: 'rgba(18,14,10,0.93)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 20,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  addressIcon: { fontSize: 18 },
  addressLabel: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  addressName: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  addressNote: { fontFamily: ONBOARDING.body, color: ONBOARDING.sage, fontSize: 11, marginTop: 2 },
});
