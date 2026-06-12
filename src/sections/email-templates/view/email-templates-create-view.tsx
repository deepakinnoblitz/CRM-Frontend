import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { alpha } from '@mui/material/styles';
import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor/rich-text-editor';

import { IoMdArrowBack } from 'react-icons/io';

export function EmailTemplateCreateView() {
    const router = useRouter();
    const [emailContent, setEmailContent] = useState('');
    const [footerContent, setFooterContent] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const [templateName, setTemplateName] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [errors, setErrors] = useState<{ templateName?: boolean; category?: boolean; subject?: boolean; emailContent?: boolean }>({});

    const handleSave = () => {
        const newErrors: typeof errors = {};
        if (!templateName) newErrors.templateName = true;
        if (!category) newErrors.category = true;
        if (!subject) newErrors.subject = true;
        if (!emailContent || emailContent === '<p><br></p>') newErrors.emailContent = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // Add save logic here
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAttachments((prev) => [...prev, file]);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Create New Template
                    </Typography>
                </Stack>
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
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' },
                        }}
                    >
                        Save Template
                    </Button>
                </Stack>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Basic Information</Typography>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Template Name"
                                required
                                value={templateName}
                                onChange={(e) => {
                                    setTemplateName(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, templateName: false }));
                                }}
                                error={errors.templateName}
                                helperText={errors.templateName ? 'This field is required' : ''}
                            />
                            <TextField
                                fullWidth
                                label="Category"
                                required
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, category: false }));
                                }}
                                error={errors.category}
                                helperText={errors.category ? 'This field is required' : ''}
                            />
                            <TextField fullWidth multiline rows={3} label="Description" />
                            <Stack direction="row" spacing={2}>
                                <FormControlLabel control={<CustomSwitch defaultChecked />} label="Is Active" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                                <FormControlLabel control={<CustomSwitch />} label="Is Default" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                            </Stack>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Email Settings</Typography>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Subject"
                                required
                                value={subject}
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, subject: false }));
                                }}
                                error={errors.subject}
                                helperText={errors.subject ? 'This field is required' : ''}
                            />
                            <TextField fullWidth label="Sender Name" />
                            <TextField fullWidth label="Reply To Email" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Content</Typography>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: errors.emailContent ? 'error.main' : 'text.secondary', mb: 1 }}>
                                    Email Content <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                                </Typography>
                                <RichTextEditor
                                    value={emailContent}
                                    onChange={(val: string) => {
                                        setEmailContent(val);
                                        if (val && val !== '<p><br></p>') setErrors((prev) => ({ ...prev, emailContent: false }));
                                    }}
                                    placeholder="Enter email content..."
                                    error={errors.emailContent}
                                    helperText={errors.emailContent ? 'This field is required' : undefined}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                                    Footer Content
                                </Typography>
                                <RichTextEditor
                                    value={footerContent}
                                    onChange={(val: string) => setFooterContent(val)}
                                    placeholder="Enter footer content..."
                                />
                            </Box>
                        </Stack>
                    </Card>

                    <Box
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                            border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                            <Typography variant="h6">Attachments</Typography>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                                size="small"
                                startIcon={<Iconify icon={"solar:upload-bold" as any} />}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload File'}
                                <input type="file" hidden onChange={handleFileUpload} />
                            </Button>
                        </Stack>

                        <Stack spacing={1}>
                            {attachments.length === 0 ? (
                                <Stack alignItems="center" justifyContent="center" sx={{ py: 3, color: 'text.disabled' }}>
                                    <Iconify icon={"solar:file-bold" as any} width={40} height={40} sx={{ mb: 1, opacity: 0.48 }} />
                                    <Typography variant="body2">No attachments yet</Typography>
                                </Stack>
                            ) : (
                                attachments.map((file: any, index) => (
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
                                            {typeof file === 'string' ? file : (file.url || file.name)}
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="inherit"
                                            onClick={() => handleRemoveAttachment(index)}
                                            sx={{
                                                px: 1.5,
                                                py: 0,
                                                height: 26,
                                                borderRadius: 1.5,
                                                minWidth: 'auto',
                                                typography: 'caption',
                                                bgcolor: 'background.paper',
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.24)}`,
                                                '&:hover': {
                                                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                                                }
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Stack>
                                ))
                            )}
                        </Stack>
                    </Box>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Tracking</Typography>
                        <Stack spacing={2}>
                            <FormControlLabel control={<CustomSwitch />} label="Enable Open Tracking" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                            <FormControlLabel control={<CustomSwitch />} label="Enable Click Tracking" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                            <FormControlLabel control={<CustomSwitch />} label="Enable Unsubscribe Link" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Variables</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Available Variables: {"{{ contact_name }}"}, {"{{ company_name }}"}
                        </Typography>
                    </Card>
                </Box>
            </Box>
        </DashboardContent>
    );
}