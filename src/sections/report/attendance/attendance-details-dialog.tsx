import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getHRDoc } from 'src/api/hr-management';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    attendanceId: string | null;
};

export function AttendanceDetailsDialog({ open, onClose, attendanceId }: Props) {
    const [attendance, setAttendance] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && attendanceId) {
            setLoading(true);
            getHRDoc('Attendance', attendanceId)
                .then(setAttendance)
                .catch((err) => console.error('Failed to fetch attendance details:', err))
                .finally(() => setLoading(false));
        }
    }, [open, attendanceId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'success';
            case 'Absent': return 'error';
            case 'Missing': return 'warning';
            case 'On Leave': return 'warning';
            case 'Holiday': return 'info';
            case 'Half Day': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            TransitionProps={{ onExited: () => setAttendance(null) }}
        >
            <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Attendance Details</Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08) } }}>
                    <Iconify icon="mingcute:close-line" width={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : attendance ? (
                    <Stack spacing={3}>
                        {/* Header Summary Card */}
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                                boxShadow: (theme) => theme.customShadows?.z12,
                                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2.5} sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'common.white',
                                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                                        boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                                    }}
                                >
                                    <Iconify icon={"solar:user-bold-duotone" as any} width={32} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                        {attendance.employee_name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {attendance.employee}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                                }}
                            >
                                <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                                        DATE
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                        {dayjs(attendance.attendance_date).format('DD MMM')}
                                    </Typography>
                                </Stack>

                                <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                                        STATUS
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Label
                                            color={getStatusColor(attendance.status)}
                                            variant="filled"
                                            sx={{
                                                textTransform: 'uppercase',
                                                height: 24,
                                                px: 1.5,
                                                ...(attendance.status === 'Missing' && { color: 'common.white' }),
                                            }}
                                        >
                                            {attendance.status}
                                        </Label>
                                    </Box>
                                </Stack>

                                <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                                        WORKING HOURS
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                        {attendance.working_hours_display || '00:00'}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' },
                                    gap: 2
                                }}
                            >
                                <DetailRow label="In Time" value={attendance.in_time} icon="solar:clock-circle-bold" />
                                <DetailRow label="Out Time" value={attendance.out_time} icon="solar:clock-circle-bold" />
                                <DetailRow label="Overtime" value={attendance.overtime_display || '00:00'} icon="solar:stopwatch-bold" />
                            </Box>

                            {attendance.leave_type && (
                                <DetailRow label="Leave Type" value={attendance.leave_type} icon="solar:leaf-bold" />
                            )}
                        </Stack>
                    </Stack>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Record Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Box
                sx={{
                    p: 1,
                    borderRadius: 1.25,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Iconify icon={icon as any} width={22} />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }}>
                    {label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Stack>
    );
}
