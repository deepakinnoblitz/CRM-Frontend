import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';

import { useDashboardView } from 'src/hooks/dashboard-view-context';

import { useAuth } from 'src/auth/auth-context';

export function DashboardSwitcher() {
  const theme = useTheme();
  const { user } = useAuth();
  const { view, setView } = useDashboardView();
  const [pressed, setPressed] = useState(false);

  const isHR = user?.roles?.some((role) => role.toLowerCase() === 'hr');
  const isSalesOrCRM = user?.roles?.some((role) =>
    ['sales', 'crm user', 'crm and sales'].includes(role.toLowerCase())
  );

  if (!isHR || !isSalesOrCRM) return null;

  const activeIndex = view === 'HR' ? 0 : 1;

  const renderOption = (label: string, value: 'HR' | 'CRM') => {
    const isActive = view === value;

    return (
      <ButtonBase
        disableRipple
        onClick={() => setView(value)}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        sx={{
          flex: 1,
          height: 32,
          borderRadius: '30px',
          px: 1.5,
          zIndex: 2,
          position: 'relative',
          transition: theme.transitions.create(
            ['color', 'transform', 'text-shadow'],
            { duration: 280, easing: theme.transitions.easing.easeInOut }
          ),
          color: isActive ? 'common.white' : 'text.disabled',
          textShadow: isActive
            ? `0 1px 10px ${alpha(theme.palette.common.black, 0.2)}`
            : 'none',
          '&:hover': !isActive
            ? {
                color: 'primary.main',
                transform: 'translateY(-1px)',
              }
            : {},
          '&:active': {
            transform: 'scale(0.96)',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: isActive ? 700 : 600,
            whiteSpace: 'nowrap',
            transform: isActive ? 'scale(1.04)' : 'scale(1)',
            transition: theme.transitions.create('transform', {
              duration: 280,
              easing: theme.transitions.easing.easeInOut,
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
        p: 0.25,
        borderRadius: '40px',
        background: `linear-gradient(135deg,
          ${alpha(theme.palette.common.white, 0.94)},
          ${alpha(theme.palette.primary.lighter ?? theme.palette.primary.light, 0.16)}
        )`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: 220,  // ← added
        position: 'relative',
        mr: 2,
        overflow: 'hidden',
        boxShadow: `
          0 16px 36px -24px ${alpha(theme.palette.common.black, 0.36)},
          inset 0 1px 0 ${alpha(theme.palette.common.white, 0.92)}
        `,
        transition: theme.transitions.create('box-shadow', { duration: 300 }),
        '&:hover': {
          boxShadow: `
            0 18px 40px -24px ${alpha(theme.palette.primary.main, 0.45)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.95)}
          `,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 'calc(50% - 2px)',
          height: 'calc(100% - 4px)',
          borderRadius: '32px',
          background: `linear-gradient(135deg,
            ${theme.palette.primary.light},
            ${theme.palette.primary.main} 52%,
            ${theme.palette.primary.dark}
          )`,
          boxShadow: `
            0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.7)},
            0 0 18px ${alpha(theme.palette.primary.main, 0.34)},
            inset 0 1px 0 ${alpha(theme.palette.common.white, 0.32)}
          `,
          transform: `translateX(${activeIndex * 100}%) scale(${pressed ? 0.95 : 1})`,
          transition: theme.transitions.create(['transform', 'box-shadow'], {
            easing: theme.transitions.easing.easeInOut,
            duration: 320,
          }),
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 1,
            borderRadius: 'inherit',
            background: `linear-gradient(180deg,
              ${alpha(theme.palette.common.white, 0.34)},
              ${alpha(theme.palette.common.white, 0)}
            )`,
            pointerEvents: 'none',
          },
        }}
      />

      <Stack direction="row" sx={{ width: '100%', position: 'relative', zIndex: 3 }}>
        {renderOption('HR View', 'HR')}
        {renderOption('CRM View', 'CRM')}
      </Stack>
    </Box>
  );
}