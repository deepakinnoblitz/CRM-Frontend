import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
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
    client_name: string;
    ref_no: string;
    invoice_date: string | null;
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
        customers: { name: string; customer_name: string }[];
        refNos: string[];
    };
};

export function InvoiceTableFiltersDrawer({
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

    const renderCustomer = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Client
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={
                    filters.client_name === 'all'
                        ? null
                        : options.customers.find((c) => c.name === filters.client_name) || null
                }
                onChange={(event, newValue) => {
                    handleFilterChange('client_name', newValue ? newValue.name : 'all');
                }}
                options={options.customers}
                getOptionLabel={(option) => `${option.customer_name.split(' - ')[0]} (${option.name})`}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search clients..."
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
                    <li {...props} key={option.name}>
                        <Stack spacing={0.5} sx={{ py: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {option.customer_name.split(' - ')[0]}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                ID: {option.name}
                            </Typography>
                        </Stack>
                    </li>
                )}
            />
        </Stack>
    );

    const renderRefNo = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Reference No
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.ref_no || null}
                onChange={(event, newValue) => {
                    handleFilterChange('ref_no', newValue || '');
                }}
                options={options.refNos}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select reference no..."
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
            />
        </Stack>
    );

    const renderDate = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Invoice Date
            </Typography>
            <DatePicker
                value={filters.invoice_date ? dayjs(filters.invoice_date) : null}
                onChange={(newValue) => {
                    handleFilterChange('invoice_date', newValue ? (newValue as any).format('YYYY-MM-DD') : null);
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {renderHead}

                <Scrollbar>
                    <Stack spacing={3} sx={{ p: 3 }}>
                        {renderCustomer}
                        {renderRefNo}
                        {renderDate}
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
            </LocalizationProvider>
        </Drawer>
    );
}
