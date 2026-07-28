import { useState, useEffect, useCallback } from 'react';
import { IoMdArrowBack, IoMdSettings, IoMdMail, IoMdDocument, IoMdCreate } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getHRDocumentGeneration, HRDocumentGeneration } from 'src/api/hr-document-generation';

type Props = {
    id: string;
};

const getStatusStyle = (status?: string) => {
    switch (status) {
        case 'Generated':
            return {
                bgcolor: 'rgba(34, 197, 94, 0.25)',
                border: '1px solid rgba(34, 197, 94, 0.45)',
                color: '#15803d',
            };
        case 'Printed':
            return {
                bgcolor: 'rgba(59, 130, 246, 0.25)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                color: '#1d4ed8',
            };
        case 'Cancelled':
            return {
                bgcolor: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#b91c1c',
            };
        case 'Draft':
        default:
            return {
                bgcolor: 'rgba(156, 163, 175, 0.25)',
                border: '1px solid rgba(156, 163, 175, 0.45)',
                color: '#374151',
            };
    }
};

export function HRDocumentGenerationDetailsView({ id }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [doc, setDoc] = useState<HRDocumentGeneration | null>(null);

    const loadDetails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getHRDocumentGeneration(id);
            setDoc(res);
        } catch (err) {
            console.error('Failed to load HR document generation details:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadDetails();
        }
    }, [id, loadDetails]);

    if (loading) {
        return (
            <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 15 }}>
                    <CircularProgress sx={{ color: '#08a3cd' }} />
                </Box>
            </DashboardContent>
        );
    }

    if (!doc) {
        return (
            <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
                <Typography variant="h6">Document Generation record not found</Typography>
                <Button onClick={() => router.back()} sx={{ mt: 3 }}>
                    Go Back
                </Button>
            </DashboardContent>
        );
    }

    const titleText = doc.employee_name
        ? `${doc.employee_name} - ${doc.document_template}`
        : doc.name;

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Document: {titleText}
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.back()}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'text.primary',
                            },
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => router.push(`/hr-document-generation/${encodeURIComponent(doc.name)}/edit`)}
                        startIcon={<IoMdCreate size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#068fb3',
                            },
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
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                                Basic Information
                            </Typography>
                        </Stack>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.18)}`,
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Employee
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                        {doc.employee_name ? `${doc.employee_name} (${doc.employee})` : doc.employee}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Document Template
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                        {doc.document_template || '-'}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Status
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            fontWeight: 700,
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            borderRadius: '6px',
                                            padding: '4px 12px',
                                            ...getStatusStyle(doc.status),
                                        }}
                                    >
                                        {doc.status ? doc.status.toUpperCase() : 'DRAFT'}
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Generation Settings */}
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                            <IoMdMail size={18} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                                Generation Settings
                            </Typography>
                        </Stack>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.06),
                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.18)}`,
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Document Type
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                        {doc.document_type || '-'}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Generated On
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                        {doc.generated_on || doc.creation || '-'}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
                                        Generated By
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
                                        {doc.generated_by || doc.owner || '-'}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Content Section */}
                    <Box sx={{ gridColumn: { md: 'span 2' } }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <IoMdDocument size={18} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                                    Content
                                </Typography>
                            </Stack>
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 1.5,
                                    bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.03),
                                    border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.16)}`,
                                }}
                            >
                                <Stack spacing={3}>
                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 13, fontWeight: 600 }}>
                                            Subject Override
                                        </Typography>
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                                minHeight: 60,
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {doc.subject || '-'}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack spacing={1}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: 13, fontWeight: 600 }}>
                                            Content Override
                                        </Typography>
                                        <Box
                                            sx={{
                                                p: 2,
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                                minHeight: 200,
                                            }}
                                        >
                                            {doc.template_content ? (
                                                <Box
                                                    dangerouslySetInnerHTML={{ __html: doc.template_content }}
                                                    sx={{
                                                        '& p': { my: 0.5 },
                                                        '& h1, & h2, & h3': { my: 1 },
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                    No content override provided.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </Card>
        </DashboardContent>
    );
}
