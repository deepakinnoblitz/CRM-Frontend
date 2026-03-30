import { useState, useEffect, useCallback, useRef } from 'react';

import { getPresence, pingPresence, updatePresence as apiUpdatePresence, checkTodayTimesheet, getPresenceSettings } from 'src/api/presence';

import { useAuth } from 'src/auth/auth-context';

import { useSocket } from './use-socket';
import { useIdleDetection } from './use-idle-detection';

export function usePresence() {
  const { user } = useAuth();
  const { socket } = useSocket(user?.email);
  const [status, setStatus] = useState<string>('Offline');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [activeBreak, setActiveBreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoStatusEnabled, setIsAutoStatusEnabled] = useState(false);
  const [idleThreshold, setIdleThreshold] = useState(60);
  const [activityEvents, setActivityEvents] = useState(['mousemove', 'keydown', 'scroll', 'click', 'touchstart']);

  const prevStatusBeforeIdle = useRef<string | null>(null);

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

  const fetchSettings = useCallback(async () => {
    try {
      const settings = await getPresenceSettings();
      setIsAutoStatusEnabled(!!settings.enable_auto_status);
      setIdleThreshold(settings.idle_threshold || 60);

      const events = [];
      if (settings.event_mousemove) events.push('mousemove');
      if (settings.event_keydown) events.push('keydown');
      if (settings.event_scroll) events.push('scroll');
      if (settings.event_click) events.push('click');
      if (settings.event_touchstart) events.push('touchstart');
      setActivityEvents(events.length > 0 ? events : ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']);
    } catch (error) {
      console.error('Error fetching presence settings:', error);
    }
  }, []);

  // Socket listener for global settings
  useEffect(() => {
    if (socket) {
      const handleSettingsUpdate = (data: any) => {
        if (data && data.enable_auto_status !== undefined) {
          setIsAutoStatusEnabled(!!data.enable_auto_status);
        }
        if (data && data.idle_threshold !== undefined) {
          setIdleThreshold(data.idle_threshold);
        }

        const events = [];
        if (data.event_mousemove !== undefined) {
          if (data.event_mousemove) events.push('mousemove');
          if (data.event_keydown) events.push('keydown');
          if (data.event_scroll) events.push('scroll');
          if (data.event_click) events.push('click');
          if (data.event_touchstart) events.push('touchstart');
          if (events.length > 0) setActivityEvents(events);
        }
      };

      socket.on('presence_settings_update', handleSettingsUpdate);
      return () => {
        socket.off('presence_settings_update', handleSettingsUpdate);
      };
    }

    return undefined;
  }, [socket]);

  const changeStatus = async (newStatus: string, message?: string, source: string = 'Manual') => {
    if (!employeeId) return;
    try {
      const res = await apiUpdatePresence(newStatus, employeeId, message, source);
      if (res.status === 'success') {
        setStatus(newStatus);
        setStatusMessage(res.status_message || message || '');
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

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // ── Auto Status Detection ──
  const { requestSystemPermission, isSystemMonitoring, remainingSeconds } = useIdleDetection({
    onIdle: () => {
      if (!isAutoStatusEnabled) return;
      // Only auto-break if we are currently Available
      if (statusRef.current === 'Available') {
        prevStatusBeforeIdle.current = 'Available';

        const eventLabels: Record<string, string> = {
          mousemove: 'Mouse Move',
          keydown: 'Key Down',
          scroll: 'Scroll',
          click: 'Click',
          touchstart: 'Touch Start',
        };

        const activeEvents = activityEvents.map((e) => eventLabels[e] || e).join(', ');
        const reason = `Auto-break due to inactivity (${activeEvents})`;

        changeStatus('Break', reason, 'Idle');
      }
    },
    onActive: () => {
      if (!isAutoStatusEnabled) return;
      // Auto-resume from Break to Available when activity is detected
      if (statusRef.current === 'Break') {
        console.log('[Presence] System activity detected: Resuming from break');
        changeStatus('Available', 'Auto-resumed upon system activity', 'Manual');
      }
    },
    thresholdMs: idleThreshold * 1000,
    activityEvents: activityEvents,
  });

  // Secondary Resume Trigger: When user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
        if (isAutoStatusEnabled && statusRef.current === 'Break') {
            console.log('[Presence] Tab became visible: Resuming from break');
            changeStatus('Available', 'Auto-resumed upon returning to tab', 'Manual');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStatus, isAutoStatusEnabled]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
    fetchSettings();
  }, [fetchStatus, fetchSettings]);

  // Periodic ping (every 30 seconds) - Increased frequency for auto-status accuracy
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (status !== 'Offline' && !loading && employeeId) {
      interval = setInterval(async () => {
        await pingPresence(employeeId);
      }, 30000); // 30s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, loading, employeeId]);


  return {
    status,
    statusMessage,
    session,
    activeBreak,
    loading,
    isAutoStatusEnabled,
    isSystemMonitoring,
    remainingSeconds,
    changeStatus,
    setCustomMessage,
    checkTimesheet,
    requestSystemPermission,
    refresh: fetchStatus,
  };
}
