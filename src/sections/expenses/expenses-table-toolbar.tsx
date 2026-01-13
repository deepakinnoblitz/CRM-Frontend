import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ExpenseTableToolbarProps = {
    numSelected: number;
    filterName: string;
    onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
    searchPlaceholder?: string;
    onDelete?: VoidFunction;
    sortBy?: string;
    onSortChange?: (value: string) => void;
};

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Date: Newest First' },
    { value: 'date_asc', label: 'Date: Oldest First' },
    { value: 'total_desc', label: 'Amount: High to Low' },
    { value: 'total_asc', label: 'Amount: Low to High' },
    { value: 'expense_category_asc', label: 'Category: A to Z' },
    { value: 'expense_category_desc', label: 'Category: Z to A' },
];

export function ExpenseTableToolbar({
    numSelected,
    filterName,
    onFilterName,
    searchPlaceholder = "Search expenses...",
    onDelete,
    sortBy = 'date_desc',
    onSortChange,
}: ExpenseTableToolbarProps) {
    const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortSelect = (value: string) => {
        if (onSortChange) {
            onSortChange(value);
        }
        handleSortClose();
    };

    const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort';

    return (
        <Toolbar
            sx={{
                height: 96,
                display: 'flex',
                justifyContent: 'space-between',
                p: (theme) => theme.spacing(0, 1, 0, 3),
                ...(numSelected > 0 && {
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography component="div" variant="subtitle1">
                    {numSelected} selected
                </Typography>
            ) : (
                <OutlinedInput
                    value={filterName}
                    onChange={onFilterName}
                    placeholder={searchPlaceholder}
                    startAdornment={
                        <InputAdornment position="start">
                            <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    }
                    sx={{ maxWidth: 320 }}
                />
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {numSelected > 0 ? (
                    <IconButton onClick={onDelete}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                ) : (
                    onSortChange && (
                        <>
                            <Button
                                variant="text"
                                color="inherit"
                                startIcon={<Iconify icon={"solar:sort-bold" as any} />}
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
                                slotProps={{
                                    paper: {
                                        sx: {
                                            mt: 1,
                                            minWidth: 200,
                                            boxShadow: (theme) => theme.customShadows.z20,
                                        }
                                    }
                                }}
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        selected={option.value === sortBy}
                                        onClick={() => handleSortSelect(option.value)}
                                        sx={{
                                            typography: 'body2',
                                            ...(option.value === sortBy && {
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                fontWeight: 'fontWeightSemiBold',
                                            })
                                        }}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    )
                )}
            </Box>
        </Toolbar>
    );
}
