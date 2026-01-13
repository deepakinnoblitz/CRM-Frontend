import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { runReport } from 'src/api/reports';
import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ExportFieldsDialog } from '../../export-fields-dialog';
import { ExpenseDetailsDialog } from '../../expenses/expenses-details-dialog';

// ----------------------------------------------------------------------

export function ExpenseReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [expenseCategory, setExpenseCategory] = useState('');
    const [paymentType, setPaymentType] = useState('all');
    const [fromDate, setFromDate] = useState<any>(null);
    const [toDate, setToDate] = useState<any>(null);

    // Options
    const [paymentTypeOptions, setPaymentTypeOptions] = useState<string[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Details
    const [openView, setOpenView] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<any>(null);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = reportData.map((n) => n.expense_no);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
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

    // Export Fields Dialog
    const [openExportFields, setOpenExportFields] = useState(false);

    const handleExport = async (selectedFields: string[], format: 'excel' | 'csv') => {
        setLoading(true);
        try {
            const idsToExport = (selected.length > 0 ? selected : reportData.map(r => r.expense_no)).filter(Boolean);

            if (idsToExport.length === 0) {
                setLoading(false);
                return;
            }

            const filters = [['expense_no', 'in', idsToExport]];
            const fieldsToFetch = selectedFields.length > 0 ? selectedFields : ['expense_no', 'expense_category', 'date', 'payment_type', 'total'];
            if (!fieldsToFetch.includes('expense_no')) fieldsToFetch.push('expense_no');

            const queryParams = new URLSearchParams({
                doctype: "Expenses",
                fields: JSON.stringify(fieldsToFetch),
                filters: JSON.stringify(filters),
                limit_page_length: "99999"
            });

            const res = await fetch(`/api/method/frappe.client.get_list?${queryParams.toString()}`, {
                method: 'GET',
                credentials: "include"
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Export API Error:", errorText);
                throw new Error("Failed to fetch data for export");
            }

            const jsonResponse = await res.json();
            const data = jsonResponse.message || [];

            if (!data || data.length === 0) {
                console.warn("Export returned no data");
            }

            const worksheet = XLSX.utils.json_to_sheet(data);

            if (format === 'excel') {
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
                XLSX.writeFile(workbook, "Expense_Report.xlsx");
            } else {
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "Expense_Report.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewExpense = useCallback((expense: any) => {
        setSelectedExpense(expense);
        setOpenView(true);
    }, []);

    const onChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (expenseCategory) filters.expense_category = expenseCategory;
            if (paymentType !== 'all') filters.payment_type = paymentType;
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');

            const result = await runReport('Expense Report', filters);
            setReportData(result.result || []);
            setSummaryData(result.report_summary || []);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch expense report:', error);
        } finally {
            setLoading(false);
        }
    }, [expenseCategory, paymentType, fromDate, toDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    useEffect(() => {
        getDoctypeList('Payment Type').then(setPaymentTypeOptions);
    }, []);

    return (
        <DashboardContent>
            <Stack spacing={4} sx={{ mt: 3, mb: 5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">
                        Expense Report
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="inherit"
                            startIcon={<Iconify icon={"solar:export-bold" as any} />}
                            onClick={() => setOpenExportFields(true)}
                        >
                            Export
                        </Button>
                    </Box>
                </Stack>

                {/* Filters */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Card
                        sx={{
                            p: 2.5,
                            boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                        }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                            <FormControl fullWidth size="small">
                                <TextField
                                    size="small"
                                    placeholder="Expense Category"
                                    value={expenseCategory}
                                    onChange={(e) => setExpenseCategory(e.target.value)}
                                />
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <Select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="all">Payment Type</MenuItem>
                                    {paymentTypeOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>
                                            {opt}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <DatePicker
                                label="From Date"
                                value={fromDate}
                                onChange={setFromDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                            <DatePicker
                                label="To Date"
                                value={toDate}
                                onChange={setToDate}
                                slotProps={{ textField: { size: 'small', fullWidth: true } }}
                            />
                        </Stack>
                    </Card>
                </LocalizationProvider>

                {/* Summary Stats */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    justifyContent="center"
                    sx={{ py: 2 }}
                >
                    {summaryData.map((card, index) => (
                        <SummaryCard
                            key={index}
                            title={card.label}
                            value={card.value}
                            color={getIndicatorColor(card.indicator)}
                            datatype={card.datatype}
                        />
                    ))}
                </Stack>

                {/* Data Table */}
                <Card
                    sx={{
                        boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    }}
                >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 900, maxHeight: 440, overflowY: 'auto' }}>
                            <Table size="medium" stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f4f6f8' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < reportData.length}
                                                checked={reportData.length > 0 && selected.length === reportData.length}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Expense No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Payment Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Total</TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'text.secondary',
                                                position: 'sticky',
                                                right: 0,
                                                bgcolor: '#f4f6f8',
                                                zIndex: 1,
                                                boxShadow: '-2px 0 5px rgba(0,0,0,0.05)',
                                            }}
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            const isSelected = selected.indexOf(row.expense_no) !== -1;
                                            return (
                                                <TableRow
                                                    key={index}
                                                    hover
                                                    role="checkbox"
                                                    aria-checked={isSelected}
                                                    selected={isSelected}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onClick={(event) => handleClick(event, row.expense_no)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{row.expense_no}</TableCell>
                                                    <TableCell>{row.expense_category}</TableCell>
                                                    <TableCell>{row.date ? new Date(row.date).toLocaleDateString() : '-'}</TableCell>
                                                    <TableCell>{row.payment_type}</TableCell>
                                                    <TableCell>{row.items}</TableCell>
                                                    <TableCell>{row.quantity}</TableCell>
                                                    <TableCell>₹{row.price?.toLocaleString() || 0}</TableCell>
                                                    <TableCell>₹{row.amount?.toLocaleString() || 0}</TableCell>
                                                    <TableCell>₹{row.total?.toLocaleString() || 0}</TableCell>
                                                    <TableCell
                                                        align="center"
                                                        sx={{
                                                            position: 'sticky',
                                                            right: 0,
                                                            bgcolor: 'background.paper',
                                                            boxShadow: '-2px 0 5px rgba(0,0,0,0.05)',
                                                        }}
                                                    >
                                                        <IconButton onClick={() => handleViewExpense(row)} sx={{ color: 'info.main' }}>
                                                            <Iconify icon="solar:eye-bold" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                                                <Stack spacing={1} alignItems="center">
                                                    <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                        No data found
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                    <TablePagination
                        component="div"
                        count={reportData.length}
                        page={page}
                        onPageChange={onChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Card>
            </Stack>

            <ExpenseDetailsDialog
                open={openView}
                expense={selectedExpense}
                onClose={() => {
                    setOpenView(false);
                    setSelectedExpense(null);
                }}
            />

            <ExportFieldsDialog
                open={openExportFields}
                onClose={() => setOpenExportFields(false)}
                doctype="Expenses"
                onExport={handleExport}
            />
        </DashboardContent>
    );
}

// ----------------------------------------------------------------------

function SummaryCard({ title, value, color, datatype }: { title: string; value: number; color: string; datatype?: string }) {
    const getIcon = () => {
        switch (title) {
            case 'Total Expense Amount': return 'solar:wallet-money-bold-duotone';
            case 'Total Quantity': return 'solar:box-bold-duotone';
            case 'Total Item Amount': return 'solar:dollar-bold-duotone';
            default: return 'solar:chart-bold-duotone';
        }
    };

    const formatValue = (val: number) => {
        if (datatype === 'Currency') {
            return `₹${val.toLocaleString()}`;
        }
        if (datatype === 'Float') {
            return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return val.toLocaleString();
    };

    return (
        <Card
            sx={{
                py: 2.5,
                px: 3,
                width: { xs: 1, sm: 220 },
                boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: color,
                },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${color}15`,
                        flexShrink: 0,
                    }}
                >
                    <Iconify icon={getIcon() as any} width={24} sx={{ color }} />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 800, mb: 0.25 }}>
                        {formatValue(value)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {title}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    );
}

function getIndicatorColor(indicator: string) {
    switch (indicator) {
        case 'Green': return '#4CAF50';
        case 'Red': return '#F44336';
        case 'Blue': return '#2196F3';
        case 'Orange': return '#FF9800';
        case 'Purple': return '#9C27B0';
        default: return '#2196F3';
    }
}
