import dayjs from 'dayjs';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useAssetAssignments } from 'src/hooks/useAssetAssignments';

import { frappeRequest } from 'src/utils/csrf';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    getEmployees,
    getAvailableAssets,
    deleteAssetAssignment,
    createAssetAssignment,
    updateAssetAssignment,
    getAssetAssignmentPermissions,
} from 'src/api/asset-assignments';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { LeadTableHead as AssetAssignmentTableHead } from 'src/sections/lead/lead-table-head';
import { AssetAssignmentTableRow } from 'src/sections/asset-assignments/asset-assignments-table-row';
import { LeadTableToolbar as AssetAssignmentTableToolbar } from 'src/sections/lead/lead-table-toolbar';
// import { AssetAssignmentTableRow } from 'src/sections/asset-assignments/asset-assignments-table-row';
import { AssetAssignmentImportDialog } from 'src/sections/asset-assignments/asset-assignment-import-dialog';
import { AssetAssignmentsTableFiltersDrawer } from 'src/sections/asset-assignments/asset-assignments-table-filters-drawer';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export function AssetAssignmentsView() {
    const { user } = useAuth();

    const isHR = user?.roles?.some((role: string) =>
        ['HR Manager', 'HR', 'System Manager', 'Administrator'].includes(role)
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('assigned_on');
    const [selected, setSelected] = useState<string[]>([]);

    const [filters, setFilters] = useState<{
        employee: string;
        status: string;
        startDate: string | null;
        endDate: string | null;
    }>({
        employee: 'all',
        status: 'all',
        startDate: null,
        endDate: null
    });

    const [openFilters, setOpenFilters] = useState(false);
    const canReset = filters.employee !== 'all' || filters.status !== 'all' || filters.startDate !== null || filters.endDate !== null;

    const effectiveFilters = useMemo(() => ({
        ...filters,
        employee: isHR ? filters.employee : (user?.employee || 'all'),
    }), [filters, isHR, user]);

    const { data, total, refetch } = useAssetAssignments(page + 1, rowsPerPage, filterName, orderBy, order, effectiveFilters);

    const [openCreate, setOpenCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [openImport, setOpenImport] = useState(false);

    // View state
    const [openView, setOpenView] = useState(false);
    const [viewAssignment, setViewAssignment] = useState<any>(null);

    // Form state
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [assignedOn, setAssignedOn] = useState('');
    const [returnedOn, setReturnedOn] = useState('');
    const [remarks, setRemarks] = useState('');

    // Dropdown options
    const [assets, setAssets] = useState<Array<{ name: string; asset_name: string }>>([]);
    const [employees, setEmployees] = useState<Array<{ name: string; employee_name: string }>>([]);

    // Permissions
    const [permissions, setPermissions] = useState({ read: false, write: false, delete: false });

    // Snackbar
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Load permissions and dropdown data
    useEffect(() => {
        getAssetAssignmentPermissions().then(setPermissions);
        getAvailableAssets().then(setAssets);
        getEmployees().then(setEmployees);
    }, []);

    const handleFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPage(0);
    };

    const handleResetFilters = () => {
        setFilters({
            employee: 'all',
            status: 'all',
            startDate: null,
            endDate: null
        });
        setPage(0);
    };

    const handleSortChange = (value: string) => {
        if (value === 'date_desc') { setOrderBy('assigned_on'); setOrder('desc'); }
        else if (value === 'date_asc') { setOrderBy('assigned_on'); setOrder('asc'); }
        else if (value === 'employee_asc') { setOrderBy('employee_name'); setOrder('asc'); }
        else if (value === 'employee_desc') { setOrderBy('employee_name'); setOrder('desc'); }
        else if (value === 'asset_asc') { setOrderBy('asset_name'); setOrder('asc'); }
        else if (value === 'asset_desc') { setOrderBy('asset_name'); setOrder('desc'); }
        setPage(0);
    };

    const getCurrentSortValue = () => {
        if (orderBy === 'assigned_on') return order === 'desc' ? 'date_desc' : 'date_asc';
        if (orderBy === 'employee_name') return order === 'desc' ? 'employee_desc' : 'employee_asc';
        if (orderBy === 'asset_name') return order === 'desc' ? 'asset_desc' : 'asset_asc';
        return 'date_desc';
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
            await Promise.all(selected.map((name) => deleteAssetAssignment(name)));
            setSnackbar({ open: true, message: `${selected.length} assignment(s) deleted successfully`, severity: 'success' });
            setSelected([]);
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to delete assignments', severity: 'error' });
        }
    };

    const handleOpenCreate = () => {
        setIsEdit(false);
        setCurrentAssignment(null);
        setSelectedAsset(null);
        setSelectedEmployee(null);
        setAssignedOn('');
        setReturnedOn('');
        setRemarks('');
        setOpenCreate(true);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setIsEdit(false);
        setCurrentAssignment(null);
        setSelectedAsset(null);
        setSelectedEmployee(null);
        setAssignedOn('');
        setReturnedOn('');
        setRemarks('');
    };

    const handleEditRow = useCallback((row: any) => {
        setCurrentAssignment(row);
        setSelectedAsset(assets.find(a => a.name === row.asset) || null);
        setSelectedEmployee(employees.find(e => e.name === row.assigned_to) || null);
        setAssignedOn(row.assigned_on || '');
        setReturnedOn(row.returned_on || '');
        setRemarks(row.remarks || '');
        setIsEdit(true);
        setOpenCreate(true);
    }, [assets, employees]);

    const handleViewRow = useCallback((row: any) => {
        setViewAssignment(row);
        setOpenView(true);
    }, []);

    const handleDeleteRow = useCallback((id: string) => {
        setConfirmDelete({ open: true, id });
    }, []);

    const handleConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            await deleteAssetAssignment(confirmDelete.id);
            setSnackbar({ open: true, message: 'Assignment deleted successfully', severity: 'success' });
            refetch();
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Failed to delete assignment', severity: 'error' });
        } finally {
            setConfirmDelete({ open: false, id: null });
        }
    };

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedAsset || !selectedEmployee || !assignedOn) {
            setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
            return;
        }

        // Pre-validation: Check if asset is already assigned
        try {
            const checkUrl = `/api/method/company.company.frontend_api.check_asset_availability?asset=${selectedAsset.name}${isEdit && currentAssignment ? `&name=${currentAssignment.name}` : ''}`;
            const checkRes = await frappeRequest(checkUrl);
            const checkData = await checkRes.json();

            if (checkData.message && checkData.message.is_assigned) {
                setSnackbar({
                    open: true,
                    message: `Asset Already Assigned: ${checkData.message.employee_name} (${checkData.message.assigned_to}) currently has this asset.`,
                    severity: 'error'
                });
                return;
            }
        } catch (error) {
            console.error('Pre-validation failed:', error);
        }

        const assignmentData = {
            asset: selectedAsset.name,
            assigned_to: selectedEmployee.name,
            assigned_on: assignedOn,
            returned_on: returnedOn || undefined,
            remarks: remarks.trim(),
        };

        try {
            if (isEdit && currentAssignment) {
                await updateAssetAssignment(currentAssignment.name, assignmentData);
                setSnackbar({ open: true, message: 'Assignment updated successfully', severity: 'success' });
            } else {
                await createAssetAssignment(assignmentData);
                setSnackbar({ open: true, message: 'Assignment created successfully', severity: 'success' });
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
                    Asset Assignments
                </Typography>

                {permissions.write && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="solar:import-bold-duotone" />}
                            onClick={() => setOpenImport(true)}
                        >
                            Import
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={handleOpenCreate}
                            sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                        >
                            New Assignment
                        </Button>
                    </Stack>
                )}
            </Box>

            <Card>
                <AssetAssignmentTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    searchPlaceholder="Search assignments..."
                    onDelete={selected.length > 0 ? handleBulkDelete : undefined}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    sortBy={getCurrentSortValue()}
                    onSortChange={handleSortChange}
                    sortOptions={[
                        { value: 'date_desc', label: 'Newest First' },
                        { value: 'date_asc', label: 'Oldest First' },
                        { value: 'employee_asc', label: 'Employee: A to Z' },
                        { value: 'employee_desc', label: 'Employee: Z to A' },
                        { value: 'asset_asc', label: 'Asset: A to Z' },
                        { value: 'asset_desc', label: 'Asset: Z to A' },
                    ]}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: { xs: 300, md: 800 } }}>
                            <AssetAssignmentTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={selected.length}
                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'asset_name', label: 'Asset' },
                                    { id: 'employee_name', label: 'Employee' },
                                    { id: 'assigned_on', label: 'Assigned On', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'returned_on', label: 'Returned On', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: '', label: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <AssetAssignmentTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            asset_name: row.asset_name,
                                            employee_name: row.employee_name,
                                            assigned_on: row.assigned_on,
                                            returned_on: row.returned_on,
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

                                {!empty && (
                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={Math.max(0, rowsPerPage - data.length)}
                                    />
                                )}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyContent
                                                title="No assignments found"
                                                description="You haven't created any asset assignments yet. Click 'New Assignment' to get started."
                                                icon="solar:clipboard-list-bold-duotone"
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
                    page={page}
                    count={total}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            <AssetAssignmentsTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                isHR={isHR}
            />

            {/* Create/Edit Dialog */}
            <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="md">
                <form onSubmit={handleCreate}>
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {isEdit ? 'Edit Assignment' : 'New Assignment'}
                        <IconButton onClick={handleCloseCreate}>
                            <Iconify icon="mingcute:close-line" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Box sx={{ display: 'grid', gap: 3, margin: '1rem', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <Autocomplete
                                fullWidth
                                options={assets}
                                getOptionLabel={(option) => `${option.asset_name} (${option.name})`}
                                value={selectedAsset}
                                onChange={(event, newValue) => setSelectedAsset(newValue)}
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props as any;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Stack spacing={0.5}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {option.asset_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    ID: {option.name}
                                                </Typography>
                                            </Stack>
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Asset" required placeholder="Select asset" />
                                )}
                                disabled={isEdit}
                            />

                            <Autocomplete
                                fullWidth
                                options={employees}
                                getOptionLabel={(option) => `${option.employee_name} (${option.name})`}
                                value={selectedEmployee}
                                onChange={(event, newValue) => setSelectedEmployee(newValue)}
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props as any;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Stack spacing={0.5}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {option.employee_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    ID: {option.name}
                                                </Typography>
                                            </Stack>
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Employee" required placeholder="Select employee" />
                                )}
                            />

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Assigned On"
                                    format="DD-MM-YYYY"
                                    value={assignedOn ? dayjs(assignedOn) : null}
                                    onChange={(newValue) => setAssignedOn(newValue?.format('YYYY-MM-DD') || '')}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            InputLabelProps: { shrink: true },
                                        },
                                    }}
                                />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Returned On"
                                    format="DD-MM-YYYY"
                                    value={returnedOn ? dayjs(returnedOn) : null}
                                    onChange={(newValue) => setReturnedOn(newValue?.format('YYYY-MM-DD') || '')}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            InputLabelProps: { shrink: true },
                                        },
                                    }}
                                />
                            </LocalizationProvider>

                            <TextField
                                fullWidth
                                label="Remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Enter remarks"
                                sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                            />
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button type="submit" variant="contained">
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={openView} onClose={() => setOpenView(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Assignment Details</Typography>
                    <IconButton
                        onClick={() => setOpenView(false)}
                        sx={{
                            color: 'text.disabled',
                            bgcolor: 'background.paper',
                            boxShadow: (theme) => theme.customShadows?.z1,
                            '&:hover': {
                                color: 'error.main',
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
                            }
                        }}
                    >
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                    {viewAssignment && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {/* Header Summary Card */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'info.lighter',
                                        color: 'info.main',
                                        boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.info.main, 0.16)}`,
                                    }}
                                >
                                    <Iconify icon={"solar:laptop-bold-duotone" as any} width={40} />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                        {viewAssignment.asset_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        Asset ID: {viewAssignment.asset}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Label
                                        color={viewAssignment.returned_on ? 'default' : 'success'}
                                        variant="soft"
                                        sx={{ textTransform: 'uppercase', height: 24, px: 1.5 }}
                                    >
                                        {viewAssignment.returned_on ? 'RETURNED' : 'ACTIVE'}
                                    </Label>
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Assignment Information */}
                            <Box>
                                <SectionHeader title="Assignment Information" icon="solar:user-id-bold" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                    }}
                                >
                                    <DetailItem
                                        label="Employee"
                                        value={viewAssignment.employee_name}
                                        icon="solar:user-bold"
                                    />
                                    <DetailItem
                                        label="Employee ID"
                                        value={viewAssignment.assigned_to}
                                        icon="solar:hashtag-bold"
                                    />
                                </Box>
                            </Box>

                            {/* Date Details */}
                            <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                <SectionHeader title="Lifecycle Details" icon="solar:calendar-bold" noMargin />
                                <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                    <DetailItem
                                        label="Assigned On"
                                        value={dayjs(viewAssignment.assigned_on).format('DD MMM YYYY')}
                                        icon="solar:calendar-line-duotone"
                                    />
                                    {viewAssignment.returned_on && (
                                        <DetailItem
                                            label="Returned On"
                                            value={dayjs(viewAssignment.returned_on).format('DD MMM YYYY')}
                                            icon="solar:calendar-check-bold"
                                        />
                                    )}
                                </Box>
                            </Box>

                            {/* Remarks Section */}
                            {viewAssignment.remarks && (
                                <Box>
                                    <SectionHeader title="Remarks" icon="solar:notes-bold" />
                                    <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {viewAssignment.remarks}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <AssetAssignmentImportDialog
                open={openImport}
                onClose={() => setOpenImport(false)}
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

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this assignment?"
                action={
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
            />
        </DashboardContent >
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
