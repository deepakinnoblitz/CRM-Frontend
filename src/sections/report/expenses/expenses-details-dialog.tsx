import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { getExpense } from 'src/api/expenses';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    expenseId: string | null;
};

export function ExpenseDetailsDialog({ open, onClose, expenseId }: Props) {
    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && expenseId) {
            setLoading(true);
            getExpense(expenseId)
                .then(setExpense)
                .catch((err) => console.error('Failed to fetch expense details:', err))
                .finally(() => setLoading(false));
        } else {
            setExpense(null);
        }
    }, [open, expenseId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Expense Details</Typography>
                <IconButton onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500], bgcolor: 'background.paper', boxShadow: (theme) => theme.customShadows?.z1 }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4, m: 2, mt: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                        <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : expense ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'warning.lighter',
                                    color: 'warning.main',
                                }}
                            >
                                <Iconify icon={"solar:wallet-money-bold" as any} width={40} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>{expense.expense_category}</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    {expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Label variant="soft" color="warning">Expense</Label>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>
                                    ₹{expense.total?.toLocaleString() || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {expense.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Expense Information */}
                        <Box>
                            <SectionHeader title="Expense Information" icon="solar:document-bold" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 3,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                }}
                            >
                                <DetailItem label="Expense No" value={expense.expense_no} icon="solar:hashtag-square-bold" />
                                <DetailItem label="Category" value={expense.expense_category} icon="solar:tag-bold" />
                                <DetailItem
                                    label="Date"
                                    value={expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                                    icon="solar:calendar-bold"
                                />
                                <DetailItem label="Payment Type" value={expense.payment_type} icon="solar:card-bold" />
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
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textAlign: 'right' }}>AMOUNT</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    {expense.table_qecz?.map((item: any, index: number) => (
                                        <Box key={index} sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                            p: 1.5,
                                            borderBottom: (theme) => index !== expense.table_qecz.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                                        }}>
                                            <Box>
                                                <Typography variant="subtitle2">{item.items}</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>{item.quantity}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right' }}>{item.price}</Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>{item.amount}</Typography>
                                        </Box>
                                    ))}
                                    {(!expense.table_qecz || expense.table_qecz.length === 0) && (
                                        <Box sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No items found</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Description */}
                        {expense.description && (
                            <Box>
                                <SectionHeader title="Description" icon="solar:notes-bold" />
                                <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {expense.description}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Expense Not Found</Typography>
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

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}

