import type { Dayjs } from 'dayjs';
import type { SalarySlip } from 'src/api/salary-slips';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { getDoctypeList } from 'src/api/leads';
import { createSalarySlip, updateSalarySlip } from 'src/api/salary-slips';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
    slip?: SalarySlip | null;
}


export default function SalarySlipCreateDialog({ open, onClose, onSuccess, onError, slip }: Props) {

    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        employee: '',
        pay_period_start: dayjs().startOf('month'),
        pay_period_end: dayjs().endOf('month'),
    });

    useEffect(() => {
        if (slip) {
            setFormData({
                employee: slip.employee,
                pay_period_start: dayjs(slip.pay_period_start),
                pay_period_end: dayjs(slip.pay_period_end),
            });
        } else {
            setFormData({
                employee: '',
                pay_period_start: dayjs().startOf('month'),
                pay_period_end: dayjs().endOf('month'),
            });
        }
    }, [slip, open]);


    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const data = await getDoctypeList('Employee', ['name', 'employee_name']);
                setEmployees(data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchEmployees();
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            if (!formData.employee) {
                onError('Please select an employee');
                return;
            }

            setSubmitting(true);
            const data = {
                employee: formData.employee,
                pay_period_start: formData.pay_period_start.format('YYYY-MM-DD'),
                pay_period_end: formData.pay_period_end.format('YYYY-MM-DD'),
            };

            if (slip) {
                await updateSalarySlip(slip.name, data);
                onSuccess(`Salary slip ${slip.name} updated successfully`);
            } else {
                const result = await createSalarySlip(data);
                onSuccess(result?.name ? `Salary slip ${result.name} created successfully` : 'Salary slip created successfully');
            }

            handleClose();
        } catch (error: any) {
            onError(error.message || 'Failed to create salary slip');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            employee: '',
            pay_period_start: dayjs().startOf('month'),
            pay_period_end: dayjs().endOf('month'),
        });
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 2.5 },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{slip ? 'Edit Salary Slip' : 'Create New Salary Slip'}</Typography>
                <IconButton onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>


            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                        select
                        fullWidth
                        label="Employee"
                        value={formData.employee}
                        onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                        disabled={loading}
                    >
                        {employees.map((emp) => (
                            <MenuItem key={emp.name} value={emp.name}>
                                {emp.employee_name} ({emp.name})
                            </MenuItem>
                        ))}
                    </TextField>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Stack direction="row" spacing={2}>
                            <DatePicker
                                label="Pay Period Start"
                                value={formData.pay_period_start}
                                onChange={(newValue) => setFormData({ ...formData, pay_period_start: newValue as Dayjs })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker
                                label="Pay Period End"
                                value={formData.pay_period_end}
                                onChange={(newValue) => setFormData({ ...formData, pay_period_end: newValue as Dayjs })}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Stack>
                    </LocalizationProvider>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button variant="outlined" onClick={handleClose}>
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    loading={submitting}
                    onClick={handleSubmit}
                    disabled={!formData.employee}
                >
                    {slip ? 'Update' : 'Create'}
                </LoadingButton>

            </DialogActions>
        </Dialog>
    );
}
