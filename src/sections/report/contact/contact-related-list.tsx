import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { fetchDeals } from 'src/api/deals';
import { fetchInvoices } from 'src/api/invoice';
import { fetchPurchases } from 'src/api/purchase';
import { fetchEstimations } from 'src/api/estimation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { LeadTableHead as DataTableHead } from '../../lead/lead-table-head';

// ----------------------------------------------------------------------

type Props = {
    contactId: string;
    type: 'invoices' | 'purchases' | 'deals' | 'estimations';
};

export function ContactRelatedList({ contactId, type }: Props) {
    const theme = useTheme();
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [summary, setSummary] = useState({
        total: 0,
        paid: 0,
        balance: 0,
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            let res: any;
            if (type === 'invoices') {
                res = await fetchInvoices({
                    page: page + 1,
                    page_size: rowsPerPage,
                    filters: { client_name: contactId },
                });
            } else if (type === 'purchases') {
                res = await fetchPurchases({
                    page: page + 1,
                    page_size: rowsPerPage,
                    filterValues: { vendor_name: contactId },
                });
            } else if (type === 'deals') {
                res = await fetchDeals({
                    page: page + 1,
                    page_size: rowsPerPage,
                    filterValues: { contact: contactId },
                });
            } else if (type === 'estimations') {
                res = await fetchEstimations({
                    page: page + 1,
                    page_size: rowsPerPage,
                    filters: { client_name: contactId },
                });
            }

            const records = res?.data || [];
            setData(records);
            setTotal(res?.total || 0);

            // Calculate small summary
            const s = records.reduce((acc: any, curr: any) => {
                acc.total += (curr.grand_total || curr.value || 0);
                acc.paid += (curr.received_amount || curr.paid_amount || 0);
                acc.balance += (curr.balance_amount || 0);
                return acc;
            }, { total: 0, paid: 0, balance: 0 });

            setSummary(s);

        } catch (error) {
            console.error(`Failed to fetch ${type}:`, error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [contactId, type, page, rowsPerPage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getHeadLabel = () => {
        if (type === 'invoices') {
            return [
                { id: 'ref_no', label: 'Ref No' },
                { id: 'invoice_date', label: 'Date' },
                { id: 'grand_total', label: 'Total', align: 'right' },
                { id: 'received_amount', label: 'Received', align: 'right' },
                { id: 'balance_amount', label: 'Balance', align: 'right' },
                { id: 'action', label: '' },
            ];
        }
        if (type === 'purchases') {
            return [
                { id: 'bill_no', label: 'Bill No' },
                { id: 'bill_date', label: 'Date' },
                { id: 'grand_total', label: 'Total', align: 'right' },
                { id: 'paid_amount', label: 'Paid', align: 'right' },
                { id: 'balance_amount', label: 'Balance', align: 'right' },
                { id: 'action', label: '' },
            ];
        }
        if (type === 'deals') {
            return [
                { id: 'deal_title', label: 'Title' },
                { id: 'stage', label: 'Stage', align: 'center' },
                { id: 'expected_close_date', label: 'Expected Close' },
                { id: 'action', label: '' },
            ];
        }
        return [
            { id: 'ref_no', label: 'Ref No' },
            { id: 'estimate_date', label: 'Date' },
            { id: 'grand_total', label: 'Total', align: 'right' },
            { id: 'action', label: '' },
        ];
    };

    const getStatusLabel = (row: any) => {
        if (type === 'deals') {
            const stage = row.stage;
            let color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' = 'default';
            if (stage === 'Closed Won') color = 'success';
            if (stage === 'Closed Lost') color = 'error';
            if (['Proposal Sent', 'Negotiation'].includes(stage)) color = 'warning';
            return <Label variant="soft" color={color}>{stage}</Label>;
        }

        const balance = row.balance_amount || 0;
        const grandTotal = row.grand_total || 0;
        if (balance === 0 && grandTotal > 0) return <Label variant="soft" color="success">Paid</Label>;
        if (balance > 0 && balance < grandTotal) return <Label variant="soft" color="warning">Partial</Label>;
        return <Label variant="soft" color="error">Unpaid</Label>;
    };

    const renderRow = (row: any, index: number) => {
        const serialNumber = index + 1 + page * rowsPerPage;

        const renderSNoCell = () => (
            <TableCell align="center">
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (themeVar) => alpha(themeVar.palette.primary.main, 0.08),
                        color: 'primary.main',
                        typography: 'subtitle2',
                        fontWeight: 800,
                        border: (themeVar) => `1px solid ${alpha(themeVar.palette.primary.main, 0.16)}`,
                        mx: 'auto',
                        transition: (themeVar) => themeVar.transitions.create(['all'], { duration: themeVar.transitions.duration.shorter }),
                        '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            transform: 'scale(1.1)',
                        },
                    }}
                >
                    {serialNumber}
                </Box>
            </TableCell>
        );

        if (type === 'invoices') {
            return (
                <TableRow key={row.name} hover>
                    {renderSNoCell()}
                    <TableCell sx={{ fontWeight: 700 }}>{row.ref_no}</TableCell>
                    <TableCell>{row.invoice_date ? fDate(row.invoice_date) : '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600}}>{fCurrency(row.grand_total)}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>{fCurrency(row.received_amount)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>{fCurrency(row.balance_amount)}</TableCell>
                    <TableCell align="right">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/invoices/${encodeURIComponent(row.name)}/view`)}
                            size="small"
                        >
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>
                    </TableCell>
                </TableRow>
            );
        }
        if (type === 'purchases') {
            return (
                <TableRow key={row.name} hover>
                    {renderSNoCell()}
                    <TableCell sx={{ fontWeight: 700 }}>{row.bill_no}</TableCell>
                    <TableCell>{row.bill_date ? fDate(row.bill_date) : '-'}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fCurrency(row.grand_total)}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>{fCurrency(row.paid_amount)}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>{fCurrency(row.balance_amount)}</TableCell>
                    <TableCell align="right">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/purchase/${encodeURIComponent(row.name)}`)}
                            size="small"
                        >
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>
                    </TableCell>
                </TableRow>
            );
        }
        if (type === 'deals') {
            return (
                <TableRow key={row.name} hover>
                    {renderSNoCell()}
                    <TableCell sx={{ fontWeight: 700 }}>{row.deal_title}</TableCell>
                    <TableCell align="center">{getStatusLabel(row)}</TableCell>
                    <TableCell>{row.expected_close_date ? fDate(row.expected_close_date) : '-'}</TableCell>
                    <TableCell align="right">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/deals`)}
                            size="small"
                        >
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>
                    </TableCell>
                </TableRow>
            );
        }
        return (
            <TableRow key={row.name} hover>
                {renderSNoCell()}
                <TableCell sx={{ fontWeight: 700 }}>{row.ref_no}</TableCell>
                <TableCell>{row.estimate_date ? fDate(row.estimate_date) : '-'}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{fCurrency(row.grand_total)}</TableCell>
                <TableCell align="right">
                    <IconButton
                        color="primary"
                        onClick={() => router.push(`/estimations/${encodeURIComponent(row.name)}/view`)}
                        size="small"
                    >
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Stack spacing={3}>
            {/* Analytics Summary */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        sm: type === 'deals' ? 'repeat(3, 1fr)' : (['estimations'].includes(type) ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'),
                        md: 'repeat(3, 1fr)',
                    },
                }}
            >
                {type !== 'deals' && (
                    <SummaryCard
                        title="Total Volume"
                        value={fCurrency(summary.total)}
                        icon="solar:wad-of-money-bold"
                        color={theme.palette.primary.main}
                    />
                )}

                {['estimations', 'deals'].includes(type) ? (
                    <SummaryCard
                        title="Total Count"
                        value={String(total)}
                        icon={type === 'deals' ? "solar:hand-stars-bold" : "solar:document-text-bold"}
                        color={theme.palette.info.main}
                    />
                ) : (
                    <>
                        <SummaryCard
                            title={type === 'purchases' ? "Total Paid" : "Total Received"}
                            value={fCurrency(summary.paid)}
                            icon="solar:check-circle-bold"
                            color={theme.palette.success.main}
                        />

                        <SummaryCard
                            title="Outstanding"
                            value={fCurrency(summary.balance)}
                            icon="solar:info-circle-bold"
                            color={theme.palette.error.main}
                        />
                    </>
                )}
            </Box>

            <Card sx={{ border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`, borderRadius: 1.5 }}>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    <Scrollbar>
                        <Table size="medium" sx={{ minWidth: 700 }}>
                            <DataTableHead
                                rowCount={total}
                                numSelected={0}
                                headLabel={getHeadLabel()}
                                onSelectAllRows={() => { }}
                                hideCheckbox
                                showIndex
                            />
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={36} />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {data.map((row, index) => renderRow(row, index))}
                                        {data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={10}>
                                                    <EmptyContent
                                                        title={`No ${type} available`}
                                                        sx={{ py: 6 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[10, 25, 50]}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: `1px solid ${alpha(theme.palette.grey[500], 0.12)}` }}
                />
            </Card>
        </Stack>
    );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
                p: 2,
                pl: 1.5,
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: alpha(color, 0.04),
                border: `1px solid ${alpha(color, 0.1)}`,
            }}
        >
            {/* Decorative circle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -24,
                    right: -24,
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    bgcolor: alpha(color, 0.08),
                    zIndex: 0,
                }}
            />
            
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(color, 0.12),
                    color,
                    zIndex: 1,
                }}
            >
                <Iconify icon={icon as any} width={28} />
            </Box>
            <Box sx={{ zIndex: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}
