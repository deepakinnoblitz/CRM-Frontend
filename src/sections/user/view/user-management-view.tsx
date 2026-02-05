import { useState, useCallback, useRef } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter, usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { UserView } from './user-view';
import { UserPermissionView } from '../../user-permission/view/user-permission-view';

// ----------------------------------------------------------------------

const TABS = [
    { value: 'users', label: 'Users List', icon: <Iconify icon={"solar:users-group-rounded-bold-duotone" as any} width={20} /> },
    { value: 'permissions', label: 'User Permissions', icon: <Iconify icon={"solar:shield-keyhole-bold-duotone" as any} width={20} /> },
];

// ----------------------------------------------------------------------

export function UserManagementView({ hideHeader = false }: { hideHeader?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();

    const usersRef = useRef<any>(null);
    const permissionsRef = useRef<any>(null);

    const searchParams = new URLSearchParams(window.location.search);
    const subTabParam = searchParams.get('subtab');

    const [currentTab, setCurrentTab] = useState(subTabParam === 'permissions' ? 'permissions' : 'users');

    const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
        const params = new URLSearchParams(window.location.search);
        if (newValue === 'users') {
            params.delete('subtab');
        } else {
            params.set('subtab', newValue);
        }
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    }, [pathname, router]);

    const handleAddAction = () => {
        if (currentTab === 'users' && usersRef.current) {
            usersRef.current.handleOpenCreate();
        } else if (currentTab === 'permissions' && permissionsRef.current) {
            permissionsRef.current.handleOpenCreate();
        }
    };

    const renderHeader = (
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4">User Management</Typography>
        </Stack>
    );

    const renderTabs = (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                width: 1,
                mb: hideHeader ? 1 : { xs: 3, md: 5 },
                borderBottom: (theme) => `1px border-style: solid; border-width: 0 0 1px 0; border-color: ${theme.palette.divider}`,
            }}
        >
            <Tabs
                value={currentTab}
                onChange={handleChangeTab}
                sx={{
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

            {currentTab === 'users' && (
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={handleAddAction}
                    sx={{
                        bgcolor: '#08a3cd',
                        '&:hover': { bgcolor: '#068fb3' },
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        mr: 1
                    }}
                >
                    New User
                </Button>
            )}
        </Stack>
    );

    const content = (
        <>
            {!hideHeader && renderHeader}

            {renderTabs}

            {currentTab === 'users' && <UserView ref={usersRef} hideHeader hideActionButton />}
            {currentTab === 'permissions' && <UserPermissionView ref={permissionsRef} hideHeader hideActionButton />}
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
