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

const DOCUMENT_TYPE_OPTIONS = ['all', 'Lead', 'Contacts', 'Accounts', 'Deal', 'Proposal'];
const STATUS_OPTIONS = ['all', '1', '0'];

export type WhatsAppAutomationsFiltersProps = {
    whatsapp_template: string;
    document_type: string;
    is_active: string;
};

type Props = {
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    filters: WhatsAppAutomationsFiltersProps;
    onFilters: (update: Partial<WhatsAppAutomationsFiltersProps>) => void;
    canReset: boolean;
    onResetFilters: () => void;
    options: {
        templates: { name: string; template_name: string }[];
    };
};

export function WhatsAppAutomationsFiltersDrawer({
    open,
    onOpen,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    options,
}: Props) {
    const handleFilterChange = (field: keyof WhatsAppAutomationsFiltersProps, value: string) => {
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
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                WhatsApp Template
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={
                    filters.whatsapp_template === 'all' || !filters.whatsapp_template
                        ? null
                        : options.templates.find((t) => t.name === filters.whatsapp_template) || null
                }
                onChange={(event, newValue) => {
                    handleFilterChange('whatsapp_template', newValue ? newValue.name : 'all');
                }}
                options={options.templates}
                getOptionLabel={(option) => option.template_name || option.name || ''}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Template..."
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
                renderOption={(props, option) => {
                    const { key, ...optionProps } = props as any;
                    return (
                        <li key={key || option.name} {...optionProps}>
                            <Typography variant="body2">
                                {option.template_name || option.name}
                            </Typography>
                        </li>
                    );
                }}
            />
        </Stack>
    );

    const renderDocumentType = (
        <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Document Type
            </Typography>
            <Autocomplete
                fullWidth
                size="small"
                value={filters.document_type || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('document_type', newValue || 'all');
                }}
                options={DOCUMENT_TYPE_OPTIONS}
                getOptionLabel={(option) => (option === 'all' ? 'All Document Types' : option)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Select Document Type..."
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
                value={filters.is_active || 'all'}
                onChange={(event, newValue) => {
                    handleFilterChange('is_active', newValue || 'all');
                }}
                options={STATUS_OPTIONS}
                getOptionLabel={(option) => {
                    if (option === 'all') return 'All';
                    if (option === '1') return 'Active';
                    return 'Inactive';
                }}
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
                    {renderTemplate}
                    {renderDocumentType}
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
