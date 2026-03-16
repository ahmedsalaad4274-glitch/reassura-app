import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PendingInvite {
  id: string;
  name: string;
  contact: string;
  circleId: string;
  createdAt: number;
}

interface InviteContextType {
  invites: PendingInvite[];
  addInvite: (circleId: string, name: string, contact: string) => void;
  getInvitesForCircle: (circleId: string) => PendingInvite[];
}

const InviteContext = createContext<InviteContextType>({
  invites: [],
  addInvite: () => {},
  getInvitesForCircle: () => [],
});

export function InviteProvider({ children }: { children: React.ReactNode }) {
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  const addInvite = useCallback((circleId: string, name: string, contact: string) => {
    setInvites(prev => [...prev, {
      id: `inv-${Date.now()}`,
      name,
      contact,
      circleId,
      createdAt: Date.now(),
    }]);
  }, []);

  const getInvitesForCircle = useCallback((circleId: string) => {
    return invites.filter(i => i.circleId === circleId);
  }, [invites]);

  return (
    <InviteContext.Provider value={{ invites, addInvite, getInvitesForCircle }}>
      {children}
    </InviteContext.Provider>
  );
}

export const useInvites = () => useContext(InviteContext);
