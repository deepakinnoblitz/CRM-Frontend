import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { getRequest, updateRequestStatus } from 'src/api/requests';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

import { ClarificationDialog } from './clarification-dialog';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    request: any;
    onRefresh?: () => void;
    socket?: any;
};

export function RequestDetailsDialog({ open, onClose, request, onRefresh, socket }: Props) {
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const [openClarification, setOpenClarification] = useState(false);
    const [clarificationType, setClarificationType] = useState<'HR' | 'Employee'>('HR');
    const [internalRequest, setInternalRequest] = useState<any>(request);

    useEffect(() => {
        setInternalRequest(request);
    }, [request]);

    useEffect(() => {
        if (open && internalRequest?.name) {
            // Fetch fresh data when dialog opens
            getRequest(internalRequest.name).then(setInternalRequest).catch(console.error);
        }
    }, [open, internalRequest?.name]);

    // Real-time: refresh when this specific request changes
    useEffect(() => {
        if (!socket || !open || !internalRequest?.name) return undefined;

        const handleUpdate = (data: any) => {
            if (data?.name === internalRequest.name) {
                getRequest(internalRequest.name).then(setInternalRequest).catch(console.error);
            }
        };

        socket.on('request_updated', handleUpdate);
        return () => socket.off('request_updated', handleUpdate);
    }, [socket, open, internalRequest?.name]);

    const isEmployee = user?.email === internalRequest?.owner;

    const handleUpdateStatus = async (status: string, message?: string) => {
        if (!internalRequest?.name) return;
        setLoading(status);
        try {
            const updateData: any = { workflow_state: status };

            if (message) {
                if (clarificationType === 'HR') {
                    const fields = ['hr_query', 'hr_query_2', 'hr_query_3', 'hr_query_4', 'hr_query_5'];
                    const nextField = fields.find(f => !internalRequest[f]);
                    if (nextField) updateData[nextField] = message;
                } else {
                    const fields = ['employee_reply', 'employee_reply_2', 'employee_reply_3', 'employee_reply_4', 'employee_reply_5'];
                    const nextField = fields.find(f => !internalRequest[f]);
                    if (nextField) updateData[nextField] = message;
                }
            }

            await updateRequestStatus(internalRequest.name, status, updateData);
            if (onRefresh) onRefresh();

            // For clarify actions, don't close, just refresh local data
            if (status === 'Clarification Requested' || (isEmployee && status === 'Pending')) {
                setOpenClarification(false);
                const latestRequest = await getRequest(internalRequest.name);
                setInternalRequest(latestRequest);
            } else {
                setOpenClarification(false);
                onClose();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setLoading(null);
        }
    };

    const renderStatus = (status: string) => (
        <Label
            variant="soft"
            color={
                (status === 'Approved' && 'success') ||
                (status === 'Rejected' && 'error') ||
                (status === 'Clarification Requested' && 'info') ||
                'warning'
            }
        >
            {status || 'Pending'}
        </Label>
    );

    const getMessages = () => {
        const msgs: { sender: string; text: string; side: 'left' | 'right' }[] = [];
        for (let i = 1; i <= 5; i++) {
            const hrField = i === 1 ? 'hr_query' : `hr_query_${i}`;
            const empField = i === 1 ? 'employee_reply' : `employee_reply_${i}`;

            if (internalRequest[hrField]) {
                msgs.push({
                    sender: 'HR',
                    text: internalRequest[hrField],
                    side: isEmployee ? 'left' : 'right'
                });
            }
            if (internalRequest[empField]) {
                msgs.push({
                    sender: internalRequest.employee_name || 'Employee',
                    text: internalRequest[empField],
                    side: isEmployee ? 'right' : 'left'
                });
            }
        }
        return msgs;
    };

    const messages = internalRequest ? getMessages() : [];

    const hrQueryCount = ['hr_query', 'hr_query_2', 'hr_query_3', 'hr_query_4', 'hr_query_5'].filter(f => internalRequest?.[f]).length;
    const employeeReplyCount = ['employee_reply', 'employee_reply_2', 'employee_reply_3', 'employee_reply_4', 'employee_reply_5'].filter(f => internalRequest?.[f]).length;

    const hrLimitReached = hrQueryCount >= 5;
    const employeeLimitReached = employeeReplyCount >= 5;

    const renderConversation = (
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader title="Clarification History" icon="solar:chat-round-dots-bold" />
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 2.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    overflowY: 'auto',
                    minHeight: 400,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
            >
                {messages.length > 0 ? (
                    messages.map((msg, idx) => {
                        const isSelf = msg.side === 'right';

                        return (
                            <Box
                                key={idx}
                                sx={{
                                    position: 'relative',
                                    maxWidth: '85%',
                                    alignSelf: isSelf ? 'flex-end' : 'flex-start',
                                    bgcolor: isSelf ? 'primary.main' : 'background.paper',
                                    color: isSelf ? 'primary.contrastText' : 'text.primary',
                                    p: 1.5,
                                    px: 2,
                                    borderRadius: 1.5,
                                    borderTopRightRadius: isSelf ? 0 : 1.5,
                                    borderTopLeftRadius: !isSelf ? 0 : 1.5,
                                    boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 2px rgba(0,0,0,0.1)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        width: 0,
                                        height: 0,
                                        borderStyle: 'solid',
                                        ...(isSelf
                                            ? {
                                                right: -10,
                                                borderWidth: '0 0 12px 12px',
                                                borderColor: (theme) => `transparent transparent transparent ${theme.palette.primary.main}`,
                                            }
                                            : {
                                                left: -10,
                                                borderWidth: '0 12px 12px 0',
                                                borderColor: (theme) => `transparent ${theme.palette.background.paper} transparent transparent`,
                                            }),
                                    },
                                }}
                            >
                                {!isSelf && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            mb: 0.5,
                                            fontWeight: 700,
                                            color: 'primary.main',
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {msg.sender}
                                    </Typography>
                                )}
                                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                    {msg.text}
                                </Typography>
                            </Box>
                        );
                    })
                ) : (
                    <Box sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <Typography variant="body2">No comments yet</Typography>
                    </Box>
                )}
                {isEmployee && employeeLimitReached && internalRequest.workflow_state === 'Clarification Requested' && (
                    <Typography variant="caption" color="error" sx={{ textAlign: 'center', mt: 1, fontWeight: 700 }}>
                        Maximum reply limit (5) reached.
                    </Typography>
                )}
                {!isEmployee && hrLimitReached && (internalRequest.workflow_state === 'Pending' || internalRequest.workflow_state === 'Clarification Requested' || !internalRequest.workflow_state) && (
                    <Typography variant="caption" color="error" sx={{ textAlign: 'center', mt: 1, fontWeight: 700 }}>
                        Maximum clarification limit (5) reached.
                    </Typography>
                )}
            </Box>
        </Box>
    );

    const hasHistory = messages.length > 0;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={hasHistory ? 'lg' : 'md'}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows?.z24,
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Request Details</Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08) } }}>
                    <Iconify icon="mingcute:close-line" width={24} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, pt: 0 }}>
                {internalRequest ? (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' },
                            gap: 3,
                        }}
                    >
                        {/* Left Column: Details */}
                        <Box sx={{ gridColumn: { lg: hasHistory ? 'span 8' : 'span 12' } }}>
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
                                                {internalRequest?.employee_name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                {internalRequest?.employee}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={4}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1.5,
                                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                                        }}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800 }}>STATUS</Typography>
                                            {renderStatus(internalRequest.workflow_state)}
                                        </Stack>
                                        <Stack spacing={0.5}>
                                            <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800 }}>ID</Typography>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{internalRequest.name}</Typography>
                                        </Stack>
                                    </Stack>
                                </Box>

                                {/* Request Info */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                    <DetailItem label="Subject" value={internalRequest.subject} icon="solar:document-text-bold" />
                                    <DetailItem label="Created On" value={internalRequest.creation ? new Date(internalRequest.creation).toLocaleString() : '-'} icon="solar:calendar-bold" />
                                </Box>

                                {/* Message Section */}
                                <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
                                        Message
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            '& p': { margin: 0, marginBottom: 1 },
                                            '& p:last-child': { marginBottom: 0 }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: internalRequest.message || '-' }}
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        {/* Right Column: Conversation */}
                        {hasHistory && (
                            <Box sx={{ gridColumn: { lg: 'span 4' } }}>
                                {renderConversation}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Request Found</Typography>
                    </Box>
                )}
            </DialogContent>

            {internalRequest && (
                <DialogActions sx={{ p: 3, justifyContent: 'flex-end', gap: 1.5 }}>
                    {/* HR Actions */}
                    {!isEmployee && (internalRequest.workflow_state === 'Pending' || internalRequest.workflow_state === 'Clarification Requested' || !internalRequest.workflow_state) && (
                        <>
                            <LoadingButton
                                color="success"
                                variant="contained"
                                loading={loading === 'Approved'}
                                onClick={() => handleUpdateStatus('Approved')}
                                startIcon={<Iconify icon={"solar:check-circle-bold" as any} />}
                            >
                                Approve
                            </LoadingButton>

                            <LoadingButton
                                color="error"
                                variant="contained"
                                loading={loading === 'Rejected'}
                                onClick={() => handleUpdateStatus('Rejected')}
                                startIcon={<Iconify icon={"solar:close-circle-bold" as any} />}
                            >
                                Reject
                            </LoadingButton>

                            <Button
                                color="info"
                                variant="contained"
                                disabled={hrLimitReached}
                                onClick={() => {
                                    setClarificationType('HR');
                                    setOpenClarification(true);
                                }}
                                startIcon={<Iconify icon={"solar:question-square-bold" as any} />}
                            >
                                Ask Clarification
                            </Button>
                        </>
                    )}

                    {/* Employee Actions */}
                    {isEmployee && internalRequest.workflow_state === 'Clarification Requested' && (
                        <Button
                            color="info"
                            variant="contained"
                            disabled={employeeLimitReached}
                            onClick={() => {
                                setClarificationType('Employee');
                                setOpenClarification(true);
                            }}
                            startIcon={<Iconify icon={"solar:forward-bold" as any} />}
                        >
                            Reply
                        </Button>
                    )}
                </DialogActions>
            )}

            <ClarificationDialog
                open={openClarification}
                onClose={() => setOpenClarification(false)}
                onConfirm={(msg) => handleUpdateStatus(clarificationType === 'HR' ? 'Clarification Requested' : 'Pending', msg)}
                title={clarificationType === 'HR' ? 'Ask Clarification' : 'Reply to HR'}
                label={clarificationType === 'HR' ? 'Query' : 'Reply'}
                loading={loading === 'Clarification Requested' || loading === 'Pending'}
            />
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

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
