import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
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

import { usePdfExport } from 'src/hooks/use-pdf-export';

import { fCurrency } from 'src/utils/format-number';

import { runReport } from 'src/api/reports';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { generateInvoiceCollectionPdf } from 'src/components/export/pdf/invoice-collection-pdf-generator';

// ----------------------------------------------------------------------

export function InvoiceCollectionReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { exportingPdf, handleExportPdf } = usePdfExport();

    // Filters
    const [customer, setCustomer] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = reportData.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
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

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (customer) filters.customer = customer;
            if (invoiceNo) filters.invoice = invoiceNo;
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');

            const result = await runReport('Invoice & Collection Summary', filters);
            setReportData(result.result || []);
            setSummaryData(result.report_summary || []);
            setSelected([]);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch invoice collection report:', error);
        } finally {
            setLoading(false);
        }
    }, [customer, invoiceNo, fromDate, toDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setCustomer('');
        setInvoiceNo('');
        setFromDate(null);
        setToDate(null);
        setSelected([]);
    };

    const onChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice Collections");
        XLSX.writeFile(workbook, "Invoice_Collection_Report.xlsx");
    };

    return (
        <DashboardContent maxWidth={false} sx={{mt: 2}}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Invoice Collection Summary</Typography>
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
                        label="Customer"
                        value={customer}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomer(e.target.value)}
                        placeholder="Search customer..."
                        size="small"
                        sx={{ minWidth: 200 }}
                    />
                    <TextField
                        label="Invoice No"
                        value={invoiceNo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvoiceNo(e.target.value)}
                        placeholder="Search invoice..."
                        size="small"
                        sx={{ minWidth: 150 }}
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
                        onClick={handleExport}
                        disabled={reportData.length === 0}
                        sx={{ mr: 1 }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={exportingPdf ? undefined : <Iconify icon={"solar:file-download-bold" as any} />}
                        onClick={() => handleExportPdf(() => generateInvoiceCollectionPdf({
                            reportData,
                            summary: summaryData.length > 0 ? summaryData.map(s => ({
                                label: s.label,
                                value: s.value,
                                isCurrency: s.datatype === 'Currency'
                            })) : [
                                { label: 'Total Amount to Pay', value: reportData.reduce((acc, curr) => acc + (curr.amount_to_pay || 0), 0), isCurrency: true },
                                { label: 'Total Collected', value: reportData.reduce((acc, curr) => acc + (curr.amount_collected || 0), 0), isCurrency: true },
                                { label: 'Total Pending', value: reportData.reduce((acc, curr) => acc + (curr.amount_pending || 0), 0), isCurrency: true }
                            ]
                        }))}
                        disabled={exportingPdf || reportData.length === 0}
                        sx={{
                            bgcolor: '#f43f5e',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#e11d48' },
                            height: 40,
                            px: 3,
                        }}
                    >
                        {exportingPdf ? 'Exporting PDF...' : 'Export PDF'}
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
                    {summaryData.length === 0 && (
                        <>
                            <SummaryCard item={{ label: 'Total Amount to Pay', value: 0, indicator: 'blue', datatype: 'Currency' }} />
                            <SummaryCard item={{ label: 'Total Collected', value: 0, indicator: 'green', datatype: 'Currency' }} />
                            <SummaryCard item={{ label: 'Total Pending', value: 0, indicator: 'red', datatype: 'Currency' }} />
                        </>
                    )}
                </Box>

                <Card>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Scrollbar>
                            <Table size="medium" stickyHeader sx={{ borderCollapse: 'collapse' }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f4f6f8' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < reportData.length}
                                                checked={reportData.length > 0 && selected.length === reportData.length}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Invoice No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Mode</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Amount to Pay</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Pending</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                        const isSelected = selected.indexOf(row.id) !== -1;
                                        return (
                                            <TableRow 
                                                key={index} 
                                                hover
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                selected={isSelected}
                                                sx={{
                                                    '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                                                    '&:last-child td, &:last-child th': { borderBottom: 0 },
                                                }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.id)} />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{row.invoice}</TableCell>
                                                <TableCell>{row.collection_date ? dayjs(row.collection_date).format('DD MMM YYYY') : '-'}</TableCell>
                                                <TableCell>{row.mode_of_payment || '-'}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{fCurrency(row.amount_to_pay)}</TableCell>
                                                <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{fCurrency(row.amount_collected)}</TableCell>
                                                <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{fCurrency(row.amount_pending)}</TableCell>
                                                <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                    <IconButton
                                                        onClick={() => navigate(`/invoice-collections/${encodeURIComponent(row.id)}/view`)}
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
                                            <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                                <Stack spacing={1} alignItems="center">
                                                    <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>No invoice collections found</Typography>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={reportData.length}
                        page={page}
                        onPageChange={onChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50]}
                    />
                </Card>
            </Stack>
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
        if (t.includes('collected')) return 'solar:wallet-money-bold-duotone';
        if (t.includes('pending')) return 'solar:card-search-bold-duotone';
        return 'solar:bill-list-bold-duotone';
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
                        {item.datatype === 'Currency' ? fCurrency(item.value) : item.value?.toLocaleString()}
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
