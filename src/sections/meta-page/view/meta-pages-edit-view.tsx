import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fetchMetaApps } from 'src/api/meta-app';
import { DashboardContent } from 'src/layouts/dashboard';
import { getMetaPage, updateMetaPage } from 'src/api/meta-page';

import { Iconify } from 'src/components/iconify';

// Custom Switch Style matching the CRM / WhatsApp style
export const CustomSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#08a3cd', // Match the #08a3cd theme color
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 19,
        height: 19,
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E5E7EB', // Light Gray
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function MetaPagesEditView() {
    const { id } = useParams();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [pageName, setPageName] = useState('');
    const [pageId, setPageId] = useState('');
    const [metaApp, setMetaApp] = useState('');
    const [pageAccessToken, setPageAccessToken] = useState('');
    const [longLivedToken, setLongLivedToken] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [webhookEnabled, setWebhookEnabled] = useState(true);
    const [isActive, setIsActive] = useState(true);

    const [metaApps, setMetaApps] = useState<any[]>([]);
    const [loadingApps, setLoadingApps] = useState(true);

    const { enqueueSnackbar } = useSnackbar();
    const [errors, setErrors] = useState<{ pageName?: boolean; pageId?: boolean; metaApp?: boolean }>({});

    useEffect(() => {
        const loadMetaApps = async () => {
            try {
                const res = await fetchMetaApps({ page: 1, page_size: 1000 });
                setMetaApps(res.data);
            } catch (err) {
                enqueueSnackbar('Failed to load Meta Apps list', { variant: 'error' });
            } finally {
                setLoadingApps(false);
            }
        };
        loadMetaApps();
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getMetaPage(id)
                .then((data) => {
                    setPageName(data.page_name || '');
                    setPageId(data.page_id || '');
                    setMetaApp(data.meta_app || '');
                    setPageAccessToken(data.page_access_token || '');
                    setLongLivedToken(data.long_lived_token || '');
                    setBusinessId(data.business_id || '');
                    setWebhookEnabled(data.webhook_enabled !== 0);
                    setIsActive(data.is_active !== 0);
                })
                .catch(() => enqueueSnackbar('Failed to load Meta Page data.', { variant: 'error' }))
                .finally(() => setLoading(false));
        }
    }, [id, enqueueSnackbar]);

    const handleSave = async () => {
        const newErrors: typeof errors = {};
        if (!pageName.trim()) newErrors.pageName = true;
        if (!pageId.trim()) newErrors.pageId = true;
        if (!metaApp) newErrors.metaApp = true;
        
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            const updateData: any = {
                page_name: pageName.trim(),
                page_id: pageId.trim(),
                meta_app: metaApp,
                page_access_token: pageAccessToken.trim(),
                long_lived_token: longLivedToken.trim() || '',
                business_id: businessId.trim() || '',
                webhook_enabled: webhookEnabled ? 1 : 0,
                is_active: isActive ? 1 : 0,
            };

            await updateMetaPage(id!, updateData);
            sessionStorage.setItem('meta_page_success_message', 'Meta Page updated successfully.');
            router.push('/lead-integration/meta-pages');
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Failed to update Meta Page.', { variant: 'error' });
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#08a3cd' }} />
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Edit Meta Page
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.back()}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', px: 2.5 }}
                    >
                        Go Back
                    </Button>
                    <LoadingButton
                        variant="contained"
                        onClick={handleSave}
                        loading={isSaving}
                        sx={{ borderRadius: 1.5, bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Save Changes
                    </LoadingButton>
                </Stack>
            </Stack>

            <Card sx={{ p: 3 }}>
                {/* Section: Credentials */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                    <Iconify icon={"logos:meta-icon" as any} width={18} />
                    <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                        Meta Page Credentials
                    </Typography>
                </Stack>

                <Stack spacing={3}>
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                        <FormControlLabel
                            control={
                                <CustomSwitch
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                            }
                            label={
                                <Stack spacing={0.2}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, pl: 2 }}>Is Active</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', pl: 2 }}>Enable this page configuration</Typography>
                                </Stack>
                            }
                            sx={{ ml: 0.5 }}
                        />
                        <FormControlLabel
                            control={
                                <CustomSwitch
                                    checked={webhookEnabled}
                                    onChange={(e) => setWebhookEnabled(e.target.checked)}
                                />
                            }
                            label={
                                <Stack spacing={0.2}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, pl: 2 }}>Webhook Enabled</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', pl: 2 }}>Enable webhooks for lead streams</Typography>
                                </Stack>
                            }
                            sx={{ ml: 0.5 }}
                        />
                    </Box>
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                        <TextField
                            fullWidth
                            label="Page Name"
                            required
                            value={pageName}
                            onChange={(e) => { setPageName(e.target.value); if (e.target.value) setErrors(p => ({ ...p, pageName: false })); }}
                            error={errors.pageName}
                            helperText={errors.pageName ? 'Page Name is required' : ''}
                        />
                        <TextField
                            fullWidth
                            label="Page ID"
                            required
                            value={pageId}
                            onChange={(e) => { setPageId(e.target.value); if (e.target.value) setErrors(p => ({ ...p, pageId: false })); }}
                            error={errors.pageId}
                            helperText={errors.pageId ? 'Page ID is required' : ''}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                        <FormControl fullWidth required error={errors.metaApp}>
                            <InputLabel id="meta-app-label">Meta App</InputLabel>
                            <Select
                                labelId="meta-app-label"
                                value={metaApp}
                                label="Meta App"
                                onChange={(e) => { setMetaApp(e.target.value); setErrors(p => ({ ...p, metaApp: false })); }}
                            >
                                {metaApps.map((app) => (
                                    <MenuItem key={app.name} value={app.name}>
                                        {app.app_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>{errors.metaApp ? 'Meta App link is required' : ''}</FormHelperText>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Business ID"
                            value={businessId}
                            onChange={(e) => setBusinessId(e.target.value)}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr' } }}>
                        <TextField
                            fullWidth
                            label="Page Access Token"
                            required
                            multiline
                            rows={3}
                            value={pageAccessToken}
                            onChange={(e) => setPageAccessToken(e.target.value)}
                            helperText="Leave blank to keep existing value"
                            placeholder="••••••••"
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr' } }}>
                        <TextField
                            fullWidth
                            label="Long-lived Token"
                            multiline
                            rows={2}
                            value={longLivedToken}
                            onChange={(e) => setLongLivedToken(e.target.value)}
                            helperText="Leave blank to keep existing value"
                            placeholder="••••••••"
                        />
                    </Box>
                </Stack>
            </Card>
        </DashboardContent>
    );
}
