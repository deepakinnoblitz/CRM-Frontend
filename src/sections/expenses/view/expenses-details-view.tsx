import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getExpense, deleteExpense } from 'src/api/expenses';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
    id?: string;
};

export function ExpenseDetailsView({ id }: Props) {
    const router = useRouter();
    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (id) {
            getExpense(id)
                .then(setExpense)
                .catch((err) => {
                    console.error('Failed to fetch expense details:', err);
                    setSnackbar({ open: true, message: 'Failed to load expense details', severity: 'error' });
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            await deleteExpense(id);
            setSnackbar({ open: true, message: 'Expense deleted successfully', severity: 'success' });
            setTimeout(() => router.push('/expenses'), 1500);
        } catch (error) {
            console.error('Failed to delete expense:', error);
            setSnackbar({ open: true, message: 'Failed to delete expense', severity: 'error' });
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };

    if (loading) {
        return (
            <DashboardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 20 }}>
                    <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                </Box>
            </DashboardContent>
        );
    }

    if (!expense) {
        return (
            <DashboardContent>
                <Box sx={{ py: 20, textAlign: 'center' }}>
                    <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>Expense Not Found</Typography>
                    <Button onClick={() => router.push('/expenses')} sx={{ mt: 2 }}>
                        Back to List
                    </Button>
                </Box>
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Expense: {expense.expense_no || id}</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/expenses')}
                        startIcon={<Iconify icon={"solar:arrow-left-bold" as any} />}
                    >
                        Back to List
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmDeleteOpen(true)}
                        startIcon={<Iconify icon={"solar:trash-bin-trash-bold" as any} />}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => router.push(`/expenses/${encodeURIComponent(id || '')}/edit`)}
                        startIcon={<Iconify icon={"solar:pen-bold" as any} />}
                    >
                        Edit Expense
                    </Button>
                </Stack>
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
                                bgcolor: 'error.lighter',
                                color: 'error.main',
                            }}
                        >
                            <Iconify icon={"solar:bill-list-bold" as any} width={32} />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{expense.expense_category}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Expense No: {expense.expense_no || '-'}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Label variant="soft" color="error">Expense</Label>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                ID: {expense.name}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* General Information */}
                    <Box>
                        <SectionHeader title="Expense Details" icon="solar:info-circle-bold" />
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 3,
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            }}
                        >
                            <DetailItem label="Expense Category" value={expense.expense_category} icon="solar:tag-bold" />
                            <DetailItem label="Expense No" value={expense.expense_no} icon="solar:document-text-bold" />
                            <DetailItem label="Date" value={expense.date} icon="solar:calendar-date-bold" />
                            <DetailItem label="Payment Type" value={expense.payment_type} icon="solar:bank-note-bold" color="primary.main" />
                            <DetailItem label="Total Amount" value={`₹${expense.total?.toLocaleString() || 0}`} icon="solar:wallet-money-bold" color="success.main" />
                        </Box>
                    </Box>

                    {/* Items Section */}
                    {expense.table_qecz && expense.table_qecz.length > 0 && (
                        <Box>
                            <SectionHeader title="Items" icon="solar:list-bold" />
                            <TableContainer component={Box} sx={{ mt: 2, border: (theme) => `solid 1px ${theme.palette.divider}`, borderRadius: 1.5 }}>
                                <Scrollbar>
                                    <Table size="small" sx={{ minWidth: 640 }}>
                                        <TableHead sx={{ bgcolor: 'background.neutral' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }}>Qty</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
                                                <TableCell sx={{ fontWeight: 800 }} align="right">Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {expense.table_qecz?.map((item: any, index: number) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.items}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>₹{item.price?.toLocaleString() || 0}</TableCell>
                                                    <TableCell align="right">₹{item.amount?.toLocaleString() || 0}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Scrollbar>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Totals Section */}
                    <Box sx={{ alignSelf: 'flex-end', minWidth: 300 }}>
                        <SectionHeader title="Totals" icon="solar:bill-list-bold" />
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Qty</Typography>
                                <Typography variant="subtitle2">{expense.table_qecz?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0}</Typography>
                            </Box>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Grand Total</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{expense.total?.toLocaleString() || 0}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Description Section */}
                    {expense.description && (
                        <Box>
                            <SectionHeader title="Description" icon="solar:document-text-bold" />
                            <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                                {expense.description}
                            </Typography>
                        </Box>
                    )}

                    {/* System Information */}
                    <Box sx={{ p: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
                        <SectionHeader title="System Information" icon="solar:clock-circle-bold" noMargin />
                        <Box sx={{ mt: 3, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' } }}>
                            <DetailItem label="Created On" value={new Date(expense.creation).toLocaleString()} icon="solar:calendar-date-bold" />
                            <DetailItem label="Created By" value={expense.owner} icon="solar:user-rounded-bold" />
                        </Box>
                    </Box>
                </Box>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        boxShadow: (theme) => theme.customShadows.z20
                    }}
                >
                    <AlertTitle>{snackbar.severity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => !deleting && setConfirmDeleteOpen(false)}
                title="Confirm Delete"
                content="Are you sure you want to delete this expense?"
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleting}
                        sx={{ borderRadius: 1.5, minWidth: 100 }}
                    >
                        {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                }
            />
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
