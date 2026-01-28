import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter, usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { PurchaseListView } from './purchase-list-view';
import { PurchaseCollectionListView } from '../../purchase-collection/view/purchase-collection-list-view';

// ----------------------------------------------------------------------

const TABS = [
    { value: 'purchases', label: 'Purchases', icon: <Iconify icon={"solar:cart-large-bold-duotone" as any} width={24} /> },
    { value: 'collections', label: 'Settlements', icon: <Iconify icon={"solar:wad-of-money-bold-duotone" as any} width={24} /> },
];

// ----------------------------------------------------------------------

export function PurchaseManagementView() {
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');

    const [currentTab, setCurrentTab] = useState(tabParam === 'collections' ? 'collections' : 'purchases');

    const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
        const params = new URLSearchParams(window.location.search);
        if (newValue === 'purchases') {
            params.delete('tab');
        } else {
            params.set('tab', newValue);
        }
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }, [pathname, router]);

    const handleCreateNew = () => {
        if (currentTab === 'purchases') {
            router.push('/purchase/new');
        } else {
            router.push('/purchase-collections/new');
        }
    };

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Purchase Management</Typography>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={handleCreateNew}
                >
                    {currentTab === 'purchases' ? 'New Purchase' : 'New Settlement'}
                </Button>
            </Stack>

            <Tabs
                value={currentTab}
                onChange={handleChangeTab}
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            >
                {TABS.map((tab) => (
                    <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} iconPosition="start" />
                ))}
            </Tabs>

            {currentTab === 'purchases' && <PurchaseListView hideHeader />}
            {currentTab === 'collections' && <PurchaseCollectionListView hideHeader />}
        </DashboardContent>
    );
}
