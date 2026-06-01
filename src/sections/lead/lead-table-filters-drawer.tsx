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
    status: string;
    workflow_state: string;
    leads_from: string;
    leads_type: string;
    service: string;
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
        status: { value: string; label: string }[];
        workflow_states: string[];
        leads_from: string[];
        services: string[];
        countries: string[];
        states: string[];
        cities: string[];
    };
};

export function LeadTableFiltersDrawer({
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

    const renderWorkflowState = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Status
            </Typography>
            <TextField
                select
                fullWidth
                value={filters.workflow_state}
                onChange={(e) => handleFilterChange('workflow_state', e.target.value)}
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
                <MenuItem value="all">All States</MenuItem>
                {options.workflow_states.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );

    const renderLeadsFrom = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Lead Source
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={['all', ...options.leads_from]}
                getOptionLabel={(option) => (option === 'all' ? 'All Sources' : option)}
                value={filters.leads_from || 'all'}
                onChange={(e, newValue) => handleFilterChange('leads_from', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Lead Source"
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

    const renderLeadsType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Lead Type
            </Typography>
            <TextField
                select
                fullWidth
                value={filters.leads_type}
                onChange={(e) => handleFilterChange('leads_type', e.target.value)}
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
                <MenuItem value="Incoming">Incoming</MenuItem>
                <MenuItem value="Outgoing">Outgoing</MenuItem>
            </TextField>
        </Stack>
    );

    const renderService = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Service
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={['all', ...options.services]}
                getOptionLabel={(option) => (option === 'all' ? 'All Services' : option)}
                value={filters.service || 'all'}
                onChange={(e, newValue) => handleFilterChange('service', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Service"
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
                    {renderWorkflowState}
                    {renderLeadsType}
                    {renderLeadsFrom}
                    {renderService}
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
