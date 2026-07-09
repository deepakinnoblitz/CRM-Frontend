import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
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
import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { generateInvoicePdf } from 'src/components/export/pdf/invoice-pdf-generator';

import { useAuth } from 'src/auth/auth-context';

import { ExportFieldsDialog } from '../../export-fields-dialog';


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

export function InvoiceReportView() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);

    const { exportingPdf, handleExportPdf } = usePdfExport();

    // Filters
    const [client, setClient] = useState<any>(null);
    const [account, setAccount] = useState<any>(null);
    const [clientOptions, setClientOptions] = useState<any[]>([]);
    const [accountOptions, setAccountOptions] = useState<any[]>([]);
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
    const [sortBy, setSortBy] = useState('modified_desc');

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Navigation
    const navigate = useNavigate();

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Export Fields Dialog
    const [openExportFields, setOpenExportFields] = useState(false);

    useEffect(() => {
        getDoctypeList('Contacts', ['name', 'first_name'])
            .then((data) => {
                setClientOptions(data || []);
            })
            .catch((error) => console.error('Failed to load Contacts for report:', error));

        getDoctypeList('Accounts', ['name', 'account_name'])
            .then((data) => {
                setAccountOptions(data || []);
            })
            .catch((error) => console.error('Failed to load Accounts for report:', error));
    }, []);

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
            const dataToExport = reportData.map((row) => {
                const filteredRow: any = {};
                selectedFields.forEach((field) => {
                    filteredRow[field] = row[field];
                });
                return filteredRow;
            });

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Invoices');

            if (format === 'excel') {
                XLSX.writeFile(wb, `Invoice_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
            } else {
                XLSX.writeFile(wb, `Invoice_Report_${dayjs().format('YYYYMMDD')}.csv`, { bookType: 'csv' });
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = {};
            if (client) filters.client_name = client.name;
            if (account) filters.billing_name = account.name;
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');
            if (user?.has_crm_permission) filters.owner = user.name;

            const result = await runReport('Invoice Report', filters);
            setReportData(result.result || []);
            setSummaryData(result.report_summary || []);
        } catch (error) {
            console.error('Failed to fetch invoice report:', error);
        } finally {
            setLoading(false);
        }
    }, [client, account, fromDate, toDate, user]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        setClient(null);
        setAccount(null);
        setSortBy('modified_desc');
    };

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
        if (sortBy === 'invoice_date_desc') {
            return dayjs(b.invoice_date).diff(dayjs(a.invoice_date));
        }
        if (sortBy === 'invoice_date_asc') {
            return dayjs(a.invoice_date).diff(dayjs(b.invoice_date));
        }
        return 0;
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <DashboardContent maxWidth={false}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Invoice Report</Typography>
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

                <Card sx={{ py: 2.2, px: 2, display: 'flex', columnGap: 2, rowGap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'background.neutral', border: (t) => `1px solid ${t.palette.divider}` }}>
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
                        sx={{ minWidth: 250 }}
                        options={clientOptions}
                        getOptionLabel={(option) => option ? `${option.first_name || ''} (${option.name || ''})` : ''}
                        value={client}
                        onChange={(event, newValue) => setClient(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Client"
                                placeholder="Search Client"
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
                                        {option.first_name || option.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        ID: {option.name}
                                    </Typography>
                                </Stack>
                            </li>
                        )}
                    />
                    <Autocomplete
                        size="small"
                        sx={{ minWidth: 250 }}
                        options={accountOptions}
                        getOptionLabel={(option) => option ? `${option.account_name || ''} (${option.name || ''})` : ''}
                        value={account}
                        onChange={(event, newValue) => setAccount(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Account"
                                placeholder="Search Account"
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
                                        {option.account_name || option.name}
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
                            <MenuItem value="invoice_date_desc">Invoice Date ↓ (Latest)</MenuItem>
                            <MenuItem value="invoice_date_asc">Invoice Date ↑ (Oldest)</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon={"solar:export-bold" as any} />}
                        onClick={() => setOpenExportFields(true)}
                        disabled={reportData.length === 0}
                        sx={{ mr: 1 }}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={exportingPdf ? undefined : <Iconify icon={"solar:file-download-bold" as any} />}
                        onClick={() => handleExportPdf(() => generateInvoicePdf({
                            reportData: filteredData,
                            selected,
                            summary: summaryData.length > 0 ? summaryData : [
                                { label: 'Total Invoices', value: reportData.length },
                                { label: 'Total Quantity', value: reportData.reduce((acc, curr) => acc + (curr.quantity || 0), 0) },
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
                    {summaryData.map((item) => (
                        <SummaryCard key={item.label} item={item} />
                    ))}
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Ref No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Client</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Company</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>Qty</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Price</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total Tax</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Grand Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                                                <CircularProgress sx={{ color: '#08a3cd' }} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredData
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((row, index) => {
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
                                                                        {row.customer_name || row.client_name || '-'}
                                                                    </Typography>
                                                                    {row.client_name && (
                                                                        <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                                                            {row.client_name}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell align="left" sx={{ maxWidth: 240 }}>
                                                                <Stack spacing={0.5}>
                                                                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                                                                        {row.company_name || row.billing_account_name || '-'}
                                                                    </Typography>
                                                                    {row.billing_name && (
                                                                        <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                                                            {row.billing_name}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            </TableCell>
                                                            <TableCell>{row.invoice_date ? dayjs(row.invoice_date).format('DD MMM YYYY') : '-'}</TableCell>
                                                            <TableCell align="center">{row.quantity}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>{renderCurrency(row.price, '16px')}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{renderCurrency(row.tax_amount, '16px')}</TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{renderCurrency(row.grand_total, '16px')}</TableCell>
                                                            <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                                <IconButton
                                                                    onClick={() => navigate(`/invoices/${encodeURIComponent(row.name)}/view`)}
                                                                    sx={{ color: 'info.main' }}
                                                                >
                                                                    <Iconify icon="solar:eye-bold" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}

                                            {reportData.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                                                        <Stack spacing={1} alignItems="center">
                                                            <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                                No data found
                                                            </Typography>
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
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>
            </Stack>

            <ExportFieldsDialog
                open={openExportFields}
                onClose={() => setOpenExportFields(false)}
                doctype="Invoice"
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
        if (label.includes('Amount')) return 'solar:wad-of-money-bold-duotone';
        if (label.includes('Quantity')) return 'solar:box-bold-duotone';
        if (label.includes('Records')) return 'solar:document-text-bold-duotone';
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

