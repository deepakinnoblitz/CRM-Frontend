import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { usePdfExport } from 'src/hooks/use-pdf-export';

import { fCurrency } from 'src/utils/format-number';

import { runReport } from 'src/api/reports';
import { getDoctypeList } from 'src/api/purchase';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { generatePurchasePdf } from 'src/components/export/pdf/purchase-pdf-generator';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

const renderCurrency = (amount: any, symbolFontSize: string = '15px') => {
  const formatted = fCurrency(amount);
  if (!formatted) return '—';
  const index = formatted.indexOf('₹');
  if (index !== -1) {
    return (
      <>
        {formatted.substring(0, index)}
        <span style={{ fontFamily: 'Arial', fontSize: symbolFontSize, display: 'inline-block', verticalAlign: 'baseline', lineHeight: 'normal' }}>₹</span>{' '}
        {formatted.substring(index + 1)}
      </>
    );
  }
  return formatted;
};

export function PurchaseReportView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<any[]>([]);

    const { exportingPdf, handleExportPdf } = usePdfExport();

    // Filters
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
    const [vendor, setVendor] = useState<any>(null);
    const [sortBy, setSortBy] = useState('modified_desc');

    // Options
    const [vendorOptions, setVendorOptions] = useState<{ name: string; first_name: string }[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);



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

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = selected.length > 0
                ? filteredData.filter((row: any) => selected.includes(row.name))
                : filteredData;

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Purchase Report');

            // Define sheet columns with headers
            sheet.columns = [
                { header: 'Purchase ID', key: 'purchase_id' },
                { header: 'Vendor', key: 'vendor' },
                { header: 'Bill No', key: 'bill_no' },
                { header: 'Bill Date', key: 'bill_date' },
                { header: 'Qty', key: 'qty' },
                { header: 'Grand Total', key: 'grand_total' }
            ];

            const colCount = sheet.columns.length;

            // Header Row Styling (Teal/blue fill FF0ea5e9, bold white font)
            for (let i = 1; i <= colCount; i++) {
                const cell = sheet.getRow(1).getCell(i);
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0ea5e9' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            sheet.getRow(1).height = 25;

            // Populate rows
            data.forEach((row: any) => {
                const vendorStr = row.vendor_real_name ? `${row.vendor_real_name} (${row.vendor_name || ''})` : (row.vendor_name || '-');
                sheet.addRow({
                    purchase_id: row.name || '-',
                    vendor: vendorStr,
                    bill_no: row.bill_no || '-',
                    bill_date: row.bill_date ? dayjs(row.bill_date).format('YYYY-MM-DD') : '-',
                    qty: row.quantity !== undefined ? row.quantity : 0,
                    grand_total: row.grand_total !== undefined ? row.grand_total : 0
                });
            });

            // Auto-fit column widths
            sheet.columns?.forEach((column: any) => {
                if (!column) return;
                let maxLen = 0;
                if (column.eachCell) {
                    column.eachCell({ includeEmpty: true }, (cell: any) => {
                        const value = cell.value ? String(cell.value) : '';
                        if (value.length > maxLen) {
                            maxLen = value.length;
                        }
                    });
                }
                column.width = Math.max(maxLen + 4, 12);
            });

            // Row styling (alternating row background, alignment and borders)
            sheet.eachRow((row: any, rowNumber: number) => {
                if (rowNumber > 1) {
                    for (let i = 1; i <= colCount; i++) {
                        const cell = row.getCell(i);
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        if (rowNumber % 2 === 0) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F8' } };
                        }
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        };
                    }
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `Purchase_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPurchase = useCallback((id: string) => {
        navigate(`/purchase/${encodeURIComponent(id)}`);
    }, [navigate]);

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
            if (vendor) filters.vendor = vendor.name;
            if (user?.has_crm_permission) filters.owner = user.name;

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
    }, [fromDate, toDate, vendor, user]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        setVendor(null);
        setSortBy('modified_desc');
    };

    useEffect(() => {
        getDoctypeList('Contacts', ['name', 'first_name'], { customer_type: 'Purchase' }).then((contacts: any[]) => {
            setVendorOptions(contacts);
        });
    }, []);

    const filteredData = [...reportData].sort((a, b) => {
        if (sortBy === 'creation_desc') {
            return dayjs(b.creation).diff(dayjs(a.creation));
        }
        if (sortBy === 'creation_asc') {
            return dayjs(a.creation).diff(dayjs(b.creation));
        }
        if (sortBy === 'modified_desc') {
            return dayjs(b.modified).diff(dayjs(a.modified));
        }
        if (sortBy === 'modified_asc') {
            return dayjs(a.modified).diff(dayjs(b.modified));
        }
        if (sortBy === 'purchase_date_desc') {
            return dayjs(b.bill_date).diff(dayjs(a.bill_date));
        }
        if (sortBy === 'purchase_date_asc') {
            return dayjs(a.bill_date).diff(dayjs(b.bill_date));
        }
        return 0;
    });

    return (
        <DashboardContent maxWidth={false} sx={{mt: 2}}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Purchase Report</Typography>
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
                        py: 2.5,
                        px: 2,
                        display: 'flex',
                        columnGap: 2,
                        rowGap: 1.5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        bgcolor: 'background.neutral',
                        border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="From Date"
                            format="DD-MM-YYYY"
                            value={fromDate}
                            onChange={(newValue) => setFromDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: { width: 190, '& .MuiInputBase-root': { height: 48, alignItems: 'center' } }
                                }
                            }}
                        />
                        <DatePicker
                            label="To Date"
                            format="DD-MM-YYYY"
                            value={toDate}
                            onChange={(newValue) => setToDate(newValue)}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    sx: { width: 190, '& .MuiInputBase-root': { height: 48, alignItems: 'center' } }
                                }
                            }}
                        />
                    </LocalizationProvider>
                    <Autocomplete
                        size="small"
                        sx={{ minWidth: 240 }}
                        options={vendorOptions}
                        getOptionLabel={(option) => option ? `${option.first_name} (${option.name})` : ''}
                        value={vendor}
                        onChange={(event, newValue) => setVendor(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search vendors..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: 'background.neutral',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    },
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props} key={option.name}>
                                <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        {option.first_name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        ID: {option.name}
                                    </Typography>
                                </Stack>
                            </li>
                        )}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            sx={{ height: 40 }}
                        >
                            <MenuItem value="creation_desc">Created ↓ (Latest)</MenuItem>
                            <MenuItem value="creation_asc">Created ↑ (Oldest)</MenuItem>
                            <MenuItem value="modified_desc">Modified ↓ (Latest)</MenuItem>
                            <MenuItem value="modified_asc">Modified ↑ (Oldest)</MenuItem>
                            <MenuItem value="purchase_date_desc">Purchase Date ↓ (Latest)</MenuItem>
                            <MenuItem value="purchase_date_asc">Purchase Date ↑ (Oldest)</MenuItem>
                        </Select>
                    </FormControl>
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
                        onClick={() => handleExportPdf(() => generatePurchasePdf({
                            reportData: filteredData,
                            selected,
                            summary: summaryData.length > 0 ? summaryData : [
                                { label: 'Total Purchase Bills', value: reportData.length },
                                { label: 'Sub Total Amount', value: reportData.reduce((acc, curr) => acc + (curr.sub_total || 0), 0) },
                                { label: 'Tax Amount', value: reportData.reduce((acc, curr) => acc + (curr.tax_amount || 0), 0) },
                                { label: 'Grand Total Amount', value: reportData.reduce((acc, curr) => acc + (curr.grand_total || 0), 0) }
                            ]
                        }))}
                        disabled={exportingPdf || reportData.length === 0}
                        sx={{
                            bgcolor: '#f43f5e',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#e11d48' },
                            height: 37,
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
                            <SummaryCard item={{ label: 'Total Purchase Amount', value: 0, indicator: 'blue', datatype: 'Currency' }} />
                            <SummaryCard item={{ label: 'Total Quantity Purchased', value: 0, indicator: 'green', datatype: 'Float' }} />
                            <SummaryCard item={{ label: 'Purchase Records', value: 0, indicator: 'orange' }} />
                        </>
                    )}
                </Box>

                <Card>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Scrollbar>
                            <Table
                                size="medium"
                                stickyHeader
                                sx={{ borderCollapse: 'collapse' }}
                            >
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Grand Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                <CircularProgress sx={{ color: '#08a3cd' }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                                                const isSelected = selected.indexOf(row.name) !== -1;
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
                                                            <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.name)} />
                                                        </TableCell>
                                                        <TableCell>{row.name}</TableCell>
                                                        <TableCell align="left" sx={{ maxWidth: 240 }}>
                                                            <Stack spacing={0.5}>
                                                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                                                                    {row.vendor_real_name || row.vendor_name || '-'}
                                                                </Typography>
                                                                {row.vendor_name && (
                                                                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                                                        {row.vendor_name}
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>{row.bill_no}</TableCell>
                                                        <TableCell>{row.bill_date ? dayjs(row.bill_date).format('DD MMM YYYY') : '-'}</TableCell>
                                                        <TableCell>{row.quantity}</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>{renderCurrency(row.grand_total, '16px')}</TableCell>
                                                        <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                            <IconButton onClick={() => handleViewPurchase(row.name)} sx={{ color: 'info.main' }}>
                                                                <Iconify icon="solar:eye-bold" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {reportData.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                        <Stack spacing={1} alignItems="center">
                                                            <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>No data found</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
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
                        {item.datatype === 'Currency' || (typeof item.value === 'number' && item.label.toLowerCase().includes('amount'))
                            ? renderCurrency(item.value, '24px')
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
