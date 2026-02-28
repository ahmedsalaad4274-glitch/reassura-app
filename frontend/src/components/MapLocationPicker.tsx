import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING } from '../styles/onboarding';

const { width: SW, height: SH } = Dimensions.get('window');

interface MapLocationPickerProps {
  locationName: string;
  emoji: string;
  pinColour: 'sage' | 'blue' | 'amber';
  onSave: (neighbourhood: string, coordinates: { lat: number; lng: number }) => void;
  onBack: () => void;
}

const PIN_COLORS = {
  sage: { grad: ['#3D6B50', '#7A9E87'] as const, point: '#7A9E87', ringFill: 'rgba(122,158,135,0.12)', ringStroke: 'rgba(122,158,135,0.35)', cross: 'rgba(122,158,135,0.18)', searchBorder: 'rgba(122,158,135,0.4)' },
  blue: { grad: ['#2D4070', '#3D5A99'] as const, point: '#3D5A99', ringFill: 'rgba(61,90,153,0.10)', ringStroke: 'rgba(61,90,153,0.35)', cross: 'rgba(61,90,153,0.18)', searchBorder: 'rgba(61,90,153,0.4)' },
  amber: { grad: ['#7A5A20', '#C9A84C'] as const, point: '#C9A84C', ringFill: 'rgba(201,168,76,0.08)', ringStroke: 'rgba(201,168,76,0.35)', cross: 'rgba(201,168,76,0.18)', searchBorder: 'rgba(201,168,76,0.4)' },
};

const SUGGESTIONS_DATA = ['Clapton, London', 'Hackney, London', 'Stoke Newington, London', 'Shoreditch, London', 'Dalston, London', 'Bethnal Green, London'];
const NEIGHBOURHOODS = ['Clapton', 'Hackney Wick', 'Dalston', 'Homerton', 'Stoke Newington', 'Stamford Hill', 'Shoreditch', 'Bethnal Green'];

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ locationName, emoji, pinColour, onSave, onBack }) => {
  const colors = PIN_COLORS[pinColour];
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [neighbourhood, setNeighbourhood] = useState('Clapton, London');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderMove: (_, g) => panAnim.setValue({ x: g.dx, y: g.dy }),
      onPanResponderRelease: (_, g) => {
        setMapOffset(p => ({ x: p.x + g.dx, y: p.y + g.dy }));
        panAnim.flattenOffset();
        panAnim.setValue({ x: 0, y: 0 });
        setNeighbourhood(NEIGHBOURHOODS[Math.floor(Math.random() * NEIGHBOURHOODS.length)] + ', London');
      },
    })
  ).current;

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length >= 2) {
      setSuggestions(SUGGESTIONS_DATA.filter(s => s.toLowerCase().includes(text.toLowerCase())).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const pickSuggestion = (s: string) => {
    setSearch(s);
    setNeighbourhood(s);
    setSuggestions([]);
  };

  const handleSave = () => {
    onSave(neighbourhood, { lat: 51.5074, lng: -0.1278 });
  };

  return (
    <View style={ms.container}>
      {/* Header */}
      <View style={ms.header}>
        <TouchableOpacity onPress={onBack} style={ms.backBtn}>
          <Text style={ms.backText}>{'\u2190'} {locationName}</Text>
        </TouchableOpacity>
        <Text style={ms.headerTitle}>Set {locationName} location</Text>
        <Text style={ms.headerSub}>{'\ud83c\udf3f'} Neighbourhood stored only {'\u2014'} never your exact address</Text>
      </View>

      {/* Map area */}
      <View style={ms.mapArea} {...panResponder.panHandlers}>
        {/* Moveable map content */}
        <Animated.View style={[ms.mapContent, {
          transform: [
            { translateX: Animated.add(panAnim.x, mapOffset.x) },
            { translateY: Animated.add(panAnim.y, mapOffset.y) },
            { scale: zoom },
          ]
        }]}>
          {/* Roads grid */}
          {[12, 24, 36, 48, 60, 72, 84].map(p => (
            <View key={`h${p}`} style={[ms.hRoad, { top: `${p}%` }]} />
          ))}
          {[10, 22, 34, 46, 58, 70, 82, 94].map(p => (
            <View key={`v${p}`} style={[ms.vRoad, { left: `${p}%` }]} />
          ))}
          <View style={[ms.mainH, { top: '50%' }]} />
          <View style={[ms.mainH, { top: '30%' }]} />
          <View style={[ms.mainV, { left: '50%' }]} />
          <View style={[ms.mainV, { left: '35%' }]} />
          {/* Parks */}
          <View style={[ms.park, { top: '8%', left: '5%', width: 90, height: 60 }]} />
          <View style={[ms.park, { bottom: '12%', right: '8%', width: 75, height: 48 }]} />
          <View style={[ms.park, { top: '55%', left: '22%', width: 55, height: 40 }]} />
          <View style={[ms.park, { top: '20%', right: '15%', width: 45, height: 35 }]} />
          {/* Building blocks */}
          {[[25, 55], [38, 18], [65, 70], [18, 75], [72, 28], [48, 82]].map(([t, l], i) => (
            <View key={`b${i}`} style={[ms.block, { top: `${t}%`, left: `${l}%`, width: 35 + (i * 3), height: 22 + (i * 2) }]} />
          ))}
        </Animated.View>

        {/* Fixed overlays */}
        <View style={[ms.crossH, { backgroundColor: colors.cross }]} />
        <View style={[ms.crossV, { backgroundColor: colors.cross }]} />

        {/* Neighbourhood ring */}
        <View style={[ms.ring, { backgroundColor: colors.ringFill, borderColor: colors.ringStroke }]} />

        {/* Teardrop pin — fixed centre, pointing DOWN */}
        <View style={ms.pinWrap}>
          <View style={ms.pinOuter}>
            <LinearGradient colors={[...colors.grad]} style={ms.teardrop}>
              <View style={ms.pinFace}>
                <Text style={ms.pinEmoji}>{emoji}</Text>
              </View>
            </LinearGradient>
            <View style={[ms.pinPoint, { borderTopColor: colors.point }]} />
          </View>
          <View style={ms.pinShadow} />
        </View>

        {/* Zoom controls */}
        <View style={ms.zoomCol}>
          <TouchableOpacity style={ms.zoomBtn} onPress={() => setZoom(z => Math.min(z + 0.15, 2))}>
            <Text style={ms.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.zoomBtn} onPress={() => setZoom(z => Math.max(z - 0.15, 0.6))}>
            <Text style={ms.zoomText}>{'\u2212'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom overlay */}
      <View style={ms.bottom}>
        {/* Search */}
        <View style={[ms.searchBar, searchFocused && { borderColor: colors.searchBorder }]}>
          <Ionicons name="search" size={14} color="rgba(255,255,255,0.35)" />
          <TextInput
            style={ms.searchInput}
            value={search}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Type address or postcode..."
            placeholderTextColor="rgba(255,255,255,0.3)"
          />
        </View>

        {suggestions.length > 0 && (
          <View style={ms.suggestBox}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={ms.suggestRow} onPress={() => pickSuggestion(s)}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.4)" />
                <Text style={ms.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={ms.divider}>{'\u2014'} or drag the map above {'\u2014'}</Text>

        {/* Address display */}
        <View style={ms.addressRow}>
          <Text style={ms.addressEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={ms.addressName}>{locationName} <Text style={ms.addressNbh}>{neighbourhood}</Text></Text>
            <Text style={ms.addressNote}>{'\ud83c\udf3f'} {neighbourhood.split(',')[0]} {'\u00B7'} neighbourhood only</Text>
          </View>
        </View>

        <Text style={ms.dragHint}>Drag map to move pin</Text>

        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient colors={[...colors.grad]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ms.saveBtn}>
            <Text style={ms.saveBtnText}>Save {locationName} {'\u2192'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: ONBOARDING.bg },
  header: { paddingTop: 22, paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: { marginBottom: 6 },
  backText: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  headerTitle: { fontFamily: ONBOARDING.heading, color: '#fff', fontSize: 18, marginBottom: 4 },
  headerSub: { fontFamily: ONBOARDING.body, color: '#7A9E87', fontSize: 11 },
  mapArea: { flex: 1, backgroundColor: '#1E1A16', overflow: 'hidden', position: 'relative' },
  mapContent: { position: 'absolute', top: -250, left: -250, right: -250, bottom: -250 },
  hRoad: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  vRoad: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  mainH: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(240,205,122,0.15)' },
  mainV: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(240,205,122,0.15)' },
  park: { position: 'absolute', backgroundColor: 'rgba(122,158,135,0.10)', borderRadius: 6 },
  block: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  crossH: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1 },
  crossV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1 },
  ring: { position: 'absolute', top: '50%', left: '50%', width: 180, height: 180, marginLeft: -90, marginTop: -90, borderRadius: 90, borderWidth: 2 },
  pinWrap: { position: 'absolute', top: '50%', left: '50%', marginLeft: -22, marginTop: -52, alignItems: 'center', zIndex: 10 },
  pinOuter: { alignItems: 'center' },
  teardrop: {
    width: 44, height: 44,
    borderTopLeftRadius: 22, borderTopRightRadius: 22, borderBottomLeftRadius: 0, borderBottomRightRadius: 22,
    transform: [{ rotate: '-45deg' }],
    borderWidth: 2.5, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  pinFace: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '45deg' }] },
  pinEmoji: { fontSize: 18 },
  pinPoint: { width: 0, height: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  pinShadow: { width: 12, height: 5, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.25)', marginTop: 2 },
  zoomCol: { position: 'absolute', top: 10, right: 10, gap: 4 },
  zoomBtn: { width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(14,11,8,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  zoomText: { color: '#fff', fontSize: 16, fontWeight: '300' },
  bottom: { backgroundColor: 'rgba(14,11,8,0.94)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 14, paddingTop: 11, paddingBottom: 18 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 11, paddingVertical: 9, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontFamily: ONBOARDING.body, color: '#fff', fontSize: 13, padding: 0 },
  suggestBox: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  suggestText: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  divider: { textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginVertical: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  addressEmoji: { fontSize: 18 },
  addressName: { fontFamily: ONBOARDING.bodyBold, color: '#fff', fontSize: 13 },
  addressNbh: { fontFamily: ONBOARDING.body, color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  addressNote: { fontFamily: ONBOARDING.body, color: '#7A9E87', fontSize: 10, marginTop: 1 },
  dragHint: { textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 8 },
  saveBtn: { borderRadius: 13, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: ONBOARDING.heading, color: '#fff', fontSize: 13, letterSpacing: 0.3 },
});
