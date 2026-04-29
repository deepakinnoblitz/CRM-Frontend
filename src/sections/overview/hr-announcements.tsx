import type { CardProps } from '@mui/material/Card';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme, keyframes } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const marqueeAnimation = keyframes`
  0% { left: 100%; transform: translateX(0); }
  100% { left: 0; transform: translateX(-100%); }
`;

type AnnouncementItem = {
  title: string;
  message: string;
  posting_date: string;
};

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: AnnouncementItem[];
};

export function HRAnnouncements({ title, subheader, list, ...other }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (list.length === 0) return null;

  // ── Hover helpers ─────────────────────────────────────────────────
  // Both the banner AND the panel share one wrapper Box.
  // onMouseLeave only fires when the mouse truly leaves that wrapper,
  // so there's no gap/flicker between the banner and the dropdown.
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <Box
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      sx={{ position: 'relative' }}
    >
      {/* ── Banner ── */}
      <Card
        {...other}
        sx={{
          p: { xs: 1, sm: 1.5 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 1)} 0%, ${alpha(theme.palette.primary.dark, 1)} 100%)`,
          color: 'primary.contrastText',
          borderRadius: 1,
          boxShadow: theme.customShadows.z8,
          position: 'relative',
          height: 52,
          cursor: 'default',
          transition: 'filter 0.2s',
          '&:hover': { filter: 'brightness(1.08)' },
          ...other.sx,
        }}
      >
        {/* Left label */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.75, sm: 1.5 }}
          sx={{
            zIndex: 1,
            flexShrink: 0,
            pr: { xs: 1.5, sm: 2 },
            borderRight: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            bgcolor: 'primary.main',
            height: '100%',
          }}
        >
          <Iconify icon={'solar:volume-loud-bold-duotone' as any} width={22} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Announcements
          </Typography>

          {/* Count badge */}
          <Chip
            label={list.length}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: alpha(theme.palette.common.white, 0.25),
              color: 'inherit',
              '& .MuiChip-label': { px: 0.8 },
            }}
          />
        </Stack>

        {/* Marquee */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            position: 'relative',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              whiteSpace: 'nowrap',
              animation: `${marqueeAnimation} 40s linear infinite`,
              animationFillMode: 'backwards',
              '&:hover': { animationPlayState: 'paused' },
            }}
          >
            {list.map((item, index) => (
              <Stack key={index} direction="row" alignItems="center" spacing={1} sx={{ mx: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {item.title}:
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {item.message}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
                  ({fDate(item.posting_date)})
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>

        {/* Hint arrow */}
        <Iconify
          icon="solar:alt-arrow-down-bold"
          width={18}
          sx={{
            flexShrink: 0,
            ml: 1,
            opacity: 0.7,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </Card>

      {/* ── Dropdown Panel (sibling in same wrapper — no portal gap) ── */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            width: 380,
            maxHeight: 440,
            overflow: 'hidden',
            borderRadius: 2,
            mt: '2px',
            boxShadow: theme.customShadows.z24,
          }}
        >
          {/* Panel Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1.5,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 1)} 0%, ${alpha(theme.palette.primary.dark, 1)} 100%)`,
              color: 'primary.contrastText',
            }}
          >
            <Iconify icon={'solar:volume-loud-bold-duotone' as any} width={20} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1 }}>
              Announcements
            </Typography>
            <Chip
              label={`${list.length} total`}
              size="small"
              sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: 'inherit',
              }}
            />
          </Stack>

          {/* Items */}
          <Box sx={{ overflowY: 'auto', maxHeight: 360 }}>
            {list.map((item, index) => (
              <Box key={index}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    px: 2,
                    py: 1.5,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 36,
                      height: 36,
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon="solar:bell-bold-duotone" width={18} />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.3, color: 'text.primary' }}
                      noWrap
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', lineHeight: 1.4, mb: 0.5 }}
                    >
                      {item.message}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify
                        icon="solar:calendar-bold-duotone"
                        width={13}
                        sx={{ color: 'text.disabled' }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {fDate(item.posting_date)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {index < list.length - 1 && <Divider sx={{ mx: 2 }} />}
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
