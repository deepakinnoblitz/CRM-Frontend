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

const STATUS_OPTIONS = ['all', 'Success', 'Duplicate', 'Failed', 'Pending'];

export type MetaLeadsFilters = {
    meta_app: string;
    meta_page: string;
    meta_form: string;
    processing_status: string;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: MetaLeadsFilters;
    onFilters: (update: Partial<MetaLeadsFilters>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    apps: { name: string; app_name: string }[];
    pages: { name: string; page_name: string }[];
    forms: { name: string; form_name: string }[];
};

export function MetaLeadsFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    apps,
    pages,
    forms,
}: Props) {
    const handleFilterChange = (field: keyof MetaLeadsFilters, value: string) => {
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

    const renderMetaPage = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Meta Page
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.meta_page || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('meta_page', newValue || 'all');
                }}
                options={Array.from(new Set(['all', ...pages.map((p) => p.name), ...(filters.meta_page && filters.meta_page !== 'all' ? [filters.meta_page] : [])]))}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All Pages';
                    const found = pages.find((p) => p.name === option);
                    return found ? found.page_name : option;
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Meta Page..."
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

    const renderMetaForm = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Meta Form
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.meta_form || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('meta_form', newValue || 'all');
                }}
                options={Array.from(new Set(['all', ...forms.map((f) => f.name), ...(filters.meta_form && filters.meta_form !== 'all' ? [filters.meta_form] : [])]))}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All Forms';
                    const found = forms.find((f) => f.name === option);
                    return found ? found.form_name : option;
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Meta Form..."
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

    const renderStatus = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Status
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.processing_status || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('processing_status', newValue || 'all');
                }}
                options={STATUS_OPTIONS}
                getOptionLabel={(option) => (option === 'all' ? 'All Statuses' : option)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Status..."
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
                    {renderMetaPage}
                    {renderMetaForm}
                    {renderStatus}
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
