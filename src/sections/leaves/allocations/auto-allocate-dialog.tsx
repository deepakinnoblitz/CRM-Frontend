import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
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

import {
    getMonthlyLeaveAllocationPreview,
    autoAllocateMonthlyLeavesNew,
    type MonthlyEmployeeAllocationPreview,
} from 'src/api/leave-allocations';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface AutoAllocateDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    onError: (error: string) => void;
}

export default function AutoAllocateDialog({ open, onClose, onSuccess, onError }: AutoAllocateDialogProps) {
    const currentDate = new Date();
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [previewData, setPreviewData] = useState<MonthlyEmployeeAllocationPreview[]>([]);
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
            const data = await getMonthlyLeaveAllocationPreview(year, month);
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
            const data = await autoAllocateMonthlyLeavesNew(year, month);
            onSuccess(data);
            handleClose();
        } catch (error: any) {
            onError(error.message || 'Failed to allocate leaves');
        } finally {
            setAllocating(false);
        }
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const filteredData = previewData.filter(row =>
        row.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Summary counts
    const newCount = previewData.reduce(
        (sum, row) => sum + row.allocations.filter(a => !a.exists).length, 0
    );
    const existingCount = previewData.reduce(
        (sum, row) => sum + row.allocations.filter(a => a.exists).length, 0
    );
    const SummaryCard = ({
        icon,
        value,
        label,
        color,
        }: {
        icon: React.ReactNode;
        value: number;
        label: string;
        color: string;
        }) => (
        <Paper
            elevation={0}
            sx={{
            flex: 1,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(color, 0.18)}`,
            bgcolor: alpha(color, 0.06),
            transition: 'all .2s',
            '&:hover': {
                bgcolor: alpha(color, 0.1),
                transform: 'translateY(-2px)',
            },
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
            <Box
                sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                bgcolor: alpha(color, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
                }}
            >
                {icon}
            </Box>

            <Box>
                <Typography variant="h5" fontWeight={700}>
                {value}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                {label}
                </Typography>
            </Box>
            </Stack>
        </Paper>
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={step === 'preview' ? 'lg' : 'sm'}
            PaperProps={{ sx: { borderRadius: 2.5 } }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
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
                                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                                InputLabelProps={{ shrink: true }}
                            >
                                {monthNames.map((name, index) => (
                                    <MenuItem key={name} value={index + 1}>{name}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                            This will preview and allocate monthly leaves to all active employees for{' '}
                            <strong>{monthNames[month - 1]} {year}</strong>.
                            Employees in probation (&lt;3 months) will not receive Paid Leave.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {/* Summary Chips */}
                        <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        sx={{ mb: 3, mt: 2 }}
                        >
                        <SummaryCard
                            value={filteredData.length}
                            label="Employees"
                            color="#086ad8"
                            icon={<Iconify icon={"eva:people-fill" as any} width={24} />}
                        />

                        <SummaryCard
                            value={newCount}
                            label="New Allocations"
                            color="#22c55e"
                            icon={<Iconify icon={"eva:checkmark-circle-2-fill" as any} width={24} />}
                        />

                        <SummaryCard
                            value={existingCount}
                            label="Already Exists"
                            color="#ff9800"
                            icon={<Iconify icon="solar:double-alt-arrow-right-bold" width={24} />}
                        />
                        </Stack>

                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                Preview for <strong>{monthNames[month - 1]} {year}</strong>
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
                                sx={{ width: 320 }}
                            />
                        </Stack>

                        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2, maxHeight: 420 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, width: 50 }}>#</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, minWidth: 180 }}>Employee</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, textAlign: 'center', width: 110 }}>Joined</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, textAlign: 'center', width: 100 }}>Status</TableCell>
                                        <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 700, minWidth: 360 }}>Proposed Allocations</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredData.map((row, idx) => (
                                        <TableRow key={row.employee} hover>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: 12 }}>{idx + 1}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.employee_name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{row.employee_id}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption">
                                                    {new Date(row.date_of_joining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </Typography>
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
                                                <Stack spacing={0.75}>
                                                    {row.allocations.map((alloc) => (
                                                        <Box
                                                            key={alloc.leave_type}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1,
                                                                px: 1,
                                                                py: 0.5,
                                                                bgcolor: 'background.neutral',
                                                                borderRadius: 1,
                                                                flexWrap: 'wrap',
                                                            }}
                                                        >
                                                            {/* Leave Type Badge */}
                                                            <Chip
                                                                label={alloc.leave_type_name || alloc.leave_type}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: 10,
                                                                    fontWeight: 700,
                                                                    borderColor: alloc.is_paid ? '#086ad8' : '#637381',
                                                                    color: alloc.is_paid ? '#086ad8' : '#637381',
                                                                }}
                                                            />
                                                            {/* Base + Carry forward */}
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                {alloc.base_leaves}
                                                                {alloc.carry_forward_balance > 0 && (
                                                                    <Tooltip title={`Carry-forward: ${alloc.carry_forward_balance}`}>
                                                                        <span style={{ color: '#22c55e', fontWeight: 700 }}>
                                                                            {' '}+{alloc.carry_forward_balance} CF
                                                                        </span>
                                                                    </Tooltip>
                                                                )}
                                                            </Typography>
                                                            {/* Total */}
                                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                                = {alloc.total_leaves}
                                                            </Typography>
                                                            {/* Reset frequency */}
                                                            {alloc.reset_frequency && (
                                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: 10 }}>
                                                                    ({alloc.reset_frequency})
                                                                </Typography>
                                                            )}
                                                            {/* Status */}
                                                            <Chip
                                                                label={alloc.exists ? 'Already Allocated' : 'New'}
                                                                size="small"
                                                                sx={{
                                                                    ml: 'auto',
                                                                    height: 18,
                                                                    fontSize: 9,
                                                                    fontWeight: 700,
                                                                    bgcolor: alloc.exists ? alpha('#ffab00', 0.08) : alpha('#22c55e', 0.08),
                                                                    color: alloc.exists ? '#ffab00' : '#22c55e',
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
                            * Paid Leave is skipped for employees in probation (&lt;3 months). CF = Carry Forward balance.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 2 }}>
                {step === 'preview' && (
                    <Button onClick={handleBack} variant="outlined" sx={{ mr: 'auto' }}>
                        Back
                    </Button>
                )}
                {step === 'input' ? (
                    <LoadingButton variant="contained" loading={loading} onClick={handlePreview}>
                        Preview
                    </LoadingButton>
                ) : (
                    <LoadingButton
                        variant="contained"
                        loading={allocating}
                        onClick={handleAllocate}
                        startIcon={<Iconify icon="solar:calendar-add-bold" />}
                        sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Allocate Now
                    </LoadingButton>
                )}
            </DialogActions>
        </Dialog>
    );
}
