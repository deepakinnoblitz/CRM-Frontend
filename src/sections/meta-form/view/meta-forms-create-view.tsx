import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import { alpha, styled } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import FormHelperText from '@mui/material/FormHelperText';
import Switch, { SwitchProps } from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { createMetaForm } from 'src/api/meta-form';
import { fetchMetaPages } from 'src/api/meta-page';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

export const CustomSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 2,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#08a3cd',
                opacity: 1,
                border: 0,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 19,
        height: 19,
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#E5E7EB',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

// Standard CRM Lead field options for dropdown selects
const CRM_FIELD_OPTIONS = [
    { value: 'lead_name', label: 'Lead Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone_number', label: 'Phone Number' },
    { value: 'company_name', label: 'Company Name' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'country', label: 'Country' },
    { value: 'remarks', label: 'Remarks' },
    { value: 'gstin', label: 'GSTIN' },
    { value: 'service', label: 'Service' },
];

const TRANSFORM_OPTIONS = ['None', 'Title Case', 'Upper Case', 'Lower Case', 'Clean Phone'];

// ----------------------------------------------------------------------

export function MetaFormsCreateView() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const [formName, setFormName] = useState('');
    const [formId, setFormId] = useState('');
    const [metaPage, setMetaPage] = useState('');
    
    // Tracking detail fields
    const [campaignId, setCampaignId] = useState('');
    const [campaignName, setCampaignName] = useState('');
    const [adSetId, setAdSetId] = useState('');
    const [adSetName, setAdSetName] = useState('');
    const [adId, setAdId] = useState('');
    const [adName, setAdName] = useState('');

    // Settings
    const [isActive, setIsActive] = useState(true);
    const [allowDuplicates, setAllowDuplicates] = useState(false);
    const [duplicateLimitBy, setDuplicateLimitBy] = useState('Email or Phone');

    // Field Mappings Child Table
    const [fieldMappings, setFieldMappings] = useState<any[]>([
        { meta_field: 'full_name', crm_field: 'lead_name', required: 1, default_value: '', transform_function: 'None' },
        { meta_field: 'email', crm_field: 'email', required: 1, default_value: '', transform_function: 'None' },
        { meta_field: 'phone_number', crm_field: 'phone_number', required: 1, default_value: '', transform_function: 'Clean Phone' },
    ]);

    const [metaPages, setMetaPages] = useState<any[]>([]);
    const [loadingPages, setLoadingPages] = useState(true);

    const { enqueueSnackbar } = useSnackbar();
    const [errors, setErrors] = useState<{ formName?: boolean; formId?: boolean; metaPage?: boolean }>({});

    useEffect(() => {
        const loadPages = async () => {
            try {
                const res = await fetchMetaPages({ page: 1, page_size: 1000 });
                setMetaPages(res.data);
            } catch (err) {
                enqueueSnackbar('Failed to load Meta Pages list', { variant: 'error' });
            } finally {
                setLoadingPages(false);
            }
        };
        loadPages();
    }, [enqueueSnackbar]);

    const handleAddMappingRow = () => {
        setFieldMappings(prev => [
            ...prev,
            { meta_field: '', crm_field: 'lead_name', required: 0, default_value: '', transform_function: 'None' }
        ]);
    };

    const handleRemoveMappingRow = (index: number) => {
        setFieldMappings(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleMappingChange = (index: number, key: string, value: any) => {
        setFieldMappings(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [key]: value };
            return copy;
        });
    };

    const handleSave = async () => {
        const newErrors: typeof errors = {};
        if (!formName.trim()) newErrors.formName = true;
        if (!formId.trim()) newErrors.formId = true;
        if (!metaPage) newErrors.metaPage = true;
        
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
            return;
        }

        // Validate field mapping list
        const invalidMappings = fieldMappings.some(m => !m.meta_field.trim() || !m.crm_field);
        if (invalidMappings) {
            enqueueSnackbar('Please ensure all mapping rows have a Meta Field value and CRM Field selected.', { variant: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            await createMetaForm({
                form_name: formName.trim(),
                form_id: formId.trim(),
                meta_page: metaPage,
                campaign_id: campaignId.trim() || undefined,
                campaign_name: campaignName.trim() || undefined,
                ad_set_id: adSetId.trim() || undefined,
                ad_set_name: adSetName.trim() || undefined,
                ad_id: adId.trim() || undefined,
                ad_name: adName.trim() || undefined,
                is_active: isActive ? 1 : 0,
                allow_duplicates: allowDuplicates ? 1 : 0,
                duplicate_limit_by: duplicateLimitBy,
                field_mappings: fieldMappings.map(m => ({
                    meta_field: m.meta_field.trim(),
                    crm_field: m.crm_field,
                    required: m.required ? 1 : 0,
                    default_value: m.default_value.trim() || undefined,
                    transform_function: m.transform_function,
                })),
            });
            sessionStorage.setItem('meta_form_success_message', 'Meta Form created successfully.');
            router.push('/lead-integration/meta-forms');
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Failed to create Meta Form.', { variant: 'error' });
            setIsSaving(false);
        }
    };

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Create New Meta Form
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.back()}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', px: 2.5 }}
                    >
                        Go Back
                    </Button>
                    <LoadingButton
                        variant="contained"
                        onClick={handleSave}
                        loading={isSaving}
                        sx={{ borderRadius: 1.5, bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}
                    >
                        Save Meta Form
                    </LoadingButton>
                </Stack>
            </Stack>

            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Iconify icon={"logos:meta-icon" as any} width={18} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                            Meta Form Config
                        </Typography>
                    </Stack>

                    <Stack spacing={3}>
                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <FormControlLabel
                                control={
                                    <CustomSwitch
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack spacing={0.2}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, pl: 1.5 }}>Is Active</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1.5 }}>Enable processing leads from this form</Typography>
                                    </Stack>
                                }
                                sx={{ ml: 0.5 }}
                            />
                            <FormControlLabel
                                control={
                                    <CustomSwitch
                                        checked={allowDuplicates}
                                        onChange={(e) => setAllowDuplicates(e.target.checked)}
                                    />
                                }
                                label={
                                    <Stack spacing={0.2}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, pl: 1.5 }}>Allow Duplicates</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1.5 }}>Process duplicate leads matching limits</Typography>
                                    </Stack>
                                }
                                sx={{ ml: 0.5 }}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <TextField
                                fullWidth
                                label="Form Name"
                                required
                                value={formName}
                                onChange={(e) => { setFormName(e.target.value); if (e.target.value) setErrors(p => ({ ...p, formName: false })); }}
                                error={errors.formName}
                                helperText={errors.formName ? 'Form Name is required' : 'Identifiable Facebook form name'}
                            />
                            <TextField
                                fullWidth
                                label="Form ID"
                                required
                                value={formId}
                                onChange={(e) => { setFormId(e.target.value); if (e.target.value) setErrors(p => ({ ...p, formId: false })); }}
                                error={errors.formId}
                                helperText={errors.formId ? 'Form ID is required' : 'Meta Form Unique ID'}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <FormControl fullWidth required error={errors.metaPage}>
                                <InputLabel id="meta-page-label">Meta Page</InputLabel>
                                <Select
                                    labelId="meta-page-label"
                                    value={metaPage}
                                    label="Meta Page"
                                    onChange={(e) => { setMetaPage(e.target.value); setErrors(p => ({ ...p, metaPage: false })); }}
                                >
                                    {metaPages.map((p) => (
                                        <MenuItem key={p.name} value={p.name}>
                                            {p.page_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.metaPage ? 'Meta Page is required' : 'Select page hosting this form'}</FormHelperText>
                            </FormControl>
                            <FormControl fullWidth disabled={!allowDuplicates}>
                                <InputLabel id="dup-limit-label">Duplicate Limit By</InputLabel>
                                <Select
                                    labelId="dup-limit-label"
                                    value={duplicateLimitBy}
                                    label="Duplicate Limit By"
                                    onChange={(e) => setDuplicateLimitBy(e.target.value)}
                                >
                                    <MenuItem value="Email or Phone">Email or Phone</MenuItem>
                                    <MenuItem value="Email Only">Email Only</MenuItem>
                                    <MenuItem value="Phone Only">Phone Only</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary', mb: 3 }}>
                        <Iconify icon={"solar:settings-bold" as any} width={18} sx={{ color: '#08a3cd' }} />
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                            Campaign & Ad Info (Optional tracking parameters)
                        </Typography>
                    </Stack>

                    <Stack spacing={3}>
                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <TextField fullWidth label="Campaign ID" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
                            <TextField fullWidth label="Campaign Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <TextField fullWidth label="Ad Set ID" value={adSetId} onChange={(e) => setAdSetId(e.target.value)} />
                            <TextField fullWidth label="Ad Set Name" value={adSetName} onChange={(e) => setAdSetName(e.target.value)} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <TextField fullWidth label="Ad ID" value={adId} onChange={(e) => setAdId(e.target.value)} />
                            <TextField fullWidth label="Ad Name" value={adName} onChange={(e) => setAdName(e.target.value)} />
                        </Box>
                    </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ color: 'text.secondary', mb: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon={"solar:link-bold" as any} width={18} sx={{ color: '#08a3cd' }} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}>
                                Field Mappings
                            </Typography>
                        </Stack>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddMappingRow}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            sx={{ color: '#08a3cd', borderColor: '#08a3cd', '&:hover': { bgcolor: alpha('#08a3cd', 0.08), borderColor: '#068fb3' } }}
                        >
                            Add Field
                        </Button>
                    </Stack>

                    <TableContainer sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1.5 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'background.neutral' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Meta Field (Facebook Key)</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>CRM Field (Target Lead column)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Required</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Default Value</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Transform Function</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fieldMappings.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="e.g. phone_number"
                                                value={row.meta_field}
                                                onChange={(e) => handleMappingChange(index, 'meta_field', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 180 }}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={row.crm_field}
                                                    onChange={(e) => handleMappingChange(index, 'crm_field', e.target.value)}
                                                >
                                                    {CRM_FIELD_OPTIONS.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="center">
                                            <CustomSwitch
                                                checked={row.required === 1}
                                                onChange={(e) => handleMappingChange(index, 'required', e.target.checked ? 1 : 0)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="Fallback value"
                                                value={row.default_value}
                                                onChange={(e) => handleMappingChange(index, 'default_value', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 160 }}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={row.transform_function}
                                                    onChange={(e) => handleMappingChange(index, 'transform_function', e.target.value)}
                                                >
                                                    {TRANSFORM_OPTIONS.map((opt) => (
                                                        <MenuItem key={opt} value={opt}>
                                                            {opt}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveMappingRow(index)}
                                                disabled={fieldMappings.length <= 1}
                                            >
                                                <Iconify icon="solar:trash-bin-trash-bold" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Stack>
        </DashboardContent>
    );
}
