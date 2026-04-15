import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filterStatus: string;
    onFilterStatus: (value: string) => void;
    filterEmployee: string;
    onFilterEmployee: (value: string) => void;
    filterDay: string;
    onFilterDay: (value: string) => void;
    filterStartDate: string;
    onFilterStartDate: (value: string) => void;
    filterEndDate: string;
    onFilterEndDate: (value: string) => void;
    canReset: boolean;
    onResetFilters: () => void;
    options: {
        status: { value: string; label: string }[];
        employees: { value: string; label: string }[];
        days: { value: string; label: string }[];
    };
};

export function EmployeeDailyLogTableFiltersDrawer({
    open,
    onOpen,
    onClose,
    filterStatus,
    onFilterStatus,
    filterEmployee,
    onFilterEmployee,
    filterDay,
    onFilterDay,
    filterStartDate,
    onFilterStartDate,
    filterEndDate,
    onFilterEndDate,
    canReset,
    onResetFilters,
    options,
}: Props) {

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

            <IconButton
                onClick={onClose}
                sx={{
                    color: 'text.secondary',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <Iconify icon="mingcute:close-line" width={20} />
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
                value={filterStatus}
                onChange={(e) => onFilterStatus(e.target.value)}
                SelectProps={{ native: true }}
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    },
                }}
            >
                <option value="all">All Status</option>
                {options.status.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </TextField>
        </Stack>
    );

    const renderEmployee = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Employee
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={[{ value: 'all', label: 'All Employees' }, ...options.employees]}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={options.employees.find((emp) => emp.value === filterEmployee) || { value: 'all', label: 'All Employees' }}
                onChange={(event, newValue) => {
                    onFilterEmployee(newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : 'all');
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        placeholder="Search Employee..."
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
                renderOption={(props, option) => {
                    if (option.value === 'all') {
                        const { key, ...itemProps } = props as any;
                        return (
                            <li key="all" {...itemProps}>
                                All Employees
                            </li>
                        );
                    }
                    const { key, ...optionProps } = props as any;
                    // Extract name from "Name (ID)" label
                    const name = option.label.split(' (')[0];
                    return (
                        <li key={key} {...optionProps}>
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    ID: {option.value}
                                </Typography>
                            </Stack>
                        </li>
                    );
                }}
            />
        </Stack>
    );

    const renderDay = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Day
            </Typography>
            <TextField
                select
                fullWidth
                value={filterDay}
                onChange={(e) => onFilterDay(e.target.value)}
                SelectProps={{ native: true }}
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    },
                }}
            >
                <option value="all">All Days</option>
                {options.days.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </TextField>
        </Stack>
    );

    const renderDate = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Date Range
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={2}>
                    <DatePicker
                        label="From Date"
                        format="DD-MM-YYYY"
                        value={filterStartDate ? dayjs(filterStartDate) : null}
                        onChange={(newValue) => {
                            onFilterStartDate(newValue ? dayjs(newValue).format('YYYY-MM-DD') : '');
                        }}
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
                        label="To Date"
                        format="DD-MM-YYYY"
                        value={filterEndDate ? dayjs(filterEndDate) : null}
                        onChange={(newValue) => {
                            onFilterEndDate(newValue ? dayjs(newValue).format('YYYY-MM-DD') : '');
                        }}
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
                        width: 340,
                        boxShadow: (theme) => theme.customShadows.z24,
                    },
                },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 100,
            }}
        >
            {renderHead}

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 3 }}>
                    {options.employees.length > 0 && renderEmployee}
                    {renderDate}
                    {renderDay}
                    {renderStatus}
                </Stack>
            </Scrollbar>

            <Box
                sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    mt: 'auto',
                }}
            >
                <Button
                    fullWidth
                    size="large"
                    color="inherit"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
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
