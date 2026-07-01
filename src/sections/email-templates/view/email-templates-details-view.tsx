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
                            <IoMdSettings size={18} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>Basic Information</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.18)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Template Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{template_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Category</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{category || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Description</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', textAlign: 'right', maxWidth: '60%' }}>{description || '-'}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Email Settings */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdMail size={18} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>Email Settings</Typography>
                        </Stack>
                        <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.18)}` }}>
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Sender Name</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{sender_name || '-'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Reply To Email</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{reply_to_email || '-'}</Typography>
                                </Stack>
                                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Is Active</Typography>
                                    <Chip label={is_active ? 'Yes' : 'No'} size="small" color={is_active ? 'success' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12}}>Is Default</Typography>
                                    <Chip label={is_default ? 'Yes' : 'No'} size="small" color={is_default ? 'info' : 'default'} sx={{ borderRadius: 1 }} />
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>


                    {/* Email Content */}
                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <IoMdDocument size={18} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>Content</Typography>
                            </Stack>
                            <Box sx={{ p: 3, borderRadius: 1.5, bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.03),border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.16)}` }}>
                                <Stack spacing={3}>
                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 13, fontWeight: 600 }}>Subject</Typography>
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                                minHeight: 100,
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {subject || '-'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 13, fontWeight: 600 }}>Email Content</Typography>
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
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 13, fontWeight: 600 }}>Footer Content</Typography>
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
                        {/* Attachments */}
                        <Stack spacing={1.5} sx={{ mt: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <IoMdLink size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Attachments</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.03),border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.16)}`, minHeight: 125 }}>
                                {parsedAttachments.length === 0 ? (
                                    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.secondary', mt: 2 }}>
                                        <Iconify icon={"solar:file-bold" as any} width={32} height={32} sx={{ mb: 1, opacity: 0.48 }} />
                                        <Typography variant="body2">No attachments found</Typography>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        {parsedAttachments.map((file: any, index: number) => {
                                            const url = typeof file === 'string' ? file : (file.file || file.url || '');
                                            const fileName = url ? decodeURIComponent(url.split('/').pop() || 'Attachment') : 'Attachment';

                                            return (
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
                                                        {fileName}
                                                    </Typography>
                                                    
                                                    {url && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                size="small"
                                                                variant="text"
                                                                onClick={() => window.open(url, '_blank')}
                                                                sx={{ textTransform: 'none', fontWeight: 600, color: 'info.main', py: 0 }}
                                                            >
                                                                View File
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="text"
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = url;
                                                                    link.download = fileName;
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                                sx={{ textTransform: 'none', fontWeight: 600, color: 'primary.main', py: 0 }}
                                                            >
                                                                Download
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Card>
        </DashboardContent>
    );
}