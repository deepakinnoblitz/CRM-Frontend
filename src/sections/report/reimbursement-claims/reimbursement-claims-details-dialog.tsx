import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { updateReimbursementClaim, WorkflowAction, getReimbursementClaimWorkflowActions, applyReimbursementClaimWorkflowAction } from 'src/api/reimbursement-claims';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    claim: any;
    onRefresh?: () => void;
};

export function ReimbursementClaimDetailsDialog({ open, onClose, claim, onRefresh }: Props) {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);

    // Edit Payment Logic
    const [editPaymentOpen, setEditPaymentOpen] = useState(false);
    const [editPaymentReference, setEditPaymentReference] = useState('');
    const [editPaymentDate, setEditPaymentDate] = useState<string | null>(null);

    // Payment Logic
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentDate, setPaymentDate] = useState<string | null>(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        if (open && claim) {
            fetchActions();
        }
    }, [open, claim]);

    const fetchActions = async () => {
        try {
            const workflowActions = await getReimbursementClaimWorkflowActions(claim.workflow_state || 'Draft');
            // Filter out Pay and Mark Paid actions
            const filteredActions = workflowActions.filter(action => !['Pay', 'Mark Paid'].includes(action.action));
            setActions(filteredActions);
        } catch (error) {
            console.error('Failed to fetch workflow actions:', error);
        }
    };

    if (!claim) return null;

    const handleActionClick = (action: WorkflowAction) => {
        setSelectedAction(action);
        setComment('');
        setPaymentReference('');
        setPaymentDate(dayjs().format('YYYY-MM-DD'));
        setCommentDialogOpen(true);
    };

    const handleApplyAction = async () => {
        if (!selectedAction) return;
        setSubmitting(true);
        try {
            const paymentDetails = selectedAction.action === 'Pay' ? {
                payment_reference: paymentReference,
                paid_date: paymentDate,
                paid_by: user?.email
            } : undefined;

            await applyReimbursementClaimWorkflowAction(claim.name, selectedAction.action, comment, paymentDetails);
            if (onRefresh) onRefresh();
            setCommentDialogOpen(false);
            onClose();
        } catch (error) {
            console.error('Failed to apply workflow action:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenEditPayment = () => {
        setEditPaymentReference(claim.payment_reference || '');
        setEditPaymentDate(claim.paid_date || dayjs().format('YYYY-MM-DD'));
        setEditPaymentOpen(true);
    };

    const handleUpdatePayment = async () => {
        setSubmitting(true);
        try {
            await updateReimbursementClaim(claim.name, {
                payment_reference: editPaymentReference,
                paid_date: editPaymentDate || undefined
            });
            if (onRefresh) onRefresh();
            setEditPaymentOpen(false);
            onClose();
        } catch (error) {
            console.error('Failed to update payment details:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getActionColor = (action: string) => {
        if (['Approve', 'Approved', 'Pay', 'Paid'].includes(action)) return 'success';
        if (['Reject', 'Rejected', 'Cancel', 'Cancelled'].includes(action)) return 'error';
        return 'primary';
    };

    const renderHeader = (
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', bgcolor: 'background.neutral' }}>
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
                    mr: 3,
                }}
            >
                <Iconify icon={"solar:wallet-money-bold-duotone" as any} width={32} />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{claim.employee_name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {claim.claim_type} • {dayjs(claim.date_of_expense).format('DD/MM/YYYY')}
                </Typography>
            </Box>

            <Stack spacing={1} alignItems="flex-end">
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    ₹{claim.amount?.toLocaleString() || 0}
                </Typography>
                <Label variant="soft" color={claim.paid === 1 ? 'success' : 'warning'}>
                    {claim.workflow_state || (claim.paid === 1 ? 'Paid' : 'Pending')}
                </Label>
            </Stack>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Claim Details
                <IconButton onClick={onClose}>
                    <Iconify icon={"mingcute:close-line" as any} />
                </IconButton>
            </DialogTitle>

            <Scrollbar sx={{ maxHeight: '80vh' }}>
                <DialogContent sx={{ p: 0 }}>
                    {renderHeader}

                    <Box sx={{ p: 3, marginLeft: 2 }}>
                        <Stack spacing={3}>
                            {/* Claim Information */}
                            <Box>
                                <SectionHeader title="Claim Information" icon="" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Claim Type" value={claim.claim_type} icon="solar:tag-bold" />
                                    <DetailItem label="Date of Expense" value={dayjs(claim.date_of_expense).format('DD/MM/YYYY')} icon="solar:calendar-bold" />
                                    <DetailItem label="Amount" value={`₹${claim.amount?.toLocaleString() || 0}`} icon="solar:wad-of-money-bold" />
                                    <DetailItem label="Status" value={claim.paid === 1 ? 'Paid' : 'Pending'} icon="solar:info-circle-bold" />
                                </Box>
                            </Box>

                            {/* Settlement Details */}
                            {(claim.workflow_state === 'Paid' || claim.paid === 1) && (
                                <Box sx={{ pt: 3 }}>
                                    <SectionHeader
                                        title="Settlement Details"
                                        icon=""
                                    />
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gap: 3,
                                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                        }}
                                    >
                                        <DetailItem label="Approved By" value={claim.approved_by || '-'} icon="solar:user-bold" />
                                        <DetailItem label="Status" value={claim.workflow_state || (claim.paid === 1 ? 'Paid' : 'Pending')} icon="solar:flag-bold" />
                                        <DetailItem label="Paid By" value={claim.paid_by || '-'} icon="solar:user-bold" />
                                        <DetailItem label="Paid Date" value={claim.paid_date ? dayjs(claim.paid_date).format('DD/MM/YYYY') : '-'} icon="solar:calendar-bold" />
                                        <DetailItem label="Payment Reference" value={claim.payment_reference || '-'} icon="solar:bill-bold" />
                                    </Box>
                                </Box>
                            )}

                            {/* Claim Details / Notes */}
                            {(claim.claim_details || claim.approver_comments) && (
                                <Box sx={{ pt: 3 }}>
                                    <SectionHeader title="Details & Notes" icon="solar:notes-bold" />
                                    <Stack spacing={2}>
                                        {claim.claim_details && (
                                            <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1, display: 'block', textTransform: 'uppercase' }}>
                                                    Claim Details
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                                                    {claim.claim_details}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            {/* Attachments */}
                            {(claim.receipt || claim.payment_proof) && (
                                <Box sx={{ pt: 3 }}>
                                    <SectionHeader
                                        title="Attachments"
                                        icon="solar:link-bold"
                                        action={
                                            <Stack direction="row" spacing={1}>
                                                {claim.receipt && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        color="primary"
                                                        startIcon={<Iconify icon={"solar:paperclip-bold" as any} />}
                                                        href={claim.receipt}
                                                        target="_blank"
                                                        sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                                                    >
                                                        Expense Receipt
                                                    </Button>
                                                )}
                                                {claim.payment_proof && (
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        color="success"
                                                        startIcon={<Iconify icon={"solar:check-read-bold" as any} />}
                                                        href={claim.payment_proof}
                                                        target="_blank"
                                                        sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                                                    >
                                                        Payment Proof
                                                    </Button>
                                                )}
                                            </Stack>
                                        }
                                    />
                                </Box>
                            )}

                            {/* Metadata */}
                            <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                <SectionHeader title="Record Information" icon="solar:info-circle-bold" noMargin />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 2,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' },
                                        mt: 2
                                    }}
                                >
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Created On</Typography>
                                        <Typography variant="body2">{dayjs(claim.creation).format('DD/MM/YYYY HH:mm')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Last Modified</Typography>
                                        <Typography variant="body2">{dayjs(claim.modified).format('DD/MM/YYYY HH:mm')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Record ID</Typography>
                                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>{claim.name}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </DialogContent>
            </Scrollbar>

            {actions.length > 0 && (
                <DialogActions sx={{ p: 3, bgcolor: 'background.neutral', gap: 1.5 }}>
                    {actions.map((action) => (
                        <LoadingButton
                            key={action.action}
                            color={getActionColor(action.action) as any}
                            variant="contained"
                            loading={submitting && selectedAction?.action === action.action}
                            onClick={() => handleActionClick(action)}
                            sx={{ fontWeight: 800, px: 3 }}
                        >
                            {action.action}
                        </LoadingButton>
                    ))}
                </DialogActions>
            )}

            <ConfirmDialog
                open={commentDialogOpen}
                onClose={() => setCommentDialogOpen(false)}
                title={selectedAction?.action || 'Confirm'}
                content={
                    selectedAction?.action === 'Pay' ? (
                        <Box sx={{ pt: 1 }}>
                            <Typography sx={{ mb: 2 }}>Are you sure you want to mark this claim as <b>Paid</b>?</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Payment Reference"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    placeholder="Check number, Transaction ID, etc."
                                />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Payment Date"
                                        value={paymentDate ? dayjs(paymentDate) : null}
                                        onChange={(newValue) => setPaymentDate(newValue ? dayjs(newValue).format('YYYY-MM-DD') : null)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </LocalizationProvider>
                            </Stack>
                        </Box>
                    ) : (
                        `Are you sure you want to perform the action "${selectedAction?.action}"?`
                    )
                }
                icon={getActionIcon(selectedAction?.action || '')}
                iconColor={getActionColor(selectedAction?.action || '') + '.main'}
                action={
                    <LoadingButton
                        variant="contained"
                        color={getActionColor(selectedAction?.action || '') as any}
                        loading={submitting}
                        onClick={handleApplyAction}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        Confirm
                    </LoadingButton>
                }
            />

            <ConfirmDialog
                open={editPaymentOpen}
                onClose={() => setEditPaymentOpen(false)}
                title="Edit Payment Details"
                content={
                    <Box sx={{ pt: 1 }}>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Payment Reference"
                                value={editPaymentReference}
                                onChange={(e) => setEditPaymentReference(e.target.value)}
                                placeholder="Check number, Transaction ID, etc."
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Payment Date"
                                    value={editPaymentDate ? dayjs(editPaymentDate) : null}
                                    onChange={(newValue) => setEditPaymentDate(newValue ? dayjs(newValue).format('YYYY-MM-DD') : null)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Stack>
                    </Box>
                }
                action={
                    <LoadingButton
                        variant="contained"
                        color="primary"
                        loading={submitting}
                        onClick={handleUpdatePayment}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        Update
                    </LoadingButton>
                }
            />
        </Dialog>
    );
}

function getActionIcon(action: string) {
    if (['Approve', 'Approved'].includes(action)) return 'solar:check-circle-bold';
    if (['Reject', 'Rejected', 'Cancel', 'Cancelled'].includes(action)) return 'solar:close-circle-bold';
    if (['Pay', 'Paid'].includes(action)) return 'solar:wad-of-money-bold';
    return 'solar:question-circle-bold';
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon, action, noMargin = false }: { title: string; icon: string; action?: React.ReactNode; noMargin?: boolean }) {
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: noMargin ? 0 : 2, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Iconify icon={icon as any} width={20} sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                        {title}
                    </Typography>
                </Box>

                {action && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto', borderStyle: 'dashed' }} />
                        {action}
                    </Box>
                )}
            </Box>
            {!noMargin && <Divider sx={{ mb: 3 }} />}
        </>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box
                sx={{
                    p: 1,
                    mr: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Iconify icon={icon as any} width={20} />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}
