import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect, useCallback } from 'react';
import { FaPen, FaCircleCheck, FaClipboardList, FaCirclePause } from 'react-icons/fa6';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const filter = createFilterOptions<string>();

import { fDate } from 'src/utils/format-time';

import { fetchHRTaskStats, fetchProjects, fetchDepartments, fetchTaskManagerList, TaskManager } from 'src/api/task-manager';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import { HRSummaryWidgetV2 } from './hr-summary-widget-v2';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'sno', label: 'S.No', align: 'center', width: 60 },
    { id: 'title', label: 'Title', width: 280 },
    { id: 'project', label: 'Project', width: 140 },
    { id: 'priority', label: 'Priority', width: 120 },
    { id: 'status', label: 'Status', width: 120 },
    { id: 'due_date', label: 'Due Date', width: 120 },
];

const STATUS_LABEL_COLOR: Record<string, 'error' | 'warning' | 'success' | 'info' | 'default'> = {
    Open: 'error',
    'In Progress': 'warning',
    Completed: 'success',
    Reopened: 'error',
    'On Hold': 'warning',
};

const PRIORITY_MAP: Record<string, { color: string, icon: string }> = {
    High: { color: '#f22521', icon: 'solar:flag-bold' },
    Medium: { color: '#ffcc00', icon: 'solar:flag-bold' },
    Low: { color: '#3399ff', icon: 'solar:flag-bold' },
};

export function HRTaskSummaryCards() {
    const theme = useTheme();

    const [stats, setStats] = useState({ total: 0, open: 0, reopen: 0, in_progress: 0, completed: 0, on_hold: 0 });
    const [overdueTasks, setOverdueTasks] = useState<TaskManager[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<TaskManager[]>([]);

    const [loading, setLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);

    const [projects, setProjects] = useState<{ name: string; project: string }[]>([]);
    const [departments, setDepartments] = useState<{ name: string; department_name: string }[]>([]);

    const [selectedProject, setSelectedProject] = useState('All');
    const [selectedDepartment, setSelectedDepartment] = useState('All');

    const [fromDate, setFromDate] = useState<Dayjs | null>(null);
    const [toDate, setToDate] = useState<Dayjs | null>(null);

    // Pagination states
    const [overduePage, setOverduePage] = useState(0);
    const [overdueRowsPerPage, setOverdueRowsPerPage] = useState(5);
    const [upcomingPage, setUpcomingPage] = useState(0);
    const [upcomingRowsPerPage, setUpcomingRowsPerPage] = useState(5);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [projData, deptData] = await Promise.all([
                    fetchProjects(),
                    fetchDepartments()
                ]);
                setProjects(projData);
                setDepartments(deptData);
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        };
        loadOptions();
    }, []);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setTasksLoading(true);

            // Fetch Stats
            const statsData = await fetchHRTaskStats(
                selectedProject,
                selectedDepartment,
                fromDate?.format('YYYY-MM-DD'),
                toDate?.format('YYYY-MM-DD')
            );
            setStats(statsData);

            const today = dayjs().format('YYYY-MM-DD');
            const nextWeek = dayjs().add(7, 'days').format('YYYY-MM-DD');

            // Common filters
            const baseFilters: any[] = [];
            if (selectedProject !== 'All') baseFilters.push(['Task Manager', 'project', '=', selectedProject]);
            if (selectedDepartment !== 'All') baseFilters.push(['Task Manager', 'department', '=', selectedDepartment]);

            // Fetch Overdue
            const overdueFilters = [
                ...baseFilters,
                ['Task Manager', 'due_date', '<', today],
                ['Task Manager', 'status', 'not in', ['Completed', 'Cancelled']]
            ];

            // Fetch Upcoming
            const upcomingFilters = [
                ...baseFilters,
                ['Task Manager', 'due_date', 'between', [today, nextWeek]],
                ['Task Manager', 'status', 'not in', ['Completed', 'Cancelled']]
            ];

            const [overdueData, upcomingData] = await Promise.all([
                fetchTaskManagerList(overdueFilters),
                fetchTaskManagerList(upcomingFilters)
            ]);

            setOverdueTasks(overdueData);
            setUpcomingTasks(upcomingData);
            setOverduePage(0);
            setUpcomingPage(0);

        } catch (error) {
            console.error('Failed to fetch task data:', error);
        } finally {
            setLoading(false);
            setTasksLoading(false);
        }
    }, [selectedProject, selectedDepartment, fromDate, toDate]);

    useEffect(() => {
        loadData();
    }, [loadData]);



    const autocompleteSx = {
        minWidth: 220,
        '& .MuiOutlinedInput-root': {
            height: 40,
            padding: '0 14px',
            borderRadius: '20px',
            bgcolor: alpha(theme.palette.grey[500], 0.06),
            fontSize: '13px',
            fontWeight: 600,
            '& fieldset': {
                borderColor: alpha(theme.palette.grey[500], 0.18),
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '1.5px',
            },
        },
    };
const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#fff',
        fontSize: '0.8rem',
        fontWeight: 500,
        '& fieldset': { borderColor: '#E5E7EB', borderWidth: '1.5px' },
        '&:hover fieldset': { borderColor: '#9CA3AF' },
        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.78rem',
        color: '#9CA3AF',
        '&.Mui-focused': { color: 'primary.main' },
    },
    '& .MuiInputBase-input': { py: '9px' },
};

const autoSx = {
    width: 200,
    ...fieldSx,
    '& .MuiOutlinedInput-root': {
        ...fieldSx['& .MuiOutlinedInput-root'],
        py: '2.5px',
    },
};

const dateSx = {
    width: 178,
    ...fieldSx,
};

    const datePickerSx = {
        ...autocompleteSx,
        minWidth: 180,
        width: 180,
        '& .MuiInputBase-root': {
            height: 40,
        },
        '& .MuiInputBase-input': {
            fontSize: '14px',
            py: 0,
        },
        '& .MuiInputLabel-root': {
            fontSize: '14px',
            '&:not(.MuiInputLabel-shrink)': {
                transform: 'translate(14px, 10px) scale(1)',
            },
            '&.MuiInputLabel-shrink': {
                fontSize: '14px',
                px: 0.5,
                bgcolor: theme.palette.background.paper,
            },
        },
    };



    return (
        <Card sx={{ p: 3, borderRadius: 2, mb: 2 }}>
            <Box
            sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mb: 4,
            }}
        >
            {/* ── Left: title block ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Accent bar */}
                <Box
                    sx={{
                        width: 4,
                        height: 36,
                        borderRadius: '4px',
                        background: `linear-gradient(180deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                        flexShrink: 0,
                    }}
                />
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.02rem',
                            color: 'text.primary',
                            lineHeight: 1.25,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Task Analytics Overview
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                        Filter and explore task data
                    </Typography>
                </Box>
            </Box>

            {/* ── Right: filter row ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.6,
                    p: 1.8,
                    borderRadius: '12px',
                    border: `1.5px solid #F0F0F0`,
                    bgcolor: '#FAFAFA',
                }}
            >
                {/* Date range */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="From Date"
                        value={fromDate}
                        onChange={(val) => setFromDate(val)}
                        slotProps={{ textField: { size: 'small', sx: dateSx } }}
                    />

                    {/* Arrow between dates */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#9CA3AF',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            userSelect: 'none',
                        }}
                    >
                        →
                    </Box>

                    <DatePicker
                        label="To Date"
                        value={toDate}
                        onChange={(val) => setToDate(val)}
                        slotProps={{ textField: { size: 'small', sx: dateSx } }}
                    />
                </LocalizationProvider>

                {/* Separator */}
                <Box sx={{ width: '1px', height: 30, bgcolor: '#E5E7EB', mx: 0.3 }} />

      {/* Project */}
<Autocomplete
    size="small"
    options={['All Projects', ...projects.map((p: any) => p.project)]}
    filterOptions={(options, params) => filter(options, params).slice(0, 10)}
    value={
        selectedProject === 'All'
            ? 'All Projects'
            : projects.find((p: any) => p.name === selectedProject)?.project || 'All Projects'
    }
    onChange={(_e, val) => {
        if (!val || val === 'All Projects') {
            setSelectedProject('All');
        } else {
            const proj = projects.find((p: any) => p.project === val);
            setSelectedProject(proj ? proj.name : 'All');
        }
    }}
    sx={autoSx}
    renderInput={(params) => (
        <TextField {...params} label="Project" />
    )}
/>

{/* Department */}
<Autocomplete
    size="small"
    options={['All Departments', ...departments.map((d: any) => d.department_name)]}
    filterOptions={(options, params) => filter(options, params).slice(0, 10)}
    value={
        selectedDepartment === 'All'
            ? 'All Departments'
            : departments.find((d: any) => d.name === selectedDepartment)?.department_name || 'All Departments'
    }
    onChange={(_e, val) => {
        if (!val || val === 'All Departments') {
            setSelectedDepartment('All');
        } else {
            const dept = departments.find((d: any) => d.department_name === val);
            setSelectedDepartment(dept ? dept.name : 'All');
        }
    }}
    sx={autoSx}
    renderInput={(params) => (
        <TextField {...params} label="Department" />
    )}
/>
            </Box>
        </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <HRSummaryWidgetV2
                        title="Total Tasks"
                        total={stats.total}
                        loading={loading}
                        compact
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <HRSummaryWidgetV2
                        title="In Progress Tasks"
                        total={stats.in_progress}
                        loading={loading}
                        color="info"
                        compact
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <HRSummaryWidgetV2
                        title="Completed Tasks"
                        total={stats.completed}
                        loading={loading}
                        color="success"
                        compact
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <HRSummaryWidgetV2
                        title="Reopen Tasks"
                        total={stats.reopen}
                        loading={loading}
                        color="error"
                        compact
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                    <HRSummaryWidgetV2
                        title="On Hold Tasks"
                        total={stats.on_hold}
                        loading={loading}
                        color="warning"
                        compact
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

            <Grid container spacing={4}>
                {/* Overdue Tasks Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, pl: 1 }}>
                            Overdue Tasks
                        </Typography>
                        <Label color="error" variant="soft" sx={{ height: 22, px: 0.75, fontSize: 12, fontWeight: 800, borderRadius: '6px' }}>
                            {overdueTasks.length}
                        </Label>
                    </Stack>

                    <TaskMiniTable
                        tasks={overdueTasks}
                        loading={tasksLoading}
                        isOverdue
                        theme={theme}
                        page={overduePage}
                        onPageChange={(e, p) => setOverduePage(p)}
                        rowsPerPage={overdueRowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setOverdueRowsPerPage(parseInt(e.target.value, 10));
                            setOverduePage(0);
                        }}
                    />
                </Grid>

                {/* Upcoming Tasks Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, pl: 1 }}>
                            Upcoming (Next 7 Days)
                        </Typography>
                        <Label color="info" variant="soft" sx={{ height: 22, px: 0.75, fontSize: 12, fontWeight: 800, borderRadius: '6px' }}>
                            {upcomingTasks.length}
                        </Label>
                    </Stack>

                    <TaskMiniTable
                        tasks={upcomingTasks}
                        loading={tasksLoading}
                        theme={theme}
                        page={upcomingPage}
                        onPageChange={(e, p) => setUpcomingPage(p)}
                        rowsPerPage={upcomingRowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setUpcomingRowsPerPage(parseInt(e.target.value, 10));
                            setUpcomingPage(0);
                        }}
                    />
                </Grid>
            </Grid>
        </Card>
    );
}

// ----------------------------------------------------------------------

import TablePagination from '@mui/material/TablePagination';

const MINI_TABLE_HEAD = [
    { id: 'title', label: 'Task Title', width: 140 },
    { id: 'project', label: 'Project', width: 120 },
    { id: 'due_date', label: 'Due Date', width: 120, align: 'right' },
];

function TaskMiniTable({
    tasks,
    loading,
    isOverdue,
    theme,
    page,
    onPageChange,
    rowsPerPage,
    onRowsPerPageChange
}: {
    tasks: TaskManager[],
    loading: boolean,
    isOverdue?: boolean,
    theme: any,
    page: number,
    onPageChange: (event: unknown, newPage: number) => void,
    rowsPerPage: number,
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const dataFiltered = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, borderRadius: 2, overflow: 'hidden' }}>
            <Scrollbar>
                <TableContainer sx={{ position: 'relative', minHeight: 320 }}>
                    {loading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(theme.palette.background.paper, 0.48),
                            zIndex: 9
                        }}>
                            <CircularProgress size={32} />
                        </Box>
                    )}
                    <Table size="medium" sx={{
                        '& .MuiTableCell-head': {
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                            py: 1.5,
                            color: 'text.secondary',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }
                    }}>
                        <TableHeadCustom
                            headLabel={MINI_TABLE_HEAD}
                            rowCount={tasks.length}
                            numSelected={0}
                            onSelectAllRows={() => { }}
                            hideCheckbox
                        />

                        <TableBody>
                            {dataFiltered.map((task) => (
                                <TableRow key={task.name} hover sx={{ '& td': { borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.08)}` } }}>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Box sx={{ maxWidth: 200 }}>
                                            <Typography
                                                noWrap
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    color: 'text.primary',
                                                }}
                                            >
                                                {task.title}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                                                {task.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ maxWidth: 140 }}>
                                            <Typography
                                                noWrap
                                                variant="body2"
                                                sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
                                            >
                                                {task.project || '—'}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell align="right" sx={{ width: 120 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            {(() => {
                                                if (!task.due_date) return (
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                                        —
                                                    </Typography>
                                                );
                                                const taskDate = dayjs(task.due_date);
                                                const today = dayjs().startOf('day');
                                                const tomorrow = dayjs().add(1, 'day').startOf('day');

                                                if (taskDate.isSame(today, 'day')) {
                                                    return (
                                                        <Label variant="soft" color="error" sx={{ height: 24, px: 1, minWidth: 0, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                                                            Today
                                                        </Label>
                                                    );
                                                }
                                                if (taskDate.isSame(tomorrow, 'day')) {
                                                    return (
                                                        <Label variant="soft" color="warning" sx={{ height: 24, px: 1, minWidth: 0, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                                                            Tomorrow
                                                        </Label>
                                                    );
                                                }
                                                return (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.8rem',
                                                            color: isOverdue ? '#ff5630' : 'text.secondary',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {fDate(task.due_date)}
                                                    </Typography>
                                                );
                                            })()}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {tasks.length > 0 && Array.from({ length: Math.max(0, rowsPerPage - dataFiltered.length) }).map((_, index) => (
                                <TableRow key={`empty-${index}`} sx={{ height: 61 }}>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            ))}

                            {tasks.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Stack
                                            alignItems="center"
                                            justifyContent="center"
                                            sx={{
                                                py: 10,
                                                textAlign: 'center',
                                                height: 305
                                            }}
                                        >
                                            <Iconify
                                                icon="solar:notes-bold-duotone"
                                                width={64}
                                                sx={{ color: 'text.disabled', opacity: 0.24, mb: 2 }}
                                            />
                                            <Typography variant="subtitle2" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '16px' }}>
                                                {isOverdue ? 'No Overdue Tasks Found' : 'No Upcoming Tasks Found'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', maxWidth: 200, mt: 0.5 }}>
                                                Everything is on track! There are no {isOverdue ? 'overdue' : 'upcoming'} items at this time.
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
                count={tasks.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{
                    borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    bgcolor: alpha(theme.palette.grey[500], 0.02),
                }}
            />
        </Box>
    );
}
