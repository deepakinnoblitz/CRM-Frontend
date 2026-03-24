import { useState, useEffect, useCallback } from 'react';

import { getPresence, pingPresence, updatePresence as apiUpdatePresence, checkTodayTimesheet } from 'src/api/presence';

import { useAuth } from 'src/auth/auth-context';

export function usePresence() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('Offline');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [activeBreak, setActiveBreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const employeeId = (user as any)?.employee;

  const fetchStatus = useCallback(async () => {
    if (!employeeId) return;
    try {
      const data = await getPresence(employeeId);
      if (data) {
        setStatus(data.presence?.status || 'Offline');
        setStatusMessage(data.presence?.status_message || '');
        setSession(data.session);
        setActiveBreak(data.break);
      }
    } catch (error) {
      console.error('Error fetching presence:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const changeStatus = async (newStatus: string, message?: string) => {
    if (!employeeId) return;
    try {
      const res = await apiUpdatePresence(newStatus, employeeId, message);
      if (res.status === 'success') {
        setStatus(newStatus);
        setStatusMessage(res.status_message || '');
        fetchStatus();
      }
      localStorage.setItem('user_presence_status', newStatus);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const setCustomMessage = async (message: string) => {
    if (!employeeId) return;
    try {
      const res = await apiUpdatePresence(status, employeeId, message);
      if (res.status === 'success' || res.status === 'No change') {
        setStatusMessage(message);
      }
    } catch (error) {
      console.error('Error setting status message:', error);
    }
  };

  const checkTimesheet = async () => {
    if (!employeeId) return { has_timesheet: false };
    try {
      const res = await checkTodayTimesheet(employeeId);
      return res;
    } catch (error) {
      console.error('Error checking timesheet:', error);
      return { has_timesheet: false };
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Periodic ping (every 2 minutes)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (status !== 'Offline' && !loading && employeeId) {
      interval = setInterval(async () => {
        await pingPresence(employeeId);
      }, 120000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, loading, employeeId]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_presence_status' && e.newValue) {
        setStatus(e.newValue);
        fetchStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchStatus]);

  return {
    status,
    statusMessage,
    session,
    activeBreak,
    loading,
    changeStatus,
    setCustomMessage,
    checkTimesheet,
    refresh: fetchStatus,
  };
}
