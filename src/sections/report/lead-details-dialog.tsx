import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { handleFrappeError } from 'src/utils/api-error-handler';

import { getLead, convertLead, getWorkflowStates } from 'src/api/leads';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { SalesPipeline } from '../user/sales-pipeline';
import { LeadFollowupDetails } from '../user/lead-followup-details';
import { LeadPipelineTimeline } from '../user/lead-pipeline-timeline';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    leadId: string | null;
    onEdit?: () => void;
};

export function LeadDetailsDialog({ open, onClose, leadId, onEdit }: Props) {
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState('general');
    const [allWorkflowStates, setAllWorkflowStates] = useState<string[]>([]);

    // Convert Lead State
    const [converting, setConverting] = useState(false);
    const [convertMsg, setConvertMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    useEffect(() => {
        if (open && leadId) {
            setLoading(true);
            getLead(leadId)
                .then(setLead)
                .catch((err) => console.error('Failed to fetch lead details:', err))
                .finally(() => setLoading(false));

            // Fetch workflow states for pipeline visualization
            getWorkflowStates('Lead').then(wf => setAllWorkflowStates(wf.states));
        } else {
            setLead(null);
            setCurrentTab('general');
            setConvertMsg(null);
        }
    }, [open, leadId]);

    const handleConvert = async () => {
        if (!leadId) return;
        setConverting(true);
        setConvertMsg(null);
        try {
            const result = await convertLead(leadId);
            setConvertMsg({ type: 'success', text: `Lead converted successfully! Created Account: ${result.account}, Contact: ${result.contact}` });
            // Refresh lead data to show conversion results
            const updatedLead = await getLead(leadId);
            setLead(updatedLead);
        } catch (err: any) {
            console.error(err);
            setConvertMsg({ type: 'error', text: handleFrappeError(err, 'Failed to convert lead') });
        } finally {
            setConverting(false);
        }
    };

    const renderStatus = (status: string) => {
        let color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' = 'default';
        if (status === 'New Lead') color = 'info';
        if (status === 'Qualified' || status === 'Closed') color = 'success';
        if (status === 'Not Interested' || status === 'In Active') color = 'error';
        if (status === 'Contacted' || status === 'Proposal Sent' || status === 'In Negotiation') color = 'warning';

        return (
            <Label variant="soft" color={color}>
                {status}
            </Label>
        );
    };

    const renderInterest = (level: string) => {
        let color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' = 'default';
        if (level === 'High') color = 'success';
        if (level === 'Medium') color = 'warning';
        if (level === 'Low') color = 'error';

        return (
            <Label variant="outlined" color={color}>
                {level}
            </Label>
        );
    };

    const TABS = [
        { value: 'general', label: 'General' },
        { value: 'pipeline', label: 'Pipeline' },
        { value: 'followups', label: 'Followups' },
        { value: 'convert', label: 'Convert Lead' },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Lead Profile</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    pr: 2.5
                }}
            >
                <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                    sx={{ px: 2.5 }}
                >
                    {TABS.map((tab) => (
                        <Tab
                            key={tab.value}
                            value={tab.value}
                            label={tab.label}
                            iconPosition="start"
                            sx={{ minHeight: 48, fontWeight: 700 }}
                        />
                    ))}
                </Tabs>

                {onEdit && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Iconify icon={"solar:pen-bold" as any} width={16} />}
                        onClick={onEdit}
                        sx={{
                            height: 32,
                            bgcolor: '#08a3cd',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#068fb3' }
                        }}
                    >
                        Edit
                    </Button>
                )}
            </Box>

            <DialogContent sx={{ p: 4, m: 0, mt: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : lead ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Static Header Info */}
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
                                <Iconify icon={"solar:user-bold" as any} width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{lead.lead_name}</Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{lead.company_name || 'Individual'}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                {renderStatus(lead.workflow_state || lead.status)}
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {lead.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {currentTab === 'general' && (
                            <>
                                {/* General Information */}
                                <Box sx={{ margin: 2 }}>
                                    <SectionHeader title="Contact & Service" icon="solar:phone-calling-bold" />
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 3,
                                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                        }}
                                    >
                                        <DetailItem label="Email" value={lead.email} icon="solar:letter-bold" />
                                        <DetailItem label="Phone" value={lead.phone_number} icon="solar:phone-bold" />
                                        <DetailItem label="Service" value={lead.service} icon="solar:lightbulb-bold" color="info.main" />
                                        <DetailItem label="Leads Type" value={lead.leads_type} icon="solar:tag-horizontal-bold" />
                                        <DetailItem label="Leads From" value={lead.leads_from} icon="solar:globus-bold" />
                                        <DetailItem label="GSTIN" value={lead.gstin} icon="solar:checklist-bold" />
                                    </Box>
                                </Box>

                                {/* Location & Status */}
                                <Box sx={{ margin: 2 }}>
                                    <SectionHeader title="Location & Preferences" icon="solar:map-point-bold" />
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 3,
                                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                        }}
                                    >
                                        <DetailItem label="Country" value={lead.country} icon="solar:earth-bold" />
                                        <DetailItem label="State" value={lead.state} icon="solar:point-on-map-bold" />
                                        <DetailItem label="City" value={lead.city} icon="solar:city-bold" />
                                        <DetailItem label="Owner" value={lead.owner_name || lead.owner} icon="solar:user-rounded-bold" color="secondary.main" />
                                        <DetailItem label="Creation" value={new Date(lead.creation).toLocaleString()} icon="solar:calendar-bold" />
                                    </Box>
                                </Box>

                                {/* Additional Info */}
                                <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2, margin: 2 }}>
                                    <SectionHeader title="Additional Information" icon="solar:document-text-bold" noMargin />
                                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                Billing Address
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                                {lead.billing_address || 'No address provided'}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ borderStyle: 'dotted' }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                Remarks / Notes
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontStyle: lead.remarks ? 'normal' : 'italic' }}>
                                                {lead.remarks || 'No remarks added'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </>
                        )}

                        {currentTab === 'pipeline' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <SalesPipeline
                                    currentStage={lead.workflow_state || lead.status}
                                    stages={allWorkflowStates}
                                    leadName={lead.lead_name}
                                    service={lead.service}
                                    disabled
                                />
                                <LeadPipelineTimeline
                                    title="State History"
                                    list={lead.converted_pipeline_timeline || []}
                                />
                            </Box>
                        )}

                        {currentTab === 'followups' && (
                            <LeadFollowupDetails
                                title="Followup History"
                                list={lead.followup_details || []}
                            />
                        )}

                        {currentTab === 'convert' && (
                            <Box sx={{ py: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
                                    Lead Conversion Status
                                </Typography>

                                {convertMsg && (
                                    <Alert severity={convertMsg.type} sx={{ mb: 3 }}>
                                        {convertMsg.text}
                                    </Alert>
                                )}

                                {lead.converted_account || lead.converted_contact ? (
                                    <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                        <Stack spacing={2.5}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                    Converted Account
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                    {lead.converted_account || 'N/A'}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ borderStyle: 'dashed' }} />

                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                    Converted Contact
                                                </Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                    {lead.converted_contact || 'N/A'}
                                                </Typography>
                                            </Box>

                                            <Alert severity="success" icon={<Iconify icon={"solar:check-circle-bold" as any} />}>
                                                This lead has been successfully converted.
                                            </Alert>
                                        </Stack>
                                    </Box>
                                ) : (
                                    <Box sx={{ py: 5, textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: '50%',
                                                bgcolor: alpha('#1877F2', 0.08),
                                                color: '#1877F2',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 3
                                            }}
                                        >
                                            <Iconify icon={"solar:user-plus-bold-duotone" as any} width={64} />
                                        </Box>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
                                            Convert this lead into a permanent Account and Contact record in the CRM.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            color="primary"
                                            startIcon={converting ? <Iconify icon={"svg-spinners:18-dots-indicator" as any} /> : <Iconify icon={"solar:refresh-bold" as any} />}
                                            onClick={handleConvert}
                                            disabled={converting}
                                            sx={{ px: 4, height: 48, fontWeight: 800 }}
                                        >
                                            {converting ? 'Converting...' : 'Convert Lead Now'}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Profile Found</Typography>
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

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null; icon: string; color?: string }) {
    return (
        <Box>
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
