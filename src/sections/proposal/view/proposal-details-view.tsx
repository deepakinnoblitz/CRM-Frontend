import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import {
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineBuildingOffice,
    HiOutlineClock,
    HiOutlinePaperClip,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Backdrop from '@mui/material/Backdrop';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { handleDownload, handleDirectPrint } from 'src/utils/print';

import { getProposal, updateProposal, getProposalPrintUrl } from 'src/api/proposal';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Draft', 'Sent', 'Approved', 'Rejected', 'Expired'];

const STATUS_COLORS: Record<string, any> = {
    Draft: 'default',
    Sent: 'info',
    Approved: 'success',
    Rejected: 'error',
    Expired: 'warning',
};

// ----------------------------------------------------------------------

export function ProposalDetailsView() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();

    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [printing, setPrinting] = useState(false);

    const [selectedStatus, setSelectedStatus] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [confirmStatusUpdate, setConfirmStatusUpdate] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({ open: false, message: '', severity: 'success' });

    const decodedId = decodeURIComponent(id || '');

    useEffect(() => {
        if (id) {
            setLoading(true);
            getProposal(decodedId)
                .then((data) => {
                    setProposal(data);
                    setSelectedStatus(data.status || 'Draft');
                })
                .catch((err) => console.error('Failed to fetch proposal:', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleUpdateStatus = useCallback(async () => {
        if (!proposal || !selectedStatus || selectedStatus === proposal.status) return;
        const prev = proposal.status;
        setConfirmStatusUpdate(false);
        setUpdatingStatus(true);
        try {
            await updateProposal(decodedId, { status: selectedStatus as any });
            const updated = await getProposal(decodedId);
            setProposal(updated);
            setSnackbar({
                open: true,
                message: `Status updated from "${prev}" to "${selectedStatus}"`,
                severity: 'success',
            });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
        } finally {
            setUpdatingStatus(false);
        }
    }, [proposal, selectedStatus, decodedId]);

    const handlePrint = () => {
        handleDownload(
            getProposalPrintUrl(decodedId),
            `${proposal?.reference_no || decodedId}.pdf`,
            () => setPrinting(true),
            () => setPrinting(false)
        );
    };

    const handlePreview = () => {
        handleDirectPrint(
            getProposalPrintUrl(decodedId),
            () => setPrinting(true),
            () => setPrinting(false)
        );
    };

    if (loading) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </DashboardContent>
        );
    }

    if (!proposal) {
        return (
            <DashboardContent maxWidth={false}>
                <Box sx={{ py: 20, textAlign: 'center' }}>
                    <Iconify icon={'solar:ghost-bold' as any} width={80} sx={{ color: 'text.disabled', mb: 3 }} />
                    <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                        Proposal Not Found
                    </Typography>
                    <Button onClick={() => router.push('/proposals')} sx={{ mt: 3 }} variant="contained">
                        Go back to proposals
                    </Button>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth={false}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {proposal.proposal_title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {proposal.reference_no}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/proposals')}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', px: 2.5 }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handlePrint}
                        startIcon={<Iconify icon={'solar:printer-bold' as any} width={18} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Download PDF
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handlePreview}
                        startIcon={<Iconify icon={'solar:file-text-bold' as any} width={18} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Preview
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => router.push(`/proposals/${encodeURIComponent(decodedId)}/edit`)}
                        startIcon={<Iconify icon="solar:pen-bold" width={18} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Edit
                    </Button>
                </Stack>
            </Stack>

            {/* Status Bar */}
            <Card sx={{ mb: 3, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Update Status:
                </Typography>
                <TextField
                    select
                    size="small"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ minWidth: 160 }}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </TextField>
                <Button
                    variant="contained"
                    disabled={!selectedStatus || selectedStatus === proposal.status || updatingStatus}
                    onClick={() => setConfirmStatusUpdate(true)}
                    sx={{ height: 36, px: 3, borderRadius: 1.5, fontWeight: 700, textTransform: 'none', bgcolor: '#2081C3', color: 'common.white', minWidth: 130, '&:hover': { bgcolor: '#1a699f' } }}
                >
                    {updatingStatus ? <CircularProgress size={20} color="inherit" /> : 'Update Status'}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Chip
                    label={proposal.status || 'Draft'}
                    color={STATUS_COLORS[proposal.status || 'Draft'] || 'default'}
                    sx={{ fontWeight: 800, fontSize: 13, px: 1 }}
                />
            </Card>

            <Card sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', minHeight: '75vh', flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Sidebar */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: 320 },
                            borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                            borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                            bgcolor: alpha(theme.palette.grey[500], 0.02),
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Scrollbar sx={{ p: 4, flexGrow: 1, height: 1 }}>
                            <Stack spacing={5}>
                                {/* Identity */}
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                                        {proposal.proposal_title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        {proposal.reference_no}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderStyle: 'dashed' }} />

                                {/* Proposal Info */}
                                <Box>
                                    <SectionHeader title="Proposal Information" />
                                    <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                        <DetailItem label="Client" value={proposal.customer_name || proposal.client_name} subValue={proposal.client_name} icon={<HiOutlineUser size={20} />} />
                                        <DetailItem label="Billing Name" value={proposal.billing_name || '—'} icon={<HiOutlineBuildingOffice size={20} />} />
                                        <DetailItem label="Proposal Date" value={fDate(proposal.proposal_date)} icon={<HiOutlineCalendar size={20} />} />
                                        {proposal.valid_until && (
                                            <DetailItem label="Valid Until" value={fDate(proposal.valid_until)} icon={<HiOutlineClock size={20} />} />
                                        )}
                                        {proposal.prospect && (
                                            <DetailItem label="Prospect" value={proposal.prospect} icon={<HiOutlineDocumentText size={20} />} />
                                        )}
                                        {proposal.subject && (
                                            <DetailItem label="Subject" value={proposal.subject} icon={<HiOutlineCheckCircle size={20} />} />
                                        )}
                                        <DetailItem label="Total Attachments" value={String(proposal.total_attachments || 0)} icon={<HiOutlinePaperClip size={20} />} />
                                        <DetailItem label="Created By" value={proposal.created_by || '—'} icon={<HiOutlineUser size={20} />} />
                                    </Stack>
                                </Box>

                                {/* Description */}
                                {proposal.description && (
                                    <Box>
                                        <SectionHeader title="Description" />
                                        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', fontWeight: 500, lineHeight: 1.7 }}>
                                            {proposal.description}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Sync Info */}
                                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.04), border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}` }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                                        Last Modified:
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                                        {proposal.modified ? new Date(proposal.modified).toLocaleString() : '—'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Scrollbar>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{ flexGrow: 1, p: 4, overflow: 'auto' }}>
                        <Stack spacing={4}>
                            {/* Terms & Conditions */}
                            {proposal.terms_and_conditions && (
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                        Terms & Conditions
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                                            border: (t) => `1px solid ${t.palette.divider}`,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: proposal.terms_and_conditions }}
                                    />
                                </Box>
                            )}

                            {/* Attachments Table */}
                            <Box>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        Attachments
                                        <Chip label={proposal.total_attachments || 0} size="small" sx={{ ml: 1, fontWeight: 700 }} color="primary" />
                                    </Typography>
                                </Stack>

                                {proposal.attachments_table && proposal.attachments_table.length > 0 ? (
                                    <TableContainer sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1.5 }}>
                                        <Table>
                                            <TableHead sx={{ bgcolor: (t) => alpha(t.palette.grey[500], 0.08), '& th': { fontWeight: 700, fontSize: 13 } }}>
                                                <TableRow>
                                                    <TableCell width={50} align="center">S.No</TableCell>
                                                    <TableCell>File Name</TableCell>
                                                    <TableCell>Description</TableCell>
                                                    <TableCell>File Size</TableCell>
                                                    <TableCell>Uploaded On</TableCell>
                                                    <TableCell>Uploaded By</TableCell>
                                                    <TableCell align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {proposal.attachments_table.map((att: any, index: number) => (
                                                    <TableRow key={att.name || index} hover>
                                                        <TableCell align="center">{index + 1}</TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                <Iconify icon="solar:paperclip-bold" width={16} sx={{ color: 'text.secondary' }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {att.file_name || att.attachment?.split('/')?.pop() || '—'}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                {att.description || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                {att.file_size || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                {att.uploaded_on ? new Date(att.uploaded_on).toLocaleDateString() : '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                {att.uploaded_by || '—'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                {att.attachment && (
                                                                    <>
                                                                        <IconButton size="small" onClick={() => window.open(att.attachment, '_blank')} sx={{ color: 'info.main' }} title="Preview">
                                                                            <Iconify icon="solar:eye-bold" width={16} />
                                                                        </IconButton>
                                                                        <IconButton size="small" component="a" href={att.attachment} download={att.file_name} sx={{ color: 'success.main' }} title="Download">
                                                                            <Iconify icon="solar:download-bold" width={16} />
                                                                        </IconButton>
                                                                    </>
                                                                )}
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center', borderRadius: 2, border: (t) => `1px dashed ${t.palette.divider}` }}>
                                        <Iconify icon="solar:paperclip-bold" width={40} sx={{ color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                            No attachments
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Card>

            {/* Confirm Status Update */}
            <ConfirmDialog
                open={confirmStatusUpdate}
                onClose={() => setConfirmStatusUpdate(false)}
                title="Confirm Status Update"
                content={`Are you sure you want to update the proposal status to "${selectedStatus}"?`}
                icon="solar:info-circle-bold"
                iconColor="#2081C3"
                action={
                    <Button onClick={handleUpdateStatus} color="primary" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Update
                    </Button>
                }
            />

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Print Backdrop */}
            <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={printing}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </DashboardContent>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '13px' }}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value, subValue, icon }: { label: string; value?: string | null; subValue?: string | null; icon: React.ReactNode }) {
    return (
        <Box sx={{ pb: 2, borderBottom: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}` }}>
            <Typography variant="caption" sx={{ color: '#2081C3', fontWeight: 800, textTransform: 'uppercase', mb: 0.75, display: 'block', fontSize: 11, letterSpacing: 0.5 }}>
                {label}
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ color: 'text.secondary', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.4, fontSize: 14 }}>
                        {value || '—'}
                    </Typography>
                    {subValue && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: 12, fontWeight: 600 }}>
                            {subValue}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
