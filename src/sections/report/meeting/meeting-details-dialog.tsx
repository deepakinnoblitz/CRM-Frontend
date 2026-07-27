import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { stripHtml } from 'src/utils/string';

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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={meeting?.meeting_notes?.length > 0 ? 'lg' : 'md'} PaperProps={{ sx: { borderRadius: 2 } }}>
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
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: meeting?.meeting_notes?.length > 0 ? 8 : 12 }}>
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
                                    {meeting.meet_for === 'Lead' && `Meeting for Lead: ${leadData ? `${leadData.lead_name} (${leadData.name})` : meeting.lead_name}`}
                                    {meeting.meet_for === 'Contact' && `Meeting for Client: ${clientData ? `${clientData.first_name || ''} ${clientData.last_name || ''} (${clientData.name})`.trim() : meeting.contact_name}`}
                                    {meeting.meet_for === 'Account' && `Meeting for Company: ${companyData ? `${companyData.account_name} (${companyData.name})` : meeting.accounts_name}`}
                                    {meeting.meet_for === 'Accounts' && `Meeting for Company: ${companyData ? `${companyData.account_name} (${companyData.name})` : meeting.accounts_name}`}
                                    {meeting.meet_for === 'Others' && `Meeting for Others: ${meeting.enter_id || '-'}`}
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
                                <Divider />
                                <Box>
                                    <SectionHeader title="Lead Details" />
                                    <Box
                                        onClick={() => navigate(`/leads/${leadData.name}/view`)}
                                        sx={{
                                            p: 3,
                                            bgcolor: 'rgb(222 242 255 / 20%)',
                                            border: (t) => `1px solid ${t.palette.divider}`,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            '&:hover': {
                                                bgcolor: 'rgb(222 242 255 / 20%)'
                                            },
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                                                {leadData.lead_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 13 }}>
                                                ID: {leadData.name}
                                            </Typography>
                                                {(() => {
                                                    const phones: string[] = [];
                                                    if (leadData.phone_number) phones.push(leadData.phone_number);
                                                    if (leadData.phone_numbers && Array.isArray(leadData.phone_numbers)) {
                                                        leadData.phone_numbers.forEach((p: any) => {
                                                            if (p.phone && !phones.includes(p.phone)) phones.push(p.phone);
                                                        });
                                                    }
                                                    const joined = phones.join(', ');
                                                    return joined ? (
                                                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontSize: 15, fontWeight: 600 }}>
                                                            Phone: {joined}
                                                        </Typography>
                                                    ) : null;
                                                })()}
                                                {(() => {
                                                    const emails: string[] = [];
                                                    if (leadData.email) emails.push(leadData.email);
                                                    if (leadData.emails && Array.isArray(leadData.emails)) {
                                                        leadData.emails.forEach((e: any) => {
                                                            if (e.email && !emails.includes(e.email)) emails.push(e.email);
                                                        });
                                                    }
                                                    const joined = emails.join(', ');
                                                    return joined ? (
                                                        <Typography variant="body2" sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600 }}>
                                                            Email: {joined}
                                                        </Typography>
                                                    ) : null;
                                                })()}
                                        </Box>
                                        <IconButton color="primary">
                                            <Iconify icon="solar:eye-bold" width={20} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* Client Information */}
                        {clientData && (
                            <>
                                <Divider />
                                <Box>
                                    <SectionHeader title="Client Details" />
                                    <Box
                                        onClick={() => setOpenClientDetails(true)}
                                        sx={{
                                            p: 3,
                                            bgcolor: 'rgb(222 242 255 / 20%)',
                                            border: (t) => `1px solid ${t.palette.divider}`,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            '&:hover': {
                                                bgcolor: 'rgb(222 242 255 / 20%)'
                                            },
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                                                {`${clientData.first_name || ''} ${clientData.last_name || ''}`.trim()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                ID: {clientData.name}
                                            </Typography>
                                            {clientData.phone && (
                                                <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontSize: 15, fontWeight: 600 }}>
                                                    Phone: {clientData.phone}
                                                </Typography>
                                            )}
                                            {clientData.email && (
                                                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600 }}>
                                                    Email: {clientData.email}
                                                </Typography>
                                            )}
                                        </Box>
                                        <IconButton color="primary">
                                            <Iconify icon="solar:eye-bold" width={20} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {/* Company Information */}
                        {companyData && (
                            <>
                                <Divider />
                                <Box>
                                    <SectionHeader title="Company Details" />
                                    <Box
                                        onClick={() => setOpenCompanyDetails(true)}
                                        sx={{
                                            p: 3,
                                            bgcolor: 'rgb(222 242 255 / 20%)',
                                            border: (t) => `1px solid ${t.palette.divider}`,
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            '&:hover': {
                                                bgcolor: 'rgb(222 242 255 / 20%)',
                                            },
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                                                {companyData.account_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                ID: {companyData.name}
                                            </Typography>
                                            {companyData.phone_number && (
                                                <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontSize: 15, fontWeight: 600 }}>
                                                    Phone: {companyData.phone_number}
                                                </Typography>
                                            )}
                                            {companyData.website && (
                                                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: 15, fontWeight: 600 }}>
                                                    Website: {companyData.website}
                                                </Typography>
                                            )}
                                        </Box>
                                        <IconButton color="primary">
                                            <Iconify icon="solar:eye-bold" width={20} />
                                        </IconButton>
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
                                <Box sx={{ p: 3, bgcolor: 'rgb(222 242 255 / 20%)', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, gridColumn: '1 / -1', mb: 2 }}>
                                    <DetailItem label="Subject" value={meeting.title} fullWidth />
                                </Box>
                                <DetailItem label="From" value={meeting.from ? new Date(meeting.from).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="To" value={meeting.to ? new Date(meeting.to).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="Venue" value={meeting.meeting_venue} icon="solar:buildings-bold" />
                                <DetailItem label="Location" value={meeting.location} icon="solar:map-point-bold" />
                                <DetailItem label="Meeting Status" value={meeting.completed_meet_status} icon="solar:check-read-bold" />
                                <DetailItem label="Owner" value={meeting.owner} icon="solar:user-rounded-bold" />
                            </Box>
                        </Box>

                        {/* System Information */}
                        <Box sx={{ p: 3, bgcolor: 'rgb(222 242 255 / 20%)', border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2 }}>
                            <SectionHeader title="System Information" noMargin />
                            <Box sx={{ mt: 3, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                <DetailItem label="Created On" value={new Date(meeting.creation).toLocaleString()} icon="solar:calendar-date-bold" />
                                <DetailItem label="Modified On" value={new Date(meeting.modified).toLocaleString()} icon="solar:calendar-minimalistic-bold" />
                            </Box>
                        </Box>
                    </Box>
                        </Grid>

                        {/* Right Side: Meeting Notes Panel */}
                        {meeting?.meeting_notes?.length > 0 && (
                            <Grid size={{ xs: 12, md: 4 }} sx={{ borderLeft: (theme: any) => `1px solid ${theme.palette.divider}`, pl: 4 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        Meeting Notes
                                    </Typography>
                                    
                                    <Box sx={{ overflowY: 'auto', maxHeight: 600, pr: 0.5 }}>
                                        <Stack spacing={2}>
                                            {[...meeting.meeting_notes].reverse().map((note: any, index: number) => (
                                                <Card
                                                    key={note.name || index}
                                                    sx={(() => {
                                                        const palettes = [
                                                            { light: '#FFFBEB', dark: 'rgba(251,191,36,0.10)', border: '#FDE68A' },
                                                            { light: '#EFF6FF', dark: 'rgba(96,165,250,0.10)', border: '#BFDBFE' },
                                                            { light: '#F0FDF4', dark: 'rgba(74,222,128,0.10)', border: '#BBF7D0' },
                                                            { light: '#FAF5FF', dark: 'rgba(192,132,252,0.10)', border: '#E9D5FF' },
                                                        ];
                                                        const p = palettes[index % palettes.length];
                                                        return {
                                                            p: 2,
                                                            borderRadius: 1.5,
                                                            position: 'relative',
                                                            boxShadow: 'none',
                                                            border: (themeVar: any) => `1px solid ${themeVar.palette.mode === 'light' ? p.border : 'rgba(255,255,255,0.08)'}`,
                                                            bgcolor: (themeVar: any) => themeVar.palette.mode === 'light' ? p.light : p.dark,
                                                        };
                                                    })()}
                                                >
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                        {note.title}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                                                        {stripHtml(note.description)}
                                                    </Typography>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 15 }}>
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
