import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type TaskFiltersProps = {
  status: string;
  project: string;
  priority: string;
  due_date: string | null;
  assignee: string;
  department: string;
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: TaskFiltersProps;
  onFilters: (update: Partial<TaskFiltersProps>) => void;
  canReset: boolean;
  onResetFilters: () => void;
  options: {
    statuses: string[];
    projects: { name: string; project: string }[];
    priorities: string[];
    employees: { name: string; employee_name: string }[];
    departments: { name: string; department_name: string }[];
  };
};

export function TaskTableFiltersDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  options,
}: Props) {
  const handleFilterChange = (field: keyof TaskFiltersProps, value: any) => {
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

  const renderAutocomplete = (
    label: string,
    field: keyof TaskFiltersProps,
    value: string,
    optList: any[],
    getLabel: (opt: any) => string,
    placeholder: string,
    renderOption?: (props: React.HTMLAttributes<HTMLLIElement>, option: any) => React.ReactNode
  ) => (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Autocomplete
        fullWidth
        size="small"
        value={
          value === 'all' || value === ''
            ? null
            : optList.find((opt) =>
                typeof opt === 'string' ? opt === value : opt.name === value
              ) || null
        }
        onChange={(event, newValue) => {
          handleFilterChange(
            field,
            newValue ? (typeof newValue === 'string' ? newValue : newValue.name) : 'all'
          );
        }}
        options={optList}
        getOptionLabel={getLabel}
        renderOption={renderOption}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
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

  const renderDate = (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
        Due Date
      </Typography>
      <DatePicker
        value={filters.due_date ? dayjs(filters.due_date) : null}
        onChange={(newValue) => {
          handleFilterChange('due_date', newValue ? (newValue as any).format('YYYY-MM-DD') : null);
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            },
          },
        }}
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
            width: 320,
            boxShadow: (theme) => theme.customShadows.z24,
          },
        },
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 100,
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {renderHead}

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}>
            {renderAutocomplete(
              'Status',
              'status',
              filters.status,
              options.statuses,
              (opt) => opt,
              'Select status'
            )}
            {renderAutocomplete(
              'Project',
              'project',
              filters.project,
              options.projects,
              (opt) => opt.project,
              'Search projects'
            )}
            {renderAutocomplete(
              'Priority',
              'priority',
              filters.priority,
              options.priorities,
              (opt) => opt,
              'Select priority'
            )}
            {renderAutocomplete(
              'Assignee',
              'assignee',
              filters.assignee,
              options.employees,
              (opt) => opt.employee_name,
              'Search employees',
              (props, option) => {
                const { key, ...optionProps } = props as any;
                return (
                  <li key={key} {...optionProps}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {option.employee_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ID: {option.name}
                      </Typography>
                    </Stack>
                  </li>
                );
              }
            )}
            {renderAutocomplete(
              'Department',
              'department',
              filters.department,
              options.departments,
              (opt) => opt.department_name,
              'Search departments'
            )}
            {renderDate}
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
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      </LocalizationProvider>
    </Drawer>
  );
}
