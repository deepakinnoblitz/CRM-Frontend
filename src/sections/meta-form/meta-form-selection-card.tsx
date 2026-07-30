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

import { fetchMetaFormsFromGraphAPI, toggleMetaFormConnection } from 'src/api/meta-app';

import { Iconify } from 'src/components/iconify';

type MetaFormSelectionCardProps = {
    selectedPageName?: string | null;
    isConnectedPage: boolean;
};

export function MetaFormSelectionCard({ selectedPageName, isConnectedPage }: MetaFormSelectionCardProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [forms, setForms] = useState<any[]>([]);

    const loadForms = useCallback(async () => {
        if (!isConnectedPage) {
            setForms([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetchMetaFormsFromGraphAPI(selectedPageName || undefined);
            if (res?.forms) {
                setForms(res.forms);
            }
        } catch (err: any) {
            console.error('Failed to fetch Meta Forms:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedPageName, isConnectedPage]);

    useEffect(() => {
        loadForms();
    }, [loadForms]);

    const handleSyncForms = async () => {
        setSyncing(true);
        try {
            const res = await fetchMetaFormsFromGraphAPI(selectedPageName || undefined);
            if (res?.forms) {
                setForms(res.forms);
                enqueueSnackbar(`Discovered ${res.total_forms} Lead Ad Instant Forms`, { variant: 'success' });
            }
        } catch (err: any) {
            console.error('Sync failed:', err);
            enqueueSnackbar(err?.message || 'Failed to sync Lead Forms', { variant: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleToggleForm = async (formName: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        try {
            setForms((prev) =>
                prev.map((f) => (f.name === formName ? { ...f, is_active: nextStatus ? 1 : 0 } : f))
            );
            await toggleMetaFormConnection(formName, nextStatus);
            enqueueSnackbar(`Form ${nextStatus ? 'enabled' : 'disabled'} for lead sync`, { variant: 'success' });
        } catch (err: any) {
            console.error('Failed to toggle form:', err);
            enqueueSnackbar(err?.message || 'Failed to update form status', { variant: 'error' });
            loadForms();
        }
    };

    if (!isConnectedPage) {
        return null;
    }

    return (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Discovered Lead Ad Instant Forms</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Choose which Instant Forms should automatically import leads into Frappe CRM.
                    </Typography>
                </Stack>

                <Button
                    variant="contained"
                    onClick={handleSyncForms}
                    disabled={syncing}
                    startIcon={syncing ? <CircularProgress size={18} color="inherit" /> : <Iconify icon={"mingcute:refresh-1-line" as any} />}
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
                    {syncing ? 'Syncing Forms...' : 'Sync Lead Forms'}
                </Button>
            </Stack>

            {loading ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={28} />
                </Stack>
            ) : forms.length === 0 ? (
                <Stack alignItems="center" py={4} spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        No Instant Forms discovered for this Facebook Page yet. Click &quot;Sync Lead Forms&quot; to fetch active forms.
                    </Typography>
                </Stack>
            ) : (
                <TableContainer sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Form Name</TableCell>
                                <TableCell>Form ID</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Questions</TableCell>
                                <TableCell align="center">Lead Sync</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {forms.map((row) => (
                                <TableRow key={row.name} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.form_name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{row.form_id}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.form_status || 'ACTIVE'}
                                            size="small"
                                            color={row.form_status === 'ACTIVE' ? 'success' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">{row.questions_count || 0}</TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={!!row.is_active}
                                            onChange={() => handleToggleForm(row.name, !!row.is_active)}
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Iconify icon={"solar:pen-bold" as any} />}
                                            onClick={() => window.open(`/lead-integration/meta-forms/${encodeURIComponent(row.name)}/edit`, '_blank')}
                                        >
                                            Mapping & Rules
                                        </Button>
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
