import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getLead } from 'src/api/leads';
import { getMeeting } from 'src/api/meetings';
import { getContact } from 'src/api/contacts';
import { getAccount } from 'src/api/accounts';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { ContactDetailsDialog } from 'src/sections/report/contact/contact-details-dialog';
import { AccountDetailsDialog } from 'src/sections/report/account/account-details-dialog';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    meetingId: string | null;
};

export function MeetingDetailsDialog({ open, onClose, meetingId }: Props) {
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState<any>(null);
    const [leadData, setLeadData] = useState<any>(null);
    const [clientData, setClientData] = useState<any>(null);
    const [companyData, setCompanyData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [openClientDetails, setOpenClientDetails] = useState(false);
    const [openCompanyDetails, setOpenCompanyDetails] = useState(false);

    useEffect(() => {
        if (open && meetingId) {
            setLoading(true);
            getMeeting(meetingId)
                .then(async (data) => {
                    setMeeting(data);
                    
                    // Fetch reference details based on meet_for field
                    if (data.meet_for === 'Lead' && data.lead_name) {
                        try {
                            const lead = await getLead(data.lead_name);
                            setLeadData(lead);
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        setLeadData(null);
                    }

                    if (data.meet_for === 'Contact' && data.contact_name) {
                        try {
                            const contact = await getContact(data.contact_name);
                            setClientData(contact);
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        setClientData(null);
                    }

                    if (data.meet_for === 'Accounts' && data.accounts_name) {
                        try {
                            const account = await getAccount(data.accounts_name);
                            setCompanyData(account);
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        setCompanyData(null);
                    }

                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
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

                        {/* Lead Information */}
                        {leadData && (
                            <>
                                <Box>
                                    <SectionHeader title="Lead" />
                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 2,
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                {leadData.lead_name}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/leads/${leadData.name}/view`)}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <Iconify icon="solar:eye-bold" width={20} />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            ID: {leadData.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* Client Information */}
                        {clientData && (
                            <>
                                <Box>
                                    <SectionHeader title="Client" />
                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 2,
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                {clientData.first_name} {clientData.last_name || ''}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setOpenClientDetails(true)}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <Iconify icon="solar:eye-bold" width={20} />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            ID: {clientData.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* Company Information */}
                        {companyData && (
                            <>
                                <Box>
                                    <SectionHeader title="Company" />
                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: 'background.neutral',
                                            borderRadius: 2,
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                {companyData.account_name}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => setOpenCompanyDetails(true)}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <Iconify icon="solar:eye-bold" width={20} />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                            ID: {companyData.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* General Information */}
                        <Box>
                            <SectionHeader title="Meeting Information" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                }}
                            >
                                <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2, gridColumn: '1 / -1' }}>
                                    <DetailItem label="Subject" value={meeting.title} fullWidth />
                                </Box>
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

                        {/* Notes */}
                        <Box>
                            <SectionHeader title="Meeting Notes" />
                            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', fontWeight: 500 }}>
                                    {meeting.completed_meet_notes || 'No notes available.'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* System Information */}
                        <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <SectionHeader title="System Information" noMargin />
                            <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
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
            {clientData && (
                <ContactDetailsDialog
                    open={openClientDetails}
                    onClose={() => {
                        setOpenClientDetails(false);
                        onClose();
                    }}
                    contactId={clientData.name}
                />
            )}

            {companyData && (
                <AccountDetailsDialog
                    open={openCompanyDetails}
                    onClose={() => {
                        setOpenCompanyDetails(false);
                        onClose();
                    }}
                    accountId={companyData.name}
                />
            )}
        </Dialog>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon?: string; noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: noMargin ? 0 : 2.5 }}>
            {icon && (
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                        color: 'info.main',
                        flexShrink: 0,
                    }}
                >
                    <Iconify icon={icon as any} width={22} />
                </Box>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({
    label,
    value,
    icon,
    color = 'text.primary',
    fullWidth,
}: {
    label: string;
    value?: string | null;
    icon?: string;
    color?: string;
    fullWidth?: boolean;
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                ...(fullWidth && { gridColumn: '1 / -1' }),
            }}
        >
            {icon && (
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                        color: 'info.main',
                        flexShrink: 0,
                    }}
                >
                    <Iconify icon={icon as any} width={22} />
                </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        display: 'block',
                        mb: 0.25,
                    }}
                >
                    {label}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
