import { IoMdArrowBack } from "react-icons/io";
import { RiMailSendLine } from "react-icons/ri";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineTag, HiOutlineMapPin, HiOutlineCalendarDays, HiOutlineBuildingOffice2 } from "react-icons/hi2";
import {
    FaTag,
    FaStar,
    FaUser,
    FaCity,
    FaPhone,
    FaGlobe,
    FaEnvelope,
    FaLightbulb,
    FaListCheck,
    FaFileLines,
    FaLocationDot,
    FaCalendarDays
} from "react-icons/fa6";

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { handleFrappeError } from 'src/utils/api-error-handler';

import { DashboardContent } from 'src/layouts/dashboard';
import { getDoc, getLead, convertLead, getWorkflowStates, getWorkflowActions, getFollowupHistory, applyWorkflowAction, getProposalByLeadId, getAutomationPreview, sendAutomationMessage, getLatestWhatsAppMessage } from 'src/api/leads';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { LeadConvertDialog } from '../lead-convert-dialog';
import { WhatsappChatDialog } from './whatsapp_chat_dialog';
import { LeadFollowupDetails } from '../lead-followup-details';
import { LeadProposalDetails } from '../lead-proposal-details';
import { LeadPipelineTimeline } from '../lead-pipeline-timeline';
import { WhatsappAutomationDialog } from '../whatsapp-automation-dialog';
import { AccountDetailsDialog } from '../../report/account/account-details-dialog';
import { ContactDetailsDialog } from '../../report/contact/contact-details-dialog';

// ----------------------------------------------------------------------

const STAGE_OPTIONS = [
    { value: 'New Lead', label: 'New Lead' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal Sent', label: 'Proposal\nSent' },
    { value: 'In Negotiation', label: 'In\nNegotiation' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Not Interested', label: 'Not\nInterested' },
    { value: 'In Active', label: 'In\nActive' },
];

const getClipPath = (index: number, total: number) => {
    if (index === 0) {
        return 'polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 6px calc(100% - 1px), 3px calc(100% - 3px), 1px calc(100% - 6px), 0 calc(100% - 12px), 0 12px, 1px 6px, 3px 3px, 6px 1px)';
    }
    if (index === total - 1) {
        return 'polygon(0 0, calc(100% - 12px) 0, calc(100% - 6px) 1px, calc(100% - 3px) 3px, calc(100% - 1px) 6px, 100% 12px, 100% calc(100% - 12px), calc(100% - 1px) calc(100% - 6px), calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 1px), calc(100% - 12px) 100%, 0 100%, 12px 50%)';
    }
    return 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)';
};

export function LeadDetailsView() {
    const { id } = useParams();
    const router = useRouter();
    const navigate = useNavigate();

    const [openWhatsapp, setOpenWhatsapp] = useState(false);
    const [automationData, setAutomationData] = useState<any>(null);
    const [openAutomationDialog, setOpenAutomationDialog] = useState(false);

    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState('general');
    const [allWorkflowData, setAllWorkflowData] = useState<{ states: string[]; actions: { action: string; next_state: string }[] }>({ states: [], actions: [] });

    // Convert Lead State
    const [converting, setConverting] = useState(false);

    const [openAccount, setOpenAccount] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [openContact, setOpenContact] = useState(false);
    const [selectedContact, setSelectedContact] = useState<string | null>(null);

    const [convertedAccountName, setConvertedAccountName] = useState<string | null>(null);
    const [convertedContactName, setConvertedContactName] = useState<string | null>(null);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [openConvertDialog, setOpenConvertDialog] = useState(false);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [updatingStage, setUpdatingStage] = useState(false);
    const [confirmUpdate, setConfirmUpdate] = useState(false);

    const [followupHistory, setFollowupHistory] = useState<any[]>([]);
    const [followupLoading, setFollowupLoading] = useState(false);

    const [proposalHistory, setProposalHistory] = useState([]);

    useEffect(() => {
        const loadFollowups = async () => {
            if (!lead?.name) return;

            try {
                setFollowupLoading(true);

                const history = await getFollowupHistory(
                    "Lead",
                    lead.name
                );

                setFollowupHistory(history || []);
            } catch (error) {
                console.error("Failed to load followup history", error);
            } finally {
                setFollowupLoading(false);
            }
        };

        loadFollowups();
    }, [lead?.name]);

    useEffect(() => {
        if (!lead?.name) return;

        getProposalByLeadId(lead.name)
            .then(setProposalHistory)
            .catch(console.error);
    }, [lead?.name]);

    useEffect(() => {
        if (lead) {
            setSelectedStage(lead.workflow_state);
        }
    }, [lead]);

    useEffect(() => {
        const loadNames = async () => {

            if (lead?.converted_account) {
                const company = await getDoc(
                    "Accounts",
                    lead.converted_account
                );

                setConvertedAccountName(
                    company.account_name
                );
            }

            if (lead?.converted_contact) {
                const client = await getDoc(
                    "Contacts",
                    lead.converted_contact
                );

                setConvertedContactName(
                    client.first_name
                );
            }
        };

        loadNames();
    }, [lead]);

    useEffect(() => {
        const fetchWorkflowData = async () => {
            if (!lead) return;
            const currentState = lead.workflow_state || lead.status || 'New Lead';

            try {
                const wf = await getWorkflowStates('Lead');
                const actions = await getWorkflowActions('Lead', currentState);
                setAllWorkflowData({ states: wf.states, actions });
            } catch (error) {
                console.error('Failed to fetch workflow data:', error);
            }
        };

        fetchWorkflowData();
    }, [lead]);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }, []);

    useEffect(() => {
        if (id) {
            setLoading(true);
            getLead(id)
                .then(setLead)
                .catch((err) => console.error('Failed to fetch lead details:', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleConvert = async () => {
        if (!id) return;
        setConverting(true);
        try {
            const result = await convertLead(id);

            if (result.messages && result.messages.length > 0) {
                const firstMsg = result.messages[0];
                setSnackbar({
                    open: true,
                    message: firstMsg.text,
                    severity: firstMsg.type === 'success' ? 'success' : 'warning'
                });
            } else {
                setSnackbar({ open: true, message: 'Lead converted successfully', severity: 'success' });
            }

            const updatedLead = await getLead(id);
            setLead(updatedLead);
        } catch (err: any) {
            console.error('Failed to convert lead:', err);
            const errorMsg = handleFrappeError(err, 'Failed to convert lead');
            setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        } finally {
            setConverting(false);
        }
    };

    const handleUpdateStage = useCallback(async () => {
        if (!lead || !selectedStage || selectedStage === lead.workflow_state) return;

        const action = allWorkflowData.actions.find(a => a.next_state === selectedStage)?.action;

        if (!action) {
            setSnackbar({
                open: true,
                message: `Invalid state transition to "${selectedStage}" from current state.`,
                severity: 'error'
            });
            setSelectedStage(lead.workflow_state);
            return;
        }

        const previousStage = lead.workflow_state;
        setConfirmUpdate(false);
        setUpdatingStage(true);
        try {
            await applyWorkflowAction('Lead', lead.name, action);
            const updated = await getLead(lead.name);
            setLead(updated);
            setSnackbar({
                open: true,
                message: `Lead status updated from "${previousStage}" to "${selectedStage}" successfully`,
                severity: 'success'
            });

            // Fetch WhatsApp automation preview
            try {
                const preview = await getAutomationPreview('Lead', lead.name, previousStage);
                if (preview && preview.show_confirmation) {
                    setAutomationData(preview);
                    setOpenAutomationDialog(true);
                }
            } catch (automationErr: any) {
                console.error('Failed to fetch WhatsApp automation preview:', automationErr);
            }
        } catch (err: any) {
            console.error('Failed to update stage:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to update status',
                severity: 'error'
            });
            setSelectedStage(lead.workflow_state || previousStage);
        } finally {
            setUpdatingStage(false);
        }
    }, [lead, selectedStage, allWorkflowData]);

    const handleSendAutomationMessage = useCallback(async (proposalName: string | null) => {
        if (!lead || !automationData) return;
        try {
            await sendAutomationMessage(
                automationData.automation_name,
                'Lead',
                lead.name,
                proposalName
            );

            const latestMsg = await getLatestWhatsAppMessage(lead.name, false);
            if (latestMsg && latestMsg.status === 'Failed') {
                let errMsg = 'Unable to send WhatsApp message.';
                try {
                    if (latestMsg.raw_payload) {
                        const payload = JSON.parse(latestMsg.raw_payload);
                        const fbErrMessage = payload?.error?.error?.message || payload?.error?.message || payload?.error;
                        if (fbErrMessage) {
                            errMsg = fbErrMessage.replace(/^\(#\d+\)\s*/, '');
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse raw_payload:", e);
                }
                throw new Error(errMsg);
            }

            setSnackbar({
                open: true,
                message: 'WhatsApp Message Sent Successfully',
                severity: 'success'
            });
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || 'Failed to send message.',
                severity: 'error'
            });
            throw err;
        }
    }, [lead, automationData]);

    const handleStageUpdateClick = useCallback(() => {
        if (!lead || !selectedStage || selectedStage === (lead.workflow_state || 'New Lead')) {
            return;
        }
        setConfirmUpdate(true);
    }, [lead, selectedStage]);

    const renderPremiumStatus = (status: string) => {
        let bgColor = '#1B53F4';
        let icon: React.ReactNode | string = 'solar:star-bold';
        let iconColor = '#FFE054';

        if (status === 'New Lead') {
            bgColor = '#1B53F4';
            icon = <FaStar />;
            iconColor = '#FFFFFF';
        } else if (status === 'Qualified' || status === 'Proposal Approved') {
            bgColor = '#0E9F6E';
            icon = 'solar:check-circle-bold';
            iconColor = '#6EE7B7';
        } else if (status === 'Not Interested' || status === 'In Active' || status === 'Proposal Rejected') {
            bgColor = '#E02424';
            icon = 'solar:close-circle-bold';
            iconColor = '#FCA5A5';
        } else if (status === 'Contacted' || status === 'Proposal Sent' || status === 'In Negotiation') {
            bgColor = '#D97706';
            icon = 'solar:chat-round-call-bold';
            iconColor = '#FDE047';
        } else {
            bgColor = '#4B5563';
            icon = 'solar:info-circle-bold';
            iconColor = '#E5E7EB';
        }

        return (
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    px: 1.8,
                    py: 0.6,
                    height: 30,
                    borderRadius: 50,
                    bgcolor: bgColor,
                    color: '#ffffff',
                    boxShadow: () => `0 4px 10px ${alpha(bgColor, 0.3)}`,
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
            >
                {typeof icon === 'string' ? (
                    <Iconify icon={icon as any} width={14} sx={{ color: iconColor, display: 'inline-flex', alignItems: 'center' }} />
                ) : (
                    <Box sx={{ color: iconColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', '& svg': { width: 14, height: 14 } }}>
                        {icon}
                    </Box>
                )}
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: 10.5,
                        color: '#ffffff',
                        lineHeight: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}
                >
                    {status}
                </Typography>
            </Box>
        );
    };

    const TABS = [
        { value: 'general', label: 'General' },
        { value: 'convert', label: 'Convert Lead' },
        { value: 'followups', label: 'Followups' },
        { value: 'pipeline', label: 'Stage History' },
        { value: 'proposal', label: 'Proposals' },
    ];

    if (loading) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </DashboardContent>
        );
    }

    if (!lead) {
        return (
            <DashboardContent maxWidth={false}>
                <Box sx={{ py: 20, textAlign: 'center' }}>
                    <Iconify icon={"solar:ghost-bold" as any} width={80} sx={{ color: 'text.disabled', mb: 3 }} />
                    <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800 }}>Lead Not Found</Typography>
                    <Button onClick={() => router.push('/leads')} sx={{ mt: 3 }} variant="contained">
                        Go back to leads
                    </Button>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth={false}>
            {/* Top Header */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
                mt={2}
            >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Lead Profile
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'text.primary',
                            },
                        }}
                    >
                        Go Back
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            router.push(`/proposals/new?lead=${lead.name}`);
                        }}
                        startIcon={
                            <RiMailSendLine />
                        }
                        sx={{
                            bgcolor: '#9625d3ff',
                            color: '#fff',
                            borderRadius: 1.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: '#9625d3ff',
                            },
                        }}
                    >
                        Create Proposal
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => setOpenWhatsapp(true)}
                        startIcon={
                            <Iconify
                                icon={"ic:baseline-whatsapp" as any}
                            />
                        }
                        sx={{
                            bgcolor: '#25D366',
                            color: '#fff',
                            borderRadius: 2.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 2.5,
                            boxShadow: '0 4px 12px rgba(37,211,102,0.25)',

                            '&:hover': {
                                bgcolor: '#22c55e',
                            },
                        }}
                    >
                        WhatsApp
                    </Button>
                </Stack>
            </Stack>

            {/* Stage Tracker Bar */}
            <Card sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2, borderRadius: 2 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    overflowX: 'auto',
                    flexGrow: 1,
                    py: 0.5,
                    px: 0.5,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}>
                    {(() => {
                        const stages = allWorkflowData.states.length > 0 ? allWorkflowData.states : ['New Lead'];
                        const effectiveLeadStage = lead.workflow_state || lead.status || 'New Lead';
                        const currentActiveStage = selectedStage || effectiveLeadStage;
                        const activeIndex = stages.findIndex(s => s === currentActiveStage);

                        return stages.map((stage: string, index: number) => {
                            const isCompletedOrActive = index <= activeIndex;
                            const isActive = stage === currentActiveStage;

                            return (
                                <Box
                                    key={stage}
                                    onClick={() => setSelectedStage(stage)}
                                    sx={{
                                        height: 46,
                                        display: 'flex',
                                        flex: '1 1 0',
                                        minWidth: { xs: 100, md: 92 },
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        px: 1,
                                        ml: index === 0 ? 0 : '-10px',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        clipPath: getClipPath(index, stages.length),
                                        bgcolor: isCompletedOrActive ? '#2081C3' : '#e0e0e0b5',
                                        color: isCompletedOrActive ? 'common.white' : '#4c545a',
                                        fontWeight: isActive ? 800 : 600,
                                        fontSize: { xs: 11, md: 11.5 },
                                        lineHeight: 1.15,
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'pre-line',
                                        position: 'relative',
                                        zIndex: stages.length - index,
                                        '&:hover': {
                                            opacity: 0.88,
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', textAlign: 'inherit', zIndex: 1, pl: index === 0 ? 0 : 1, pr: index === stages.length - 1 ? 0 : 1 }}>
                                        {stage}
                                    </Typography>
                                </Box>
                            );
                        });
                    })()}
                </Box>
                <Button
                    variant="contained"
                    disabled={!selectedStage || selectedStage === (lead.workflow_state || lead.status || 'New Lead') || updatingStage}
                    onClick={handleStageUpdateClick}
                    sx={{
                        height: 36,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: '#2081C3',
                        color: 'common.white',
                        minWidth: 130,
                        '&:hover': { bgcolor: '#1a699f' },
                        '&:disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' }
                    }}
                >
                    {updatingStage ? <CircularProgress size={20} color="inherit" /> : 'Edit Status'}
                </Button>
            </Card>

            {/* Premium Header Banner */}
            <Box
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    px: 3,
                    py: 3.5,
                    borderRadius: 2.5,
                    mb: 3,
                    background: (theme) =>
                        theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, #F6FAFE 0%, #EDF4FB 100%)`
                            : alpha(theme.palette.primary.main, 0.08),
                    border: (theme) =>
                        `1px solid ${theme.palette.mode === 'light' ? '#E2EAF5' : alpha(theme.palette.primary.main, 0.16)}`,
                }}
            >
                {/* Decorative Wave 1 */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -250,
                        bottom: -250,
                        width: 600,
                        height: 600,
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.65)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                {/* Decorative Wave 2 */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -180,
                        bottom: -180,
                        width: 460,
                        height: 460,
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.45)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />
                {/* Decorative Wave 3 */}
                <Box
                    sx={{
                        position: 'absolute',
                        right: -110,
                        bottom: -110,
                        width: 320,
                        height: 320,
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* Name, Company, Location, Tags */}
                <Box sx={{ flexGrow: 1, minWidth: 0, position: 'relative', zIndex: 1, ml: 1 }}>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -0.4, lineHeight: 1.2, mb: 1.5, ml: 1 }}
                        noWrap
                    >
                        {lead.lead_name}
                    </Typography>

                    {/* Company */}
                    {lead.company_name && (
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75, ml: 1 }}>
                            <HiOutlineBuildingOffice2 size={20} style={{ color: '#637381', flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontSize: 13 }} noWrap>
                                {lead.company_name}
                            </Typography>
                        </Stack>
                    )}

                    {/* Location + Lead Type chips */}
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ pt: 0.5 }}>
                        {(lead.city || lead.state || lead.country) && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 50,
                                    bgcolor: '#ffffff',
                                    boxShadow: (themeVar) => `0 2px 8px ${alpha(themeVar.palette.grey[500], 0.08)}`,
                                    border: (themeVar) => `1px solid ${alpha(themeVar.palette.grey[500], 0.06)}`,
                                }}
                            >
                                <HiOutlineMapPin size={15} style={{ color: '#1B3D74' }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#2E3A59',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
                                </Typography>
                            </Stack>
                        )}
                        {lead.leads_type && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 50,
                                    bgcolor: '#ffffff',
                                    boxShadow: (themeVar) => `0 2px 8px ${alpha(themeVar.palette.grey[500], 0.08)}`,
                                    border: (themeVar) => `1px solid ${alpha(themeVar.palette.grey[500], 0.06)}`,
                                }}
                            >
                                <HiOutlineTag size={15} style={{ color: '#23a198' }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#23a198',
                                        fontSize: '12px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {lead.leads_type}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Box>

                {/* Right: Status + ID + Date */}
                <Box sx={{ textAlign: 'right', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    {renderPremiumStatus(lead.workflow_state || lead.status)}
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, fontSize: '12px' }}>
                            ID: {lead.name}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="flex-end" sx={{ mt: 0.75 }}>
                        <HiOutlineCalendarDays size={15} style={{ color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '12px' }}>
                            {new Date(lead.creation).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Tabs */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    borderRadius: '12px 12px 0 0',
                    mb: 0,
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
            </Box>

            {/* Tab Content */}
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '0 0 12px 12px',
                    p: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderTop: 0,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {currentTab === 'general' && (
                        <>
                            {/* General Information */}
                            <Box sx={{ margin: 2 }}>
                                <SectionHeader title="Contact & Service" icon={<FaPhone size={15} />} />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Email" value={lead.email} icon={<FaEnvelope size={13} />} />
                                    <DetailItem label="Phone" value={lead.phone_number} icon={<FaPhone size={13} />} />
                                    <DetailItem label="Service" value={lead.service} icon={<FaLightbulb size={13} />} color="info.main" />
                                    <DetailItem label="Leads Type" value={lead.leads_type} icon={<FaTag size={13} />} />
                                    <DetailItem label="Leads From" value={lead.leads_from} icon={<FaGlobe size={13} />} />
                                    <DetailItem label="GSTIN" value={lead.gstin} icon={<FaListCheck size={13} />} />
                                </Box>
                            </Box>

                            {/* Location & Status */}
                            <Box sx={{ margin: 2 }}>
                                <SectionHeader title="Location & Preferences" icon={<FaLocationDot size={15} />} />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Country" value={lead.country} icon={<FaGlobe size={13} />} />
                                    <DetailItem label="State" value={lead.state} icon={<FaLocationDot size={13} />} />
                                    <DetailItem label="City" value={lead.city} icon={<FaCity size={13} />} />
                                    <DetailItem label="Owner" value={lead.owner_name || lead.owner} icon={<FaUser size={13} />} color="secondary.main" />
                                    <DetailItem label="Creation" value={`${new Date(lead.creation).toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date(lead.creation).toLocaleTimeString('en-GB')}`} icon={<FaCalendarDays size={13} />} />
                                </Box>
                            </Box>

                            {/* Additional Info */}
                            <Box
                                sx={{
                                    p: 3,
                                    bgcolor: (theme) => theme.palette.mode === 'light' ? '#F4F7FB' : alpha(theme.palette.primary.main, 0.04),
                                    borderRadius: 2.5,
                                    margin: 2,
                                    border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#E8EEF5' : alpha(theme.palette.primary.main, 0.12)}`,
                                }}
                            >
                                <SectionHeader title="Additional Information" icon={<FaFileLines size={18} />} noMargin />
                                <Box sx={{ mt: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#68707bff', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: 0.2 }}>
                                            Billing Address
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, lineHeight: 1.6 }}>
                                            {lead.billing_address || 'No address provided'}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ borderStyle: 'solid', borderColor: (theme) => theme.palette.mode === 'light' ? '#E8EEF5' : alpha(theme.palette.divider, 0.5) }} />
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#68707bff', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: 0.8 }}>
                                            Remarks / Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: lead.remarks ? '#1E293B' : '#64748B', fontWeight: lead.remarks ? 600 : 500, fontStyle: lead.remarks ? 'normal' : 'italic', lineHeight: 1.6 }}>
                                            {lead.remarks || 'No remarks added'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    )}

                    {currentTab === 'pipeline' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <LeadPipelineTimeline
                                title="Stage History"
                                list={lead.converted_pipeline_timeline || []}
                            />
                        </Box>
                    )}

                    {currentTab === 'followups' && (
                        <LeadFollowupDetails
                            title="Followup History"
                            list={followupHistory}
                        />
                    )}

                    {currentTab === 'proposal' && (
                        <LeadProposalDetails
                            title="Proposal List"
                            list={proposalHistory}
                        />
                    )}

                    {currentTab === 'convert' && (
                        <Box sx={{ py: 3 }}>
                            {lead.converted_account || lead.converted_contact ? (
                                <Box>
                                    <Box sx={{ padding: 5, bgcolor: (theme) => theme.palette.mode === 'light' ? '#F4F7FB' : alpha(theme.palette.primary.main, 0.04), borderRadius: 2.5, border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#E8EEF5' : alpha(theme.palette.primary.main, 0.12)}`, }}>
                                        <Stack spacing={2.5}>
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                        Converted Company
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: 'text.primary',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {convertedAccountName || 'NA'}
                                                </Typography>

                                                {lead.converted_contact && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontWeight: 700,
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {lead.converted_account}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Divider sx={{ borderStyle: 'dashed' }} />
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                                        Converted Client
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: 'text.primary',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {convertedContactName || 'NA'}
                                                </Typography>

                                                {lead.converted_contact && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: 'primary.main',
                                                            fontWeight: 700,
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {lead.converted_contact}
                                                    </Typography>
                                                )}

                                            </Box>
                                        </Stack>
                                    </Box>
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
                                        Convert this lead into a permanent Client and Company record in the CRM.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        startIcon={converting ? <Iconify icon={"svg-spinners:18-dots-indicator" as any} /> : <Iconify icon={"solar:refresh-bold" as any} />}
                                        onClick={() => setOpenConvertDialog(true)}
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
            </Box>

            <AccountDetailsDialog
                open={openAccount}
                onClose={() => setOpenAccount(false)}
                accountId={selectedAccount}
            />

            <ContactDetailsDialog
                open={openContact}
                onClose={() => setOpenContact(false)}
                contactId={selectedContact}
            />

            <WhatsappChatDialog
                open={openWhatsapp}
                onClose={() => setOpenWhatsapp(false)}
                lead={lead}
            />

            <LeadConvertDialog
                open={openConvertDialog}
                onClose={() => setOpenConvertDialog(false)}
                lead={lead}
                onReadyToConvert={() => setOpenConfirm(true)}
                onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
            />

            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                title="Convert Lead"
                icon="solar:user-check-rounded-bold-duotone"
                iconColor="success.main"
                content="Are you sure you want to convert this lead? This will create a permanent Client and Company record."
                action={
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            handleConvert();
                            setOpenConfirm(false);
                        }}
                        sx={{ borderRadius: 1.5 }}
                    >
                        Convert
                    </Button>
                }
            />

            <ConfirmDialog
                open={confirmUpdate}
                onClose={() => setConfirmUpdate(false)}
                title="Confirm Status Update"
                content={selectedStage ? `Are you sure you want to update the lead status to "${selectedStage}"?` : 'Are you sure you want to update the lead status?'}
                icon="solar:info-circle-bold"
                iconColor="#2081C3"
                action={
                    <Button onClick={handleUpdateStage} color="primary" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        {updatingStage ? <CircularProgress size={20} color="inherit" /> : 'Update'}
                    </Button>
                }
            />

            {automationData && (
                <WhatsappAutomationDialog
                    open={openAutomationDialog}
                    onClose={() => {
                        setOpenAutomationDialog(false);
                        setAutomationData(null);
                    }}
                    automation={automationData}
                    lead={lead}
                    onSend={handleSendAutomationMessage}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: React.ReactNode, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: noMargin ? 0 : 2.5 }}>
            <Box sx={{ color: 'primary.main', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 15 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null; icon: React.ReactNode; color?: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ color: 'text.disabled', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
