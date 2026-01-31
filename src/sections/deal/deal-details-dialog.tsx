import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme, alpha } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { getDeal } from 'src/api/deals';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { DealRelatedList } from './deal-related-list';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    dealId: string | null;
    onEdit?: (id: string) => void;
};

export function DealDetailsDialog({ open, onClose, dealId, onEdit }: Props) {
    const theme = useTheme();
    const router = useRouter();

    const [deal, setDeal] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState('estimations');

    useEffect(() => {
        if (open && dealId) {
            setLoading(true);
            getDeal(dealId)
                .then((dealData) => {
                    setDeal(dealData);
                })
                .catch((err) => console.error('Failed to fetch deal details:', err))
                .finally(() => setLoading(false));
        } else {
            setDeal(null);
            setCurrentTab('estimations');
        }
    }, [open, dealId]);

    const handleCreateEstimation = useCallback(() => {
        if (deal) {
            router.push(`/estimations/new?deal_id=${deal.name}&client_id=${deal.contact}`);
            onClose();
        }
    }, [deal, router, onClose]);

    const handleCreateInvoice = useCallback(() => {
        if (deal) {
            router.push(`/invoices/new?deal_id=${deal.name}`);
            onClose();
        }
    }, [deal, router, onClose]);

    const renderStage = (stage: string) => {
        let color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' = 'default';
        if (stage === 'Qualification') color = 'info';
        if (stage === 'Needs Analysis' || stage === 'Meeting Scheduled') color = 'warning';
        if (stage === 'Proposal Sent' || stage === 'Negotiation') color = 'primary';
        if (stage === 'Closed Won') color = 'success';
        if (stage === 'Closed Lost') color = 'error';

        return (
            <Label variant="soft" color={color}>
                {stage}
            </Label>
        );
    };

    const TABS = [
        { value: 'estimations', label: 'Estimations', icon: 'solar:document-text-bold' },
        { value: 'invoices', label: 'Invoices', icon: 'solar:bill-list-bold' },
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Deal Details</Typography>
                <IconButton onClick={onClose} sx={{ color: theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={48} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : deal ? (
                    <Box sx={{ display: 'flex', height: '75vh' }}>
                        {/* Sidebar: Deal Details */}
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
                                    {/* Deal Identity */}
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
                                                    boxShadow: `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                                                }}
                                            >
                                                <Iconify icon={"solar:bag-bold" as any} width={36} />
                                            </Box>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                                    {deal.deal_title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                    {deal.account}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack spacing={1.5} direction="row" alignItems="center">
                                            <Label variant="soft" color="secondary" sx={{ textTransform: 'none', fontWeight: 700 }}>
                                                {deal.name}
                                            </Label>
                                            <Box sx={{ flexGrow: 1 }} />
                                            {onEdit && dealId && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<Iconify icon={"solar:pen-bold" as any} width={14} />}
                                                    onClick={() => {
                                                        onEdit(dealId);
                                                        onClose();
                                                    }}
                                                    sx={{ py: 0.5, height: 28, fontSize: 12, fontWeight: 700 }}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Divider sx={{ borderStyle: 'dashed' }} />

                                    {/* Deal Stats */}
                                    <Box>
                                        <SectionHeader title="Overview" icon="solar:info-circle-bold" />
                                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                            <DetailItem label="Value" value={deal.value ? `₹${deal.value.toLocaleString()}` : '-'} icon="solar:wad-of-money-bold" color="success.main" />
                                            <DetailItem label="Expected Close" value={deal.expected_close_date} icon="solar:calendar-bold" />
                                            <DetailItem label="Probability" value={deal.probability ? `${deal.probability}%` : '-'} icon="solar:chart-square-bold" />
                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase', mb: 0.5, display: 'block', fontSize: 10 }}>
                                                    Stage
                                                </Typography>
                                                {renderStage(deal.stage)}
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Relationships */}
                                    <Box>
                                        <SectionHeader title="Connectivity" icon="solar:link-bold" />
                                        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
                                            <DetailItem label="Contact" value={deal.contact_name || deal.contact} icon="solar:user-bold" />
                                            <DetailItem label="Source Lead" value={deal.source_lead} icon="solar:tag-horizontal-bold" />
                                            <DetailItem label="Deal Owner" value={deal.deal_owner || deal.owner} icon="solar:user-rounded-bold" />
                                        </Stack>
                                    </Box>

                                    {/* Notes */}
                                    <Box>
                                        <SectionHeader title="Notes" icon="solar:document-text-bold" />
                                        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary', fontStyle: deal.notes ? 'normal' : 'italic' }}>
                                            {deal.notes || 'No notes added'}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ borderStyle: 'dashed', my: 3 }} />

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
                                        {deal.modified ? new Date(deal.modified).toLocaleString() : '—'}
                                    </Typography>
                                </Box>
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
                                <DealRelatedList dealId={dealId || ''} type={currentTab as any} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 20, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={80} sx={{ color: 'text.disabled', mb: 3 }} />
                        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 800 }}>Deal Not Found</Typography>
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

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null | number; icon: string; color?: string }) {
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
