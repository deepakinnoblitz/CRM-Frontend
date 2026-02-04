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
    createExpenseTracker,
    updateExpenseTracker,
    deleteExpenseTracker,
    fetchExpenseTrackerList,
    fetchExpenseTrackerStats
} from 'src/api/expense-tracker';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { TableNoData } from '../../lead/table-no-data';
import { TableEmptyRows } from '../../lead/table-empty-rows';
import ExpenseTrackerDialog from '../expense-tracker-dialog';
import ExpenseTrackerStatsCards from '../expense-tracker-stats-cards';
import { ExpenseTrackerTableRow } from '../expense-tracker-table-row';
import { LeadTableHead as ExpenseTrackerTableHead } from '../../lead/lead-table-head';
import ExpenseTrackerTableFiltersDrawer from '../expense-tracker-table-filters-drawer';
import { LeadTableToolbar as ExpenseTrackerTableToolbar } from '../../lead/lead-table-toolbar';

// ----------------------------------------------------------------------

export default function ExpenseTrackerView() {
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
                fetchExpenseTrackerList({
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
                fetchExpenseTrackerStats({
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
                await updateExpenseTracker(currentData.name, formData);
            } else {
                await createExpenseTracker(formData);
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
                await deleteExpenseTracker(confirmDelete.id);
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
                    Company Expenses
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenDialog()}
                    sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                >
                    Add Expense
                </Button>
            </Box>

            <ExpenseTrackerStatsCards stats={stats} />

            <Card>
                <ExpenseTrackerTableToolbar
                    numSelected={selected.length}
                    filterName={filterName}
                    onFilterName={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFilterName(e.target.value);
                        setPage(0);
                    }}
                    onOpenFilter={() => setOpenFilters(true)}
                    canReset={canReset}
                    searchPlaceholder="Search by title..."
                    onDelete={() => { }}
                />

                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <ExpenseTrackerTableHead
                                rowCount={total}
                                numSelected={selected.length}
                                onSelectAllRows={handleSelectAllRows}
                                hideCheckbox
                                showIndex
                                headLabel={[
                                    { id: 'titlenotes', label: 'Title (Notes)' },
                                    { id: 'date_time', label: 'Date & Time' },
                                    { id: 'type', label: 'Type' },
                                    { id: 'amount', label: 'Amount' },
                                    { id: '' },
                                ]}
                            />
                            <TableBody>
                                {data.map((row, index) => (
                                    <ExpenseTrackerTableRow
                                        key={row.name}
                                        index={page * rowsPerPage + index}
                                        row={{
                                            id: row.name,
                                            name: row.name,
                                            type: row.type,
                                            titlenotes: row.titlenotes,
                                            amount: row.amount,
                                            creation: row.creation,
                                            date_time: row.date_time,
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
                                                description="You haven't added any company expenses yet. Click 'Add Expense' to get started."
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

            <ExpenseTrackerDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSubmit={handleSubmit}
                currentData={currentData}
            />

            <ExpenseTrackerTableFiltersDrawer
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
