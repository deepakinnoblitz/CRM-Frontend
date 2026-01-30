import { useState, useEffect } from 'react';

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
        } else {
            setContact(null);
            setCurrentTab('invoices');
        }
    }, [open, contactId]);

    const TABS = [
        { value: 'invoices', label: 'Invoices', icon: 'solar:bill-list-bold' },
        { value: 'estimations', label: 'Estimations', icon: 'solar:document-text-bold' },
        { value: 'purchases', label: 'Purchases', icon: 'solar:cart-bold' },
        { value: 'deals', label: 'Deals', icon: 'solar:hand-stars-bold' },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Contact Details</Typography>
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
                    <Box sx={{ display: 'flex', height: '75vh' }}>
                        {/* Sidebar: Profile Details */}
                        <Box
                            sx={{
                                width: 380,
                                borderRight: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.grey[500], 0.02),
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Scrollbar sx={{ p: 4 }}>
                                <Stack spacing={5}>
                                    {/* Identity Hero */}
                                    <Box>
                                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                                            <Box
                                                sx={{
                                                    width: 72,
                                                    height: 72,
                                                    borderRadius: 2,
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: (themeVar) => `0 8px 16px 0 ${alpha(themeVar.palette.primary.main, 0.24)}`,
                                                }}
                                            >
                                                <Iconify icon={"solar:user-bold" as any} width={36} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                    {contact.first_name} {contact.last_name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {contact.designation || 'Contact'}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack spacing={1.5}>
                                            <DetailItem label="Organization" value={contact.company_name} icon="solar:buildings-bold" />
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Label variant="soft" color="secondary" sx={{ textTransform: 'none', fontWeight: 700 }}>
                                                    {contact.name}
                                                </Label>
                                                {onEdit && contactId && (
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        startIcon={<Iconify icon={"solar:pen-bold" as any} width={14} />}
                                                        onClick={() => {
                                                            onEdit(contactId);
                                                            onClose();
                                                        }}
                                                        sx={{ py: 0.5, height: 28, fontSize: 12, fontWeight: 700 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    {/* Connectivity Grid */}
                                    <Box>
                                        <SectionHeader title="Connectivity" icon="solar:link-bold" />
                                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                            <DetailItem label="Email Address" value={contact.email} icon="solar:letter-bold" />
                                            <DetailItem label="Phone Number" value={contact.phone} icon="solar:phone-bold" />
                                            <DetailItem label="Account Owner" value={contact.owner} icon="solar:user-rounded-bold" />
                                        </Stack>
                                    </Box>

                                    {/* Location Details */}
                                    <Box>
                                        <SectionHeader title="Location" icon="solar:map-point-bold" />
                                        <Stack spacing={2.5} sx={{ mt: 3 }}>
                                            <DetailItem label="Full Address" value={contact.address} icon="solar:home-bold" />
                                            <DetailItem label="City & Jurisdiction" value={`${contact.city || '—'}, ${contact.state || '—'}`} icon="solar:city-bold" />
                                            <DetailItem label="Country" value={contact.country} icon="solar:earth-bold" />
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
                                            <Iconify icon={"solar:clock-circle-bold" as any} width={16} sx={{ color: 'text.disabled' }} />
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>
                                                Last Synchronized
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
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
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
                                            icon={<Iconify icon={tab.icon as any} width={22} />}
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

function SectionHeader({ title, icon }: { title: string; icon: string }) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon={icon as any} width={18} sx={{ color: 'primary.main' }} />
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null; icon: string; color?: string }) {
    return (
        <Stack direction="row" spacing={1.5}>
            <Iconify icon={icon as any} width={20} sx={{ mt: 0.5, color: 'text.disabled', opacity: 0.64 }} />
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
