import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  assignment: any;
};

export function BadgeAssignmentDetailDialog({ open, onClose, assignment }: Props) {
  if (!assignment) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}
      >
        Assignment Details
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <Iconify icon="mingcute:close-line" width={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3, pt: 1 }}>
        <Stack spacing={3}>
          {/* Badge Preview */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
                p: 1,
              }}
            >
              {assignment['badge.icon'] || assignment.badge_icon || assignment.icon ? (
                <Box
                  component="img"
                  src={assignment['badge.icon'] || assignment.badge_icon || assignment.icon}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Iconify icon="solar:medal-star-bold" width={32} sx={{ color: 'text.disabled' }} />
              )}
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {assignment.badge}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Awarded to {assignment.employee_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                ID: {assignment.employee}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Details */}
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Awarded On
              </Typography>
              <Typography variant="subtitle2">
                {fDate(assignment.awarded_on, 'DD-MM-YYYY')}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Awarded By
              </Typography>
              <Typography variant="subtitle2">{assignment.awarded_by}</Typography>
            </Stack>
          </Stack>

          {/* Reason Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 700 }}
            >
              Reason
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>
              {assignment.reason || 'No reason provided for this assignment.'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
