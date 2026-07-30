import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { fDateTime } from 'src/utils/format-time';

import { initiateMetaOAuth, getMetaAccountStatus, disconnectMetaAccount } from 'src/api/meta-app';

import { Iconify } from 'src/components/iconify';

type MetaAccountConnectCardProps = {
    connectedAccountName?: string | null;
    onRefresh?: () => void;
};

export function MetaAccountConnectCard({ connectedAccountName, onRefresh }: MetaAccountConnectCardProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [confirmDisconnect, setConfirmDisconnect] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [accountData, setAccountData] = useState<any>(null);

    const loadAccountStatus = useCallback(() => {
        setLoadingAccount(true);
        getMetaAccountStatus(connectedAccountName || undefined)
            .then(setAccountData)
            .catch((err) => console.error('Failed to load Meta account status:', err))
            .finally(() => setLoadingAccount(false));
    }, [connectedAccountName]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'META_OAUTH_SUCCESS') {
                enqueueSnackbar('Facebook connected successfully!', { variant: 'success' });
                setConnecting(false);
                if (event.data?.account) {
                    getMetaAccountStatus(event.data.account)
                        .then(setAccountData)
                        .catch((err) => console.error('Failed to load status after postMessage:', err));
                }
                if (onRefresh) onRefresh();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onRefresh, enqueueSnackbar]);

    useEffect(() => {
        loadAccountStatus();
    }, [loadAccountStatus]);

    const handleConnectFacebook = async () => {
        setConnecting(true);
        try {
            const res = await initiateMetaOAuth();
            if (res?.oauth_url) {
                const width = 600;
                const height = 700;
                const left = Math.max(0, (window.innerWidth - width) / 2 + window.screenX);
                const top = Math.max(0, (window.innerHeight - height) / 2 + window.screenY);

                const popup = window.open(
                    res.oauth_url,
                    'Facebook Login for Business',
                    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes,resizable=yes`
                );

                if (popup) {
                    const timer = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(timer);
                            setConnecting(false);
                            loadAccountStatus();
                            if (onRefresh) onRefresh();
                        }
                    }, 1000);
                } else {
                    window.location.href = res.oauth_url;
                }
            } else {
                throw new Error('OAuth URL was not returned by server.');
            }
        } catch (err: any) {
            console.error('Failed to initiate Facebook OAuth:', err);
            enqueueSnackbar(err?.message || 'Failed to start Facebook Login', { variant: 'error' });
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!accountData?.name) return;
        setDisconnecting(true);
        try {
            await disconnectMetaAccount(accountData.name);
            enqueueSnackbar('Facebook account disconnected safely', { variant: 'success' });
            setConfirmDisconnect(false);
            setAccountData(null);
            if (onRefresh) onRefresh();
        } catch (err: any) {
            console.error('Disconnect failed:', err);
            enqueueSnackbar(err?.message || 'Failed to disconnect account', { variant: 'error' });
        } finally {
            setDisconnecting(false);
        }
    };

    const isConnected = accountData && accountData.connection_status === 'Connected' && !accountData.is_expired;
    const isExpired = accountData && (accountData.connection_status === 'Token Expired' || accountData.is_expired);
    const hasError = accountData && (accountData.connection_status === 'Error' || !!accountData.last_error);

    return (
        <>
            <Card
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                bgcolor: '#1877F2',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 24,
                            }}
                        >
                            <Iconify icon={"logos:facebook" as any} width={28} />
                        </Box>

                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Meta Lead Ads Connection
                                </Typography>

                                {loadingAccount ? (
                                    <CircularProgress size={16} />
                                ) : isConnected ? (
                                    <Chip label="Connected" color="success" size="small" sx={{ fontWeight: 700, height: 22 }} />
                                ) : isExpired ? (
                                    <Chip label="Connection Expired" color="warning" size="small" sx={{ fontWeight: 700, height: 22 }} />
                                ) : (
                                    <Chip label="Not Connected" color="default" size="small" sx={{ fontWeight: 700, height: 22 }} />
                                )}
                            </Stack>

                            {accountData ? (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Connected as <strong>{accountData.facebook_user_name || accountData.facebook_user_id}</strong>
                                    {accountData.facebook_email ? ` (${accountData.facebook_email})` : ''}
                                    {accountData.token_expires_on && (
                                        <> • Expires on {fDateTime(accountData.token_expires_on, 'DD-MM-YYYY')}</>
                                    )}
                                </Typography>
                            ) : (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Connect your Facebook Account to automatically discover pages and receive real-time leads.
                                </Typography>
                            )}
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        {isConnected && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => setConfirmDisconnect(true)}
                                sx={{ borderRadius: 1.5 }}
                            >
                                Disconnect
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            disabled={connecting}
                            onClick={handleConnectFacebook}
                            startIcon={connecting ? <CircularProgress size={18} color="inherit" /> : <Iconify icon={"logos:facebook" as any} width={20} />}
                            sx={{
                                bgcolor: '#1877F2',
                                color: '#ffffff',
                                fontWeight: 700,
                                px: 3,
                                py: 1,
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#166fe5' },
                            }}
                        >
                            {connecting ? 'Connecting...' : isConnected ? 'Reconnect Facebook' : 'Connect Facebook'}
                        </Button>
                    </Stack>
                </Stack>

                {hasError && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
                        <strong>Connection Alert:</strong> {accountData.last_error || 'Authentication error detected. Please reconnect Facebook.'}
                    </Alert>
                )}
            </Card>

            <Dialog open={confirmDisconnect} onClose={() => setConfirmDisconnect(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Disconnect Facebook Account?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Disconnecting will disable real-time lead sync for all connected Facebook Pages. Your existing leads and audit logs will remain safe in Frappe CRM.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDisconnect(false)} disabled={disconnecting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        startIcon={disconnecting ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {disconnecting ? 'Disconnecting...' : 'Confirm Disconnect'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
