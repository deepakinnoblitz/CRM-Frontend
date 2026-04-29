import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  badge: any;
};

export function BadgeDetailDialog({ open, onClose, badge }: Props) {
  if (!badge) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
      >
        Badge Details
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Iconify icon="mingcute:close-line" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              overflow: 'hidden',
            }}
          >
            {badge.icon ? (
              <Box
                component="img"
                src={badge.icon}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Iconify icon="solar:medal-star-bold" width={80} sx={{ color: 'text.disabled' }} />
            )}
          </Box>

          <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {badge.badge_name}
            </Typography>
            <Label
              variant="soft"
              color={
                (badge.badge_type === 'Achievement' && 'success') ||
                (badge.badge_type === 'Performance' && 'info') ||
                'warning'
              }
              sx={{ textTransform: 'uppercase' }}
            >
              {badge.badge_type}
            </Label>
          </Stack>

          <Box
            sx={{
              width: '100%',
              p: 2.5,
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.background.neutral,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 700 }}
            >
              Description
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
              {badge.description || 'No description available for this badge.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
