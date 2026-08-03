import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { getMetaAccountStatus } from 'src/api/meta-app';
import { DashboardContent } from 'src/layouts/dashboard';

import { MetaPageSelectionCard } from 'src/sections/meta-page/meta-page-selection-card';
import { MetaFormSelectionCard } from 'src/sections/meta-form/meta-form-selection-card';
import { MetaAccountConnectCard } from 'src/sections/meta-app/meta-account-connect-card';

// ----------------------------------------------------------------------

export default function MetaIntegrationView() {
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [accountName, setAccountName] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const loadAccountStatus = useCallback(async () => {
        try {
            const data = await getMetaAccountStatus();
            if (data?.name) {
                setAccountName(data.name);
                setIsConnected(data.connection_status === 'Connected' && data.is_active);
            } else {
                setAccountName(null);
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Failed to load account status:', err);
            setAccountName(null);
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        loadAccountStatus();
    }, [loadAccountStatus, refreshSignal]);

    const handleRefreshAll = useCallback(() => {
        setRefreshSignal((prev) => prev + 1);
    }, []);

    return (
        <DashboardContent maxWidth={false} sx={{ mt: 2 }}>
            <Typography variant="h4" mb={3}>
                Meta Integration Dashboard
            </Typography>

            {/* Stacked Cards in a Single Page */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 1. Privyr-style Connect Facebook Account Banner */}
                <MetaAccountConnectCard onRefresh={handleRefreshAll} />

                {/* 2. Privyr-style Discover & Select Facebook Pages */}
                <MetaPageSelectionCard
                    accountName={accountName}
                    isConnectedAccount={isConnected}
                    onRefresh={handleRefreshAll}
                    refreshSignal={refreshSignal}
                />

                {/* 3. Privyr-style Discover & Select Meta Lead Forms */}
                <MetaFormSelectionCard key={`forms-${refreshSignal}`} isConnectedPage={isConnected} />
            </Box>
        </DashboardContent>
    );
}
