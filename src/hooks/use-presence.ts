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
  const [awayThreshold, setAwayThreshold] = useState(300);
  const [breakThreshold, setBreakThreshold] = useState(900);
  const [enableAutoResumeBreak, setEnableAutoResumeBreak] = useState(true);
  const [activityEvents, setActivityEvents] = useState(['mousemove', 'keydown', 'scroll', 'click', 'touchstart']);

  const prevStatusBeforeIdle = useRef<string | null>(null);

  const employeeId = (user as any)?.employee;

  const fetchStatus = useCallback(async () => {
    if (!employeeId) return;
    try {
      const data = await getPresence(employeeId);
      if (data) {
        const newStatus = data.presence?.status || 'Offline';
        setStatus(newStatus);
        setStatusMessage(data.presence?.status_message || '');
        setSession(data.session);
        setActiveBreak(data.break);
        localStorage.setItem('user_presence_status', newStatus);
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
      setAwayThreshold(settings.away_threshold || 300);
      setBreakThreshold(settings.break_threshold || 900);
      setEnableAutoResumeBreak(!!settings.enable_auto_resume_break);

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
        if (data && data.away_threshold !== undefined) {
          setAwayThreshold(data.away_threshold);
        }
        if (data && data.break_threshold !== undefined) {
          setBreakThreshold(data.break_threshold);
        }
        if (data && data.enable_auto_resume_break !== undefined) {
          setEnableAutoResumeBreak(!!data.enable_auto_resume_break);
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

  const idleAtRef = useRef<Date | null>(null);

  const changeStatus = async (newStatus: string, message?: string, source: string = 'Manual', startTime?: string) => {
    if (!employeeId) return;
    try {
      const res = await apiUpdatePresence(newStatus, employeeId, message, source, startTime);
      if (res.status === 'success') {
        setStatus(newStatus);
        setStatusMessage(res.status_message || message || '');
        fetchStatus();
        
        // Trigger chat unread count refresh if status changed to Available
        if (newStatus === 'Available') {
          window.dispatchEvent(new Event('REFRESH_CHAT_UNREAD_COUNT'));
        }
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
  const awayTimerRef = useRef<any>(null);
  const breakTimerRef = useRef<any>(null);

  // changeStatusRef: stable ref to avoid stale closures inside timers
  const changeStatusRef = useRef(changeStatus);
  useEffect(() => {
    changeStatusRef.current = changeStatus;
  });

  // Stable refs for threshold values inside timers (avoids stale closures)
  const awayThresholdRef = useRef(awayThreshold);
  const breakThresholdRef = useRef(breakThreshold);
  const idleThresholdRef = useRef(idleThreshold);
  const isAutoStatusEnabledRef = useRef(isAutoStatusEnabled);
  useEffect(() => {
    awayThresholdRef.current = awayThreshold;
    breakThresholdRef.current = breakThreshold;
    idleThresholdRef.current = idleThreshold;
    isAutoStatusEnabledRef.current = isAutoStatusEnabled;
  }, [awayThreshold, breakThreshold, idleThreshold, isAutoStatusEnabled]);

  const { requestSystemPermission, isSystemMonitoring, remainingSeconds } = useIdleDetection({
    onIdle: () => {
      if (!isAutoStatusEnabledRef.current) return;

      console.log(`[Presence] System is now Idle (> ${idleThresholdRef.current}s)`);

      // Record when the user actually went idle (back-calculate past the idle threshold)
      const now = new Date();
      idleAtRef.current = new Date(now.getTime() - idleThresholdRef.current * 1000);

      if (statusRef.current !== 'Available') return;

      // ── Stage 1: Schedule Away ──
      const timeToAwayMs = Math.max(0, (awayThresholdRef.current - idleThresholdRef.current) * 1000);
      if (awayTimerRef.current) clearTimeout(awayTimerRef.current);

      awayTimerRef.current = setTimeout(async () => {
        if (statusRef.current !== 'Available') return;
        console.log(`[Presence] Switching to Away.`);
        prevStatusBeforeIdle.current = 'Available';
        const capturedIdleAt = idleAtRef.current?.toISOString();
        await changeStatusRef.current('Away', 'Auto-away due to inactivity', 'Idle', capturedIdleAt);

        // ── Stage 2: Schedule Break (set AFTER Away confirmed) ──
        if (breakTimerRef.current) clearTimeout(breakTimerRef.current);
        const timeToBreakMs = Math.max(0, (breakThresholdRef.current - awayThresholdRef.current) * 1000);

        breakTimerRef.current = setTimeout(() => {
          if (statusRef.current !== 'Away') return;
          console.log(`[Presence] Away too long — switching to Break. idleAt=${capturedIdleAt}`);
          changeStatusRef.current('Break', 'Auto-transition from Away to Break', 'Idle', capturedIdleAt);
          breakTimerRef.current = null;
        }, timeToBreakMs);

      }, timeToAwayMs);
    },
    onActive: () => {
      // Clear both pending timers
      if (awayTimerRef.current) { clearTimeout(awayTimerRef.current); awayTimerRef.current = null; }
      if (breakTimerRef.current) { clearTimeout(breakTimerRef.current); breakTimerRef.current = null; }

      if (!isAutoStatusEnabledRef.current) return;

      if (statusRef.current === 'Away') {
        console.log('[Presence] Activity detected: Resuming from Away');
        changeStatusRef.current('Available', 'Auto-resumed from Away', 'Idle');
        idleAtRef.current = null;
      } else if (statusRef.current === 'Break' && enableAutoResumeBreak) {
        console.log('[Presence] Activity detected: Resuming from Break');
        changeStatusRef.current('Available', 'Auto-resumed from Break', 'Idle');
        idleAtRef.current = null;
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
        if (isAutoStatusEnabled) {
          if (statusRef.current === 'Away') {
              console.log('[Presence] Tab became visible: Resuming from Away');
              changeStatus('Available', 'Auto-resumed upon returning to tab', 'Idle');
          } else if (statusRef.current === 'Break' && enableAutoResumeBreak) {
              console.log('[Presence] Tab became visible: Resuming from Break');
              changeStatus('Available', 'Auto-resumed upon returning to tab', 'Idle');
          }
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
