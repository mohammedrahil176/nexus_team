import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamMember } from './types';
import { useAuth } from './AuthContext';

interface TeamContextType {
  members: TeamMember[];
  addMember: (member: TeamMember) => Promise<void>;
  updateMember: (id: string, member: TeamMember) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  loading: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setMembers(data);
    } catch (e) {
      console.error('Failed to fetch team members', e);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (member: TeamMember) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(member)
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => [...prev, newMember]);
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      console.error('Failed to add member', e);
      throw e;
    }
  };

  const updateMember = async (id: string, updated: TeamMember) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => prev.map(m => m.id === id ? newMember : m));
      } else {
        throw new Error('Failed to update');
      }
    } catch (e) {
      console.error('Failed to update member', e);
      throw e;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      console.error('Failed to delete member', e);
      throw e;
    }
  };

  return (
    <TeamContext.Provider value={{ members, addMember, updateMember, deleteMember, loading }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
