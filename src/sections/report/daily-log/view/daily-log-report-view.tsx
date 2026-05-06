import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
import { useSnackbar } from 'notistack';
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
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [isHR, setIsHR] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

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

    const handleExport = async () => {
        setExportingExcel(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Daily Log Report');
            const detailSheet = workbook.addWorksheet('Detailed Timing');

            // Selection Logic
            const exportData = selected.length > 0
                ? reportData.filter(d => selected.includes(d.name))
                : reportData;

            // --- MAIN SHEET SETUP ---
            mainSheet.columns = [
                { header: 'Employee', key: 'employee_name', width: 25 },
                { header: 'Employee ID', key: 'employee', width: 15 },
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Login Time', key: 'login', width: 15 },
                { header: 'Logout Time', key: 'logout', width: 15 },
                { header: 'Work Hours', key: 'work_hours', width: 15 },
                { header: 'Break Hours', key: 'break_hours', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
            ];

            const mainColCount = mainSheet.columns.length;
            for (let i = 1; i <= mainColCount; i++) {
                const cell = mainSheet.getRow(1).getCell(i);
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0ea5e9' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            mainSheet.getRow(1).height = 25;

            exportData.forEach((row) => {
                const excelRow = mainSheet.addRow({
                    employee_name: row.employee_name,
                    employee: row.employee,
                    date: fDate(row.login_date, 'DD-MM-YYYY'),
                    login: row.login_time ? dayjs(row.login_time).format('HH:mm:ss') : '---',
                    logout: row.logout_time ? dayjs(row.logout_time).format('HH:mm:ss') : '---',
                    work_hours: row.total_work_hours?.toFixed(2) || '0.00',
                    break_hours: row.total_break_hours?.toFixed(2) || '0.00',
                    status: row.status
                });

                const statusCell = excelRow.getCell('status');
                if (row.status === 'Active') {
                    statusCell.font = { color: { argb: 'FF22C55E' }, bold: true };
                } else {
                    statusCell.font = { color: { argb: 'FFEF4444' }, bold: true };
                }
            });

            // Merging logic for Employee and Date
            let mergeStart = 2;
            const totalRows = mainSheet.rowCount;
            for (let i = 2; i <= totalRows; i++) {
                const current = mainSheet.getRow(i);
                const next = i < totalRows ? mainSheet.getRow(i + 1) : null;

                const isLast = i === totalRows;
                const sameAsNext = !isLast && next &&
                    current.getCell(1).value === next.getCell(1).value &&
                    current.getCell(2).value === next.getCell(2).value &&
                    current.getCell(3).value === next.getCell(3).value;

                if (!sameAsNext) {
                    if (i > mergeStart) {
                        mainSheet.mergeCells(`A${mergeStart}:A${i}`);
                        mainSheet.mergeCells(`B${mergeStart}:B${i}`);
                        mainSheet.mergeCells(`C${mergeStart}:C${i}`);

                        ['A', 'B', 'C'].forEach(col => {
                            mainSheet.getCell(`${col}${mergeStart}`).alignment = { vertical: 'middle', horizontal: 'center' };
                        });
                    }
                    mergeStart = i + 1;
                }
            }

            mainSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    for (let i = 1; i <= mainColCount; i++) {
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

            // --- DETAIL SHEET SETUP ---
            detailSheet.columns = [
                { header: 'Employee', key: 'employee', width: 25 },
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Type', key: 'type', width: 15 },
                { header: 'Start Time', key: 'start', width: 15 },
                { header: 'End Time', key: 'end', width: 15 },
                { header: 'Duration', key: 'duration', width: 15 },
                { header: 'Details / Reason', key: 'details', width: 30 },
            ];

            const detailColCount = detailSheet.columns.length;
            for (let i = 1; i <= detailColCount; i++) {
                const cell = detailSheet.getRow(1).getCell(i);
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0ea5e9' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            detailSheet.getRow(1).height = 25;

            exportData.forEach((session) => {
                // 1. Add Session Summary Header for this employee
                detailSheet.addRow({
                    employee: session.employee_name,
                    date: fDate(session.login_date, 'DD-MM-YYYY'),
                    type: 'SESSION',
                    start: session.login_time ? dayjs(session.login_time).format('HH:mm:ss') : '---',
                    end: session.logout_time ? dayjs(session.logout_time).format('HH:mm:ss') : 'Active',
                    duration: `${session.total_work_hours?.toFixed(2) || '0.00'} Hrs`,
                    details: `Total Break: ${session.total_break_hours?.toFixed(2) || '0.00'} Hrs`
                }).font = { bold: true };

                // 2. Add Intervals
                (session.intervals || []).forEach((int: any) => {
                    detailSheet.addRow({
                        employee: '',
                        date: '',
                        type: 'Activity',
                        start: int.from_time ? dayjs(int.from_time).format('HH:mm:ss') : '---',
                        end: int.to_time ? dayjs(int.to_time).format('HH:mm:ss') : 'Current',
                        duration: int.duration_seconds ? `${Math.floor(int.duration_seconds / 60)}m ${int.duration_seconds % 60}s` : '---',
                        details: int.status || 'Available'
                    });
                });

                // 3. Add Breaks
                (session.breaks || []).forEach((brk: any) => {
                    detailSheet.addRow({
                        employee: '',
                        date: '',
                        type: 'BREAK',
                        start: brk.break_start ? dayjs(brk.break_start).format('HH:mm:ss') : '---',
                        end: brk.break_end ? dayjs(brk.break_end).format('HH:mm:ss') : 'Current',
                        duration: `${brk.break_duration?.toFixed(1) || '0'} mins`,
                        details: brk.reason || brk.source || 'Manual Break'
                    }).font = { italic: true, color: { argb: 'FFD97706' } };
                });

                // Add an empty row for spacing between sessions
                detailSheet.addRow([]);
            });

            // Styling for detail sheet
            detailSheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1 && row.getCell(3).value) { // only for rows with data
                    for (let i = 1; i <= detailColCount; i++) {
                        const cell = row.getCell(i);
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
            saveAs(new Blob([buffer]), `Daily_Log_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
            enqueueSnackbar('Excel exported successfully!', { variant: 'success' });
        } catch (error) {
            console.error('Excel export failed:', error);
            enqueueSnackbar('Excel export failed!', { variant: 'error' });
        } finally {
            setExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const doc = new jsPDF('landscape');

            // Selection Logic
            const exportData = selected.length > 0
                ? reportData.filter(d => selected.includes(d.name))
                : reportData;

            if (exportData.length === 0) {
                enqueueSnackbar('No data to export', { variant: 'warning' });
                setExportingPdf(false);
                return;
            }

            // --- PAGE 1: DAILY LOG REPORT ---
            doc.setFontSize(22);
            doc.setTextColor(14, 165, 233);
            doc.setFont('helvetica', 'bold');
            doc.text('Daily Log Report', 14, 20);

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, h:mm A')}`, 14, 27);

            // Accent line
            doc.setDrawColor(14, 165, 233);
            doc.setLineWidth(0.5);
            doc.line(14, 32, 196, 32);

            const mainBody = exportData.map(row => [
                row.employee_name,
                row.employee,
                fDate(row.login_date, 'DD-MM-YYYY'),
                row.login_time ? dayjs(row.login_time).format('HH:mm:ss') : '---',
                row.logout_time ? dayjs(row.logout_time).format('HH:mm:ss') : '---',
                row.total_work_hours?.toFixed(2) || '0.00',
                row.total_break_hours?.toFixed(2) || '0.00',
                row.status
            ]);

            autoTable(doc, {
                startY: 40,
                head: [['Employee', 'Employee ID', 'Date', 'Login', 'Logout', 'Work (h)', 'Break (h)', 'Status']],
                body: mainBody,
                theme: 'grid',
                headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', lineWidth: 0.15, lineColor: [60, 60, 60], valign: 'middle' },
                columnStyles: {
                    0: { cellWidth: 45 },
                    1: { cellWidth: 25, halign: 'center' },
                    2: { halign: 'center' },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { halign: 'center' },
                    7: { halign: 'center' },
                }
            });

            // --- PAGE 2: DETAILED TIMING ---
            doc.addPage();
            doc.setFontSize(22);
            doc.setTextColor(14, 165, 233);
            doc.setFont('helvetica', 'bold');
            doc.text('Detailed Timing', 14, 20);

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, h:mm A')}`, 14, 27);

            // Accent line
            doc.setDrawColor(14, 165, 233);
            doc.setLineWidth(0.5);
            doc.line(14, 32, 196, 32);

            const detailBody: any[] = [];
            exportData.forEach((session) => {
                // Session Header Row
                detailBody.push([
                    { content: session.employee_name, styles: { fontStyle: 'bold' } },
                    { content: fDate(session.login_date, 'DD-MM-YYYY'), styles: { fontStyle: 'bold' } },
                    { content: 'SESSION', styles: { fontStyle: 'bold' } },
                    { content: session.login_time ? dayjs(session.login_time).format('HH:mm:ss') : '---', styles: { fontStyle: 'bold' } },
                    { content: session.logout_time ? dayjs(session.logout_time).format('HH:mm:ss') : 'Active', styles: { fontStyle: 'bold' } },
                    { content: `${session.total_work_hours?.toFixed(2) || '0.00'} Hrs`, styles: { fontStyle: 'bold' } },
                    { content: `Total Break: ${session.total_break_hours?.toFixed(2) || '0.00'} Hrs`, styles: { fontStyle: 'bold' } }
                ]);

                // Intervals
                (session.intervals || []).forEach((int: any) => {
                    detailBody.push([
                        '',
                        '',
                        'Activity',
                        int.from_time ? dayjs(int.from_time).format('HH:mm:ss') : '---',
                        int.to_time ? dayjs(int.to_time).format('HH:mm:ss') : 'Current',
                        int.duration_seconds ? `${Math.floor(int.duration_seconds / 60)}m ${int.duration_seconds % 60}s` : '---',
                        int.status || 'Available'
                    ]);
                });

                // Breaks
                (session.breaks || []).forEach((brk: any) => {
                    detailBody.push([
                        '',
                        '',
                        'BREAK',
                        brk.break_start ? dayjs(brk.break_start).format('HH:mm:ss') : '---',
                        brk.break_end ? dayjs(brk.break_end).format('HH:mm:ss') : 'Current',
                        { content: `${brk.break_duration?.toFixed(1) || '0'} mins`, styles: { textColor: [217, 119, 6] } },
                        { content: brk.reason || brk.source || 'Manual Break', styles: { textColor: [217, 119, 6] } }
                    ]);
                });

                // Empty row for spacing
                detailBody.push(['', '', '', '', '', '', '']);
            });

            autoTable(doc, {
                startY: 40,
                head: [['Employee', 'Date', 'Type', 'Start Time', 'End Time', 'Duration', 'Details / Reason']],
                body: detailBody,
                theme: 'grid',
                headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak', lineWidth: 0.15, lineColor: [60, 60, 60], valign: 'middle' },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { halign: 'center' },
                    2: { halign: 'center' },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { cellWidth: 60 }
                },
                didParseCell: (data) => {
                    // Highlight BREAK rows type column
                    if (data.column.index === 2 && data.cell.text[0] === 'BREAK') {
                        data.cell.styles.textColor = [217, 119, 6];
                        data.cell.styles.fontStyle = 'italic';
                    }
                }
            });

            doc.save(`Daily_Log_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
            enqueueSnackbar('PDF exported successfully!', { variant: 'success' });
        } catch (error) {
            console.error('PDF export failed:', error);
            enqueueSnackbar('PDF export failed!', { variant: 'error' });
        } finally {
            setExportingPdf(false);
        }
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
                        <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' } }}>
                            <Button
                                variant="contained"
                                startIcon={exportingExcel ? undefined : <Iconify icon={"solar:export-bold" as any} />}
                                onClick={handleExport}
                                disabled={reportData.length === 0 || exportingExcel}
                                sx={{
                                    bgcolor: '#0ea5e9',
                                    color: 'common.white',
                                    '&:hover': { bgcolor: '#0284c7' },
                                    height: 40,
                                    px: 3,
                                }}
                            >
                                {exportingExcel ? 'Exporting Excel...' : 'Export Excel'}
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={exportingPdf ? undefined : <Iconify icon={"solar:file-download-bold" as any} />}
                                onClick={handleExportPdf}
                                disabled={reportData.length === 0 || exportingPdf}
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
                        </Stack>
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
