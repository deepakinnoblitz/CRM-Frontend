import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['all', 'Draft', 'Generated', 'Printed', 'Cancelled'];

type FiltersProps = {
    document_template: string;
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
    templates: any[];
};

export function HRDocumentGenerationFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    templates,
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

    const renderTemplate = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                Document Template
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={[{ name: 'all', template_name: 'All Templates' }, ...templates]}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.template_name || option.name)}
                value={
                    filters.document_template === 'all'
                        ? { name: 'all', template_name: 'All Templates' }
                        : templates.find((t) => t.name === filters.document_template) || {
                              name: filters.document_template,
                              template_name: filters.document_template,
                          }
                }
                onChange={(_, newValue) => {
                    const selectedVal = typeof newValue === 'string' ? newValue : newValue?.name || 'all';
                    handleFilterChange('document_template', selectedVal);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select template"
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
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                Status
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                options={STATUS_OPTIONS}
                getOptionLabel={(option) => (option === 'all' ? 'All Statuses' : option)}
                value={filters.status}
                onChange={(_, newValue) => {
                    handleFilterChange('status', newValue || 'all');
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select status"
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
                    {renderTemplate}
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
