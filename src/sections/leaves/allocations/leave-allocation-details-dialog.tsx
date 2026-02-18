import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

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
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { getHRDoc } from 'src/api/hr-management';
import { type WorkflowAction, getLeaveAllocationWorkflowActions, applyLeaveAllocationWorkflowAction } from 'src/api/leave-allocations';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    allocationId: string | null;
    onRefresh?: () => void;
    onEdit?: (allocation: any) => void;
    onDelete?: (allocationId: string) => void;
};

export function LeaveAllocationDetailsDialog({ open, onClose, allocationId, onRefresh, onEdit, onDelete }: Props) {
    const [allocation, setAllocation] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);

    const { user } = useAuth();
    const userRoles = user?.roles || [];
    const isHR = userRoles.some(r => r.includes('HR')) || userRoles.includes('Administrator') || userRoles.includes('System Manager');

    const fetchData = useCallback(async (isSilent = false) => {
        if (!allocationId) return;
        if (!isSilent) setLoading(true);
        try {
            const data = await getHRDoc('Leave Allocation', allocationId);
            setAllocation(data);
            if (data?.workflow_state) {
                const availableActions = await getLeaveAllocationWorkflowActions(data.workflow_state);
                setActions(availableActions);
            }
        } catch (err) {
            console.error('Failed to fetch leave allocation details:', err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [allocationId]);

    useEffect(() => {
        if (open && allocationId) {
            fetchData();

            const interval = setInterval(() => {
                fetchData(true);
            }, 3000);

            return () => clearInterval(interval);
        }
        setAllocation(null);
        setActions([]);
        return undefined;
    }, [open, allocationId, fetchData]);

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
        if (!actionToApply || !allocationId) return;

        try {
            setSubmitting(true);
            await applyLeaveAllocationWorkflowAction(allocationId, actionToApply.action, comment);
            setComment('');
            setCommentDialogOpen(false);
            if (onRefresh) onRefresh();
            fetchData();
        } catch (e) {
            console.error('Failed to apply action:', e);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Cancelled': return 'error';
            case 'Draft': return 'warning';
            case 'Open': return 'info';
            default: return 'default';
        }
    };

    const renderContent = allocation && (
        <Stack spacing={3.5} sx={{ marginTop: 3 }}>
            {/* Profile Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
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
                    <Iconify icon={"solar:letter-bold" as any} width={32} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{allocation.employee_name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{allocation.employee}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Label
                        variant="soft"
                        color={getStatusColor(allocation.workflow_state || allocation.status)}
                        sx={{ textTransform: 'uppercase', fontWeight: 800, height: 28 }}
                    >
                        {allocation.workflow_state || allocation.status}
                    </Label>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                        ID: {allocation.name}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Information Grid */}
            <Box>
                <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 800, mb: 2, display: 'block' }}>
                    Allocation Details
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                    }}
                >
                    <DetailItem label="Leave Type" value={allocation.leave_type} icon="solar:letter-bold" />
                    <DetailItem
                        label="Period"
                        value={`${dayjs(allocation.from_date).format('DD MMM YYYY')} - ${dayjs(allocation.to_date).format('DD MMM YYYY')}`}
                        icon="solar:calendar-bold"
                    />
                </Box>
            </Box>

            {/* Usage Visualization */}
            <Box sx={{ p: 2.5, bgcolor: 'background.neutral', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Iconify icon={"solar:chart-2-bold" as any} width={20} sx={{ color: 'success.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Usage Status</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        {allocation.total_leaves_taken} / {allocation.total_leaves_allocated} Days
                    </Typography>
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={Math.min((allocation.total_leaves_taken / allocation.total_leaves_allocated) * 100, 100)}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: (theme) => alpha(theme.palette.divider, 0.12),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: 'success.main',
                        }
                    }}
                />
            </Box>

            {/* Actions */}
            {(onEdit || onDelete) && allocation && (
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    {onEdit && (
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="solar:pen-bold" />}
                            onClick={() => onEdit(allocation)}
                            sx={{
                                height: 40,
                                borderRadius: 1,
                                px: 3,
                                fontWeight: 800,
                                bgcolor: (theme) => alpha('#ffab00', 0.08),
                                color: '#ffab00',
                                border: (theme) => `1px solid ${alpha('#ffab00', 0.12)}`,
                                '&:hover': {
                                    bgcolor: (theme) => alpha('#ffab00', 0.16),
                                },
                            }}
                        >
                            Edit
                        </Button>
                    )}

                    {onDelete && allocationId && (
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                            onClick={() => onDelete(allocationId)}
                            sx={{
                                height: 40,
                                borderRadius: 1,
                                px: 3,
                                fontWeight: 800,
                                bgcolor: (theme) => alpha('#ff5630', 0.08),
                                color: '#ff5630',
                                border: (theme) => `1px solid ${alpha('#ff5630', 0.12)}`,
                                '&:hover': {
                                    bgcolor: (theme) => alpha('#ff5630', 0.16),
                                },
                            }}
                        >
                            Delete
                        </Button>
                    )}
                </Stack>
            )}

            {/* Workflow Actions */}
            {actions.length > 0 && isHR && (
                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                    {actions.map((action) => {
                        const isReject = action.action.toLowerCase().includes('reject') || action.action.toLowerCase().includes('cancel');
                        return (
                            <LoadingButton
                                key={action.action}
                                variant="contained"
                                onClick={() => handleActionClick(action)}
                                loading={submitting}
                                sx={{
                                    height: 40,
                                    borderRadius: 1,
                                    px: 3,
                                    fontWeight: 800,
                                    bgcolor: (theme) => alpha(isReject ? theme.palette.error.main : '#086ad8', 0.08),
                                    color: (theme) => isReject ? theme.palette.error.main : '#086ad8',
                                    border: (theme) => `1px solid ${alpha(isReject ? theme.palette.error.main : '#086ad8', 0.12)}`,
                                    '&:hover': {
                                        bgcolor: (theme) => alpha(isReject ? theme.palette.error.main : '#086ad8', 0.16),
                                    },
                                }}
                            >
                                {action.action}
                            </LoadingButton>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: { borderRadius: 2.5 },
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Allocation Profile</Typography>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconButton
                            onClick={onClose}
                            sx={{
                                width: 36,
                                height: 36,
                                color: (theme) => theme.palette.grey[500],
                                bgcolor: 'background.paper',
                                boxShadow: (theme) => (theme as any).customShadows?.z1
                            }}
                        >
                            <Iconify icon="mingcute:close-line" />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {loading && !allocation ? (
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 10, minHeight: 200 }}>
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Iconify icon={"svg-spinners:ring-resize" as any} width={40} sx={{ color: 'primary.main' }} />
                                <Box sx={{ position: 'absolute', width: 20, height: 20, bgcolor: 'primary.main', borderRadius: '50%', opacity: 0.1, animation: 'pulse 2s infinite' }} />
                            </Box>
                        </Stack>
                    ) : (
                        renderContent
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={commentDialogOpen}
                onClose={() => setCommentDialogOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: { borderRadius: 2 },
                }}
            >
                <DialogTitle sx={{ p: 2.5, pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Add Remark
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 2.5 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Provide any additional details or remarks..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.neutral',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 1 }}>
                    <Button onClick={() => setCommentDialogOpen(false)} sx={{ color: 'text.secondary' }}>
                        Cancel
                    </Button>
                    <LoadingButton
                        variant="contained"
                        onClick={() => handleApplyAction()}
                        loading={submitting}
                        sx={{ px: 4, height: 40 }}
                    >
                        Confirm Action
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

// ----------------------------------------------------------------------

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
