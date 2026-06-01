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

export function TaskResumeDialog({ open, loading, onClose, onConfirmed }: Props) {
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (!open) {
            setRemarks('');
        }
    }, [open]);

    const handleConfirm = () => {
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
                    Resume Task
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
                    The task will be moved back to <strong>In Progress</strong>. You can optionally
                    add a note or instructions for the assignees.
                </Typography>

                <Stack spacing={2.5}>
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}
                        >
                            Resume Notes{' '}
                            <Typography component="span" sx={{ ml: 0.5, color: 'text.disabled', fontStyle: 'italic', fontWeight: 400 }}>
                                (Optional)
                            </Typography>
                        </Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Any instructions or notes for the assignees?"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
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
                        bgcolor: '#0891b2',
                        '&:hover': { bgcolor: '#0e7490' },
                    }}
                >
                    {loading ? 'Resuming...' : 'Confirm & Resume'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
