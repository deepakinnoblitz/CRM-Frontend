import type dayjs from 'dayjs';

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

import { runReport } from 'src/api/reports';
import { getDoctypeList } from 'src/api/leads';
import { getTimesheet } from 'src/api/timesheets';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

import { TimesheetDetailsDialog } from '../timesheets-details-dialog';

// ----------------------------------------------------------------------

export function TimesheetsReportView() {
    const theme = useTheme();
    const { user } = useAuth();
    const isHR = user?.roles?.some(role => ['HR Manager', 'HR User', 'System Manager', 'Administrator'].includes(role));

    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
    const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
    const [employee, setEmployee] = useState('all');

    useEffect(() => {
        if (user && !isHR && user.employee) {
            setEmployee(user.employee);
        }
    }, [user, isHR]);
    const [project, setProject] = useState('all');
    const [activityType, setActivityType] = useState('all');
    const [sortBy, setSortBy] = useState('date_asc');

    // Options
    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
    const [projectOptions, setProjectOptions] = useState<any[]>([]);
    const [activityTypeOptions, setActivityTypeOptions] = useState<any[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Details Dialog
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleViewDetails = async (name: string) => {
        setLoadingDetails(true);
        try {
            const data = await getTimesheet(name);
            setSelectedTimesheet(data);
            setOpenDetails(true);
        } catch (error) {
            console.error('Failed to fetch timesheet details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = reportData.filter(d => d.timesheet_date !== 'TOTAL').map((n, index) => `${n.employee}-${index}`);
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
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');
            if (employee !== 'all') filters.employee = employee;
            if (project !== 'all') filters.project = project;
            if (activityType !== 'all') filters.activity_type = activityType;

            const result = await runReport('Timesheet Report', filters);
            let finalData = result.result || [];

            // Sort Data
            finalData = [...finalData].sort((a, b) => {
                const dateA = a.timesheet_date || '';
                const dateB = b.timesheet_date || '';
                const nameA = (a.employee_name || '').toLowerCase();
                const nameB = (b.employee_name || '').toLowerCase();

                if (dateA === 'TOTAL') return 1;
                if (dateB === 'TOTAL') return -1;

                switch (sortBy) {
                    case 'date_asc':
                        if (dateA !== dateB) return dateA.localeCompare(dateB);
                        return nameA.localeCompare(nameB);
                    case 'date_desc':
                        if (dateB !== dateA) return dateB.localeCompare(dateA);
                        return nameA.localeCompare(nameB);
                    case 'name_asc':
                        if (nameA !== nameB) return nameA.localeCompare(nameB);
                        return dateB.localeCompare(dateA);
                    case 'name_desc':
                        if (nameA !== nameB) return nameB.localeCompare(nameA);
                        return dateB.localeCompare(dateA);
                    default:
                        return 0;
                }
            });

            setReportData(finalData);
            setPage(0);
        } catch (error) {
            console.error('Failed to fetch timesheet report:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, employee, project, activityType, sortBy]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleReset = () => {
        setFromDate(null);
        setToDate(null);
        setEmployee('all');
        setProject('all');
        setActivityType('all');
        setSortBy('date_asc');
    };

    useEffect(() => {
        getDoctypeList('Employee', ['name', 'employee_name']).then(setEmployeeOptions);
        getDoctypeList('Project', ['name', 'project']).then(setProjectOptions);
        getDoctypeList('Activity Type', ['name', 'activity_type']).then(setActivityTypeOptions);
    }, []);

    const handleExport = () => {
        const dataToExport = reportData.filter(d => d.timesheet_date !== 'TOTAL');
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet Report");
        XLSX.writeFile(workbook, "Timesheet_Report.xlsx");
    };

    const onChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const totalHours = reportData.find(d => d.timesheet_date === 'TOTAL')?.hours || 0;
    const totalEntries = reportData.filter(d => d.timesheet_date !== 'TOTAL').length;

    return (
        <DashboardContent>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h4">Timesheet Report</Typography>
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
                        flexDirection: 'column',   // 🔥 make vertical
                        gap: 2,
                        bgcolor: 'background.neutral',
                        border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                >

                    {/* 🔹 Top Row – Filters */}
                    <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="From Date"
                                format="DD/MM/YYYY"
                                value={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
                            />
                            <DatePicker
                                label="To Date"
                                format="DD/MM/YYYY"
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
                            />
                        </LocalizationProvider>

                        {/* Employee */}
                        <Autocomplete
                            size="small"
                            sx={{ minWidth: 180 }}
                            options={[{ name: 'all', employee_name: 'All Employees' }, ...employeeOptions]}
                            getOptionLabel={(option) =>
                                option.name === 'all'
                                    ? option.employee_name
                                    : `${option.employee_name} (${option.name})`
                            }
                            value={
                                employee === 'all'
                                    ? { name: 'all', employee_name: 'All Employees' }
                                    : employeeOptions.find((opt) => opt.name === employee) || null
                            }
                            onChange={(event, newValue) => setEmployee(newValue?.name || 'all')}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ fontSize: '0.85rem' }}>
                                    {option.name === 'all'
                                        ? option.employee_name
                                        : `${option.employee_name} (${option.name})`}
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Employee" placeholder="Select Employee" />
                            )}
                        />

                        {/* Project */}
                        <Autocomplete
                            size="small"
                            sx={{ minWidth: 180 }}
                            options={[{ name: 'all', project: 'All Projects' }, ...projectOptions]}
                            getOptionLabel={(option) => option.project || ''}
                            value={
                                project === 'all'
                                    ? { name: 'all', project: 'All Projects' }
                                    : projectOptions.find((opt) => opt.name === project) || null
                            }
                            onChange={(event, newValue) => setProject(newValue?.name || 'all')}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ fontSize: '0.85rem' }}>
                                    {option.project}
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Project" placeholder="Select Project" />
                            )}
                        />

                        {/* Activity */}
                        <Autocomplete
                            size="small"
                            sx={{ minWidth: 170 }}
                            options={[{ name: 'all', activity_type: 'All Activities' }, ...activityTypeOptions]}
                            getOptionLabel={(option) => option.activity_type || ''}
                            value={
                                activityType === 'all'
                                    ? { name: 'all', activity_type: 'All Activities' }
                                    : activityTypeOptions.find((opt) => opt.name === activityType) || null
                            }
                            onChange={(event, newValue) => setActivityType(newValue?.name || 'all')}
                            renderOption={(props, option) => (
                                <Box component="li" {...props} sx={{ fontSize: '0.85rem' }}>
                                    {option.activity_type}
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Activity" placeholder="Select Activity" />
                            )}
                        />

                        {/* Sort */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <MenuItem value="date_asc" sx={{ fontSize: '0.85rem' }}>Date ↓ (Asc)</MenuItem>
                                <MenuItem value="date_desc" sx={{ fontSize: '0.85rem' }}>Date ↑ (Desc)</MenuItem>
                                <MenuItem value="name_asc" sx={{ fontSize: '0.85rem' }}>Name: A to Z</MenuItem>
                                <MenuItem value="name_desc" sx={{ fontSize: '0.85rem' }}>Name: Z to A</MenuItem>
                            </Select>
                        </FormControl>

                    </Stack>

                    {/* 🔹 Bottom Row – Export Button */}
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon={"solar:export-bold" as any} />}
                            onClick={handleExport}
                            sx={{
                                bgcolor: '#08a3cd',
                                color: 'common.white',
                                '&:hover': { bgcolor: '#068fb3' }, marginRight: 2, marginTop: 2
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
                        },
                    }}
                >
                    <SummaryCard item={{ label: 'Total Entries', value: totalEntries, indicator: 'blue' }} />
                    <SummaryCard item={{ label: 'Total Hours', value: totalHours, indicator: 'green', suffix: 'hrs' }} />
                </Box>

                <Card>
                    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                        <Scrollbar>
                            <Table size="medium" stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f4f6f8' }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < reportData.length - 1}
                                                checked={reportData.length > 1 && selected.length === reportData.length - 1}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Project</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Activity Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Description</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', position: 'sticky', right: 0, bgcolor: '#f4f6f8', zIndex: 11 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reportData
                                        .filter(d => d.timesheet_date !== 'TOTAL')
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            const rowId = `${row.employee}-${index}`;
                                            const isSelected = selected.indexOf(rowId) !== -1;
                                            return (
                                                <TableRow key={index} hover role="checkbox" aria-checked={isSelected} selected={isSelected}>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox checked={isSelected} onClick={(event) => handleClick(event, rowId)} />
                                                    </TableCell>
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.timesheet_date}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2">{row.employee_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{row.employee}</Typography>
                                                    </TableCell>
                                                    <TableCell>{row.project}</TableCell>
                                                    <TableCell>{row.activity_type}</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.hours} hrs</TableCell>
                                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {row.description}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                        <IconButton onClick={() => handleViewDetails(row.name)} sx={{ color: 'info.main' }}>
                                                            <Iconify icon={"solar:eye-bold" as any} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                    {/* Total Row */}
                                    {reportData.find(d => d.timesheet_date === 'TOTAL') && (
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.08) }}>
                                            <TableCell padding="checkbox" />
                                            <TableCell colSpan={4} sx={{ fontWeight: 'bold', color: 'success.main' }}>TOTAL</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>{totalHours} hrs</TableCell>
                                            <TableCell colSpan={2} />
                                        </TableRow>
                                    )}

                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
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
                        count={reportData.filter(d => d.timesheet_date !== 'TOTAL').length}
                        page={page}
                        onPageChange={onChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={onChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Card>
            </Stack>

            <TimesheetDetailsDialog
                open={openDetails}
                timesheet={selectedTimesheet}
                onClose={() => {
                    setOpenDetails(false);
                    setSelectedTimesheet(null);
                }}
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
        if (t.includes('hours')) return 'solar:clock-circle-bold-duotone';
        if (t.includes('entries')) return 'solar:list-bold-duotone';
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
