import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { getPurchase } from 'src/api/purchase';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    id?: string;
};

export function PurchaseDetailsView({ id }: Props) {
    const router = useRouter();
    const [purchase, setPurchase] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getPurchase(id)
                .then(setPurchase)
                .catch((err) => console.error('Failed to fetch purchase details:', err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <DashboardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                    <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                </Box>
            </DashboardContent>
        );
    }

    if (!purchase) {
        return (
            <DashboardContent>
                <Box sx={{ py: 20, textAlign: 'center' }}>
                    <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>Purchase Not Found</Typography>
                    <IconButton onClick={() => router.back()} sx={{ mt: 2 }}>Back</IconButton>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <IconButton onClick={() => router.back()}>
                    <Iconify icon={"solar:alt-arrow-left-bold" as any} />
                </IconButton>
                <Typography variant="h4">Purchase Profile</Typography>
            </Stack>

            <Card sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Header Info */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                            }}
                        >
                            <Iconify icon={"solar:cart-large-minimalistic-bold" as any} width={32} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{purchase.vendor_name}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Bill No: {purchase.bill_no || '-'}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Label variant="soft" color="secondary">Purchase</Label>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                ID: {purchase.name}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* General Information */}
                    <Box>
                        <SectionHeader title="Purchase Details" icon="solar:info-circle-bold" />
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 3,
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            }}
                        >
                            <DetailItem label="Vendor Name" value={purchase.vendor_name} icon="solar:user-bold" />
                            <DetailItem label="Bill No" value={purchase.bill_no} icon="solar:tag-bold" />
                            <DetailItem label="Bill Date" value={purchase.bill_date} icon="solar:calendar-date-bold" />
                            <DetailItem label="Payment Type" value={purchase.payment_type} icon="solar:bank-note-bold" color="primary.main" />
                            <DetailItem label="Payment Terms" value={purchase.payment_terms} icon="solar:document-text-bold" />
                            <DetailItem label="Due Date" value={purchase.due_date} icon="solar:calendar-minimalistic-bold" color="error.main" />
                        </Box>
                    </Box>

                    {/* Items Section */}
                    <Box>
                        <SectionHeader title="Items" icon="solar:list-bold" />
                        <TableContainer component={Box} sx={{ mt: 2, border: (theme) => `solid 1px ${theme.palette.divider}`, borderRadius: 1.5 }}>
                            <Scrollbar>
                                <Table size="small" sx={{ minWidth: 640 }}>
                                    <TableHead sx={{ bgcolor: 'background.neutral' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Qty</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Rate</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }}>Discount</TableCell>
                                            <TableCell sx={{ fontWeight: 800 }} align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {purchase.table_qecz?.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.item_name}</TableCell>
                                                <TableCell>{item.qty}</TableCell>
                                                <TableCell>{item.rate}</TableCell>
                                                <TableCell>{item.discount_amount || 0}</TableCell>
                                                <TableCell align="right">{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                        </TableContainer>
                    </Box>

                    {/* Totals Section */}
                    <Box sx={{ alignSelf: 'flex-end', minWidth: 300 }}>
                        <SectionHeader title="Totals" icon="solar:bill-list-bold" />
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Qty</Typography>
                                <Typography variant="subtitle2">{purchase.total_qty}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Amount</Typography>
                                <Typography variant="subtitle2">{purchase.total_amount}</Typography>
                            </Box>
                            {purchase.overall_discount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Discount ({purchase.overall_discount_type === 'Percentage' ? `${purchase.overall_discount}%` : 'Flat'})</Typography>
                                    <Typography variant="subtitle2" sx={{ color: 'error.main' }}>-{purchase.overall_discount}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Grand Total</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>{purchase.grand_total}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* System Information */}
                    <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                        <SectionHeader title="System Information" icon="solar:clock-circle-bold" noMargin />
                        <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                            <DetailItem label="Created On" value={new Date(purchase.creation).toLocaleString()} icon="solar:calendar-date-bold" />
                            <DetailItem label="Created By" value={purchase.owner} icon="solar:user-rounded-bold" />
                        </Box>
                    </Box>
                </Box>
            </Card>
        </DashboardContent>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary', fullWidth }: { label: string; value?: string | number | null; icon: string; color?: string, fullWidth?: boolean }) {
    return (
        <Box sx={fullWidth ? { gridColumn: '1 / -1' } : {}}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}