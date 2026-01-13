import * as XLSX from 'xlsx';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { runReport } from 'src/api/reports';
import { getDoctypeList } from 'src/api/purchase';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ExportFieldsDialog } from '../../export-fields-dialog';
import { PurchaseDetailsDialog } from '../../purchase-details-dialog';

// ----------------------------------------------------------------------

export function PurchaseReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<any[]>([]);

    // Filters
    const [fromDate, setFromDate] = useState<any>(null);
    const [toDate, setToDate] = useState<any>(null);
    const [vendor, setVendor] = useState('all');

    // Options
    const [vendorOptions, setVendorOptions] = useState<string[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Details
    const [openView, setOpenView] = useState(false);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

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

    // Export Fields Dialog
    const [openExportFields, setOpenExportFields] = useState(false);

    const handleExport = async (selectedFields: string[], format: 'excel' | 'csv') => {
        setLoading(true);
        try {
            const filters: any[] = [];
            if (selected.length > 0) {
                filters.push(['Purchase', 'name', 'in', selected]);
            } else {
                if (fromDate) filters.push(['Purchase', 'bill_date', '>=', fromDate.format('YYYY-MM-DD')]);
                if (toDate) filters.push(['Purchase', 'bill_date', '<=', toDate.format('YYYY-MM-DD')]);
                if (vendor !== 'all') filters.push(['Purchase', 'vendor_name', '=', vendor]);
            }

            const query = new URLSearchParams({
                doctype: "Purchase",
                fields: JSON.stringify(selectedFields),
                filters: JSON.stringify(filters),
                limit_page_length: "99999",
            });

            const res = await fetch(`/api/method/frappe.client.get_list?${query.toString()}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch data for export");
            const data = (await res.json()).message || [];

            const worksheet = XLSX.utils.json_to_sheet(data);
            if (format === 'excel') {
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
                XLSX.writeFile(workbook, "Purchase_Report.xlsx");
            } else {
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "Purchase_Report.csv");
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

    const handleViewPurchase = useCallback((id: string) => {
        setSelectedPurchaseId(id);
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
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');
            if (vendor !== 'all') filters.vendor = vendor;

            console.log('Fetching Purchase Report with filters:', filters);
            const result = await runReport('Purchase Report', filters);
            console.log('Purchase Report Result Received:', result);

            if (result && result.result) {
                setReportData(result.result || []);
                setSummaryData(result.report_summary || []);
            } else if (Array.isArray(result)) {
                // Some versions return the array directly if it's a simple report call
                setReportData(result);
            } else {
                setReportData([]);
                setSummaryData([]);
            }
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch purchase report:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, vendor]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    useEffect(() => {
        getDoctypeList('Contacts', ['first_name']).then((contacts: any[]) => {
            const names = contacts.map(c => c.first_name).filter(Boolean);
            setVendorOptions(Array.from(new Set(names)));
        });
    }, []);

    return (
        <DashboardContent>
            <Stack spacing={4} sx={{ mt: 3, mb: 5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Purchase Report</Typography>
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
                    <Card sx={{ p: 2.5, boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)' }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
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
                            <FormControl fullWidth size="small">
                                <Select
                                    value={vendor}
                                    onChange={(e) => setVendor(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="all">All Vendors</MenuItem>
                                    {vendorOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Card>
                </LocalizationProvider>

                {/* Summary Stats */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ py: 2 }}>
                    {summaryData.map((item, index) => (
                        <SummaryCard key={index} title={item.label} value={item.value} color={item.indicator === 'blue' ? "#2196F3" : item.indicator === 'green' ? "#4CAF50" : "#FF9800"} />
                    ))}
                    {summaryData.length === 0 && (
                        <>
                            <SummaryCard title="Total Purchase Amount" value={0} color="#2196F3" />
                            <SummaryCard title="Total Quantity Purchased" value={0} color="#4CAF50" />
                            <SummaryCard title="Purchase Records" value={0} color="#FF9800" />
                        </>
                    )}
                </Stack>

                {/* Data Table */}
                <Card sx={{ boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)' }}>
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Purchase ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Vendor</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Bill No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Bill Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Grand Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                        const isSelected = selected.indexOf(row.name) !== -1;
                                        return (
                                            <TableRow key={index} hover role="checkbox" aria-checked={isSelected} selected={isSelected}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.name)} />
                                                </TableCell>
                                                <TableCell>{row.name}</TableCell>
                                                <TableCell>{row.vendor_name}</TableCell>
                                                <TableCell>{row.bill_no}</TableCell>
                                                <TableCell>{row.bill_date}</TableCell>
                                                <TableCell>{row.service}</TableCell>
                                                <TableCell>{row.quantity}</TableCell>
                                                <TableCell>{row.grand_total}</TableCell>
                                                <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                    <IconButton onClick={() => handleViewPurchase(row.name)} sx={{ color: 'info.main' }}>
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
                                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>No data found</Typography>
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

            <PurchaseDetailsDialog
                open={openView}
                purchaseId={selectedPurchaseId}
                onClose={() => {
                    setOpenView(false);
                    setSelectedPurchaseId(null);
                }}
            />

            <ExportFieldsDialog
                open={openExportFields}
                onClose={() => setOpenExportFields(false)}
                doctype="Purchase"
                onExport={handleExport}
            />
        </DashboardContent>
    );
}

function SummaryCard({ title, value, color }: { title: string; value: number | string; color: string }) {
    const getIcon = () => {
        if (title.toLowerCase().includes('amount')) return 'solar:wad-of-money-bold-duotone';
        if (title.toLowerCase().includes('quantity')) return 'solar:box-bold-duotone';
        return 'solar:bill-list-bold-duotone';
    };

    return (
        <Card sx={{ py: 2.5, px: 3, width: { xs: 1, sm: 220 }, boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)', borderRadius: 2, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: color } }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 48, height: 48, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}15`, flexShrink: 0 }}>
                    <Iconify icon={getIcon() as any} width={24} sx={{ color }} />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 800, mb: 0.25 }}>{value}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8125rem' }}>{title}</Typography>
                </Box>
            </Stack>
        </Card>
    );
}
