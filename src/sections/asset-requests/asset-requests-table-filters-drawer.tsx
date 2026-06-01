import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
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

const REQUEST_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'New Request', label: 'New Request' },
    { value: 'Declaration', label: 'Declaration' },
    { value: 'Return Request', label: 'Return Request' },
];

const STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Pending Approval', label: 'Pending Approval' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' },
];

const PRIORITIES = [
    { value: 'all', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High — Urgent' },
];

// ----------------------------------------------------------------------

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 1.5,
        bgcolor: 'background.neutral',
    },
};

// ----------------------------------------------------------------------

export type AssetRequestFilters = {
    type: string;
    category: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    filters: AssetRequestFilters;
    onFilters: (newFilters: Partial<AssetRequestFilters>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    categories: Array<{ name: string; category_name?: string }>;
};

export function AssetRequestsTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    categories,
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
            <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600 }}>
                Filters
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge
                    color="error"
                    variant="dot"
                    invisible={!canReset}
                    sx={{
                        [`& .MuiBadge-badge`]: {
                            top: 8,
                            right: 8,
                        },
                    }}
                >
                    <IconButton size="small" onClick={onResetFilters} disabled={!canReset}>
                        <Iconify icon="solar:restart-bold" />
                    </IconButton>
                </Badge>

                <IconButton size="small" onClick={onClose}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </Box>
        </Box>
    );

    const renderRequestType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Request Type
            </Typography>
            <TextField
                select
                fullWidth
                size="small"
                value={filters.type}
                onChange={(e) => onFilters({ type: e.target.value })}
                sx={fieldSx}
            >
                {REQUEST_TYPES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderCategory = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Category
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={['all', ...categories.map(c => c.name)]}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All Categories';
                    const category = categories.find((c) => c.name === option);
                    return category?.category_name || category?.name || option;
                }}
                value={filters.category}
                onChange={(event, newValue) => onFilters({ category: newValue || 'all' })}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select category..."
                        sx={fieldSx}
                    />
                )}
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
                value={filters.status}
                onChange={(e) => onFilters({ status: e.target.value })}
                sx={fieldSx}
            >
                {STATUSES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderPriority = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Priority
            </Typography>
            <TextField
                select
                fullWidth
                size="small"
                value={filters.priority}
                onChange={(e) => onFilters({ priority: e.target.value })}
                sx={fieldSx}
            >
                {PRIORITIES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderDateRange = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Modified Date
            </Typography>
            <Stack spacing={2}>
                <DatePicker
                    label="From Date"
                    format="DD-MM-YYYY"
                    value={filters.startDate ? dayjs(filters.startDate) : null}
                    onChange={(val) => onFilters({ startDate: val?.format('YYYY-MM-DD') || '' })}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: fieldSx,
                        }
                    }}
                />
                <DatePicker
                    label="To Date"
                    format="DD-MM-YYYY"
                    value={filters.endDate ? dayjs(filters.endDate) : null}
                    onChange={(val) => onFilters({ endDate: val?.format('YYYY-MM-DD') || '' })}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: fieldSx,
                        }
                    }}
                />
            </Stack>
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
                        boxShadow: (theme: Theme) => (theme.customShadows as any).z24,
                    },
                },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 100,
            }}
        >
            {renderHead}

            <Scrollbar>
                <Stack spacing={3} sx={{ p: 3, pt: 2.5 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {renderRequestType}
                        {renderCategory}
                        {renderStatus}
                        {renderPriority}
                        {renderDateRange}
                    </LocalizationProvider>
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
