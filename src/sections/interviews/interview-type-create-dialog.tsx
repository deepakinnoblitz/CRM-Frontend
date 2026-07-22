import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { createInterviewType } from 'src/api/interviews';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onCreate: (newInterviewType: string) => void;
    currentTypeName?: string;
};

export function InterviewTypeCreateDialog({ open, onClose, onCreate, currentTypeName = '' }: Props) {
    const [typeName, setTypeName] = useState(currentTypeName);
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setTypeName(currentTypeName);
            setNotes('');
            setError('');
        }
    }, [open, currentTypeName]);

    const handleSubmit = async () => {
        if (!typeName.trim()) {
            setError('Interview Type is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await createInterviewType({
                interview_type: typeName.trim(),
                notes: notes.trim()
            });
            onCreate(typeName.trim());
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create interview type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">New Interview Type</Typography>
                </Box>
                <Iconify
                    icon="mingcute:close-line"
                    onClick={onClose}
                    sx={{ cursor: 'pointer', color: 'text.disabled' }}
                />
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        required
                        fullWidth
                        label="Interview Type"
                        value={typeName}
                        onChange={(e) => {
                            setTypeName(e.target.value);
                            if (error) setError('');
                        }}
                        error={!!error && error.includes('Interview Type')}
                        helperText={error && error.includes('Interview Type') ? error : ''}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiFormLabel-asterisk': { color: 'red' } }}
                    />

                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Notes</Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label=""
                            placeholder=""
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.100' : 'grey.900',
                                }
                            }}
                        />
                    </Box>

                    {error && !error.includes('Interview Type') && (
                        <Typography color="error" variant="body2">{error}</Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
