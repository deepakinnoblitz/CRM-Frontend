import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (message: string) => void;
    title?: string;
    label?: string;
    loading?: boolean;
};

export function ClarificationDialog({
    open,
    onClose,
    onConfirm,
    title = 'Ask Clarification',
    label = 'Message',
    loading = false
}: Props) {
    const [message, setMessage] = useState('');

    const handleConfirm = () => {
        if (!message.trim()) return;
        onConfirm(message);
        setMessage('');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={label}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={!message.trim()}
                >
                    Send
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
