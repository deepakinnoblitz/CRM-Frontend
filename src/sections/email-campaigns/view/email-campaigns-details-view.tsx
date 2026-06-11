import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { RiMailSendLine } from "react-icons/ri";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

export function EmailCampaignsDetailsView() {
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
                    Email Campaigns
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
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            <RiMailSendLine />
                        }
                        sx={{
                            bgcolor: '#9625d3ff',
                            color: '#fff',
                            borderRadius: 1.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: '#9625d3ff',
                            },
                        }}
                    >
                        Calculate Recipients
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={
                            <RiMailSendLine />
                        }
                        sx={{
                            bgcolor: '#22c55e',
                            color: '#fff',
                            borderRadius: 1.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: '#22c55e',
                            },
                        }}
                    >
                        Start Campaign
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 3 }}>
                <Typography variant="h6">View Mode</Typography>
            </Card>
        </DashboardContent>
    );
}