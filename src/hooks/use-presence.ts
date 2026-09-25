import { useState, useEffect, useCallback, useRef } from 'react';

import { getPresence, pingPresence, updatePresence as apiUpdatePresence, checkTodayTimesheet, getPresenceSettings, logLocation } from 'src/api/presence';

import { useAuth } from 'src/auth/auth-context';

import { useSocket } from './use-socket';
import { useIdleDetection } from './use-idle-detection';

const requestCurrentLocation = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          'Geolocation is not supported by your browser.'
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        // If high accuracy times out in the background, retry with network location (enableHighAccuracy: false)
        if (error.code === error.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(
            (fallbackPosition) => resolve(fallbackPosition),
            (fallbackError) => reject(new Error('Location request timed out. Please try again.')),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 120000 }
          );
          return;
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              new Error(
                'Location permission is denied. Please enable location access to continue.'
              )
            );
            break;

          case error.POSITION_UNAVAILABLE:
            reject(
              new Error(
                'Unable to determine your current location. Please make sure Location Services are enabled.'
              )
            );
            break;

          default:
            reject(
              new Error(
                'Unable to access your location. Please try again.'
              )
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000, // 1 minute cached position allowed so background tabs don't stall waiting on GPS lock
      }
    );
  });

// ── Module-level Geolocation Watcher & Background Stream ──
// Subscribes to browser continuous location updates and caches to localStorage
// so coordinates are immediately available in memory and persistent across tab states.
let _locationWatchId: number | null = null;
let _lastKnownPosition: { latitude: number; longitude: number; accuracy: number; timestamp: number } | null = null;

try {
  const savedPos = localStorage.getItem('last_known_geo_position');
  if (savedPos) {
    _lastKnownPosition = JSON.parse(savedPos);
  }
} catch (e) {
  // ignore
}

function saveKnownPosition(latitude: number, longitude: number, accuracy: number) {
  _lastKnownPosition = {
    latitude,
    longitude,
    accuracy,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem('last_known_geo_position', JSON.stringify(_lastKnownPosition));
  } catch (e) {
    // ignore
  }
}

function startLocationWatcher() {
  if (_locationWatchId !== null || typeof navigator === 'undefined' || !navigator.geolocation) {
    return;
  }

  try {
    _locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        saveKnownPosition(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy
        );
      },
      (error) => {
        console.warn('[Location Tracking] watchPosition notice:', error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60000,
        timeout: 20000,
      }
    );
  } catch (err) {
    console.warn('[Location Tracking] Could not start watchPosition:', err);
  }
}

function stopLocationWatcher() {
  if (_locationWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      navigator.geolocation.clearWatch(_locationWatchId);
    } catch (e) {
      // ignore
    }
    _locationWatchId = null;
  }
}

const getBestLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
  // 1. If we have a cached location from memory or localStorage, use it immediately
  if (_lastKnownPosition && _lastKnownPosition.latitude !== undefined && _lastKnownPosition.longitude !== undefined) {
    return {
      latitude: _lastKnownPosition.latitude,
      longitude: _lastKnownPosition.longitude,
      accuracy: _lastKnownPosition.accuracy || 100,
    };
  }

  // 2. Otherwise attempt requestCurrentLocation()
  try {
    const position = await requestCurrentLocation();
    saveKnownPosition(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (err) {
    if (_lastKnownPosition) {
      return {
        latitude: _lastKnownPosition.latitude,
        longitude: _lastKnownPosition.longitude,
        accuracy: _lastKnownPosition.accuracy || 100,
      };
    }
    throw err;
  }
};

// ── Standalone Global Auto-Tracking Manager ──
// Uses a Web Worker on a background thread so modern browsers do NOT freeze or throttle
// the interval timer when the user switches to other browser tabs or minimizes the window.
let _autoTrackWorker: Worker | null = null;
let _activeTrackingEmployee: string | null = null;
let _activeTrackingIntervalMs: number | null = null;
let _autoTrackFallbackInterval: ReturnType<typeof setInterval> | undefined;

async function triggerAutoTrackLog(employeeId: string, currentStatus: string) {
  try {
    const { latitude, longitude, accuracy } = await getBestLocation();
    const statusToLog = currentStatus || localStorage.getItem('user_presence_status') || 'Available';
    await logLocation(latitude, longitude, accuracy, statusToLog, 'Auto Tracking');
    localStorage.setItem(`last_auto_track_time_${employeeId}`, String(Date.now()));
    console.log(`[Location Tracking] Auto Tracking logged successfully in background: lat=${latitude}, lng=${longitude}, status=${statusToLog}`);
  } catch (err) {
    console.error('[Location Tracking] Background auto-track API failed:', err);
  }
}

function ensureAutoTracking(employeeId: string, intervalMinutes: number, getStatus: () => string) {
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

  // If already tracking this employee with this interval, keep running!
  if (_activeTrackingEmployee === employeeId && _activeTrackingIntervalMs === intervalMs && (_autoTrackWorker || _autoTrackFallbackInterval)) {
    return;
  }

  // Ensure watcher is active and prime location
  startLocationWatcher();
  if (!_lastKnownPosition) {
    requestCurrentLocation().then(pos => {
      saveKnownPosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    }).catch(() => {
      // Ignore initial GPS acquisition failure in background
    });
  }

  // Clear previous worker if changing interval/employee
  if (_autoTrackWorker) {
    try {
      _autoTrackWorker.postMessage({ action: 'stop' });
      _autoTrackWorker.terminate();
    } catch (e) {
      // Ignore worker termination error
    }
    _autoTrackWorker = null;
  }
  if (_autoTrackFallbackInterval) {
    clearInterval(_autoTrackFallbackInterval);
    _autoTrackFallbackInterval = undefined;
  }

  _activeTrackingEmployee = employeeId;
  _activeTrackingIntervalMs = intervalMs;

  // Try creating an unthrottled Web Worker with Wall-Clock Heartbeat
  // The 5-second heartbeat checks Date.now() elapsed time, so when the system wakes up from sleep
  // it immediately detects the elapsed time and triggers auto-tracking without waiting for tab focus.
  if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const workerCode = `
        let timerId = null;
        let intervalMs = 600000;
        let lastTickTime = Date.now();

        self.onmessage = function(e) {
          if (e.data.action === 'start') {
            intervalMs = e.data.intervalMs || 600000;
            lastTickTime = Date.now();
            if (timerId) clearInterval(timerId);

            // 5-second Wall-Clock Heartbeat loop (immune to sleep blindness)
            timerId = setInterval(function() {
              const now = Date.now();
              if (now - lastTickTime >= intervalMs) {
                lastTickTime = now;
                self.postMessage({ action: 'tick' });
              }
            }, 5000);
          } else if (e.data.action === 'stop') {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      _autoTrackWorker = new Worker(workerUrl);
      _autoTrackWorker.onmessage = (e) => {
        if (e.data?.action === 'tick' && _activeTrackingEmployee) {
          triggerAutoTrackLog(_activeTrackingEmployee, getStatus());
        }
      };
      _autoTrackWorker.postMessage({ action: 'start', intervalMs });
      console.log(`[Location Tracking] Background worker auto-tracker started for ${employeeId} (every ${intervalMinutes} min, wall-clock heartbeat)`);
      return;
    } catch (err) {
      console.warn('[Presence] Failed to initialize background worker, falling back to interval:', err);
    }
  }

  // Fallback heartbeat if Web Worker is not supported
  let lastFallbackTick = Date.now();
  _autoTrackFallbackInterval = setInterval(() => {
    const now = Date.now();
    if (_activeTrackingEmployee && now - lastFallbackTick >= intervalMs) {
      lastFallbackTick = now;
      triggerAutoTrackLog(_activeTrackingEmployee, getStatus());
    }
  }, 5000);
}

// ── Global System Wake-Up / Network Reconnection Listener ──
// When a computer wakes up from sleep or reconnects to WiFi, this fires across background tabs
// to immediately catch up and restart location tracking without waiting for the tab to be focused.
if (typeof window !== 'undefined') {
  const handleSystemWakeUp = () => {
    if (_activeTrackingEmployee) {
      console.log('[Location Tracking] System wake-up or network reconnection detected.');
      startLocationWatcher();

      const lastTrack = parseInt(localStorage.getItem(`last_auto_track_time_${_activeTrackingEmployee}`) || '0', 10);
      const intervalMs = _activeTrackingIntervalMs || 10 * 60 * 1000;
      if (Date.now() - lastTrack >= intervalMs) {
        console.log('[Location Tracking] Firing overdue auto-track catch-up after wake-up.');
        const currentStatus = localStorage.getItem('user_presence_status') || 'Available';
        triggerAutoTrackLog(_activeTrackingEmployee, currentStatus);
      }
    }
  };

  window.addEventListener('online', handleSystemWakeUp);
  window.addEventListener('focus', handleSystemWakeUp);
  if ('addEventListener' in document) {
    document.addEventListener('resume' as any, handleSystemWakeUp);
  }
}

function stopAutoTrackingIfOffline(employeeId: string) {
  if (_activeTrackingEmployee === employeeId) {
    if (_autoTrackWorker) {
      try {
        _autoTrackWorker.postMessage({ action: 'stop' });
        _autoTrackWorker.terminate();
      } catch (e) {
        // Ignore worker termination error
      }
      _autoTrackWorker = null;
    }
    if (_autoTrackFallbackInterval) {
      clearInterval(_autoTrackFallbackInterval);
      _autoTrackFallbackInterval = undefined;
    }
    _activeTrackingEmployee = null;
    _activeTrackingIntervalMs = null;
    stopLocationWatcher();
    console.log(`[Location Tracking] Auto-tracker stopped for ${employeeId}`);
  }
}

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

  // Geo Location tracking settings
  const [enableLocationTracking, setEnableLocationTracking] = useState(false);
  const [trackOnLogin, setTrackOnLogin] = useState(false);
  const [trackOnLogout, setTrackOnLogout] = useState(false);
  const [trackOnStatusChange, setTrackOnStatusChange] = useState(false);
  const [trackingIntervalMinutes, setTrackingIntervalMinutes] = useState(10);
  const [minimumGpsAccuracy, setMinimumGpsAccuracy] = useState(100);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  const prevStatusBeforeIdle = useRef<string | null>(null);
  const idleAtRef = useRef<Date | null>(null);

  // Refs for tracking properties to prevent stale closures
  const enableLocationTrackingRef = useRef(enableLocationTracking);
  const trackOnLoginRef = useRef(trackOnLogin);
  const trackOnLogoutRef = useRef(trackOnLogout);
  const trackOnStatusChangeRef = useRef(trackOnStatusChange);
  const trackingIntervalMinutesRef = useRef(trackingIntervalMinutes);
  const minimumGpsAccuracyRef = useRef(minimumGpsAccuracy);

  useEffect(() => {
    enableLocationTrackingRef.current = enableLocationTracking;
    trackOnLoginRef.current = trackOnLogin;
    trackOnLogoutRef.current = trackOnLogout;
    trackOnStatusChangeRef.current = trackOnStatusChange;
    trackingIntervalMinutesRef.current = trackingIntervalMinutes;
    minimumGpsAccuracyRef.current = minimumGpsAccuracy;
  }, [enableLocationTracking, trackOnLogin, trackOnLogout, trackOnStatusChange, trackingIntervalMinutes, minimumGpsAccuracy]);

  const employeeId = (user as any)?.employee;

  const logLocationIfAllowed = useCallback(async (source: 'Login' | 'Logout' | 'Status Change' | 'Auto Tracking', currentStatus: string) => {
    if (!enableLocationTrackingRef.current) return;

    // Check specific conditions
    if (source === 'Login' && !trackOnLoginRef.current) return;
    if (source === 'Logout' && !trackOnLogoutRef.current) return;
    if (source === 'Status Change' && !trackOnStatusChangeRef.current) return;

    try {
      const { latitude, longitude, accuracy } = await getBestLocation();

      // Call api
      await logLocation(latitude, longitude, accuracy, currentStatus, source);
      if (source === 'Auto Tracking' && employeeId) {
        localStorage.setItem(`last_auto_track_time_${employeeId}`, String(Date.now()));
      }
      console.log(`[Location Tracking] Location logged successfully for source: ${source}`);
    } catch (err) {
      console.error('[Location Tracking] Failed to log location:', err);
    }
  }, [employeeId]);

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

      const target = settings.location_tracking_target || 'All Employees';
      const isEmployeeTracked = target === 'All Employees' || 
        (target === 'Selected Employees' && Array.isArray(settings.tracked_employees) && !!employeeId && settings.tracked_employees.includes(employeeId));

      setEnableLocationTracking(!!settings.enable_location_tracking && isEmployeeTracked);
      setTrackOnLogin(!!settings.track_on_login);
      setTrackOnLogout(!!settings.track_on_logout);
      setTrackOnStatusChange(!!settings.track_on_status_change);
      setTrackingIntervalMinutes(settings.tracking_interval_minutes || 10);
      setMinimumGpsAccuracy(settings.minimum_gps_accuracy || 100);

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
        if (data && data.enable_location_tracking !== undefined) {
          setEnableLocationTracking(!!data.enable_location_tracking);
        }
        if (data && data.track_on_login !== undefined) {
          setTrackOnLogin(!!data.track_on_login);
        }
        if (data && data.track_on_logout !== undefined) {
          setTrackOnLogout(!!data.track_on_logout);
        }
        if (data && data.track_on_status_change !== undefined) {
          setTrackOnStatusChange(!!data.track_on_status_change);
        }
        if (data && data.tracking_interval_minutes !== undefined) {
          setTrackingIntervalMinutes(data.tracking_interval_minutes);
        }
        if (data && data.minimum_gps_accuracy !== undefined) {
          setMinimumGpsAccuracy(data.minimum_gps_accuracy);
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

  const validateLocationForStatusChange = useCallback(async () => {
    if (!enableLocationTrackingRef.current) {
      return true;
    }

    if (!trackOnStatusChangeRef.current) {
      return true;
    }

    try {
      const coords = await getBestLocation();
      if (coords.latitude === undefined || coords.longitude === undefined) {
        throw new Error("Unable to get location");
      }

      return true;
    } catch (err: any) {
      console.error('[Location Tracking] Validation error:', err);

      setLocationDialogOpen(true);
      return false;
    }
  }, []);

  const changeStatus = async (newStatus: string, message?: string, source: string = 'Manual', startTime?: string): Promise<boolean> => {
    if (!employeeId) return false;
    try {
      // Validate GPS before status change
      if (newStatus !== 'Offline') {
        const canProceed = await validateLocationForStatusChange();

        if (!canProceed) {
          // GPS unavailable or permission denied
          // Dialog is already opened inside validateLocationForStatusChange()
          return false;
        }
      } else {
        // If logging out, check if location tracking is enabled for logout
        if (enableLocationTrackingRef.current && trackOnLogoutRef.current) {
          try {
            const { latitude, longitude, accuracy } = await getBestLocation();
            // Log location first
            await logLocation(latitude, longitude, accuracy, newStatus, 'Logout');
          } catch (err) {
            console.error('Location logging failed during logout:', err);
            setLocationDialogOpen(true);
            return false;
          }
        }
      }

      const res = await apiUpdatePresence(newStatus, employeeId, message, source, startTime);
      if (res.status === 'success') {
        const oldStatus = status;
        setStatus(newStatus);
        setStatusMessage(res.status_message || message || '');
        fetchStatus();

        // Trigger chat unread count refresh if status changed to Available
        if (newStatus === 'Available') {
          window.dispatchEvent(new Event('REFRESH_CHAT_UNREAD_COUNT'));
        }

        // Trigger Geo Location Tracking for non-Offline status changes
        if (newStatus !== 'Offline') {
          let trackingSource: 'Login' | 'Logout' | 'Status Change' = 'Status Change';
          if (oldStatus === 'Offline') {
            trackingSource = 'Login';
            await logLocationIfAllowed(trackingSource, newStatus);
          } else {
            trackingSource = 'Status Change';
            await logLocationIfAllowed(trackingSource, newStatus);
          }
        }
      }
      localStorage.setItem('user_presence_status', newStatus);
      return true;
    } catch (error) {
      console.error('Error updating presence:', error);
      return false;
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

        // Catch-up check for Auto Tracking if tab was sleeping/inactive and overdue
        if (statusRef.current !== 'Offline' && employeeId && enableLocationTrackingRef.current) {
          const lastTrack = parseInt(localStorage.getItem(`last_auto_track_time_${employeeId}`) || '0', 10);
          const intervalMs = (trackingIntervalMinutesRef.current || 10) * 60 * 1000;
          if (lastTrack > 0 && Date.now() - lastTrack >= intervalMs) {
            console.log('[Location Tracking] Catching up missed auto tracking cycle after tab wake-up');
            logLocationIfAllowed('Auto Tracking', statusRef.current);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchStatus, isAutoStatusEnabled, employeeId, logLocationIfAllowed]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
    fetchSettings();
  }, [fetchStatus, fetchSettings]);

  // Periodic ping (every 120 seconds) - Increased frequency for auto-status accuracy
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (status !== 'Offline' && !loading && employeeId) {
      interval = setInterval(async () => {
        await pingPresence(employeeId);
      }, 120000); // 120s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, loading, employeeId]);

  // Periodic Auto Location Tracking (singleton Web Worker — unthrottled in background tabs)
  useEffect(() => {
    if (loading || !employeeId) return;

    if (status !== 'Offline' && enableLocationTracking) {
      ensureAutoTracking(employeeId, trackingIntervalMinutes || 10, () => statusRef.current);
    } else if (status === 'Offline') {
      stopAutoTrackingIfOffline(employeeId);
    }
  }, [status, loading, employeeId, enableLocationTracking, trackingIntervalMinutes]);

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
    logLocationIfAllowed,
    locationDialogOpen,
    setLocationDialogOpen,
    enableLocationTracking,
    trackOnLogin,
    trackOnLogout,
    trackOnStatusChange,
  };
}
