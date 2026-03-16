import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { getEmployee } from 'src/api/employees';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    event: any;
};

// ── Status config ──
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    '0': { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: 'solar:file-bold' }, // Draft
    '1': { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', icon: 'solar:check-circle-bold' }, // Submitted
    '2': { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: 'solar:close-circle-bold' }, // Cancelled
};

export function PersonalityEventDetailsDialog({ open, onClose, event }: Props) {
    const [employeeDetails, setEmployeeDetails] = useState<any>(null);

    useEffect(() => {
        if (open && event?.employee) {
            getEmployee(event.employee)
                .then(setEmployeeDetails)
                .catch(console.error);
        } else {
            setEmployeeDetails(null);
        }
    }, [open, event?.employee]);

    if (!event) return null;

    const { 
        name, 
        employee, 
        employee_name,
        trait, 
        evaluation_type, 
        evaluation_date, 
        score_change, 
        hr_user, 
        remarks, 
        docstatus 
    } = event;

    const statusConf = STATUS_CONFIG[docstatus.toString()] || { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: 'solar:info-circle-bold' };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Event Details</Typography>
                <IconButton onClick={onClose} sx={{ bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <ScrollView>
                    <Stack spacing={3} sx={{ p: 3, }}>
                        {/* Hero Section */}
                        <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f4f6f8', border: '1px solid', borderColor: 'divider' }}>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: '#00A5D114', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Iconify icon="solar:clipboard-list-bold-duotone" width={24} sx={{ color: '#00A5D1' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, display: 'block' }}>Event ID</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{name}</Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                        Status
                                    </Typography>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 0.75, bgcolor: statusConf.bg, border: `1px solid ${statusConf.border}` }}>
                                        <Iconify icon={statusConf.icon as any} width={14} sx={{ color: statusConf.color }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: statusConf.color }}>
                                            {docstatus === 0 ? 'Draft' : docstatus === 1 ? 'Submitted' : 'Cancelled'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>

                        {/* Info Grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, pl: 1}}>
                            <InfoRow icon="solar:user-id-bold" iconColor="#6366f1" label="Employee" value={`${employee_name} (${employee})`} />
                            <InfoRow icon="solar:shield-user-bold" iconColor="#8b5cf6" label="HR User" value={hr_user} />
                            <InfoRow icon="solar:user-speak-bold" iconColor="#f59e0b" label="Trait" value={trait} />
                            <InfoRow icon="solar:calendar-bold" iconColor="#f97316" label="Evaluation Date" value={fDate(evaluation_date, 'DD-MM-YYYY')} />
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Evaluation Result */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, pl: 1 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Evaluation
                                </Typography>
                                <Label
                                    variant="soft"
                                    color={
                                        (evaluation_type === 'Agree' && 'success') ||
                                        (evaluation_type === 'Disagree' && 'error') ||
                                        'default'
                                    }
                                    sx={{ height: 28, textTransform: 'capitalize', fontWeight: 700 }}
                                >
                                    {evaluation_type}
                                </Label>
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                    Score Change
                                </Typography>
                                <Typography variant="h6" sx={{ color: score_change > 0 ? 'success.main' : 'error.main', fontWeight: 800 }}>
                                    {score_change > 0 ? `+${score_change}` : score_change}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Remarks */}
                        <Box sx={{ pl: 1, pr: 2 }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                Remarks
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#f4f6f8', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {remarks || 'No remarks provided.'}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </ScrollView>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: `${iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Iconify icon={icon as any} width={20} sx={{ color: iconColor }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Stack>
    );
}

function ScrollView({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ maxHeight: '70vh', overflowY: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 1 } }}>
            {children}
        </Box>
    );
}
