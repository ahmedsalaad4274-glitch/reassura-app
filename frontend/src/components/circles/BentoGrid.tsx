import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { ReassuraLogo } from './ReassuraLogo';

const { width: SCREEN_W } = Dimensions.get('window');
const TERRA = '#C4704A';
const SAGE = '#7A9E87';

interface CircleData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  memberCount: number;
  statusSummary: string;
}

interface Props {
  circles: CircleData[];
  onSelect: (circleId: string) => void;
  isDark?: boolean;
}

export const BentoGrid: React.FC<Props> = ({ circles, onSelect, isDark = true }) => {
  const bg = isDark ? '#0D0B09' : '#F7F3EE';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#FFFFFF' : '#0D0B09';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,11,9,0.4)';
  const cellSize = (SCREEN_W - 48 - 10) / 2;

  return (
    <View style={s.grid} data-testid="bento-grid">
      {circles.map((circle) => (
        <TouchableOpacity
          key={circle.id}
          style={[s.cell, {
            width: cellSize, height: cellSize,
            backgroundColor: cardBg, borderColor,
          }]}
          onPress={() => onSelect(circle.id)}
          activeOpacity={0.7}
          data-testid={`bento-cell-${circle.id}`}
        >
          {/* Mini orbit preview */}
          <View style={s.miniOrbit}>
            <View style={[s.miniRing, { borderColor: isDark ? 'rgba(122,158,135,0.1)' : 'rgba(122,158,135,0.2)' }]} />
            <View style={s.miniHub}>
              <ReassuraLogo size={20} isDark={isDark} />
            </View>
            {/* Dots representing members */}
            {[...Array(Math.min(circle.memberCount, 4))].map((_, i) => {
              const angle = ((i * 360) / Math.min(circle.memberCount, 4) - 90) * (Math.PI / 180);
              const r = 28;
              return (
                <View key={i} style={[s.miniDot, {
                  left: 35 + Math.cos(angle) * r - 4,
                  top: 35 + Math.sin(angle) * r - 4,
                  backgroundColor: SAGE,
                }]} />
              );
            })}
          </View>

          <Text style={[s.cellName, { color: textColor }]}>{circle.name}</Text>
          <Text style={[s.cellStatus, { color: mutedColor }]}>{circle.statusSummary}</Text>
          <Text style={[s.cellCount, { color: mutedColor }]}>{circle.memberCount} members</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, justifyContent: 'center' },
  cell: {
    borderRadius: 20, borderWidth: 1, padding: 14, alignItems: 'center', justifyContent: 'center',
  },
  miniOrbit: { width: 70, height: 70, position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  miniRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 1 },
  miniHub: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: TERRA,
    alignItems: 'center', justifyContent: 'center',
  },
  miniDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  cellName: { fontFamily: FONTS.headingBold, fontSize: 15, marginBottom: 2 },
  cellStatus: { fontSize: 10, marginBottom: 2 },
  cellCount: { fontSize: 9 },
});
