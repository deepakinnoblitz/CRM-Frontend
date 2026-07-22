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

type FiltersProps = {
    month: string;
    status: string;
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
        months: string[];
        statuses: string[];
    };
};

export function SalesTargetEntryTableFiltersDrawer({
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

    const renderMonth = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Month
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={['all', ...options.months]}
                getOptionLabel={(option) => (option === 'all' ? 'All Months' : option)}
                value={filters.month || 'all'}
                onChange={(e, newValue) => handleFilterChange('month', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Month"
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
                options={['all', ...options.statuses]}
                getOptionLabel={(option) => (option === 'all' ? 'All Statuses' : option)}
                value={filters.status || 'all'}
                onChange={(e, newValue) => handleFilterChange('status', newValue || 'all')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Status"
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
                    {renderMonth}
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
                >
                    Clear All Filters
                </Button>
            </Box>
        </Drawer>
    );
}
