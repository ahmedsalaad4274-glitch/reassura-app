import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ReassuraLogo } from './ReassuraLogo';

const TERRA = '#C4704A';
const SAGE = '#7A9E87';
const CREAM = '#F7F3EE';

const SCREEN_W = Dimensions.get('window').width;

interface CircleData {
  id: string;
  name: string;
  members: { id: string; status: string }[];
}

interface Props {
  circles: CircleData[];
  onSelect: (id: string) => void;
}

export const BentoGrid: React.FC<Props> = ({ circles, onSelect }) => {
  const cellW = (SCREEN_W - 48 - 10) / 2;

  return (
    <View style={s.grid}>
      {circles.map((c) => {
        const activeCount = c.members.filter(m => m.status === 'active').length;
        const statusText = activeCount > 0 ? `${activeCount} active` : 'All steady';
        const dotColor = activeCount > 0 ? SAGE : 'rgba(122,158,135,0.4)';

        return (
          <TouchableOpacity
            key={c.id}
            style={[s.cell, { width: cellW, height: cellW * 0.85 }]}
            onPress={() => onSelect(c.id)}
            activeOpacity={0.7}
          >
            {/* Mini orbit preview */}
            <View style={s.miniOrbit}>
              <View style={[s.miniRing, s.miniRingOuter]} />
              <View style={[s.miniRing, s.miniRingInner]} />
              <View style={s.miniHub}>
                <ReassuraLogo size={14} />
              </View>
              {c.members.slice(0, 4).map((m, i) => {
                const angle = ((i * 360) / Math.min(c.members.length, 4) - 90) * (Math.PI / 180);
                const r = 22;
                return (
                  <View key={m.id} style={[s.miniDot, {
                    left: 30 + Math.cos(angle) * r - 3,
                    top: 30 + Math.sin(angle) * r - 3,
                    backgroundColor: m.status === 'active' ? SAGE : 'rgba(122,158,135,0.4)',
                  }]} />
                );
              })}
            </View>

            <Text style={s.cellName}>{c.name}</Text>
            <View style={s.cellStatusRow}>
              <View style={[s.cellDot, { backgroundColor: dotColor }]} />
              <Text style={s.cellStatus}>{statusText}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  cell: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 12,
  },
  miniOrbit: { width: 60, height: 60, position: 'relative', marginBottom: 8 },
  miniRing: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed' },
  miniRingOuter: {
    width: 56, height: 56, borderRadius: 28, left: 2, top: 2,
    borderColor: 'rgba(196,112,74,0.12)',
  },
  miniRingInner: {
    width: 36, height: 36, borderRadius: 18, left: 12, top: 12,
    borderColor: 'rgba(122,158,135,0.15)',
  },
  miniHub: {
    position: 'absolute', left: 22, top: 22,
    width: 16, height: 16, borderRadius: 8, backgroundColor: TERRA,
    alignItems: 'center', justifyContent: 'center',
  },
  miniDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  cellName: { fontFamily: 'Fraunces_700Bold', fontSize: 14, color: CREAM, marginBottom: 2 },
  cellStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cellDot: { width: 6, height: 6, borderRadius: 3 },
  cellStatus: { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
});
