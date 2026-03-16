import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity, Easing } from 'react-native';
import { ReassuraLogo } from './ReassuraLogo';

const TERRA = '#C4704A';
const SAGE = '#7A9E87';
const INK = '#0D0B09';

const W = Dimensions.get('window').width;
const RADII = [W * 0.17, W * 0.25, W * 0.32];
const RING_COLORS = ['rgba(196,112,74,0.15)', 'rgba(122,158,135,0.12)', 'rgba(196,112,74,0.08)'];
const RING_SPEEDS = [65000, 95000, 38000];
const ORBIT_SPEEDS = [20000, 28000, 38000];
const NODE_SIZE = 44;
const HUB_SIZE = 70;

export interface OrbitMember {
  id: string;
  name: string;
  emoji: string;
  status: 'active' | 'steady' | 'quiet' | 'offgrid';
}

interface Props {
  members: OrbitMember[];
  onNodePress: (member: OrbitMember) => void;
  arenaHeight: number;
}

export const OrbitCanvas: React.FC<Props> = ({ members, onNodePress, arenaHeight }) => {
  const cx = W / 2;
  const cy = arenaHeight / 2;

  // Ring rotations (native driver for transform)
  const ringRots = useRef(RADII.map(() => new Animated.Value(0))).current;
  // Hub pulse
  const hubPulse = useRef(new Animated.Value(0.85)).current;
  // Node angles
  const angles = useRef(members.map((_, i) => new Animated.Value(i * (360 / members.length)))).current;
  // Node positions
  const posXs = useRef(members.map(() => new Animated.Value(0))).current;
  const posYs = useRef(members.map(() => new Animated.Value(0))).current;
  // Active pulse
  const activePulse = useRef(new Animated.Value(1)).current;
  // Off-grid drift
  const driftAnim = useRef(new Animated.Value(0)).current;
  // Nudge dot pulse
  const nudgePulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Ring rotations
    ringRots.forEach((rot, i) => {
      Animated.loop(
        Animated.timing(rot, { toValue: 1, duration: RING_SPEEDS[i], useNativeDriver: true, easing: Easing.linear })
      ).start();
    });

    // Hub breathing
    Animated.loop(Animated.sequence([
      Animated.timing(hubPulse, { toValue: 1, duration: 2000, useNativeDriver: false }),
      Animated.timing(hubPulse, { toValue: 0.85, duration: 2000, useNativeDriver: false }),
    ])).start();

    // Active node pulse
    Animated.loop(Animated.sequence([
      Animated.timing(activePulse, { toValue: 1.15, duration: 1000, useNativeDriver: false }),
      Animated.timing(activePulse, { toValue: 1, duration: 1000, useNativeDriver: false }),
    ])).start();

    // Off-grid drift
    Animated.loop(Animated.sequence([
      Animated.timing(driftAnim, { toValue: 5, duration: 3000, useNativeDriver: false }),
      Animated.timing(driftAnim, { toValue: -5, duration: 3000, useNativeDriver: false }),
    ])).start();

    // Nudge dot pulse
    Animated.loop(Animated.sequence([
      Animated.timing(nudgePulse, { toValue: 1, duration: 1200, useNativeDriver: false }),
      Animated.timing(nudgePulse, { toValue: 0.4, duration: 1200, useNativeDriver: false }),
    ])).start();

    // Node orbits
    members.forEach((m, i) => {
      const isOffGrid = m.status === 'offgrid';
      const isQuiet = m.status === 'quiet';
      const ringIdx = isOffGrid ? 2 : (i % 3);
      const radius = isOffGrid ? RADII[2] + 15 : RADII[ringIdx];
      const startAngle = i * (360 / members.length);

      // Set initial position
      const initRad = (startAngle * Math.PI) / 180;
      posXs[i].setValue(cx + Math.cos(initRad) * radius - NODE_SIZE / 2);
      posYs[i].setValue(cy + Math.sin(initRad) * radius - NODE_SIZE / 2);

      // Only orbit active + steady nodes
      if (!isOffGrid && !isQuiet) {
        const speed = ORBIT_SPEEDS[ringIdx] + i * 2000;
        Animated.loop(
          Animated.timing(angles[i], {
            toValue: startAngle + 360,
            duration: speed,
            useNativeDriver: false,
            easing: Easing.linear,
          })
        ).start();

        angles[i].addListener(({ value }) => {
          const rad = (value * Math.PI) / 180;
          posXs[i].setValue(cx + Math.cos(rad) * radius - NODE_SIZE / 2);
          posYs[i].setValue(cy + Math.sin(rad) * radius - NODE_SIZE / 2);
        });
      }
    });

    return () => { angles.forEach(a => a.removeAllListeners()); };
  }, []);

  return (
    <View style={[s.arena, { height: arenaHeight }]}>
      <View style={s.tiltedPlane}>
        {/* Dashed rings */}
        {RADII.map((r, i) => (
          <Animated.View key={i} style={[s.ring, {
            width: r * 2, height: r * 2, borderRadius: r,
            left: cx - r, top: cy - r,
            borderColor: RING_COLORS[i],
            transform: [{ rotate: ringRots[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
          }]} />
        ))}

        {/* Hub */}
        <Animated.View style={[s.hub, {
          left: cx - HUB_SIZE / 2, top: cy - HUB_SIZE / 2,
          opacity: hubPulse,
        }]}>
          <ReassuraLogo size={38} />
        </Animated.View>

        {/* Nodes */}
        {members.map((m, i) => {
          const isOffGrid = m.status === 'offgrid';
          const isActive = m.status === 'active';

          return (
            <Animated.View key={m.id} style={[s.nodeWrap, {
              left: posXs[i],
              top: posYs[i],
              opacity: isOffGrid ? 0.32 : 1,
              transform: [
                { scale: isActive ? activePulse as any : 1 },
                { translateY: isOffGrid ? driftAnim as any : 0 },
              ],
            }]}>
              <TouchableOpacity onPress={() => onNodePress(m)} activeOpacity={0.7}>
                <View style={[s.node, isOffGrid && s.nodeOffGrid]}>
                  <Text style={s.nodeEmoji}>{m.emoji}</Text>
                </View>
                <Text style={s.nodeName} numberOfLines={1}>{m.name}</Text>
              </TouchableOpacity>
              {isOffGrid && (
                <Animated.View style={[s.nudgeDot, { opacity: nudgePulse }]} />
              )}
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  arena: { width: W, overflow: 'hidden' },
  tiltedPlane: {
    flex: 1,
    transform: [{ perspective: 600 }, { rotateX: '20deg' }],
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  hub: {
    position: 'absolute',
    width: HUB_SIZE, height: HUB_SIZE, borderRadius: HUB_SIZE / 2,
    backgroundColor: TERRA,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
    elevation: 12,
    shadowColor: TERRA,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
    width: NODE_SIZE + 12,
  },
  node: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: SAGE,
    backgroundColor: 'rgba(122,158,135,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  nodeOffGrid: {
    borderStyle: 'dashed',
  },
  nodeEmoji: { fontSize: 20 },
  nodeName: {
    fontSize: 9, color: 'rgba(255,255,255,0.55)',
    textAlign: 'center', marginTop: 2, maxWidth: NODE_SIZE + 12,
  },
  nudgeDot: {
    position: 'absolute', top: -2, right: 0,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: TERRA,
    shadowColor: TERRA, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 4,
  },
});
