import dayjs from 'dayjs';
import { MuiTelInput } from 'mui-tel-input';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useEmployees } from 'src/hooks/useEmployees';

import { fNumber, fCurrency } from 'src/utils/format-number';

import { getDoctypeList } from 'src/api/leads';
import { uploadFile } from 'src/api/data-import';
import { getStates, getCities } from 'src/api/location';
import { DashboardContent } from 'src/layouts/dashboard';
import { createEmployee, updateEmployee, deleteEmployee, getEmployee } from 'src/api/employees';
import { getHRPermissions, getDocTypeMetadata, fetchSalaryComponents, getHRSettings } from 'src/api/hr-management';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../../lead/table-no-data';
import { EmployeeTableRow } from '../employee-table-row';
import { TableEmptyRows } from '../../lead/table-empty-rows';
import { DepartmentCreateDialog } from '../department-create-dialog';
import EmployeeTableFiltersDrawer from '../employee-table-filters-drawer';

// ----------------------------------------------------------------------

const filter = createFilterOptions<any>();
import { LeadTableHead as EmployeeTableHead } from '../../lead/lead-table-head';
import { EmployeeDetailsDialog } from '../../report/employee/employee-details-dialog';
import { LeadTableToolbar as EmployeeTableToolbar } from '../../lead/lead-table-toolbar';

// ----------------------------------------------------------------------

const SalaryRow = memo(({ 
    index, 
    type, 
    row, 
    componentOptions, 
    hrSettings, 
    onRowChange, 
    onRowRemove,
    hasError
}: {
    index: number;
    type: 'Earning' | 'Deduction';
    row: any;
    componentOptions: string[];
    hrSettings: any;
    onRowChange: (index: number, type: 'Earning' | 'Deduction', field: string, value: any) => void;
    onRowRemove: (index: number, type: 'Earning' | 'Deduction') => void;
    hasError: boolean;
}) => (
    <TableRow
        sx={{
            '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) },
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.1)}`
        }}
    >
        <TableCell sx={{ py: 1 }}>
            <Autocomplete
                fullWidth
                size="small"
                options={componentOptions}
                value={row.component_name || ''}
                onChange={(e, newValue) => onRowChange(index, type, 'component_name', newValue || '')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select Component"
                        error={!row.component_name && hasError}
                        InputProps={{ 
                            ...params.InputProps, 
                            disableUnderline: true, 
                            sx: { 
                                typography: 'body2', 
                                fontWeight: 500,
                                color: !row.component_name ? 'error.main' : 'inherit'
                            } 
                        }}
                    />
                )}
            />
        </TableCell>
        <TableCell align="right" sx={{ py: 1, px: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 140 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.primary', 
                            fontWeight: 600,
                            fontFamily: "Arial, 'sans-serif'",
                            mr: 0.5
                        }}
                    >
                        {hrSettings.currency_symbol}
                    </Typography>
                    <TextField
                        size="small"
                        type="number"
                        variant="standard"
                        value={row.amount || ''}
                        placeholder="0"
                        onChange={(e) => onRowChange(index, type, 'amount', parseFloat(e.target.value) || 0)}
                        inputProps={{ sx: { textAlign: 'right', typography: 'body2', fontWeight: 600, p: 0, width: 110 } }}
                        InputProps={{ disableUnderline: true }}
                    />
                </Stack>
            </Box>
        </TableCell>
        <TableCell align="center" sx={{ py: 1 }}>
            <IconButton
                size="small"
                onClick={() => onRowRemove(index, type)}
                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
            >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
        </TableCell>
    </TableRow>
));

SalaryRow.displayName = 'SalaryRow';

// ----------------------------------------------------------------------

export function EmployeeView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('creation');
    const [selected, setSelected] = useState<string[]>([]);

    // Department Create Dialog State
    const [openDepartmentCreate, setOpenDepartmentCreate] = useState(false);
    const [departmentSearch, setDepartmentSearch] = useState('');

    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [detailsId, setDetailsId] = useState<string | null>(null);

    // Filter State
    const [filters, setFilters] = useState({
        department: 'all',
        designation: 'all',
        status: 'all',
        country: '',
        state: '',
        city: '',
    });
    const [openFilters, setOpenFilters] = useState(false);

    // Hybrid Form state
    const [fieldMap, setFieldMap] = useState<Record<string, any>>({});
    const [formData, setFormData] = useState<Record<string, any>>({
        status: 'Active',
        ctc: 0,
        skip_probation: 0,
        country: 'India',
    });
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const [stateOptions, setStateOptions] = useState<string[]>([]);
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
    const [serverAlert, setServerAlert] = useState<{ message: string, severity: 'success' | 'error' | 'warning' | 'info' }>({
        message: '',
        severity: 'info'
    });


    const [hrSettings, setHRSettings] = useState<{ default_currency: string; currency_symbol: string; default_locale: string }>({
        default_currency: 'INR',
        currency_symbol: '₹',
        default_locale: 'en-IN'
    });

    // Alert & Dialog State
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [uploading, setUploading] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Permissions State
    const [permissions, setPermissions] = useState<{ read: boolean; write: boolean; delete: boolean }>({
        read: true,
        write: true,
        delete: true,
    });

    const { data, total, loading, refetch } = useEmployees(
        page + 1,
        rowsPerPage,
        filterName,
        orderBy,
        order,
        filters.department,
        filters.designation,
        filters.status,
        filters.country,
        filters.state,
        filters.city
    );

    const notFound = !data.length && !!filterName;
    const empty = !data.length && !filterName && !loading;

    useEffect(() => {
        getHRPermissions('Employee').then(setPermissions);
        getHRSettings().then(setHRSettings);
        fetchSalaryComponents().then(setSalaryComponents);

        getDocTypeMetadata('Employee').then((meta) => {
            // Create a lookup map for fields and pre-compile visibility functions
            const map: Record<string, any> = {};
            meta.fields.forEach((f: any) => {
                const field = { ...f };
                if (field.depends_on) {
                    let expr = field.depends_on;
                    if (expr.startsWith('eval:')) expr = expr.replace('eval:', '');
                    expr = expr.replace(/doc\./g, 'formData.');

                    try {
                        field._visibility_fn = new Function('formData', `try { return ${expr}; } catch(e) { return true; }`);
                    } catch (e) {
                        console.error(`Failed to compile depends_on for ${field.fieldname}`, e);
                        field._visibility_fn = () => true;
                    }
                }
                map[f.fieldname] = field;
            });
            setFieldMap(map);

            // Fetch Link options
            meta.fields.forEach((field: any) => {
                if (field.fieldtype === 'Link' && field.options) {
                    getDoctypeList(field.options, ['name'])
                        .then((options) => {
                            setFieldOptions(prev => ({ ...prev, [field.fieldname]: options }));
                        })
                        .catch(console.error);
                }
            });

            // Fallback for designation if metadata hasn't synced yet
            if (!meta.fields.find((f: any) => f.fieldname === 'designation' && f.fieldtype === 'Link')) {
                getDoctypeList('Designation', ['name'])
                    .then((options) => {
                        setFieldOptions(prev => ({ ...prev, 'designation': options }));
                    })
                    .catch(console.error);
            }
        }).catch(console.error);
    }, []);

    // Memoized component lists to avoid filtering during render
    const earningComponents = useMemo(() => 
        salaryComponents.filter(c => c.type === 'Earning').map(c => c.component_name),
    [salaryComponents]);

    const deductionComponents = useMemo(() => 
        salaryComponents.filter(c => c.type === 'Deduction').map(c => c.component_name),
    [salaryComponents]);

    // Memoized totals calculation
    const totals = useMemo(() => {
        const earnings = formData.earnings || [];
        const deductions = formData.deductions || [];

        const total_earnings = earnings.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
        const total_deductions = deductions.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0);
        
        return {
            total_earnings,
            total_deductions,
            net_salary: total_earnings - total_deductions
        };
    }, [formData.earnings, formData.deductions]);


    // Integrated into handleInputChange for performance and consistency

    const cleanPhoneNumber = (val: string) => {
        if (!val) return '';
        if (val.startsWith('+') && val.includes('-')) {
            return val.replace('-', ' ');
        }
        return val;
    };

    const formatPhoneNumberCustom = (val: string) => {
        if (!val) return '';
        let formatted = val.replace(/\s/g, '');
        const parts = val.trim().split(/\s+/);
        if (parts.length > 1 && parts[0].startsWith('+')) {
            formatted = `${parts[0]}-${parts.slice(1).join('')}`;
        }
        return formatted;
    };

    const handleInputChange = async (fieldname: string, value: any) => {
        let finalValue = value;
        if (fieldname === 'phone' || fieldname === 'office_phone_number') {
            finalValue = formatPhoneNumberCustom(value);
        }

        setFormData(prev => {
            const next = { ...prev, [fieldname]: finalValue };
            return next;
        });

        // Clear error when typing
        if (formErrors[fieldname]) {
            setFormErrors(prev => ({ ...prev, [fieldname]: '' }));
        }

        // Handle country change - fetch states
        if (fieldname === 'country' && finalValue) {
            const states = await getStates(finalValue);
            setStateOptions(['', ...states, 'Others']);
            // Reset state and city when country changes
            setFormData(prev => ({ ...prev, state: '', city: '' }));
            setCityOptions([]);
        }

        // Handle state change - fetch cities
        if (fieldname === 'state' && finalValue && formData.country) {
            if (finalValue === 'Others') {
                setCityOptions(['Others']);
            } else {
                const cities = await getCities(formData.country, finalValue);
                setCityOptions(['', ...cities, 'Others']);
            }
            // Reset city when state changes
            setFormData(prev => ({ ...prev, city: '' }));
        }
    };

    const handleCTCOnBlur = async () => {
        const ctcValue = parseFloat(formData.ctc) || 0;
        if (ctcValue <= 0) return;

        try {
            const components = salaryComponents; // Use pre-fetched components

            const earnings: any[] = [];
            const deductions: any[] = [];

            components.forEach((comp: any) => {
                let val = 0;
                const percent = parseFloat(comp.percentage) || 0;
                if (percent > 0) {
                    val = (ctcValue * percent) / 100;
                } else {
                    val = parseFloat(comp.static_amount) || 0;
                }

                const row = {
                    component_name: comp.component_name,
                    amount: val,
                    type: comp.type
                };

                if (comp.type === 'Earning') {
                    earnings.push(row);
                } else {
                    deductions.push(row);
                }
            });

            setFormData(prev => ({
                ...prev,
                earnings,
                deductions,
                total_earnings: earnings.reduce((sum, item) => sum + item.amount, 0),
                total_deductions: deductions.reduce((sum, item) => sum + item.amount, 0),
                net_salary: earnings.reduce((sum, item) => sum + item.amount, 0) - deductions.reduce((sum, item) => sum + item.amount, 0)
            }));
        } catch (error) {
            console.error('Failed to fetch salary components on blur:', error);
        }
    };

    const handleAddSalaryRow = (type: 'Earning' | 'Deduction') => {
        const field = type === 'Earning' ? 'earnings' : 'deductions';
        const newRow = { component_name: '', amount: 0, type };

        setFormData(prev => {
            const currentRows = prev[field] || [];
            return {
                ...prev,
                [field]: [...currentRows, newRow]
            };
        });
    };

    const handleRemoveSalaryRow = (index: number, type: 'Earning' | 'Deduction') => {
        const field = type === 'Earning' ? 'earnings' : 'deductions';
        setFormData(prev => {
            const currentRows = [...(prev[field] || [])];
            currentRows.splice(index, 1);
            return {
                ...prev,
                [field]: currentRows
            };
        });
    };

    const handleSalaryRowChange = useCallback((index: number, type: 'Earning' | 'Deduction', field: string, value: any) => {
        const dataField = type === 'Earning' ? 'earnings' : 'deductions';
        setFormData(prev => {
            const currentRows = [...(prev[dataField] || [])];
            currentRows[index] = { ...currentRows[index], [field]: value };
            return {
                ...prev,
                [dataField]: currentRows
            };
        });

        // Clear component error when typing
        if (formErrors.salary_components) {
            setFormErrors(prev => ({ ...prev, salary_components: '' }));
        }
    }, [formErrors.salary_components]);


    const handleDefaultSplitting = async () => {
        const ctcValue = parseFloat(formData.ctc) || 0;
        if (ctcValue <= 0) {
            setSnackbar({ open: true, message: 'Please enter a valid CTC amount first', severity: 'warning' });
            return;
        }

        try {
            const defaults = salaryComponents.filter(comp => comp.is_default);

            if (defaults.length === 0) {
                setSnackbar({ open: true, message: 'No default salary components found. Please configure them in Masters.', severity: 'warning' });
                return;
            }

            const totalEarningPercent = defaults
                .filter(comp => comp.type === 'Earning')
                .reduce((sum, comp) => sum + (parseFloat(comp.percentage) || 0), 0);

            if (totalEarningPercent !== 100) {
                setSnackbar({ 
                    open: true, 
                    message: `Invalid configuration: Total Default Earning percentage must be exactly 100%. (Current total: ${totalEarningPercent.toFixed(2)}%)`, 
                    severity: 'error' 
                });
                return;
            }

            const earnings: any[] = [];
            const deductions: any[] = [];

            defaults.forEach((comp: any) => {
                let val = 0;
                const percent = parseFloat(comp.percentage) || 0;
                if (percent > 0) {
                    val = (ctcValue * percent) / 100;
                } else {
                    val = parseFloat(comp.static_amount) || 0;
                }

                const row = {
                    component_name: comp.component_name,
                    amount: val,
                    type: comp.type
                };

                if (comp.type === 'Earning') {
                    earnings.push(row);
                } else {
                    deductions.push(row);
                }
            });

            setFormData(prev => ({
                ...prev,
                earnings,
                deductions
            }));

            setSnackbar({ open: true, message: 'Default splitting applied successfully', severity: 'success' });
        } catch (error) {
            console.error('Failed to apply default splitting:', error);
            setSnackbar({ open: true, message: 'Failed to apply splitting', severity: 'error' });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldname: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const uploaded = await uploadFile(file, 'Employee', currentEmployeeId || 'new', fieldname);
            handleInputChange(fieldname, uploaded.file_url);
            setSnackbar({ open: true, message: 'Image uploaded successfully', severity: 'success' });
            if (formErrors[fieldname]) {
                setFormErrors(prev => ({ ...prev, [fieldname]: '' }));
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            setSnackbar({ open: true, message: error.message || 'Upload failed', severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleOpenCreate = async () => {
        setFormData({ status: 'Active', ctc: 0, skip_probation: 0, country: 'India' });
        setFormErrors({});
        setOpenCreate(true);

        // Load states for India by default
        const states = await getStates('India');
        setStateOptions(['', ...states, 'Others']);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setFormErrors({});
        setCurrentEmployeeId(null);
        setFormData({ status: 'Active', ctc: 0, skip_probation: 0, country: 'India' });
        setServerAlert({ message: '', severity: 'info' });
        setStateOptions([]);
        setCityOptions([]);
    };


    const handleOpenDetails = (id: string) => {
        setDetailsId(id);
        setOpenDetails(true);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setDetailsId(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleDeleteClick = (id: string) => {
        setConfirmDelete({ open: true, id });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteEmployee(confirmDelete.id);
            setSnackbar({ open: true, message: 'Employee deleted successfully', severity: 'success' });
            await refetch();
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: 'Failed to delete employee', severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: null });
        }
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

    const handleFilters = (update: any) => {
        setFilters((prev) => ({ ...prev, ...update }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            department: 'all',
            designation: 'all',
            status: 'all',
            country: '',
            state: '',
            city: '',
        });
    };

    const canReset = filters.department !== 'all' || filters.designation !== 'all' || filters.status !== 'all' || filters.country !== '' || filters.state !== '' || filters.city !== '';

    const handleBulkDelete = async () => {
        try {
            await Promise.all(selected.map((id) => deleteEmployee(id)));
            setSnackbar({ open: true, message: `${selected.length} employees deleted successfully`, severity: 'success' });
            setSelected([]);
            await refetch();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.message || 'Error during bulk delete', severity: 'error' });
        }
    };

    const validateForm = (): { isValid: boolean; firstErrorField?: string; firstErrorMessage?: string } => {
        const errors: Record<string, string> = {};
        const requiredFields = [
            // { name: 'employee_id', label: 'Employee ID' },
            { name: 'employee_name', label: 'Employee Name' },
            { name: 'email', label: 'Email' },
            { name: 'date_of_joining', label: 'Joining Date' },
            { name: 'user', label: 'User Login (Email)' },
            { name: 'status', label: 'Status' }
        ];

        requiredFields.forEach(field => {
            const value = formData[field.name];
            if (!value) {
                errors[field.name] = `${field.label} is required`;
            }
        });

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (formData.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal_email)) {
            errors.personal_email = 'Invalid email format';
        }

        // Salary Table Validation
        const incompleteEarnings = (formData.earnings || []).some((row: any) => !row.component_name);
        const incompleteDeductions = (formData.deductions || []).some((row: any) => !row.component_name);

        if (incompleteEarnings || incompleteDeductions) {
            errors.salary_components = 'Please select a Component Name for all salary rows';
        }

        setFormErrors(errors);

        const isValid = Object.keys(errors).length === 0;
        const firstErrorField = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorField];

        return { isValid, firstErrorField, firstErrorMessage };
    };

    const handleCreate = async () => {
        const validationResult = validateForm();
        if (!validationResult.isValid) {
            // Scroll to the first error field
            if (validationResult.firstErrorField) {
                const errorElement = document.querySelector(`[name="${validationResult.firstErrorField}"]`);
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Focus the field after scrolling
                    setTimeout(() => {
                        (errorElement as HTMLElement).focus();
                    }, 500);
                }
            }

            // Show specific error message
            const errorMessage = validationResult.firstErrorMessage || 'Please correct the errors in the form';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
            return;
        }

        try {
            setCreating(true);
            setServerAlert({ message: '', severity: 'info' });

            const dataToSave: any = { ...formData, ...totals };
            if (dataToSave.employee_name) dataToSave.employee_name = dataToSave.employee_name.trim();
            if (dataToSave.employee_id) dataToSave.employee_id = dataToSave.employee_id.trim();
            if (dataToSave.email) dataToSave.email = dataToSave.email.trim();

            if (currentEmployeeId) {
                await updateEmployee(currentEmployeeId, dataToSave as any);
                setServerAlert({ message: 'Employee updated successfully', severity: 'success' });
            } else {
                await createEmployee(dataToSave as any);
                setServerAlert({ message: 'Employee created successfully', severity: 'success' });
            }
            await refetch();

            // Keep the alert visible for a moment before closing, or just close if user prefers
            setTimeout(() => {
                handleCloseCreate();
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setServerAlert({ message: err.message || 'Error saving employee', severity: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleEditRow = async (id: string) => {
        try {
            setCurrentEmployeeId(id);
            const fullDoc = await getEmployee(id);
            if (fullDoc) {
                const cleanedRow = { ...fullDoc };
                if (cleanedRow.phone) cleanedRow.phone = cleanPhoneNumber(cleanedRow.phone);
                if (cleanedRow.office_phone_number) cleanedRow.office_phone_number = cleanPhoneNumber(cleanedRow.office_phone_number);
                setFormData(cleanedRow);

                // Fetch states if country exists
                if (cleanedRow.country) {
                    const states = await getStates(cleanedRow.country);
                    setStateOptions(['', ...states, 'Others']);
                    if (cleanedRow.state) {
                        const cities = await getCities(cleanedRow.country, cleanedRow.state);
                        setCityOptions(['', ...cities, 'Others']);
                    }
                }
            }
            setOpenCreate(true);
        } catch (error) {
            console.error('Failed to load employee details:', error);
            setSnackbar({ open: true, message: 'Failed to load employee details', severity: 'error' });
        }
    };




    const onChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const onChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const evaluateVisibility = (fieldname: string) => {
        const field = fieldMap[fieldname];
        if (!field) return true;
        if (field.hidden) return false;
        if (!field._visibility_fn) return true;

        return field._visibility_fn(formData);
    };

    const renderField = (fieldname: string, label: string, type: string = 'text', options: any[] = [], extraProps: any = {}, required: boolean = false) => {
        if (!evaluateVisibility(fieldname)) return null;

        const commonProps = {
            fullWidth: true,
            label,
            name: fieldname, // Add name attribute for scroll-to-error functionality
            value: formData[fieldname] || '',
            onChange: (e: any) => handleInputChange(fieldname, e.target.value),
            InputLabelProps: { shrink: true },
            required,
            error: !!formErrors[fieldname],
            helperText: formErrors[fieldname],
            ...extraProps,
            InputProps: {
                ...extraProps.InputProps,
            },
            sx: {
                '& .MuiFormLabel-asterisk': {
                    color: 'red',
                },
                ...extraProps.sx
            }
        };

        if (type === 'phone') {
            return (
                <MuiTelInput
                    {...commonProps}
                    defaultCountry="IN"
                    value={cleanPhoneNumber(formData[fieldname] || '')}
                    onChange={(newValue: string) => handleInputChange(fieldname, newValue)}
                />
            );
        }



        if (type === 'autocomplete') {
            // Determine if field should be disabled based on dependencies
            let disabled = false;
            let placeholder = `Select ${label}`;

            if (fieldname === 'state' && !formData.country) {
                disabled = true;
                placeholder = 'Please select Country first';
            } else if (fieldname === 'city' && !formData.state) {
                disabled = true;
                placeholder = 'Please select State first';
            }

            return (
                <Autocomplete
                    fullWidth
                    options={options}
                    value={formData[fieldname] || ''}
                    onChange={(event, newValue) => {
                        // Handle both string values and objects with name property
                        const value = typeof newValue === 'object' && newValue?.name ? newValue.name : newValue;
                        handleInputChange(fieldname, value || '');
                    }}
                    getOptionLabel={(option) => {
                        // Handle both string options and objects with name property
                        if (typeof option === 'string') return option;
                        if (option?.name) return option.name;
                        return '';
                    }}
                    isOptionEqualToValue={(option, value) => {
                        // Handle comparison for both strings and objects
                        const optionValue = typeof option === 'string' ? option : option?.name;
                        return optionValue === value;
                    }}
                    disabled={disabled}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            placeholder={placeholder}
                            required={required}
                            error={!!formErrors[fieldname]}
                            helperText={formErrors[fieldname]}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiFormLabel-asterisk': {
                                    color: 'red',
                                },
                                ...extraProps.sx
                            }}
                        />
                    )}
                    freeSolo
                />
            );
        }

        if (fieldname === 'department') {
            return (
                <Autocomplete
                    fullWidth
                    options={options}
                    value={formData[fieldname] || ''}
                    onChange={(event, newValue: any) => {
                        if (newValue?.isNew || newValue === 'Create Department' || newValue?.name === 'Create Department') {
                            setOpenDepartmentCreate(true);
                            setDepartmentSearch(newValue?.inputValue || '');
                        } else {
                            const value = typeof newValue === 'object' && newValue?.name ? newValue.name : newValue;
                            handleInputChange(fieldname, value || '');
                        }
                    }}
                    filterOptions={(currentOptions, params) => {
                        const filtered = filter(currentOptions, params);
                        const { inputValue } = params;
                        const hasCreateOption = filtered.some((option: any) =>
                            (typeof option === 'string' ? option : option.name) === 'Create Department' || option.isNew
                        );
                        if (!hasCreateOption) {
                            filtered.push({
                                inputValue: inputValue || '',
                                name: 'Create Department',
                                isNew: true,
                            });
                        }
                        return filtered;
                    }}
                    renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{
                            typography: 'body2',
                            ...(option.isNew && {
                                color: 'primary.main',
                                fontWeight: 600,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                                mt: 0.5,
                                py: 3, minHeight: '56px',
                                '&:hover': {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                                }
                            })
                        }}>
                            {option.isNew ? (
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Iconify icon={"solar:add-circle-bold" as any} width={24} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Create Department</Typography>
                                </Stack>
                            ) : (
                                typeof option === 'string' ? option : option.name
                            )}
                        </Box>
                    )}
                    getOptionLabel={(option) => {
                        // Handle both string options and objects with name property
                        if (typeof option === 'string') return option;
                        if (option?.name) return option.name;
                        return '';
                    }}
                    isOptionEqualToValue={(option, value) => {
                        // Handle comparison for both strings and objects
                        const optionValue = typeof option === 'string' ? option : option?.name;
                        return optionValue === value;
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            placeholder={`Select ${label}`}
                            required={required}
                            error={!!formErrors[fieldname]}
                            helperText={formErrors[fieldname]}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiFormLabel-asterisk': {
                                    color: 'red',
                                },
                                ...extraProps.sx
                            }}
                        />
                    )}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                />
            );
        }

        if (type === 'select' || type === 'link') {
            return (
                <TextField {...commonProps} select SelectProps={{ native: true }}>
                    <option value="">Select {label}</option>
                    {options.map((opt: any) => (
                        <option key={opt.name || opt} value={opt.name || opt}>{opt.name || opt}</option>
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
                            error: !!formErrors[fieldname],
                            helperText: formErrors[fieldname],
                            InputLabelProps: { shrink: true },
                            sx: commonProps.sx
                        }
                    }}
                />
            );
        }
        if (type === 'number') return <TextField {...commonProps} type="number" />;

        if (type === 'file') {
            return (
                <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        {label} {required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        {formData[fieldname] && (
                            <Box
                                component="img"
                                src={formData[fieldname]}
                                sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
                            />
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={uploading ? <CircularProgress size={20} /> : <Iconify icon={"solar:upload-minimalistic-bold" as any} />}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : (formData[fieldname] ? 'Change Image' : 'Upload Image')}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, fieldname)} />
                        </Button>
                    </Stack>
                </Box>
            );
        }

        if (type === 'checkbox') {
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!!formData[fieldname]}
                            onChange={(e) => handleInputChange(fieldname, e.target.checked ? 1 : 0)}
                        />
                    }
                    label={label}
                />
            );
        }

        return <TextField {...commonProps} />;
    };

    const renderSalaryTable = (type: 'Earning' | 'Deduction') => {
        const rows = type === 'Earning' ? (formData.earnings || []) : (formData.deductions || []);

        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    color: type === 'Earning' ? 'success.main' : 'error.main',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                }}>
                    {type === 'Earning' ? 'Earnings' : 'Deductions'}
                </Typography>
                <TableContainer sx={{
                    border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                    borderRadius: 1.25,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => theme.customShadows.z1
                }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ py: 1.5, bgcolor: '#08a3cd', color: 'common.white', fontWeight: 700, width: '60%' }}>
                                    Component Name *
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5, bgcolor: '#08a3cd', color: 'common.white', fontWeight: 700, width: '35%' }}>
                                    Amount
                                </TableCell>
                                <TableCell width={48} sx={{ py: 1.5, bgcolor: '#08a3cd' }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row: any, index: number) => (
                                <SalaryRow
                                    key={index}
                                    index={index}
                                    type={type}
                                    row={row}
                                    componentOptions={type === 'Earning' ? earningComponents : deductionComponents}
                                    hrSettings={hrSettings}
                                    onRowChange={handleSalaryRowChange}
                                    onRowRemove={handleRemoveSalaryRow}
                                    hasError={formData.earnings?.length > 0 || formData.deductions?.length > 0}
                                />
                            ))}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3, typography: 'body2', color: 'text.disabled' }}>
                                        No data available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        size="small"
                        color="info"
                        variant="text"
                        startIcon={<Iconify icon="solar:add-circle-bold" />}
                        onClick={() => handleAddSalaryRow(type)}
                        sx={{ fontWeight: 700 }}
                    >
                        Add Row
                    </Button>
                </Box>
            </Box>
        );
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name_asc', label: 'Name: A to Z' },
        { value: 'name_desc', label: 'Name: Z to A' },
    ];

    const getSortByValue = () => {
        if (orderBy === 'creation') {
            return order === 'desc' ? 'newest' : 'oldest';
        }
        if (orderBy === 'employee_name') {
            return order === 'asc' ? 'name_asc' : 'name_desc';
        }
        return 'name_asc';
    };

    const handleSortChange = (value: string) => {
        if (value === 'newest') {
            setOrderBy('creation');
            setOrder('desc');
        } else if (value === 'oldest') {
            setOrderBy('creation');
            setOrder('asc');
        } else if (value === 'name_asc') {
            setOrderBy('employee_name');
            setOrder('asc');
        } else if (value === 'name_desc') {
            setOrderBy('employee_name');
            setOrder('desc');
        }
    };

    return (
        <DashboardContent maxWidth={false} sx={{mt: 2}}>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Employees
                </Typography>

                {permissions.write && (
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        New Employee
                    </Button>
                )}
            </Box>

            <Card>
                <EmployeeTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(e.target.value);
                        setPage(0);
                    }}
                    onDelete={handleBulkDelete}
                    searchPlaceholder="Search employees..."
                    sortOptions={sortOptions}
                    sortBy={getSortByValue()}
                    onSortChange={handleSortChange}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                />



                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800, borderCollapse: 'collapse' }}>
                            <EmployeeTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={total}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Name', minWidth: 180 },
                                    // { id: 'employee_id', label: 'ID', minWidth: 80 },
                                    { id: 'department', label: 'Department', minWidth: 120 },
                                    { id: 'designation', label: 'Designation', minWidth: 120 },
                                    { id: 'status', label: 'Status', minWidth: 100 },
                                    { id: '', label: 'Actions', align: 'right' },
                                ]}
                            />

                            <TableBody>
                                {data.map((row, index) => (
                                    <EmployeeTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employeeId: row.employee_id,
                                            name: row.employee_name,
                                            department: row.department,
                                            designation: row.designation,
                                            status: row.status,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleOpenDetails(row.name)}
                                        onEdit={() => handleEditRow(row.name)}
                                        onDelete={() => handleDeleteClick(row.name)}
                                        canEdit={permissions.write}
                                        canDelete={permissions.delete}
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyContent
                                                title="No employees found"
                                                description="Click 'New Employee' to add your first team member."
                                                icon="solar:users-group-rounded-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!empty && (
                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={data.length < 5 ? 5 - data.length : 0}
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
                    onPageChange={onChangePage}
                    rowsPerPageOptions={[10, 25, 50]}
                    onRowsPerPageChange={onChangeRowsPerPage}
                />
            </Card>

            {/* CREATE/EDIT DIALOG */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="lg">
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {currentEmployeeId ? 'Edit Employee' : 'New Employee'}
                    <IconButton onClick={handleCloseCreate} sx={{ color: (theme) => theme.palette.grey[500] }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ p: 2 }}>
                            {/* Section 1: Personal Information */}
                            {useMemo(() => (
                                <>
                                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>Personal Information</Typography>
                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                        {renderField('employee_id', 'Employee ID', 'text', [], {}, false)}
                                        {renderField('employee_name', 'Employee Name', 'text', [], {}, true)}
                                        {renderField('email', 'Email', 'text', [], {}, true)}
                                        {renderField('personal_email', 'Personal Email')}
                                        {renderField('phone', 'Personal Phone Number', 'phone')}
                                        {renderField('office_phone_number', 'Office Phone', 'phone')}
                                        {renderField('dob', 'Date of Birth', 'date')}
                                        {renderField('country', 'Country', 'autocomplete', fieldOptions['country'] || [])}
                                        {renderField('state', 'State', 'autocomplete', stateOptions)}
                                        {renderField('city', 'City', 'autocomplete', cityOptions)}
                                        {renderField('profile_picture', 'Profile Picture', 'file')}
                                    </Box>
                                </>
                            ), [
                                formData.employee_id, formData.employee_name, formData.email, formData.personal_email, 
                                formData.phone, formData.office_phone_number, formData.dob, formData.country, 
                                formData.state, formData.city, formData.profile_picture,
                                formErrors, fieldOptions, stateOptions, cityOptions, uploading
                            ])}

                            {/* Section 2: Employment Details */}
                            {useMemo(() => (
                                <>
                                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>Employment Details</Typography>
                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                        {renderField('department', 'Department', 'link', fieldOptions['department'] || [])}
                                        {renderField('designation', 'Designation', 'text')}
                                        {renderField('date_of_joining', 'Joining Date', 'date', [], {}, true)}
                                        {renderField('user', 'User Login (Email)', 'autocomplete', fieldOptions['user'] || [], {}, true)}
                                        {renderField('status', 'Status', 'select', ['Active', 'Inactive'], {}, true)}
                                        {renderField('skip_probation', 'Skip Probation', 'checkbox')}
                                    </Box>
                                </>
                            ), [
                                formData.department, formData.designation, formData.date_of_joining, 
                                formData.user, formData.status, formData.skip_probation,
                                formErrors, fieldOptions
                            ])}

                            {/* Section 3: Financial & Bank Details */}
                            {useMemo(() => (
                                <>
                                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>Financial & Bank Details</Typography>
                                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                        {renderField('bank_name', 'Bank Name')}
                                        {renderField('bank_account', 'Bank Account', 'autocomplete', fieldOptions['bank_account'] || [])}
                                        {renderField('pf_number', 'PF Number')}
                                        {renderField('esi_no', 'ESI No')}
                                    </Box>
                                </>
                            ), [
                                formData.bank_name, formData.bank_account, formData.pf_number, formData.esi_no,
                                formErrors, fieldOptions
                            ])}


                            {/* Section 4: Salary & breakdown */}
                            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>Salary Details</Typography>

                            {/* CTC Field - Full Width */}
                            <Box sx={{ mb: 3 }}>
                                {renderField('ctc', 'CTC (Monthly)', 'number', [], { 
                                    onBlur: handleCTCOnBlur,
                                    InputProps: {
                                        endAdornment: (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={handleDefaultSplitting}
                                                sx={{ 
                                                    whiteSpace: 'nowrap',
                                                    mx: 1,
                                                    py: 1.5,
                                                    px: 3,
                                                    height: 32,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 1),
                                                    color: 'common.white',
                                                    boxShadow: (theme) => theme.customShadows.z8,
                                                    '&:hover': { 
                                                        bgcolor: (theme) => theme.palette.primary.dark,
                                                        boxShadow: (theme) => theme.customShadows.z16,
                                                    }
                                                }}
                                                startIcon={<Iconify icon={"solar:magic-stick-bold" as any} width={16} />}
                                            >
                                                Default Splitting
                                            </Button>
                                        )
                                    }
                                }, false)}
                            </Box>

                            {/* Two Column Layout: Earnings and Deductions */}
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                                {/* Left Column - Earnings */}
                                <Box>
                                    {renderSalaryTable('Earning')}
                                </Box>

                                {/* Right Column - Deductions */}
                                <Box>
                                    {renderSalaryTable('Deduction')}
                                </Box>
                            </Box>

                            {/* Net Salary Summary */}
                            <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.3)}` }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Net Salary (Monthly)</Typography>
                                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                                            <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 1, fontSize: '0.8em' }}>{hrSettings.currency_symbol}</Box>
                                            {fNumber(totals.net_salary || 0, { locale: hrSettings.default_locale })}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={4}>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Earnings</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                                + <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5 }}>{hrSettings.currency_symbol}</Box>
                                                {fNumber(totals.total_earnings || 0, { locale: hrSettings.default_locale })}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Deductions</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center' }}>
                                                - <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5 }}>{hrSettings.currency_symbol}</Box>
                                                {fNumber(totals.total_deductions || 0, { locale: hrSettings.default_locale })}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </DialogContent>


                <DialogActions>
                    <Button variant="contained" onClick={handleCreate} disabled={creating} sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                        {creating ? 'Saving...' : (currentEmployeeId ? 'Update Employee' : 'Create Employee')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this employee?"
                action={
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
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

            <EmployeeDetailsDialog
                open={openDetails}
                onClose={handleCloseDetails}
                employeeId={detailsId}
            />

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

            <EmployeeTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                departmentOptions={fieldOptions['department'] || []}
                designationOptions={fieldOptions['designation'] || []}
            />

            <DepartmentCreateDialog
                open={openDepartmentCreate}
                onClose={() => setOpenDepartmentCreate(false)}
                onCreate={(newDepartment) => {
                    // Optimistically add to options and set value
                    setFieldOptions(prev => ({
                        ...prev,
                        department: [...(prev['department'] || []), { name: newDepartment }]
                    }));
                    // Update form data
                    handleInputChange('department', newDepartment);

                    setSnackbar({ open: true, message: 'Department created successfully', severity: 'success' });
                }}
            />
        </DashboardContent>
    );
}
