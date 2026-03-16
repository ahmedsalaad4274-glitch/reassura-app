import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface SafeWalkState {
  isActive: boolean;
  destination: string;
  watchers: { id: string; name: string; emoji: string; selected: boolean }[];
  durationMin: number;
  startTime: number | null;
  arrivedAt: number | null;
  isOverdue: boolean;
}

interface SafeWalkContextType {
  walk: SafeWalkState;
  startWalk: (destination: string, watchers: SafeWalkState['watchers'], durationMin: number) => void;
  markArrived: () => void;
  cancelWalk: () => void;
  dismissOverdue: (response: string) => void;
  getElapsedMin: () => number;
  getRemainingMin: () => number;
  getProgress: () => number;
}

const DEFAULT_WATCHERS = [
  { id: 'user-mum', name: 'Mum', emoji: '\u{1F469}\u{1F3FE}', selected: true },
  { id: 'user-dad', name: 'Dad', emoji: '\u{1F468}\u{1F3FE}', selected: true },
  { id: 'user-jamie', name: 'Jamie', emoji: '\u{1F9D1}\u{1F3FE}', selected: true },
  { id: 'user-sara', name: 'Sara', emoji: '\u{1F469}', selected: true },
];

const INITIAL: SafeWalkState = {
  isActive: false,
  destination: '',
  watchers: DEFAULT_WATCHERS,
  durationMin: 15,
  startTime: null,
  arrivedAt: null,
  isOverdue: false,
};

const SafeWalkContext = createContext<SafeWalkContextType>({
  walk: INITIAL,
  startWalk: () => {},
  markArrived: () => {},
  cancelWalk: () => {},
  dismissOverdue: () => {},
  getElapsedMin: () => 0,
  getRemainingMin: () => 0,
  getProgress: () => 0,
});

export function SafeWalkProvider({ children }: { children: React.ReactNode }) {
  const [walk, setWalk] = useState<SafeWalkState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check overdue every 10s when walk active
  useEffect(() => {
    if (walk.isActive && walk.startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - walk.startTime!) / 60000;
        const overdueThreshold = walk.durationMin + 5;
        if (elapsed >= overdueThreshold && !walk.isOverdue) {
          setWalk(prev => ({ ...prev, isOverdue: true }));
        }
      }, 10000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [walk.isActive, walk.startTime, walk.durationMin, walk.isOverdue]);

  // Auto-clear after 2 hours
  useEffect(() => {
    if (walk.isActive && walk.startTime) {
      const timeout = setTimeout(() => {
        setWalk(INITIAL);
      }, 2 * 60 * 60 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [walk.isActive, walk.startTime]);

  const startWalk = useCallback((destination: string, watchers: SafeWalkState['watchers'], durationMin: number) => {
    setWalk({
      isActive: true,
      destination,
      watchers,
      durationMin,
      startTime: Date.now(),
      arrivedAt: null,
      isOverdue: false,
    });
  }, []);

  const markArrived = useCallback(() => {
    setWalk(prev => ({ ...prev, isActive: false, arrivedAt: Date.now() }));
  }, []);

  const cancelWalk = useCallback(() => {
    setWalk(INITIAL);
  }, []);

  const dismissOverdue = useCallback((response: string) => {
    if (response === 'extend') {
      setWalk(prev => ({ ...prev, isOverdue: false, durationMin: prev.durationMin + 10 }));
    } else {
      setWalk(prev => ({ ...prev, isOverdue: false }));
    }
  }, []);

  const getElapsedMin = useCallback(() => {
    if (!walk.startTime) return 0;
    return Math.floor((Date.now() - walk.startTime) / 60000);
  }, [walk.startTime]);

  const getRemainingMin = useCallback(() => {
    return Math.max(0, walk.durationMin - getElapsedMin());
  }, [walk.durationMin, getElapsedMin]);

  const getProgress = useCallback(() => {
    if (!walk.startTime || walk.durationMin === 0) return 0;
    return Math.min(1, getElapsedMin() / walk.durationMin);
  }, [walk.startTime, walk.durationMin, getElapsedMin]);

  return (
    <SafeWalkContext.Provider value={{ walk, startWalk, markArrived, cancelWalk, dismissOverdue, getElapsedMin, getRemainingMin, getProgress }}>
      {children}
    </SafeWalkContext.Provider>
  );
}

export const useSafeWalk = () => useContext(SafeWalkContext);
export { DEFAULT_WATCHERS };
