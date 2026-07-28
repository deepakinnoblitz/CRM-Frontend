import { useState, useEffect } from 'react';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    createHRDocumentGeneration,
    fetchEmployeesList,
    EmployeeOption,
} from 'src/api/hr-document-generation';
import {
    fetchHRDocumentTemplates,
    getHRDocumentTemplate,
    HRDocumentTemplate,
} from 'src/api/hr-document-template';

import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor/rich-text-editor';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Draft', 'Generated', 'Printed', 'Cancelled'];

export function HRDocumentGenerationCreateView() {
    const router = useRouter();

    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [templates, setTemplates] = useState<HRDocumentTemplate[]>([]);

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<HRDocumentTemplate | null>(null);
    const [documentType, setDocumentType] = useState('');
    const [status, setStatus] = useState('Draft');
    const [subject, setSubject] = useState('');
    const [templateContent, setTemplateContent] = useState('');

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ employee?: boolean; documentTemplate?: boolean }>({});
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [empList, tplRes] = await Promise.all([
                    fetchEmployeesList(),
                    fetchHRDocumentTemplates({ page: 1, page_size: 200 }),
                ]);
                setEmployees(empList);
                setTemplates(tplRes.data);
            } catch (err) {
                console.error('Failed to load form dependencies:', err);
            }
        }
        loadInitialData();
    }, []);

    const handleTemplateChange = async (template: HRDocumentTemplate | null) => {
        setSelectedTemplate(template);
        if (template) {
            setDocumentType(template.document_type || '');
            if (template.name) {
                try {
                    const details = await getHRDocumentTemplate(template.name);
                    if (details.subject) setSubject(details.subject);
                    if (details.template_content) {
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

    const handleSave = async () => {
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

            await createHRDocumentGeneration({
                employee: selectedEmployee!.name,
                document_template: selectedTemplate!.name,
                status,
                subject: subject.trim(),
                template_content: templateContent,
            });

            sessionStorage.setItem('hr_document_generation_success_message', 'Document created successfully');
            setTimeout(() => {
                router.push('/hr-document-generation');
            }, 500);
        } catch (err: any) {
            console.error(err);
            setSnackbar({
                open: true,
                message: err.message || 'Failed to generate document',
                severity: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Create New Document Generation
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
                        onClick={handleSave}
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
                        Save
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
                        getOptionLabel={(option) => `${option.name} - ${option.employee_name}`}
                        value={selectedEmployee}
                        onChange={(_, newValue) => {
                            setSelectedEmployee(newValue);
                            if (newValue && errors.employee) {
                                setErrors((prev) => ({ ...prev, employee: false }));
                            }
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
