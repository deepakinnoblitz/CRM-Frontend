import dayjs from 'dayjs';
import { MuiTelInput } from 'mui-tel-input';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useEmployees } from 'src/hooks/useEmployees';

import { getDoctypeList } from 'src/api/leads';
import { uploadFile } from 'src/api/data-import';
import { DashboardContent } from 'src/layouts/dashboard';
import { createEmployee, updateEmployee, deleteEmployee } from 'src/api/employees';
import { getHRPermissions, getDocTypeMetadata, fetchSalaryComponents } from 'src/api/hr-management';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../../user/table-no-data';
import { EmployeeTableRow } from '../employee-table-row';
import { TableEmptyRows } from '../../user/table-empty-rows';
import EmployeeTableFiltersDrawer from '../employee-table-filters-drawer';
import { UserTableHead as EmployeeTableHead } from '../../user/user-table-head';
import { EmployeeDetailsDialog } from '../../report/employee/employee-details-dialog';
import { UserTableToolbar as EmployeeTableToolbar } from '../../user/user-table-toolbar';

// ----------------------------------------------------------------------

export function EmployeeView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState('employee_name');
    const [selected, setSelected] = useState<string[]>([]);

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
    });
    const [openFilters, setOpenFilters] = useState(false);

    // Hybrid Form state
    const [fieldMap, setFieldMap] = useState<Record<string, any>>({});
    const [formData, setFormData] = useState<Record<string, any>>({
        status: 'Active',
        ctc: 0,
        skip_probation: 0,
    });
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
    const [serverAlert, setServerAlert] = useState<{ message: string, severity: 'success' | 'error' | 'warning' | 'info' }>({
        message: '',
        severity: 'info'
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
        filters.status
    );

    const notFound = !data.length && !!filterName;
    const empty = !data.length && !filterName && !loading;

    useEffect(() => {
        getHRPermissions('Employee').then(setPermissions);

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

    const handleInputChange = (fieldname: string, value: any) => {
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
    };

    const handleCTCOnBlur = async () => {
        const ctcValue = parseFloat(formData.ctc) || 0;
        if (ctcValue <= 0) return;

        try {
            const components = await fetchSalaryComponents();
            setSalaryComponents(components);

            setFormData(prev => {
                const next = { ...prev };
                components.forEach((comp: any) => {
                    const field = comp.field_name;
                    if (!field) return;

                    let val = 0;
                    const percent = parseFloat(comp.percentage) || 0;
                    if (percent > 0) {
                        val = (ctcValue * percent) / 100;
                    } else {
                        val = parseFloat(comp.static_amount) || 0;
                    }
                    next[field] = val;
                });
                return next;
            });
        } catch (error) {
            console.error('Failed to fetch salary components on blur:', error);
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

    const handleOpenCreate = () => {
        setFormData({ status: 'Active', ctc: 0, skip_probation: 0 });
        setFormErrors({});
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setFormErrors({});
        setCurrentEmployeeId(null);
        setFormData({ status: 'Active', ctc: 0, skip_probation: 0 });
        setServerAlert({ message: '', severity: 'info' });
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
        });
    };

    const canReset = filters.department !== 'all' || filters.designation !== 'all' || filters.status !== 'all';

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

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const requiredFields = [
            { name: 'employee_id', label: 'Employee ID' },
            { name: 'employee_name', label: 'Employee Name' },
            { name: 'email', label: 'Email' },
            { name: 'date_of_joining', label: 'Joining Date' },
            { name: 'status', label: 'Status' },
            { name: 'ctc', label: 'CTC (Monthly)' }
        ];

        requiredFields.forEach(field => {
            const value = formData[field.name];
            if (!value || (field.name === 'ctc' && (parseFloat(value) <= 0 || isNaN(parseFloat(value))))) {
                if (field.name === 'ctc' && value && parseFloat(value) <= 0) {
                    errors[field.name] = 'CTC must be greater than 0';
                } else {
                    errors[field.name] = `${field.label} is required`;
                }
            }
        });

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (formData.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal_email)) {
            errors.personal_email = 'Invalid email format';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: 'Please correct the errors in the form', severity: 'error' });
            return;
        }

        try {
            setCreating(true);
            setServerAlert({ message: '', severity: 'info' });

            const dataToSave = { ...formData };
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

    const handleEditRow = (id: string) => {
        setCurrentEmployeeId(id);
        const fullRow = data.find((item: any) => item.name === id);
        if (fullRow) {
            const cleanedRow = { ...fullRow };
            if (cleanedRow.phone) cleanedRow.phone = cleanPhoneNumber(cleanedRow.phone);
            if (cleanedRow.office_phone_number) cleanedRow.office_phone_number = cleanPhoneNumber(cleanedRow.office_phone_number);
            setFormData(cleanedRow);
        }
        setOpenCreate(true);
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
            value: formData[fieldname] || '',
            onChange: (e: any) => handleInputChange(fieldname, e.target.value),
            InputLabelProps: { shrink: true },
            required,
            error: !!formErrors[fieldname],
            helperText: formErrors[fieldname],
            ...extraProps,
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
        <DashboardContent>
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
                    onFilterName={(e) => {
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
                        <Table sx={{ minWidth: 800 }}>
                            <EmployeeTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={total}
                                numSelected={selected.length}
                                onSelectAllRows={(checked) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Name', minWidth: 180 },
                                    { id: 'employee_id', label: 'ID', minWidth: 80 },
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
                    onPageChange={onChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={onChangeRowsPerPage}
                />
            </Card>

            {/* CREATE/EDIT DIALOG */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="md">
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
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Personal Information</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                {renderField('employee_id', 'Employee ID', 'text', [], {}, true)}
                                {renderField('employee_name', 'Employee Name', 'text', [], {}, true)}
                                {renderField('email', 'Email', 'text', [], {}, true)}
                                {renderField('personal_email', 'Personal Email')}
                                {renderField('phone', 'Personal Phone Number', 'phone')}
                                {renderField('office_phone_number', 'Office Phone', 'phone')}
                                {renderField('dob', 'Date of Birth', 'date')}
                                {renderField('country', 'Country', 'link', fieldOptions['country'] || [])}
                                {renderField('profile_picture', 'Profile Picture', 'file')}
                            </Box>

                            {/* Section 2: Employment Details */}
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Employment Details</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                {renderField('department', 'Department', 'link', fieldOptions['department'] || [])}
                                {renderField('designation', 'Designation', 'link', fieldOptions['designation'] || [])}
                                {renderField('date_of_joining', 'Joining Date', 'date', [], {}, true)}
                                {renderField('user', 'User Login (Email)', 'link', fieldOptions['user'] || [])}
                                {renderField('status', 'Status', 'select', ['Active', 'Inactive'], {}, true)}
                                {renderField('skip_probation', 'Skip Probation', 'checkbox')}
                            </Box>

                            {/* Section 3: Financial & Bank Details */}
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Financial & Bank Details</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3} sx={{ mb: 4 }}>
                                {renderField('bank_name', 'Bank Name')}
                                {renderField('bank_account', 'Bank Account')}
                                {renderField('pf_number', 'PF Number')}
                                {renderField('esi_no', 'ESI No')}
                            </Box>


                            {/* Section 4: Salary & breakdown */}
                            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>Salary Details (Auto-calculated)</Typography>
                            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                                {renderField('ctc', 'CTC (Monthly)', 'number', [], { onBlur: handleCTCOnBlur }, true)}
                                {renderField('basic_pay', 'Basic Pay', 'number')}
                                {renderField('hra', 'HRA', 'number')}
                                {renderField('conveyance_allowances', 'Conveyance Allowances', 'number')}
                                {renderField('medical_allowances', 'Medical Allowances', 'number')}
                                {renderField('other_allowances', 'Other Allowances', 'number')}
                                {renderField('pf', 'PF Deduction', 'number')}
                                {renderField('health_insurance', 'ESI/Health Insurance', 'number')}
                                {renderField('professional_tax', 'Professional Tax', 'number')}
                                {renderField('loan_recovery', 'Loan Recovery', 'number')}
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
        </DashboardContent>
    );
}
