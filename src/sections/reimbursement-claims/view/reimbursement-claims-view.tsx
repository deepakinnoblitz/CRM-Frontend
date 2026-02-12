import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useReimbursementClaims } from 'src/hooks/useReimbursementClaims';

import { fetchEmployees } from 'src/api/employees';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  applyClaimWorkflowAction,
  createReimbursementClaim,
  deleteReimbursementClaim,
  getClaimTypes,
  getReimbursementClaim,
  getReimbursementClaimPermissions,
  updateReimbursementClaim,
} from 'src/api/reimbursement-claims';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { LeadTableHead as ClaimTableHead } from 'src/sections/lead/lead-table-head';
import { LeadTableToolbar as ClaimTableToolbar } from 'src/sections/lead/lead-table-toolbar';
import { ReimbursementClaimTableRow } from 'src/sections/reimbursement-claims/reimbursement-claims-table-row';
import { ReimbursementClaimDetailsDialog } from 'src/sections/report/reimbursement-claims/reimbursement-claims-details-dialog';
import { ReimbursementClaimsTableFiltersDrawer } from 'src/sections/reimbursement-claims/reimbursement-claims-table-filters-drawer';

import { useAuth } from 'src/auth/auth-context';
// ----------------------------------------------------------------------

export function ReimbursementClaimsView() {
    const { user } = useAuth();
    const isHR = user?.roles?.some(role => ['HR Manager', 'HR User', 'System Manager', 'Administrator'].includes(role));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('date_of_expense');
    const [selected, setSelected] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState({
        paid: 'all',
        claim_type: 'all',
        startDate: null as string | null,
        endDate: null as string | null
    });

    const { data, total, refetch } = useReimbursementClaims(
        page + 1,
        rowsPerPage,
        filterName,
        orderBy,
        order,
        filters
    );

    const [openCreate, setOpenCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentClaim, setCurrentClaim] = useState<any>(null);

    // View state
    const [openView, setOpenView] = useState(false);
    const [viewClaim, setViewClaim] = useState<any>(null);

    // Form state
    const [employee, setEmployee] = useState('');
    const [claimType, setClaimType] = useState('');
    const [dateOfExpense, setDateOfExpense] = useState('');
    const [amount, setAmount] = useState('');
    const [claimDetails, setClaimDetails] = useState('');

    // List for dropdowns
    const [employees, setEmployees] = useState<any[]>([]);
    const [claimTypes, setClaimTypes] = useState<any[]>([]);

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

    // Load permissions, employees, and claim types
    useEffect(() => {
        getReimbursementClaimPermissions().then(setPermissions);
        fetchEmployees({ page: 1, page_size: 1000, search: '' }).then((res) => {
            setEmployees(res.data || []);
        });
        getClaimTypes().then(setClaimTypes);
    }, []);

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
            await Promise.all(selected.map((name) => deleteReimbursementClaim(name)));
            setSnackbar({
                open: true,
                message: `${selected.length} claim(s) deleted successfully`,
                severity: 'success',
            });
            setSelected([]);
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to delete claims',
                severity: 'error',
            });
        }
    };

    const handleOpenCreate = () => {
        setIsEdit(false);
        setCurrentClaim(null);
        setEmployee('');
        setClaimType('');
        setDateOfExpense('');
        setAmount('');
        setClaimDetails('');
        setFormErrors({});
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setIsEdit(false);
        setCurrentClaim(null);
        setEmployee('');
        setClaimType('');
        setDateOfExpense('');
        setAmount('');
        setClaimDetails('');
        setFormErrors({});
    };

    const handleEditRow = useCallback(async (row: any) => {
        try {
            const fullData = await getReimbursementClaim(row.name);
            setCurrentClaim(fullData);
            setEmployee(fullData.employee || '');
            setClaimType(fullData.claim_type || '');
            setDateOfExpense(fullData.date_of_expense || '');
            setAmount(fullData.amount?.toString() || '');
            setClaimDetails(fullData.claim_details || '');
            setFormErrors({});
            setIsEdit(true);
            setOpenCreate(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load claim',
                severity: 'error',
            });
        }
    }, []);

    const handleViewRow = useCallback(async (row: any) => {
        try {
            const fullData = await getReimbursementClaim(row.name);
            setViewClaim(fullData);
            setOpenView(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load claim',
                severity: 'error',
            });
        }
    }, []);

    const handleDeleteRow = useCallback(
        async (name: string) => {
            try {
                await deleteReimbursementClaim(name);
                setSnackbar({
                    open: true,
                    message: 'Claim deleted successfully',
                    severity: 'success',
                });
                refetch();
            } catch (error: any) {
                setSnackbar({
                    open: true,
                    message: error.message || 'Failed to delete claim',
                    severity: 'error',
                });
            }
        },
        [refetch]
    );

    const handleWorkflowAction = useCallback(
        async (name: string, action: string) => {
            try {
                await applyClaimWorkflowAction(name, action);
                setSnackbar({
                    open: true,
                    message: `Action ${action} applied successfully`,
                    severity: 'success',
                });
                refetch();
            } catch (error: any) {
                setSnackbar({
                    open: true,
                    message: error.message || `Failed to apply action ${action}`,
                    severity: 'error',
                });
            }
        },
        [refetch]
    );

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!employee) errors.employee = 'Employee is required';
        if (!claimType) errors.claimType = 'Claim Type is required';
        if (!dateOfExpense) errors.dateOfExpense = 'Date of Expense is required';
        if (!amount || parseFloat(amount) <= 0) errors.amount = 'Valid Amount is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: 'Please correct the errors in the form', severity: 'error' });
            return;
        }

        const claimData = {
            employee: employee.trim(),
            claim_type: claimType.trim(),
            date_of_expense: dateOfExpense,
            amount: parseFloat(amount) || 0,
            claim_details: claimDetails.trim(),
        };

        try {
            if (isEdit && currentClaim) {
                await updateReimbursementClaim(currentClaim.name, claimData);
                setSnackbar({
                    open: true,
                    message: 'Claim updated successfully',
                    severity: 'success',
                });
            } else {
                await createReimbursementClaim(claimData);
                setSnackbar({
                    open: true,
                    message: 'Claim created successfully',
                    severity: 'success',
                });
            }
            handleCloseCreate();
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Operation failed',
                severity: 'error',
            });
        }
    };

    const handleFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            paid: 'all',
            claim_type: 'all',
            startDate: null,
            endDate: null
        });
        setPage(0);
    };

    const canReset = filters.paid !== 'all' || filters.claim_type !== 'all' || filters.startDate !== null || filters.endDate !== null;

    const handleSortChange = (value: string) => {
        if (value === 'date_desc') { setOrderBy('date_of_expense'); setOrder('desc'); }
        else if (value === 'date_asc') { setOrderBy('date_of_expense'); setOrder('asc'); }
        else if (value === 'amount_desc') { setOrderBy('amount'); setOrder('desc'); }
        else if (value === 'amount_asc') { setOrderBy('amount'); setOrder('asc'); }
        else if (value === 'employee_asc') { setOrderBy('employee_name'); setOrder('asc'); }
        else if (value === 'employee_desc') { setOrderBy('employee_name'); setOrder('desc'); }
        setPage(0);
    };

    const getCurrentSortValue = () => {
        if (orderBy === 'date_of_expense') return order === 'desc' ? 'date_desc' : 'date_asc';
        if (orderBy === 'amount') return order === 'desc' ? 'amount_desc' : 'amount_asc';
        if (orderBy === 'employee_name') return order === 'desc' ? 'employee_desc' : 'employee_asc';
        return 'date_desc';
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

    const renderField = (fieldname: string, label: string, type: string = 'text', options: any[] = [], extraProps: any = {}, required: boolean = false) => {
        const commonProps = {
            fullWidth: true,
            label,
            value: (fieldname === 'employee' ? employee : fieldname === 'claim_type' ? claimType : fieldname === 'date_of_expense' ? dateOfExpense : fieldname === 'amount' ? amount : claimDetails),
            onChange: (e: any) => {
                const val = e.target.value;
                if (fieldname === 'employee') setEmployee(val);
                else if (fieldname === 'claim_type') setClaimType(val);
                else if (fieldname === 'date_of_expense') setDateOfExpense(val);
                else if (fieldname === 'amount') setAmount(val);
                else if (fieldname === 'claim_details') setClaimDetails(val);

                if (formErrors[fieldname]) {
                    setFormErrors(prev => ({ ...prev, [fieldname]: '' }));
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
                ...extraProps.sx
            },
            ...extraProps
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

        if (fieldname === 'date_of_expense') {
            const dateValue = dateOfExpense ? dayjs(dateOfExpense) : null;
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label={label}
                        value={dateValue}
                        onChange={(newValue) => {
                            const val = newValue && dayjs(newValue).isValid() ? dayjs(newValue).format('YYYY-MM-DD') : '';
                            setDateOfExpense(val);
                            if (formErrors.dateOfExpense) setFormErrors(prev => ({ ...prev, dateOfExpense: '' }));
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required,
                                error: !!formErrors.dateOfExpense,
                                helperText: formErrors.dateOfExpense,
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

        return <TextField {...commonProps} multiline={type === 'textarea'} rows={type === 'textarea' ? 4 : 1} />;
    };

    return (
        <DashboardContent>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Reimbursement Claims
                </Typography>

                {permissions.write && (
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                        sx={{
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' },
                        }}
                    >
                        New Claim
                    </Button>
                )}
            </Box>

            <Card>
                <ClaimTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    searchPlaceholder="Search claims..."
                    onDelete={selected.length > 0 ? handleBulkDelete : undefined}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortBy={getCurrentSortValue()}
                    onSortChange={handleSortChange}
                    sortOptions={[
                        { value: 'date_desc', label: 'Newest First' },
                        { value: 'date_asc', label: 'Oldest First' },
                        { value: 'amount_desc', label: 'Amount: High to Low' },
                        { value: 'amount_asc', label: 'Amount: Low to High' },
                        { value: 'employee_asc', label: 'Employee: A to Z' },
                        { value: 'employee_desc', label: 'Employee: Z to A' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <ClaimTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Employee' },
                                    { id: 'claim_type', label: 'Claim Type' },
                                    { id: 'date_of_expense', label: 'Date' },
                                    { id: 'amount', label: 'Amount' },
                                    { id: 'workflow_state', label: 'Status' },
                                    { id: '', label: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <ReimbursementClaimTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employee_name: row.employee_name,
                                            claim_type: row.claim_type,
                                            date_of_expense: row.date_of_expense,
                                            amount: row.amount,
                                            paid: row.paid,
                                            workflow_state: row.workflow_state,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleViewRow(row)}
                                        onEdit={() => handleEditRow(row)}
                                        onDelete={() => handleDeleteRow(row.name)}
                                        onWorkflowAction={(action) => handleWorkflowAction(row.name, action)}
                                        canEdit={permissions.write}
                                        canDelete={permissions.delete}
                                        isHR={isHR}
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyContent
                                                title="No claims found"
                                                description="You haven't submitted any reimbursement claims yet."
                                                icon="solar:money-bag-bold-duotone"
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
                    page={page}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {isEdit ? 'Edit Claim' : 'New Claim'}
                    <IconButton onClick={handleCloseCreate}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 3, p: 2 }}>
                        {renderField('employee', 'Employee', 'select', employees.map(emp => ({ value: emp.name, label: `${emp.employee_name} (${emp.employee_id})` })), {}, true)}
                        {renderField('claim_type', 'Claim Type', 'select', claimTypes.map(type => ({ value: type.name, label: type.name })), {}, true)}
                        {renderField('date_of_expense', 'Date of Expense', 'date', [], {}, true)}
                        {renderField('amount', 'Amount', 'number', [], { placeholder: 'Enter amount', inputProps: { step: '0.01', min: '0' } }, true)}
                        {renderField('claim_details', 'Claim Details', 'textarea', [], { placeholder: 'Enter claim details' })}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCreate} variant="contained" sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <ReimbursementClaimDetailsDialog
                open={openView}
                onClose={() => setOpenView(false)}
                claim={viewClaim}
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

            {/* Filters Drawer */}
            <ReimbursementClaimsTableFiltersDrawer
                open={openFilters}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                claimTypes={claimTypes}
            />
        </DashboardContent>
    );
}
