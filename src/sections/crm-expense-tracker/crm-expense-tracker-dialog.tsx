import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    onSubmit: (data: any) => void;
    currentData?: any;
};

export default function CRMExpenseTrackerDialog({ open, onClose, onSubmit, currentData }: Props) {
    const [type, setType] = useState('Income');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'error',
    });

    const [wasSubmitted, setWasSubmitted] = useState(false);

    useEffect(() => {
        if (open) {
            setWasSubmitted(false);
        }
        if (currentData) {
            setType(currentData.type || 'Income');
            setTitle(currentData.titlenotes || '');
            setAmount(currentData.amount || '');
            setDate(currentData.date_time ? dayjs(currentData.date_time) : dayjs());
        } else {
            setType('Income');
            setTitle('');
            setAmount('');
            setDate(dayjs());
        }
    }, [currentData, open]);

    const handleSubmit = () => {
        setWasSubmitted(true);

        const isTitleValid = !!title.trim();
        const isAmountValid = !!amount && Number(amount) > 0;

        if (!isTitleValid || !isAmountValid) {
            const errs: string[] = [];
            if (!isTitleValid) errs.push('title');
            if (!isAmountValid) errs.push('amount');

            if (errs.length > 1) {
                setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
            } else if (errs[0] === 'title') {
                setSnackbar({ open: true, message: 'Title is required', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: 'Valid amount is required', severity: 'error' });
            }
            return;
        }

        onSubmit({
            type,
            titlenotes: title,
            amount: Number(amount),
            date_time: date ? date.format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, boxShadow: (theme) => theme.customShadows.z24,}}}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {currentData ? 'Edit Record' : 'New Record'}
                <IconButton onClick={onClose}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: 'grid', gap: 3, p: 2 }}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <MenuItem value="Income">Income</MenuItem>
                        <MenuItem value="Expense">Expense</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Title (Notes)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        error={wasSubmitted && !title.trim()}
                        helperText={wasSubmitted && !title.trim() ? "Title is required" : ""}
                    />

                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        error={wasSubmitted && (!amount || Number(amount) <= 0)}
                        helperText={wasSubmitted && (!amount || Number(amount) <= 0) ? "Valid amount is required" : ""}
                        slotProps={{
                            input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled' }}>₹</Box> }
                        }}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={date}
                            onChange={(newValue) => setDate(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Box>
            </DialogContent>

            <DialogActions sx={{m:1}}>
                <Button variant="contained" onClick={handleSubmit} color="primary">
                    {currentData ? 'Update' : 'Create'}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%', boxShadow: (theme) => theme.customShadows.z8 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
