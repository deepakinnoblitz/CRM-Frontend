import { FaUserTie } from "react-icons/fa6";
import { useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineDocumentText, HiOutlineClipboardDocumentCheck, HiOutlineShoppingBag, HiOutlineCircleStack, HiOutlineBuildingOffice, HiOutlineEnvelope, HiOutlinePhone, HiOutlineBriefcase, HiOutlineHome, HiOutlineMapPin, HiOutlineGlobeAlt } from "react-icons/hi2";

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';

import { useRouter } from 'src/routes/hooks';

import { getContact } from 'src/api/contacts';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { ContactRelatedList } from './contact-related-list';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    contactId: string | null;
    onEdit?: (contactId: string) => void;
};

export function ContactDetailsDialog({ open, onClose, contactId, onEdit }: Props) {
    const theme = useTheme();
    const router = useRouter();
    const [contact, setContact] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState('invoices');

    useEffect(() => {
        if (open && contactId) {
            setLoading(true);
            getContact(contactId)
                .then(setContact)
                .catch((err) => console.error('Failed to fetch contact details:', err))
                .finally(() => setLoading(false));
        }
    }, [open, contactId]);

    const TABS = [
        { value: 'deals', label: 'Prospects', icon: <HiOutlineCircleStack size={18} /> },
        { value: 'estimations', label: 'Estimations', icon: <HiOutlineClipboardDocumentCheck size={18} /> },
        { value: 'invoices', label: 'Invoices', icon: <HiOutlineDocumentText size={18} /> },
        { value: 'purchases', label: 'Purchases', icon: <HiOutlineShoppingBag size={18} /> },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={false} PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar) => themeVar.customShadows.z24, width: '1350px',  maxWidth: '1350px'} }}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Client Details</Typography>
                <IconButton onClick={onClose} sx={{ color: theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={48} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : contact ? (
                    <Box sx={{ display: 'flex', height: '85vh' }}>
                        {/* Sidebar: Profile Details */}
                        <Box
                            sx={{
                                width: 330,
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
                                                <FaUserTie size={36} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -0.5 }}>
                                                    {contact.first_name} {contact.last_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, display: 'block' }}>
                                                    ID: {contact.name}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Connectivity Grid */}
                                    <Box>
                                        <Stack spacing={2.5} sx={{ mb: 4 }}>
                                            <DetailItem
                                                label="Company"
                                                value={(() => {
                                                    const list = contact.company_name_list || [];
                                                    if (list.length === 0) return '—';
                                                    return (
                                                        <Stack spacing={1} sx={{ mt: 0.5 }}>
                                                            {list.map((name: string, index: number) => (
                                                                <Box
                                                                    key={index}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: list.length > 1 ? 1.25 : 0,
                                                                        px: 1.5,
                                                                        py: 0.75,
                                                                        borderRadius: '8px',
                                                                        bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.04),
                                                                        border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.08)}`,
                                                                        transition: (themeVar) => themeVar.transitions.create(['background-color', 'border-color', 'transform']),
                                                                        '&:hover': {
                                                                            bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.08),
                                                                            borderColor: (themeVar) => alpha(themeVar.palette.primary.main, 0.2),
                                                                            transform: 'translateX(4px)',
                                                                        },
                                                                    }}
                                                                >
                                                                    {list.length > 1 && (
                                                                        <Box
                                                                            sx={{
                                                                                width: 18,
                                                                                height: 18,
                                                                                borderRadius: '50%',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                bgcolor: 'primary.main',
                                                                                color: 'primary.contrastText',
                                                                                fontSize: '10px',
                                                                                fontWeight: 800,
                                                                                flexShrink: 0,
                                                                            }}
                                                                        >
                                                                            {index + 1}
                                                                        </Box>
                                                                    )}
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontWeight: 700,
                                                                            color: 'text.primary',
                                                                            fontSize: 13,
                                                                            wordBreak: 'break-word',
                                                                            lineHeight: 1.3,
                                                                        }}
                                                                    >
                                                                        {name}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Stack>
                                                    );
                                                })()}
                                                icon={(contact.company_name_list || []).length > 1 ? null : <HiOutlineBuildingOffice size={18} />}
                                            />
                                            {contact.source_lead && (
                                                <DetailItem
                                                    label="Source Lead"
                                                    value={contact.source_lead}
                                                    icon={<HiOutlineUser size={18} />}
                                                    color="text-primary"
                                                    onClick={() => {
                                                        router.push(`/leads?view=${encodeURIComponent(contact.source_lead)}`);
                                                        onClose();
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        <SectionHeader title="Contact Details" />
                                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                            <DetailItem label="Email Address" value={contact.email} icon={<HiOutlineEnvelope size={18} />} />
                                            <DetailItem label="Phone Number" value={contact.phone} icon={<HiOutlinePhone size={18} />} />
                                            <DetailItem label="Account Owner" value={contact.owner} icon={<HiOutlineBriefcase size={18} />} />
                                        </Stack>
                                    </Box>

                                    {/* Location Details */}
                                    <Box>
                                        <SectionHeader title="Location" />
                                        <Stack spacing={2.5} sx={{ mt: 3 }}>
                                            <DetailItem label="Full Address" value={contact.address} icon={<HiOutlineHome size={18} />} />
                                            <DetailItem label="City & State" value={`${contact.city || '—'}, ${contact.state || '—'}`} icon={<HiOutlineMapPin size={18} />} />
                                            <DetailItem label="Country" value={contact.country} icon={<HiOutlineGlobeAlt size={18} />} />
                                        </Stack>
                                    </Box>

                                    {/* Synchronization Info */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 1.5,
                                            bgcolor: 'background.neutral',
                                            border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase' }}>
                                                Last Update:
                                            </Typography>
                                        </Stack>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            {new Date(contact.modified).toLocaleString()}
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
                                    onChange={(e, newValue) => setCurrentTab(newValue)}
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
                                <ContactRelatedList contactId={contactId || ''} type={currentTab as any} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 20, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={80} sx={{ color: 'text.disabled', mb: 3 }} />
                        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800 }}>Identity Not Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '12px' }}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value, subValue, icon, color = 'text.primary', onClick, sx }: { label: string; value?: React.ReactNode; subValue?: string | null; icon: React.ReactNode; color?: string; onClick?: () => void; sx?: any }) {
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
                {icon && (
                    <Box sx={{ color: 'text.secondary', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                        {icon}
                    </Box>
                )}
                <Box sx={{ flexGrow: 1 }}>
                    {typeof value === 'string' || value === null || value === undefined ? (
                        <Typography variant="body2" sx={{ fontWeight: 700, color, wordBreak: 'break-word', lineHeight: 1.4, fontSize: 14 }}>
                            {value || '—'}
                        </Typography>
                    ) : (
                        value
                    )}
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
