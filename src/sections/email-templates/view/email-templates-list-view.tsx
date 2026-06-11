import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';

import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData } from 'src/sections/proposal/table-no-data';
import { TableEmptyRows } from 'src/sections/proposal/table-empty-rows';
import { ProposalTableHead } from 'src/sections/proposal/proposal-table-head';
import { ProposalTableToolbar } from 'src/sections/proposal/proposal-table-toolbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

const TABLE_HEAD = [
    { id: 'index', label: 'S.No' },
    { id: 'template_name', label: 'Template Name' },
    { id: 'category', label: 'Category' },
    { id: 'subject', label: 'Subject' },
    { id: 'status', label: 'Status' },
    { id: 'created_by', label: 'Created By' },
    { id: 'modified', label: 'Last Modified' },
    { id: 'action', label: 'Actions', align: 'center' },
];

export function EmailTemplateListView() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('modified_desc');
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
    
    // Mock data for now
    const data: any[] = []; 
    const total = 0;
    const loading = false;

    const handleCreateNew = () => router.push('/email-templates/new');

    const notFound = !loading && data.length === 0 && !!filterName;
    const empty = !loading && data.length === 0 && !filterName;

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4">CRM Email Templates</Typography>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon={"mingcute:add-line" as any} />}
                    onClick={handleCreateNew}
                    sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                >
                    New Template
                </Button>
            </Stack>

            <Card>
                <ProposalTableToolbar
                    numSelected={0}
                    filterName={filterName}
                    onFilterName={(e) => setFilterName(e.target.value)}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onOpenFilter={() => {}}
                    canReset={!!filterName}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 960 }}>
                            <ProposalTableHead
                                rowCount={total}
                                numSelected={0}
                                onSelectAllRows={() => {}}
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
                                        {/* Rows go here */}
                                        {notFound && <TableNoData colSpan={8} searchQuery={filterName} />}
                                        {empty && (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                    <Typography variant="subtitle1" color="text.secondary">
                                                        No email templates found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {!empty && !notFound && <TableEmptyRows height={68} emptyRows={data.length < 5 ? 5 - data.length : 0} />}
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

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this template?"
                action={
                    <Button variant="contained" color="error" onClick={() => setConfirmDelete({ open: false, id: null })}>
                        Delete
                    </Button>
                }
            />
        </DashboardContent>
    );
}