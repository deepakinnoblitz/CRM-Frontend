import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getMeeting } from 'src/api/meetings';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    meetingId: string | null;
};

export function MeetingDetailsDialog({ open, onClose, meetingId }: Props) {
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && meetingId) {
            setLoading(true);
            getMeeting(meetingId)
                .then((data) => {
                    setMeeting(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setMeeting(null);
        }
    }, [open, meetingId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Scheduled': return 'info';
            case 'Overdue': return 'error';
            case 'Cancelled': return 'warning';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Meeting Details</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : meeting ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'primary.lighter',
                                    color: 'primary.main',
                                }}
                            >
                                <Iconify icon={"solar:calendar-date-bold" as any} width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{meeting.title}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {meeting.meet_for} with {meeting.meet_for === 'Lead' ? meeting.lead_name : meeting.meet_for === 'Contact' ? meeting.contact_name : meeting.meet_for === 'Others' ? meeting.enter_id : meeting.accounts_name || '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Label variant="soft" color={getStatusColor(meeting.outgoing_call_status)}>
                                    {meeting.outgoing_call_status}
                                </Label>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {meeting.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* General Information */}
                        <Box>
                            <SectionHeader title="Meeting Information" icon="solar:info-circle-bold" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 3,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                }}
                            >
                                <DetailItem label="Subject" value={meeting.title} icon="solar:pen-bold" fullWidth />
                                <DetailItem label="Enter ID" value={meeting.enter_id} icon="solar:hashtag-bold" />
                                <DetailItem label="Meet For" value={meeting.meet_for} icon="solar:user-bold" />
                                <DetailItem label="Reference" value={meeting.meet_for === 'Lead' ? meeting.lead_name : meeting.meet_for === 'Contact' ? meeting.contact_name : meeting.accounts_name || '-'} icon="solar:link-bold" />
                                <DetailItem label="Meeting Status" value={meeting.completed_meet_status} icon="solar:check-read-bold" />
                                <DetailItem label="From" value={meeting.from ? new Date(meeting.from).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="To" value={meeting.to ? new Date(meeting.to).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="Venue" value={meeting.meeting_venue} icon="solar:buildings-bold" />
                                <DetailItem label="Location" value={meeting.location} icon="solar:map-point-bold" />
                                <DetailItem label="Host" value={meeting.host} icon="solar:user-rounded-bold" />
                                <DetailItem label="Participants" value={meeting.participants?.map((p: any) => p.user).join(', ')} icon="solar:users-group-rounded-bold" />
                                <DetailItem label="Owner" value={meeting.owner} icon="solar:user-rounded-bold" />
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Notes */}
                        <Box>
                            <SectionHeader title="Meeting Notes" icon="solar:notebook-bold" />
                            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', fontWeight: 500 }}>
                                    {meeting.completed_meet_notes || 'No notes available.'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* System Information */}
                        <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <SectionHeader title="System Information" icon="solar:clock-circle-bold" noMargin />
                            <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                                <DetailItem label="Created On" value={new Date(meeting.creation).toLocaleString()} icon="solar:calendar-date-bold" />
                                <DetailItem label="Modified On" value={new Date(meeting.modified).toLocaleString()} icon="solar:calendar-minimalistic-bold" />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Details Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary', fullWidth }: { label: string; value?: string | null; icon: string; color?: string, fullWidth?: boolean }) {
    return (
        <Box sx={fullWidth ? { gridColumn: '1 / -1' } : {}}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
