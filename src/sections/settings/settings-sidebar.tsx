import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  data: any;
  onChange: (fieldname: string, value: any) => void;
};

export function SettingsSidebar({ data, onChange }: Props) {
  const ITEMS = [
    {
      label: 'Attendance List',
      fieldname: 'show_attendance_list',
      description: 'Manage the visibility of the main Attendance tracking list',
      icon: 'solar:calendar-date-bold-duotone',
      color: '#FFAB00',
    },
    {
      label: 'Daily Log',
      fieldname: 'show_daily_log',
      description: 'Control the Daily Log / Activity Log entry in the navigation',
      icon: 'solar:clipboard-list-bold-duotone',
      color: '#00B8D9',
    },
    {
      label: 'Attendance Report',
      fieldname: 'show_attendance_report',
      description: 'Configure visibility for Attendance summary and analytics reports',
      icon: 'solar:chart-bold-duotone',
      color: '#36B37E',
    },
    {
      label: 'Daily Log Report',
      fieldname: 'show_daily_log_report',
      description: 'Manage the Daily Log analytics and export report access',
      icon: 'solar:document-text-bold-duotone',
      color: '#FF5630',
    },
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Sidebar Navigation Settings
      </Typography>

      <Stack spacing={3}>
        {ITEMS.map((item) => (
          <Stack
            key={item.fieldname}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: (theme) => `solid 1px ${theme.palette.divider}`,
              transition: (theme) => theme.transitions.create(['all']),
              '&:hover': {
                bgcolor: 'background.neutral',
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                borderRadius: 1.5,
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => (theme.palette.mode === 'light' ? `${item.color}14` : `${item.color}29`),
                color: item.color,
              }}
            >
              <Iconify icon={item.icon as any} width={28} />
            </Box>

            <ListItemText
              primary={item.label}
              secondary={item.description}
              primaryTypographyProps={{ variant: 'subtitle1', fontWeight: 'fontWeightBold' }}
              secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />

            <Switch
              color="primary"
              checked={Boolean(data?.[item.fieldname] ?? 1)}
              onChange={(event) => onChange(item.fieldname, event.target.checked ? 1 : 0)}
              sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#08a3cd',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#08a3cd',
                  },
              }}
            />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
