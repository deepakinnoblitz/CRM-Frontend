import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useRouter } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

export function EmailAutomationsDetailsView() {
    const router = useRouter();

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" mb={3}>
                <Button onClick={() => router.back()} startIcon={<Iconify icon={"eva:arrow-ios-back-fill" as any} />} sx={{ mr: 2 }}>
                    Back
                </Button>
                <Typography variant="h4">Automation Details</Typography>
            </Stack>

            <Card sx={{ p: 3 }}>
                <Typography variant="h6">View Mode</Typography>
            </Card>
        </DashboardContent>
    );
}