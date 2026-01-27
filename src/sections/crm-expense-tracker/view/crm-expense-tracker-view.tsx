import type dayjs from 'dayjs';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    createCRMExpenseTracker,
    updateCRMExpenseTracker,
    deleteCRMExpenseTracker,
    fetchCRMExpenseTrackerList,
    fetchCRMExpenseTrackerStats
} from 'src/api/crm-expense-tracker';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../../user/table-no-data';
import { TableEmptyRows } from '../../user/table-empty-rows';
import CRMExpenseTrackerDialog from '../crm-expense-tracker-dialog';
import CRMExpenseTrackerStatsCards from '../crm-expense-tracker-stats-cards';
import { CRMExpenseTrackerTableRow } from '../crm-expense-tracker-table-row';
import { UserTableHead as CRMExpenseTrackerTableHead } from '../../user/user-table-head';
import CRMExpenseTrackerTableFiltersDrawer from '../crm-expense-tracker-table-filters-drawer';
import { UserTableToolbar as CRMExpenseTrackerTableToolbar } from '../../user/user-table-toolbar';

// ----------------------------------------------------------------------

export default function CRMExpenseTrackerView() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterName, setFilterName] = useState('');
    const [sortBy, setSortBy] = useState('creation_desc');
    const [selected, setSelected] = useState<string[]>([]);

    const [filters, setFilters] = useState({
        type: 'all',
        startDate: null as dayjs.Dayjs | null,
        endDate: null as dayjs.Dayjs | null,
    });

    const [openFilters, setOpenFilters] = useState(false);

    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_income: 0, total_expense: 0, balance: 0 });

    const [openDialog, setOpenDialog] = useState(false);
    const [currentData, setCurrentData] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const startDate = filters.startDate ? filters.startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined;
            const endDate = filters.endDate ? filters.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined;

            const [listRes, statsRes] = await Promise.all([
                fetchCRMExpenseTrackerList({
                    page: page + 1,
                    page_size: rowsPerPage,
                    search: filterName,
                    filters: {
                        type: filters.type,
                        start_date: startDate,
                        end_date: endDate,
                    },
                    sort_by: sortBy,
                }),
                fetchCRMExpenseTrackerStats({
                    start_date: startDate,
                    end_date: endDate,
                })
            ]);

            setData(listRes.data);
            setTotal(listRes.total);
            setStats(statsRes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filterName, filters, sortBy]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const handleOpenDialog = (rowData?: any) => {
        setCurrentData(rowData || null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentData(null);
    };

    const handleSubmit = async (formData: any) => {
        try {
            if (currentData) {
                await updateCRMExpenseTracker(currentData.name, formData);
            } else {
                await createCRMExpenseTracker(formData);
            }
            handleCloseDialog();
            refreshData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (confirmDelete.id) {
            try {
                await deleteCRMExpenseTracker(confirmDelete.id);
                setConfirmDelete({ open: false, id: null });
                refreshData();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSelectAllRows = (checked: boolean) => {
        if (checked) {
            setSelected(data.map((row) => row.name));
            return;
        }
        setSelected([]);
    };

    const handleSelectRow = (name: string) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
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
            type: 'all',
            startDate: null,
            endDate: null,
        });
    };

    const canReset = filters.type !== 'all' || !!filters.startDate || !!filters.endDate;

    const notFound = !loading && !data.length && (!!filterName || canReset);
    const empty = !loading && !data.length && !filterName && !canReset;

    return (
        <DashboardContent>
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                >
                    Add Expense Tracker
                </Button>
            </Box>

            <CRMExpenseTrackerStatsCards stats={stats} />

            <Card>
                <CRMExpenseTrackerTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(e.target.value);
                        setPage(0);
                    }}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    searchPlaceholder="Search by ID or title..."
                    onDelete={() => { }}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <CRMExpenseTrackerTableHead
                                rowCount={total}
                                numSelected={selected.length}
                                onSelectAllRows={handleSelectAllRows}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'type', label: 'Type' },
                                    { id: 'titlenotes', label: 'Title (Notes)' },
                                    { id: 'amount', label: 'Amount' },
                                    { id: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <CRMExpenseTrackerTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        row={{
                                            id: row.name,
                                            name: row.name,
                                            type: row.type,
                                            titlenotes: row.titlenotes,
                                            amount: row.amount,
                                            creation: row.creation,
                                        }}
                                        selected={selected.includes(row.name)}
                                        onSelectRow={() => handleSelectRow(row.name)}
                                        onEdit={() => handleOpenDialog(row)}
                                        onDelete={() => setConfirmDelete({ open: true, id: row.name })}
                                        hideCheckbox
                                    />
                                ))}

                                {notFound && <TableNoData searchQuery={filterName} />}

                                {empty && (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <EmptyContent
                                                title="No records found"
                                                description="You haven't added any expense tracker records yet. Click 'Add Expense Tracker' to get started."
                                                icon="solar:wallet-money-bold-duotone"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading && data.length < rowsPerPage && !empty && (
                                    <TableEmptyRows
                                        height={68}
                                        emptyRows={rowsPerPage - data.length}
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
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[5, 10, 25]}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>

            <CRMExpenseTrackerDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                currentData={currentData}
            />

            <CRMExpenseTrackerTableFiltersDrawer
                open={openFilters}
                onOpen={() => setOpenFilters(true)}
                onClose={() => setOpenFilters(false)}
                filters={filters}
                onFilters={handleFilters}
                canReset={canReset}
                onResetFilters={handleResetFilters}
            />

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Delete"
                content="Are you sure you want to delete this record?"
                action={
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                }
            />
        </DashboardContent>
    );
}
