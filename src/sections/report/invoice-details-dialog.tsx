import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getInvoice } from 'src/api/invoice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    invoiceId: string | null;
};

export function InvoiceDetailsDialog({ open, onClose, invoiceId }: Props) {
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && invoiceId) {
            setLoading(true);
            getInvoice(invoiceId)
                .then(setInvoice)
                .catch((err) => console.error('Failed to fetch invoice details:', err))
                .finally(() => setLoading(false));
        } else {
            setInvoice(null);
        }
    }, [open, invoiceId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Invoice Profile</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon={"mingcute:close-line" as any} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : invoice ? (
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
                                <Iconify icon={"solar:bill-list-bold-duotone" as any} width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{invoice.customer_name}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Ref No: {invoice.ref_no || '-'}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Label variant="soft" color="success">Invoice</Label>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {invoice.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* General Information */}
                        <Box>
                            <SectionHeader title="Invoice Details" icon="solar:info-circle-bold" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 3,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                }}
                            >
                                <DetailItem label="Customer" value={invoice.customer_name} icon={"solar:user-bold" as any} />
                                <DetailItem label="Ref No" value={invoice.ref_no} icon={"solar:tag-bold" as any} />
                                <DetailItem label="Invoice Date" value={invoice.invoice_date} icon={"solar:calendar-date-bold" as any} />
                                <DetailItem label="Due Date" value={invoice.due_date} icon={"solar:calendar-minimalistic-bold" as any} color="error.main" />
                                <DetailItem label="Billing Name" value={invoice.billing_name} icon={"solar:bill-list-bold" as any} />
                                <DetailItem label="Phone Number" value={invoice.phone_number} icon={"solar:phone-bold" as any} />
                                <DetailItem label="Grand Total" value={`₹${invoice.grand_total?.toLocaleString() || 0}`} icon={"solar:wad-of-money-bold" as any} color="primary.main" />
                                <DetailItem label="Received Amount" value={`₹${invoice.received_amount?.toLocaleString() || 0}`} icon={"solar:hand-money-bold" as any} color="success.main" />
                                <DetailItem label="Balance" value={`₹${invoice.balance_amount?.toLocaleString() || 0}`} icon={"solar:round-transfer-horizontal-bold" as any} color="warning.main" />
                            </Box>
                        </Box>

                        {/* Items Table */}
                        <Box>
                            <SectionHeader title="Items" icon="solar:cart-large-minimalistic-bold" />
                            <Box sx={{
                                bgcolor: 'background.neutral',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: (theme) => `1px solid ${theme.palette.divider}`
                            }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                    p: 1.5,
                                    bgcolor: (theme) => theme.palette.grey[200],
                                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                                }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>ITEM</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textAlign: 'right' }}>QTY</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textAlign: 'right' }}>PRICE</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textAlign: 'right' }}>TOTAL</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    {invoice.table_qecz?.map((item: any, index: number) => (
                                        <Box key={index} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                            p: 1.5,
                                            borderBottom: (theme) => index !== invoice.table_qecz.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                                        }}>
                                            <Box>
                                                <Typography variant="subtitle2">{item.service}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{item.description || item.service}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>{item.quantity}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>₹{item.price?.toLocaleString() || 0}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>₹{item.sub_total?.toLocaleString() || 0}</Typography>
                                        </Box>
                                    ))}
                                    {(!invoice.table_qecz || invoice.table_qecz.length === 0) && (
                                        <Box sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No items found</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Summary Info */}
                        <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                            <SectionHeader title="Financial Summary" icon="solar:bill-list-bold" noMargin />
                            <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                                <DetailItem label="Total Qty" value={invoice.total_qty} icon={"solar:box-bold" as any} />
                                <DetailItem label="Total Amount" value={`₹${invoice.total_amount?.toLocaleString() || 0}`} icon={"solar:wad-of-money-bold" as any} />
                                <DetailItem label="Grand Total" value={`₹${invoice.grand_total?.toLocaleString() || 0}`} icon={"solar:tag-bold" as any} color="primary.main" />
                            </Box>
                        </Box>

                        {/* System Information */}
                        <Box>
                            <SectionHeader title="System Information" icon="solar:clock-circle-bold" />
                            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                                <DetailItem label="Created On" value={new Date(invoice.creation).toLocaleString()} icon={"solar:calendar-date-bold" as any} />
                                <DetailItem label="Owner" value={invoice.owner} icon={"solar:user-rounded-bold" as any} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Invoice Not Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
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

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | number | null; icon: string; color?: string }) {
    return (
        <Box>
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
