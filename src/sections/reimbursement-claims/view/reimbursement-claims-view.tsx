import dayjs from 'dayjs';
import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useSocket } from 'src/hooks/use-socket';
import { useReimbursementClaims } from 'src/hooks/useReimbursementClaims';

import { fetchEmployees } from 'src/api/employees';
import { DashboardContent } from 'src/layouts/dashboard';
import {
    applyReimbursementClaimWorkflowAction,
    getReimbursementClaim,
    createReimbursementClaim,
    updateReimbursementClaim,
    deleteReimbursementClaim,
    getReimbursementClaimPermissions,
    getClaimTypes
} from 'src/api/reimbursement-claims';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { LeadTableHead as ClaimTableHead } from 'src/sections/lead/lead-table-head';
import { LeadTableToolbar as ClaimTableToolbar } from 'src/sections/lead/lead-table-toolbar';
import { ReimbursementClaimTableRow } from 'src/sections/reimbursement-claims/reimbursement-claims-table-row';
import { ReimbursementClaimDetailsDialog } from 'src/sections/report/reimbursement-claims/reimbursement-claims-details-dialog';
import { ReimbursementClaimsTableFiltersDrawer } from 'src/sections/reimbursement-claims/reimbursement-claims-table-filters-drawer';

import { useAuth } from 'src/auth/auth-context';

const Android12Switch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
        borderRadius: 22 / 2,
        '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
        },
        '&::before': {
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
            left: 12,
        }
    },
    '& .MuiSwitch-thumb': {
        boxShadow: 'none',
        width: 16,
        height: 16,
        margin: 2,
    },
}));

// ----------------------------------------------------------------------

export function ReimbursementClaimsView() {
    const { user } = useAuth();
    const { socket, subscribeToRoom } = useSocket(user?.email);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('modified');

    useEffect(() => {
        subscribeToRoom('Reimbursement Claim');
    }, [subscribeToRoom]);
    const [selected, setSelected] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState(false);
    const [filters, setFilters] = useState({
        employee: null as string | null,
        paid: 'all',
        claim_type: 'all',
        startDate: null as string | null,
        endDate: null as string | null
    });

    const isHR = user?.roles.some((role: string) =>
        ['HR Manager', 'HR User', 'HR', 'System Manager', 'Administrator', 'Accounts Manager'].includes(role)
    );

    const effectiveEmployee = isHR ? (filters.employee || 'all') : (user?.employee || 'all');

    const claimsFilters = useMemo(() => ({
        ...filters,
        employee: effectiveEmployee,
    }), [filters, isHR, effectiveEmployee]);

    const { data, total, refetch } = useReimbursementClaims(
        page + 1,
        rowsPerPage,
        filterName,
        orderBy,
        order,
        claimsFilters,
        socket
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

    // Payment Details (for Edit)
    const [paymentReference, setPaymentReference] = useState('');
    const [paidDate, setPaidDate] = useState<string | null>(null);
    const [paid, setPaid] = useState(false);
    const [approvedBy, setApprovedBy] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [approverComments, setApproverComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    const [confirmMarkPaidOpen, setConfirmMarkPaidOpen] = useState(false);
    const [pendingPayClaim, setPendingPayClaim] = useState<any>(null);

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
        setEmployee(isHR ? '' : (user?.employee || ''));
        setClaimType('');
        setDateOfExpense('');
        setAmount('');
        setClaimDetails('');
        setClaimDetails('');
        setPaymentReference('');
        setPaidDate(null);
        setPaid(false);
        setApprovedBy('');
        setPaidBy('');
        setApproverComments('');
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
            setPaymentReference(fullData.payment_reference || '');
            setPaidDate(fullData.paid_date || null);
            setPaid(fullData.paid === 1);
            setApprovedBy(fullData.approved_by || '');
            setPaidBy(fullData.paid_by || '');
            setApproverComments(fullData.approver_comments || '');
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

    const handleApplyAction = async (id: string, action: string) => {
        try {
            await applyReimbursementClaimWorkflowAction(id, action);
            setSnackbar({ open: true, message: `Claim ${action}ed successfully`, severity: 'success' });
            await refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || `Failed to ${action} claim`, severity: 'error' });
        }
    };

    const isApprovedOrPaid = isEdit && currentClaim && (currentClaim.workflow_state === 'Approved' || currentClaim.workflow_state === 'Paid');

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
            const errors: Record<string, string> = {};
            if (!employee) errors.employee = 'Employee';
            if (!claimType) errors.claimType = 'Claim Type';
            if (!dateOfExpense) errors.dateOfExpense = 'Date of Expense';
            if (!amount || parseFloat(amount) <= 0) errors.amount = 'Valid Amount';

            const missingFields = Object.values(errors).join(', ');
            setSnackbar({
                open: true,
                message: `Please provide: ${missingFields}`,
                severity: 'error'
            });
            return;
        }

        // For approved/paid claims, only send settlement details
        if (isApprovedOrPaid) {
            const settlementData = {
                payment_reference: paymentReference,
                paid_date: paidDate || undefined,
                paid: paid ? 1 : 0,
                approved_by: approvedBy,
                paid_by: paidBy,
                approver_comments: approverComments
            };

            try {
                setSubmitting(true);
                await updateReimbursementClaim(currentClaim.name, settlementData);

                if (currentClaim.workflow_state === 'Approved') {
                    setPendingPayClaim(currentClaim);
                    if (!paymentReference) setPaymentReference('');
                    if (!paidDate) setPaidDate(dayjs().format('YYYY-MM-DD'));
                    setConfirmMarkPaidOpen(true);
                }

                setSnackbar({
                    open: true,
                    message: 'Settlement details updated successfully',
                    severity: 'success',
                });
                handleCloseCreate();
                refetch();
            } catch (error: any) {
                setSnackbar({
                    open: true,
                    message: error.message || 'Operation failed',
                    severity: 'error',
                });
            } finally {
                setSubmitting(false);
            }
            return;
        }

        const claimData = {
            employee: employee.trim(),
            claim_type: claimType.trim(),
            date_of_expense: dateOfExpense,
            amount: parseFloat(amount) || 0,
            claim_details: claimDetails.trim(),
            ...(isEdit && user?.roles.some(r => ['System Manager', 'HR', 'HR User', 'HR Manager', 'Accounts Manager'].includes(r)) ? {
                payment_reference: paymentReference,
                paid_date: paidDate || undefined,
                paid: paid ? 1 : 0,
                approved_by: approvedBy,
                paid_by: paidBy,
                approver_comments: approverComments
            } : {})
        };

        try {
            setSubmitting(true);
            if (isEdit && currentClaim) {
                await updateReimbursementClaim(currentClaim.name, claimData);

                // If the claim is Approved but NOT paid, ask to mark as paid
                // We check existing state + new state. If we just saved it and it's Approved, we check if 'paid' toggle was off.
                // If the user already toggled 'paid' in the form, claimData.paid would be 1, so we don't need to ask.
                // We also need to check if the current workflow state (which might have been updated) is 'Approved'.
                // Since we don't have the fresh claim object here without refetching, we rely on the fact we just saved it.
                // Usage: User opens Approved claim -> Updates -> Dialog closes -> Prompt opens.

                // Construct a temporary updated claim object to check status
                const updatedWorkflowState = currentClaim.workflow_state; // Status doesn't change on simple update usually unless workflow action involved, but here we assume it stays Approved

                if (updatedWorkflowState === 'Approved') {
                    setPendingPayClaim({ ...currentClaim, ...claimData });
                    if (!paymentReference) setPaymentReference('');
                    if (!paidDate) setPaidDate(dayjs().format('YYYY-MM-DD'));
                    setConfirmMarkPaidOpen(true);
                }

                setSnackbar({
                    open: true,
                    message: 'Claim updated successfully',
                    severity: 'success',
                });
            } else {
                await createReimbursementClaim(claimData);
                setSnackbar({
                    open: true,
                    message: 'Claim submitted successfully',
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkPaidConfirm = async () => {
        if (!pendingPayClaim) return;

        if (!paidDate) {
            setSnackbar({ open: true, message: 'Please select a Paid Date', severity: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            await updateReimbursementClaim(pendingPayClaim.name, {
                paid: 1,
                paid_date: paidDate,
                payment_reference: paymentReference,
                workflow_state: 'Paid', // Explicitly set if workflow transition allows, or rely on backend hook
                // If using workflow actions, we might need applyReimbursementClaimWorkflowAction here instead,
                // but typically update with 'Paid' status or field might trigger it depending on backend.
                // Given previous code uses updateReimbursementClaim for settlement, we stick to that.
            });

            setSnackbar({
                open: true,
                message: 'Claim marked as Paid successfully',
                severity: 'success',
            });
            setConfirmMarkPaidOpen(false);
            setPendingPayClaim(null);
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to mark as paid',
                severity: 'error',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            employee: null,
            paid: 'all',
            claim_type: 'all',
            startDate: null,
            endDate: null
        });
        setPage(0);
    };

    const canReset = filters.employee !== null || filters.paid !== 'all' || filters.claim_type !== 'all' || filters.startDate !== null || filters.endDate !== null;

    const handleSortChange = (value: string) => {
        if (value === 'newest') { setOrderBy('modified'); setOrder('desc'); }
        else if (value === 'oldest') { setOrderBy('modified'); setOrder('asc'); }
        else if (value === 'date_desc') { setOrderBy('date_of_expense'); setOrder('desc'); }
        else if (value === 'date_asc') { setOrderBy('date_of_expense'); setOrder('asc'); }
        else if (value === 'amount_desc') { setOrderBy('amount'); setOrder('desc'); }
        else if (value === 'amount_asc') { setOrderBy('amount'); setOrder('asc'); }
        else if (value === 'employee_asc') { setOrderBy('employee_name'); setOrder('asc'); }
        else if (value === 'employee_desc') { setOrderBy('employee_name'); setOrder('desc'); }
        setPage(0);
    };

    const getCurrentSortValue = () => {
        if (orderBy === 'modified') return order === 'desc' ? 'newest' : 'oldest';
        if (orderBy === 'date_of_expense') return order === 'desc' ? 'date_desc' : 'date_asc';
        if (orderBy === 'amount') return order === 'desc' ? 'amount_desc' : 'amount_asc';
        if (orderBy === 'employee_name') return order === 'desc' ? 'employee_desc' : 'employee_asc';
        return 'newest';
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
            value: (() => {
                if (fieldname === 'employee') return employee;
                if (fieldname === 'claim_type') return claimType;
                if (fieldname === 'date_of_expense') return dateOfExpense;
                if (fieldname === 'amount') return amount;
                if (fieldname === 'payment_reference') return paymentReference;
                if (fieldname === 'approved_by') return approvedBy;
                if (fieldname === 'paid_by') return paidBy;
                if (fieldname === 'approver_comments') return approverComments;
                return claimDetails;
            })(),
            onChange: (e: any) => {
                const val = e.target.value;
                if (fieldname === 'employee') setEmployee(val);
                else if (fieldname === 'claim_type') setClaimType(val);
                else if (fieldname === 'date_of_expense') setDateOfExpense(val);
                else if (fieldname === 'amount') {
                    // Allow only numbers and one decimal point
                    if (/^\d*\.?\d*$/.test(val)) {
                        setAmount(val);
                    }
                }
                else if (fieldname === 'claim_details') setClaimDetails(val);
                else if (fieldname === 'payment_reference') setPaymentReference(val);
                else if (fieldname === 'approved_by') setApprovedBy(val);
                else if (fieldname === 'paid_by') setPaidBy(val);
                else if (fieldname === 'approver_comments') setApproverComments(val);

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
                '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'unset', // Important for Safari/Chrome
                    color: 'text.primary',
                    opacity: 1,
                    pointerEvents: 'none', // Prevent interaction
                },
                '& .MuiInputLabel-root.Mui-disabled': {
                    color: 'text.secondary', // Keep label color normal
                },
                '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)', // Keep border normal
                },
                '& .MuiInputBase-input[readonly]': {
                    cursor: 'default',
                    pointerEvents: 'none',
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

        if (fieldname === 'date_of_expense' || fieldname === 'paid_date') {
            const dateValue = fieldname === 'date_of_expense' ? (dateOfExpense ? dayjs(dateOfExpense) : null) : (paidDate ? dayjs(paidDate) : null);
            return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label={label}
                        value={dateValue}
                        onChange={(newValue) => {
                            const val = newValue && dayjs(newValue).isValid() ? dayjs(newValue).format('YYYY-MM-DD') : '';
                            if (fieldname === 'date_of_expense') {
                                setDateOfExpense(val);
                                if (formErrors.dateOfExpense) setFormErrors(prev => ({ ...prev, dateOfExpense: '' }));
                            } else {
                                setPaidDate(val || null);
                            }
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                required,
                                error: !!formErrors[fieldname === 'date_of_expense' ? 'dateOfExpense' : fieldname],
                                helperText: formErrors[fieldname === 'date_of_expense' ? 'dateOfExpense' : fieldname],
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
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'date_desc', label: 'Date: Newest to Oldest' },
                        { value: 'date_asc', label: 'Date: Oldest to Newest' },
                        { value: 'amount_desc', label: 'Amount: High to Low' },
                        { value: 'amount_asc', label: 'Amount: Low to High' },
                        { value: 'employee_asc', label: 'Employee: A to Z' },
                        { value: 'employee_desc', label: 'Employee: Z to A' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: { xs: 300, md: 800 } }}>
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
                                    { id: 'claim_type', label: 'Claim Type', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'date_of_expense', label: 'Date', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'amount', label: 'Amount', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'paid', label: 'Status' },
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
                                            employee_id: row.employee,
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
                                        onApplyAction={(action) => handleApplyAction(row.name, action)}
                                        canEdit={permissions.write && (
                                            (isHR && row.employee !== user?.employee) ||
                                            (row.workflow_state === 'Clarification Requested') ||
                                            (row.workflow_state === 'Submitted' && row.employee === user?.employee)
                                        )}
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
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="md">
                <DialogTitle
                    sx={{
                        m: 0,
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.neutral',
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                        {isEdit ? 'Edit Claim' : 'New Claim'}
                    </Typography>

                    <IconButton
                        onClick={handleCloseCreate}
                        sx={{
                            p: 0.75,
                            bgcolor: 'background.paper',
                            boxShadow: (theme) => theme.customShadows.z8,
                            '&:hover': {
                                bgcolor: 'background.paper',
                                color: 'error.main',
                            },
                        }}
                    >
                        <Iconify icon="mingcute:close-line" width={20} />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ display: 'grid', gap: 3, p: 2 }}>
                        <Autocomplete
                            fullWidth
                            options={employees}
                            getOptionLabel={(option) => `${option.employee_name} (${option.name})`}
                            value={employees.find((emp) => emp.name === employee) || null}
                            disabled={isEdit || !isHR}
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
                                    sx={{
                                        '& .MuiFormLabel-asterisk': {
                                            color: 'red',
                                        },
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            WebkitTextFillColor: 'unset',
                                            color: 'text.primary',
                                            opacity: 1,
                                            pointerEvents: 'none',
                                        },
                                        '& .MuiInputLabel-root.Mui-disabled': {
                                            color: 'text.secondary',
                                        },
                                        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(0, 0, 0, 0.23)',
                                        },
                                    }}
                                />
                            )}
                        />
                        {renderField('claim_type', 'Claim Type', 'select', claimTypes.map(type => ({ value: type.name, label: type.name })), { disabled: isApprovedOrPaid }, true)}
                        {renderField('date_of_expense', 'Date of Expense', 'date', [], { inputProps: { readOnly: isApprovedOrPaid }, disabled: isApprovedOrPaid }, true)}
                        {renderField('amount', 'Amount', 'number', [], { placeholder: 'Enter amount', inputProps: { step: '0.01', min: '0' }, disabled: isApprovedOrPaid }, true)}
                        {renderField('claim_details', 'Claim Details', 'textarea', [], { placeholder: 'Enter claim details', disabled: isApprovedOrPaid })}

                        {isEdit && user?.roles.some(r => ['System Manager', 'HR', 'HR User', 'HR Manager', 'Accounts Manager'].includes(r)) &&
                            (currentClaim?.workflow_state === 'Approved' || currentClaim?.workflow_state === 'Paid') && (
                                <>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1, gridColumn: { md: 'span 2' } }}>Settlement Details</Typography>

                                    <FormControlLabel
                                        control={<Android12Switch checked={paid} onChange={(e) => setPaid(e.target.checked)} />}
                                        label="Paid"
                                        sx={{ gridColumn: { md: 'span 2' } }}
                                    />

                                    {paid && (
                                        <>
                                            {renderField('paid_date', 'Paid Date', 'date', [], {})}

                                            {renderField('payment_reference', 'Payment Reference', 'text', [], { placeholder: 'Enter payment reference' })}

                                            {renderField('approver_comments', 'Notes', 'textarea', [], { placeholder: 'Enter notes', sx: { gridColumn: { sm: 'span 2' } } })}
                                        </>
                                    )}
                                </>
                            )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
                    <LoadingButton
                        onClick={handleCreate}
                        variant="contained"
                        loading={submitting}
                        sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' }, px: 3 }}
                    >
                        {isEdit ? 'Update' : 'Create'}
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmMarkPaidOpen}
                onClose={() => setConfirmMarkPaidOpen(false)}
                title="Mark Paid"
                icon="solar:question-circle-bold"
                iconColor="info.main"
                content={
                    <Box sx={{ pt: 1, textAlign: 'left' }}>
                        <Typography sx={{ mb: 2, textAlign: 'center' }}>
                            Do you want to mark the Status as Paid?
                        </Typography>
                    </Box>
                }
                action={
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        loading={submitting}
                        onClick={handleMarkPaidConfirm}
                    >
                        Confirm
                    </LoadingButton>
                }
            />

            {/* View Dialog */}
            <ReimbursementClaimDetailsDialog
                open={openView}
                onClose={() => setOpenView(false)}
                claim={viewClaim}
                onRefresh={refetch}
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
                employees={employees}
                isHR={isHR}
            />
        </DashboardContent>
    );
}
