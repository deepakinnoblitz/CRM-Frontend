import { useState, useEffect } from 'react';
import { MdContentCopy } from "react-icons/md";
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { createEmailTemplate, fetchEmailTemplateVariables, EmailTemplateVariable } from 'src/api/email-template';

import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor/rich-text-editor';

import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';

export function EmailTemplateCreateView() {
    const router = useRouter();
    const [emailContent, setEmailContent] = useState('');
    const [footerContent, setFooterContent] = useState('');
    const [attachments, setAttachments] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const [templateName, setTemplateName] = useState('');
    const [category, setCategory] = useState('');
    const [templatefor, setTemplatefor] = useState('Lead');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [senderName, setSenderName] = useState('');
    const [replyToEmail, setReplyToEmail] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);
    const [errors, setErrors] = useState<{ templateName?: boolean; category?: boolean; templatefor?: boolean; subject?: boolean; emailContent?: boolean }>({});
    const [variables, setVariables] = useState<EmailTemplateVariable[]>([]);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleSave = async () => {
        const newErrors: typeof errors = {};
        const missingFields: string[] = [];

        if (!templateName.trim()) {
            newErrors.templateName = true;
            missingFields.push('Template Name');
        }

        if (!category) {
            newErrors.category = true;
            missingFields.push('Category');
        }

        if (!templatefor) {
            newErrors.templatefor = true;
            missingFields.push('Template For');
        }

        if (!subject.trim()) {
            newErrors.subject = true;
            missingFields.push('Subject');
        }

        if (!emailContent || emailContent === '<p><br></p>') {
            newErrors.emailContent = true;
            missingFields.push('Email Content');
        }

        setErrors(newErrors);

        if (missingFields.length) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: `Please fill in: ${missingFields.join(', ')}`,
            });
            return;
        }

        try {
            await createEmailTemplate({
                template_name: templateName,
                category,
                template_for: templatefor,
                subject,
                email_content: emailContent,
                footer_content: footerContent,
                description: '',
                sender_name: '',
                reply_to_email: '',
                is_active: 1,
                is_default: 0,
                attachments,
            });

            setSnackbar({
                open: true,
                severity: 'success',
                message: 'Email Template created successfully.',
            });

            setTimeout(() => {
                router.push('/email-templates');
            }, 500);

        } catch (error: any) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: error.message || 'Failed to create email template.',
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setAttachments((prev) => [...prev, file]);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const templateForOptions = [
        { label: 'Lead', value: 'Lead' },
        { label: 'Client', value: 'Contact' },
        { label: 'Company', value: 'Account' },
    ];

    const handleTemplateForChange = async (value: string) => {
        setTemplatefor(value);

        if (value) {
            setErrors((prev) => ({ ...prev, templatefor: false }));
        }

        try {
            const data = await fetchEmailTemplateVariables(
                value as 'Lead' | 'Contact' | 'Account'
            );

            setVariables(data);
        } catch (err) {
            console.error(err);
        }
    };

    const insertVariable = (variable: string) => {
        const value = `${emailContent} ${variable}`;
        setEmailContent(value);
    };

    useEffect(() => {
        const loadDefaultVariables = async () => {
            try {
                const data = await fetchEmailTemplateVariables("Lead");
                setVariables(data);
            } catch (err) {
                console.error("Failed to load Lead variables", err);
            }
        };

        loadDefaultVariables();
    }, []);

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

            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: '1fr',
                    md: 'minmax(0, 2.5fr) 350px',
                }}
                gap={3}
            >
                <Box>
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
                                select
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
                            >
                                {['Marketing', 'Newsletter', 'Promotion', 'Welcome', 'Follow Up', 'Proposal', 'Invoice', 'Reminder', 'Custom'].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Template For"
                                required
                                value={templatefor}
                                onChange={(e) => handleTemplateForChange(e.target.value)}
                                error={errors.templatefor}
                                helperText={errors.templatefor ? 'This field is required' : ''}
                            >
                                {templateForOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField fullWidth multiline rows={3} label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                            <Stack direction="row" spacing={2}>
                                <FormControlLabel control={<CustomSwitch defaultChecked onChange={(e) => setIsActive(e.target.checked)}/>} label="Is Active" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                                <FormControlLabel control={<CustomSwitch onChange={(e) => setIsDefault(e.target.checked)}/>} label="Is Default" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
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
                            <TextField fullWidth label="Sender Name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                            <TextField fullWidth label="Reply To Email" value={replyToEmail} onChange={(e) => setReplyToEmail(e.target.value)} />
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
                                    minHeight={600}
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
                                    minHeight={300}
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

                <Box
                    gridColumn={{ xs: 'span 1', md: 'span 1' }}
                    sx={{
                        position: 'sticky',
                        top: 90,
                        alignSelf: 'start',
                    }}
                >
                    <Card
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',

                            // Dynamic height based on screen size
                            maxHeight: 'calc(100vh - 120px)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                fontWeight: 600,
                            }}
                        >
                            Variables
                        </Typography>

                        <Stack
                            spacing={1}
                            sx={{
                                p: 2,
                                overflowY: 'auto',
                                flex: 1,

                                '&::-webkit-scrollbar': {
                                    width: 6,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: 'grey.400',
                                    borderRadius: 3,
                                },
                                '&::-webkit-scrollbar-thumb:hover': {
                                    bgcolor: 'grey.500',
                                },
                            }}
                        >
                        {variables.map((item) => {
                            // Display text (Lead Name, Company Name, etc.)
                            const label = item.fieldname
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');

                            return (
                                <Button
                                    key={item.fieldname}
                                    fullWidth
                                    variant="outlined"
                                    startIcon={
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 1.5,
                                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Iconify
                                                icon={"solar:code-bold" as any}
                                                width={18}
                                                sx={{ color: 'primary.main' }}
                                            />
                                        </Box>
                                    }
                                    endIcon={
                                        <MdContentCopy size={16} color='#08a3cd'/>
                                    }
                                    onClick={() => insertVariable(item.variable)}
                                    sx={{
                                        justifyContent: 'space-between',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1.3,
                                        minHeight: 58,
                                        transition: 'all .2s ease',

                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: (theme) =>
                                                alpha(theme.palette.primary.main, 0.08),
                                            transform: 'translateX(2px)',
                                            boxShadow: (theme) =>
                                                `0 6px 16px ${alpha(
                                                    theme.palette.primary.main,
                                                    0.15
                                                )}`,
                                        },

                                        '& .MuiButton-startIcon': {
                                            mr: 2,
                                        },

                                        '& .MuiButton-endIcon': {
                                            ml: 2,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flex: 1,
                                            textAlign: 'left',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <Box
                                                component="span"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                {label}
                                            </Box>

                                            <Box
                                                component="span"
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {item.variable}
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Button>
                            );
                        })}
                    </Stack>
                    </Card>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}