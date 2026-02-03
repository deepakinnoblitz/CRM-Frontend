import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { autoAllocateSalarySlips } from 'src/api/salary-slips';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
}

export default function SalarySlipAutoAllocateDialog({ open, onClose, onSuccess, onError }: Props) {
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [loading, setLoading] = useState(false);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleAllocate = async () => {
        try {
            setLoading(true);
            const message = await autoAllocateSalarySlips(year, month);
            onSuccess(message);
            onClose();
        } catch (error: any) {
            onError(error.message || 'Failed to generate salary slips');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 2.5 },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Auto Allocate Salary Slips</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value, 10))}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Month"
                            type="number"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: 1, max: 12 }}
                        />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        This will automatically generate salary slips for all active employees for <strong>{monthNames[month - 1]} {year}</strong> based on their attendance and salary components.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    loading={loading}
                    onClick={handleAllocate}
                >
                    Allocate
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
