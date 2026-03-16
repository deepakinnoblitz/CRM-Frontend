import React from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import { alpha, Theme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TaskTableToolbarProps = {
    filterName: string;
    onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    sortOptions: { value: string; label: string }[];
    canReset: boolean;
    onOpenFilter: () => void;
};

export function TaskTableToolbar({
    filterName,
    onFilterName,
    sortBy,
    onSortChange,
    sortOptions,
    canReset,
    onOpenFilter,
}: TaskTableToolbarProps) {
    const [sortAnchorEl, setSortAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortSelect = (value: string) => {
        onSortChange(value);
        handleSortClose();
    };

    const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Sort';
    return (
        <Toolbar
            sx={{
                height: 96,
                display: 'flex',
                justifyContent: 'space-between',
                p: (theme: Theme) => theme.spacing(0, 1, 0, 3),
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
                <TextField
                    value={filterName}
                    onChange={onFilterName}
                    placeholder="Search tasks..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        maxWidth: 480,
                        width: 1,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                        },
                    }}
                />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
                <Button
                    disableRipple
                    color="inherit"
                    startIcon={
                        <Badge color="error" variant="dot" invisible={!canReset}>
                            <Iconify icon="ic:round-filter-list" />
                        </Badge>
                    }
                    onClick={onOpenFilter}
                    sx={{
                        color: 'text.primary',
                        bgcolor: 'background.neutral',
                        border: '1px solid',
                        borderColor: 'divider',
                        height: 40,
                        px: 2,
                        fontWeight: 500,
                        borderRadius: 1,
                        '&:hover': {
                            bgcolor: 'action.hover',
                        },
                    }}
                >
                    Filters
                </Button>

                <Box sx={{ position: 'relative' }}>
                    <Button
                        variant="text"
                        color="inherit"
                        startIcon={<Iconify icon="solar:sort-bold" />}
                        onClick={handleSortClick}
                        sx={{
                            minWidth: 160,
                            height: 40,
                            px: 2,
                            color: 'text.primary',
                            bgcolor: 'background.neutral',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            fontWeight: 500,
                            '&:hover': {
                                bgcolor: 'action.hover',
                            }
                        }}
                    >
                        {currentSortLabel}
                    </Button>

                    <Menu
                        anchorEl={sortAnchorEl}
                        open={Boolean(sortAnchorEl)}
                        onClose={handleSortClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {sortOptions.map((option) => (
                            <MenuItem
                                key={option.value}
                                selected={option.value === sortBy}
                                onClick={() => handleSortSelect(option.value)}
                                sx={{
                                    typography: 'body2',
                                    ...(option.value === sortBy && {
                                        bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
                                        fontWeight: 'fontWeightSemiBold',
                                    }),
                                }}
                            >
                                {option.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Stack>
        </Toolbar>
    );
}
