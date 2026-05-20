import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import Backdrop from '@mui/material/Backdrop';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useProposals } from 'src/hooks/useProposals';

import { handleDownload, handleDirectPrint } from 'src/utils/print';

import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';
import { deleteProposal, getProposalPrintUrl } from 'src/api/proposal';

import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { emptyRows } from '../utils';
import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { ProposalTableRow } from '../proposal-table-row';
import { ProposalTableHead } from '../proposal-table-head';
import { ProposalTableToolbar } from '../proposal-table-toolbar';
import { ProposalTableFiltersDrawer } from '../proposal-table-filters-drawer';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'reference_no', label: 'Proposal No' },
    { id: 'proposal_title', label: 'Proposal Title' },
    { id: 'client_name', label: 'Client' },
    { id: 'billing_name', label: 'Billing Name' },
    { id: 'proposal_date', label: 'Proposal Date' },
    { id: 'status', label: 'Status' },
    { id: 'total_attachments', label: 'Attachments', align: 'center' },
    { id: '' },
];

// ----------------------------------------------------------------------

interface Props {
    hideTitle?: boolean;
    prospectId?: string;
}

export function ProposalListView({ hideTitle, prospectId }: Props) {
    const table = useProposalTable();
    const router = useRouter();

    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('modified_desc');
    const [printing, setPrinting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState({
        client_name: 'all',
        status: 'all',
        proposal_date: '',
        ...(prospectId ? { prospect: prospectId } : {}),
    });
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);

    useEffect(() => {
        getDoctypeList('Contacts', ['name', 'first_name', 'company_name'])
            .then((data) =>
                setCustomerOptions(
                    data.map((c: any) => ({ name: c.name, customer_name: c.first_name || c.name }))
                )
            )
            .catch((err) => console.error('Failed to fetch filter options', err));
    }, []);

    const { data, total, loading, refetch } = useProposals(
        table.page,
        table.rowsPerPage,
        filterName,
        sortBy,
        filters
    );

    const handleFilters = (update: any) => {
        setFilters((prev) => ({ ...prev, ...update }));
        table.onResetPage();
    };

    const handleResetFilters = () => {
        setFilters({
            client_name: 'all',
            status: 'all',
            proposal_date: '',
            ...(prospectId ? { prospect: prospectId } : {}),
        });
        table.onResetPage();
    };

    const canReset =
        filters.client_name !== 'all' ||
        (filters.status !== 'all' && !!filters.status) ||
        !!filters.proposal_date ||
        !!filterName;

    const handleFilterName = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
        },
        [table]
    );

    const handleCreateNew = () => {
        if (prospectId) {
            router.push(`/proposals/new?prospect_id=${prospectId}`);
        } else {
            router.push('/proposals/new');
        }
    };

    const handleEditRow = (id: string) => {
        router.push(`/proposals/${encodeURIComponent(id)}/edit`);
    };

    const handleViewRow = (id: string) => {
        router.push(`/proposals/${encodeURIComponent(id)}/view`);
    };

    const handleDeleteRow = useCallback((id: string) => {
        setConfirmDelete({ open: true, id });
    }, []);

    const handlePrintRow = (id: string, reference_no?: string) => {
        handleDownload(
            getProposalPrintUrl(id),
            `${reference_no || id}.pdf`,
            () => setPrinting(true),
            () => setPrinting(false)
        );
    };

    const handlePreviewRow = (id: string) => {
        handleDirectPrint(
            getProposalPrintUrl(id),
            () => setPrinting(true),
            () => setPrinting(false)
        );
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteProposal(confirmDelete.id);
            setSnackbar({
                open: true,
                message: 'Proposal deleted successfully',
                severity: 'success',
            });
            await refetch();
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: 'Failed to delete proposal', severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const notFound = !loading && data.length === 0 && (!!filterName || canReset);
    const empty = !loading && data.length === 0 && !filterName && !canReset;

    const renderContent = (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                {!hideTitle && <Typography variant="h4">Proposals</Typography>}
                {hideTitle && <Box sx={{ flexGrow: 1 }} />}
            </Stack>

            <Card>
                <ProposalTableToolbar
                    numSelected={table.selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterName}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 960 }}>
                            <ProposalTableHead
                                rowCount={total}
                                numSelected={table.selected.length}
                                onSelectAllRows={(checked) =>
                                    table.onSelectAllRows(
                                        checked,
                                        data.map((row) => row.name)
                                    )
                                }
                                hideCheckbox
                                showIndex
                                headLabel={TABLE_HEAD}
                            />
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={36} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {data.map((row, index) => (
                                            <ProposalTableRow
                                                key={row.name}
                                                index={table.page * table.rowsPerPage + index}
                                                hideCheckbox
                                                row={{
                                                    id: row.name,
                                                    reference_no: row.reference_no,
                                                    proposal_title: row.proposal_title,
                                                    client_name: row.client_name || '',
                                                    customer_name: row.customer_name || '',
                                                    billing_name: row.billing_name || '',
                                                    billing_account_name:
                                                        (row as any).billing_account_name || '',
                                                    proposal_date: row.proposal_date,
                                                    status: row.status,
                                                    total_attachments: row.total_attachments,
                                                }}
                                                selected={table.selected.includes(row.name)}
                                                onSelectRow={() => table.onSelectRow(row.name)}
                                                onEdit={() => handleEditRow(row.name)}
                                                onView={() => handleViewRow(row.name)}
                                                onDelete={() => handleDeleteRow(row.name)}
                                                onPrint={() =>
                                                    handlePrintRow(row.name, row.reference_no)
                                                }
                                                onPreview={() => handlePreviewRow(row.name)}
                                            />
                                        ))}

                                        {notFound && (
                                            <TableNoData colSpan={10} searchQuery={filterName} />
                                        )}

                                        {empty && (
                                            <TableRow>
                                                <TableCell colSpan={10}>
                                                    <EmptyContent
                                                        title="No proposals found"
                                                        description="Create a new proposal to get started."
                                                        icon="solar:document-text-bold-duotone"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}

                                        {!empty && !notFound && (
                                            <TableEmptyRows
                                                height={68}
                                                emptyRows={data.length < 5 ? 5 - data.length : 0}
                                            />
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    page={table.page}
                    component="div"
                    count={total}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    rowsPerPageOptions={[10, 25, 50]}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>

            <ProposalTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters as any}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={{ customers: customerOptions }}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this proposal?"
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        Delete
                    </Button>
                }
            />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={printing}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );

    if (hideTitle) {
        return renderContent;
    }

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            {renderContent}
        </DashboardContent>
    );
}

// ----------------------------------------------------------------------

export function useProposalTable() {
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState('reference_no');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<string[]>([]);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const onSort = useCallback(
        (id: string) => {
            const isAsc = orderBy === id && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(id);
        },
        [order, orderBy]
    );

    const onSelectAllRows = useCallback((checked: boolean, ids: string[]) => {
        setSelected(checked ? ids : []);
    }, []);

    const onSelectRow = useCallback((value: string) => {
        setSelected((prev: string[]) =>
            prev.includes(value) ? prev.filter((v: string) => v !== value) : [...prev, value]
        );
    }, []);

    const onResetPage = () => setPage(0);
    const onChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const onChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        onResetPage();
    };

    return {
        page,
        order,
        orderBy,
        rowsPerPage,
        selected,
        onSort,
        onSelectRow,
        onSelectAllRows,
        onResetPage,
        onChangePage,
        onChangeRowsPerPage,
    };
}
