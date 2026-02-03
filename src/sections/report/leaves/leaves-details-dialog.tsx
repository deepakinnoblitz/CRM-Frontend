import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getHRDoc } from 'src/api/hr-management';
import { getLeaveWorkflowActions, applyLeaveWorkflowAction, type WorkflowAction } from 'src/api/leaves';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    leaveId: string | null;
    onRefresh?: () => void;
};

export function LeavesDetailsDialog({ open, onClose, leaveId, onRefresh }: Props) {
    const [leave, setLeave] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);

    const { user } = useAuth();
    const userRoles = user?.roles || [];
    const isHR = userRoles.some(r => r.includes('HR')) || userRoles.includes('Administrator') || userRoles.includes('System Manager');
    const isEmployee = !isHR;

    const fetchData = useCallback(async () => {
        if (!leaveId) return;
        setLoading(true);
        try {
            const data = await getHRDoc('Leave Application', leaveId);
            setLeave(data);
            if (data?.workflow_state) {
                const availableActions = await getLeaveWorkflowActions(data.workflow_state);
                setActions(availableActions);
            }
        } catch (err) {
            console.error('Failed to fetch leave details:', err);
        } finally {
            setLoading(false);
        }
    }, [leaveId]);

    useEffect(() => {
        if (open && leaveId) {
            fetchData();
        } else {
            setLeave(null);
            setActions([]);
        }
    }, [open, leaveId, fetchData]);

    const handleActionClick = (action: WorkflowAction) => {
        setSelectedAction(action);
        const lowerAction = action.action.toLowerCase();
        if (lowerAction.includes('approve') || lowerAction.includes('reject')) {
            handleApplyAction(action);
        } else {
            setCommentDialogOpen(true);
        }
    };

    const handleApplyAction = async (actionOverride?: WorkflowAction) => {
        const actionToApply = actionOverride || selectedAction;
        if (!actionToApply || !leaveId) return;

        try {
            setSubmitting(true);
            await applyLeaveWorkflowAction(leaveId, actionToApply.action, comment);
            setComment('');
            setCommentDialogOpen(false);
            setSelectedAction(null);
            await fetchData();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to apply action:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending': return 'warning';
            case 'Clarification Requested': return 'info';
            case 'Open': return 'info';
            default: return 'default';
        }
    };

    const getActionColor = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('approve')) return 'success';
        if (lower.includes('reject')) return 'error';
        if (lower.includes('clarification')) return 'info';
        return 'primary';
    };

    const getConversation = useCallback(() => {
        if (!leave) return [];
        const thread: { type: 'hr' | 'employee', text: string }[] = [];
        // Loop through all 5 potential query/reply pairs
        for (let i = 1; i <= 5; i++) {
            const hrField = i === 1 ? 'hr_query' : `hr_query_${i}`;
            const empField = i === 1 ? 'employee_reply' : `employee_reply_${i}`;

            const hrVal = leave[hrField];
            const empVal = leave[empField];

            if (hrVal && String(hrVal).trim()) {
                thread.push({ type: 'hr', text: String(hrVal).trim() });
            }
            if (empVal && String(empVal).trim()) {
                thread.push({ type: 'employee', text: String(empVal).trim() });
            }
        }
        return thread;
    }, [leave]);

    const conversation = getConversation();

    const hrQueryCount = [1, 2, 3, 4, 5].filter(i => {
        const field = i === 1 ? 'hr_query' : `hr_query_${i}`;
        return leave?.[field] && String(leave[field]).trim();
    }).length;

    const empReplyCount = [1, 2, 3, 4, 5].filter(i => {
        const field = i === 1 ? 'employee_reply' : `employee_reply_${i}`;
        return leave?.[field] && String(leave[field]).trim();
    }).length;

    // Filter available actions based on 5 conversation limit
    const filteredActions = actions.filter(action => {
        const lowerAction = action.action.toLowerCase();
        const isClarification = lowerAction.includes('clarification') || lowerAction.includes('query');

        // If it's a clarification action and the limit is reached for the user's role
        if (isClarification) {
            if (isHR && hrQueryCount >= 5) return false;
            if (isEmployee && empReplyCount >= 5) return false;
        }
        return true;
    });

    const renderConversation = conversation.length > 0 && (
        <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={"solar:chat-round-dots-bold-duotone" as any} width={20} sx={{ color: 'text.secondary' }} />
                Clarifications & Messages
            </Typography>

            <Stack spacing={2}>
                {conversation.map((msg, index) => {
                    const isSelf = (isHR && msg.type === 'hr') || (isEmployee && msg.type === 'employee');

                    return (
                        <Stack
                            key={index}
                            direction="row"
                            spacing={1.5}
                            justifyContent={isSelf ? 'flex-end' : 'flex-start'}
                        >
                            {!isSelf && (
                                <Box sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    bgcolor: msg.type === 'hr' ? 'info.main' : 'warning.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'common.white',
                                    flexShrink: 0
                                }}>
                                    <Iconify icon={msg.type === 'hr' ? ("solar:user-bold" as any) : ("solar:user-id-bold" as any)} width={18} />
                                </Box>
                            )}
                            <Box sx={{
                                maxWidth: '85%',
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: isSelf ? 'primary.main' : 'background.paper',
                                color: isSelf ? 'primary.contrastText' : 'text.primary',
                                boxShadow: (theme) => theme.customShadows?.z1,
                                border: (theme) => !isSelf ? `1px solid ${theme.palette.divider}` : 'none'
                            }}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700, textAlign: isSelf ? 'right' : 'left', color: isSelf ? 'inherit' : 'primary.main' }}>
                                    {msg.type === 'hr' ? 'HR Message' : 'Employee Reply'}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.text}
                                </Typography>
                            </Box>
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );

    const renderDetails = (
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
                            {leave?.employee_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {leave?.employee}
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    }}
                >
                    <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                            TYPE
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {leave?.leave_type || 'N/A'}
                        </Typography>
                    </Stack>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderStyle: 'dashed' }} />

                    <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                            DURATION
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {leave?.leave_type?.toLowerCase() === 'permission'
                                ? `${leave?.permission_hours} mins`
                                : `${leave?.total_days} days`
                            }
                        </Typography>
                    </Stack>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2, borderStyle: 'dashed' }} />

                    <Stack spacing={0.5} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, lineHeight: 1.5 }}>
                            STATUS
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Label color={getStatusColor(leave?.workflow_state)} variant="filled" sx={{ textTransform: 'uppercase', height: 24, px: 1.5 }}>
                                {leave?.workflow_state || 'Pending'}
                            </Label>
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            {/* Date Details */}
            <Stack spacing={2}>
                <DetailRow label="Applied On" value={dayjs(leave?.creation).format('DD MMM YYYY HH:mm')} icon="solar:calendar-bold" />
                <Divider />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <DetailRow label="From Date" value={dayjs(leave?.from_date).format('DD MMM YYYY')} icon="solar:calendar-date-bold" />
                    <DetailRow label="To Date" value={dayjs(leave?.to_date).format('DD MMM YYYY')} icon="solar:calendar-date-bold" />
                </Box>
                {leave?.half_day === 1 && (
                    <DetailRow label="Half Day" value={`Yes (${dayjs(leave?.half_day_date).format('DD MMM YYYY')})`} icon="solar:history-bold" />
                )}
            </Stack>

            {/* Reason Section */}
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                    Reason
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {leave?.reson || 'No reason specified'}
                </Typography>
            </Box>

            {/* Attachments */}
            {leave?.attachment && (
                <Button
                    href={leave.attachment}
                    target="_blank"
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon={"solar:link-bold" as any} />}
                    sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
                >
                    View Attachment
                </Button>
            )}

            {/* Conversation History */}
            {renderConversation}
        </Stack>
    );

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Application Details</Typography>
                    </Stack>
                    <IconButton onClick={onClose} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08) } }}>
                        <Iconify icon="mingcute:close-line" width={24} />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, pt: 0 }}>
                    {loading && !leave ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                        </Box>
                    ) : leave ? (
                        renderDetails
                    ) : (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Application Found</Typography>
                        </Box>
                    )}
                </DialogContent>

                {filteredActions.length > 0 && (
                    <>
                        <Divider />
                        <DialogActions sx={{ p: 3, justifyContent: 'flex-end', gap: 1.5 }}>
                            {filteredActions.map((action) => (
                                <Button
                                    key={action.action}
                                    variant="contained"
                                    color={getActionColor(action.action)}
                                    onClick={() => handleActionClick(action)}
                                    disabled={submitting}
                                    sx={{ fontWeight: 800, px: 3 }}
                                    startIcon={submitting && selectedAction?.action === action.action ? <Iconify icon={"svg-spinners:18-dots-indicator" as any} /> : null}
                                >
                                    {action.action}
                                </Button>
                            ))}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon={"solar:pen-bold" as any} sx={{ color: getActionColor(selectedAction?.action || '') }} />
                    {selectedAction?.action}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                        Are you sure you want to perform this action? You can add an optional comment below.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Comment / Message"
                        placeholder="Type your message here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={getActionColor(selectedAction?.action || '')}
                        onClick={() => handleApplyAction()}
                        disabled={submitting}
                        startIcon={submitting ? <Iconify icon={"svg-spinners:18-dots-indicator" as any} /> : null}
                    >
                        {submitting ? 'Processing...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
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
