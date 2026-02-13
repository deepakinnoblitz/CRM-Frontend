import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';

import { getWFHAttendance } from 'src/api/wfh-attendance';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    wfhId: string | null;
};

export function WFHAttendanceDetailsDialog({ open, onClose, wfhId }: Props) {
    const [wfh, setWfh] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && wfhId) {
            setLoading(true);
            getWFHAttendance(wfhId)
                .then(setWfh)
                .catch((err) => console.error('Failed to fetch WFH details:', err))
                .finally(() => setLoading(false));
        } else {
            setWfh(null);
        }
    }, [open, wfhId]);

    const renderStatus = (status: string) => {
        let color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' = 'default';

        if (status === 'Approved') color = 'success';
        if (status === 'Rejected') color = 'error';
        if (status === 'Pending') color = 'warning';
        if (status === 'Draft') color = 'info';

        return (
            <Label variant="soft" color={color} sx={{ textTransform: 'uppercase', fontWeight: 800 }}>
                {status}
            </Label>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>WFH Entry Details</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : wfh ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                    color: 'primary.main',
                                }}
                            >
                                <Iconify icon={"solar:user-rounded-bold-duotone" as any} width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    {wfh.employee_name || wfh.employee}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Employee ID: {wfh.employee}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                {renderStatus(wfh.workflow_state || 'Draft')}
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {wfh.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Attendance Details Grid */}
                        <Box>
                            <SectionHeader title="Attendance Information" icon="solar:clock-circle-bold-duotone" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2.5,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                }}
                            >
                                <DetailCard label="Date" value={wfh.date} icon="solar:calendar-date-bold-duotone" />
                                <DetailCard label="From Time" value={wfh.from_time} icon="solar:stopwatch-play-bold-duotone" />
                                <DetailCard label="To Time" value={wfh.to_time} icon="solar:stopwatch-pause-bold-duotone" />
                                <DetailCard
                                    label="Total Hours"
                                    value={wfh.total_hours}
                                    icon="solar:history-bold-duotone"
                                    highlight
                                />
                            </Box>
                        </Box>

                        {/* Task Description Section */}
                        <Box>
                            <SectionHeader title="Task Description" icon="solar:notes-bold-duotone" />
                            <Box
                                sx={{
                                    p: 3,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                    borderRadius: 2,
                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {wfh.task_description || 'No specific task description provided.'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold-duotone" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Entry Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ display: 'flex', p: 0.75, borderRadius: 1, bgcolor: 'primary.main', color: 'common.white' }}>
                <Iconify icon={icon as any} width={18} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary' }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailCard({ label, value, icon, highlight = false }: { label: string; value?: string | null; icon: string; highlight?: boolean }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => highlight ? alpha(theme.palette.primary.main, 0.08) : 'background.neutral',
                border: (theme) => highlight ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={20} sx={{ color: highlight ? 'primary.main' : 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>
                    {label}
                </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: highlight ? 'primary.main' : 'text.primary' }}>
                {value || '-'}
            </Typography>
        </Box>
    );
}
