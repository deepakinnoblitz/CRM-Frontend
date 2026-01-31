import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter, usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { InvoiceListView } from './invoice-list-view';
import { InvoiceCollectionListView } from '../../invoice-collection/view/invoice-collection-list-view';

// ----------------------------------------------------------------------

const TABS = [
    { value: 'invoices', label: 'Invoices', icon: <Iconify icon={"solar:bill-list-bold-duotone" as any} width={20} /> },
    { value: 'collections', label: 'Invoice Collection', icon: <Iconify icon={"solar:bill-check-bold-duotone" as any} width={20} /> },
];

// ----------------------------------------------------------------------

export function InvoiceManagementView({ hideHeader = false }: { hideHeader?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();

    const searchParams = new URLSearchParams(window.location.search);
    const subTabParam = searchParams.get('subtab');

    const [currentTab, setCurrentTab] = useState(subTabParam === 'collections' ? 'collections' : 'invoices');

    const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
        const params = new URLSearchParams(window.location.search);
        if (newValue === 'invoices') {
            params.delete('subtab');
        } else {
            params.set('subtab', newValue);
        }
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }, [pathname, router]);

    const handleCreateNew = () => {
        if (currentTab === 'invoices') {
            router.push('/invoices/new');
        } else {
            router.push('/invoice-collections/new');
        }
    };

    const renderHeader = (
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
    );

    const renderTabs = (
        <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
                mb: hideHeader ? 1 : { xs: 3, md: 5 },
                pl: hideHeader ? 1 : 0,
                minHeight: 40,
                '& .MuiTabs-indicator': {
                    height: 2,
                },
            }}
        >
            {TABS.map((tab) => (
                <Tab
                    key={tab.value}
                    label={tab.label}
                    icon={tab.icon}
                    value={tab.value}
                    iconPosition="start"
                    sx={{
                        minWidth: 160,
                        minHeight: 40,
                        fontSize: 14,
                        textTransform: 'none',
                        fontWeight: 'fontWeightMedium',
                        '&.Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 'fontWeightBold',
                        },
                    }}
                />
            ))}
        </Tabs>
    );

    const content = (
        <>
            {!hideHeader && renderHeader}

            {renderTabs}

            {currentTab === 'invoices' && <InvoiceListView hideHeader />}
            {currentTab === 'collections' && <InvoiceCollectionListView hideHeader />}
        </>
    );

    if (hideHeader) {
        return content;
    }

    return (
        <DashboardContent maxWidth={false}>
            {content}
        </DashboardContent>
    );
}
