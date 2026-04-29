import React, { useState } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFilter: (event: React.MouseEvent<HTMLElement>) => void;
  numSelected: number;
  activeFiltersCount: number;
  placeholder?: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
};

export function ReferralTableToolbar({
  filterName,
  onFilterName,
  onOpenFilter,
  numSelected,
  activeFiltersCount,
  placeholder = 'Search...',
  sortBy,
  onSortChange,
  sortOptions,
}: Props) {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

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
        p: (theme) => theme.spacing(0, 1, 0, 3),
      }}
    >
      <TextField
        value={filterName}
        onChange={onFilterName}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: { xs: '100%', md: 480 },
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
      />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 2 }}>
        <Button
          disableRipple
          color="inherit"
          onClick={onOpenFilter}
          startIcon={
            <Badge color="error" variant="dot" invisible={activeFiltersCount === 0}>
              <Iconify icon="ic:round-filter-list" />
            </Badge>
          }
          sx={{
            fontWeight: 600,
            height: 40,
            px: 2,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
          }}
        >
          Filters
        </Button>

        <Button
          disableRipple
          color="inherit"
          onClick={handleSortClick}
          startIcon={<Iconify icon={'solar:sort-bold' as any} />}
          sx={{
            fontWeight: 600,
            height: 40,
            px: 2,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
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
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Toolbar>
  );
}
