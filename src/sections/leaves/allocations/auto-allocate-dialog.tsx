import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { getLeaveAllocationPreview, autoAllocateMonthlyLeaves, type EmployeeAllocationPreview } from 'src/api/leave-allocations';

import { Iconify } from 'src/components/iconify';

interface AutoAllocateDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
}

export default function AutoAllocateDialog({ open, onClose, onSuccess, onError }: AutoAllocateDialogProps) {
    const currentDate = new Date();
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [previewData, setPreviewData] = useState<EmployeeAllocationPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [allocating, setAllocating] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const handleClose = () => {
        setStep('input');
        setPreviewData([]);
        setSearchQuery('');
        onClose();
    };

    const handlePreview = async () => {
        try {
            setLoading(true);
            const data = await getLeaveAllocationPreview(year, month);
            setPreviewData(data);
            setStep('preview');
        } catch (error: any) {
            onError(error.message || 'Failed to load preview');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('input');
        setPreviewData([]);
        setSearchQuery('');
    };

    const handleAllocate = async () => {
        try {
            setAllocating(true);
            const message = await autoAllocateMonthlyLeaves(year, month);
            onSuccess(message);
            handleClose();
        } catch (error: any) {
            onError(error.message || 'Failed to allocate leaves');
        } finally {
            setAllocating(false);
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const filteredData = previewData.filter(row =>
        row.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={step === 'preview' ? 'lg' : 'sm'}
            PaperProps={{
                sx: { borderRadius: 2.5 },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Auto Allocate Monthly Leaves</Typography>
                <IconButton onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {step === 'input' ? (
                    <Box sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    views={['year']}
                                    label="Year"
                                    value={dayjs().year(year)}
                                    onChange={(newValue) => setYear(newValue ? newValue.year() : new Date().getFullYear())}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                            <TextField
                                select
                                fullWidth
                                label="Month"
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                            >
                                {monthNames.map((name, index) => (
                                    <MenuItem key={name} value={index + 1}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                            This will allocate Paid Leave (1 day), Unpaid Leave (30 days), and Permission (120 minutes) to all active employees for {monthNames[month - 1]} {year}.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 3 }}>
                                Preview for {monthNames[month - 1]} {year} • {filteredData.length} employee(s)
                            </Typography>
                            <TextField
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search employee..."
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />
                                    ),
                                }}
                                sx={{ mt: 5, mb: 2 }}
                            />
                        </Stack>
                        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, width: 60 }}>S.No</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, width: 200 }}>Employee</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, textAlign: 'center', width: 130 }}>Joining Date</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, textAlign: 'center', width: 120 }}>Status</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700 }}>Proposed Allocations</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredData.map((row, idx) => (
                                        <TableRow key={row.employee} hover>
                                            <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.employee_name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.employee_id}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2">{new Date(row.date_of_joining).toLocaleDateString()}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Chip
                                                    label={row.in_probation ? 'Probation' : 'Permanent'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: row.in_probation ? alpha('#ff5630', 0.08) : alpha('#086ad8', 0.08),
                                                        color: row.in_probation ? '#ff5630' : '#086ad8',
                                                        fontWeight: 600,
                                                        fontSize: 10,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    {row.allocations.map((alloc) => (
                                                        <Box
                                                            key={alloc.leave_type}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                p: 0.75,
                                                                bgcolor: 'background.neutral',
                                                                borderRadius: 1,
                                                            }}
                                                        >
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {alloc.leave_type}:
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                {alloc.count}
                                                            </Typography>
                                                            <Chip
                                                                label={alloc.exists ? 'Already Allocated' : 'Proposed'}
                                                                size="small"
                                                                sx={{
                                                                    ml: 'auto',
                                                                    bgcolor: alloc.exists ? alpha('#ffab00', 0.08) : alpha('#22c55e', 0.08),
                                                                    color: alloc.exists ? '#ffab00' : '#22c55e',
                                                                    fontWeight: 600,
                                                                    fontSize: 9,
                                                                    height: 20,
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                    {row.allocations.length === 0 && (
                                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                            No pending allocations
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.secondary' }}>
                            * Paid Leave is skipped for employees in probation (&lt; 3 months).
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 2 }}>
                {step === 'preview' && (
                    <Button onClick={handleBack} sx={{ mr: 'auto' }}>
                        Back
                    </Button>
                )}
                {step === 'input' ? (
                    <LoadingButton
                        variant="contained"
                        loading={loading}
                        onClick={handlePreview}
                    >
                        Preview
                    </LoadingButton>
                ) : (
                    <LoadingButton
                        variant="contained"
                        loading={allocating}
                        onClick={handleAllocate}
                    >
                        Allocate
                    </LoadingButton>
                )}
            </DialogActions>
        </Dialog>
    );
}
