import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useSettingsContext } from 'src/hooks/settings-context';

import { updateHRMSSettings } from 'src/api/settings';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

import { SettingsLogo } from '../settings-logo';
import { SettingsLiveKit } from '../settings-livekit';
import { SettingsSidebar } from '../settings-sidebar';
import { SettingsCurrency } from '../settings-currency';
import { SettingsDashboard } from '../settings-dashboard';
import { SettingsSalarySlip } from '../settings-salary-slip';
import { SettingsNotifications } from '../settings-notifications';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'logo', label: 'Logo', icon: <Iconify icon={"solar:gallery-bold-duotone" as any} width={24} /> },
  { value: 'sidebar', label: 'Sidebar', icon: <Iconify icon={"solar:widget-bold-duotone" as any} width={24} /> },
  { value: 'dashboard', label: 'Dashboard', icon: <Iconify icon={"solar:chart-bold-duotone" as any} width={24} /> },
  { value: 'currency', label: 'Currency & Locale', icon: <Iconify icon={"solar:globus-bold-duotone" as any} width={24} /> },
  { value: 'notifications', label: 'Notifications', icon: <Iconify icon={"solar:bell-bold-duotone" as any} width={24} /> },
  { value: 'salary', label: 'Salary Slip', icon: <Iconify icon={"solar:bill-list-bold-duotone" as any} width={24} /> },
  { value: 'api', label: 'API', icon: <Iconify icon={"solar:key-minimalistic-bold-duotone" as any} width={24} /> },
];

export function SettingsView() {
  const [currentTab, setCurrentTab] = useState('logo');
  const { settings, refetch, loading: settingsLoading } = useSettingsContext();
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { user } = useAuth();
  const isAuthorized = (user?.roles || []).some((role: string) =>
    ['HR', 'Administrator', 'System Manager'].includes(role)
  );

  useEffect(() => {
    if (settings && (!formData || formData.modified !== settings.modified)) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  const handleUpdateField = useCallback((fieldname: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldname]: value }));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateHRMSSettings(formData);
      setSnackbar({ open: true, message: 'Settings updated successfully', severity: 'success' });
      const freshSettings = await refetch();
      if (freshSettings) {
        setFormData(freshSettings);
      }
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to update settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (settingsLoading && !formData) {
    return (
      <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </DashboardContent>
    );
  }

  if (!isAuthorized) {
    return (
      <DashboardContent sx={{ textAlign: 'center', py: 20 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>Permission Denied</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          You do not have the required permissions to access the HRMS Settings.
        </Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ px: { xs: 2, md: 3, lg: 5 }, pb: 5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">HRMS Settings</Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          width: 1,
          mb: { xs: 3, md: 5 },
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              height: 2,
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              value={tab.value}
              iconPosition="start"
              sx={{
                minWidth: 'auto',
                px: 3,
                minHeight: 40,
                fontSize: 14,
                textTransform: 'none',
                fontWeight: 'fontWeightMedium',
                alignItems: 'center',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 'fontWeightBold',
                },
              }}
            />
          ))}
        </Tabs>

        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Iconify icon={"solar:check-circle-bold" as any} />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            bgcolor: '#08a3cd',
            '&:hover': { bgcolor: '#068fb3' },
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            mr: 1,
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Stack>

      <Box sx={{ width: 1 }}>
        {currentTab === 'logo' && (
          <SettingsLogo
            value={formData?.app_logo}
            onUpload={(url) => handleUpdateField('app_logo', url)}
          />
        )}

        {currentTab === 'sidebar' && (
          <SettingsSidebar
            data={formData}
            onChange={handleUpdateField}
          />
        )}

        {currentTab === 'dashboard' && (
          <SettingsDashboard
            data={formData}
            onChange={handleUpdateField}
          />
        )}

        {currentTab === 'currency' && (
          <SettingsCurrency
            data={formData}
            onChange={handleUpdateField}
          />
        )}

        {currentTab === 'notifications' && (
          <SettingsNotifications
            data={formData}
            onChange={handleUpdateField}
          />
        )}

        {currentTab === 'salary' && (
          <SettingsSalarySlip
            data={formData}
            onChange={handleUpdateField}
          />
        )}


        {currentTab === 'api' && (
          <SettingsLiveKit
            data={formData}
            onChange={handleUpdateField}
          />
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
