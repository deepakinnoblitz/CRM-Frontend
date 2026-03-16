import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';

import { getForValueOptions } from 'src/api/user-permissions';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    filters: any;
    onFilters: (update: any) => void;
    canReset: boolean;
    onResetFilters: VoidFunction;
    currentTab: string;
    traitsOptions: any[];
};

export function PersonalityTableFiltersDrawer({
    open,
    onClose,
    filters,
    onFilters,
    canReset,
    onResetFilters,
    currentTab,
    traitsOptions,
}: Props) {
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            getForValueOptions('Employee')
                .then(setEmployees)
                .catch(console.error);
        }
    }, [open]);

    const handleFilterEmployee = (newValue: string | null) => {
        onFilters({ employee: newValue });
    };

    const handleFilterTrait = (newValue: string | null) => {
        onFilters({ trait: newValue });
    };

    const handleFilterType = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ evaluation_type: event.target.value });
    };

    const handleFilterStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onFilters({ docstatus: value === 'all' ? null : Number(value) });
    };

    const handleFilterCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilters({ category: event.target.value });
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

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: 320,
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
                    {(currentTab === 'events' || currentTab === 'logs') && (
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Employee
                            </Typography>
                            <Autocomplete
                                options={employees}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    return option.employee_name || option.name || '';
                                }}
                                isOptionEqualToValue={(option, value) => {
                                    const optionValue = typeof option === 'string' ? option : option.name;
                                    const valueProp = typeof value === 'string' ? value : value?.name;
                                    return optionValue === valueProp;
                                }}
                                value={employees.find((emp) => emp.name === filters.employee) || null}
                                onChange={(event, newValue) => handleFilterEmployee(newValue?.name || null)}
                                renderOption={(props, option) => {
                                    const { key, ...optionProps } = props as any;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Stack spacing={0.5}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {option.employee_name || option.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    ID: {option.name}
                                                </Typography>
                                            </Stack>
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select Employee"
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
                                    />
                                )}
                            />
                        </Stack>
                    )}

                    {currentTab === 'events' && (
                        <>
                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Trait
                                </Typography>
                                <Autocomplete
                                    options={traitsOptions}
                                    getOptionLabel={(option) => option.trait_name || option.name || ''}
                                    value={traitsOptions.find((t) => t.name === filters.trait) || null}
                                    onChange={(event, newValue) => handleFilterTrait(newValue?.name || null)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Trait"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1.5,
                                                    bgcolor: 'background.neutral',
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </Stack>

                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Type
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={filters.evaluation_type || 'all'}
                                    onChange={handleFilterType}
                                    SelectProps={{ native: true }}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            bgcolor: 'background.neutral',
                                        },
                                    }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="Agree">Agree</option>
                                    <option value="Neutral">Neutral</option>
                                    <option value="Disagree">Disagree</option>
                                </TextField>
                            </Stack>

                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    Status
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={filters.docstatus ?? 'all'}
                                    onChange={handleFilterStatus}
                                    SelectProps={{ native: true }}
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5,
                                            bgcolor: 'background.neutral',
                                        },
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="0">Draft</option>
                                    <option value="1">Submitted</option>
                                    <option value="2">Cancelled</option>
                                </TextField>
                            </Stack>
                        </>
                    )}

                    {currentTab === 'traits' && (
                        <Stack spacing={1.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Category
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search category..."
                                value={filters.category || ''}
                                onChange={handleFilterCategory}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                        bgcolor: 'background.neutral',
                                    },
                                }}
                            />
                        </Stack>
                    )}
                </Stack>
            </Scrollbar>

            <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
                <Button
                    fullWidth
                    size="large"
                    color="inherit"
                    variant="outlined"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onResetFilters}
                    disabled={!canReset}
                    sx={{ borderRadius: 1.5, fontWeight: 600 }}
                >
                    Clear All Filters
                </Button>
            </Box>
        </Drawer>
    );
}
