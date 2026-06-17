import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    IoMdArrowBack, IoMdSettings, IoMdMail, IoMdStats, IoMdDocument, IoMdLink, IoMdCode, IoMdCreate
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

import { Iconify } from 'src/components/iconify';

export function EmailTemplateDetailsView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<any>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (id) {
            getEmailTemplate(id)
                .then(setTemplate)
                .catch((err) => console.error('Failed to fetch template details:', err))
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

    if (!template) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Template not found</Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        template_name,
        category,
        description,
        is_active,
        is_default,
        subject,
        sender_name,
        reply_to_email,
        email_content,
        footer_content,
        enable_open_tracking,
        enable_click_tracking,
        enable_unsubscribe,
        attachments = [],
        available_variables,
    } = template;

    let parsedAttachments: any[] = [];
    if (typeof attachments === 'string') {
        try {
            parsedAttachments = JSON.parse(attachments);
        } catch {
            parsedAttachments = [attachments];
        }
    } else if (Array.isArray(attachments)) {
        parsedAttachments = attachments;
    }

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Typography variant="h4">Template: {template_name || id}</Typography>
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
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/email-templates/${encodeURIComponent(id || '')}/edit`)}
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
                                    <Typography variant="caption" color="text.disabled">Template Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{template_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Category</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{category || '-'}</Typography>
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
                                    <Typography variant="caption" color="text.disabled">Is Default</Typography>
                                    <Chip label={is_default ? 'Yes' : 'No'} size="small" color={is_default ? 'info' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Email Settings */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdMail size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Settings</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Subject</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{subject || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Sender Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{sender_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Reply To Email</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{reply_to_email || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Tracking */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdStats size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Tracking</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Open Tracking</Typography>
                                    <Chip label={enable_open_tracking ? 'Enabled' : 'Disabled'} size="small" color={enable_open_tracking ? 'primary' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Click Tracking</Typography>
                                    <Chip label={enable_click_tracking ? 'Enabled' : 'Disabled'} size="small" color={enable_click_tracking ? 'primary' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Unsubscribe Link</Typography>
                                    <Chip label={enable_unsubscribe ? 'Enabled' : 'Disabled'} size="small" color={enable_unsubscribe ? 'primary' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Attachments */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdLink size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Attachments</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`, minHeight: 125 }}>
                            {parsedAttachments.length === 0 ? (
                                <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.disabled' }}>
                                    <Iconify icon={"solar:file-bold" as any} width={32} height={32} sx={{ mb: 1, opacity: 0.48 }} />
                                    <Typography variant="body2">No attachments found</Typography>
                                </Stack>
                            ) : (
                                <Stack spacing={1}>
                                    {parsedAttachments.map((file: any, index: number) => (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            alignItems="center"
                                            sx={{
                                                px: 1.5,
                                                py: 0.75,
                                                borderRadius: 1.5,
                                                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                                            }}
                                        >
                                            <Iconify icon={"solar:link-bold" as any} width={20} sx={{ mr: 1, color: 'text.secondary', flexShrink: 0 }} />
                                            <Typography variant="body2" noWrap sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}>
                                                {typeof file === 'string' ? file.split('/').pop() : (file.name || file.url?.split('/').pop() || 'Attachment')}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>

                    {/* Email Content */}
                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <IoMdDocument size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Content</Typography>
                            </Stack>
                            <Box sx={{ p: 3, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Stack spacing={3}>
                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>Email Content</Typography>
                                        <Box 
                                            sx={{ 
                                                p: 2, 
                                                bgcolor: 'background.paper', 
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                                minHeight: 150
                                            }}
                                            dangerouslySetInnerHTML={{ __html: email_content || '<p style="color: gray; margin: 0;">No content</p>' }}
                                        />
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>Footer Content</Typography>
                                        <Box 
                                            sx={{ 
                                                p: 2, 
                                                bgcolor: 'background.paper', 
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                                minHeight: 80
                                            }}
                                            dangerouslySetInnerHTML={{ __html: footer_content || '<p style="color: gray; margin: 0;">No footer content</p>' }}
                                        />
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Available Variables */}
                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <IoMdCode size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Available Variables</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'text.secondary' }}>
                                    {available_variables || '-'}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                </Box>
            </Card>
        </DashboardContent>
    );
}