import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { useTimesheets } from 'src/hooks/useTimesheets';

import { fetchEmployees } from 'src/api/employees';
import { fetchMonthHolidays } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';
import {
    getTimesheet,
    fetchProjects,
    createTimesheet,
    updateTimesheet,
    deleteTimesheet,
    fetchActivityTypes,
    getTimesheetPermissions,
} from 'src/api/timesheets';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { TimesheetTableRow } from 'src/sections/timesheets/timesheets-table-row';
import { LeadTableHead as TimesheetTableHead } from 'src/sections/lead/lead-table-head';
import { LeadTableToolbar as TimesheetTableToolbar } from 'src/sections/lead/lead-table-toolbar';
import { TimesheetDetailsDialog } from 'src/sections/report/timesheets/timesheets-details-dialog';

import { useAuth } from 'src/auth/auth-context';

import { TimesheetsTableFiltersDrawer } from '../timesheets-table-filters-drawer';

// ----------------------------------------------------------------------

interface TimesheetEntry {
    idx?: number;
    project: string;
    activity_type: string;
    hours: number;
    description: string;
}

export function TimesheetsView() {
    const { user } = useAuth();

    const isHR = user?.roles?.some((role: string) =>
        ['HR Manager', 'HR', 'System Manager', 'Administrator'].includes(role)
    );

    const router = useRouter();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('timesheet_date');
    const [selected, setSelected] = useState<string[]>([]);

    const [filters, setFilters] = useState({
        employee: 'all',
        startDate: null as string | null,
        endDate: null as string | null,
    });
    const [openFilters, setOpenFilters] = useState(false);

    const timesheetFilters = useMemo(() => ({
        ...filters,
        employee: isHR ? (filters.employee || 'all') : (user?.employee || 'all'),
    }), [filters, isHR, user]);

    const { data, total, refetch } = useTimesheets(page + 1, rowsPerPage, filterName, orderBy, order, timesheetFilters);

    const [openCreate, setOpenCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentTimesheet, setCurrentTimesheet] = useState<any>(null);

    // View state
    const [openView, setOpenView] = useState(false);
    const [viewTimesheet, setViewTimesheet] = useState<any>(null);

    // Form state
    const [employee, setEmployee] = useState('');
    const [timesheetDate, setTimesheetDate] = useState('');
    const [notes, setNotes] = useState('');
    const [entries, setEntries] = useState<TimesheetEntry[]>([]);

    // Entry dialog state
    const [openEntryDialog, setOpenEntryDialog] = useState(false);
    const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null);
    const [entryProject, setEntryProject] = useState('');
    const [entryActivityType, setEntryActivityType] = useState('');
    const [entryHours, setEntryHours] = useState('');
    const [entryDescription, setEntryDescription] = useState('');

    // Employees for dropdown
    const [employees, setEmployees] = useState<any[]>([]);

    // Projects and Activity Types for dropdown
    const [projects, setProjects] = useState<any[]>([]);
    const [activityTypes, setActivityTypes] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingActivityTypes, setLoadingActivityTypes] = useState(false);

    // Permissions
    const [permissions, setPermissions] = useState({ read: false, write: false, delete: false });

    // Snackbar
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [holidays, setHolidays] = useState<any[]>([]);

    // Load permissions and employees
    useEffect(() => {
        getTimesheetPermissions().then(setPermissions);
        fetchEmployees({ page: 1, page_size: 1000, search: '' }).then((res) => {
            setEmployees(res.data || []);
        });
        fetchProjects({ page: 1, page_size: 5 }).then((res: any) => {
            setProjects(res.data || []);
        });
        fetchActivityTypes({ page: 1, page_size: 5 }).then((res: any) => {
            setActivityTypes(res.data || []);
        });
        fetchMonthHolidays().then((res) => {
            setHolidays(res || []);
        });
    }, []);

    // Calculate total hours whenever entries change
    const totalHours = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    const handleFilters = (update: any) => {
        setFilters((prev) => ({ ...prev, ...update }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            employee: 'all',
            startDate: null,
            endDate: null,
        });
        setPage(0);
    };

    const canReset =
        filters.employee !== 'all' ||
        !!filters.startDate ||
        !!filters.endDate;

    const employeeOptions = employees.map((emp) => ({
        value: emp.name,
        label: `${emp.employee_name} (${emp.name || emp.employee_id})`,
    }));

    const handleSort = (value: string) => {
        if (value === 'timesheet_date_desc') {
            setOrderBy('timesheet_date');
            setOrder('desc');
        } else if (value === 'timesheet_date_asc') {
            setOrderBy('timesheet_date');
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
        if (orderBy === 'timesheet_date' && order === 'desc') return 'timesheet_date_desc';
        if (orderBy === 'timesheet_date' && order === 'asc') return 'timesheet_date_asc';
        if (orderBy === 'employee_name' && order === 'asc') return 'employee_name_asc';
        if (orderBy === 'employee_name' && order === 'desc') return 'employee_name_desc';
        if (orderBy === 'total_hours' && order === 'desc') return 'total_hours_desc';
        if (orderBy === 'total_hours' && order === 'asc') return 'total_hours_asc';
        return 'timesheet_date_desc';
    };

    const handleSelectAllRows = (checked: boolean) => {
        if (checked) {
            setSelected(data.map((row) => row.name));
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (name: string) => {
        setSelected((prev) =>
            prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]
        );
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selected.map((name) => deleteTimesheet(name)));
            setSnackbar({
                open: true,
                message: `${selected.length} timesheet(s) deleted successfully`,
                severity: 'success',
            });
            setSelected([]);
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to delete timesheets',
                severity: 'error',
            });
        }
    };

    const handleOpenCreate = useCallback(() => {
        setIsEdit(false);
        setCurrentTimesheet(null);
        // Pre-fill with current user's employee ID
        const currentEmployee = user?.employee || '';
        setEmployee(currentEmployee);
        setTimesheetDate('');
        setNotes('');
        setEntries([]);
        setFormErrors({});
        setOpenCreate(true);
    }, [user]);


    // Deep linking for new timesheet
    useEffect(() => {
        const date = searchParams.get('date');
        const action = searchParams.get('action');

        if (action === 'new' && date) {
            handleOpenCreate();
            setTimesheetDate(date);
        }
    }, [searchParams, handleOpenCreate]);

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setIsEdit(false);
        setCurrentTimesheet(null);
        setEmployee('');
        setTimesheetDate('');
        setNotes('');
        setEntries([]);
        setFormErrors({});

        // Redirect back to dashboard if opened via deep link
        const action = searchParams.get('action');
        if (action === 'new') {
            router.push('/');
        }
    };

    const handleEditRow = useCallback(async (row: any) => {
        try {
            // Fetch full timesheet data with child tables
            const fullData = await getTimesheet(row.name);
            setCurrentTimesheet(fullData);
            setEmployee(fullData.employee || '');
            setTimesheetDate(fullData.timesheet_date || '');
            setNotes(fullData.notes || '');
            setEntries(fullData.timesheet_entries || []);
            setFormErrors({});
            setIsEdit(true);
            setOpenCreate(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load timesheet',
                severity: 'error',
            });
        }
    }, []);

    const handleViewRow = useCallback(async (row: any) => {
        try {
            // Fetch full timesheet data with child tables
            const fullData = await getTimesheet(row.name);
            setViewTimesheet(fullData);
            setOpenView(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load timesheet',
                severity: 'error',
            });
        }
    }, []);

    const handleDeleteRow = useCallback(
        async (name: string) => {
            try {
                await deleteTimesheet(name);
                setSnackbar({ open: true, message: 'Timesheet deleted successfully', severity: 'success' });
                refetch();
            } catch (error: any) {
                setSnackbar({
                    open: true,
                    message: error.message || 'Failed to delete timesheet',
                    severity: 'error',
                });
            }
        },
        [refetch]
    );

    // Entry management functions
    const handleSearchProjects = useCallback(async (inputValue: string) => {
        setLoadingProjects(true);
        try {
            const res = await fetchProjects({ page: 1, page_size: 5, search: inputValue });
            setProjects(res.data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    }, []);

    const handleSearchActivityTypes = useCallback(async (inputValue: string) => {
        setLoadingActivityTypes(true);
        try {
            const res = await fetchActivityTypes({ page: 1, page_size: 5, search: inputValue });
            setActivityTypes(res.data || []);
        } catch (error) {
            console.error('Failed to fetch activity types:', error);
        } finally {
            setLoadingActivityTypes(false);
        }
    }, []);

    const handleOpenEntryDialog = () => {
        setEditingEntryIndex(null);
        setEntryProject('');
        setEntryActivityType('');
        setEntryHours('');
        setEntryDescription('');
        setOpenEntryDialog(true);
    };

    const handleEditEntry = (index: number) => {
        const entry = entries[index];
        setEditingEntryIndex(index);
        setEntryProject(entry.project);
        setEntryActivityType(entry.activity_type);
        setEntryHours(entry.hours.toString());
        setEntryDescription(entry.description);
        setOpenEntryDialog(true);
    };

    const handleDeleteEntry = (index: number) => {
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveEntry = () => {
        const newEntry: TimesheetEntry = {
            project: entryProject,
            activity_type: entryActivityType,
            hours: parseFloat(entryHours) || 0,
            description: entryDescription,
        };

        if (editingEntryIndex !== null) {
            setEntries((prev) => prev.map((entry, i) => (i === editingEntryIndex ? newEntry : entry)));
        } else {
            setEntries((prev) => [...prev, newEntry]);
        }

        setOpenEntryDialog(false);
        if (formErrors.entries) {
            setFormErrors((prev) => ({ ...prev, entries: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!employee) errors.employee = 'Employee is required';
        if (!timesheetDate) {
            errors.timesheetDate = 'Timesheet Date is required';
        } else {
            const isHoliday = holidays.some((h) => h.date === timesheetDate);
            const isSunday = dayjs(timesheetDate).day() === 0;

            if (isHoliday) {
                const holiday = holidays.find((h) => h.date === timesheetDate);
                errors.timesheetDate = `Cannot create timesheet on a holiday: ${holiday?.description || 'Holiday'}`;
            } else if (isSunday) {
                errors.timesheetDate = 'Cannot create timesheet on a Sunday';
            }
        }
        if (entries.length === 0) errors.entries = 'At least one entry is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const renderField = (
        fieldname: string,
        label: string,
        type: string = 'text',
        options: any[] = [],
        extraProps: any = {},
        required: boolean = false
    ) => {
        const commonProps = {
            fullWidth: true,
            label,
            value:
                fieldname === 'employee' ? employee : fieldname === 'timesheetDate' ? timesheetDate : notes,
            onChange: (e: any) => {
                const val = e.target.value;
                if (fieldname === 'employee') setEmployee(val);
                else if (fieldname === 'timesheetDate') setTimesheetDate(val);
                else if (fieldname === 'notes') setNotes(val);

                if (formErrors[fieldname]) {
                    setFormErrors((prev) => ({ ...prev, [fieldname]: '' }));
                }
            },
            required,
            error: !!formErrors[fieldname],
            helperText: formErrors[fieldname],
            InputLabelProps: { shrink: true },
            sx: {
                '& .MuiFormLabel-asterisk': {
                    color: 'red',
                },
                ...extraProps.sx,
            },
            ...extraProps,
        };

        if (type === 'select') {
            return (
                <TextField {...commonProps} select SelectProps={{ native: true }}>
                    <option value="">Select {label}</option>
                    {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </TextField>
            );
        }

        if (fieldname === 'timesheetDate') {
            const dateValue = timesheetDate ? dayjs(timesheetDate) : null;
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label={label}
                        value={dateValue}
                        onChange={(newValue) => {
                            const val =
                                newValue && dayjs(newValue).isValid() ? dayjs(newValue).format('YYYY-MM-DD') : '';
                            setTimesheetDate(val);
                            if (formErrors.timesheetDate)
                                setFormErrors((prev) => ({ ...prev, timesheetDate: '' }));
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required,
                                error: !!formErrors.timesheetDate,
                                helperText: formErrors.timesheetDate,
                                InputLabelProps: { shrink: true },
                                sx: {
                                    '& .MuiFormLabel-asterisk': {
                                        color: 'red',
                                    },
                                },
                            },
                        }}
                    />
                </LocalizationProvider>
            );
        }

        return (
            <TextField
                {...commonProps}
                multiline={type === 'textarea'}
                rows={type === 'textarea' ? 3 : 1}
            />
        );
    };

    const handleCreate = async () => {
        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: 'Please correct the errors in the form',
                severity: 'error',
            });
            return;
        }

        const timesheetData = {
            employee: employee.trim(),
            timesheet_date: timesheetDate,
            total_hours: totalHours,
            notes: notes.trim(),
            timesheet_entries: entries,
        };

        try {
            if (isEdit && currentTimesheet) {
                await updateTimesheet(currentTimesheet.name, timesheetData);
                setSnackbar({ open: true, message: 'Timesheet updated successfully', severity: 'success' });
            } else {
                await createTimesheet(timesheetData);
                setSnackbar({ open: true, message: 'Timesheet created successfully', severity: 'success' });
            }
            handleCloseCreate();
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Operation failed', severity: 'error' });
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterByName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterName(event.target.value);
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const notFound = !data.length && !!filterName;
    const empty = !data.length && !filterName;

    return (
        <DashboardContent>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Timesheets
                </Typography>

                {permissions.write && (
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        New Timesheet
                    </Button>
                )}
            </Box>

            <Card>
                <TimesheetTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    searchPlaceholder="Search timesheets..."
                    onDelete={selected.length > 0 ? handleBulkDelete : undefined}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortBy={getCurrentSortValue()}
                    onSortChange={handleSort}
                    sortOptions={[
                        { value: 'timesheet_date_desc', label: 'Newest First' },
                        { value: 'timesheet_date_asc', label: 'Oldest First' },
                        { value: 'employee_name_asc', label: 'Employee: A to Z' },
                        { value: 'employee_name_desc', label: 'Employee: Z to A' },
                        { value: 'total_hours_desc', label: 'Hours: High to Low' },
                        { value: 'total_hours_asc', label: 'Hours: Low to High' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TimesheetTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Employee' },
                                    { id: 'timesheet_date', label: 'Date' },
                                    { id: 'total_hours', label: 'Total Hours' },
                                    { id: '', label: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <TimesheetTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employee_name: row.employee_name,
                                            timesheet_date: row.timesheet_date,
                                            total_hours: row.total_hours,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleViewRow(row)}
                                        onEdit={() => handleEditRow(row)}
                                        onDelete={() => handleDeleteRow(row.name)}
                                        canEdit={permissions.write}
                                        canDelete={permissions.delete}
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <EmptyContent
                                                title="No timesheets found"
                                                description="You haven't recorded any timesheets yet."
                                                icon="solar:clock-circle-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!empty && (
                                    <TableEmptyRows height={68} emptyRows={Math.max(0, rowsPerPage - data.length)} />
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>

                <TablePagination
                    component="div"
                    page={page}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="lg">
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {isEdit ? 'Edit Timesheet' : 'New Timesheet'}
                    <IconButton onClick={handleCloseCreate}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 3, p: 2 }}>
                        <Box
                            sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}
                        >
                            <Autocomplete
                                fullWidth
                                options={employees}
                                getOptionLabel={(option) =>
                                    option.employee_name
                                        ? `${option.employee_name} (${option.name || option.employee_id})`
                                        : option.employee_id || ''
                                }
                                isOptionEqualToValue={(option, value) => option.name === (value?.name || value)}
                                value={employees.find((emp) => emp.name === employee) || (employee && user?.employee === employee ? { name: user.employee, employee_name: user.employee_name } : null)}
                                readOnly={isEdit}
                                onChange={(event, newValue) => {
                                    setEmployee(newValue?.name || '');
                                    if (formErrors.employee) {
                                        setFormErrors((prev) => ({ ...prev, employee: '' }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Employee"
                                        required
                                        error={!!formErrors.employee}
                                        helperText={formErrors.employee}
                                        InputLabelProps={{ shrink: true }}
                                        placeholder="Search employee..."
                                        sx={{
                                            '& .MuiFormLabel-asterisk': {
                                                color: 'red',
                                            },
                                        }}
                                        inputProps={{
                                            ...params.inputProps,
                                            readOnly: isEdit,
                                        }}
                                    />
                                )}

                            />
                            {renderField('timesheetDate', 'Timesheet Date', 'date', [], {}, true)}
                        </Box>

                        {renderField('notes', 'Notes', 'textarea', [], {
                            placeholder: 'Enter timesheet notes',
                        })}

                        {/* Timesheet Entries Child Table */}
                        <Box sx={{ mt: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        color: formErrors.entries ? 'error.main' : 'text.primary',
                                    }}
                                >
                                    Timesheet Entries
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ ml: 2, color: 'primary.main', fontWeight: 600 }}
                                    >
                                        Total: {totalHours.toFixed(1)} hours
                                    </Typography>
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<Iconify icon="mingcute:add-line" />}
                                    onClick={handleOpenEntryDialog}
                                >
                                    Add Entry
                                </Button>
                            </Box>

                            {formErrors.entries && (
                                <Typography variant="caption" sx={{ color: 'error.main', mb: 1, display: 'block' }}>
                                    {formErrors.entries}
                                </Typography>
                            )}

                            <TableContainer
                                sx={{
                                    border: '1px solid',
                                    borderColor: formErrors.entries ? 'error.main' : 'divider',
                                    borderRadius: 1,
                                }}
                            >
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>Project</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Activity Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {entries.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    align="center"
                                                    sx={{ py: 3, color: 'text.secondary' }}
                                                >
                                                    No entries added yet. Click &quot;Add Entry&quot; to begin.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            entries.map((entry, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>{entry.project}</TableCell>
                                                    <TableCell>{entry.activity_type}</TableCell>
                                                    <TableCell>{entry.hours} hrs</TableCell>
                                                    <TableCell>{entry.description || '-'}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditEntry(index)}
                                                            color="info"
                                                        >
                                                            <Iconify icon="solar:pen-bold" width={18} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteEntry(index)}
                                                            color="error"
                                                        >
                                                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Entry Dialog */}
            <Dialog
                open={openEntryDialog}
                onClose={() => setOpenEntryDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {editingEntryIndex !== null ? 'Edit Entry' : 'Add Entry'}
                    <IconButton onClick={() => setOpenEntryDialog(false)}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 3, pt: 2 }}>
                        <Autocomplete
                            fullWidth
                            options={projects}
                            loading={loadingProjects}
                            getOptionLabel={(option) => option.project || option.name || ''}
                            value={
                                projects.find((p) => p.name === entryProject) ||
                                (entryProject ? { name: entryProject, project: entryProject } : null)
                            }
                            isOptionEqualToValue={(option, value) => option.name === value.name}
                            onInputChange={(event, newInputValue) => {
                                handleSearchProjects(newInputValue);
                            }}
                            onChange={(event, newValue) => {
                                setEntryProject(newValue?.name || '');
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Project" required placeholder="Select project" />
                            )}
                        />
                        <Autocomplete
                            fullWidth
                            options={activityTypes}
                            loading={loadingActivityTypes}
                            getOptionLabel={(option) => option.activity_type || option.name || ''}
                            value={
                                activityTypes.find((at) => at.name === entryActivityType) ||
                                (entryActivityType
                                    ? { name: entryActivityType, activity_type: entryActivityType }
                                    : null)
                            }
                            isOptionEqualToValue={(option, value) => option.name === value.name}
                            onInputChange={(event, newInputValue) => {
                                handleSearchActivityTypes(newInputValue);
                            }}
                            onChange={(event, newValue) => {
                                setEntryActivityType(newValue?.name || '');
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Activity Type"
                                    required
                                    placeholder="Select activity type"
                                />
                            )}
                        />
                        <TextField
                            fullWidth
                            label="Hours"
                            type="number"
                            value={entryHours}
                            onChange={(e) => setEntryHours(e.target.value)}
                            required
                            inputProps={{ step: '0.5', min: '0' }}
                            placeholder="Enter hours worked"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={entryDescription}
                            onChange={(e) => setEntryDescription(e.target.value)}
                            multiline
                            rows={3}
                            placeholder="Enter task description"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleSaveEntry}
                        variant="contained"
                        disabled={!entryProject || !entryActivityType || !entryHours}
                    >
                        {editingEntryIndex !== null ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <TimesheetDetailsDialog
                open={openView}
                onClose={() => setOpenView(false)}
                timesheet={viewTimesheet}
            />

            <TimesheetsTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                employees={employees}
                isHR={isHR}
            />

            {/* Snackbar */}
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
        </DashboardContent>
    );
}
