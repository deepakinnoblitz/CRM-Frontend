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
import { EmployeePresenceSettingsDialog } from '../employee-presence-settings-dialog';
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
    const isHR = user?.roles?.includes('HR') || user?.roles?.includes('Administrator');
    const { socket } = useSocket(user?.email);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [filterName, setFilterName] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterEmployee, setFilterEmployee] = useState('all');
    const [filterDay, setFilterDay] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState<string>('');
    const [filterEndDate, setFilterEndDate] = useState<string>('');
    const [sortBy, setSortBy] = useState('login_date_desc');

    const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (isHR) {
            const fetchEmployees = async () => {
                try {
                    const res = await fetch('/api/method/frappe.client.get_list', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            doctype: 'Employee',
                            fields: ['name', 'employee_name'],
                            filters: { status: 'Active' },
                            limit_page_length: 1000
                        })
                    });
                    const data = await res.json();
                    if (data.message) {
                        setEmployees(data.message.map((emp: any) => ({
                            value: emp.name,
                            label: `${emp.employee_name} (${emp.name})`
                        })));
                    }
                } catch (error) {
                    console.error('Failed to fetch employees:', error);
                }
            };
            fetchEmployees();
        }
    }, [isHR]);

    const { data: sessions, totalCount, loading, refetch } = usePresenceLog(
        page * rowsPerPage,
        rowsPerPage,
        filterName,
        filterStatus,
        sortBy,
        filterEmployee,
        filterDay,
        '',
        filterStartDate,
        filterEndDate
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

    const [openSettings, setOpenSettings] = useState(false);
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

    const handleFilterEmployee = (value: string) => {
        setFilterEmployee(value);
        setPage(0);
    };

    const handleFilterDay = (value: string) => {
        setFilterDay(value);
        setPage(0);
    };

    const handleFilterStartDate = (value: string) => {
        setFilterStartDate(value);
        setPage(0);
    };
    
    const handleFilterEndDate = (value: string) => {
        setFilterEndDate(value);
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
        setFilterEmployee('all');
        setFilterDay('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setPage(0);
    };

    const canReset = filterStatus !== 'all' || filterEmployee !== 'all' || filterDay !== 'all' || !!filterStartDate || !!filterEndDate;

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const notFound = !loading && sessions.length === 0 && (!!filterName || canReset);
    const emptyRows = (!loading && sessions.length > 0) ? (sessions.length < 5 ? 5 - sessions.length : 0) : 0;

    return (
        <DashboardContent maxWidth={false} sx={{mt: 2}}>
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
                    isHR={isHR}
                    onOpenSettings={() => setOpenSettings(true)}
                    canReset={canReset}
                    sortOptions={SORT_OPTIONS}
                    searchPlaceholder="Search by date or employee..."
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
                                onSelectAllRows={() => { }}
                                headLabel={[
                                    ...(isHR ? [{ id: 'employee', label: 'Employee', minWidth: 200 }] : []),
                                    { id: 'login_date', label: 'Date', minWidth: 150 },
                                    // { id: 'status', label: 'Status', minWidth: 120 },
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
                                            isHR={isHR}
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
                    rowsPerPageOptions={[10, 25, 50]}
                />
            </Card>

            <EmployeeDailyLogDetailsDialog
                open={openDetails}
                onClose={handleCloseDetails}
                session={selectedSession}
            />

            <EmployeePresenceSettingsDialog
                open={openSettings}
                onClose={() => setOpenSettings(false)}
            />

            <EmployeeDailyLogTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filterStatus={filterStatus}
                onFilterStatus={handleFilterStatus}
                filterEmployee={filterEmployee}
                onFilterEmployee={handleFilterEmployee}
                filterDay={filterDay}
                onFilterDay={handleFilterDay}
                filterStartDate={filterStartDate}
                onFilterStartDate={handleFilterStartDate}
                filterEndDate={filterEndDate}
                onFilterEndDate={handleFilterEndDate}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={{ 
                    status: STATUS_OPTIONS,
                    employees: employees,
                    days: [
                        { value: 'Monday', label: 'Monday' },
                        { value: 'Tuesday', label: 'Tuesday' },
                        { value: 'Wednesday', label: 'Wednesday' },
                        { value: 'Thursday', label: 'Thursday' },
                        { value: 'Friday', label: 'Friday' },
                        { value: 'Saturday', label: 'Saturday' },
                        { value: 'Sunday', label: 'Sunday' },
                    ]
                }}
            />
        </DashboardContent>
    );
}
