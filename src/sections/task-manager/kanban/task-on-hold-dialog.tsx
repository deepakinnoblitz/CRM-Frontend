import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
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
    loading?: boolean;
    onClose: () => void;
    onConfirmed: (remarks: string) => void;
};

export function TaskOnHoldDialog({ open, loading, onClose, onConfirmed }: Props) {
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setRemarks('');
            setError(null);
        }
    }, [open]);

    const handleConfirm = () => {
        if (!remarks.trim()) {
            setError('Please enter a reason for putting this task on hold');
            return;
        }
        setError(null);
        onConfirmed(remarks.trim());
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
                    Put Task On Hold
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
                    Please provide a reason for putting this task on hold. The task creator will be
                    notified and the task will be paused until resumed.
                </Typography>

                <Stack spacing={2.5}>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                        >
                            On Hold Reason{' '}
                            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Why is this task being put on hold?"
                            value={remarks}
                            onChange={(e) => {
                                setRemarks(e.target.value);
                                setError(null);
                            }}
                            error={Boolean(error)}
                            helperText={error || ''}
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={loading}
                    sx={{
                        fontWeight: 800,
                        bgcolor: '#f59e0b',
                        '&:hover': { bgcolor: '#d97706' },
                    }}
                >
                    {loading ? 'Putting On Hold...' : 'Confirm & Put On Hold'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
