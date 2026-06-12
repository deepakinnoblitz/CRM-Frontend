import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    IoMdArrowBack, IoMdSettings, IoMdMail, IoMdCalendar, IoMdStats
} from "react-icons/io";

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { getEmailTemplate } from 'src/api/email-template';
import { getEmailAutomation } from 'src/api/email-automation';

export function EmailAutomationsDetailsView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [automation, setAutomation] = useState<any>(null);
    const [templateName, setTemplateName] = useState<string>('');
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (id) {
            getEmailAutomation(id)
                .then((data) => {
                    setAutomation(data);
                    if (data.email_template) {
                        getEmailTemplate(data.email_template)
                            .then((templateData) => setTemplateName(templateData.template_name || templateData.name))
                            .catch(() => setTemplateName(data.email_template));
                    }
                })
                .catch((err) => console.error('Failed to fetch automation details:', err))
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

    if (!automation) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Automation not found</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        automation_name,
        description,
        is_active,
        status,
        email_template,
        subject_override,
        target_type,
        frequency,
        run_time,
        start_date,
        end_date,
        week_day,
        day_of_month,
        last_run_on,
        next_run_on,
        last_campaign,
        total_runs,
        total_failed,
        total_recipients,
        open_count,
        total_emails_sent,
        click_count,
    } = automation;

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Typography variant="h4">Automation: {automation_name || id}</Typography>
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
                </Stack>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Box
                    sx={{
                        display: 'grid',
                        columnGap: 4,
                        rowGap: 4,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                    }}
                >
                    {/* Basic Information */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdSettings size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Basic Information</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Automation Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{automation_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Description</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{description || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Is Active</Typography>
                                    <Chip label={is_active ? 'Yes' : 'No'} size="small" color={is_active ? 'success' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Status</Typography>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontWeight: 700,
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            borderRadius: '6px',
                                            padding: '4px 12px',
                                            ...(is_active
                                                ? {
                                                      bgcolor: 'rgba(34, 197, 94, 0.25)',
                                                      border: '1px solid rgba(34, 197, 94, 0.45)',
                                                      color: '#15803d',
                                                  }
                                                : {
                                                      bgcolor: 'rgba(156, 163, 175, 0.25)',
                                                      border: '1px solid rgba(156, 163, 175, 0.45)',
                                                      color: '#374151',
                                                  }),
                                        }}
                                    >
                                        {status || (is_active ? 'Active' : 'Inactive')}
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Email Configuration */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdMail size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Configuration</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Email Template</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{templateName || email_template || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Subject Override</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{subject_override || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Target Type</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{target_type || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Schedule Configuration */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdCalendar size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Schedule Configuration</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Frequency</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{frequency || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Run Time</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{run_time || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Start Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{start_date || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">End Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{end_date || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Week Day</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{week_day || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Day of Month</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{day_of_month || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Statistics */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdStats size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Statistics</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.info.main, 0.04), border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Last Run</Typography>
                                    <Typography variant="subtitle2" color="info.main">{last_run_on || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Next Run</Typography>
                                    <Typography variant="subtitle2" color="info.main">{next_run_on || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Last Campaign</Typography>
                                    <Typography variant="subtitle2">{last_campaign || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Total Runs</Typography>
                                    <Typography variant="h6">{total_runs || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Total Recipients</Typography>
                                    <Typography variant="subtitle2">{total_recipients || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Total Emails Sent</Typography>
                                    <Typography variant="h6" color="success.main">{total_emails_sent || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Total Failed</Typography>
                                    <Typography variant="subtitle2" color="error.main">{total_failed || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Open Count</Typography>
                                    <Typography variant="subtitle2">{open_count || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary">Click Count</Typography>
                                    <Typography variant="subtitle2">{click_count || 0}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                </Box>
            </Card>
        </DashboardContent>
    );
}