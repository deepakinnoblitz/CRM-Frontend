import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { frappeRequest } from 'src/utils/csrf';

import { DashboardContent } from 'src/layouts/dashboard';
import { getEmailAutomation } from 'src/api/email-automation';

import { Iconify } from 'src/components/iconify';

import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';  


export function EmailAutomationsEditView() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

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

    const handleSave = () => {
        const newErrors: typeof errors = {};
        if (!automationName) newErrors.automationName = true;
        if (!emailTemplate) newErrors.emailTemplate = true;
        if (!targetType) newErrors.targetType = true;
        if (!frequency) newErrors.frequency = true;
        if (!runTime) newErrors.runTime = true;
        if (!startDate) newErrors.startDate = true;

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
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
                            <TextField 
                                fullWidth 
                                label="Email Template" 
                                required
                                value={emailTemplate}
                                onChange={(e) => {
                                    setEmailTemplate(e.target.value);
                                    if (e.target.value) setErrors((prev) => ({ ...prev, emailTemplate: false }));
                                }}
                                error={errors.emailTemplate}
                                helperText={errors.emailTemplate ? 'This field is required' : ''}
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
                            />
                            <Stack direction="row" spacing={2}>
                                <DatePicker
                                    label="Start Date *"
                                    format="DD-MM-YYYY"
                                    value={startDate ? dayjs(startDate) : null}
                                    onChange={(newValue) => {
                                        const formatted = newValue ? newValue.format('YYYY-MM-DD') : '';
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
                                <DatePicker
                                    label="End Date"
                                    format="DD-MM-YYYY"
                                    value={endDate ? dayjs(endDate) : null}
                                    onChange={(newValue) => setEndDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
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
                            <TextField fullWidth label="Week Day" />
                            <TextField fullWidth label="Day Of Month" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Execution Settings</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel control={<CustomSwitch defaultChecked />} label="Create Campaign History" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                            <FormControlLabel control={<CustomSwitch defaultChecked />} label="Auto Pause On Error" sx={{ '& .MuiFormControlLabel-label': { ml: 1 } }} />
                            <TextField fullWidth type="number" label="Maximum Retry Count" />
                        </Stack>
                    </Card>
            </Box>
            </DashboardContent>
        </LocalizationProvider>
    );
}