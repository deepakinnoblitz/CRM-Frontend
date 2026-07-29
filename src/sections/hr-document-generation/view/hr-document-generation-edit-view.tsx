import { useState, useEffect } from 'react';
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
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    fetchHRDocumentTemplates,
    getHRDocumentTemplate,
    HRDocumentTemplate,
} from 'src/api/hr-document-template';
import {
    getHRDocumentGeneration,
    updateHRDocumentGeneration,
    fetchEmployeesList,
    EmployeeOption,
    HRDocumentGeneration,
} from 'src/api/hr-document-generation';

import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor/rich-text-editor';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Draft', 'Generated', 'Printed', 'Cancelled'];

type Props = {
    id: string;
};

export function HRDocumentGenerationEditView({ id }: Props) {
    const router = useRouter();

    const [loadingDoc, setLoadingDoc] = useState(true);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [templates, setTemplates] = useState<HRDocumentTemplate[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<HRDocumentTemplate | null>(null);
    const [documentType, setDocumentType] = useState('');
    const [status, setStatus] = useState('Draft');
    const [subject, setSubject] = useState('');
    const [templateContent, setTemplateContent] = useState('');
    const [renderedSubject, setRenderedSubject] = useState('');
    const [renderedContent, setRenderedContent] = useState('');

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ employee?: boolean; documentTemplate?: boolean }>({});
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        async function loadData() {
            setLoadingDoc(true);
            try {
                const [empList, tplRes, doc] = await Promise.all([
                    fetchEmployeesList(),
                    fetchHRDocumentTemplates({ page: 1, page_size: 200 }),
                    getHRDocumentGeneration(id),
                ]);

                setEmployees(empList);
                setTemplates(tplRes.data);

                if (doc) {
                    const matchedEmp = empList.find((e) => e.name === doc.employee) || {
                        name: doc.employee,
                        employee_name: doc.employee_name || doc.employee,
                    };
                    setSelectedEmployee(matchedEmp);

                    const matchedTpl = tplRes.data.find((t: HRDocumentTemplate) => t.name === doc.document_template) || ({
                        name: doc.document_template,
                        template_name: doc.document_template,
                    } as HRDocumentTemplate);
                    setSelectedTemplate(matchedTpl);

                    setDocumentType(doc.document_type || matchedTpl.document_type || '');
                    setStatus(doc.status || 'Draft');
                    setSubject(doc.subject || '');
                    setTemplateContent(doc.template_content || '');
                    setRenderedSubject(doc.rendered_subject || '');
                    setRenderedContent(doc.rendered_content || '');
                }
            } catch (err) {
                console.error('Failed to load document details:', err);
                setSnackbar({ open: true, message: 'Failed to load document details', severity: 'error' });
            } finally {
                setLoadingDoc(false);
            }
        }
        loadData();
    }, [id]);

    const handleTemplateChange = async (template: HRDocumentTemplate | null) => {
        setSelectedTemplate(template);
        if (template) {
            setDocumentType(template.document_type || '');
            if (template.name) {
                try {
                    const details = await getHRDocumentTemplate(template.name);
                    if (details.subject && !subject) setSubject(details.subject);
                    if (details.template_content && !templateContent) {
                        setTemplateContent(details.template_content);
                    }
                } catch (err) {
                    console.error('Failed to fetch template details:', err);
                }
            }
        } else {
            setDocumentType('');
        }
        if (errors.documentTemplate) {
            setErrors((prev) => ({ ...prev, documentTemplate: false }));
        }
    };

    const handleUpdate = async () => {
        const newErrors: { employee?: boolean; documentTemplate?: boolean } = {};
        if (!selectedEmployee) newErrors.employee = true;
        if (!selectedTemplate) newErrors.documentTemplate = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSnackbar({ open: true, message: 'Please fill in required fields', severity: 'error' });
            return;
        }

        try {
            setSaving(true);

            await updateHRDocumentGeneration(id, {
                employee: selectedEmployee!.name,
                document_template: selectedTemplate!.name,
                status,
                subject: subject.trim(),
                template_content: templateContent,
            });

            sessionStorage.setItem('hr_document_generation_success_message', 'Document updated successfully');
            setTimeout(() => {
                router.push('/hr-document-generation');
            }, 500);
        } catch (err: any) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to update document',
                severity: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loadingDoc) {
        return (
            <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
                    <CircularProgress sx={{ color: '#08a3cd' }} />
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Edit Document Generation
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/hr-document-generation')}
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
                    <LoadingButton
                        variant="contained"
                        loading={saving}
                        onClick={handleUpdate}
                        sx={{
                            borderRadius: 1.5,
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' },
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        Update
                    </LoadingButton>
                </Stack>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                    Document Generation Details
                </Typography>

                <Stack spacing={3}>
                    <Autocomplete
                        fullWidth
                        options={employees}
                        getOptionLabel={(option) => (option.employee_name ? `${option.employee_name} (${option.name})` : option.name || '')}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        value={selectedEmployee}
                        onChange={(_, newValue) => {
                            setSelectedEmployee(newValue);
                            if (newValue && errors.employee) {
                                setErrors((prev) => ({ ...prev, employee: false }));
                            }
                        }}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props as any;
                            return (
                                <li key={key || option.name} {...optionProps}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {option.employee_name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            ID: {option.name}
                                        </Typography>
                                    </Stack>
                                </li>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Employee"
                                required
                                error={errors.employee}
                                helperText={errors.employee ? 'Employee is required' : ''}
                                placeholder="Search Employee by ID or Name..."
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        options={templates}
                        getOptionLabel={(option) => option.template_name || option.name}
                        value={selectedTemplate}
                        onChange={(_, newValue) => handleTemplateChange(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Document Template"
                                required
                                error={errors.documentTemplate}
                                helperText={errors.documentTemplate ? 'Document Template is required' : ''}
                                placeholder="Select Document Template..."
                            />
                        )}
                    />

                    <TextField
                        fullWidth
                        label="Document Type"
                        value={documentType}
                        disabled
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Subject Override"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        placeholder="Subject line override (optional)..."
                    />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 3,
                            alignItems: 'start',
                        }}
                    >
                        <Box>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ mb: 1 }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Content Override
                                </Typography>
                            </Stack>

                            <RichTextEditor
                                value={templateContent}
                                onChange={(val: string) => setTemplateContent(val)}
                                placeholder="Enter document content override..."
                            />
                        </Box>

                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>
                                Rendered Output
                            </Typography>

                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Rendered Subject"
                                    value={renderedSubject}
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="No rendered subject available"
                                />

                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
                                        Rendered Content
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                                            border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.2)}`,
                                            minHeight: 250,
                                            maxHeight: 500,
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {renderedContent ? (
                                            <Box
                                                dangerouslySetInnerHTML={{ __html: renderedContent }}
                                                sx={{
                                                    typography: 'body2',
                                                    '& p': { my: 0.5 },
                                                    '& h1, & h2, & h3, & h4': { my: 1 },
                                                }}
                                            />
                                        ) : (
                                            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                                No rendered content available.
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    </Box>
                </Stack>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}
