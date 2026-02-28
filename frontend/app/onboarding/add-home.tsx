import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as shared, ONBOARDING } from '../../src/styles/onboarding';

const DEFAULT_LOCATION = { lat: 51.5074, lng: -0.1278, name: 'Clapton, London' };

export default function AddHomeScreen() {
  const router = useRouter();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const neighbourhood = DEFAULT_LOCATION.name;

  const handleSave = async () => {
    await AsyncStorage.setItem('reassura_home_location', JSON.stringify({
      neighbourhood: 'Clapton',
      city: 'London',
    }));
    router.push('/onboarding/invite');
  };

  const handleSkip = () => {
    router.push('/onboarding/invite');
  };

  return (
    <View style={[shared.container, shared.safeTop, { paddingHorizontal: 0 }]}>
      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={shared.backBtn} onPress={() => router.back()} data-testid="home-back-btn">
          <Text style={shared.backText}>{'\u2190'}</Text>
        </TouchableOpacity>

        <View style={shared.progressRow}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={i === 3 ? shared.progressDotActive : shared.progressDot} />
          ))}
        </View>

        <Text style={shared.title}>Where{'\u2019'}s home? {'\ud83c\udfe0'}</Text>
        <Text style={[shared.subtitle, { color: ONBOARDING.sage, fontSize: 9 }]}>
          We store your neighbourhood {'\u2014'} never your exact address {'\ud83c\udf3f'}
        </Text>
      </View>

      {/* Map area */}
      <View style={styles.mapContainer}>
        {/* Map background — styled dark map */}
        <View style={styles.mapBg}>
          {/* Grid roads */}
          <View style={[styles.hRoad, { top: '20%' }]} />
          <View style={[styles.hRoad, { top: '40%' }]} />
          <View style={[styles.hRoad, { top: '60%' }]} />
          <View style={[styles.hRoad, { top: '80%' }]} />
          <View style={[styles.vRoad, { left: '15%' }]} />
          <View style={[styles.vRoad, { left: '35%' }]} />
          <View style={[styles.vRoad, { left: '55%' }]} />
          <View style={[styles.vRoad, { left: '75%' }]} />
          {/* Main roads */}
          <View style={[styles.mainH, { top: '50%' }]} />
          <View style={[styles.mainV, { left: '45%' }]} />
          {/* Park areas */}
          <View style={[styles.parkArea, { top: '12%', left: '8%', width: 70, height: 45 }]} />
          <View style={[styles.parkArea, { bottom: '15%', right: '10%', width: 55, height: 38 }]} />
          <View style={[styles.parkArea, { top: '60%', left: '25%', width: 40, height: 30 }]} />
          {/* Building blocks */}
          <View style={[styles.block, { top: '25%', left: '45%', width: 35, height: 22 }]} />
          <View style={[styles.block, { top: '30%', right: '20%', width: 28, height: 18 }]} />
          <View style={[styles.block, { bottom: '35%', left: '15%', width: 32, height: 20 }]} />

          {/* Neighbourhood ring */}
          <View style={styles.neighbourhoodRing} />

          {/* Pin — fixed at centre */}
          <View style={styles.pinContainer}>
            <LinearGradient colors={['#3D6B50', '#7A9E87']} style={styles.teardrop}>
              <View style={styles.pinFace}>
                <Text style={styles.pinEmoji}>{'\ud83c\udfe0'}</Text>
              </View>
            </LinearGradient>
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* Hint */}
        <Text style={styles.hintText}>Drag the map to adjust your pin</Text>

        {/* Bottom overlay panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>{'\ud83c\udfe0'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Home <Text style={styles.addressName}>{neighbourhood}</Text></Text>
              <Text style={styles.addressNote}>{'\ud83c\udf3f'} Neighbourhood stored only {'\u00B7'} never your exact address</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSave} activeOpacity={0.8} data-testid="home-save-btn">
            <LinearGradient colors={['#5A8A6A', '#7A9E87']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={shared.btnPrimary}>
              <Text style={shared.btnPrimaryText}>Save my home {'\u2192'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={shared.btnGhost} onPress={handleSkip} data-testid="home-skip-btn">
            <Text style={shared.btnGhostText}>Skip {'\u2014'} add later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, position: 'relative' },
  mapBg: {
    flex: 1,
    backgroundColor: '#1E1A16',
    position: 'relative',
    overflow: 'hidden',
  },
  hRoad: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  vRoad: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  mainH: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: 'rgba(240,205,122,0.18)' },
  mainV: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(240,205,122,0.18)' },
  parkArea: { position: 'absolute', backgroundColor: 'rgba(122,158,135,0.12)', borderRadius: 6 },
  block: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
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
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -22,
    marginTop: -52,
    alignItems: 'center',
    zIndex: 10,
  },
  teardrop: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
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
  pinFace: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  pinEmoji: { fontSize: 18 },
  pinShadow: {
    width: 14,
    height: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 3,
  },
  hintText: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: ONBOARDING.body,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18,14,10,0.93)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  addressIcon: { fontSize: 18 },
  addressLabel: { fontFamily: ONBOARDING.bodyBold, color: ONBOARDING.white, fontSize: 13 },
  addressName: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  addressNote: { fontFamily: ONBOARDING.body, color: ONBOARDING.sage, fontSize: 11, marginTop: 2 },
});
