import { enqueueSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { VscDebugStart } from "react-icons/vsc";
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdMail, IoMdCalendar, IoMdPerson, IoMdStats, IoMdCreate, IoMdTrash, IoMdList } from "react-icons/io";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getEmailCampaign, deleteEmailCampaign, startCampaign as startEmailCampaign } from 'src/api/email-campaign';

import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export function EmailCampaignsDetailsView() {
    const { id } = useParams();
    const router = useRouter();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState<any>(null);
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
        email_template,
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
                                {subject && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                                        Subject: {subject}
                                    </Typography>
                                )}
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

                    {filters && filters.length > 0 && (
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdList size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Target Filters</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Stack spacing={1}>
                                    {filters.map((filter: any, index: number) => (
                                        <Stack key={index} direction="row" spacing={2}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>{filter.field_name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{filter.operator}</Typography>
                                            <Typography variant="body2">{filter.value}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    )}
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