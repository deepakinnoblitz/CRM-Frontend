import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Box, Alert, Button, Snackbar, IconButton, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor/rich-text-editor';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    selectedNote?: { name?: string; title: string; description: string } | null;
    onSave: (title: string, description: string) => Promise<void> | void;
};

export default function LeadNoteDialog({ open, onClose, selectedNote, onSave }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({ title: false });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        if (selectedNote) {
            setTitle(selectedNote.title || '');
            setDescription(selectedNote.description || '');
        } else {
            setTitle('');
            setDescription('');
        }
        setErrors({ title: false });
    }, [selectedNote, open]);

    const handleSave = async () => {
        if (!title.trim()) {
            setErrors({ title: true });
            setSnackbar({
                open: true,
                message: 'Title is required',
                severity: 'error',
            });
            return;
        }

        setIsSaving(true);
        try {
            await onSave(title, description);
            onClose();
        } catch (error: any) {
            console.error('Failed to save note:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to save note',
                severity: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose} 
                fullWidth 
                maxWidth="sm" 
                PaperProps={{ 
                    sx: { borderRadius: 2, boxShadow: (theme) => theme.customShadows.z24 } 
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {selectedNote ? 'Edit Note' : 'Add Note'}
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ borderBottom: 'none', px: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            fullWidth
                            required
                            label="Title"
                            placeholder="Enter note title..."
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (e.target.value.trim()) setErrors({ title: false });
                            }}
                            error={errors.title}
                            helperText={errors.title ? 'Title is required' : ''}
                        />

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
                                Description
                            </Typography>
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="Write your note description here..."
                                minHeight={150}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
                    <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
