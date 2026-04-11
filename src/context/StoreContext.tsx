import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Issue, Notification, Citizen } from '../types';
import { API_URL } from '../lib/constants';

interface StoreContextType {
  issues: Issue[];
  notifications: Notification[];
  user: Citizen | null;
  stats: { citizens: number; issues: number; resolved: number; avgResponseTime: string };
  isLoading: boolean;
  addIssue: (issueData: Partial<Issue>) => Promise<Issue>;
  upvoteIssue: (id: string) => Promise<void>;
  updateIssueStatus: (id: string, status: Issue['status']) => Promise<void>;
  respondToIssue: (id: string, response: string) => Promise<boolean>;
  flagIssue: (id: string, flagged: boolean, reason?: string) => Promise<boolean>;
  fetchUsers: () => Promise<{ id: string; name: string; email: string; role: string; avatar?: string; createdAt: string }[]>;
  changeUserRole: (targetUserId: string, role: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<Citizen | null>(null);
  const [stats, setStats] = useState({ citizens: 0, issues: 0, resolved: 0, avgResponseTime: '0' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [issuesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/issues`),
        fetch(`${API_URL}/api/stats`)
      ]);

      if (issuesRes.ok) {
        const data = await issuesRes.json();
        setIssues(data);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (isSignedIn) {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [notifRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/notifications`, { headers }),
          fetch(`${API_URL}/api/users/me`, { headers })
        ]);
        
        if (notifRes.ok) setNotifications(await notifRes.json());
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser({
            ...userData,
            badges: userData.badges || [],
            reputationScore: userData.reputationScore || 0
          });
        }
      }
    } catch {
       // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addIssue = async (issueData: Partial<Issue>) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(issueData),
    });

    if (!res.ok) throw new Error('Failed to create issue');
    
    const newIssue = await res.json();
    setIssues(prev => [newIssue, ...prev]);
    return newIssue;
  };

  const upvoteIssue = async (id: string) => {
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, upvotes: iss.upvotes + 1 } : iss));
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/issues/${id}/upvote`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` } 
      });
    } catch {
      setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, upvotes: Math.max(0, iss.upvotes - 1) } : iss));
    }
  };

  const updateIssueStatus = async (id: string, status: Issue['status']) => {
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status } : iss));
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
    } catch {
      fetchData();
    }
  };

  const respondToIssue = async (id: string, response: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/issues/${id}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ response }),
      });
      if (res.ok) {
        const updated = await res.json();
        setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, ...updated } : iss));
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  const flagIssue = async (id: string, flagged: boolean, flagReason?: string) => {
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, flagged, flagReason } : iss));
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/issues/${id}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ flagged, flagReason }),
      });
      return res.ok;
    } catch {
      fetchData();
      return false;
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) return await res.json();
    } catch {
      // Ignore
    }
    return [];
  };

  const changeUserRole = async (targetUserId: string, role: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Silent fail — optimistic update stays
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Silent fail
    }
  };

  return (
    <StoreContext.Provider value={{ 
      issues, notifications, user, stats, isLoading, 
      addIssue, upvoteIssue, updateIssueStatus, respondToIssue, flagIssue,
      fetchUsers, changeUserRole,
      markNotificationRead, markAllNotificationsRead,
      refreshData: fetchData 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
