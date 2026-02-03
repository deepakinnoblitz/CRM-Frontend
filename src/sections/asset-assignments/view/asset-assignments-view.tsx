import dayjs from 'dayjs';
import { useState, useCallback, useEffect } from 'react';

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

import { TableNoData } from 'src/sections/user/table-no-data';
import { TableEmptyRows } from 'src/sections/user/table-empty-rows';
import { UserTableHead as AssetAssignmentTableHead } from 'src/sections/user/user-table-head';
import { AssetAssignmentTableRow } from 'src/sections/asset-assignments/asset-assignments-table-row';
import { UserTableToolbar as AssetAssignmentTableToolbar } from 'src/sections/user/user-table-toolbar';
// import { AssetAssignmentTableRow } from 'src/sections/asset-assignments/asset-assignments-table-row';
import { AssetAssignmentsTableFiltersDrawer } from 'src/sections/asset-assignments/asset-assignments-table-filters-drawer';

// ----------------------------------------------------------------------

export function AssetAssignmentsView() {
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

    const { data, total, refetch } = useAssetAssignments(page + 1, rowsPerPage, filterName, orderBy, order, filters);

    const [openCreate, setOpenCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

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
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        onClick={handleOpenCreate}
                        sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        New Assignment
                    </Button>
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
                        <Table sx={{ minWidth: 800 }}>
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
                                    { id: 'assigned_on', label: 'Assigned On' },
                                    { id: 'returned_on', label: 'Returned On' },
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
                                getOptionLabel={(option) => option.asset_name}
                                value={selectedAsset}
                                onChange={(event, newValue) => setSelectedAsset(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Asset" required placeholder="Select asset" />
                                )}
                                disabled={isEdit}
                            />

                            <Autocomplete
                                fullWidth
                                options={employees}
                                getOptionLabel={(option) => option.employee_name}
                                value={selectedEmployee}
                                onChange={(event, newValue) => setSelectedEmployee(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Employee" required placeholder="Select employee" />
                                )}
                            />

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Assigned On"
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
                <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Assignment Details</Typography>
                    </Stack>
                    <IconButton
                        onClick={() => setOpenView(false)}
                        sx={{
                            color: 'text.disabled',
                            '&:hover': {
                                color: 'error.main',
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08)
                            }
                        }}
                    >
                        <Iconify icon="mingcute:close-line" width={24} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, pt: 0 }}>
                    {viewAssignment && (
                        <Stack spacing={3}>
                            {/* Header Summary Card */}
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                                    boxShadow: (theme) => theme.customShadows?.z12,
                                    border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: 3 }}>
                                    <Box
                                        sx={{
                                            width: 54,
                                            height: 54,
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'common.white',
                                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                                            boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                                        }}
                                    >
                                        <Iconify icon={"solar:laptop-bold-duotone" as any} width={32} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                            {viewAssignment.asset_name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            Asset ID: {viewAssignment.asset}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{
                                        p: 2,
                                        borderRadius: 1.5,
                                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                                    }}
                                >
                                    <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                                            EMPLOYEE
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                            {viewAssignment.employee_name || 'N/A'}
                                        </Typography>
                                    </Stack>

                                    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderStyle: 'dashed' }} />

                                    <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                                            STATUS
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Label
                                                color={viewAssignment.returned_on ? 'default' : 'success'}
                                                variant="filled"
                                                sx={{ textTransform: 'uppercase', height: 24, px: 1.5 }}
                                            >
                                                {viewAssignment.returned_on ? 'RETURNED' : 'ACTIVE'}
                                            </Label>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>

                            {/* Date Details */}
                            <Stack spacing={2}>
                                <DetailRow
                                    label="Assigned On"
                                    value={dayjs(viewAssignment.assigned_on).format('DD MMM YYYY')}
                                    icon="solar:calendar-bold"
                                />
                                {viewAssignment.returned_on && (
                                    <>
                                        <Divider />
                                        <DetailRow
                                            label="Returned On"
                                            value={dayjs(viewAssignment.returned_on).format('DD MMM YYYY')}
                                            icon="solar:calendar-check-bold"
                                        />
                                    </>
                                )}
                            </Stack>

                            {/* Remarks Section */}
                            {viewAssignment.remarks && (
                                <Box sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                                    border: (theme) => `1px solid ${theme.palette.divider}`
                                }}>
                                    <Typography variant="caption" sx={{
                                        color: 'text.disabled',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        mb: 1,
                                        display: 'block'
                                    }}>
                                        Remarks
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                        {viewAssignment.remarks}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

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
        </DashboardContent>
    );
}

function DetailRow({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Box
                sx={{
                    p: 1,
                    borderRadius: 1.25,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Iconify icon={icon as any} width={22} />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }}>
                    {label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Stack>
    );
}
