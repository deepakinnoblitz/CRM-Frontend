import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { IoMdArrowBack } from "react-icons/io";
import { CiCalculator2 } from "react-icons/ci";
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { getFriendlyErrorMessage } from 'src/utils/error-handler';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchEmailTemplates } from 'src/api/email-template';
import { updateEmailCampaign, getEmailCampaign, EmailCampaign } from 'src/api/email-campaign';

import { Iconify } from 'src/components/iconify';

import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';

// ----------------------------------------------------------------------

const FILTER_FIELD_OPTIONS = [
    { value: 'workflow_status', label: 'Workflow Status' },
    { value: 'source', label: 'Source' },
    { value: 'lead_name', label: 'Lead Name' },
    { value: 'email', label: 'Email' },
    { value: 'mobile_no', label: 'Mobile No' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'country', label: 'Country' },
    { value: 'owner', label: 'Owner' },
];

const FILTER_OPERATOR_OPTIONS = [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: 'Like', label: 'Like' },
    { value: 'Not Like', label: 'Not Like' },
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
];

// ----------------------------------------------------------------------

export function EmailCampaignsEditView() {
    const router = useRouter();
    const navigate = useNavigate();
    const { id } = useParams();

    const [campaignName, setCampaignName] = useState('');
    const [emailTemplate, setEmailTemplate] = useState('');
    const [subject, setSubject] = useState('');
    const [targetType, setTargetType] = useState('');
    const [sendImmediately, setSendImmediately] = useState(true);
    const [scheduleDate, setScheduleDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState('Draft');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [templateOptions, setTemplateOptions] = useState<any[]>([]);
    const [filters, setFilters] = useState<any[]>([{ field_name: '', operator: '=', value: '' }]);

    const TARGET_TYPE_OPTIONS = [
        { value: 'Lead', label: 'Lead' },
        { value: 'Contact', label: 'Contact' },
        { value: 'Account', label: 'Account' },
    ];

    useEffect(() => {
        fetchEmailTemplates({ page: 1, page_size: 1000 }).then((res) => {
            setTemplateOptions(res.data);
        }).catch((err) => {
            console.error('Failed to fetch email templates:', err);
        });
    }, []);

    useEffect(() => {
        if (id) {
            getEmailCampaign(id)
                .then((data) => {
                    setCampaignName(data.campaign_name || '');
                    setEmailTemplate(data.email_template || '');
                    setSubject(data.subject || '');
                    setTargetType(data.target_type || '');
                    setSendImmediately(data.send_immediately === 1);
                    setScheduleDate(data.schedule_date || '');
                    setStatus(data.status || 'Draft');
                    setFilters(data.filters || [{ field_name: '', operator: '=', value: '' }]);
                })
                .catch((err) => {
                    console.error('Failed to fetch email campaign:', err);
                    setSnackbar({ open: true, message: 'Failed to load email campaign', severity: 'error' });
                })
                .finally(() => setFetching(false));
        }
    }, [id]);

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: boolean } = {};
        const missingFields: string[] = [];

        if (!campaignName) {
            newErrors.campaignName = true;
            missingFields.push('Campaign Name');
        }
        if (!emailTemplate) {
            newErrors.emailTemplate = true;
            missingFields.push('Email Template');
        }
        if (!targetType) {
            newErrors.targetType = true;
            missingFields.push('Target Type');
        }

        setValidationErrors(newErrors);

        if (missingFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Please fill in mandatory fields: ${missingFields.join(', ')}`,
                severity: 'error',
            });
            return false;
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!validateForm() || !id) return;

        try {
            setSaving(true);

            const campaignData = {
                campaign_name: campaignName,
                email_template: emailTemplate,
                subject: subject,
                target_type: targetType,
                send_immediately: sendImmediately ? 1 : 0,
                schedule_date: sendImmediately ? '' : scheduleDate,
                status: status,
                filters: filters.filter(f => f.field_name || f.value),
            };

            await updateEmailCampaign(id, campaignData);
            setSnackbar({ open: true, message: 'Email Campaign updated successfully', severity: 'success' });
            
            sessionStorage.setItem(
            'email_campaign_edit_success',
            'Email Campaign Edited successfully'
            );

            router.push('/email-campaigns');
            
        } catch (err: any) {
            console.error(err);
            const friendlyMsg = getFriendlyErrorMessage(err);
            setSnackbar({ open: true, message: friendlyMsg || 'Failed to update Email Campaign', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/email-campaigns');
    };

    const handleAddFilter = () => {
        setFilters([...filters, { field_name: '', operator: '=', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleFilterChange = (index: number, field: string, value: string) => {
        const newFilters = [...filters];
        newFilters[index] = { ...newFilters[index], [field]: value };
        setFilters(newFilters);
    };

    return (
        <>
            {fetching && (
                <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <CircularProgress />
                </DashboardContent>
            )}

            {!fetching && (
                <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
                mt={2}
            >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Edit Email Campaign
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleCancel}
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
                        onClick={handleUpdate}
                        disabled={saving || fetching}
                        sx={{
                            height: 36,
                            px: 3,
                            borderRadius: 1.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#2081C3',
                            color: 'common.white',
                            minWidth: 130,
                            '&:hover': { bgcolor: '#1a699f' },
                            '&:disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' }
                        }}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : 'Update Campaign'}
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Campaign Information</Typography>
                <Box
                    sx={{
                        display: 'grid',
                        margin: '1rem',
                        columnGap: 2,
                        rowGap: 3,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Campaign Name"
                        value={campaignName}
                        onChange={(e) => {
                            setCampaignName(e.target.value);
                            if (e.target.value) setValidationErrors(prev => ({ ...prev, campaignName: false }));
                        }}
                        required
                        error={!!validationErrors.campaignName}
                        helperText={validationErrors.campaignName ? 'Campaign Name is required' : ''}
                    />

                    <Autocomplete
                        fullWidth
                        options={templateOptions}
                        getOptionLabel={(option) => option.template_name || ''}
                        value={templateOptions.find((opt) => opt.name === emailTemplate) || null}
                        onChange={(_e, newValue) => {
                            setEmailTemplate(newValue?.name || '');
                            if (newValue?.name) setValidationErrors(prev => ({ ...prev, emailTemplate: false }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Email Template"
                                required
                                error={!!validationErrors.emailTemplate}
                                helperText={validationErrors.emailTemplate ? 'Email Template is required' : ''}
                            />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...optionProps } = props as any;
                            return (
                                <li key={key || option.name} {...optionProps}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontSize: '14px' }}>
                                            {option.template_name || option.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                                            {option.subject || ''}
                                        </Typography>
                                    </Box>
                                </li>
                            );
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Scheduled">Scheduled</MenuItem>
                        <MenuItem value="Running">Running</MenuItem>
                        <MenuItem value="Paused">Paused</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </TextField>
                </Box>
            </Card>

            <Card sx={{ p: 3, mb: 3 }} >
                <Box
                    sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                    Audience
                    </Typography>

                    <Button
                    variant="contained"
                    startIcon={<CiCalculator2 size={24} />}
                    sx={{
                        background: 'linear-gradient(135deg,#A855F7,#7C3AED)',
                        borderRadius: 3,
                        px: 2,
                        py: 0.8,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 8px 20px rgba(124,58,237,.25)',
                        '&:hover': {
                        background: 'linear-gradient(135deg,#9333EA,#6D28D9)',
                        },
                    }}
                    >
                     Calculate Recipients
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 3,
                        mb: 4,
                        gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                        },
                    }}
                    >
                    <TextField
                        fullWidth
                        select
                        label="Target Type"
                        value={targetType}
                        onChange={(e) => {
                        setTargetType(e.target.value);

                        if (e.target.value) {
                            setValidationErrors((prev) => ({
                            ...prev,
                            targetType: false,
                            }));
                        }
                        }}
                        error={!!validationErrors.targetType}
                        helperText={
                        validationErrors.targetType
                            ? 'Target Type is required'
                            : ''
                        }
                    >
                        {TARGET_TYPE_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Total Recipients"
                        value="0"
                        disabled
                        fullWidth
                    />
                </Box>

                <Box
                sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E5E7EB',
                }}
                >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 3 }}
                >
                    Filters
                </Typography>

                {filters.map((filter, index) => (
                    <Box
                    key={index}
                    sx={{
                        display: 'grid',
                        gap: 2,
                        mb: 2,
                        alignItems: 'center',
                        gridTemplateColumns: {
                        xs: '1fr',
                        md: '2fr 1.5fr 2fr auto',
                        },
                    }}
                    >
                    <TextField
                        select
                        size="small"
                        value={filter.field_name}
                        onChange={(e) =>
                        handleFilterChange(
                            index,
                            'field_name',
                            e.target.value
                        )
                        }
                        sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                        }}
                    >
                        <MenuItem value="">
                        Select Field
                        </MenuItem>

                        {FILTER_FIELD_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        value={filter.operator}
                        onChange={(e) =>
                        handleFilterChange(
                            index,
                            'operator',
                            e.target.value
                        )
                        }
                        sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                        }}
                    >
                        {FILTER_OPERATOR_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        placeholder="Enter value"
                        value={filter.value}
                        onChange={(e) =>
                        handleFilterChange(
                            index,
                            'value',
                            e.target.value
                        )
                        }
                        sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                        }}
                    />

                    <IconButton
                        color="error"
                        onClick={() =>
                        handleRemoveFilter(index)
                        }
                        disabled={filters.length <= 1}
                    >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                    </Box>
                ))}

                <Button
                    variant="contained"
                    startIcon={
                    <Iconify icon="mingcute:add-line" />
                    }
                    onClick={handleAddFilter}
                    sx={{
                    mt: 1,
                    background:
                        'linear-gradient(135deg,#A855F7,#7C3AED)',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 0.8,
                    boxShadow:
                        '0 8px 20px rgba(124,58,237,.25)',
                    '&:hover': {
                        background:
                        'linear-gradient(135deg,#9333EA,#6D28D9)',
                    },
                    }}
                >
                    Add Filter
                </Button>
                </Box>
            </Card>


            <Card sx={{ p: 3, mb: 3 }}>
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2 }}
            >
                Scheduling
            </Typography>

            <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
            }}
            >
            <FormControlLabel
                sx={{
                m: 0,
                minWidth: 220,
                '& .MuiFormControlLabel-label': {
                    ml: 1.5, // gap between switch and label
                    fontSize: '15px',
                    fontWeight: 500,
                },
                }}
                control={
                <CustomSwitch
                    checked={sendImmediately}
                    onChange={(e) => setSendImmediately(e.target.checked)}
                />
                }
                label="Send Immediately"
            />

            {!sendImmediately && (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Schedule Date"
                    value={scheduleDate ? dayjs(scheduleDate) : null}
                    onChange={(newValue) =>
                    setScheduleDate(
                        newValue ? newValue.format('YYYY-MM-DD') : ''
                    )
                    }
                    slotProps={{
                    textField: {
                        size: 'small',
                        sx: {
                        minWidth: 380,
                        },
                    },
                    }}
                />
                </LocalizationProvider>
            )}
            </Box>
            </Card>

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
        )}
        </>
    );
}