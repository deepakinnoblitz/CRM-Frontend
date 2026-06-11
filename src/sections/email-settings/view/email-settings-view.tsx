import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';


import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

export function EmailSettingsView() {
    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4">CRM Email Settings</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="info" startIcon={<Iconify icon={"eva:email-outline" as any} />}>
                        Test Email Connection
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: '#08a3cd', color: 'common.white', '&:hover': { bgcolor: '#068fb3' } }}>
                        Save Settings
                    </Button>
                </Stack>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>SMTP Configuration</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Default Email Account" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Campaign Configuration</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth type="number" label="Max Emails Per Batch" />
                            <TextField fullWidth type="number" label="Batch Delay (seconds)" />
                            <TextField fullWidth type="number" label="Maximum Retry Count" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Auto Retry Failed Emails" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Automation Configuration</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel control={<Switch defaultChecked />} label="Enable Email Automation" />
                            <TextField fullWidth type="number" label="Scheduler Interval (minutes)" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Create Campaign History" />
                        </Stack>
                    </Card>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Tracking Configuration</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel control={<Switch defaultChecked />} label="Enable Open Tracking" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Enable Click Tracking" />
                            <FormControlLabel control={<Switch defaultChecked />} label="Enable Unsubscribe Link" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Queue Configuration</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth type="number" label="Queue Size" disabled value={0} />
                            <FormControlLabel control={<Switch defaultChecked />} label="Auto Delete Queue Records" />
                            <TextField fullWidth type="number" label="Retention Days" />
                            <FormControlLabel control={<Switch />} label="Enable Debug Logs" />
                        </Stack>
                    </Card>
                </Box>
            </Box>
        </DashboardContent>
    );
}