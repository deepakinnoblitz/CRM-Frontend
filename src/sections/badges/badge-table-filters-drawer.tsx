import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
  badgeOptions?: any[];
  employeeOptions?: any[];
};

export function BadgeTableFiltersDrawer({
  open,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  currentTab,
  badgeOptions = [],
  employeeOptions = [],
}: Props) {
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
            boxShadow: (theme: any) => theme.customShadows.z24,
          },
        },
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 100,
      }}
    >
      {renderHead}

      <Scrollbar>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={3} sx={{ p: 3 }}>
            {currentTab === 'badges' ? (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Badge Type
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={filters.badge_type || 'all'}
                  onChange={(e) => onFilters({ badge_type: e.target.value })}
                  SelectProps={{ native: true }}
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
                >
                  <option value="all">All Types</option>
                  <option value="Performance">Performance</option>
                  <option value="Behavior">Behavior</option>
                  <option value="Achievement">Achievement</option>
                </TextField>
              </Stack>
            ) : (
              <>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Employee
                  </Typography>
                  <Autocomplete
                    fullWidth
                    options={employeeOptions || []}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return option.employee_name ? `${option.employee_name} (${option.name})` : option.name || '';
                    }}
                    value={employeeOptions?.find((emp) => emp.name === filters.employee) || null}
                    onChange={(event, newValue) => onFilters({ employee: newValue?.name || null })}
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

                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    Badge
                  </Typography>
                  <Autocomplete
                    fullWidth
                    options={badgeOptions || []}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return option.badge_name || option.name || '';
                    }}
                    value={badgeOptions?.find((badge) => badge.name === filters.badge) || null}
                    onChange={(event, newValue) => onFilters({ badge: newValue?.name || null })}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props as any;
                      return (
                        <li key={key} {...optionProps}>
                          <Stack spacing={0.5} direction="row" alignItems="center">
                            {option.icon && (
                               <Box component="img" src={option.icon} sx={{ width: 24, height: 24, mr: 1, borderRadius: 0.5 }} />
                            )}
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {option.badge_name || option.name}
                            </Typography>
                          </Stack>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        placeholder="Select Badge" 
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
              </>
            )}

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                Date Range
              </Typography>
              <Stack spacing={2}>
                <DatePicker
                  label="Start Date"
                  format="DD-MM-YYYY"
                  value={filters.startDate ? dayjs(filters.startDate) : null}
                  onChange={(newValue) => onFilters({ startDate: newValue ? newValue.format('YYYY-MM-DD') : null })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        },
                      }
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  format="DD-MM-YYYY"
                  value={filters.endDate ? dayjs(filters.endDate) : null}
                  onChange={(newValue) => onFilters({ endDate: newValue ? newValue.format('YYYY-MM-DD') : null })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'medium',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                          bgcolor: 'background.neutral',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        },
                      }
                    }
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </LocalizationProvider>
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
