import type { WhatsAppSettings } from 'src/api/whatsapp-settings';

import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { getWhatsAppSettings, saveWhatsAppSettings, testWhatsAppConnection } from 'src/api/whatsapp-settings';

export const CustomSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 38,
    height: 22,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#08a3cd',
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#08a3cd',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 18,
        height: 18,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

export function WhatsAppSettingsView() {
    const { enqueueSnackbar } = useSnackbar();
    const [settings, setSettings] = useState<Partial<WhatsAppSettings>>({
        enable_whatsapp: 1,
        token_type: 'Temporary',
        phone_number_id: '',
        business_account_id: '',
    });
    const [errors, setErrors] = useState<{ phone_number_id?: boolean; access_token?: boolean; webhook_verify_token?: boolean }>({});
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        getWhatsAppSettings()
            .then(data => setSettings(data))
            .catch(err => enqueueSnackbar('Failed to load settings', { variant: 'error' }));
    }, [enqueueSnackbar]);

    const handleChange = (field: keyof WhatsAppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        if (field === 'phone_number_id' || field === 'access_token' || field === 'webhook_verify_token') {
            setErrors(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSave = async () => {
        if (!settings.phone_number_id || !settings.access_token || !settings.webhook_verify_token) {
            setErrors({
                phone_number_id: !settings.phone_number_id,
                access_token: !settings.access_token,
                webhook_verify_token: !settings.webhook_verify_token,
            });
            enqueueSnackbar('Please fill all mandatory fields', { variant: 'error' });
            return;
        }

        try {
            await saveWhatsAppSettings(settings);
            enqueueSnackbar('Settings saved successfully', { variant: 'success' });
        } catch {
            enqueueSnackbar('Failed to save settings', { variant: 'error' });
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);

        try {
            const result = await testWhatsAppConnection();

            if (result?.success) {
                enqueueSnackbar(result.message || "WhatsApp API connected successfully.", {
                    variant: "success",
                });
            } else {
                let message = "Unable to connect to WhatsApp API.";

                if (result?.error) {
                    try {
                        const error =
                            typeof result.error === "string"
                                ? JSON.parse(result.error)
                                : result.error;

                        message =
                            error?.error?.message ||
                            error?.message ||
                            result.error;
                    } catch {
                        message = result.error;
                    }
                }

                enqueueSnackbar(message, {
                    variant: "error",
                    autoHideDuration: 6000,
                });
            }
        } catch (err: any) {
            enqueueSnackbar(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to connect to WhatsApp API.",
                {
                    variant: "error",
                    autoHideDuration: 6000,
                }
            );
        } finally {
            setTesting(false);
        }
    };

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4">CRM WhatsApp Settings</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        onClick={handleTestConnection}
                        disabled={testing}
                        sx={{ borderRadius: 1.5 }}
                    >
                        {testing ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' }, borderRadius: 1.5 }}
                    >
                        Save Settings
                    </Button>
                </Stack>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>WhatsApp Integration</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel
                                control={<CustomSwitch checked={!!settings.enable_whatsapp} onChange={(e) => handleChange('enable_whatsapp', e.target.checked ? 1 : 0)} />}
                                label="Enable WhatsApp"
                                sx={{ m: 0, '& .MuiFormControlLabel-label': { ml: 1 } }}
                            />
                            <TextField
                                fullWidth
                                select
                                label="Token Type"
                                value={settings.token_type || 'Temporary'}
                                onChange={(e) => handleChange('token_type', e.target.value)}
                            >
                                {['Temporary', 'Permanent'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                type="password"
                                label="Access Token"
                                value={settings.access_token || ''}
                                onChange={(e) => handleChange('access_token', e.target.value)}
                                required
                                error={errors.access_token}
                                helperText={errors.access_token ? 'This field is required' : ''}
                            />
                            <TextField
                                fullWidth
                                label="Phone Number ID"
                                value={settings.phone_number_id || ''}
                                onChange={(e) => handleChange('phone_number_id', e.target.value)}
                                required
                                error={errors.phone_number_id}
                                helperText={errors.phone_number_id ? 'This field is required' : ''}
                            />
                            <TextField
                                fullWidth
                                label="Business Account ID"
                                value={settings.business_account_id || ''}
                                onChange={(e) => handleChange('business_account_id', e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="WhatsApp Number"
                                value={settings.whatsapp_number || ''}
                                InputProps={{ readOnly: true }}
                            />
                        </Stack>
                    </Card>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Webhook Configuration</Typography>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                type="password"
                                label="Webhook Verify Token"
                                value={settings.webhook_verify_token || ''}
                                onChange={(e) => handleChange('webhook_verify_token', e.target.value)}
                                required
                                error={errors.webhook_verify_token}
                                helperText={errors.webhook_verify_token ? 'This field is required' : ''}
                            />
                            <TextField
                                fullWidth
                                label="Webhook URL"
                                value={settings.webhook_url || ''}
                                InputProps={{ readOnly: true }}
                                helperText="Auto Generated - Configure this URL in your Facebook App dashboard"
                            />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Connection Status</Typography>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Connection Status"
                                value={settings.connection_status || 'Disconnected'}
                                InputProps={{ readOnly: true }}
                            />
                            <TextField
                                fullWidth
                                label="Last Connected On"
                                value={settings.last_connected_on || ''}
                                InputProps={{ readOnly: true }}
                            />
                        </Stack>
                    </Card>
                </Box>
            </Box>
        </DashboardContent>
    );
}