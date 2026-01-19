import dayjs from 'dayjs';
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
import { alpha, useTheme } from '@mui/material/styles';
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

import { LeadDetailsDialog } from '../lead-details-dialog';
import { ExportFieldsDialog } from '../export-fields-dialog';

// ----------------------------------------------------------------------

export function LeadReportView() {
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
    const [leadsType, setLeadsType] = useState('all');
    const [leadsFrom, setLeadsFrom] = useState('all');
    const [owner, setOwner] = useState('all');

    // Options
    const [leadsFromOptions, setLeadsFromOptions] = useState<string[]>([]);
    const [ownerOptions, setOwnerOptions] = useState<string[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Details
    const [openView, setOpenView] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

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
            // Construct filters for get_list
            const filters: any[] = [];

            if (selected.length > 0) {
                filters.push(['Lead', 'name', 'in', selected]);
            } else {
                // Replicate report filters
                if (fromDate) filters.push(['Lead', 'creation', '>=', fromDate.format('YYYY-MM-DD')]);
                if (toDate) filters.push(['Lead', 'creation', '<=', toDate.format('YYYY-MM-DD')]);
                if (leadsType !== 'all') filters.push(['Lead', 'leads_type', '=', leadsType]);
                if (leadsFrom !== 'all') filters.push(['Lead', 'leads_from', '=', leadsFrom]);
                if (owner !== 'all') {
                    if (owner === 'empty') filters.push(['Lead', 'owner', '=', '']);
                    else filters.push(['Lead', 'owner', '=', owner]);
                }
            }

            // Build query params
            const query = new URLSearchParams({
                doctype: "Lead",
                fields: JSON.stringify(selectedFields),
                filters: JSON.stringify(filters),
                limit_page_length: "99999", // Fetch all
            });

            const res = await fetch(`/api/method/frappe.client.get_list?${query.toString()}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch data for export");
            const data = (await res.json()).message || [];

            // Export
            const worksheet = XLSX.utils.json_to_sheet(data);

            if (format === 'excel') {
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
                XLSX.writeFile(workbook, "Lead_Report.xlsx");
            } else {
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "Lead_Report.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

        } catch (error) {
            console.error(error);
            // Maybe show a snackbar error?
        } finally {
            setLoading(false);
        }
    };

    const handleViewLead = useCallback((id: string) => {
        setSelectedLeadId(id);
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
            if (leadsType !== 'all') filters.leads_type = leadsType;
            if (leadsFrom !== 'all') filters.leads_from = leadsFrom;
            if (owner !== 'all') filters.owner = owner;

            const result = await runReport('Lead', filters);
            setReportData(result.result || []);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch lead report:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, leadsType, leadsFrom, owner]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        setLeadsType('all');
        setLeadsFrom('all');
        setOwner('all');
    };

    useEffect(() => {
        getDoctypeList('Lead From').then(setLeadsFromOptions);
        getDoctypeList('User').then(setOwnerOptions);
    }, []);

    const totalLeads = reportData.length;
    const incomingLeads = reportData.filter((l: any) => l.leads_type === 'Incoming').length;
    const outgoingLeads = reportData.filter((l: any) => l.leads_type === 'Outgoing').length;

    return (
        <DashboardContent>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Lead Report</Typography>
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
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={leadsType}
                            onChange={(e) => setLeadsType(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">Leads Type</MenuItem>
                            <MenuItem value="Incoming">Incoming</MenuItem>
                            <MenuItem value="Outgoing">Outgoing</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={leadsFrom}
                            onChange={(e) => setLeadsFrom(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">Leads From</MenuItem>
                            {leadsFromOptions.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">Owner</MenuItem>
                            <MenuItem value="Administrator">Administrator</MenuItem>
                            <MenuItem value="empty">Empty</MenuItem>
                            {ownerOptions
                                .filter((opt) => opt !== 'Administrator')
                                .map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
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
                    <SummaryCard item={{ label: 'Total Leads', value: totalLeads, indicator: 'blue' }} />
                    <SummaryCard item={{ label: 'Incoming Leads', value: incomingLeads, indicator: 'green' }} />
                    <SummaryCard item={{ label: 'Outgoing Leads', value: outgoingLeads, indicator: 'orange' }} />
                </Box>

                <Card>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Scrollbar>
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Lead Name</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Company</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Phone</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Service</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Leads Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Leads From</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Owner</TableCell>
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
                                                <TableCell sx={{ fontWeight: 600 }}>{row.lead_name}</TableCell>
                                                <TableCell>{row.company_name}</TableCell>
                                                <TableCell>{row.phone_number}</TableCell>
                                                <TableCell>{row.email}</TableCell>
                                                <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.service}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            display: 'inline-flex',
                                                            typography: 'caption',
                                                            fontWeight: 'bold',
                                                            bgcolor: alpha(row.leads_type === 'Incoming' ? '#4CAF50' : '#FF9800', 0.1),
                                                            color: row.leads_type === 'Incoming' ? '#4CAF50' : '#FF9800',
                                                        }}
                                                    >
                                                        {row.leads_type}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{row.leads_from}</TableCell>
                                                <TableCell>{row.owner_name}</TableCell>
                                                <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                    <IconButton onClick={() => handleViewLead(row.name)} sx={{ color: 'info.main' }}>
                                                        <Iconify icon="solar:eye-bold" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                                                <Stack spacing={1} alignItems="center">
                                                    <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.disabled' }}>No data found</Typography>
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
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Card>
            </Stack>

            <LeadDetailsDialog
                open={openView}
                leadId={selectedLeadId}
                onClose={() => {
                    setOpenView(false);
                    setSelectedLeadId(null);
                }}
            />

            <ExportFieldsDialog
                open={openExportFields}
                onClose={() => setOpenExportFields(false)}
                doctype="Lead"
                onExport={handleExport}
            />
        </DashboardContent >
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
        if (t.includes('total')) return 'solar:target-bold-duotone';
        if (t.includes('incoming')) return 'solar:inbox-in-bold-duotone';
        if (t.includes('outgoing')) return 'solar:inbox-out-bold-duotone';
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
                        {item.value?.toLocaleString()}
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
