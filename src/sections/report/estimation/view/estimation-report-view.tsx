import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
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
import { EstimationDetailsDialog } from '../../estimation-details-dialog';

// ----------------------------------------------------------------------

export function EstimationReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [customerName, setCustomerName] = useState('');
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Details
    const [openView, setOpenView] = useState(false);
    const [selectedEstimationId, setSelectedEstimationId] = useState<string | null>(null);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Export Fields Dialog
    const [openExportFields, setOpenExportFields] = useState(false);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = reportData.map((n) => n.name);
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
            if (customerName) filters.client_name = customerName;
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');

            console.log('Fetching Estimation Report with filters:', filters);

            const result = await runReport('Estimation Report', filters);
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

    const handleReset = () => {
        setCustomerName('');
        setFromDate(null);
        setToDate(null);
    };

    return (
        <DashboardContent>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">
                        Estimation Report
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon={"solar:refresh-bold" as any} />}
                            onClick={fetchReport}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Iconify icon="solar:restart-bold" />}
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Stack>

                <Card
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        bgcolor: 'background.neutral',
                        border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                >
                    <TextField
                        label="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Search customer..."
                        size="small"
                        sx={{ minWidth: 200 }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="From Date"
                            value={fromDate}
                            onChange={(newValue) => setFromDate(newValue)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                        <DatePicker
                            label="To Date"
                            value={toDate}
                            onChange={(newValue) => setToDate(newValue)}
                            slotProps={{ textField: { size: 'small' } }}
                        />
                    </LocalizationProvider>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon={"solar:export-bold" as any} />}
                        onClick={() => setOpenExportFields(true)}
                    >
                        Export
                    </Button>
                </Card>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                    }}
                >
                    {summaryData.map((item, index) => (
                        <SummaryCard key={index} item={item} />
                    ))}
                </Box>

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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Ref No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Customer</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Item</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Price</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Tax</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Subtotal</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Grand Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            const isSelected = selected.indexOf(row.name) !== -1;
                                            return (
                                                <TableRow key={index} hover role="checkbox" aria-checked={isSelected} selected={isSelected}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.name)} />
                                                    </TableCell>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.customer_name}</TableCell>
                                                    <TableCell>{row.estimate_date ? dayjs(row.estimate_date).format('DD MMM YYYY') : '-'}</TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.service}</TableCell>
                                                    <TableCell align="center">{row.quantity}</TableCell>
                                                    <TableCell align="right">₹{row.price?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right">₹{row.tax_amount?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right">₹{row.sub_total?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{row.grand_total?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                        <IconButton
                                                            onClick={() => {
                                                                setSelectedEstimationId(row.name);
                                                                setOpenView(true);
                                                            }}
                                                            sx={{ color: 'info.main' }}
                                                        >
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

            <EstimationDetailsDialog
                open={openView}
                estimationId={selectedEstimationId}
                onClose={() => {
                    setOpenView(false);
                    setSelectedEstimationId(null);
                }}
            />

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

function SummaryCard({ item }: { item: any }) {
    const theme = useTheme();

    const getIndicatorColor = (indicator: string) => {
        switch (indicator?.toLowerCase()) {
            case 'blue': return theme.palette.info.main;
            case 'green': return theme.palette.success.main;
            case 'orange': return theme.palette.warning.main;
            case 'red': return theme.palette.error.main;
            default: return theme.palette.primary.main;
        }
    };

    const getIcon = (label: string) => {
        const t = label.toLowerCase();
        if (t.includes('amount')) return 'solar:wad-of-money-bold-duotone';
        if (t.includes('quantity')) return 'solar:box-bold-duotone';
        if (t.includes('records')) return 'solar:document-text-bold-duotone';
        return 'solar:chart-2-bold-duotone';
    };

    const color = getIndicatorColor(item.indicator);

    return (
        <Card
            sx={{
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: alpha(color, 0.04),
                border: `1px solid ${alpha(color, 0.1)}`,
                transition: theme.transitions.create(['transform', 'box-shadow']),
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px -4px ${alpha(color, 0.12)}`,
                },
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2.5}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        color,
                        bgcolor: alpha(color, 0.1),
                    }}
                >
                    <Iconify icon={getIcon(item.label) as any} width={28} />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5 }}>
                        {item.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 800 }}>
                        {item.datatype === 'Currency'
                            ? `₹${item.value?.toLocaleString()}`
                            : item.value?.toLocaleString()}
                    </Typography>
                </Box>
            </Stack>

            <Box
                sx={{
                    top: -16,
                    right: -16,
                    width: 80,
                    height: 80,
                    opacity: 0.08,
                    position: 'absolute',
                    borderRadius: '50%',
                    bgcolor: color,
                }}
            />
        </Card>
    );
}
