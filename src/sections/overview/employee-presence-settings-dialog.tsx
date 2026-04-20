import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme, alpha } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { usePresence } from 'src/hooks/use-presence';

import { getPresenceSettings, updatePresenceSettings } from 'src/api/presence';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
};

export function EmployeePresenceSettingsDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const { requestSystemPermission, isSystemMonitoring } = usePresence();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [enableAutoStatus, setEnableAutoStatus] = useState(true);
  const [idleThreshold, setIdleThreshold] = useState(60);
  const [awayThreshold, setAwayThreshold] = useState(300);
  const [breakThreshold, setBreakThreshold] = useState(900);
  const [offlineThreshold, setOfflineThreshold] = useState(3600);
  const [enableAutoResumeBreak, setEnableAutoResumeBreak] = useState(true);
  const [events, setEvents] = useState({
    mousemove: true,
    keydown: true,
    scroll: true,
    click: true,
    touchstart: true,
  });
  // Threshold unit ('sec' | 'min')
  const [unit, setUnit] = useState<'sec' | 'min'>('sec');

  // UI state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleRequestPermission = async () => {
    await requestSystemPermission();
  };

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settings = await getPresenceSettings();
      setEnableAutoStatus(!!settings.enable_auto_status);
      setIdleThreshold(settings.idle_threshold || 60);
      setAwayThreshold(settings.away_threshold || 300);
      setBreakThreshold(settings.break_threshold || 900);
      setOfflineThreshold(settings.offline_threshold || 3600);
      setEnableAutoResumeBreak(!!settings.enable_auto_resume_break);
      setEvents({
        mousemove: !!settings.event_mousemove,
        keydown: !!settings.event_keydown,
        scroll: !!settings.event_scroll,
        click: !!settings.event_click,
        touchstart: !!settings.event_touchstart,
      });
    } catch (error) {
      console.error('Error fetching presence settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePresenceSettings({
        enable_auto_status: enableAutoStatus,
        idle_threshold: idleThreshold,
        away_threshold: awayThreshold,
        break_threshold: breakThreshold,
        offline_threshold: offlineThreshold,
        enable_auto_resume_break: enableAutoResumeBreak,
        event_mousemove: events.mousemove,
        event_keydown: events.keydown,
        event_scroll: events.scroll,
        event_click: events.click,
        event_touchstart: events.touchstart,
      });
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
      // Close after a short delay so user sees the success message
      setTimeout(() => onClose(), 800);
    } catch (error) {
      console.error('Error saving presence settings:', error);
      setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isChecked = events.mousemove; // Using mousemove as proxy for unified toggle status

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          Daily Status Settings
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Configure global presence behavior for all employees.
          </Typography>

          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading settings...</Typography>
            </Box>
          ) : (
            <Stack spacing={3.5}>
              {/* Enable Auto Status Toggle */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Enable Auto Status
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Automatically switch users to &apos;Break&apos; or &apos;Lunch Break&apos; after inactivity.
                  </Typography>
                </Stack>
                <Switch
                  checked={enableAutoStatus}
                  onChange={(e) => setEnableAutoStatus(e.target.checked)}
                  disabled={loading}
                />
              </Box>

              {/* Threshold Fields Grid */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    Inactivity Thresholds
                  </Typography>
                  <Select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    size="small"
                    sx={{
                      typography: 'caption',
                      fontWeight: 700,
                      minWidth: 100,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <MenuItem value="sec">Seconds</MenuItem>
                    <MenuItem value="min">Minutes</MenuItem>
                  </Select>
                </Stack>

                <Stack spacing={2}>
                  {(() => {
                    const multiplier = unit === 'min' ? 60 : 1;
                    return (
                      <>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            fullWidth
                            label="Idle Threshold"
                            type="number"
                            value={idleThreshold === 0 ? '' : parseFloat((idleThreshold / multiplier).toFixed(2))}
                            onChange={(e) => setIdleThreshold(e.target.value === '' ? 0 : Number(e.target.value) * multiplier)}
                            onFocus={(event) => event.target.select()}
                            helperText="System detects inactivity"
                            disabled={!enableAutoStatus || loading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                                    {unit === 'min' ? 'mins' : 'secs'}
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Break Threshold"
                            type="number"
                            value={awayThreshold === 0 ? '' : parseFloat((awayThreshold / multiplier).toFixed(2))}
                            onChange={(e) => setAwayThreshold(e.target.value === '' ? 0 : Number(e.target.value) * multiplier)}
                            onFocus={(event) => event.target.select()}
                            helperText="Transitions to Break status"
                            disabled={!enableAutoStatus || loading}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                                    {unit === 'min' ? 'mins' : 'secs'}
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Stack>
                        <TextField
                          fullWidth
                          label="Lunch Break Threshold"
                          type="number"
                          value={breakThreshold === 0 ? '' : parseFloat((breakThreshold / multiplier).toFixed(2))}
                          onChange={(e) => setBreakThreshold(e.target.value === '' ? 0 : Number(e.target.value) * multiplier)}
                          onFocus={(event) => event.target.select()}
                          helperText="Transitions to Lunch Break status"
                          disabled={!enableAutoStatus || loading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                                  {unit === 'min' ? 'mins' : 'secs'}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Auto-Offline Threshold"
                          type="number"
                          value={offlineThreshold === 0 ? '' : parseFloat((offlineThreshold / multiplier).toFixed(2))}
                          onChange={(e) => setOfflineThreshold(e.target.value === '' ? 0 : Number(e.target.value) * multiplier)}
                          onFocus={(event) => event.target.select()}
                          error={offlineThreshold <= breakThreshold}
                          helperText={offlineThreshold <= breakThreshold ? "Offline time must be greater than Break time" : "Automatically log out inactive users"}
                          disabled={!enableAutoStatus || loading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>
                                  {unit === 'min' ? 'mins' : 'secs'}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </>
                    );
                  })()}
                </Stack>
              </Box>

              {/* Auto Resume Toggle */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Auto-resume from Lunch Break
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    If off, users must click &apos;Return&apos; manually after a Lunch Break.
                  </Typography>
                </Stack>
                <Switch
                  checked={enableAutoResumeBreak}
                  onChange={(e) => setEnableAutoResumeBreak(e.target.checked)}
                  disabled={!enableAutoStatus || loading}
                />
              </Box>

              {/* System Monitoring Action */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    color: 'info.main',
                  }}
                >
                  <Iconify icon={"solar:monitor-bold-duotone" as any} width={28} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">System-wide Monitoring</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {isSystemMonitoring
                      ? 'System activity detection is active.'
                      : 'Detect activity even when the browser is minimized.'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color={isSystemMonitoring ? 'success' : 'info'}
                  onClick={handleRequestPermission}
                >
                  {isSystemMonitoring ? 'Active' : 'Enable'}
                </Button>
              </Box>

              {/* Activity Detectors Section */}
              {enableAutoStatus && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Activity Detectors
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                      },
                    }}
                  >
                    {[
                      { id: 'mousemove', label: 'Mouse', icon: 'ph:mouse-bold' },
                      { id: 'keydown', label: 'Keyboard', icon: 'ph:keyboard-bold' },
                      { id: 'scroll', label: 'Scrolling', icon: 'ph:scroll-bold' },
                      { id: 'click', label: 'Clicks', icon: 'ph:cursor-click-bold' },
                      { id: 'touchstart', label: 'Touch', icon: 'ph:hand-tap-bold' },
                    ].map((item) => {
                      const isActive = events[item.id as keyof typeof events];

                      return (
                        <Box
                          key={item.id}
                          onClick={() => {
                            if (loading) return;
                            const nextValue = !isActive;
                            setEvents({
                              mousemove: nextValue,
                              keydown: nextValue,
                              scroll: nextValue,
                              click: nextValue,
                              touchstart: nextValue,
                            });
                          }}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: loading ? 'default' : 'pointer',
                            border: '1px solid',
                            borderColor: isActive ? 'primary.main' : 'divider',
                            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'background.neutral',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            transition: theme.transitions.create(['all']),
                            '&:hover': {
                              borderColor: isActive ? 'primary.main' : 'text.disabled',
                              bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.grey[500], 0.04),
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pointerEvents: 'none' }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isActive ? 'primary.main' : 'background.paper',
                                color: isActive ? 'common.white' : 'text.secondary',
                                boxShadow: theme.customShadows.z1,
                              }}
                            >
                              <Iconify icon={item.icon as any} width={20} />
                            </Box>
                            <Switch
                              size="small"
                              checked={isActive}
                              disabled={loading}
                            />
                          </Stack>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {item.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            loading={saving}
            disabled={loading || offlineThreshold <= breakThreshold || breakThreshold <= awayThreshold || awayThreshold <= idleThreshold}
            sx={{ fontWeight: 700 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: theme.zIndex.modal + 1 }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
