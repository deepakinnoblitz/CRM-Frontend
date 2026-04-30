import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { 
    createLeaveType, 
    updateLeaveType, 
    renameLeaveType, 
    getLeaveType, 
    LeaveType
} from 'src/api/masters';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    id?: string | null;
};

const STATUS_OPTIONS = ['Active', 'Inactive'];
const RESET_FREQUENCY_OPTIONS = ['', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

export function LeaveTypeDialog({ open, onClose, onSuccess, id }: Props) {
    const [leaveTypeName, setLeaveTypeName] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [maxLeaves, setMaxLeaves] = useState<number | string>('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    const [carryForward, setCarryForward] = useState(false);
    const [resetFrequency, setResetFrequency] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        const fetchData = async () => {
            if (open) {
                if (id) {
                    try {
                        setLoading(true);
                        const data = await getLeaveType(id);
                        setLeaveTypeName(data.leave_type_name || data.name || '');
                        setIsPaid(!!data.is_paid);
                        setMaxLeaves(data.max_leaves ?? '');
                        setStatus(data.status || 'Active');
                        setCarryForward(!!data.carry_forward);
                        setResetFrequency(data.reset_frequency || '');
                    } catch (err) {
                        console.error('Failed to fetch leave type:', err);
                        setSnackbar({ open: true, message: 'Failed to fetch details', severity: 'error' });
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setLeaveTypeName('');
                    setIsPaid(false);
                    setMaxLeaves('');
                    setStatus('Active');
                    setCarryForward(false);
                    setResetFrequency('');
                }
                setError('');
            }
        };

        fetchData();
    }, [open, id]);

    const handleSubmit = async () => {
        if (!leaveTypeName.trim()) {
            setError('name');
            setSnackbar({ open: true, message: 'Leave Type name is required', severity: 'error' });
            return;
        }

        try {
            setLoading(true);
            setError('');

            const data: Partial<LeaveType> = {
                leave_type_name: leaveTypeName,
                is_paid: isPaid ? 1 : 0,
                max_leaves: typeof maxLeaves === 'number' ? maxLeaves : (maxLeaves ? Number(maxLeaves) : 0),
                status,
                carry_forward: carryForward ? 1 : 0,
                reset_frequency: resetFrequency as any,
            };

            if (id) {
                let currentId = id;
                // Handle renaming if the leave type name has changed
                if (leaveTypeName !== id) {
                    await renameLeaveType(id, leaveTypeName);
                    currentId = leaveTypeName;
                }
                await updateLeaveType(currentId, data);
            } else {
                await createLeaveType(data);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Failed to save';
            setError(msg);
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{id ? 'Edit Leave Type' : 'New Leave Type'}</Typography>
                <Iconify icon="mingcute:close-line" onClick={onClose} sx={{ cursor: 'pointer', color: 'text.disabled' }} />
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                        <TextField
                            required
                            fullWidth
                            label="Leave Type Name"
                            value={leaveTypeName}
                            onChange={(e) => {
                                 setLeaveTypeName(e.target.value);
                                 if (error === 'name') setError('');
                            }}
                            error={error === 'name'}
                            disabled={loading}
                            autoFocus
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiFormLabel-asterisk': { color: 'red' } }}
                        />
                        <TextField
                            fullWidth
                            label="Max Leaves"
                            type="number"
                            value={maxLeaves}
                            onChange={(e) => setMaxLeaves(e.target.value)}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Reset Frequency"
                            value={resetFrequency}
                            onChange={(e) => setResetFrequency(e.target.value)}
                            SelectProps={{ native: true }}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                        >
                            {RESET_FREQUENCY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt || 'None'}</option>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            SelectProps={{ native: true }}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </TextField>
                    </Box>

                    <Stack direction="row" spacing={3}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPaid}
                                    onChange={(e) => setIsPaid(e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Is Paid"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={carryForward}
                                    onChange={(e) => setCarryForward(e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Carry Forward"
                        />
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    fullWidth
                    disabled={loading} 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
                >
                    {id ? 'Save Changes' : 'Create'}
                </Button>
            </DialogActions>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
}
