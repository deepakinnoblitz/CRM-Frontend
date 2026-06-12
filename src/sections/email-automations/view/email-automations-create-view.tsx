import dayjs from 'dayjs';
import { useState } from 'react';
import { IoMdArrowBack } from 'react-icons/io';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks'

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { CustomSwitch } from 'src/sections/reminders/reminders-settings-view';

export function EmailAutomationsCreateView() {
    const router = useRouter();

    const [automationName, setAutomationName] = useState('');
    const [emailTemplate, setEmailTemplate] = useState('');
    const [targetType, setTargetType] = useState('');
    const [frequency, setFrequency] = useState('');
    const [runTime, setRunTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
                        Create New Automation
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

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
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
                            />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Audience</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth multiline rows={3} label="Filters" />
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

            </Box>
            </DashboardContent>
        </LocalizationProvider>
    );
}