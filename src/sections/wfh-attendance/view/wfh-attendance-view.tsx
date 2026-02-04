import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useWFHAttendance } from 'src/hooks/useWFHAttendance';

import { getDoctypeList } from 'src/api/leads';
import { getCurrentUserInfo } from 'src/api/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getHRPermissions } from 'src/api/hr-management';
import { getWFHAttendance, createWFHAttendance, updateWFHAttendance, applyWorkflowAction } from 'src/api/wfh-attendance';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { TableNoData } from '../../lead/table-no-data';
import { TableEmptyRows } from '../../lead/table-empty-rows';
import { WFHAttendanceTableRow } from '../wfh-attendance-table-row';
import { WFHAttendanceDetailsDialog } from '../wfh-attendance-details-dialog';
import { LeadTableHead as AttendanceTableHead } from '../../lead/lead-table-head';
import { WFHAttendanceTableFiltersDrawer } from '../wfh-attendance-table-filters-drawer';
import { LeadTableToolbar as AttendanceTableToolbar } from '../../lead/lead-table-toolbar';

// ----------------------------------------------------------------------

export function WFHAttendanceView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('date');
    const [selected, setSelected] = useState<string[]>([]);

    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({
        date: dayjs().format('YYYY-MM-DD'),
    });

    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState<{ employee: string; status: string; startDate: string | null; endDate: string | null }>({
        employee: 'all',
        status: 'all',
        startDate: null,
        endDate: null
    });

    const canReset = filters.employee !== 'all' || filters.status !== 'all' || filters.startDate !== null || filters.endDate !== null;

    const [openDetails, setOpenDetails] = useState(false);
    const [detailsId, setDetailsId] = useState<string | null>(null);

    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

    // Alert & Dialog State
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [serverAlert, setServerAlert] = useState<{ message: string, severity: 'success' | 'error' | 'warning' | 'info' }>({
        message: '',
        severity: 'info'
    });

    const [isHR, setIsHR] = useState(false);
    const [permissions, setPermissions] = useState<{ read: boolean; write: boolean }>({
        read: true,
        write: true,
    });

    const { data, total, loading, refetch } = useWFHAttendance(
        page + 1,
        rowsPerPage,
        filterName,
        orderBy,
        order,
        filters
    );

    const notFound = !data.length && !!filterName;
    const empty = !data.length && !filterName && !loading;

    useEffect(() => {
        getHRPermissions('WFH Attendance').then(setPermissions);
        getDoctypeList('Employee', ['name', 'employee_name']).then(setEmployeeOptions).catch(console.error);
        getCurrentUserInfo().then((user) => {
            if (user && user.roles) {
                // Broaden HR detection to include Admins/System Managers
                const hrRoles = ['HR Manager', 'HR User', 'System Manager', 'Administrator'];
                setIsHR(user.roles.some((role: string) => hrRoles.includes(role)));
            }
        });
    }, []);

    const handleFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prevState) => ({
            ...prevState,
            ...newFilters,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            employee: 'all',
            status: 'all',
            startDate: null,
            endDate: null,
        });
    };

    const handleOpenCreate = () => {
        setFormData({
            date: dayjs().format('YYYY-MM-DD'),
        });
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setCurrentId(null);
    };

    const handleInputChange = (fieldname: string, value: any) => {
        setFormData((prev: Record<string, any>) => {
            const next = { ...prev, [fieldname]: value };

            // Calculate hours
            if (fieldname === 'from_time' || fieldname === 'to_time') {
                if (next.from_time && next.to_time) {
                    const start = dayjs(`2000-01-01 ${next.from_time}`);
                    const end = dayjs(`2000-01-01 ${next.to_time}`);
                    if (end.isAfter(start)) {
                        const diffMs = end.diff(start);
                        const diffHrs = diffMs / (1000 * 60 * 60);
                        next.total_hours = diffHrs.toFixed(2);
                    } else {
                        next.total_hours = '0.00';
                    }
                }
            }
            return next;
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev: any) => ({ ...prev, open: false }));
    };

    const validateForm = () => {
        if (!formData.employee) return 'Employee is required';
        if (!formData.date) return 'Date is required';
        if (!formData.from_time) return 'From Time is required';

        // Check future date
        const selectedDate = dayjs(formData.date);
        const today = dayjs().startOf('day');
        if (selectedDate.isAfter(today)) {
            // return 'WFH Attendance cannot be marked for future dates';
        }

        // Logical time check
        if (formData.from_time && formData.to_time) {
            const start = dayjs(`2000-01-01 ${formData.from_time}`);
            const end = dayjs(`2000-01-01 ${formData.to_time}`);
            if (!end.isAfter(start)) {
                return 'To Time must be after From Time';
            }
        }

        return null;
    };

    const handleCreate = async () => {
        const error = validateForm();
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            return;
        }

        try {
            setCreating(true);
            setServerAlert({ message: '', severity: 'info' });

            if (currentId) {
                await updateWFHAttendance(currentId, formData as any);
                setSnackbar({ open: true, message: 'Record updated successfully', severity: 'success' });
            } else {
                await createWFHAttendance(formData as any);
                setSnackbar({ open: true, message: 'Record created successfully', severity: 'success' });
            }

            await refetch();
            handleCloseCreate();
        } catch (err: any) {
            console.error(err);
            setServerAlert({ message: err.message || 'Error saving record', severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleViewRow = async (id: string) => {
        setDetailsId(id);
        setOpenDetails(true);
    };

    const handleEditRow = async (id: string) => {
        try {
            const fullDoc = await getWFHAttendance(id);
            setCurrentId(id);
            setFormData({ ...fullDoc });
            setOpenCreate(true);
        } catch (error) {
            console.error('Failed to load details:', error);
            setSnackbar({ open: true, message: 'Failed to load details', severity: 'error' });
        }
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setDetailsId(null);
    };

    const handleSort = (value: string) => {
        if (value === 'date_desc') {
            setOrderBy('date');
            setOrder('desc');
        } else if (value === 'date_asc') {
            setOrderBy('date');
            setOrder('asc');
        } else if (value === 'employee_name_asc') {
            setOrderBy('employee_name');
            setOrder('asc');
        } else if (value === 'employee_name_desc') {
            setOrderBy('employee_name');
            setOrder('desc');
        } else if (value === 'total_hours_desc') {
            setOrderBy('total_hours');
            setOrder('desc');
        } else if (value === 'total_hours_asc') {
            setOrderBy('total_hours');
            setOrder('asc');
        }
    };

    const getCurrentSortValue = () => {
        if (orderBy === 'date' && order === 'desc') return 'date_desc';
        if (orderBy === 'date' && order === 'asc') return 'date_asc';
        if (orderBy === 'employee_name' && order === 'asc') return 'employee_name_asc';
        if (orderBy === 'employee_name' && order === 'desc') return 'employee_name_desc';
        if (orderBy === 'total_hours' && order === 'desc') return 'total_hours_desc';
        if (orderBy === 'total_hours' && order === 'asc') return 'total_hours_asc';
        return 'date_desc';
    };

    const handleSelectAllRows = (checked: boolean) => {
        if (checked) {
            const newSelected = data.map((n) => n.name);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleSelectRow = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleApplyAction = async (id: string, action: string) => {
        try {
            await applyWorkflowAction(id, action);
            setSnackbar({ open: true, message: `Record ${action}ed successfully`, severity: 'success' });
            await refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || `Failed to ${action} record`, severity: 'error' });
        }
    };

    const handleBulkDelete = async () => {
        setSnackbar({ open: true, message: `Bulk delete is disabled`, severity: 'error' });
    };

    const renderField = (fieldname: string, label: string, type: string = 'text', options: any[] = [], extraProps: any = {}, required: boolean = false) => {
        const commonProps = {
            fullWidth: true,
            label,
            value: formData[fieldname] || '',
            onChange: (e: any) => handleInputChange(fieldname, e.target.value),
            InputLabelProps: { shrink: true },
            required,
            ...extraProps,
            sx: {
                '& .MuiFormLabel-asterisk': {
                    color: 'red',
                },
                ...extraProps.sx
            }
        };

        if (type === 'select' || type === 'link') {
            return (
                <TextField {...commonProps} select SelectProps={{ native: true }}>
                    <option value="">Select {label}</option>
                    {options.map((opt: any) => (
                        <option key={opt.name || opt} value={opt.name || opt}>
                            {opt.employee_name ? `${opt.employee_name} (${opt.name})` : (opt.name || opt)}
                        </option>
                    ))}
                </TextField>
            );
        }

        if (type === 'date') {
            return (
                <DatePicker
                    label={label}
                    value={formData[fieldname] ? dayjs(formData[fieldname]) : null}
                    onChange={(newValue) => handleInputChange(fieldname, newValue?.format('YYYY-MM-DD') || '')}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required,
                            InputLabelProps: { shrink: true },
                            sx: commonProps.sx
                        }
                    }}
                />
            );
        }

        if (type === 'time') {
            return (
                <TimePicker
                    label={label}
                    value={formData[fieldname] ? dayjs(`2000-01-01 ${formData[fieldname]}`) : null}
                    onChange={(newValue) => handleInputChange(fieldname, newValue?.format('HH:mm:ss') || '')}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            required,
                            InputLabelProps: { shrink: true },
                            sx: commonProps.sx
                        }
                    }}
                />
            );
        }

        return <TextField {...commonProps} />;
    };

    return (
        <DashboardContent>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    WFH Attendance List
                </Typography>

                {permissions.write && (
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        New WFH Entry
                    </Button>
                )}
            </Box>

            <Card>
                <AttendanceTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(e.target.value);
                        setPage(0);
                    }}
                    onDelete={handleBulkDelete}
                    searchPlaceholder="Search entries..."
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortBy={getCurrentSortValue()}
                    onSortChange={handleSort}
                    sortOptions={[
                        { value: 'date_desc', label: 'Newest First' },
                        { value: 'date_asc', label: 'Oldest First' },
                        { value: 'employee_name_asc', label: 'Employee: A to Z' },
                        { value: 'employee_name_desc', label: 'Employee: Z to A' },
                        { value: 'total_hours_desc', label: 'Hours: High to Low' },
                        { value: 'total_hours_asc', label: 'Hours: Low to High' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <AttendanceTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={total}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Employee', minWidth: 180 },
                                    { id: 'date', label: 'Date', minWidth: 120 },
                                    { id: 'workflow_state', label: 'Status', minWidth: 100 },
                                    { id: 'from_time', label: 'From', minWidth: 100 },
                                    { id: 'to_time', label: 'To', minWidth: 100 },
                                    { id: 'total_hours', label: 'Hours', minWidth: 80 },
                                    { id: '', label: 'Actions', align: 'right' },
                                ]}
                            />

                            <TableBody>
                                {data.map((row, index) => (
                                    <WFHAttendanceTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employee: row.employee,
                                            employeeName: row.employee_name,
                                            date: row.date,
                                            workflowState: row.workflow_state || 'Draft',
                                            fromTime: row.from_time,
                                            toTime: row.to_time,
                                            totalHours: row.total_hours,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleViewRow(row.name)}
                                        onEdit={() => handleEditRow(row.name)}
                                        onApplyAction={(action) => handleApplyAction(row.name, action)}
                                        canEdit={permissions.write}
                                        isHR={isHR}
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <EmptyContent
                                                title="No WFH records"
                                                description="You haven't added any WFH entries yet."
                                                icon="solar:calendar-date-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!empty && (
                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={Math.max(0, rowsPerPage - data.length)}
                                    />
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
                    onPageChange={(_e, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Card>

            {/* CREATE/EDIT DIALOG */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {currentId ? 'Edit WFH Entry' : 'New WFH Entry'}
                    <IconButton onClick={handleCloseCreate} sx={{ color: (theme) => theme.palette.grey[500] }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box
                            display="grid"
                            margin={2}
                            gridTemplateColumns="1fr"
                            gap={3}
                        >
                            {renderField('employee', 'Employee', 'select', employeeOptions, {}, true)}
                            {renderField('date', 'Date', 'date', [], {}, true)}

                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                {renderField('from_time', 'From Time', 'time', [], {}, true)}
                                {renderField('to_time', 'To Time', 'time', [], {}, false)}
                            </Box>

                            <TextField
                                fullWidth
                                label="Total Hours"
                                value={formData.total_hours || ''}
                                InputProps={{ readOnly: true }}
                                InputLabelProps={{ shrink: true }}
                                variant="filled"
                            />

                            {renderField('task_description', 'Task Description', 'text', [], { multiline: true, rows: 3 })}
                        </Box>
                    </LocalizationProvider>
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                        {creating ? 'Saving...' : (currentId ? 'Update Entry' : 'Save Entry')}
                    </Button>
                </DialogActions>
            </Dialog>

            <WFHAttendanceDetailsDialog
                open={openDetails}
                onClose={handleCloseDetails}
                wfhId={detailsId}
            />

            <WFHAttendanceTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={{
                    employees: employeeOptions
                }}
            />

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

            <Snackbar
                open={!!serverAlert.message}
                autoHideDuration={6000}
                onClose={() => setServerAlert({ ...serverAlert, message: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setServerAlert({ ...serverAlert, message: '' })}
                    severity={serverAlert.severity}
                    sx={{ width: '100%', whiteSpace: 'pre-line' }}
                >
                    {serverAlert.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
