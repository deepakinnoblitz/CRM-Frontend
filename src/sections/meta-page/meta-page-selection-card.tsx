import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchMetaPagesFromGraphAPI, getConnectedMetaPages, toggleMetaPageConnection } from 'src/api/meta-app';

import { Iconify } from 'src/components/iconify';

type MetaPageSelectionCardProps = {
    accountName?: string | null;
    isConnectedAccount: boolean;
    onRefresh?: () => void;
};

export function MetaPageSelectionCard({ accountName, isConnectedAccount, onRefresh }: MetaPageSelectionCardProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [pages, setPages] = useState<any[]>([]);

    // Initial load: read from DB (fast, no Graph API call)
    const loadPages = useCallback(async () => {
        if (!isConnectedAccount) {
            setPages([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getConnectedMetaPages(accountName || undefined);
            if (res?.pages) {
                setPages(res.pages);
            }
        } catch (err: any) {
            console.error('Failed to load connected pages:', err);
        } finally {
            setLoading(false);
        }
    }, [accountName, isConnectedAccount]);

    useEffect(() => {
        loadPages();
    }, [loadPages]);

    const handleSyncPages = async () => {
        setSyncing(true);
        try {
            const res = await fetchMetaPagesFromGraphAPI(accountName || undefined);
            if (res?.pages) {
                setPages(res.pages);
                const pageCount = res.pages.length;
                enqueueSnackbar(`Synced ${pageCount} Facebook Page${pageCount === 1 ? '' : 's'} successfully`, { variant: 'success' });
            }
        } catch (err: any) {
            console.error('Sync failed:', err);
            enqueueSnackbar(err?.message || 'Failed to sync Facebook Pages', { variant: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleTogglePage = async (pageName: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        try {
            setPages((prev) =>
                prev.map((p) => (p.name === pageName ? { ...p, is_connected: nextStatus ? 1 : 0 } : p))
            );
            await toggleMetaPageConnection(pageName, nextStatus);
            enqueueSnackbar(`Page ${nextStatus ? 'connected' : 'disconnected'} successfully`, { variant: 'success' });
            if (onRefresh) onRefresh();
        } catch (err: any) {
            console.error('Failed to toggle page:', err);
            enqueueSnackbar(err?.message || 'Failed to update page status', { variant: 'error' });
            loadPages();
        }
    };

    if (!isConnectedAccount) {
        return null;
    }

    return (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Connected Facebook Pages</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Select the Facebook Pages you want to receive Lead Ad submissions from.
                    </Typography>
                </Stack>

                <Button
                    variant="outlined"
                    onClick={handleSyncPages}
                    disabled={syncing}
                    startIcon={syncing ? <CircularProgress size={16} /> : <Iconify icon={"mingcute:refresh-1-line" as any} />}
                    sx={{ borderRadius: 1.5 }}
                >
                    {syncing ? 'Syncing Pages...' : 'Sync Facebook Pages'}
                </Button>
            </Stack>

            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={28} />
                </Stack>
            ) : pages.length === 0 ? (
                <Stack alignItems="center" py={4} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        No Facebook Pages discovered yet. Click &quot;Sync Facebook Pages&quot; to fetch your pages.
                    </Typography>
                </Stack>
            ) : (
                <TableContainer sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Page Name</TableCell>
                                <TableCell>Page ID</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="center">Webhook Subscription</TableCell>
                                <TableCell align="center">Sync Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pages.map((row) => (
                                <TableRow key={row.name} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.page_name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{row.page_id}</TableCell>
                                    <TableCell>
                                        <Chip label={row.category || 'General'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={row.subscription_status || (row.is_connected ? 'Subscribed' : 'Not Subscribed')}
                                            size="small"
                                            color={row.subscription_status === 'Subscribed' || row.is_connected ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={!!row.is_connected}
                                            onChange={() => handleTogglePage(row.name, !!row.is_connected)}
                                            color="success"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Card>
    );
}
