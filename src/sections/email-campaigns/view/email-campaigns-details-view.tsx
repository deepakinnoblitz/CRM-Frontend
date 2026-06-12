import { enqueueSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { VscDebugStart } from "react-icons/vsc";
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdMail, IoMdCalendar, IoMdPerson, IoMdStats, IoMdCreate, IoMdTrash, IoMdList } from "react-icons/io";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getEmailCampaign, deleteEmailCampaign, startCampaign as startEmailCampaign, fetchEmailQueue, EmailQueueItem } from 'src/api/email-campaign';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export function EmailCampaignsDetailsView() {
    const { id } = useParams();
    const router = useRouter();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState<any>(null);
    const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
    const [fetching, setFetching] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    useEffect(() => {
        if (id) {
            getEmailCampaign(id)
                .then(setCampaign)
                .finally(() => setFetching(false));
        }
    }, [id]);

    useEffect(() => {
        if (campaign?.name) {
            fetchEmailQueue(campaign.name)
                .then(setEmailQueue)
                .catch((err) => console.error('Failed to fetch email queue:', err));
        }
    }, [campaign?.name]);

    if (fetching) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </DashboardContent>
        );
    }

    if (!campaign) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Email Campaign not found</Typography>
                <Button onClick={() => router.push('/email-campaigns')} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        campaign_name,
        template_name,
        subject,
        status,
        target_type,
        filters,
        total_recipients,
        sent_count,
        open_count,
        click_count,
        failed_count,
        schedule_date,
        creation,
    } = campaign;

    const handleEdit = () => {
        router.push(`/email-campaigns/${encodeURIComponent(id || '')}/edit`);
    };

    const handleStartCampaign = async () => {
        try {
            await startEmailCampaign(campaign.name);

            const updated = await getEmailCampaign(campaign.name);
            setCampaign(updated);

            enqueueSnackbar('Campaign started successfully', {
                variant: 'success',
            });

        } catch (err: any) {
            console.error(err);

            enqueueSnackbar(
                err?.message || 'Failed to start campaign',
                {
                    variant: 'error',
                }
            );
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setDeleting(true);
        try {
            await deleteEmailCampaign(id);
            router.push('/email-campaigns');
        } catch (error) {
            console.error('Failed to delete email campaign:', error);
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3} className="no-print">
                <Typography variant="h4">Email Campaign: {campaign_name}</Typography>
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
                            }
                        }}
                    >
                        Go Back
                    </Button>
                    {!['Running', 'Completed', 'Cancelled'].includes(campaign.status) && (
                        <Button
                            variant="contained"
                            startIcon={<VscDebugStart />}
                            onClick={handleStartCampaign}
                            sx={{
                                borderRadius: 1.5,
                                fontWeight: 700,
                                textTransform: 'none',
                                bgcolor: '#36b37e',
                                color: 'common.white',
                                '&:hover': {
                                    bgcolor: '#2f9d6c',
                                },
                            }}
                        >
                            Start Campaign
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleEdit}
                        startIcon={<IoMdCreate size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' }
                        }}
                    >
                        Edit
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Stack spacing={4}>
                    <Box
                        sx={{
                            display: 'grid',
                            columnGap: 4,
                            rowGap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdMail size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Campaign Details</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                                    {campaign_name}
                                </Typography>
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="caption" color="text.secondary">Subject:</Typography>
                                        <Typography variant="body2">{subject || '-'}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="caption" color="text.secondary">Email Template:</Typography>
                                        <Typography variant="body2">{template_name || '-'}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="caption" color="text.secondary">Status:</Typography>
                                        <Typography variant="body2">{status || '-'}</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdPerson size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Target Settings</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                                    {target_type}
                                </Typography>
                                {schedule_date && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                                        Schedule: {schedule_date}
                                    </Typography>
                                )}
                                {filters && filters.length > 0 && (
                                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                                        {filters.map((filter: any, index: number) => (
                                            <Stack key={index} direction="row" spacing={1.5}>
                                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>{filter.field_name}</Typography>
                                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>{filter.operator}  {filter.value}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Stack>

                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdStats size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Campaign Stats</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">Total Recipients</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{total_recipients}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">Sent</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{sent_count}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">Opened</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{open_count}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">Clicked</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{click_count}</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary">Failed</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{failed_count}</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                            <IoMdList size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase',  color: 'text.secondary' }}>List of Mail Sends</Typography>
                        </Stack>
                        <Card sx={{ p: 0, mt: 2, borderRadius: 1.5, border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Scrollbar>
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table size="medium">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Recipient Name</TableCell>
                                                <TableCell>Recipient Email</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Sent On</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {emailQueue.length > 0 ? (
                                                emailQueue.map((item) => (
                                                    <TableRow key={item.name} hover>
                                                        <TableCell>{item.recipient_name}</TableCell>
                                                        <TableCell>{item.recipient_email}</TableCell>
                                                        <TableCell>
                                                            <Label
                                                                sx={{
                                                                    textTransform: 'uppercase',
                                                                    fontWeight: 600,
                                                                    fontSize: 10,
                                                                    ...(item.status === 'Sent' && { color: 'success.main', bgcolor: 'success.lighter' }),
                                                                    ...(item.status === 'Failed' && { color: 'error.main', bgcolor: 'error.lighter' }),
                                                                    ...(item.status === 'Pending' && { color: 'warning.main', bgcolor: 'warning.lighter' }),
                                                                }}
                                                            >
                                                                {item.status}
                                                            </Label>
                                                        </TableCell>
                                                        <TableCell>{item.sent_on || '-'}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body2" color="text.secondary">No mail sends found</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Scrollbar>
                        </Card>
                    </Stack>
                </Stack>
            </Card>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => !deleting && setConfirmDeleteOpen(false)}
                title="Confirm Delete"
                content="Are you sure you want to delete this Email Campaign?"
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleting}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                }
            />
        </DashboardContent>
    );
}