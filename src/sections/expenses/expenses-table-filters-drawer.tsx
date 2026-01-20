import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type FiltersProps = {
    expense_id: string;
    expense_category: string;
    payment_type: string;
    start_date: string | null;
    end_date: string | null;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: FiltersProps;
    onFilters: (newFilters: Partial<FiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    options: {
        categories: string[];
        paymentTypes: string[];
    };
};

export function ExpenseTableFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    options,
}: Props) {
    const handleFilterChange = (field: keyof FiltersProps, value: any) => {
        onFilters({ [field]: value });
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

    const renderExpenseId = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Expense ID
            </Typography>
            <TextField
                fullWidth
                size="small"
                value={filters.expense_id || ''}
                onChange={(e) => handleFilterChange('expense_id', e.target.value)}
                placeholder="Enter expense ID..."
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
        </Stack>
    );

    const renderCategory = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Expense Category
            </Typography>
            <Autocomplete
                fullWidth
                freeSolo
                size="small"
                value={filters.expense_category === 'all' ? '' : filters.expense_category}
                onChange={(event, newValue) => {
                    handleFilterChange('expense_category', newValue || 'all');
                }}
                onInputChange={(event, newInputValue) => {
                    handleFilterChange('expense_category', newInputValue || 'all');
                }}
                options={options.categories}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Type or select category..."
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
                renderOption={(props, option) => (
                    <MenuItem {...props} key={option} sx={{ typography: 'body2', fontSize: '13px' }}>
                        {option}
                    </MenuItem>
                )}
            />
        </Stack>
    );

    const renderPaymentType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Payment Type
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.payment_type === 'all' ? null : filters.payment_type}
                onChange={(event, newValue) => {
                    handleFilterChange('payment_type', newValue || 'all');
                }}
                options={options.paymentTypes}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select payment type..."
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
                renderOption={(props, option) => (
                    <MenuItem {...props} key={option} sx={{ typography: 'body2', fontSize: '13px' }}>
                        {option}
                    </MenuItem>
                )}
            />
        </Stack>
    );

    const renderDateRange = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Expense Date Range
            </Typography>
            <Stack direction="row" spacing={2}>
                <DatePicker
                    label="Start Date"
                    value={filters.start_date ? dayjs(filters.start_date) : null}
                    onChange={(newValue) => {
                        handleFilterChange('start_date', newValue ? (newValue as any).format('YYYY-MM-DD') : null);
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    bgcolor: 'background.neutral',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                },
                            }
                        },
                    }}
                />
                <DatePicker
                    label="End Date"
                    value={filters.end_date ? dayjs(filters.end_date) : null}
                    onChange={(newValue) => {
                        handleFilterChange('end_date', newValue ? (newValue as any).format('YYYY-MM-DD') : null);
                    }}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            size: 'small',
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    bgcolor: 'background.neutral',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                },
                            }
                        },
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
            PaperProps={{
                sx: { width: 360 },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {renderHead}

                <Scrollbar>
                    <Stack spacing={3} sx={{ p: 3 }}>
                        {renderExpenseId}
                        {renderCategory}
                        {renderPaymentType}
                        {renderDateRange}
                    </Stack>
                </Scrollbar>

                <Box sx={{ p: 3 }}>
                    <Button
                        fullWidth
                        color="inherit"
                        size="large"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                        onClick={onResetFilters}
                        disabled={!canReset}
                    >
                        Clear All Filters
                    </Button>
                </Box>
            </LocalizationProvider>
        </Drawer>
    );
}
