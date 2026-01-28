import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { InvoiceListView } from './invoice-list-view';
import { InvoiceCollectionListView } from '../../invoice-collection/view/invoice-collection-list-view';

// ----------------------------------------------------------------------

const TABS = [
    { value: 'invoices', label: 'Invoices', icon: <Iconify icon={"solar:bill-list-bold-duotone" as any} width={24} /> },
    { value: 'collections', label: 'Collections', icon: <Iconify icon={"solar:wad-of-money-bold-duotone" as any} width={24} /> },
];

// ----------------------------------------------------------------------

export function InvoiceView() {
    const router = useRouter();

    const [currentTab, setCurrentTab] = useState('invoices');

    const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    }, []);

    const handleCreateNew = () => {
        if (currentTab === 'invoices') {
            router.push('/invoices/new');
        } else {
            router.push('/invoice-collections/new');
        }
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Invoice Management</Typography>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={handleCreateNew}
                >
                    {currentTab === 'invoices' ? 'New Invoice' : 'New Collection'}
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
                    <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
                ))}
            </Tabs>

            {currentTab === 'invoices' && <InvoiceListView hideHeader />}
            {currentTab === 'collections' && <InvoiceCollectionListView hideHeader />}
        </DashboardContent>
    );
}
