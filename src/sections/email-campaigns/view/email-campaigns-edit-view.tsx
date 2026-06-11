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

export function EmailCampaignsEditView() {
    const router = useRouter();

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" mb={3}>
                <Button onClick={() => router.back()} startIcon={<Iconify icon={"eva:arrow-ios-back-fill" as any} />} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4">Edit Campaign</Typography>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Campaign Information</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Campaign Name" />
                            <TextField fullWidth label="Email Template" />
                            <TextField fullWidth label="Subject" />
                            <TextField fullWidth label="Status" value="Draft" disabled />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Audience</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Target Type" />
                            <TextField fullWidth multiline rows={3} label="Filters" />
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField label="Total Recipients" disabled value="0" />
                                <Button variant="outlined">Calculate Recipients</Button>
                            </Stack>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Scheduling</Typography>
                        <Stack spacing={3}>
                            <FormControlLabel control={<Switch defaultChecked />} label="Send Immediately" />
                            <TextField fullWidth type="datetime-local" label="Schedule Date" InputLabelProps={{ shrink: true }} />
                        </Stack>
                    </Card>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Statistics</Typography>
                        <Stack spacing={2}>
                            <Typography variant="body2">Sent Count: 0</Typography>
                            <Typography variant="body2">Failed Count: 0</Typography>
                            <Typography variant="body2">Open Count: 0</Typography>
                            <Typography variant="body2">Click Count: 0</Typography>
                        </Stack>
                    </Card>

                    <Stack spacing={2}>
                        <Button fullWidth variant="contained" size="large" sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                            Save Draft
                        </Button>
                        <Button fullWidth variant="contained" color="success" size="large">
                            Start Campaign
                        </Button>
                        <Button fullWidth variant="outlined" color="warning" size="large">
                            Pause Campaign
                        </Button>
                        <Button fullWidth variant="outlined" color="error" size="large">
                            Cancel Campaign
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