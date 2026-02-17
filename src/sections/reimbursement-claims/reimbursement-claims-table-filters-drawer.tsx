import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
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

type FiltersProps = {
    employee: string | null;
    paid: string;
    claim_type: string;
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
    claimTypes: any[];
    employees: any[];
};

export function ReimbursementClaimsTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    claimTypes,
    employees,
}: Props) {
    const handleFilterStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ paid: event.target.value });
    };

    const handleFilterEmployee = (newValue: any) => {
        onFilters({ employee: newValue?.name === 'all' ? null : (newValue?.name || null) });
    };

    const handleFilterType = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ claim_type: event.target.value });
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

    const renderEmployee = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Employee
            </Typography>
            <Autocomplete
                fullWidth
                options={['all', ...employees.map((e) => e.name)]}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All Employees';
                    const employee = employees.find((e) => e.name === option);
                    return employee ? `${employee.employee_name} (${employee.name})` : option;
                }}
                value={filters.employee || 'all'}
                onChange={(event, newValue) => handleFilterEmployee({ name: newValue === 'all' ? null : newValue })}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search employee..."
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
                    />
                )}
                renderOption={(props, option) => {
                    if (option === 'all') {
                        const { key, ...itemProps } = props as any;
                        return (
                            <li key="all" {...itemProps}>
                                All Employees
                            </li>
                        );
                    }
                    const employee = employees.find((e) => e.name === option);
                    const { key, ...optionProps } = props as any;
                    return (
                        <li key={key} {...optionProps}>
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {employee?.employee_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    ID: {employee?.name}
                                </Typography>
                            </Stack>
                        </li>
                    );
                }}
            />
        </Stack>
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
                value={filters.paid}
                onChange={handleFilterStatus}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                    },
                }}
            >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
        </Stack>
    );

    const renderType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Claim Type
            </Typography>
            <TextField
                select
                fullWidth
                size="small"
                value={filters.claim_type}
                onChange={handleFilterType}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                    },
                }}
            >
                <MenuItem value="all">All</MenuItem>
                {claimTypes.map((type) => (
                    <MenuItem key={type.name} value={type.name}>
                        {type.name}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderDateRange = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Expense Date Range
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
                    {renderEmployee}
                    {renderStatus}
                    {renderType}
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
