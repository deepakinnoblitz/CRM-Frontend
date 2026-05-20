import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type FiltersProps = {
    customer_type: string;
    source_lead: string;
    country: string;
    state: string;
    city: string;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: FiltersProps;
    onFilters: (update: Partial<FiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    options: {
        countries: string[];
        states: string[];
        cities: string[];
        source_leads: { name: string; lead_name: string }[];
    };
};

export function ContactTableFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    options,
}: Props) {
    const handleFilterChange = (field: keyof FiltersProps, value: string) => {
        // Reset dependent filters when parent changes
        if (field === 'country') {
            onFilters({ [field]: value, state: 'all', city: 'all' });
        } else if (field === 'state') {
            onFilters({ [field]: value, city: 'all' });
        } else {
            onFilters({ [field]: value });
        }
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

    const renderContactType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Client Type
            </Typography>
            <TextField
                select
                fullWidth
                value={filters.customer_type}
                onChange={(e) => handleFilterChange('customer_type', e.target.value)}
                SelectProps={{
                    MenuProps: {
                        PaperProps: {
                            sx: {
                                maxHeight: 280,
                                borderRadius: 1.5,
                                boxShadow: (theme) => theme.customShadows?.z20 || theme.shadows[10],
                            },
                        },
                    },
                }}
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
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Purchase">Purchase</MenuItem>
            </TextField>
        </Stack>
    );

    const renderSourceLead = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Source Lead
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={
                    filters.source_lead === 'all'
                        ? null
                        : options.source_leads.find((lead) => lead.name === filters.source_lead) || null
                }
                onChange={(event, newValue) => {
                    handleFilterChange('source_lead', newValue ? newValue.name : 'all');
                }}
                options={options.source_leads}
                getOptionLabel={(option) => `${option.lead_name} (${option.name})`}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search leads..."
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
                                {option.lead_name}
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

    const renderCountry = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Country
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={['all', ...options.countries]}
                getOptionLabel={(option) => (option === 'all' ? 'All Countries' : option)}
                value={filters.country || 'all'}
                onChange={(e, newValue) => handleFilterChange('country', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Country"
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

    const renderState = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                State
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                disabled={!filters.country || filters.country === 'all'}
                options={['all', ...options.states]}
                getOptionLabel={(option) => {
                    if (option === 'all') {
                        return !filters.country || filters.country === 'all' ? 'Select Country First' : 'All States';
                    }
                    return option;
                }}
                value={filters.state || 'all'}
                onChange={(e, newValue) => handleFilterChange('state', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select State"
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

    const renderCity = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                City
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                disabled={!filters.state || filters.state === 'all'}
                options={['all', ...options.cities]}
                getOptionLabel={(option) => {
                    if (option === 'all') {
                        return !filters.state || filters.state === 'all' ? 'Select State First' : 'All Cities';
                    }
                    return option;
                }}
                value={filters.city || 'all'}
                onChange={(e, newValue) => handleFilterChange('city', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select City"
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
                    {renderContactType}
                    {renderSourceLead}
                    {renderCountry}
                    {renderState}
                    {renderCity}
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
        </Drawer>
    );
}
