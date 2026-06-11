import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';


import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

export function EmailTemplateCreateView() {
    const router = useRouter();

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" mb={3}>
                <Button onClick={() => router.back()} startIcon={<Iconify icon={"eva:arrow-ios-back-fill" as any} />} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4">Create New Template</Typography>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 2' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Basic Information</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Template Name" />
                            <TextField fullWidth label="Category" />
                            <TextField fullWidth multiline rows={3} label="Description" />
                            <Stack direction="row" spacing={2}>
                                <FormControlLabel control={<Switch defaultChecked />} label="Is Active" />
                                <FormControlLabel control={<Switch />} label="Is Default" />
                            </Stack>
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Email Settings</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Subject" />
                            <TextField fullWidth label="Sender Name" />
                            <TextField fullWidth label="Reply To Email" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Content</Typography>
                        <Stack spacing={3}>
                            <TextField fullWidth multiline rows={6} label="Email Content" />
                            <TextField fullWidth multiline rows={3} label="Footer Content" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Attachments</Typography>
                        <Box sx={{ p: 3, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Upload attachments here</Typography>
                        </Box>
                    </Card>
                </Box>

                <Box gridColumn={{ xs: 'span 1', md: 'span 1' }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Tracking</Typography>
                        <Stack spacing={2}>
                            <FormControlLabel control={<Switch />} label="Enable Open Tracking" />
                            <FormControlLabel control={<Switch />} label="Enable Click Tracking" />
                            <FormControlLabel control={<Switch />} label="Enable Unsubscribe Link" />
                        </Stack>
                    </Card>

                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>Variables</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Available Variables: {"{{ contact_name }}"}, {"{{ company_name }}"}
                        </Typography>
                    </Card>

                    <Stack spacing={2}>
                        <Button fullWidth variant="contained" size="large" sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}>
                            Save Template
                        </Button>
                        <Button fullWidth variant="outlined" size="large">
                            Save & New
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