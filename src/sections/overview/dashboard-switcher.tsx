import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme, alpha } from '@mui/material/styles';

import { useDashboardView } from 'src/hooks/dashboard-view-context';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export function DashboardSwitcher() {
  const theme = useTheme();
  const { user } = useAuth();
  const { view, setView } = useDashboardView();

  const isHR = user?.roles?.some(role => role.toLowerCase() === 'hr');
  const isSalesOrCRM = user?.roles?.some(role => 
    ['sales', 'crm user', 'crm and sales'].includes(role.toLowerCase())
  );
  const isAdmin = user?.roles?.some(role => ['administrator', 'system manager'].includes(role.toLowerCase()));

  // Only show if user has both roles (HR and CRM/Sales)
  const showSwitcher = isHR && isSalesOrCRM;

  if (!showSwitcher) {
    return null;
  }

  const handleToggle = (newView: 'HR' | 'CRM') => {
    setView(newView);
  };

  const renderOption = (label: string, value: 'HR' | 'CRM') => {
    const isActive = view === value;

    return (
      <ButtonBase
        onClick={() => handleToggle(value)}
        sx={{
          flex: 1,
          height: 36,
          borderRadius: '30px',
          px: 2.5,
          zIndex: 1,
          position: 'relative',
          transition: theme.transitions.create(['color'], {
            duration: theme.transitions.duration.shorter,
          }),
          color: isActive ? 'common.white' : 'text.secondary',
          '&:hover': {
            ...(!isActive && {
              color: 'text.primary',
            }),
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: isActive ? 700 : 600,
            whiteSpace: 'nowrap',
            letterSpacing: 0.5,
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            transition: theme.transitions.create(['transform'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          {label}
        </Typography>
      </ButtonBase>
    );
  };

  return (
    <Box
      sx={{
        p: 0.5,
        borderRadius: '40px',
        bgcolor: alpha(theme.palette.grey[500], 0.08),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 220,
        position: 'relative',
        mr: 2,
        overflow: 'hidden',
      }}
    >
      {/* Sliding Background */}
      <Box
        sx={{
          position: 'absolute',
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 8px)',
          left: view === 'HR' ? 4 : 'calc(50%)',
          bgcolor: theme.palette.primary.main,
          borderRadius: '40px',
          boxShadow: `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.35)}`,
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
        }}
      />

      <Stack direction="row" spacing={0} sx={{ width: '100%', position: 'relative', zIndex: 2 }}>
        {renderOption('HR View', 'HR')}
        {renderOption('CRM View', 'CRM')}
      </Stack>
    </Box>
  );
}
