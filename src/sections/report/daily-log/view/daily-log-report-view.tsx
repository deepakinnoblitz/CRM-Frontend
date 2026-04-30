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
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { fDate } from 'src/utils/format-time';

import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';
import { fetchDetailedSessions } from 'src/api/presence-log';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

import { EmployeeDailyLogDetailsDialog } from '../../../overview/employee-daily-log-details-dialog';

// ----------------------------------------------------------------------

export function DailyLogReportView() {
    const theme = useTheme();
    const { user } = useAuth();

    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isHR, setIsHR] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
    const [employee, setEmployee] = useState('all');
    const [status, setStatus] = useState('all');
    const [sortBy, setSortBy] = useState('login_date_desc');
    const [day, setDay] = useState('all');

    // Options
    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Details Dialog
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);

    useEffect(() => {
        if (user && user.roles) {
            const hrRoles = ['HR Manager', 'HR', 'System Manager', 'Administrator'];
            const hasHRRole = user.roles.some((role: string) => hrRoles.includes(role));
            setIsHR(hasHRRole);
            if (!hasHRRole && user.employee) {
                setEmployee(user.employee);
            }
        }
    }, [user]);

    useEffect(() => {
        getDoctypeList('Employee', ['name', 'employee_name']).then(setEmployeeOptions);
    }, []);

    const fetchReport = useCallback(async () => {
        // We fetch a larger limit for the report view, or implement proper backend pagination if needed.
        // For now, let's fetch up to 1000 records if dates are selected.
        setLoading(true);
        try {
            const result = await fetchDetailedSessions(
                0,
                1000,
                '',
                status,
                sortBy,
                employee,
                day,
                '',
                fromDate?.format('YYYY-MM-DD') || '',
                toDate?.format('YYYY-MM-DD') || ''
            );
            setReportData(result.data || []);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch daily log report:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, employee, status, sortBy, day]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        if (isHR) {
            setEmployee('all');
        } else if (user?.employee) {
            setEmployee(user.employee);
        }
        setStatus('all');
        setDay('all');
        setSortBy('login_date_desc');
    };

    const handleExport = () => {
        const exportData = reportData.map((row) => ({
            Employee: row.employee_name,
            ID: row.employee,
            Date: fDate(row.login_date, 'DD-MM-YYYY'),
            Login: row.login_time ? dayjs(row.login_time).format('HH:mm:ss') : '---',
            Logout: row.logout_time ? dayjs(row.logout_time).format('HH:mm:ss') : '---',
            'Working Hours': row.total_work_hours?.toFixed(2) || '0.00',
            'Break Hours': row.total_break_hours?.toFixed(2) || '0.00',
            Status: row.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Log Report");
        XLSX.writeFile(workbook, "Daily_Log_Report.xlsx");
    };

    const handleViewDetails = (session: any) => {
        setSelectedSession(session);
        setOpenDetails(true);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = reportData.map((n) => n.name);
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

    // Summary stats
    const totalSessions = reportData.length;
    const totalWorkHours = reportData.reduce((acc, curr) => acc + (curr.total_work_hours || 0), 0);
    const totalBreakHours = reportData.reduce((acc, curr) => acc + (curr.total_break_hours || 0), 0);
    const activeSessions = reportData.filter(d => d.status === 'Active').length;
    const inactiveSessions = reportData.filter(d => d.status === 'Inactive').length;

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Employee Daily Log Report</Typography>
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
                            startIcon={<Iconify icon={"solar:restart-bold" as any} />}
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
                        flexDirection: 'column',
                        gap: 2,
                        bgcolor: 'background.neutral',
                        border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                >
                    <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="From Date"
                                format="DD-MM-YYYY"
                                value={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 170 } } }}
                            />
                            <DatePicker
                                label="To Date"
                                format="DD-MM-YYYY"
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 170 } } }}
                            />
                        </LocalizationProvider>

                    <Autocomplete
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        options={[{ name: 'all', employee_name: 'All Employees' }, ...employeeOptions]}
                        getOptionLabel={(option) => option.name === 'all' ? option.employee_name : `${option.employee_name} (${option.name})`}
                        value={employee === 'all' ? { name: 'all', employee_name: 'All Employees' } : (employeeOptions.find((opt) => opt.name === employee) || null)}
                        onChange={(event, newValue) => {
                            setEmployee(newValue?.name || 'all');
                        }}
                        disabled={!isHR}
                        renderOption={(props, option) => (
                            <li {...props} key={option.name}>
                                {option.name === 'all' ? (
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                        {option.employee_name}
                                    </Typography>
                                ) : (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                            {option.employee_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                                            ID: {option.name}
                                        </Typography>
                                    </Box>
                                )}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Employee"
                                placeholder="Select Employee"
                            />
                        )}
                    />

                    <FormControl size="small" sx={{ flexGrow: 1, minWidth: 140 }}>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flexGrow: 1, minWidth: 140 }}>
                        <Select
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">All Days</MenuItem>
                            <MenuItem value="Monday">Monday</MenuItem>
                            <MenuItem value="Tuesday">Tuesday</MenuItem>
                            <MenuItem value="Wednesday">Wednesday</MenuItem>
                            <MenuItem value="Thursday">Thursday</MenuItem>
                            <MenuItem value="Friday">Friday</MenuItem>
                            <MenuItem value="Saturday">Saturday</MenuItem>
                            <MenuItem value="Sunday">Sunday</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ flexGrow: 1, minWidth: 180 }}>
                        <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <MenuItem value="login_date_desc">Date ↓ (Latest)</MenuItem>
                            <MenuItem value="login_date_asc">Date ↑ (Oldest)</MenuItem>
                            <MenuItem value="working_hours_desc">Working Hrs: High to Low</MenuItem>
                            <MenuItem value="working_hours_asc">Working Hrs: Low to High</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="contained"
                        startIcon={<Iconify icon={"solar:export-bold" as any} />}
                        onClick={handleExport}
                        sx={{
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' },
                            height: 40,
                            px: 3,
                            ml: { md: 'auto' }
                        }}
                    >
                        Export
                    </Button>
                </Stack>
            </Card>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: {
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(5, 1fr)',
                        },
                    }}
                >
                    <SummaryCard item={{ label: 'Total Days', value: totalSessions, indicator: 'blue' }} />
                    <SummaryCard item={{ label: 'Work Hours', value: totalWorkHours.toFixed(1), suffix: 'Hrs', indicator: 'green' }} />
                    <SummaryCard item={{ label: 'Break Hours', value: totalBreakHours.toFixed(1), suffix: 'Hrs', indicator: 'orange' }} />
                    <SummaryCard item={{ label: 'Active', value: activeSessions, indicator: 'green' }} />
                    <SummaryCard item={{ label: 'Inactive', value: inactiveSessions, indicator: 'red' }} />
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Login</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Logout</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Work Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Break Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData
                                        .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                                        .map((row, index) => {
                                            const isSelected = selected.indexOf(row.name) !== -1;
                                            return (
                                                <TableRow
                                                    key={row.name}
                                                    hover
                                                    selected={isSelected}
                                                    sx={{
                                                        '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                                                        '&:last-child td, &:last-child th': { borderBottom: 0 },
                                                    }}
                                                >
                                                    <TableCell padding="checkbox">
                                                        <Checkbox checked={isSelected} onClick={(event) => handleClick(event, row.name)} />
                                                    </TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.login_date, 'DD-MM-YYYY')}</TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <Typography variant="subtitle2">{row.employee_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{row.employee}</Typography>
                                                    </TableCell>
                                                    <TableCell>{row.login_time ? dayjs(row.login_time).format('HH:mm:ss') : '---'}</TableCell>
                                                    <TableCell>{row.logout_time ? dayjs(row.logout_time).format('HH:mm:ss') : '---'}</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.total_work_hours?.toFixed(2) || '0.00'} Hrs</TableCell>
                                                    <TableCell>{row.total_break_hours?.toFixed(2) || '0.00'} Hrs</TableCell>
                                                    <TableCell>
                                                        <Label color={row.status === 'Active' ? 'success' : 'error'} variant="soft">
                                                            {row.status}
                                                        </Label>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper' }}>
                                                        <IconButton onClick={() => handleViewDetails(row)} sx={{ color: 'info.main' }}>
                                                            <Iconify icon={"solar:eye-bold" as any} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                                                <Stack spacing={1} alignItems="center">
                                                    <Iconify icon={"solar:filter-bold-duotone" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                    <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                                                        No data found
                                                    </Typography>
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
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[10, 25, 50]}
                    />
                </Card>
            </Stack>

            <EmployeeDailyLogDetailsDialog
                open={openDetails}
                onClose={() => {
                    setOpenDetails(false);
                    setSelectedSession(null);
                }}
                session={selectedSession}
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
        if (t.includes('work')) return 'solar:clock-circle-bold-duotone';
        if (t.includes('break')) return 'solar:cup-hot-bold-duotone';
        if (t.includes('active')) return 'solar:check-circle-bold-duotone';
        if (t.includes('inactive')) return 'solar:danger-circle-bold-duotone';
        if (t.includes('days')) return 'solar:calendar-date-bold-duotone';
        if (t.includes('sessions')) return 'solar:list-bold-duotone';
        return 'solar:chart-2-bold-duotone';
    };

    const color = getIndicatorColor(item.indicator);

    return (
        <Card
            sx={{
                p: 1.5,
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
            <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        display: 'flex',
                        borderRadius: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        color,
                        bgcolor: alpha(color, 0.1),
                    }}
                >
                    <Iconify icon={getIcon(item.label) as any} width={18} />
                </Box>

                <Box sx={{ flexGrow: 1, pl: 1, }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.2 }}>
                        {item.label}
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 800 }}>
                        {item.value?.toLocaleString()}{item.suffix ? ` ${item.suffix}` : ''}
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
