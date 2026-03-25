import { useState } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { EmployeeEvaluationTableFiltersDrawer } from './employee-evaluation-table-filters-drawer';

// ----------------------------------------------------------------------

type Props = {
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
  // Filters
  filters: any;
  onFilters: (update: any) => void;
  canReset: boolean;
  onResetFilters: VoidFunction;
  currentTab: string;
  traitsOptions: any[];
  hideEmployeeFilter?: boolean;
};

export function EmployeeEvaluationTableToolbar({
  filterName,
  onFilterName,
  sortBy,
  onSortChange,
  sortOptions,
  searchPlaceholder = 'Search...',
  filters,
  onFilters,
  canReset,
  onResetFilters,
  currentTab,
  traitsOptions,
  hideEmployeeFilter,
}: Props) {
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [openFilters, setOpenFilters] = useState(false);

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
      <OutlinedInput
        value={filterName}
        onChange={onFilterName}
        placeholder={searchPlaceholder}
        startAdornment={
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        }
        sx={{ maxWidth: 480, flexGrow: 1 }}
      />

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button
          disableRipple
          color="inherit"
          startIcon={
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="ic:round-filter-list" />
            </Badge>
          }
          onClick={() => setOpenFilters(true)}
          sx={{
            minWidth: 100,
            height: 44,
            px: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            fontWeight: 500,
          }}
        >
          Filters
        </Button>

        <Button
          variant="text"
          color="inherit"
          startIcon={<Iconify icon={"solar:sort-bold" as any} />}
          onClick={handleSortClick}
          sx={{
            minWidth: 160,
            height: 44,
            px: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            fontWeight: 500,
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
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  fontWeight: 'fontWeightSemiBold',
                }),
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <EmployeeEvaluationTableFiltersDrawer
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        onFilters={onFilters}
        canReset={canReset}
        onResetFilters={onResetFilters}
        currentTab={currentTab}
        traitsOptions={traitsOptions}
        hideEmployeeFilter={hideEmployeeFilter}
      />
    </Toolbar>
  );
}
