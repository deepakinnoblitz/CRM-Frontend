import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { getConnectedMetaForms, fetchMetaFormsFromGraphAPI, toggleMetaFormConnection } from 'src/api/meta-app';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ProposalTableHead } from 'src/sections/proposal/proposal-table-head';
import { CustomSwitch } from 'src/sections/meta-page/view/meta-pages-edit-view';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'form_name', label: 'Form Name' },
    { id: 'form_id', label: 'Form ID', width: 200 },
    { id: 'form_status', label: 'Status', align: 'center' as const },
    { id: 'questions_count', label: 'Questions', align: 'center' as const },
    { id: 'is_active', label: 'Lead Sync', align: 'center' as const },
    { id: 'action', label: 'Actions', align: 'center' as const, width: 180 },
];

type MetaFormSelectionCardProps = {
    selectedPageName?: string | null;
    isConnectedPage: boolean;
};

export function MetaFormSelectionCard({ selectedPageName, isConnectedPage }: MetaFormSelectionCardProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [forms, setForms] = useState<any[]>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadForms = useCallback(async () => {
        if (!isConnectedPage) {
            setForms([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getConnectedMetaForms(selectedPageName || undefined);
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

    const paginatedForms = forms.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        if (page > 0 && page * rowsPerPage >= forms.length) {
            setPage(0);
        }
    }, [forms.length, page, rowsPerPage]);

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
                <>
                    <Scrollbar>
                        <TableContainer sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1 }}>
                            <Table sx={{ minWidth: 720 }}>
                                <ProposalTableHead
                                    rowCount={forms.length}
                                    numSelected={0}
                                    onSelectAllRows={() => { }}
                                    hideCheckbox
                                    showIndex
                                    headLabel={TABLE_HEAD}
                                />
                                <TableBody>
                                    {paginatedForms.map((row, index) => (
                                        <TableRow
                                            key={row.name}
                                            hover
                                            tabIndex={-1}
                                            sx={{
                                                '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                                                '&:last-child td, &:last-child th': { borderBottom: 0 },
                                            }}
                                        >
                                            {/* S.No / Row index */}
                                            <TableCell align="center">
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        display: 'flex',
                                                        borderRadius: '50%',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                                                        color: 'primary.main',
                                                        typography: 'subtitle2',
                                                        fontWeight: 800,
                                                        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.16)}`,
                                                        mx: 'auto',
                                                    }}
                                                >
                                                    {page * rowsPerPage + index + 1}
                                                </Box>
                                            </TableCell>

                                            {/* Form Name */}
                                            <TableCell component="th" scope="row">
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Box
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 1.5,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: (t) => alpha('#1877F2', 0.08),
                                                            color: '#1877F2',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <Iconify icon={"logos:meta-icon" as any} width={22} />
                                                    </Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        {row.form_name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            {/* Form ID */}
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
                                                    {row.form_id || '—'}
                                                </Typography>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell align="center">
                                                <Chip
                                                    label={row.form_status || 'ACTIVE'}
                                                    size="small"
                                                    color={row.form_status === 'ACTIVE' ? 'success' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>

                                            {/* Questions count */}
                                            <TableCell align="center">
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {row.questions_count || 0}
                                                </Typography>
                                            </TableCell>

                                            {/* Lead Sync Toggle */}
                                            <TableCell align="center">
                                                <CustomSwitch
                                                    checked={!!row.is_active}
                                                    onChange={() => handleToggleForm(row.name, !!row.is_active)}
                                                />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<Iconify icon={"solar:pen-bold" as any} />}
                                                    onClick={() => window.open(`/lead-integration/meta-forms/${encodeURIComponent(row.name)}/edit`, '_blank')}
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        fontWeight: 600,
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Mapping & Rules
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedForms.length < 5 && (
                                        <>
                                            {Array.from({ length: 5 - paginatedForms.length }).map((_, i) => (
                                                <TableRow
                                                    key={`empty-${i}`}
                                                    sx={{ height: 68, '& td': { borderBottom: 'none' } }}
                                                >
                                                    <TableCell colSpan={7} />
                                                </TableRow>
                                            ))}
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>

                    <TablePagination
                        component="div"
                        count={forms.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50]}
                    />
                </>
            )}
        </Card>
    );
}
