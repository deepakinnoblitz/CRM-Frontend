import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['all', 'Development', 'Live'];
const ACTIVE_OPTIONS = ['all', 'yes', 'no'];
const DEFAULT_OPTIONS = ['all', 'yes', 'no'];

export type MetaAppsFilters = {
    app_status: string;
    is_active: string;
    is_default: string;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: MetaAppsFilters;
    onFilters: (update: Partial<MetaAppsFilters>) => void;
    canReset: boolean;
    onResetFilters: () => void;
};

export function MetaAppsFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
}: Props) {
    const handleFilterChange = (field: keyof MetaAppsFilters, value: string) => {
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

    const renderAppStatus = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                App Status
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.app_status || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('app_status', newValue || 'all');
                }}
                options={STATUS_OPTIONS}
                getOptionLabel={(option) => (option === 'all' ? 'All Statuses' : option)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select App Status..."
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

    const renderActive = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Active
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.is_active || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('is_active', newValue || 'all');
                }}
                options={ACTIVE_OPTIONS}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All';
                    if (option === 'yes') return 'Active';
                    return 'Inactive';
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Active Status..."
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

    const renderDefault = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Default
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.is_default || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('is_default', newValue || 'all');
                }}
                options={DEFAULT_OPTIONS}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All';
                    if (option === 'yes') return 'Default';
                    return 'Non-default';
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Default Status..."
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
                    {renderAppStatus}
                    {renderActive}
                    {renderDefault}
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
