import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { frappeRequest } from 'src/utils/csrf';

import { DashboardContent } from 'src/layouts/dashboard';
import { fetchEmailTemplates } from 'src/api/email-template';
import { getEmailAutomation } from 'src/api/email-automation';

import { Iconify } from 'src/components/iconify';

import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';  


export function EmailAutomationsEditView() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [templateOptions, setTemplateOptions] = useState<any[]>([]);

    useEffect(() => {
        fetchEmailTemplates({ page: 1, page_size: 1000 }).then((res) => {
            setTemplateOptions(res.data);
        }).catch((err) => {
            console.error('Failed to fetch email templates:', err);
        });
    }, []);

    const [automationName, setAutomationName] = useState('');
    const [status, setStatus] = useState('Draft');
    const [emailTemplate, setEmailTemplate] = useState('');
    const [targetType, setTargetType] = useState('Lead');
    const [frequency, setFrequency] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [runTime, setRunTime] = useState('');
    const [filters, setFilters] = useState<{ field_name: string; operator: string; value: string; }[]>([]);

    useEffect(() => {
        if (id) {
            getEmailAutomation(id).then((data) => {
                setAutomationName(data.automation_name || '');
                setStatus(data.status || 'Draft');
                setEmailTemplate(data.email_template || '');
                setTargetType(data.target_type || 'Lead');
                setFrequency(data.frequency || '');
                setStartDate(data.start_date || '');
                setEndDate(data.end_date || '');
                setRunTime(data.run_time || '');
                if (data.filters && Array.isArray(data.filters) && data.filters.length > 0) {
                    setFilters(data.filters);
                } else {
                    // Fallback to explicitly fetch child table if data.filters is missing
                    frappeRequest(`/api/method/frappe.client.get_list?doctype=CRM Email Automation Filter&filters=${encodeURIComponent(JSON.stringify({ parent: id }))}&fields=${encodeURIComponent(JSON.stringify(['name', 'field_name', 'operator', 'value']))}`)
                        .then(res => res.json())
                        .then(resData => {
                            if (resData.message && Array.isArray(resData.message)) {
                                setFilters(resData.message);
                            }
                        })
                        .catch(err => console.error('Failed to fetch filters:', err));
                }
            }).catch(console.error);
        }
    }, [id]);

    const [errors, setErrors] = useState<{
        automationName?: boolean;
        emailTemplate?: boolean;
        targetType?: boolean;
        frequency?: boolean;
        runTime?: boolean;
        startDate?: boolean;
    }>({});

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleSave = () => {
        const newErrors: typeof errors = {};
        const missingFields: string[] = [];

        if (!automationName) {
            newErrors.automationName = true;
            missingFields.push('Automation Name');
        }
        if (!emailTemplate) {
            newErrors.emailTemplate = true;
            missingFields.push('Email Template');
        }
        if (!targetType) {
            newErrors.targetType = true;
            missingFields.push('Target Type');
        }
        if (!frequency) {
            newErrors.frequency = true;
            missingFields.push('Frequency');
        }
        if (!startDate) {
            newErrors.startDate = true;
            missingFields.push('Start Date');
        }
        if (!runTime) {
            newErrors.runTime = true;
            missingFields.push('Run Time');
        }

        setErrors(newErrors);

        if (missingFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Please fill in mandatory fields: ${missingFields.join(', ')}`,
                severity: 'error',
            });
            return;
        }

        // Add save logic here
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        Edit Automation
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
                        Save Automation
                    </Button>
                </Stack>
            </Stack>

            <Box>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Basic Information</Typography>
                        <Stack spacing={3}>
                            <TextField 
                                fullWidth 
                                label="Automation Name" 
                                required
                                value={automationName}
                                onChange={(e) => {
                                    setAutomationName(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, automationName: false }));
                                }}
                                error={errors.automationName}
                                helperText={errors.automationName ? 'This field is required' : ''}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {['Draft', 'Active', 'Paused', 'Completed', 'Cancelled', 'Failed'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </TextField>
                            <TextField fullWidth multiline rows={3} label="Description" />
                            <FormControlLabel control={<CustomSwitch defaultChecked />} label="Is Active" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Email Configuration</Typography>
                        <Stack spacing={3}>
                            <Autocomplete
                                fullWidth
                                options={templateOptions}
                                getOptionLabel={(option) => option.template_name || option.name || ''}
                                value={templateOptions.find((opt) => opt.name === emailTemplate) || null}
                                onChange={(_e, newValue) => {
                                    setEmailTemplate(newValue?.name || '');
                                    if (newValue?.name) setErrors(prev => ({ ...prev, emailTemplate: false }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Email Template"
                                        required
                                        error={errors.emailTemplate}
                                        helperText={errors.emailTemplate ? 'This field is required' : ''}
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
                                                    {option.category || 'No Category'}
                                                </Typography>
                                            </Box>
                                        </li>
                                    );
                                }}
                            />
                            <TextField fullWidth label="Subject Override" />
                            <TextField 
                                select
                                fullWidth 
                                label="Target Type" 
                                required
                                value={targetType}
                                onChange={(e) => {
                                    setTargetType(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, targetType: false }));
                                }}
                                error={errors.targetType}
                                helperText={errors.targetType ? 'This field is required' : ''}
                            >
                                {['Lead', 'Contact', 'Account'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Audience Filters</Typography>
                        <Stack spacing={3}>
                            <TableContainer sx={{ border: (theme) => `solid 1px ${theme.palette.divider}`, borderRadius: 1 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: 'background.neutral' }}>
                                        <TableRow>
                                            <TableCell width={60}>No.</TableCell>
                                            <TableCell>Field</TableCell>
                                            <TableCell>Operator</TableCell>
                                            <TableCell>Value</TableCell>
                                            <TableCell width={60} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filters.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                    <Stack alignItems="center" spacing={1}>
                                                        <Iconify icon={"solar:folder-with-files-outline" as any} width={32} sx={{ color: 'text.secondary' }} />
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>No Data</Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filters.map((filter, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>
                                                        <TextField 
                                                            size="small"
                                                            fullWidth
                                                            value={filter.field_name}
                                                            onChange={(e) => {
                                                                const newFilters = [...filters];
                                                                newFilters[index].field_name = e.target.value;
                                                                setFilters(newFilters);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField 
                                                            size="small"
                                                            select
                                                            fullWidth
                                                            value={filter.operator}
                                                            onChange={(e) => {
                                                                const newFilters = [...filters];
                                                                newFilters[index].operator = e.target.value;
                                                                setFilters(newFilters);
                                                            }}
                                                        >
                                                            {['=', '!=', '<', '>', '<=', '>=', 'in', 'not in', 'like', 'not like'].map(opt => (
                                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                            ))}
                                                        </TextField>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField 
                                                            size="small"
                                                            fullWidth
                                                            value={filter.value}
                                                            onChange={(e) => {
                                                                const newFilters = [...filters];
                                                                newFilters[index].value = e.target.value;
                                                                setFilters(newFilters);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton color="error" onClick={() => {
                                                            const newFilters = [...filters];
                                                            newFilters.splice(index, 1);
                                                            setFilters(newFilters);
                                                        }}>
                                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box display="flex" justifyContent="flex-end">
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    color="inherit"
                                    startIcon={<Iconify icon={"mingcute:add-line" as any} />}
                                    onClick={() => setFilters([...filters, { field_name: '', operator: '=', value: '' }])}
                                >
                                    Add Row
                                </Button>
                            </Box>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Schedule</Typography>
                        <Stack spacing={3}>
                            <TextField 
                                select
                                fullWidth 
                                label="Frequency" 
                                required
                                value={frequency}
                                onChange={(e) => {
                                    setFrequency(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, frequency: false }));
                                }}
                                error={errors.frequency}
                                helperText={errors.frequency ? 'This field is required' : ''}
                            >
                                {['Once', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </TextField>
                            {frequency && (
                                <>
                                    <Stack direction="row" spacing={2}>
                                        <DatePicker
                                            label="Start Date *"
                                            format="DD-MM-YYYY"
                                            value={startDate ? dayjs(startDate) : null}
                                            onChange={(newValue) => {
                                                const formatted = newValue ? newValue.format('DD-MM-YYYY') : '';
                                                setStartDate(formatted);
                                                if (formatted) setErrors((prev) => ({ ...prev, startDate: false }));
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: errors.startDate,
                                                    helperText: errors.startDate ? 'This field is required' : ''
                                                }
                                            }}
                                        />
                                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(frequency) && (
                                            <DatePicker
                                                label="End Date"
                                                format="DD-MM-YYYY"
                                                value={endDate ? dayjs(endDate) : null}
                                                onChange={(newValue) => setEndDate(newValue ? newValue.format('DD-MM-YYYY') : '')}
                                                slotProps={{ textField: { fullWidth: true } }}
                                            />
                                        )}
                                    </Stack>
                                    <TimePicker
                                        label="Run Time *"
                                        value={runTime ? dayjs(`2000-01-01T${runTime}`) : null}
                                        onChange={(newValue) => {
                                            const formatted = newValue ? newValue.format('HH:mm:ss') : '';
                                            setRunTime(formatted);
                                            if (formatted) setErrors((prev) => ({ ...prev, runTime: false }));
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: errors.runTime,
                                                helperText: errors.runTime ? 'This field is required' : ''
                                            }
                                        }}
                                    />
                                    {frequency === 'Weekly' && <TextField fullWidth label="Week Day" />}
                                    {frequency === 'Monthly' && <TextField fullWidth label="Day Of Month" />}
                                </>
                            )}
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Execution Settings</Typography>
                        <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={3}>
                            <Stack spacing={2}>
                                <FormControlLabel control={<Checkbox defaultChecked />} label="Create Separate Campaign" />
                                <FormControlLabel control={<Checkbox />} label="Send Immediately" />
                            </Stack>
                            <Stack spacing={2}>
                                <FormControlLabel control={<Checkbox defaultChecked />} label="Auto Pause On Error" />
                                <TextField fullWidth type="number" label="Max Retry Count" />
                            </Stack>
                        </Box>
                    </Card>
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
        </LocalizationProvider>
    );
}