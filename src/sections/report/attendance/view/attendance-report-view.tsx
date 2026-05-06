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

import { fDate, formatPatterns } from 'src/utils/format-time';

import { runReport } from 'src/api/reports';
import { getDoctypeList } from 'src/api/leads';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

import { AttendanceDetailsDialog } from '../attendance-details-dialog';


export function AttendanceReportView() {
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
    const [sortBy, setSortBy] = useState('date_asc');

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


    // Options
    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selection
    const [selected, setSelected] = useState<string[]>([]);

    // Details Dialog
    const [openDetails, setOpenDetails] = useState(false);
    const [selectedAttendanceName, setSelectedAttendanceName] = useState<string | null>(null);

    const handleViewDetails = (name: string) => {
        setSelectedAttendanceName(name);
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

    const fetchReport = useCallback(async () => {
        if (!fromDate || !toDate) {
            setReportData([]);
            return;
        }
        setLoading(true);
        try {
            const filters: any = {};
            if (fromDate) filters.from_date = fromDate.format('YYYY-MM-DD');
            if (toDate) filters.to_date = toDate.format('YYYY-MM-DD');
            if (employee !== 'all') filters.employee = employee;
            if (status !== 'all') filters.status = status;

            const result = await runReport('Attendance Report', filters);
            let finalData = result.result || [];

            // Sort Data
            finalData = [...finalData].sort((a, b) => {
                const dateA = a.attendance_date;
                const dateB = b.attendance_date;
                const nameA = (a.employee_name || '').toLowerCase();
                const nameB = (b.employee_name || '').toLowerCase();

                switch (sortBy) {
                    case 'date_asc':
                        if (dateB !== dateA) return dateB.localeCompare(dateA);
                        return nameA.localeCompare(nameB);
                    case 'date_desc':
                        if (dateA !== dateB) return dateA.localeCompare(dateB);
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
            console.error('Failed to fetch attendance report:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, employee, status, sortBy]);

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
        setSortBy('date_asc');
    };


    useEffect(() => {
        getDoctypeList('Employee', ['name', 'employee_name']).then(setEmployeeOptions);
    }, []);

    const handleExport = async () => {
        setExportingExcel(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Attendance Report');

            // Use all filtered data for export
            const exportData = reportData;

            sheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Employee', key: 'employee_name', width: 25 },
                { header: 'Employee ID', key: 'employee', width: 15 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'In Time', key: 'in_time', width: 15 },
                { header: 'Out Time', key: 'out_time', width: 15 },
                { header: 'Working Hours', key: 'working_hours', width: 15 },
            ];

            const columnCount = sheet.columns.length;

            // Header Styling (Limited to data columns only)
            for (let i = 1; i <= columnCount; i++) {
                const cell = sheet.getRow(1).getCell(i);
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0ea5e9' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            sheet.getRow(1).height = 25;

            exportData.forEach((row) => {
                const excelRow = sheet.addRow({
                    date: fDate(row.attendance_date, 'DD-MM-YYYY'),
                    employee_name: row.employee_name,
                    employee: row.employee,
                    status: row.status,
                    in_time: row.in_time || '---',
                    out_time: row.out_time || '---',
                    working_hours: row.working_hours_display || '---'
                });

                // Status coloring
                const statusCell = excelRow.getCell('status');
                const statusColors: any = {
                    'Present': 'FF22C55E',
                    'Absent': 'FFEF4444',
                    'Half Day': 'FFF59E0B',
                    'On Leave': 'FF0EA5E9',
                    'Holiday': 'FF1877F2'
                };
                if (statusColors[row.status]) {
                    statusCell.font = { color: { argb: statusColors[row.status] }, bold: true };
                }
            });

            // Merging logic for Date, Employee, and Employee ID
            let mergeStart = 2;
            const totalRows = sheet.rowCount;
            for (let i = 2; i <= totalRows; i++) {
                const current = sheet.getRow(i);
                const next = i < totalRows ? sheet.getRow(i + 1) : null;

                const isLast = i === totalRows;
                const sameAsNext = !isLast && next &&
                    current.getCell(1).value === next.getCell(1).value &&
                    current.getCell(2).value === next.getCell(2).value &&
                    current.getCell(3).value === next.getCell(3).value;

                if (!sameAsNext) {
                    if (i > mergeStart) {
                        sheet.mergeCells(`A${mergeStart}:A${i}`);
                        sheet.mergeCells(`B${mergeStart}:B${i}`);
                        sheet.mergeCells(`C${mergeStart}:C${i}`);

                        ['A', 'B', 'C'].forEach(col => {
                            sheet.getCell(`${col}${mergeStart}`).alignment = { vertical: 'middle', horizontal: 'center' };
                        });
                    }
                    mergeStart = i + 1;
                }
            }

            // Alternating row colors and black borders (Limited to data columns only)
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    for (let i = 1; i <= columnCount; i++) {
                        const cell = row.getCell(i);
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };

                        // Alternate shading
                        if (rowNumber % 2 === 0) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6F8' } };
                        }

                        // Borders
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
            saveAs(new Blob([buffer]), `Attendance_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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

            // Use all filtered data for export
            const exportData = reportData;

            // Header
            doc.setFontSize(22);
            doc.setTextColor(14, 165, 233);
            doc.setFont('helvetica', 'bold');
            doc.text('Attendance Report', 14, 20);

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${dayjs().format('DD MMM YYYY, h:mm A')}`, 14, 27);

            // Accent line
            doc.setDrawColor(14, 165, 233);
            doc.setLineWidth(0.5);
            doc.line(14, 32, 196, 32);

            const tableData: any[] = [];
            for (let i = 0; i < exportData.length; i++) {
                const row = exportData[i];
                const currentDate = fDate(row.attendance_date, 'DD-MM-YYYY');
                const currentEmployee = row.employee_name;
                const currentEmployeeId = row.employee;

                // Grouping check (mirroring Excel merge)
                let isStart = true;
                if (i > 0) {
                    const prevRow = exportData[i - 1];
                    if (fDate(prevRow.attendance_date, 'DD-MM-YYYY') === currentDate &&
                        prevRow.employee_name === currentEmployee &&
                        prevRow.employee === currentEmployeeId) {
                        isStart = false;
                    }
                }

                if (isStart) {
                    // Calculate span
                    let span = 1;
                    while (i + span < exportData.length) {
                        const nextRow = exportData[i + span];
                        if (fDate(nextRow.attendance_date, 'DD-MM-YYYY') === currentDate &&
                            nextRow.employee_name === currentEmployee &&
                            nextRow.employee === currentEmployeeId) {
                            span++;
                        } else {
                            break;
                        }
                    }

                    tableData.push([
                        { content: currentDate, rowSpan: span, styles: { valign: 'middle', halign: 'center' } },
                        { content: currentEmployee, rowSpan: span, styles: { valign: 'middle', halign: 'center' } },
                        { content: currentEmployeeId, rowSpan: span, styles: { valign: 'middle', halign: 'center' } },
                        row.status,
                        row.in_time || '---',
                        row.out_time || '---',
                        row.working_hours_display || '---'
                    ]);
                } else {
                    tableData.push([
                        // Spanned columns omitted
                        row.status,
                        row.in_time || '---',
                        row.out_time || '---',
                        row.working_hours_display || '---'
                    ]);
                }
            }

            autoTable(doc, {
                startY: 40,
                head: [['Date', 'Employee', 'Employee ID', 'Status', 'In Time', 'Out Time', 'Working Hours']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak', lineWidth: 0.15, lineColor: [60, 60, 60], valign: 'middle' },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 30 },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { halign: 'center' },
                },
                didParseCell: (data) => {
                    const statusVal = data.cell.text[0];
                    const statusColors: any = {
                        'Present': [34, 197, 94],
                        'Absent': [239, 68, 68],
                        'Half Day': [245, 158, 11],
                        'On Leave': [14, 165, 233],
                        'Holiday': [24, 119, 242]
                    };
                    if (data.column.index === 3 && statusColors[statusVal]) {
                        data.cell.styles.textColor = statusColors[statusVal];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            doc.save(`Attendance_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
            enqueueSnackbar('PDF exported successfully!', { variant: 'success' });
        } catch (error) {
            console.error('PDF export failed:', error);
            enqueueSnackbar('PDF export failed!', { variant: 'error' });
        } finally {
            setExportingPdf(false);
        }
    };

    const onChangePage = useCallback((event: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const totalDaysPresent = reportData.filter(d => d.status === 'Present').length;
    const totalEntries = reportData.length;

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Present': return 'success';
            case 'Absent': return 'error';
            case 'On Leave': return 'info';
            case 'Half Day': return 'warning';
            default: return 'default';
        }
    };

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.5}>
                        <Typography variant="h4">Attendance Report</Typography>
                    </Stack>
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
                                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 180 } } }}
                            />
                            <DatePicker
                                label="To Date"
                                format="DD-MM-YYYY"
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1, maxWidth: 180 } } }}
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
                                <Box component="li" {...props} sx={{ fontSize: '0.85rem' }}>
                                    {option.name === 'all' ? (
                                        option.employee_name
                                    ) : (
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {option.employee_name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                ID: {option.name}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
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
                                <MenuItem value="Present">Present</MenuItem>
                                <MenuItem value="Absent">Absent</MenuItem>
                                <MenuItem value="On Leave">On Leave</MenuItem>
                                <MenuItem value="Half Day">Half Day</MenuItem>
                                <MenuItem value="Holiday">Holiday</MenuItem>
                                <MenuItem value="Missing">Missing</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 180 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="date_asc">Date ↓ (Latest)</MenuItem>
                                <MenuItem value="date_desc">Date ↑ (Oldest)</MenuItem>
                                <MenuItem value="name_asc">Name: A to Z</MenuItem>
                                <MenuItem value="name_desc">Name: Z to A</MenuItem>
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
                            md: 'repeat(6, 1fr)', // 6 columns for 6 cards
                        },
                    }}
                >
                    <SummaryCard item={{ label: 'Total Entries', value: reportData.length, indicator: 'blue' }} />
                    <SummaryCard item={{ label: 'Present', value: reportData.filter(d => d.status === 'Present').length, indicator: 'green' }} />
                    <SummaryCard item={{ label: 'Absent', value: reportData.filter(d => d.status === 'Absent').length, indicator: 'red' }} />
                    <SummaryCard item={{ label: 'Half Day', value: reportData.filter(d => d.status === 'Half Day').length, indicator: 'orange' }} />
                    <SummaryCard item={{ label: 'Missing', value: reportData.filter(d => d.status === 'Missing').length, indicator: 'orange' }} />
                    <SummaryCard item={{ label: 'Holiday', value: reportData.filter(d => d.status === 'Holiday').length, indicator: 'blue' }} />
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
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>In Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Out Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Working Hours</TableCell>
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
                                                    key={`${row.employee}-${row.attendance_date}-${index}`}
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
                                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.attendance_date, 'DD-MM-YYYY')}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="subtitle2">{row.employee_name}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{row.employee}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Label color={getStatusColor(row.status)} variant="soft">
                                                            {row.status}
                                                        </Label>
                                                    </TableCell>
                                                    <TableCell>{row.in_time || '---'}</TableCell>
                                                    <TableCell>{row.out_time || '---'}</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.working_hours_display || '---'}</TableCell>
                                                    <TableCell align="right" sx={{ position: 'sticky', right: 0, bgcolor: 'background.paper', boxShadow: '-2px 0 4px rgba(145, 158, 171, 0.08)' }}>
                                                        {row.status !== 'Holiday' && (
                                                            <IconButton onClick={() => handleViewDetails(row.name)} sx={{ color: 'info.main' }}>
                                                                <Iconify icon={"solar:eye-bold" as any} />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                    {reportData.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                                {!fromDate || !toDate ? (
                                                    <Stack spacing={1} alignItems="center">
                                                        <Iconify icon={"solar:filter-bold-duotone" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                        <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                                                            Please Select Filters
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Stack spacing={1} alignItems="center">
                                                        <Iconify icon={"eva:slash-outline" as any} width={48} sx={{ color: 'text.disabled' }} />
                                                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>No data found</Typography>
                                                    </Stack>
                                                )}
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

            <AttendanceDetailsDialog
                open={openDetails}
                attendanceId={selectedAttendanceName}
                onClose={() => {
                    setOpenDetails(false);
                    setSelectedAttendanceName(null);
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
        if (t.includes('present')) return 'solar:check-circle-bold-duotone';
        if (t.includes('absent')) return 'solar:calendar-date-bold-duotone';
        if (t.includes('half day')) return 'solar:clock-circle-bold-duotone';
        if (t.includes('missing')) return 'solar:danger-circle-bold-duotone';
        if (t.includes('holiday')) return 'solar:cup-star-bold-duotone';
        if (t.includes('entries')) return 'solar:list-bold-duotone';
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
