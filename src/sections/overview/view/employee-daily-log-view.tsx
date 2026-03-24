import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { SelectChangeEvent } from '@mui/material/Select';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useSocket } from 'src/hooks/use-socket';
import { usePresenceLog } from 'src/hooks/use-presence-log';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { useAuth } from 'src/auth/auth-context';

import { TableNoData } from '../../lead/table-no-data';
import { LeadTableHead } from '../../lead/lead-table-head';
import { TableEmptyRows } from '../../lead/table-empty-rows';
import { EmployeeDailyLogTableRow } from '../employee-daily-log-table-row';
import { EmployeeDailyLogTableToolbar } from './employee-daily-log-table-toolbar';
import { EmployeeDailyLogDetailsDialog } from '../employee-daily-log-details-dialog';
import { EmployeeDailyLogTableFiltersDrawer } from './employee-daily-log-table-filters-drawer';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const SORT_OPTIONS = [
    { value: 'login_date_desc', label: 'Newest First' },
    { value: 'login_date_asc', label: 'Oldest First' },
    { value: 'working_hours_desc', label: 'Working Hrs: High to Low' },
    { value: 'working_hours_asc', label: 'Working Hrs: Low to High' },
];

// ----------------------------------------------------------------------

export function EmployeeDailyLogView() {
    const { user } = useAuth();
    const { socket } = useSocket(user?.email);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    const [filterName, setFilterName] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('login_date_desc');

    const { data: sessions, totalCount, loading, refetch } = usePresenceLog(
        page * rowsPerPage,
        rowsPerPage,
        filterName,
        filterStatus,
        sortBy
    );

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        const handleUpdate = () => {
            refetch();
        };

        socket.on('session_update', handleUpdate);
        socket.on('presence_update', handleUpdate);

        return () => {
            socket.off('session_update', handleUpdate);
            socket.off('presence_update', handleUpdate);
        };
    }, [socket, refetch]);

    const [openDetails, setOpenDetails] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);

    const [openFilters, setOpenFilters] = useState(false);

    const handleOpenDetails = (session: any) => {
        setSelectedSession(session);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setSelectedSession(null);
    };

    const handleFilterName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const handleFilterStatus = (value: string) => {
        setFilterStatus(value);
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
        setPage(0);
    };

    const canReset = filterStatus !== 'all';

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const notFound = !loading && sessions.length === 0 && (!!filterName || canReset);
    const emptyRows = (!loading && sessions.length > 0) ? Math.max(0, rowsPerPage - sessions.length) : 0;

    return (
        <DashboardContent maxWidth={false}>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Employee Daily Log
                </Typography>
            </Box>

            <Card>
                <EmployeeDailyLogTableToolbar
                    filterName={filterName}
                    onFilterName={handleFilterName}
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortOptions={SORT_OPTIONS}
                    searchPlaceholder="Search by date..."
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                                <LeadTableHead
                                order="desc"
                                orderBy="login_date"
                                rowCount={sessions.length}
                                numSelected={0}
                                hideCheckbox
                                showIndex
                                onSelectAllRows={() => {}}
                                headLabel={[
                                    { id: 'login_date', label: 'Date', minWidth: 150 },
                                    { id: 'status', label: 'Status', minWidth: 120 },
                                    { id: 'login_time', label: 'Login', minWidth: 120 },
                                    { id: 'logout_time', label: 'Logout', minWidth: 120 },
                                    { id: 'total_work_hours', label: 'Working Hours', minWidth: 150 },
                                    { id: 'break_hours', label: 'Break Hours', minWidth: 150 },
                                    { id: '', label: '', align: 'right' },
                                ]}
                            />

                            <TableBody>
                                {loading ? (
                                    null
                                ) : (
                                    sessions.map((row, index) => (
                                        <EmployeeDailyLogTableRow
                                            key={row.name}
                                            index={page * rowsPerPage + index}
                                            row={row}
                                            onView={() => handleOpenDetails(row)}
                                        />
                                    ))
                                )}

                                {emptyRows > 0 && <TableEmptyRows emptyRows={emptyRows} height={70} />}
                                {notFound && <TableNoData searchQuery={filterName} />}
                                {!loading && sessions.length === 0 && !filterName && !canReset && (
                                    <TableRow>
                                        <TableCell align="center" colSpan={7}>
                                            <EmptyContent
                                                title="No Data Available"
                                                description="There is no activity list created yet."
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>

            <EmployeeDailyLogDetailsDialog
                open={openDetails}
                onClose={handleCloseDetails}
                session={selectedSession}
            />

            <EmployeeDailyLogTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filterStatus={filterStatus}
                onFilterStatus={handleFilterStatus}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={{ status: STATUS_OPTIONS }}
            />
        </DashboardContent>
    );
}
