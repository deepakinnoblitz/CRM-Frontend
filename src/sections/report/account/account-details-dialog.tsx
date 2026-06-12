import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineDocumentText, HiOutlineClipboardDocumentCheck, HiOutlineShoppingBag, HiOutlineCircleStack, HiOutlinePhone, HiOutlineGlobeAlt, HiOutlineIdentification, HiOutlineBriefcase, HiOutlineBuildingOffice, HiOutlineMapPin, HiOutlineGlobeEuropeAfrica } from "react-icons/hi2";

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
import { WhatsappChatDialog } from '../../lead/view/whatsapp_chat_dialog';

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
    const [openWhatsapp, setOpenWhatsapp] = useState(false);

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
        { value: 'contacts', label: 'Client', icon: <HiOutlineUsers size={18} /> },
        { value: 'deals', label: 'Prospects', icon: <HiOutlineCircleStack size={18} /> },
        { value: 'estimations', label: 'Estimations', icon: <HiOutlineClipboardDocumentCheck size={18} /> },
        { value: 'invoices', label: 'Invoices', icon: <HiOutlineDocumentText size={18} /> },
        { value: 'purchases', label: 'Purchases', icon: <HiOutlineShoppingBag size={18} /> },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={false} PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar) => themeVar.customShadows.z24, width: '1350px',  maxWidth: '1350px' } }}>
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
                                width: 300,
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
                                        <Typography variant="caption" sx={{ color: '#2081C3', fontWeight: 700, textTransform: 'uppercase', mb: 1.5, display: 'block', fontSize: 12 }}>
                                            Company Name
                                        </Typography>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box sx={{ color: 'text.secondary', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                                                <HiOutlineBuildingOffice size={28} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'capitalize', fontSize: '16px', pb: 0.5, lineHeight: 1.4 }}>
                                                    {account.account_name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '12px' }}>
                                                    ID: {account.name}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    {/* Account Details */}
                                    <Box>
                                        <SectionHeader title="Account Details" />
                                        <Stack spacing={2.5} sx={{ mt: 2 }}>
                                            <DetailItem label="Phone Number" value={account.phone_number} icon={<HiOutlinePhone size={18} />} />
                                            <DetailItem label="Website" value={account.website} icon={<HiOutlineGlobeAlt size={18} />} />
                                            <DetailItem label="GSTIN" value={account.gstin} icon={<HiOutlineIdentification size={18} />} />
                                            <DetailItem label="Account Owner" value={account.owner_name} subValue={account.owner} icon={<HiOutlineBriefcase size={18} />} />
                                        </Stack>
                                    </Box>

                                    {/* Location Details */}
                                    <Box>
                                        <SectionHeader title="Location" />
                                        <Stack spacing={2.5} sx={{ mt: 3 }}>
                                            <DetailItem label="City" value={account.city} icon={<HiOutlineBuildingOffice size={18} />} />
                                            <DetailItem label="State" value={account.state} icon={<HiOutlineMapPin size={18} />} />
                                            <DetailItem label="Country" value={account.country} icon={<HiOutlineGlobeEuropeAfrica size={18} />} />
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
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 3 }}>
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

                                {account?.phone_number && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => setOpenWhatsapp(true)}
                                        startIcon={<Iconify icon={"ic:baseline-whatsapp" as any} />}
                                        sx={{
                                            bgcolor: '#25D366',
                                            color: '#fff',
                                            borderRadius: 2.5,
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            px: 2.5,
                                            height: 36,
                                            '&:hover': {
                                                bgcolor: '#22c55e',
                                            },
                                        }}
                                    >
                                        WhatsApp
                                    </Button>
                                )}
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
            {account?.phone_number && (
                <WhatsappChatDialog
                    open={openWhatsapp}
                    onClose={() => setOpenWhatsapp(false)}
                    lead={{
                        lead_name: account.account_name,
                        phone_number: account.phone_number
                    }}
                />
            )}
        </Dialog>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '13px' }}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value, subValue, icon, color = 'text.primary', onClick, sx }: { label: string; value?: string | null; subValue?: string | null; icon: React.ReactNode; color?: string; onClick?: () => void; sx?: any }) {
    return (
        <Box sx={{ pb: 2, borderBottom: (themeVar) => `1px dashed ${alpha(themeVar.palette.grey[500], 0.2)}`, ...sx }}>
            <Typography variant="caption" sx={{ color: '#2081C3', fontWeight: 800, textTransform: 'uppercase', mb: 0.75, display: 'block', fontSize: 11, letterSpacing: 0.5 }}>
                {label}
            </Typography>
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
                }}
            >
                <Box sx={{ color: 'text.secondary', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color, wordBreak: 'break-word', lineHeight: 1.4, fontSize: 14 }}>
                        {value || '—'}
                    </Typography>
                    {subValue && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5, fontSize: 12, fontWeight: 600 }}>
                            {subValue}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}

