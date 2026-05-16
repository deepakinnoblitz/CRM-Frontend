import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    IoMdArrowBack, IoMdCube, IoMdListBox, IoMdCalculator, IoMdPricetags,
    IoMdWallet, IoMdPrint, IoMdSwap, IoMdTrash, IoMdCreate,
    IoMdPerson, IoMdCalendar, IoMdCash, IoMdList, IoMdLink, IoMdDownload
} from "react-icons/io";

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Backdrop from '@mui/material/Backdrop';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { handleDirectPrint } from 'src/utils/print';

import { DashboardContent } from 'src/layouts/dashboard';
import { getEstimation, deleteEstimation, getEstimationPrintUrl, convertEstimationToInvoice } from 'src/api/estimation';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export function EstimationDetailsView() {
    const { id } = useParams();
    const router = useRouter();

    const [estimation, setEstimation] = useState<any>(null);
    const [fetching, setFetching] = useState(true);
    const [converting, setConverting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            getEstimation(id)
                .then(setEstimation)
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

    if (!estimation) {
        return (
            <DashboardContent maxWidth={false}>
                <Typography variant="h4">Estimation not found</Typography>
                <Button onClick={() => router.push('/estimations')} sx={{ mt: 3 }}>
                    Go back to list
                </Button>
            </DashboardContent>
        );
    }

    const {
        client_name,
        deal,
        estimate_date,
        billing_address,
        description,
        terms_and_conditions,
        attachments,
        overall_discount_type,
        overall_discount,
        total_qty,
        total_amount,
        grand_total,
        table_qecz = [],
    } = estimation;

    let parsedAttachments: { name: string; url: string }[] = [];
    if (attachments) {
        try {
            const parsed = JSON.parse(attachments);
            if (Array.isArray(parsed)) {
                parsedAttachments = parsed;
            } else {
                parsedAttachments = [{ name: attachments.split('/').pop() || 'Attachment', url: attachments }];
            }
        } catch {
            parsedAttachments = [{ name: attachments.split('/').pop() || 'Attachment', url: attachments }];
        }
    }

    const totalTax = table_qecz.reduce((sum: number, item: any) => sum + (item.tax_amount || 0), 0);
    const subTotal = total_amount + totalTax;
    const discountAmount = overall_discount_type === 'Flat' ? overall_discount : (subTotal * overall_discount) / 100;

    const handlePrint = () => {
        if (id) {
            handleDirectPrint(
                getEstimationPrintUrl(id),
                () => setPrinting(true),
                () => setPrinting(false)
            );
        }
    };

    const handleConvertToInvoice = async () => {
        if (!id) return;
        try {
            setConverting(true);
            const invoiceName = await convertEstimationToInvoice(id);
            router.push(`/invoices/${encodeURIComponent(invoiceName)}/view`, { converted: true });
        } catch (error) {
            console.error('Failed to convert estimation:', error);
            // You might want to add a snackbar here for error notification
        } finally {
            setConverting(false);
            setConfirmOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            await deleteEstimation(id);
            router.push('/estimations');
        } catch (error) {
            console.error('Failed to delete estimation:', error);
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };

    return (
        <DashboardContent maxWidth={false}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={3} className="no-print">
                <Typography variant="h4">Estimation: {id}</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push('/estimations')}
                        startIcon={<IoMdArrowBack size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2.5,
                            '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                borderColor: 'text.primary',
                            }
                        }}
                    >
                        Go Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePrint}
                        startIcon={<IoMdPrint size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#2065D1',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#103996' }
                        }}
                    >
                        Print
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setConfirmOpen(true)}
                        startIcon={<IoMdSwap size={20} />}
                        disabled={converting}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#02c281',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#007850' }
                        }}
                    >
                        {converting ? 'Converting...' : 'Convert to Invoice'}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmDeleteOpen(true)}
                        startIcon={<IoMdTrash size={20} />}
                        sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => router.push(`/estimations/${encodeURIComponent(id || '')}/edit`)}
                        startIcon={<IoMdCreate size={20} />}
                        sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: '#08a3cd',
                            color: 'common.white',
                            '&:hover': { bgcolor: '#068fb3' }
                        }}
                    >
                        Edit
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
                        {/* Customer Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdPerson size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Customer Details</Typography>
                            </Stack>
                            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Typography variant="subtitle1" color="primary.main">{client_name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{billing_address || 'No address provided'}</Typography>
                            </Box>
                        </Stack>

                        {/* Document Logistics Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdCalendar size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Doc Logistics</Typography>
                            </Stack>
                            <Stack spacing={2} sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Date</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{estimate_date}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.disabled">Reference</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>#{id}</Typography>
                                </Stack>
                                {deal && (
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.disabled">Linked Deal</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold', color: 'info.main' }}>{deal}</Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Stack>

                        {/* Summary Stats Section */}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#08a3cd' }}>
                                <IoMdCash size={20} />
                                <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Financial Summary</Typography>
                            </Stack>
                            <Stack spacing={2} sx={{ p: 2, borderRadius: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IoMdWallet size={18} style={{ color: '#7e7e7e' }} />
                                        <Typography variant="caption" color="text.secondary">Grand Total</Typography>
                                    </Stack>
                                    <Typography variant="h6" color="primary.main">{fCurrency(grand_total)}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IoMdCube size={18} style={{ color: '#7e7e7e' }} />
                                        <Typography variant="caption" color="text.secondary">Items / Qty</Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>{table_qecz.length} / {total_qty || 0}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Table Section */}
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, color: '#08a3cd' }}>
                            <IoMdList size={20} />
                            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>Line Items</Typography>
                        </Stack>
                        <TableContainer sx={{
                            overflow: 'unset',
                            border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                            borderRadius: 1.5,
                        }}>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04) }}>
                                        <TableCell sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Service</TableCell>
                                        <TableCell sx={{ fontWeight: 'fontWeightBold', py: 2 }}>HSN</TableCell>
                                        <TableCell sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Description</TableCell>
                                        <TableCell width={60} align="center" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Qty</TableCell>
                                        <TableCell width={100} align="right" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Price</TableCell>
                                        <TableCell width={100} align="right" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Discount</TableCell>
                                        <TableCell width={100} align="right" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Tax Type</TableCell>
                                        <TableCell width={100} align="right" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Tax Amt</TableCell>
                                        <TableCell width={120} align="right" sx={{ fontWeight: 'fontWeightBold', py: 2 }}>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {table_qecz.map((row: any, index: number) => (
                                        <TableRow key={index} sx={{ '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) } }}>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="subtitle2">{row.service}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="body2">{row.hsn_code || '-'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: 200 }}>{row.description}</Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 2 }}>{row.quantity}</TableCell>
                                            <TableCell align="right" sx={{ py: 2 }}>{fCurrency(row.price)}</TableCell>
                                            <TableCell align="right" sx={{ py: 2 }}>
                                                {row.discount > 0 ? (
                                                    <Typography variant="caption" color="success.main">
                                                        -{row.discount_type === 'Flat' ? fCurrency(row.discount) : `${row.discount}%`}
                                                    </Typography>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2 }}>
                                                <Typography variant="caption" color="text.secondary">{row.tax_type || '-'}</Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2 }}>{fCurrency(row.tax_amount)}</TableCell>
                                            <TableCell align="right" sx={{ py: 2 }}>
                                                <Typography variant="subtitle2" color="primary">{fCurrency(row.sub_total)}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    {/* Footer Row */}
                    <Box
                        sx={{
                            display: 'grid',
                            columnGap: 4,
                            rowGap: 3,
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                            alignItems: 'start'
                        }}
                    >
                        {/* Terms, Description & Attachments Group */}
                        <Stack spacing={3}>
                            {description && (
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Scope & Description</Typography>
                                    <Typography variant="body2" sx={{
                                        p: 2,
                                        borderRadius: 1.5,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                        whiteSpace: 'pre-wrap',
                                        minHeight: 80,
                                        color: 'text.secondary'
                                    }}>
                                        {description}
                                    </Typography>
                                </Stack>
                            )}

                            <Stack spacing={1}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Terms & Conditions</Typography>
                                <Typography variant="body2" sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                    whiteSpace: 'pre-wrap',
                                    minHeight: 80
                                }}>
                                    {terms_and_conditions || 'No specific terms provided.'}
                                </Typography>
                            </Stack>

                            {parsedAttachments.length > 0 && (
                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Attachments</Typography>
                                    <Stack spacing={1}>
                                        {parsedAttachments.map((file, index) => (
                                            <Stack
                                                key={index}
                                                direction="row"
                                                alignItems="center"
                                                component="a"
                                                href={file.url}
                                                target="_blank"
                                                sx={{
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 1.5,
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                                                    transition: (theme) => theme.transitions.create(['background-color', 'transform']),
                                                    '&:hover': {
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                        transform: 'translateY(-1px)'
                                                    },
                                                }}
                                            >
                                                <IoMdLink size={18} style={{ marginRight: 8, color: '#08a3cd', flexShrink: 0 }} />
                                                <Typography variant="body2" noWrap sx={{ flexGrow: 1, fontWeight: 'fontWeightMedium' }}>{file.name || file.url.split('/').pop()}</Typography>
                                                <IoMdDownload size={16} style={{ marginLeft: 8, color: '#919EAB' }} />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            )}
                        </Stack>

                        {/* Totals Breakdown */}
                        <Stack spacing={2} sx={{ p: 3, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04), border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <IoMdListBox size={18} style={{ color: '#7e7e7e' }} />
                                    <Typography variant="body2" color="text.secondary">Taxable Amount</Typography>
                                </Stack>
                                <Typography variant="subtitle2">{fCurrency(table_qecz.reduce((sum: number, row: any) => sum + (row.sub_total - row.tax_amount), 0))}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <IoMdCalculator size={18} style={{ color: '#7e7e7e' }} />
                                    <Typography variant="body2" color="text.secondary">Total Tax</Typography>
                                </Stack>
                                <Typography variant="subtitle2" color="error.main">+{fCurrency(totalTax)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <IoMdPricetags size={18} style={{ color: '#7e7e7e' }} />
                                    <Typography variant="body2" color="text.secondary">Discount ({overall_discount_type === 'Flat' ? 'Flat' : `${overall_discount}%`})</Typography>
                                </Stack>
                                <Typography variant="subtitle2" color="success.main">-{fCurrency(discountAmount)}</Typography>
                            </Stack>
                            <Divider sx={{ borderStyle: 'dashed' }} />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <IoMdWallet size={24} style={{ color: '#08a3cd' }} />
                                    <Typography variant="subtitle1" sx={{ color: '#08a3cd' }}>Grand Total</Typography>
                                </Stack>
                                <Typography variant="h5" color="primary.main">{fCurrency(grand_total)}</Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Card >

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => !converting && setConfirmOpen(false)}
                title="Confirm Conversion"
                content="Are you sure you want to convert this estimation into an invoice? This will create a new invoice document."
                action={
                    <Button onClick={handleConvertToInvoice} color="warning" variant="contained" disabled={converting} sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        {converting ? 'Converting...' : 'Confirm'}
                    </Button>
                }
            />

            <ConfirmDialog
                open={confirmDeleteOpen}
                onClose={() => !deleting && setConfirmDeleteOpen(false)}
                title="Confirm Delete"
                content="Are you sure you want to delete this estimation?"
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

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={printing}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </DashboardContent >
    );
}
