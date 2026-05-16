import { useState, useEffect } from 'react';
import { FaBuildingUser } from "react-icons/fa6";
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineClipboardDocumentCheck, HiOutlineShoppingBag, HiOutlineCircleStack } from "react-icons/hi2";

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme, alpha } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';

import { getAccount } from 'src/api/accounts';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { AccountRelatedList } from './account-related-list';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    accountId: string | null;
    onEdit?: (accountId: string) => void;
};

export function AccountDetailsDialog({ open, onClose, accountId, onEdit }: Props) {
    const theme = useTheme();

    const [currentTab, setCurrentTab] = useState('contacts');

    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && accountId) {
            setLoading(true);
            getAccount(accountId)
                .then(setAccount)
                .catch((err) => console.error('Failed to fetch account details:', err))
                .finally(() => setLoading(false));
        }
    }, [open, accountId]);

    const TABS = [
        { value: 'contacts', label: 'Contacts', icon: <HiOutlineUsers size={18} /> },
        { value: 'invoices', label: 'Invoices', icon: <HiOutlineDocumentText size={18} /> },
        { value: 'estimations', label: 'Estimations', icon: <HiOutlineClipboardDocumentCheck size={18} /> },
        { value: 'purchases', label: 'Purchases', icon: <HiOutlineShoppingBag size={18} /> },
        { value: 'deals', label: 'Deals', icon: <HiOutlineCircleStack size={18} /> },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar) => themeVar.customShadows.z24, } }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Company Details</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton onClick={onClose} sx={{ color: (themeVar) => themeVar.palette.grey[500], bgcolor: 'background.paper', boxShadow: (themeVar) => themeVar.customShadows?.z1 }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={48} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : account ? (
                    <Box sx={{ display: 'flex', height: '85vh' }}>
                        {/* Sidebar: Profile Details */}
                        <Box
                            sx={{
                                width: 350,
                                borderRight: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.grey[500], 0.02),
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Scrollbar
                                sx={{
                                    p: 4,
                                    flexGrow: 1,
                                    height: 1,
                                    '& .simplebar-scrollbar:before': {
                                        opacity: 0.25,
                                        width: '4px',
                                        borderRadius: 1,
                                    },
                                    '& .simplebar-track.simplebar-vertical': {
                                        width: '10px',
                                    },
                                }}
                            >
                                <Stack spacing={5}>
                                    {/* Identity Hero */}
                                    <Box>
                                        <Stack direction="row" spacing={2.5} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 72,
                                                    height: 72,
                                                    borderRadius: '50%',
                                                    bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.2)}`,
                                                }}
                                            >
                                                <FaBuildingUser size={36} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -0.5 }}>
                                                    {account.account_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}>
                                                    ID: {account.name}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    {/* Account Details */}
                                    <Box>
                                        <SectionHeader title="Account Details" />
                                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                            <DetailItem label="Phone Number" value={account.phone_number} icon="solar:phone-bold" />
                                            <DetailItem label="Website" value={account.website} icon="solar:globus-bold" />
                                            <DetailItem label="GSTIN" value={account.gstin} icon="solar:checklist-bold" />
                                            <DetailItem label="Account Owner" value={account.owner} icon="solar:user-bold" />
                                        </Stack>
                                    </Box>

                                    {/* Location Details */}
                                    <Box>
                                        <SectionHeader title="Location" />
                                        <Stack spacing={2.5} sx={{ mt: 3 }}>
                                            <DetailItem label="City" value={account.city} icon="solar:city-bold" />
                                            <DetailItem label="State" value={account.state} icon="solar:point-on-map-bold" />
                                            <DetailItem label="Country" value={account.country} icon="solar:earth-bold" />
                                        </Stack>
                                    </Box>

                                    {/* System Information */}
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.04),
                                            border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.1)}`,
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                                                Last Update:
                                            </Typography>
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            {new Date(account.modified).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Scrollbar>
                        </Box>

                        {/* Main Content: Tabs & Related Data */}
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={currentTab}
                                    onChange={(e: any, newValue: any) => setCurrentTab(newValue)}
                                    sx={{
                                        px: 3,
                                        '& .MuiTab-root': {
                                            minHeight: 64,
                                            fontWeight: 800,
                                            fontSize: 15,
                                            '&.Mui-selected': { color: 'primary.main' },
                                        },
                                        '& .MuiTabs-indicator': {
                                            height: 3,
                                            borderRadius: '3px 3px 0 0',
                                        }
                                    }}
                                >
                                    {TABS.map((tab) => (
                                        <Tab
                                            key={tab.value}
                                            value={tab.value}
                                            label={tab.label}
                                            icon={tab.icon}
                                            iconPosition="start"
                                        />
                                    ))}
                                </Tabs>
                            </Box>

                            <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'background.paper', overflow: 'auto' }}>
                                <AccountRelatedList accountId={accountId || ''} type={currentTab as any} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 20, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={80} sx={{ color: 'text.disabled', mb: 3 }} />
                        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800 }}>Account Not Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary', onClick, sx }: { label: string; value?: string | null; icon: string; color?: string; onClick?: () => void; sx?: any }) {
    return (
        <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            onClick={onClick}
            sx={{
                ...(onClick && {
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.72 },
                }),
                ...sx
            }}
        >
            <Iconify icon={icon as any} width={20} sx={{ color: 'text.disabled', opacity: 0.64 }} />
            <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase', mb: 0.25, display: 'block', fontSize: 10 }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color, wordBreak: 'break-word', lineHeight: 1.4 }}>
                    {value || '—'}
                </Typography>
            </Box>
        </Stack>
    );
}

