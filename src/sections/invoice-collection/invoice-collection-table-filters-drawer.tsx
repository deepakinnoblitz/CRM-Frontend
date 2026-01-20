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
    invoice: string;
    customer: string;
    collection_date: string | null;
    mode_of_payment: string;
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
        invoices: string[];
        modesOfPayment: string[];
    };
};

export function InvoiceCollectionTableFiltersDrawer({
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
                Customer
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={
                    filters.customer === 'all'
                        ? null
                        : options.customers.find((c) => c.name === filters.customer) || null
                }
                onChange={(event, newValue) => {
                    handleFilterChange('customer', newValue ? newValue.name : 'all');
                }}
                options={options.customers}
                getOptionLabel={(option) => `${option.customer_name} (${option.name})`}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search customers..."
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
                        <Typography variant="body2" sx={{ fontSize: '13px' }}>
                            {option.customer_name} ({option.name})
                        </Typography>
                    </li>
                )}
            />
        </Stack>
    );

    const renderInvoice = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Invoice No
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.invoice || null}
                onChange={(event, newValue) => {
                    handleFilterChange('invoice', newValue || '');
                }}
                options={options.invoices}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select invoice no..."
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
                    <li {...props} key={option}>
                        <Typography variant="body2" sx={{ fontSize: '13px' }}>
                            {option}
                        </Typography>
                    </li>
                )}
            />
        </Stack>
    );

    const renderDate = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Collection Date
            </Typography>
            <DatePicker
                value={filters.collection_date ? dayjs(filters.collection_date) : null}
                onChange={(newValue) => {
                    handleFilterChange('collection_date', newValue ? (newValue as any).format('YYYY-MM-DD') : null);
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

    const renderModeOfPayment = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Mode of Payment
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={
                    filters.mode_of_payment === 'all'
                        ? null
                        : options.modesOfPayment.find((m) => m === filters.mode_of_payment) || null
                }
                onChange={(event, newValue) => {
                    handleFilterChange('mode_of_payment', newValue || 'all');
                }}
                options={options.modesOfPayment}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select payment mode..."
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
                    <li {...props} key={option}>
                        <Typography variant="body2" sx={{ fontSize: '13px' }}>
                            {option}
                        </Typography>
                    </li>
                )}
            />
        </Stack>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 320,
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
        >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {renderHead}

                <Scrollbar sx={{ flexGrow: 1 }}>
                    <Stack spacing={3} sx={{ p: 3 }}>
                        {renderCustomer}
                        {renderInvoice}
                        {renderDate}
                        {renderModeOfPayment}
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
