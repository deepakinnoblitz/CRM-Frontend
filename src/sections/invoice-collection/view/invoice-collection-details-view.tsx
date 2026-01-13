import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { getInvoiceCollection, deleteInvoiceCollection } from 'src/api/invoice-collection';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export function InvoiceCollectionDetailsView() {
    const { id } = useParams();
    const router = useRouter();

    const [collection, setCollection] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (id) {
            getInvoiceCollection(id)
                .then(setCollection)
                .catch((error) => {
                    console.error('Failed to fetch collection:', error);
                    setSnackbar({ open: true, message: 'Failed to load collection details', severity: 'error' });
                })
                .finally(() => setFetching(false));
        }
    }, [id]);

    if (fetching) {
        return (
            <DashboardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </DashboardContent>
        );
    }

    if (!collection) {
        return (
            <DashboardContent>
                <Typography variant="h4">Invoice Collection not found</Typography>
                <Button onClick={() => router.push('/invoice-collections')} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        invoice,
        customer,
        customer_name,
        company_name,
        collection_date,
        amount_to_pay,
        amount_collected,
        amount_pending,
        mode_of_payment,
        remarks,
    } = collection;

    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            await deleteInvoiceCollection(id);
            setSnackbar({ open: true, message: 'Collection deleted successfully', severity: 'success' });
            setTimeout(() => router.push('/invoice-collections'), 1500);
        } catch (error) {
            console.error('Failed to delete collection:', error);
            setSnackbar({ open: true, message: 'Failed to delete collection', severity: 'error' });
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">Invoice Collection: {id}</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/invoice-collections')}
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
                        onClick={() => router.push(`/invoice-collections/${encodeURIComponent(id || '')}/edit`)}
                        startIcon={<Iconify icon={"solar:pen-bold" as any} />}
                    >
                        Edit Collection
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Stack spacing={4}>
                    {/* Header Info Sections */}
                    <Box
                        sx={{
                            display: 'grid',
                            columnGap: 4,
                            rowGap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        }}
                    >
                        {/* Invoice Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <Iconify icon={"solar:document-text-bold-duotone" as any} width={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Invoice Details</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="caption" color="text.disabled">Invoice Number</Typography>
                                <Typography variant="subtitle1" color="primary.main" sx={{ mt: 0.5 }}>{invoice}</Typography>
                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                <Typography variant="caption" color="text.disabled">Amount to Pay</Typography>
                                <Typography variant="h6" sx={{ mt: 0.5 }}>{fCurrency(amount_to_pay)}</Typography>
                            </Box>
                        </Stack>

                        {/* Customer Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <Iconify icon={"solar:user-rounded-bold-duotone" as any} width={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer Details</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="caption" color="text.disabled">Customer ID</Typography>
                                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>{customer}</Typography>
                                <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                <Typography variant="caption" color="text.disabled">Name</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>{customer_name || '-'}</Typography>
                                {company_name && (
                                    <>
                                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                        <Typography variant="caption" color="text.disabled">Company</Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>{company_name}</Typography>
                                    </>
                                )}
                            </Box>
                        </Stack>

                        {/* Collection Details Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <Iconify icon={"solar:calendar-bold-duotone" as any} width={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Collection Info</Typography>
                            </Stack>
                            <Stack spacing={2} sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Collection Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{collection_date}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Payment Mode</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{mode_of_payment}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Payment Summary */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, color: 'text.secondary' }}>
                            <Iconify icon={"solar:wad-of-money-bold-duotone" as any} width={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Summary</Typography>
                        </Stack>
                        <Stack spacing={2} sx={{ p: 3, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">Amount to Pay</Typography>
                                <Typography variant="subtitle2">{fCurrency(amount_to_pay)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Iconify icon={"solar:hand-money-bold-duotone" as any} width={16} sx={{ color: 'success.main' }} />
                                    <Typography variant="body2" color="text.secondary">Amount Collected</Typography>
                                </Stack>
                                <Typography variant="subtitle2" color="success.main">{fCurrency(amount_collected)}</Typography>
                            </Stack>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Iconify icon={"solar:wallet-2-bold-duotone" as any} width={20} sx={{ color: (amount_pending || 0) > 0 ? 'error.main' : 'success.main' }} />
                                    <Typography variant="subtitle1" sx={{ color: (amount_pending || 0) > 0 ? 'error.main' : 'success.main' }}>Amount Pending</Typography>
                                </Stack>
                                <Typography variant="h5" color={(amount_pending || 0) > 0 ? "error.main" : "success.main"}>{fCurrency(amount_pending)}</Typography>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Remarks Section */}
                    {remarks && (
                        <Stack spacing={1}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                                <Iconify icon={"solar:notes-bold-duotone" as any} width={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Remarks</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{
                                p: 2,
                                borderRadius: 1.5,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                whiteSpace: 'pre-wrap',
                                minHeight: 80,
                                color: 'text.secondary'
                            }}>
                                {remarks}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
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
                content="Are you sure you want to delete this invoice collection?"
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
