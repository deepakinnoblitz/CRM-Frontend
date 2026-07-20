import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getCall } from 'src/api/calls';
import { getLead } from 'src/api/leads';
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
    callId: string | null;
};

export function CallDetailsDialog({ open, onClose, callId }: Props) {
    const navigate = useNavigate();
    const [call, setCall] = useState<any>(null);
    const [leadData, setLeadData] = useState<any>(null);
    const [clientData, setClientData] = useState<any>(null);
    const [companyData, setCompanyData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [openClientDetails, setOpenClientDetails] = useState(false);
    const [openCompanyDetails, setOpenCompanyDetails] = useState(false);

    useEffect(() => {
        if (open && callId) {
            setLoading(true);
            getCall(callId)
                .then(async (data) => {
                    setCall(data);
                    
                    // Fetch reference details based on call_for field
                    if (data.call_for === 'Lead' && data.lead_name) {
                        try {
                            const lead = await getLead(data.lead_name);
                            setLeadData(lead);
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        setLeadData(null);
                    }

                    if (data.call_for === 'Contact' && data.contact_name) {
                        try {
                            const contact = await getContact(data.contact_name);
                            setClientData(contact);
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        setClientData(null);
                    }

                    if (data.call_for === 'Accounts' && data.account_name) {
                        try {
                            const account = await getAccount(data.account_name);
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
    }, [open, callId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Scheduled': return 'info';
            case 'Overdue': return 'error';
            case 'Cancelled': return 'warning';
            default: return 'default';
        }
    };

    const renderStatus = (status: string) => (
        <Label
            variant="soft"
            color={getStatusColor(status)}
            sx={{ textTransform: 'uppercase', fontWeight: 800 }}
        >
            {status}
        </Label>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            TransitionProps={{ onExited: () => setCall(null) }}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid', borderColor: 'divider'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Call Details
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        bgcolor: 'background.paper',
                        boxShadow: (theme) => theme.customShadows?.z1,
                    }}
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon="svg-spinners:12-dots-scale-rotate" width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : call ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                                    color: 'info.main',
                                    flexShrink: 0,
                                }}
                            >
                                <Iconify icon="solar:phone-calling-bold" width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                                    {call.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {(call.call_for === 'Contact' ? 'Client' : call.call_for === 'Accounts' ? 'Company' : call.call_for)} with {call.lead_name}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                {renderStatus(call.outgoing_call_status)}
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {call.name}
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
                            <SectionHeader title="Call Information" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                }}
                            >
                                <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2, gridColumn: '1 / -1' }}>
                                    <DetailItem label="Subject" value={call.title} fullWidth />
                                </Box>
                                <DetailItem label="Call For" value={call.call_for === 'Contact' ? 'Client' : call.call_for === 'Accounts' ? 'Company' : call.call_for} icon="solar:user-bold" />
                                <DetailItem label="Reference" value={call.lead_name} icon="solar:link-bold" />
                                <DetailItem label="Start Time" value={call.call_start_time ? new Date(call.call_start_time).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="End Time" value={call.call_end_time ? new Date(call.call_end_time).toLocaleString() : '-'} icon="solar:clock-circle-bold" />
                                <DetailItem label="Owner" value={call.owner} icon="solar:user-rounded-bold" />
                            </Box>
                        </Box>

                        
                        {/* Discussion */}
                        <Box>
                            <SectionHeader title="Call Discussion" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2,
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                }}
                            >
                                <DetailItem label="Purpose" value={call.call_purpose} icon="solar:flag-bold" fullWidth />
                                <DetailItem label="Agenda" value={call.call_agenda} icon="solar:checklist-bold" fullWidth />
                            </Box>
                        </Box>

                        {/* System Information */}
                        <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <SectionHeader title="System Information" />
                            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                                <DetailItem label="Created On" value={new Date(call.creation).toLocaleString()} icon="solar:calendar-date-bold" />
                                <DetailItem label="Modified On" value={new Date(call.modified).toLocaleString()} icon="solar:calendar-minimalistic-bold" />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon="solar:ghost-bold" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
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

function SectionHeader({ title }: { title: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    fontSize: '16px',
                    color: 'text.primary',
                }}
            >
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({
    label,
    value,
    icon,
    fullWidth = false,
}: {
    label: string;
    value?: string | null;
    icon?: string;
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
