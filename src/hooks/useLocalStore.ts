import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Issue, Notification, Citizen } from '../types';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useLocalStore() {
  const { getToken, userId, isSignedIn } = useAuth();
  
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<Citizen | null>(null);
  const [stats, setStats] = useState<{ citizens: number; issues: number; resolved: number; avgResponseTime: string }>({
    citizens: 0,
    issues: 0,
    resolved: 0,
    avgResponseTime: '36h'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public issues & stats (doesn't require auth)
      const [issuesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/issues`),
        fetch(`${API_URL}/api/stats`)
      ]);
      
      if (issuesRes.ok) setIssues(await issuesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());

      // 2. Fetch protected data if signed in
      if (isSignedIn) {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [notifRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/notifications`, { headers }),
          fetch(`${API_URL}/api/users/me`, { headers })
        ]);

        if (notifRes.ok) setNotifications(await notifRes.json());
        if (userRes.ok) setUser(await userRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Actions ───────────────────────────────────────────

  const addIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'upvotes' | 'commentsCount' | 'status' | 'escalationLevel'>) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(issueData),
      });

      if (res.ok) {
        const newIssue = await res.json();
        setIssues((prev) => [newIssue, ...prev]);
        
        // Optimistically add notification locally for fast UX, actual DB insert handles it server-side
        const newNotif: Notification = {
            id: `NOTIF-OPT-${Date.now()}`,
            userId: userId || '',
            type: 'STATUS_CHANGE',
            title: 'Issue Reported Successfully',
            message: `Your report "${newIssue.title}" has been submitted and is being reviewed.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            linkToIssueId: newIssue.id,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        return newIssue;
      }
    } catch(err) {
        console.error("Failed to add issue:", err);
    }
  };

  const upvoteIssue = async (id: string) => {
    // Optimistic UI update
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, upvotes: iss.upvotes + 1 } : iss));

    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/issues/${id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch(err) {
        console.error("Failed to upvote:", err);
        // Revert on failure
        setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, upvotes: Math.max(0, iss.upvotes - 1) } : iss));
    }
  };

  const updateIssueStatus = async (id: string, status: Issue['status']) => {
    // Implement API endpoint later for admins/politicians. Using Mock UI update for now.
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status } : iss));
  };

  const markNotificationRead = (id: string) => {
    // Implement API endpoint later. Using Mock UI update for now.
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    // Implement API endpoint later. Using Mock UI update for now.
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    issues,
    notifications,
    user,
    stats,
    isLoading,
    addIssue,
    upvoteIssue,
    updateIssueStatus,
    markNotificationRead,
    markAllNotificationsRead,
    refreshData: fetchData
  };
}
