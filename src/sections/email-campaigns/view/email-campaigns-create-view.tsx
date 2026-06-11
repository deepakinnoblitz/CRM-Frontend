import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { VscDebugStart } from "react-icons/vsc";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

export function EmailCampaignsCreateView() {
    const router = useRouter();
    const navigate = useNavigate();

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={4}
                mt={2}
            >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Create Email Campaigns
                </Typography>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate(-1)}
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
                </Stack>
            </Stack>

            <Box display="grid" gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={3}>
                <Box gridColumn={{ xs: 'span 1', md: 'span 3' }}>
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
            </Box>
        </DashboardContent>
    );
}