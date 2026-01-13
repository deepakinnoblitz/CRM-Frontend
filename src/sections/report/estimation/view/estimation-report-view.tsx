import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { runReport } from 'src/api/reports';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ExportFieldsDialog } from '../../export-fields-dialog';

// ----------------------------------------------------------------------

export function EstimationReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [customerName, setCustomerName] = useState('');
    const [fromDate, setFromDate] = useState<any>(null);
    const [toDate, setToDate] = useState<any>(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Export Fields Dialog
    const [openExportFields, setOpenExportFields] = useState(false);

    const handleExport = async (selectedFields: string[], format: 'excel' | 'csv') => {
        setLoading(true);
        try {
            const dataToExport = reportData;

            if (dataToExport.length === 0) {
                setLoading(false);
                return;
            }

            // Client-side export based on current reportData
            // If explicit server-side export is needed, we'd replicate the expense report logic
            // providing filtered list. For simplicity and consistency with simple reports, 
            // exporting the current view or fetching all with current filters is acceptable.
            // Following Expense Report Pattern: query list with filters.

            // Replicating Expense Report export logic (fetch by ID list or just fetch all with params)
            // Expense report filters by `expense_no` IN [list] if selected, OR uses IDs from current data.
            // Here we didn't implement selection, so we export based on filters.
            // BUT, the Expense report export tool fetches "Expenses" DocType.
            // We need to fetch "Estimation" DocType.

            // Since we implemented 'Expense Report' style, let's just dump the current reportData if selection is not critical,
            // OR fetch properly from 'Estimation' doctype.
            // Let's implement robust export fetching from 'Estimation'.

            // Build filters for get_list
            const listFilters = [];
            if (customerName) listFilters.push(['customer_name', 'like', `%${customerName}%`]);
            if (fromDate) listFilters.push(['estimate_date', '>=', fromDate]);
            if (toDate) listFilters.push(['estimate_date', '<=', toDate]);

            const fieldsToFetch = selectedFields.length > 0 ? selectedFields : ['name', 'customer_name', 'estimate_date', 'total_qty', 'grand_total'];
            if (!fieldsToFetch.includes('name')) fieldsToFetch.push('name');

            const queryParams = new URLSearchParams({
                doctype: "Estimation",
                fields: JSON.stringify(fieldsToFetch),
                filters: JSON.stringify(listFilters),
                limit_page_length: "99999"
            });

            const res = await fetch(`/api/method/frappe.client.get_list?${queryParams.toString()}`, {
                method: 'GET',
                credentials: "include"
            });

            if (!res.ok) throw new Error("Failed to fetch data for export");

            const jsonResponse = await res.json();
            const data = jsonResponse.message || [];

            const worksheet = XLSX.utils.json_to_sheet(data);

            if (format === 'excel') {
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Estimations");
                XLSX.writeFile(workbook, "Estimation_Report.xlsx");
            } else {
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "Estimation_Report.csv");
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
            if (customerName) filters.customer_name = customerName;
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');

            const result = await runReport('Estimate Reports', filters);
            setReportData(result.result || []);
            setSummaryData(result.report_summary || []);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch estimation report:', error);
        } finally {
            setLoading(false);
        }
    }, [customerName, fromDate, toDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return (
        <DashboardContent>
            <Stack spacing={4} sx={{ mt: 3, mb: 5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">
                        Estimation Report
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
                                    placeholder="Customer Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Estimation ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Customer Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Total Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Grand Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.customer_name}</TableCell>
                                                <TableCell>{row.estimate_date ? new Date(row.estimate_date).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell>{row.total_qty}</TableCell>
                                                <TableCell>₹{row.grand_total?.toLocaleString() || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
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

            <ExportFieldsDialog
                open={openExportFields}
                onClose={() => setOpenExportFields(false)}
                doctype="Estimation"
                onExport={handleExport}
            />
        </DashboardContent>
    );
}

// ----------------------------------------------------------------------

function SummaryCard({ title, value, color, datatype }: { title: string; value: number; color: string; datatype?: string }) {
    const getIcon = () => {
        switch (title) {
            case 'Total Amount': return 'solar:wallet-money-bold-duotone';
            case 'Total Quantity': return 'solar:box-bold-duotone';
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
        case 'Blue': return '#2196F3';
        case 'Red': return '#F44336';
        case 'Orange': return '#FF9800';
        default: return '#2196F3';
    }
}
