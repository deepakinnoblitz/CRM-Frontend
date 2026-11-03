import type {
    AvailableWhatsAppTemplate,
    LeadWhatsAppTemplatePreview,
} from 'src/api/whatsapp';

import { enqueueSnackbar } from 'notistack';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import { getWhatsAppTemplate } from 'src/api/whatsapp-template';
import {
    uploadWhatsappAttachment,
    getLeadWhatsAppTemplatePreview,
    fetchAvailableWhatsAppTemplates,
} from 'src/api/whatsapp';

import { Iconify } from 'src/components/iconify';

type Props = {
    open: boolean;
    onClose: () => void;
    lead: any;
};

const getFileIcon = (fileName: string) => {
    const ext = (fileName || '').split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'ph:file-pdf-fill';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'ph:image-fill';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'ph:file-doc-fill';
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'ph:file-xls-fill';
    return 'ph:file-fill';
};

/**
 * Dynamically resolves HTML entities and variables like {{lead_name}} using the Lead's actual data.
 */
export const renderTemplateText = (text: string, lead: any): string => {
    if (!text) return '';

    // 1. Decode common HTML entities
    let result = text
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'");

    // 2. Convert html paragraph/break tags to newlines
    result = result.replace(/<br\s*\/?>/gi, '\n');
    result = result.replace(/<\/p>/gi, '\n');
    result = result.replace(/<\/div>/gi, '\n');
    result = result.replace(/<[^>]*>/g, ''); // strip any remaining tags

    // 3. Extract actual lead fields
    const leadName = lead?.lead_name || lead?.full_name || lead?.name || '';
    const phone = lead?.phone_number || '';
    const company = lead?.company_name || '';
    const email = lead?.email || '';
    const leadId = lead?.name || '';

    // 4. Replace variable placeholders case-insensitively
    result = result.replace(/\{\{\s*(?:doc\.)?lead_name\s*\}\}/gi, leadName);
    result = result.replace(/\{\{\s*(?:doc\.)?full_name\s*\}\}/gi, leadName);
    result = result.replace(/\{\{\s*(?:doc\.)?name\s*\}\}/gi, leadId);
    result = result.replace(/\{\{\s*(?:doc\.)?phone(?:_number)?\s*\}\}/gi, phone);
    result = result.replace(/\{\{\s*(?:doc\.)?company(?:_name)?\s*\}\}/gi, company);
    result = result.replace(/\{\{\s*(?:doc\.)?email\s*\}\}/gi, email);

    // 5. Replace any other lead fields if present
    if (lead && typeof lead === 'object') {
        Object.keys(lead).forEach((key) => {
            if (typeof lead[key] === 'string' || typeof lead[key] === 'number') {
                const reg = new RegExp(`\\{\\{\\s*(?:doc\\.)?${key}\\s*\\}\\}`, 'gi');
                result = result.replace(reg, String(lead[key]));
            }
        });
    }

    // Collapse multiple consecutive newlines
    result = result.replace(/\n{3,}/g, '\n\n');

    return result.trim();
};

export function SendWhatsappTemplateDialog({
    open,
    onClose,
    lead,
}: Props) {
    const theme = useTheme();

    const [templates, setTemplates] = useState<AvailableWhatsAppTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>('');

    const [fullTemplateDoc, setFullTemplateDoc] = useState<any>(null);
    const [preview, setPreview] = useState<LeadWhatsAppTemplatePreview | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const [customAttachment, setCustomAttachment] = useState<{ url: string; name: string } | null>(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [error, setError] = useState<string>('');

    const leadPhone = lead?.phone_number || '';
    const leadName = lead?.lead_name || lead?.full_name || lead?.name || 'Lead';

    // Fetch template list when dialog opens
    useEffect(() => {
        let isMounted = true;

        if (!open) {
            setSelectedTemplateName('');
            setPreview(null);
            setFullTemplateDoc(null);
            setCustomAttachment(null);
            setError('');
        } else {
            setLoadingTemplates(true);

            fetchAvailableWhatsAppTemplates()
                .then((data) => {
                    if (isMounted) {
                        setTemplates(data || []);
                        if (data && data.length > 0) {
                            const firstActive = data.find((t) => t.status?.toLowerCase() === 'active') || data[0];
                            setSelectedTemplateName(firstActive.name);
                        }
                    }
                })
                .catch((err) => {
                    if (isMounted) {
                        console.error('Failed to fetch templates:', err);
                        setError('Failed to load WhatsApp templates.');
                    }
                })
                .finally(() => {
                    if (isMounted) setLoadingTemplates(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [open]);

    // Fetch template doc and preview when selected template changes
    useEffect(() => {
        let isMounted = true;

        if (!open || !selectedTemplateName) {
            setPreview(null);
            setFullTemplateDoc(null);
        } else {
            setLoadingPreview(true);
            setError('');

            // 1. Fetch full template to ensure all child table default_attachments and properties are loaded
            getWhatsAppTemplate(selectedTemplateName)
                .then((tplDoc) => {
                    if (isMounted) {
                        setFullTemplateDoc(tplDoc);
                    }
                })
                .catch((tplErr) => {
                    console.warn('Failed to load full template doc:', tplErr);
                });

            // 2. Fetch backend preview (with server-side variables rendered)
            if (lead?.name) {
                getLeadWhatsAppTemplatePreview(lead.name, selectedTemplateName)
                    .then((previewData) => {
                        if (isMounted) {
                            setPreview(previewData);
                        }
                    })
                    .catch((err) => {
                        if (isMounted) {
                            console.warn('Backend preview failed, falling back to local render:', err);
                            const matched = templates.find((t) => t.name === selectedTemplateName);
                            if (matched) {
                                setPreview({
                                    header: renderTemplateText(matched.header_text || '', lead),
                                    body: renderTemplateText(matched.message_body || '', lead),
                                    footer: renderTemplateText(matched.footer_text || '', lead),
                                    rendered_message: [matched.header_text, matched.message_body, matched.footer_text]
                                        .filter(Boolean)
                                        .map((t) => renderTemplateText(t || '', lead))
                                        .join('\n\n'),
                                    attachments: [],
                                    allow_attachment: Boolean(matched.allow_attachment),
                                    phone_number: leadPhone,
                                    lead_name: leadName,
                                });
                            }
                        }
                    })
                    .finally(() => {
                        if (isMounted) setLoadingPreview(false);
                    });
            } else {
                setLoadingPreview(false);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [open, selectedTemplateName, lead, leadPhone, leadName, templates]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAttachment(true);
        try {
            const fileUrl = await uploadWhatsappAttachment(file);
            if (fileUrl) {
                setCustomAttachment({ url: fileUrl, name: file.name });
            }
        } catch (uploadErr: any) {
            console.error('Failed to upload file:', uploadErr);
            enqueueSnackbar(uploadErr?.message || 'Failed to upload attachment', { variant: 'error' });
        } finally {
            setUploadingAttachment(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const selectedTemplate = templates.find((t) => t.name === selectedTemplateName);

    // Compute combined attachments from fullTemplateDoc and preview
    const combinedAttachments = useMemo(() => {
        const list: { file: string; file_name: string; description?: string; file_size?: string }[] = [];
        const seenUrls = new Set<string>();

        // From full template doc (child table default_attachment)
        if (fullTemplateDoc?.default_attachment && Array.isArray(fullTemplateDoc.default_attachment)) {
            fullTemplateDoc.default_attachment.forEach((att: any) => {
                if (att?.file && !seenUrls.has(att.file)) {
                    seenUrls.add(att.file);
                    list.push({
                        file: att.file,
                        file_name: att.file.split('/').pop() || 'Attachment',
                        description: att.description || '',
                        file_size: att.file_size || '',
                    });
                }
            });
        }

        // From backend preview attachments
        if (preview?.attachments && Array.isArray(preview.attachments)) {
            preview.attachments.forEach((att: any) => {
                const fileUrl = typeof att === 'string' ? att : att?.file;
                if (fileUrl && !seenUrls.has(fileUrl)) {
                    seenUrls.add(fileUrl);
                    list.push({
                        file: fileUrl,
                        file_name: (typeof att === 'object' && att?.file_name) || fileUrl.split('/').pop() || 'Attachment',
                        description: typeof att === 'object' ? att?.description || '' : '',
                        file_size: typeof att === 'object' ? att?.file_size || '' : '',
                    });
                }
            });
        }

        return list;
    }, [fullTemplateDoc, preview]);

    const hasAttachmentsAllowed = Boolean(
        preview?.allow_attachment ||
        selectedTemplate?.allow_attachment ||
        fullTemplateDoc?.allow_attachment ||
        combinedAttachments.length > 0
    );

    // Rendered message content with variable replacement guarantee
    const displayedBody = useMemo(() => {
        const raw = preview?.body || fullTemplateDoc?.message_body || selectedTemplate?.message_body || '';
        return renderTemplateText(raw, lead);
    }, [preview?.body, fullTemplateDoc?.message_body, selectedTemplate?.message_body, lead]);

    const displayedHeader = useMemo(() => {
        const raw = preview?.header || fullTemplateDoc?.header_text || selectedTemplate?.header_text || '';
        return renderTemplateText(raw, lead);
    }, [preview?.header, fullTemplateDoc?.header_text, selectedTemplate?.header_text, lead]);

    const displayedFooter = useMemo(() => {
        const raw = preview?.footer || fullTemplateDoc?.footer_text || selectedTemplate?.footer_text || '';
        return renderTemplateText(raw, lead);
    }, [preview?.footer, fullTemplateDoc?.footer_text, selectedTemplate?.footer_text, lead]);

    const fullRenderedMessage = useMemo(() => [displayedHeader, displayedBody, displayedFooter].filter(Boolean).join('\n\n'), [displayedHeader, displayedBody, displayedFooter]);

    // Handle "Send" action -> redirect to the original WhatsApp interface (WhatsApp Web)
    const handleProceedToChat = () => {
        if (!selectedTemplateName) {
            setError('Please select a WhatsApp template.');
            return;
        }

        const rawPhone = lead?.phone_number || lead?.mobile_no || lead?.phone || lead?.custom_phone_number || leadPhone || '';
        let cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');

        if (!cleanPhone) {
            setError('Lead phone number is missing.');
            enqueueSnackbar('Lead does not have a valid phone number.', { variant: 'error' });
            return;
        }

        if (cleanPhone.length === 10) {
            cleanPhone = `91${cleanPhone}`;
        } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
            cleanPhone = `91${cleanPhone.slice(1)}`;
        }

        const textToSend = fullRenderedMessage;

        const attachmentUrls = customAttachment
            ? [customAttachment.url]
            : combinedAttachments.map((a) => a.file).filter(Boolean);

        // Download attachment files so they can be sent directly as files in WhatsApp
        if (attachmentUrls.length > 0) {
            attachmentUrls.forEach((fileUrl) => {
                const fullUrl = fileUrl.startsWith('http')
                    ? fileUrl
                    : `${window.location.origin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
                const fileName = fileUrl.split('/').pop() || 'attachment';

                const link = document.createElement('a');
                link.href = fullUrl;
                link.download = fileName;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            enqueueSnackbar('Attachment downloaded. Drag & drop or attach the file in WhatsApp to send as a file.', {
                variant: 'info',
                autoHideDuration: 6000,
            });
        }

        const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const whatsappUrl = isMobile
            ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textToSend)}`
            : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textToSend)}`;

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2.5,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            bgcolor: '#25D366',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.25)',
                            flexShrink: 0,
                        }}
                    >
                        <Iconify icon={"ic:baseline-whatsapp" as any} width={24} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            Send WhatsApp Template
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            To: {leadName} {leadPhone ? `(${leadPhone})` : ''}
                        </Typography>
                    </Box>
                </Stack>

                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ color: 'text.secondary' }}
                >
                    <Iconify icon={"eva:close-fill" as any} width={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    px: 3,
                    pt: '24px !important',
                    pb: 2.5,
                    overflowY: 'auto',
                }}
            >
                {!leadPhone && (
                    <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 1.5 }}>
                        This Lead has no phone number configured. A valid phone number is required to send WhatsApp messages.
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
                        {error}
                    </Alert>
                )}

                {/* Template Selection */}
                <FormControl fullWidth sx={{ mt: 1, mb: 2.5 }}>
                    <InputLabel id="whatsapp-template-select-label">Select WhatsApp Template</InputLabel>
                    <Select
                        labelId="whatsapp-template-select-label"
                        value={selectedTemplateName}
                        label="Select WhatsApp Template"
                        disabled={loadingTemplates}
                        onChange={(e) => {
                            setSelectedTemplateName(e.target.value);
                            setCustomAttachment(null);
                        }}
                        renderValue={(selected) => {
                            const tpl = templates.find((t) => t.name === selected);
                            if (!tpl) return '';
                            return (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {tpl.template_name || tpl.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {tpl.category && (
                                            <Chip
                                                label={tpl.category}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.72rem', height: 22 }}
                                            />
                                        )}
                                        {tpl.status && (
                                            <Chip
                                                label={tpl.status}
                                                size="small"
                                                color={tpl.status.toLowerCase() === 'active' ? 'success' : 'default'}
                                                sx={{ fontSize: '0.72rem', height: 22, fontWeight: 700 }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            );
                        }}
                        sx={{
                            borderRadius: 1.5,
                            '& .MuiSelect-select': {
                                py: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                            },
                        }}
                    >
                        {loadingTemplates ? (
                            <MenuItem disabled>
                                <CircularProgress size={16} sx={{ mr: 1 }} /> Loading templates...
                            </MenuItem>
                        ) : templates.length === 0 ? (
                            <MenuItem disabled>No WhatsApp templates available</MenuItem>
                        ) : (
                            templates.map((tpl) => (
                                <MenuItem key={tpl.name} value={tpl.name} sx={{ py: 1.25 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {tpl.template_name || tpl.name}
                                        </Typography>
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            {tpl.category && (
                                                <Chip
                                                    label={tpl.category}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                                />
                                            )}
                                            {tpl.status && (
                                                <Chip
                                                    label={tpl.status}
                                                    size="small"
                                                    color={tpl.status.toLowerCase() === 'active' ? 'success' : 'default'}
                                                    sx={{ fontSize: '0.7rem', height: 20, fontWeight: 700 }}
                                                />
                                            )}
                                        </Stack>
                                    </Stack>
                                </MenuItem>
                            ))
                        )}
                    </Select>
                    <FormHelperText sx={{ mt: 0.75 }}>
                        Select a template to preview personalized content for this lead.
                    </FormHelperText>
                </FormControl>

                {/* Template Message Preview */}
                <Box sx={{ mb: 2.5 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                            letterSpacing: 0.5,
                            display: 'block',
                            mb: 1,
                        }}
                    >
                        Message Preview
                    </Typography>

                    <Card
                        variant="outlined"
                        sx={{
                            p: 2.5,
                            borderRadius: '16px 16px 16px 4px',
                            position: 'relative',
                            bgcolor: theme.palette.mode === 'light' ? '#EBFCEB' : alpha('#25D366', 0.08),
                            borderColor: theme.palette.mode === 'light' ? '#C3F2C7' : alpha('#25D366', 0.25),
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            minHeight: 110,
                        }}
                    >
                        {loadingPreview && !preview && !fullTemplateDoc ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={26} sx={{ color: '#25D366', mb: 1.5 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Rendering template with Lead variables...
                                </Typography>
                            </Box>
                        ) : !selectedTemplateName ? (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Please select a template to view preview.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {/* Header */}
                                {displayedHeader && (
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                                        {displayedHeader}
                                    </Typography>
                                )}

                                {/* Body */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.6,
                                        color: 'text.primary',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {displayedBody || 'No message content'}
                                </Typography>

                                {/* Footer */}
                                {displayedFooter && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                        {displayedFooter}
                                    </Typography>
                                )}

                                {/* WhatsApp status stamp */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, pt: 0.5 }}>
                                    <Iconify icon={"ic:baseline-whatsapp" as any} width={13} sx={{ color: '#25D366' }} />
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem', fontWeight: 600 }}>
                                        Preview • WhatsApp format
                                    </Typography>
                                </Box>
                            </Stack>
                        )}
                    </Card>
                </Box>

                {/* Attachments Section */}
                {hasAttachmentsAllowed && (
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: 'text.secondary',
                                letterSpacing: 0.5,
                                display: 'block',
                                mb: 1,
                            }}
                        >
                            Attachments
                        </Typography>

                        {/* List Template Default Attachments */}
                        {combinedAttachments.length > 0 && (
                            <Stack spacing={1} sx={{ mb: 1.5 }}>
                                {combinedAttachments.map((att, idx) => (
                                    <Box
                                        key={att.file || idx}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 1.25,
                                            borderRadius: 1.5,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: 'background.paper',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden' }}>
                                            <Iconify icon={getFileIcon(att.file_name) as any} width={24} sx={{ color: 'primary.main', flexShrink: 0 }} />
                                            <Box sx={{ overflow: 'hidden' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {att.file_name}
                                                </Typography>
                                                {(att.file_size || att.description) && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
                                                        {[att.file_size, att.description].filter(Boolean).join(' • ')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => window.open(att.file, '_blank')}
                                            sx={{ textTransform: 'none', py: 0.2, flexShrink: 0 }}
                                        >
                                            Preview
                                        </Button>
                                    </Box>
                                ))}
                            </Stack>
                        )}

                        {/* Custom Attachment Uploaded by User */}
                        {customAttachment && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    border: `1px solid ${theme.palette.primary.main}`,
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                    mb: 1.5,
                                }}
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Iconify icon={getFileIcon(customAttachment.name) as any} width={22} sx={{ color: 'primary.main' }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                        {customAttachment.name} (Custom)
                                    </Typography>
                                </Stack>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setCustomAttachment(null)}
                                >
                                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                </IconButton>
                            </Box>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />

                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={uploadingAttachment ? <CircularProgress size={14} /> : <Iconify icon={"solar:paperclip-bold" as any} />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAttachment}
                            sx={{ borderRadius: 1.5, textTransform: 'none' }}
                        >
                            {uploadingAttachment ? 'Uploading...' : customAttachment ? 'Replace Custom Attachment' : 'Add Custom Attachment'}
                        </Button>
                    </Box>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.text.primary, 0.01),
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleProceedToChat}
                    disabled={!selectedTemplateName}
                    startIcon={<Iconify icon={"ic:baseline-whatsapp" as any} width={20} />}
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#25D366',
                        color: '#fff',
                        px: 3,
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                        '&:hover': {
                            bgcolor: '#22c55e',
                        },
                    }}
                >
                    Send Template
                </Button>
            </DialogActions>
        </Dialog>
    );
}
