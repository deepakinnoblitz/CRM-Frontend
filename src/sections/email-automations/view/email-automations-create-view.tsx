import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

export function EmailAutomationsCreateView() {
    const router = useRouter();

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" mb={3}>
                <Button onClick={() => router.back()} startIcon={<Iconify icon={"eva:arrow-ios-back-fill" as any} />} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4">Create New Automation</Typography>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Basic Information</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Automation Name" />
                            <TextField fullWidth multiline rows={3} label="Description" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Is Active" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Email Configuration</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Email Template" />
                            <TextField fullWidth label="Subject Override" />
                            <TextField fullWidth label="Target Type" />
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
                            <TextField fullWidth label="Frequency" />
                            <Stack direction="row" spacing={2}>
                                <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} />
                                <TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} />
                            </Stack>
                            <TextField fullWidth type="time" label="Run Time" InputLabelProps={{ shrink: true }} />
                            <TextField fullWidth label="Week Day" />
                            <TextField fullWidth label="Day Of Month" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Execution Settings</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel control={<Switch defaultChecked />} label="Create Campaign History" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Auto Pause On Error" />
                            <TextField fullWidth type="number" label="Maximum Retry Count" />
                        </Stack>
                    </Card>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Statistics</Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2">Last Run: -</Typography>
                            <Typography variant="body2">Next Run: -</Typography>
                            <Typography variant="body2">Total Runs: 0</Typography>
                            <Typography variant="body2">Total Emails Sent: 0</Typography>
                        </Stack>
                    </Card>

                    <Stack spacing={2}>
                        <Button fullWidth variant="contained" size="large" sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                            Save
                        </Button>
                        <Button fullWidth variant="contained" color="success" size="large">
                            Activate
                        </Button>
                        <Button fullWidth variant="outlined" color="warning" size="large">
                            Pause
                        </Button>
                        <Button fullWidth variant="text" size="large" color="inherit" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </DashboardContent>
    );
}