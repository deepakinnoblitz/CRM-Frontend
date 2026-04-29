import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmed: (remarks: string) => void;
  loading?: boolean;
};

export function TaskReopenDialog({ open, onClose, onConfirmed, loading }: Props) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRemarks('');
      setError(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (!remarks) {
      setError('Please enter remarks for reopening the task');
      return;
    }
    setError(null);
    onConfirmed(remarks);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.neutral',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Reopen Task
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.disabled',
            bgcolor: 'background.paper',
            boxShadow: (theme: any) => theme.customShadows?.z1,
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Please provide a reason or additional instructions for reopening this task.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reopen Remarks"
            placeholder="Why is this task being reopened?"
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setError(null);
            }}
            error={Boolean(error)}
            helperText={error || ''}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          startIcon={<Iconify icon="solar:restart-bold" />}
          sx={{
            fontWeight: 800,
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          {loading ? 'Reopening...' : 'Confirm & Reopen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
