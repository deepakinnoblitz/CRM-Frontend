import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { MetaPageSelectionCard } from 'src/sections/meta-page/meta-page-selection-card';
import { MetaFormSelectionCard } from 'src/sections/meta-form/meta-form-selection-card';
import { MetaAccountConnectCard } from 'src/sections/meta-app/meta-account-connect-card';

// ----------------------------------------------------------------------

export default function MetaIntegrationView() {
    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Typography variant="h4" mb={3}>
                Meta Integration Dashboard
            </Typography>

            {/* Stacked Cards in a Single Page */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 1. Privyr-style Connect Facebook Account Banner */}
                <MetaAccountConnectCard />

                {/* 2. Privyr-style Discover & Select Facebook Pages */}
                <MetaPageSelectionCard isConnectedAccount />

                {/* 3. Privyr-style Discover & Select Meta Lead Forms */}
                <MetaFormSelectionCard isConnectedPage />
            </Box>
        </DashboardContent>
    );
}
