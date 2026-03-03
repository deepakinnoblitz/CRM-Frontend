import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type FiltersProps = {
    status: string;
    job_applied: string;
    startDate: string | null;
    endDate: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    filters: FiltersProps;
    onFilters: (newFilters: Partial<FiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    jobOpenings: any[];
};

const STATUS_OPTIONS = [
    'Applied',
    'Screening',
    'Shortlisted',
    'Scheduled',
    'In Progress',
    'Completed',
    'No-Show',
    'Cancelled',
    'Rescheduled',
    'Selected',
    'Rejected',
    'On Hold',
];

export function InterviewTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    jobOpenings,
}: Props) {
    const handleFilterStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ status: event.target.value });
    };

    const handleFilterJobApplied = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ job_applied: event.target.value });
    };

    const handleFilterStartDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ startDate: newValue ? newValue.format('YYYY-MM-DD') : null });
    };

    const handleFilterEndDate = (newValue: dayjs.Dayjs | null) => {
        onFilters({ endDate: newValue ? newValue.format('YYYY-MM-DD') : null });
    };

    const renderHead = (
        <Box
            sx={{
                py: 2.5,
                pl: 3,
                pr: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Filters
            </Typography>

            <IconButton
                onClick={onResetFilters}
                disabled={!canReset}
                sx={{
                    mr: 0.5,
                    color: canReset ? 'primary.main' : 'text.disabled',
                    '&:hover': {
                        bgcolor: canReset ? 'primary.lighter' : 'transparent',
                    },
                }}
            >
                <Badge color="error" variant="dot" invisible={!canReset}>
                    <Iconify icon="solar:restart-bold" width={20} />
                </Badge>
            </IconButton>

            <IconButton onClick={onClose}>
                <Iconify icon="mingcute:close-line" />
            </IconButton>
        </Box>
    );

    const renderStatus = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Status
            </Typography>
            <TextField
                select
                fullWidth
                size="small"
                value={filters.status}
                onChange={handleFilterStatus}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                    },
                }}
            >
                <MenuItem value="all">All</MenuItem>
                {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderJobApplied = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Job Applied
            </Typography>
            <TextField
                select
                fullWidth
                size="small"
                value={filters.job_applied}
                onChange={handleFilterJobApplied}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                    },
                }}
            >
                <MenuItem value="all">All</MenuItem>
                {jobOpenings.map((opening) => (
                    <MenuItem key={opening.name} value={opening.name}>
                        {opening.job_title || opening.name}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderDateRange = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Scheduled Date Range
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                    <DatePicker
                        label="Start Date"
                        value={filters.startDate ? dayjs(filters.startDate) : null}
                        onChange={handleFilterStartDate}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: 'background.neutral',
                                    },
                                },
                            },
                        }}
                    />
                    <DatePicker
                        label="End Date"
                        value={filters.endDate ? dayjs(filters.endDate) : null}
                        onChange={handleFilterEndDate}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                sx: {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: 'background.neutral',
                                    },
                                },
                            },
                        }}
                    />
                </Stack>
            </LocalizationProvider>
        </Stack>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 320,
                        boxShadow: (theme) => theme.customShadows.z24,
                    },
                },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 100,
            }}
        >
            {renderHead}

            <Divider />

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 2.5 }}>
                    {renderStatus}
                    {renderJobApplied}
                    {renderDateRange}
                </Stack>
            </Scrollbar>

            <Box
                sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                }}
            >
                <Button
                    fullWidth
                    size="large"
                    color="inherit"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:restart-bold" />}
                    onClick={onResetFilters}
                    disabled={!canReset}
                    sx={{
                        borderRadius: 1.5,
                        borderColor: 'divider',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: 'error.main',
                            color: 'error.main',
                            bgcolor: 'error.lighter',
                        },
                        '&.Mui-disabled': {
                            borderColor: 'divider',
                        },
                    }}
                >
                    Clear All Filters
                </Button>
            </Box>
        </Drawer>
    );
}
