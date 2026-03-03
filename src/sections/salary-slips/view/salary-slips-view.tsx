import type { SalarySlip } from 'src/api/salary-slips';

import { useState, useEffect, useCallback, useMemo } from 'react';

import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { useSalarySlips } from 'src/hooks/useSalarySlips';

import { getDoctypeList } from 'src/api/leads';
import { getCurrentUserInfo } from 'src/api/auth';
import { DashboardContent } from 'src/layouts/dashboard';
import { getSalarySlip, deleteSalarySlip } from 'src/api/salary-slips';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from 'src/sections/lead/table-no-data';
import { TableEmptyRows } from 'src/sections/lead/table-empty-rows';
import { SalarySlipTableRow } from 'src/sections/salary-slips/salary-slip-table-row';
import { LeadTableHead as SalarySlipTableHead } from 'src/sections/lead/lead-table-head';
import { LeadTableToolbar as SalarySlipTableToolbar } from 'src/sections/lead/lead-table-toolbar';
import { SalarySlipDetailsDialog } from 'src/sections/report/salary-slips/salary-slip-details-dialog';

import SalarySlipCreateDialog from '../salary-slip-create-dialog';
import { SalarySlipFiltersDrawer } from '../salary-slip-filters-drawer';
import SalarySlipAutoAllocateDialog from '../salary-slip-auto-allocate-dialog';

import type { SalarySlipFiltersProps } from '../salary-slip-filters-drawer';


const SORT_OPTIONS = [
    { value: 'pay_period_start_desc', label: 'Newest First' },
    { value: 'pay_period_start_asc', label: 'Oldest First' },
    { value: 'employee_name_asc', label: 'Employee: A to Z' },
    { value: 'employee_name_desc', label: 'Employee: Z to A' },
];

export function SalarySlipsView() {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [orderBy, setOrderBy] = useState('pay_period_start');
    const [filters, setFilters] = useState<SalarySlipFiltersProps>({
        employee: 'all',
        department: 'all',
        designation: 'all',
        pay_period_start: null,
        pay_period_end: null,
    });

    const [isHR, setIsHR] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);

    const filterValues = useMemo(() => {
        const baseFilters: Record<string, any> = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== 'all' && v !== null)
        );

        if (!isHR) {
            baseFilters.docstatus = 1;
            if (currentEmployeeId) {
                baseFilters.employee = currentEmployeeId;
            }
        }

        return baseFilters;
    }, [filters, isHR, currentEmployeeId]);



    const { data, total, refetch, loading } = useSalarySlips(
        page + 1,
        rowsPerPage,
        filterName,
        filterValues,
        orderBy,
        order
    );

    const [selected, setSelected] = useState<string[]>([]);
    const [openFilters, setOpenFilters] = useState(false);

    const [filterOptions, setFilterOptions] = useState<{
        employees: any[];
        departments: any[];
        designations: any[];
    }>({
        employees: [],
        departments: [],
        designations: [],
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [emps, depts, desigs] = await Promise.all([
                    getDoctypeList('Employee', ['name', 'employee_name']),
                    getDoctypeList('Department', ['name']),
                    getDoctypeList('Designation', ['name']),
                ]);
                setFilterOptions({
                    employees: emps,
                    departments: depts,
                    designations: desigs,
                });
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        };
        const checkRoleAndEmployee = async () => {
            const user = await getCurrentUserInfo();
            if (user) {
                if (user.roles) {
                    const hrRoles = ['HR Manager', 'HR User', 'System Manager', 'Administrator'];
                    setIsHR(user.roles.some((role: string) => hrRoles.includes(role)));
                }
                if (user.employee) {
                    setCurrentEmployeeId(user.employee);
                }
            }
        };
        fetchOptions();
        checkRoleAndEmployee();
    }, []);

    const handleFilters = useCallback((update: Partial<SalarySlipFiltersProps>) => {
        setFilters((prev) => ({ ...prev, ...update }));
        setPage(0);
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            employee: 'all',
            department: 'all',
            designation: 'all',
            pay_period_start: null,
            pay_period_end: null,
        });
        setPage(0);
    }, []);

    const canReset = filters.employee !== 'all' ||
        filters.department !== 'all' ||
        filters.designation !== 'all' ||
        filters.pay_period_start !== null ||
        filters.pay_period_end !== null;

    const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== null).length;


    // Dialog state
    const [openCreate, setOpenCreate] = useState(false);
    const [openAutoAllocate, setOpenAutoAllocate] = useState(false);


    // View state
    const [openView, setOpenView] = useState(false);
    const [viewSlip, setViewSlip] = useState<any>(null);
    const [editSlip, setEditSlip] = useState<SalarySlip | null>(null);




    // Delete confirmation
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        slipName: string;
    }>({
        open: false,
        slipName: '',
    });

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

    const handleViewRow = useCallback(async (row: any) => {
        try {
            const fullData = await getSalarySlip(row.name);
            setViewSlip(fullData);
            setOpenView(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load record',
                severity: 'error',
            });
        }
    }, []);

    const handleEditRow = useCallback(async (row: any) => {
        try {
            const fullData = await getSalarySlip(row.name);
            setEditSlip(fullData);
            setOpenCreate(true);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to load record',
                severity: 'error',
            });
        }
    }, []);

    const handleDeleteRow = useCallback((name: string) => {
        setDeleteDialog({ open: true, slipName: name });
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        try {
            await deleteSalarySlip(deleteDialog.slipName);
            setSnackbar({
                open: true,
                message: 'Salary slip deleted successfully',
                severity: 'success',
            });
            setDeleteDialog({ open: false, slipName: '' });
            refetch();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to delete record',
                severity: 'error',
            });
            setDeleteDialog({ open: false, slipName: '' });
        }
    }, [deleteDialog.slipName, refetch]);


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
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
                <Typography variant="h4">Salary Slips</Typography>

                {isHR && (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Iconify icon={"solar:import-bold-duotone" as any} />}
                            onClick={() => setOpenAutoAllocate(true)}
                            sx={{ borderRadius: 1.5, height: 40 }}
                        >
                            Bulk Allocate
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => {
                                setEditSlip(null);
                                setOpenCreate(true);
                            }}
                            sx={{ borderRadius: 1.5, height: 40, bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                        >
                            New Salary Slip
                        </Button>
                    </Stack>
                )}
            </Stack>


            <Card>

                <SalarySlipTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={handleFilterByName}
                    searchPlaceholder="Search employee name..."
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

                    canReset={canReset}
                />


                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: { xs: 300, md: 800 } }}>
                            <SalarySlipTableHead
                                order={order}
                                orderBy={orderBy}
                                rowCount={data.length}
                                numSelected={selected.length}


                                onSelectAllRows={(checked: boolean) => handleSelectAllRows(checked)}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'employee_name', label: 'Employee Name' },
                                    { id: 'pay_period_start', label: 'Pay Period' },
                                    { id: 'gross_pay', label: 'Gross Pay', align: 'right', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'net_pay', label: 'Net Pay', align: 'right', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: 'status', label: 'Status', sx: { display: { xs: 'none', md: 'table-cell' } } },
                                    { id: '', label: '', align: 'right' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <SalarySlipTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        hideCheckbox
                                        row={{
                                            id: row.name,
                                            employee_name: row.employee_name,
                                            employee_id: row.employee,
                                            pay_period_start: row.pay_period_start,
                                            pay_period_end: row.pay_period_end,
                                            gross_pay: row.gross_pay,
                                            net_pay: row.net_pay,
                                            status: row.status,
                                            docstatus: row.docstatus,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onView={() => handleViewRow(row)}
                                        onEdit={() => handleEditRow(row)}
                                        onDelete={() => handleDeleteRow(row.name)}
                                        isHR={isHR}
                                    />

                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <EmptyContent
                                                title="No salary slips"
                                                description="You haven't received any salary slips yet."
                                                icon="solar:wallet-bold-duotone"
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

            {/* View Dialog */}
            <SalarySlipDetailsDialog
                open={openView}
                onClose={() => setOpenView(false)}
                slip={viewSlip}
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

            <SalarySlipCreateDialog
                open={openCreate}
                onClose={() => {
                    setOpenCreate(false);
                    setEditSlip(null);
                }}
                onSuccess={(message) => {
                    setSnackbar({ open: true, message, severity: 'success' });
                    refetch();
                }}
                onError={(error) => {
                    setSnackbar({ open: true, message: error, severity: 'error' });
                }}
                slip={editSlip}
            />


            <SalarySlipAutoAllocateDialog
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

            <SalarySlipFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
                options={filterOptions}
                isHR={isHR}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, slipName: '' })}
                title="Delete Salary Slip"
                content="Are you sure you want to delete this salary slip? This action cannot be undone."
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        Delete
                    </Button>
                }
            />

        </DashboardContent>

    );
}
