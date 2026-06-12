import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useEmailCampaigns } from 'src/hooks/useEmailCampaigns';

import { DashboardContent } from 'src/layouts/dashboard';
import { deleteEmailCampaign } from 'src/api/email-campaign';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from 'src/sections/proposal/table-no-data';
import { TableEmptyRows } from 'src/sections/proposal/table-empty-rows';
import { ProposalTableHead } from 'src/sections/proposal/proposal-table-head';
import { ProposalTableToolbar } from 'src/sections/proposal/proposal-table-toolbar';

import { EmailCampaignTableRow } from '../email-campaign-table-row';

const TABLE_HEAD = [
    { id: 'campaign_name', label: 'Campaign Name' },
    { id: 'email_template', label: 'Email Template' },
    { id: 'target_type', label: 'Target Type' },
    { id: 'total_recipients', label: 'Total Recipients' },
    { id: 'sent_count', label: 'Sent Count' },
    { id: 'status', label: 'Status' },
    { id: 'created_on', label: 'Created On' },
    { id: 'action', label: 'Actions', align: 'center' },
];

export function EmailCampaignsListView() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('modified_desc');
    const [filters, setFilters] = useState({ status: 'all', target_type: 'all' });
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [deleting, setDeleting] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { data, total, loading, refetch } = useEmailCampaigns(
        page,
        rowsPerPage,
        filterName,
        sortBy,
        filters
    );

    const handleViewRow = (id: string) => {
        router.push(`/email-campaigns/${encodeURIComponent(id)}/view`);
    };

    const handleEditRow = (id: string) => {
        router.push(`/email-campaigns/${encodeURIComponent(id)}/edit`);
    };

    const handleDeleteRow = useCallback((id: string) => {
        setConfirmDelete({ open: true, id });
    }, []);

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        setDeleting(true);
        try {
            await deleteEmailCampaign(confirmDelete.id);
            setSnackbar({ open: true, message: 'Email Campaign deleted successfully', severity: 'success' });
            await refetch();
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: 'Failed to delete Email Campaign', severity: 'error' });
        } finally {
            setDeleting(false);
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const notFound = !loading && data.length === 0 && !!filterName;
    const empty = !loading && data.length === 0 && !filterName;

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4">CRM Email Campaigns</Typography>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon={"mingcute:add-line" as any} />}
                    onClick={() => router.push('/email-campaigns/new')}
                    sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                >
                    New Campaign
                </Button>
            </Stack>

            <Card>
                <ProposalTableToolbar
                    numSelected={0}
                    filterName={filterName}
                    onFilterName={(e) => setFilterName(e.target.value)}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onOpenFilter={() => { }}
                    canReset={!!filterName}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 960 }}>
                            <ProposalTableHead
                                rowCount={total}
                                numSelected={0}
                                onSelectAllRows={() => { }}
                                hideCheckbox
                                showIndex
                                headLabel={TABLE_HEAD}
                            />
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                            <CircularProgress sx={{ color: '#08a3cd' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {data.map((row, index) => (
                                            <EmailCampaignTableRow
                                                key={row.name}
                                                index={page * rowsPerPage + index}
                                                hideCheckbox
                                                row={{
                                                    id: row.name,
                                                    campaign_name: row.campaign_name,
                                                    email_template: row.email_template,
                                                    target_type: row.target_type,
                                                    total_recipients: row.total_recipients,
                                                    sent_count: row.sent_count,
                                                    status: row.status,
                                                    created_on: row.creation,
                                                    template_name: row.email_template,
                                                }}
                                                onView={() => handleViewRow(row.name)}
                                                onEdit={() => handleEditRow(row.name)}
                                                onDelete={() => handleDeleteRow(row.name)}
                                                canEdit
                                                canDelete
                                            />
                                        ))}

                                        {notFound && <TableNoData searchQuery={filterName} colSpan={8} />}

                                        {empty && (
                                            <TableRow>
                                                <TableCell colSpan={9}>
                                                    <EmptyContent
                                                        title="No Email Campaigns lists found"
                                                        description="You haven't created any Email Campaigns lists yet."
                                                        icon="solar:calendar-mark-bold-duotone"
                                                        sx={{ py: 12 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    page={page}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[10, 25, 50]}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Card>

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

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => !deleting && setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this Email Campaign?"
                action={
                    <LoadingButton onClick={handleConfirmDelete} loading={deleting} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </LoadingButton>
                }
            />
        </DashboardContent>
    );
}