import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme, alpha } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

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
  const { requestSystemPermission, isSystemMonitoring, remainingSeconds, status } = usePresence();

  const [loading, setLoading] = useState(true);
  const [enableAutoStatus, setEnableAutoStatus] = useState(true);
  const [idleThreshold, setIdleThreshold] = useState(60);
  const [events, setEvents] = useState({
    mousemove: true,
    keydown: true,
    scroll: true,
    click: true,
    touchstart: true,
  });

  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    const res = await requestSystemPermission();
    setPermissionStatus(res);
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
        event_mousemove: events.mousemove,
        event_keydown: events.keydown,
        event_scroll: events.scroll,
        event_click: events.click,
        event_touchstart: events.touchstart,
      });
      onClose();
    } catch (error) {
      console.error('Error saving presence settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEventChange = (name: keyof typeof events) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvents(prev => ({ ...prev, [name]: e.target.checked }));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        Daily Status Settings
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={3}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Configure global presence behavior for all employees.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Enable Auto Status</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Automatically switch users to &apos;Break&apos; after inactivity.
              </Typography>
            </Stack>
            <Switch
              checked={enableAutoStatus}
              onChange={(e) => setEnableAutoStatus(e.target.checked)}
              disabled={loading}
            />
          </Box>

          {enableAutoStatus && (
            <>
              <TextField
                label="Idle Threshold (Seconds)"
                type="number"
                fullWidth
                value={idleThreshold}
                onChange={(e) => setIdleThreshold(Number(e.target.value))}
                helperText="Time before user is considered &apos;Idle&apos;"
                disabled={loading}
              />

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'info.lighter',
                      color: 'info.main',
                    }}
                  >
                    <Iconify icon={"eva:monitor-fill" as any} width={24} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">System-wide Monitoring</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Detect activity even when the browser is minimized.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color={isSystemMonitoring ? "success" : "info"}
                    size="small"
                    onClick={handleRequestPermission}
                    disabled={isSystemMonitoring}
                  >
                    {isSystemMonitoring ? 'System Active' : 'Enable System'}
                  </Button>
                </Stack>
                {isSystemMonitoring ? (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      Active: System-wide movements are being tracked.
                    </Typography>
                    {status === 'Available' && (
                      <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 800 }}>
                        • Auto-break in {remainingSeconds}s
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <>
                    {status === 'Available' && (
                      <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block', fontWeight: 800 }}>
                        Auto-break in {remainingSeconds}s (Browser Only)
                      </Typography>
                    )}
                    {permissionStatus === 'denied' && (
                      <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block', fontWeight: 600 }}>
                        Permission denied. Please check site settings.
                      </Typography>
                    )}
                    {permissionStatus === 'unsupported' && (
                      <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block', fontWeight: 600 }}>
                        Unsupported on this browser or connection.
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Activity Detectors
                </Typography>
                <Stack spacing={0.5}>
                  <FormControlLabel
                    control={<Checkbox checked={events.mousemove} onChange={handleEventChange('mousemove')} size="small" />}
                    label={<Typography variant="body2">Mouse Movement</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={events.keydown} onChange={handleEventChange('keydown')} size="small" />}
                    label={<Typography variant="body2">Keyboard Input</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={events.scroll} onChange={handleEventChange('scroll')} size="small" />}
                    label={<Typography variant="body2">Scrolling</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={events.click} onChange={handleEventChange('click')} size="small" />}
                    label={<Typography variant="body2">Clicks</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={events.touchstart} onChange={handleEventChange('touchstart')} size="small" />}
                    label={<Typography variant="body2">Touch Interaction</Typography>}
                  />
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          loading={saving}
          disabled={loading}
          sx={{ fontWeight: 700 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
