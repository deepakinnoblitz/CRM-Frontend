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
  status: string;
  job_opening: string;
  location: string;
};

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: FiltersProps;
  onFilters: (update: Partial<FiltersProps>) => void;
  canReset: boolean;
  onResetFilters: () => void;
  currentTab: string;
  jobOptions: { name: string; job_title: string }[];
  locationOptions: string[];
};

export function ReferralTableFiltersDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  currentTab,
  jobOptions,
  locationOptions,
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

  const renderStatus = currentTab === 'my-referrals' && (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status</Typography>
      <Autocomplete
        fullWidth
        options={['all', 'Pending', 'Accepted', 'Rejected', 'Hired']}
        getOptionLabel={(option) => option === 'all' ? 'All Statuses' : option}
        value={filters.status}
        onChange={(event, newValue) => handleFilterChange('status', newValue || 'all')}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select Status"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                '&:hover': { bgcolor: 'action.hover' },
              },
            }}
          />
        )}
      />
    </Stack>
  );

  const renderJobOpening = currentTab === 'my-referrals' && (
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Job Opening</Typography>
        <Autocomplete
          fullWidth
          options={['all', ...jobOptions.map(j => j.name)]}
          getOptionLabel={(option) => {
            if (option === 'all') return 'All Jobs';
            const job = jobOptions.find(j => j.name === option);
            return job ? job.job_title : option;
          }}
          value={filters.job_opening}
          onChange={(event, newValue) => handleFilterChange('job_opening', newValue || 'all')}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search Jobs"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  '&:hover': { bgcolor: 'action.hover' },
                },
              }}
            />
          )}
        />
      </Stack>
  );

  const renderLocation = currentTab === 'jobs' && (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Location</Typography>
      <Autocomplete
        fullWidth
        options={['all', ...locationOptions]}
        getOptionLabel={(option) => option === 'all' ? 'All Locations' : option}
        value={filters.location}
        onChange={(event, newValue) => handleFilterChange('location', newValue || 'all')}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search Location"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                '&:hover': { bgcolor: 'action.hover' },
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
          {renderStatus}
          {renderJobOpening}
          {renderLocation}
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
    </Drawer>
  );
}
