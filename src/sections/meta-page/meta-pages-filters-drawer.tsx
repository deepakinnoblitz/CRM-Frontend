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

const WEBHOOK_OPTIONS = ['all', 'yes', 'no'];
const ACTIVE_OPTIONS = ['all', 'yes', 'no'];

export type MetaPagesFilters = {
    meta_app: string;
    webhook_enabled: string;
    is_active: string;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: MetaPagesFilters;
    onFilters: (update: Partial<MetaPagesFilters>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    apps: { name: string; app_name: string }[];
};

export function MetaPagesFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    apps,
}: Props) {
    const handleFilterChange = (field: keyof MetaPagesFilters, value: string) => {
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

    const renderMetaApp = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Meta App
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.meta_app || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('meta_app', newValue || 'all');
                }}
                options={Array.from(new Set(['all', ...apps.map((a) => a.name), ...(filters.meta_app && filters.meta_app !== 'all' ? [filters.meta_app] : [])]))}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All Apps';
                    const found = apps.find((a) => a.name === option);
                    return found ? found.app_name : option;
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Meta App..."
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

    const renderWebhookEnabled = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Webhook Enabled
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.webhook_enabled || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('webhook_enabled', newValue || 'all');
                }}
                options={WEBHOOK_OPTIONS}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All';
                    if (option === 'yes') return 'Enabled';
                    return 'Disabled';
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Webhook Status..."
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
                    {renderMetaApp}
                    {renderWebhookEnabled}
                    {renderActive}
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
