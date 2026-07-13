import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdCreate } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { login } from 'src/api/auth';
import { getMetaPage } from 'src/api/meta-page';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';


// ----------------------------------------------------------------------

function DetailRow({ label, value, mono = false }: { label: string; value?: any; mono?: boolean }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    fontSize: mono ? 13 : 'inherit',
                    color: value ? 'text.primary' : 'text.disabled',
                    fontStyle: !value ? 'italic' : 'normal',
                }}
            >
                {value || '—'}
            </Typography>
        </Stack>
    );
}

// ----------------------------------------------------------------------

export function MetaPagesDetailsView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();

    const [page, setPage] = useState<any>(null);
    const [fetching, setFetching] = useState(true);

    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [verifiedTokenTarget, setVerifiedTokenTarget] = useState<'page' | 'long' | null>(null);
    const [visibleTokens, setVisibleTokens] = useState<{ page?: boolean; long?: boolean }>({});

    const handleOpenVerification = (target: 'page' | 'long') => {
        setPassword('');
        setVerifiedTokenTarget(target);
        setVerifyDialogOpen(true);
    };

    const handleVerifyPassword = async () => {
        if (!password.trim()) {
            enqueueSnackbar('Please enter your password', { variant: 'error' });
            return;
        }
        if (!user || !user.email) {
            enqueueSnackbar('Active user details not found. Please log in again.', { variant: 'error' });
            return;
        }

        setIsValidating(true);
        try {
            await login(user.email, password);
            setVisibleTokens(prev => ({
                ...prev,
                [verifiedTokenTarget === 'page' ? 'page' : 'long']: true
            }));
            enqueueSnackbar('Authenticated successfully!', { variant: 'success' });
            setVerifyDialogOpen(false);
        } catch (err) {
            enqueueSnackbar('Incorrect password. Please try again.', { variant: 'error' });
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        if (id) {
            setFetching(true);
            getMetaPage(id)
                .then(setPage)
                .catch((err) => {
                    console.error('Failed to fetch Meta Page:', err);
                    enqueueSnackbar('Failed to load Meta Page details.', { variant: 'error' });
                })
                .finally(() => setFetching(false));
        }
    }, [id, enqueueSnackbar]);

    if (fetching) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#08a3cd' }} />
            </DashboardContent>
        );
    }

    if (!page) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Meta Page not found</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 3 }}>Go back to list</Button>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth={false}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1877F2',
                        }}
                    >
                        <Iconify icon={"logos:meta-icon" as any} width={28} />
                    </Box>
                    <Stack spacing={0.3}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            {page.page_name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 14 }}>
                                {page.page_id}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', px: 2.5, '&:hover': { bgcolor: (t) => alpha(t.palette.text.primary, 0.04), borderColor: 'text.primary' } }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/lead-integration/meta-pages/${encodeURIComponent(id || '')}/edit`)}
                        startIcon={<IoMdCreate size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Edit
                    </Button>
                </Stack>
            </Stack>

            <Stack spacing={3}>
                {/* Status Banner */}
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexWrap: 'wrap',
                        bgcolor: page.is_active
                            ? alpha('#22c55e', 0.06)
                            : alpha('#eab308', 0.06),
                        border: `1px solid ${page.is_active ? alpha('#22c55e', 0.2) : alpha('#eab308', 0.2)}`,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify
                            icon={(page.is_active ? 'solar:shield-check-bold' : 'solar:settings-bold') as any}
                            sx={{ color: page.is_active ? '#22c55e' : '#eab308' }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {page.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon={page.webhook_enabled ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} sx={{ color: page.webhook_enabled ? 'success.main' : 'text.disabled' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: page.webhook_enabled ? 'success.main' : 'text.secondary' }}>
                            Webhook {page.webhook_enabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                    </Stack>
                </Box>

                {/* Credentials Card */}
                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Iconify icon={"logos:meta-icon" as any} width={18} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                            Page Credentials
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'grid', columnGap: 4, rowGap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                        <DetailRow label="Page Name" value={page.page_name} />
                        <DetailRow label="Page ID" value={page.page_id} mono />
                        <DetailRow label="Meta App Link" value={page.meta_app} />
                        <DetailRow label="Business ID" value={page.business_id} mono />
                    </Box>
                </Card>

                {/* Page Access Tokens Card */}
                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Iconify icon={"solar:key-bold" as any} width={18} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                            Tokens Configuration
                        </Typography>
                    </Stack>

                    <Stack spacing={3}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                                border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                                        Page Access Token
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: 14, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                        {page.page_access_token
                                            ? visibleTokens.page
                                                ? page.page_access_token
                                                : `${page.page_access_token.substring(0, 15)}••••••••`
                                            : '—'}
                                    </Typography>
                                </Stack>
                                <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                    {!visibleTokens.page ? (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleOpenVerification('page')}
                                            startIcon={<Iconify icon="solar:eye-bold" />}
                                            sx={{
                                                bgcolor: '#08a3cd',
                                                color: '#ffffffff',
                                                fontWeight: 700,
                                                borderRadius: 1,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    bgcolor: '#08a3cd',
                                                }
                                            }}
                                        >
                                            View Full Token
                                        </Button>
                                    ) : (
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                navigator.clipboard.writeText(page.page_access_token || '');
                                                enqueueSnackbar('Page Access Token copied to clipboard!', { variant: 'success' });
                                            }}
                                            sx={{ color: '#08a3cd' }}
                                            title="Copy Token"
                                        >
                                            <Iconify icon={"solar:copy-bold" as any} width={16} />
                                        </IconButton>
                                    )}
                                </Box>
                            </Stack>
                        </Box>

                        {page.long_lived_token && (
                            <Box
                                sx={{
                                    p: 2.5,
                                    borderRadius: 1.5,
                                    bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.12)}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Stack spacing={0.5} sx={{ minWidth: 0, flexGrow: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                                            Long-lived Token
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: 14, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                            {page.long_lived_token
                                                ? visibleTokens.long
                                                    ? page.long_lived_token
                                                    : `${page.long_lived_token.substring(0, 15)}••••••••`
                                                : '—'}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                        {!visibleTokens.long ? (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => handleOpenVerification('long')}
                                                startIcon={<Iconify icon="solar:eye-bold" />}
                                                sx={{
                                                    bgcolor: alpha('#08a3cd', 0.08),
                                                    color: '#08a3cd',
                                                    fontWeight: 700,
                                                    borderRadius: 1,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        bgcolor: alpha('#08a3cd', 0.16),
                                                    }
                                                }}
                                            >
                                                View Full Token
                                            </Button>
                                        ) : (
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(page.long_lived_token || '');
                                                    enqueueSnackbar('Long-lived Token copied to clipboard!', { variant: 'success' });
                                                }}
                                                sx={{ color: '#08a3cd' }}
                                                title="Copy Token"
                                            >
                                                <Iconify icon={"solar:copy-bold" as any} width={16} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Card>

                {/* Metadata */}
                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Iconify icon={"solar:info-circle-bold" as any} width={18} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                            Record Information
                        </Typography>
                    </Stack>
                    <Box sx={{ display: 'grid', columnGap: 4, rowGap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
                        <DetailRow label="Created By" value={page.owner} />
                        <DetailRow label="Created On" value={page.creation ? new Date(page.creation).toLocaleDateString() : undefined} />
                        <DetailRow label="Last Modified" value={page.modified ? new Date(page.modified).toLocaleDateString() : undefined} />
                    </Box>
                </Card>
            </Stack>

            {/* Password Validation Dialog */}
            <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Verify Your Identity</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Please enter your password to view the full token credentials.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleVerifyPassword();
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setVerifyDialogOpen(false)} color="inherit" variant="outlined">
                        Cancel
                    </Button>
                    <LoadingButton
                        loading={isValidating}
                        onClick={handleVerifyPassword}
                        variant="contained"
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Verify
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}
