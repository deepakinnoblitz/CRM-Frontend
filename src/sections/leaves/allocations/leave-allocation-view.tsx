import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useLeaveAllocations } from 'src/hooks/useLeaveAllocations';

import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';
import { getHRPermissions } from 'src/api/hr-management';
import { createLeaveAllocation, deleteLeaveAllocation, updateLeaveAllocation } from 'src/api/leave-allocations';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { useAuth } from 'src/auth/auth-context';

import AutoAllocateDialog from './auto-allocate-dialog';
import { LeaveAllocationTableRow } from './leave-allocation-table-row';
import { LeadTableHead as LeavesTableHead } from '../../lead/lead-table-head';
import { LeaveAllocationDetailsDialog } from './leave-allocation-details-dialog';
import { LeaveAllocationFiltersDrawer } from './leave-allocation-filters-drawer';
import { LeadTableToolbar as LeavesTableToolbar } from '../../lead/lead-table-toolbar';


// ----------------------------------------------------------------------

const SORT_OPTIONS = [
    { value: 'creation_desc', label: 'Newest First' },
    { value: 'creation_asc', label: 'Oldest First' },
    { value: 'employee_name_asc', label: 'Employee: A to Z' },
    { value: 'employee_name_desc', label: 'Employee: Z to A' },
];

export function LeaveAllocationView() {
    const { user } = useAuth();

    const isHR = user?.roles?.some((role: string) =>
        ['HR Manager', 'HR', 'System Manager', 'Administrator'].includes(role)
    );

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('creation');
    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState<{
        status: string;
        leave_type: string;
        employee: string | null;
        startDate: string | null;
        endDate: string | null;
    }>({
        status: 'all',
        leave_type: 'all',
        employee: null,
        startDate: null,
        endDate: null,
    });

    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedAllocationName, setSelectedAllocationName] = useState<string | null>(null);

    // Form state
    const [employee, setEmployee] = useState('');
    const [leaveType, setLeaveType] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [totalLeaves, setTotalLeaves] = useState('');

    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
    const [leaveTypeOptions, setLeaveTypeOptions] = useState<any[]>([]);

    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);
    const [openAutoAllocate, setOpenAutoAllocate] = useState(false);
    const [openDetails, setOpenDetails] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [permissions, setPermissions] = useState<{ read: boolean; write: boolean; delete: boolean }>({
        read: true,
        write: true,
        delete: true,
    });

    const { data, total, loading, refetch } = useLeaveAllocations(
        page + 1,
        rowsPerPage,
        filterName,
        {
            ...(filters.status !== 'all' ? { workflow_state: filters.status } : {}),
            ...(filters.leave_type !== 'all' ? { leave_type: filters.leave_type } : {}),
            ...(filters.employee ? { employee: filters.employee } : {}),
            ...(filters.startDate ? { from_date: ['>=', filters.startDate] } : {}),
            ...(filters.endDate ? { to_date: ['<=', filters.endDate] } : {}),
        },
        orderBy,
        order,
        3000
    );

    useEffect(() => {
        getHRPermissions('Leave Allocation').then(setPermissions);
        getDoctypeList('Employee', ['name', 'employee_name']).then(setEmployeeOptions);
        getDoctypeList('Leave Type', ['name']).then(setLeaveTypeOptions);
    }, []);

    const handleSubmit = async () => {
        try {
            setCreating(true);
            const payload = {
                employee,
                leave_type: leaveType,
                from_date: fromDate,
                to_date: toDate,
                total_leaves_allocated: Number(totalLeaves),
            };

            if (isEdit && selectedAllocationName) {
                await updateLeaveAllocation(selectedAllocationName, payload);
                setSnackbar({ open: true, message: 'Leave allocation updated successfully', severity: 'success' });
            } else {
                await createLeaveAllocation(payload);
                setSnackbar({ open: true, message: 'Leave allocation created successfully', severity: 'success' });
            }
            refetch();
            handleCloseCreate();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = (row: any) => {
        setSelectedAllocationName(row.name);
        setEmployee(row.employee);
        setLeaveType(row.leave_type);
        setFromDate(row.from_date);
        setToDate(row.to_date);
        setTotalLeaves(String(row.total_leaves_allocated));
        setIsEdit(true);
        setOpenCreate(true);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteLeaveAllocation(confirmDelete.id);
            setSnackbar({ open: true, message: 'Deleted successfully', severity: 'success' });
            refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message, severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setEmployee('');
        setLeaveType('');
        setFromDate('');
        setToDate('');
        setTotalLeaves('');
        setIsEdit(false);
        setSelectedAllocationName(null);
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 3, md: 5 } }}>
                <Stack spacing={1}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Leave Allocations
                    </Typography>
                </Stack>


                <Stack direction="row" spacing={2}>
                    {permissions.write && (
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="solar:calendar-add-bold" />}
                            onClick={() => setOpenAutoAllocate(true)}
                            sx={{
                                borderColor: '#08a3cd',
                                color: '#08a3cd',
                                '&:hover': {
                                    borderColor: '#068fb3',
                                    bgcolor: (theme) => alpha('#08a3cd', 0.08)
                                }
                            }}
                        >
                            Allocate Monthly Leave
                        </Button>
                    )}
                    {permissions.write && (
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => setOpenCreate(true)}
                            sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                        >
                            New Allocation
                        </Button>
                    )}
                </Stack>
            </Stack>

            <Card>
                <LeavesTableToolbar
                    numSelected={0}
                    filterName={filterName}
                    onFilterName={(e) => setFilterName(e.target.value)}
                    searchPlaceholder="Search allocations..."
                    sortBy={`${orderBy}_${order}`}
                    onSortChange={(val) => {
                        const index = val.lastIndexOf('_');
                        const f = val.substring(0, index);
                        const d = val.substring(index + 1);
                        setOrderBy(f);
                        setOrder(d as any);
                    }}

                    sortOptions={SORT_OPTIONS}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={filters.status !== 'all' || filters.leave_type !== 'all' || filters.employee !== null || filters.startDate !== null || filters.endDate !== null}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <LeavesTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={0}
                                onSelectAllRows={() => { }}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee', label: 'Employee' },
                                    { id: 'leave_type', label: 'Leave Type' },
                                    { id: 'from_date', label: 'Period' },
                                    { id: 'total_leaves_allocated', label: 'Allocated', align: 'center' },
                                    { id: 'total_leaves_taken', label: 'Taken', align: 'center' },
                                    { id: 'status', label: 'Status' },
                                    { id: '', label: '' },
                                ]}
                            />

                            <TableBody>
                                {data.map((row, index) => (
                                    <LeaveAllocationTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employee: row.employee,
                                            employeeName: row.employee_name,
                                            leaveType: row.leave_type,
                                            fromDate: row.from_date,
                                            toDate: row.to_date,
                                            totalLeaves: row.total_leaves_allocated,
                                            leavesTaken: row.total_leaves_taken,
                                            status: row.workflow_state || row.status,
                                        }}
                                        selected={false}
                                        onSelectRow={() => { }}
                                        onView={() => {
                                            setSelectedAllocationId(row.name);
                                            setOpenDetails(true);
                                        }}
                                        onEdit={() => handleEdit(row)}
                                        onDelete={() => setConfirmDelete({ open: true, id: row.name })}
                                        canEdit={permissions.write}
                                        canDelete={permissions.delete}
                                    />
                                ))}

                                {!data.length && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <EmptyContent title="No allocations found" />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Card>

            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isEdit ? 'Edit Leave Allocation' : 'New Leave Allocation'}
                    <IconButton onClick={handleCloseCreate} sx={{ color: (theme) => theme.palette.grey[500] }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box display="grid" gridTemplateColumns="1fr" gap={3} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Employee"
                            value={employee}
                            onChange={(e) => setEmployee(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="">Select Employee</option>
                            {employeeOptions.map((opt) => (
                                <option key={opt.name} value={opt.name}>{opt.employee_name}</option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Leave Type"
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            <option value="">Select Leave Type</option>
                            {leaveTypeOptions.map((opt) => (
                                <option key={opt.name} value={opt.name}>{opt.name}</option>
                            ))}
                        </TextField>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <DatePicker
                                    label="From Date"
                                    value={fromDate ? dayjs(fromDate) : null}
                                    onChange={(val) => setFromDate(val?.format('YYYY-MM-DD') || '')}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <DatePicker
                                    label="To Date"
                                    value={toDate ? dayjs(toDate) : null}
                                    onChange={(val) => setToDate(val?.format('YYYY-MM-DD') || '')}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>
                        </LocalizationProvider>

                        <TextField
                            fullWidth
                            label="Total Leaves Allocated"
                            type="number"
                            value={totalLeaves}
                            onChange={(e) => setTotalLeaves(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <LoadingButton variant="contained" loading={creating} onClick={handleSubmit}>{isEdit ? 'Update' : 'Create'}</LoadingButton>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Delete"
                content="Are you sure you want to delete this allocation?"
                action={<Button variant="contained" color="error" onClick={handleConfirmDelete}>Delete</Button>}
            />

            <LeaveAllocationDetailsDialog
                open={openDetails}
                onClose={() => {
                    setOpenDetails(false);
                    setSelectedAllocationId(null);
                }}
                allocationId={selectedAllocationId}
                onRefresh={refetch}
                onEdit={(alloc) => {
                    setOpenDetails(false);
                    handleEdit(alloc);
                }}
                onDelete={(id) => {
                    setOpenDetails(false);
                    setConfirmDelete({ open: true, id });
                }}
            />

            <AutoAllocateDialog
                open={openAutoAllocate}
                onClose={() => setOpenAutoAllocate(false)}
                onSuccess={(message) => {
                    setSnackbar({ open: true, message, severity: 'success' });
                    refetch();
                }}
                onError={(error) => {
                    setSnackbar({ open: true, message: error, severity: 'error' });
                }}
            />

            {/* Filter Drawer */}
            <LeaveAllocationFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={(update) => setFilters({ ...filters, ...update })}
                canReset={filters.status !== 'all' || filters.leave_type !== 'all' || filters.employee !== null || filters.startDate !== null || filters.endDate !== null}
                onResetFilters={() => {
                    setFilters({
                        status: 'all',
                        leave_type: 'all',
                        employee: null,
                        startDate: null,
                        endDate: null,
                    });
                }}
                options={{
                    statuses: ['Approved', 'Pending', 'Rejected'],
                    leaveTypes: leaveTypeOptions.map((type) => type.name),
                    employees: employeeOptions,
                }}
                isHR={isHR}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                message={snackbar.message}
            />
        </DashboardContent>
    );
}
