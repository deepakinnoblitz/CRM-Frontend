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

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { TableNoData } from 'src/sections/proposal/table-no-data';
import { TableEmptyRows } from 'src/sections/proposal/table-empty-rows';
import { ProposalTableHead } from 'src/sections/proposal/proposal-table-head';
import { ProposalTableToolbar } from 'src/sections/proposal/proposal-table-toolbar';


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
    const [sortBy, setSortBy] = useState('created_desc');
    
    const data: any[] = []; 
    const total = 0;
    const loading = false;

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
                                        <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                            <CircularProgress sx={{ color: '#08a3cd' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {notFound && <TableNoData searchQuery={filterName} />}
                                        
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

                                        {/* {!empty && !notFound && (
                                            <TableEmptyRows
                                                height={68}
                                                emptyRows={filteredData.length < 5 ? 5 - filteredData.length : 0}
                                            />
                                        )} */}
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
        </DashboardContent>
    );
}