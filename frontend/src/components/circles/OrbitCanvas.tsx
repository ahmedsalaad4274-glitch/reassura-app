import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';
import { ReassuraLogo } from './ReassuraLogo';

const { width: SCREEN_W } = Dimensions.get('window');
const TERRA = '#C4704A';
const SAGE = '#7A9E87';

function getStatusLabel(status: string): 'active' | 'steady' | 'quiet' | 'off-grid' {
  if (status === 'on_the_way' || status === 'travelling' || status === 'safe_walk') return 'active';
  if (status === 'home' || status === 'arrived' || status === 'all_good') return 'steady';
  if (status === 'offline' || status === 'goodnight') return 'quiet';
  return 'steady';
}

interface OrbitMember {
  id: string;
  name: string;
  emoji: string;
  status: string;
  isOffGrid?: boolean;
}

interface Props {
  circleName: string;
  members: OrbitMember[];
  onNodePress: (member: OrbitMember) => void;
  isDark?: boolean;
  canvasSize?: number;
}

export const OrbitCanvas: React.FC<Props> = ({
  circleName,
  members,
  onNodePress,
  isDark = true,
  canvasSize,
}) => {
  const size = canvasSize || Math.min(SCREEN_W - 32, 360);
  const center = size / 2;
  const hubSize = 56;

  // Hub pulse
  const hubPulse = useRef(new Animated.Value(0.85)).current;

  // Ripple animation
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const [rippleTarget, setRippleTarget] = useState<{ x: number; y: number } | null>(null);

  // Per-member orbit angles
  const angleRefs = useRef<Animated.Value[]>([]);
  if (angleRefs.current.length !== members.length) {
    angleRefs.current = members.map((_, i) => new Animated.Value((i * 360) / members.length));
  }

  useEffect(() => {
    // Hub pulse
    Animated.loop(Animated.sequence([
      Animated.timing(hubPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(hubPulse, { toValue: 0.85, duration: 1400, useNativeDriver: true }),
    ])).start();

    // Orbit animations - different speeds per member
    const anims = members.map((m, i) => {
      const statusLabel = getStatusLabel(m.status);
      if (m.isOffGrid) return null; // off-grid nodes don't orbit
      const speed = statusLabel === 'active' ? 6000 : statusLabel === 'steady' ? 10000 : 14000;
      const startAngle = (i * 360) / members.length;
      return Animated.loop(
        Animated.timing(angleRefs.current[i], {
          toValue: startAngle + 360,
          duration: speed + i * 1500,
          useNativeDriver: false,
        })
      );
    });

    anims.forEach(a => a?.start());
    return () => anims.forEach(a => a?.stop());
  }, [members.length]);

  const fireRipple = (targetX: number, targetY: number) => {
    setRippleTarget({ x: targetX, y: targetY });
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.6);
    Animated.parallel([
      Animated.timing(rippleScale, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(rippleOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start(() => setRippleTarget(null));
  };

  // Orbit rings
  const rings = [0.35, 0.55, 0.75];
  const bg = isDark ? '#0D0B09' : '#F7F3EE';

  // Assign members to rings based on count
  const assignRing = (index: number, total: number) => {
    if (total <= 3) return 1; // middle ring
    if (index === 0) return 0; // inner
    if (index < total - 1) return 1; // middle
    return 2; // outer
  };

  // Off-grid members drift outward
  const driftAnims = useRef<Animated.Value[]>(
    members.filter(m => m.isOffGrid).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    driftAnims.forEach(a => {
      Animated.loop(Animated.sequence([
        Animated.timing(a, { toValue: 15, duration: 3000, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  // Active node pulse
  const nodePulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(nodePulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
      Animated.timing(nodePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  // Nudge dot pulse for off-grid
  const nudgePulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(nudgePulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.timing(nudgePulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
    ])).start();
  }, []);

  const statusText = (() => {
    const activeCount = members.filter(m => getStatusLabel(m.status) === 'active').length;
    const offGridCount = members.filter(m => m.isOffGrid).length;
    if (offGridCount > 0) return `${offGridCount} quiet`;
    if (activeCount > 0) return `${activeCount} active`;
    return 'All steady';
  })();

  let offGridIdx = 0;

  return (
    <View style={[s.canvas, { width: size, height: size, backgroundColor: bg }]} data-testid="orbit-canvas">
      {/* Orbit rings */}
      {rings.map((r, i) => (
        <View key={i} style={[s.ring, {
          width: size * r * 2, height: size * r * 2, borderRadius: size * r,
          left: center - size * r, top: center - size * r,
          borderColor: isDark ? 'rgba(122,158,135,0.08)' : 'rgba(122,158,135,0.15)',
        }]} />
      ))}

      {/* Ripple effect */}
      {rippleTarget && (
        <Animated.View style={[s.ripple, {
          left: center - size * 0.4,
          top: center - size * 0.4,
          width: size * 0.8, height: size * 0.8,
          borderRadius: size * 0.4,
          opacity: rippleOpacity,
          transform: [{ scale: rippleScale }],
        }]} />
      )}

      {/* Hub */}
      <Animated.View style={[s.hub, {
        left: center - hubSize / 2, top: center - hubSize / 2,
        width: hubSize, height: hubSize, borderRadius: hubSize / 2,
        opacity: hubPulse,
      }]}>
        <ReassuraLogo size={30} isDark={isDark} />
      </Animated.View>

      {/* Status label below hub */}
      <View style={[s.statusPill, { left: center - 40, top: center + hubSize / 2 + 6 }]}>
        <Text style={[s.statusText, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,11,9,0.5)' }]}>
          {statusText}
        </Text>
      </View>

      {/* Orbiting member nodes */}
      {members.map((member, i) => {
        const statusLabel = getStatusLabel(member.status);
        const isOffGrid = member.isOffGrid || false;
        const ringIdx = assignRing(i, members.length);
        const radius = size * rings[ringIdx];
        const nodeSize = 40;

        if (isOffGrid) {
          // Off-grid: fixed position, drifts outward, dashed border
          const angle = ((i * 360) / members.length) * (Math.PI / 180);
          const outerR = size * 0.78;
          const baseX = center + Math.cos(angle) * outerR - nodeSize / 2;
          const baseY = center + Math.sin(angle) * outerR - nodeSize / 2;
          const driftIdx = offGridIdx++;
          const drift = driftAnims[driftIdx] || new Animated.Value(0);

          return (
            <Animated.View key={member.id} style={[s.nodeWrap, {
              left: baseX, top: baseY,
              opacity: 0.32,
              transform: [{ translateY: drift }],
            }]}>
              <TouchableOpacity onPress={() => onNodePress(member)} testID={`orbit-node-${member.id}`}>
                <View style={[s.node, {
                  width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2,
                  borderStyle: 'dashed',
                  backgroundColor: isDark ? '#0D0B09' : '#F7F3EE',
                }]}>
                  <Text style={{ fontSize: 18 }}>{member.emoji}</Text>
                </View>
                <Animated.View style={[s.nudgeDot, { opacity: nudgePulse }]} />
                <Text style={[s.nodeName, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(13,11,9,0.4)' }]} numberOfLines={1}>{member.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }

        // Regular orbiting node
        const angleVal = angleRefs.current[i];
        if (!angleVal) return null;

        return (
          <AnimatedOrbitNode
            key={member.id}
            member={member}
            angleVal={angleVal}
            center={center}
            radius={radius}
            nodeSize={nodeSize}
            statusLabel={statusLabel}
            nodePulse={nodePulse}
            isDark={isDark}
            onPress={() => {
              const angle = ((i * 360) / members.length) * (Math.PI / 180);
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              onNodePress(member);
              fireRipple(x, y);
            }}
          />
        );
      })}
    </View>
  );
};

// Animated orbit node as separate component for performance
const AnimatedOrbitNode: React.FC<{
  member: OrbitMember;
  angleVal: Animated.Value;
  center: number;
  radius: number;
  nodeSize: number;
  statusLabel: string;
  nodePulse: Animated.Value;
  isDark: boolean;
  onPress: () => void;
}> = ({ member, angleVal, center, radius, nodeSize, statusLabel, nodePulse, isDark, onPress }) => {
  const x = angleVal.interpolate({
    inputRange: [0, 360],
    outputRange: [
      center + Math.cos(0) * radius - nodeSize / 2,
      center + Math.cos(2 * Math.PI) * radius - nodeSize / 2,
    ],
  });

  // Use listener to compute position
  const posX = useRef(new Animated.Value(center + radius - nodeSize / 2)).current;
  const posY = useRef(new Animated.Value(center - nodeSize / 2)).current;

  useEffect(() => {
    const id = angleVal.addListener(({ value }) => {
      const rad = (value * Math.PI) / 180;
      posX.setValue(center + Math.cos(rad) * radius - nodeSize / 2);
      posY.setValue(center + Math.sin(rad) * radius - nodeSize / 2);
    });
    return () => angleVal.removeListener(id);
  }, [center, radius, nodeSize]);

  const scale = statusLabel === 'active' ? nodePulse : 1;

  return (
    <Animated.View style={[s.nodeWrap, {
      left: posX, top: posY,
      transform: [{ scale: scale as any }],
    }]}>
      <TouchableOpacity onPress={onPress} testID={`orbit-node-${member.id}`}>
        <View style={[s.node, {
          width: nodeSize, height: nodeSize, borderRadius: nodeSize / 2,
          backgroundColor: isDark ? '#0D0B09' : '#F7F3EE',
        }]}>
          <Text style={{ fontSize: 18 }}>{member.emoji}</Text>
        </View>
        <Text style={[s.nodeName, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(13,11,9,0.6)' }]} numberOfLines={1}>{member.name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  canvas: { position: 'relative', alignSelf: 'center', overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1 },
  hub: {
    position: 'absolute', backgroundColor: TERRA,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: TERRA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    zIndex: 10,
  },
  statusPill: { position: 'absolute', width: 80, alignItems: 'center', zIndex: 10 },
  statusText: { fontSize: 9, fontWeight: '500', letterSpacing: 0.3 },
  nodeWrap: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  node: {
    borderWidth: 1.5, borderColor: SAGE,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeName: { fontSize: 9, marginTop: 2, textAlign: 'center', maxWidth: 50 },
  nudgeDot: {
    position: 'absolute', top: -2, right: -2,
    width: 8, height: 8, borderRadius: 4, backgroundColor: TERRA,
    shadowColor: TERRA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
  },
  ripple: {
    position: 'absolute', borderWidth: 2, borderColor: TERRA,
    backgroundColor: 'transparent', zIndex: 3,
  },
});
