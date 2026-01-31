import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

import { fetchInvoices } from 'src/api/invoice';
import { fetchEstimations } from 'src/api/estimation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { UserTableHead as DataTableHead } from '../user/user-table-head';

// ----------------------------------------------------------------------

type Props = {
    dealId: string;
    type: 'invoices' | 'estimations';
};

export function DealRelatedList({ dealId, type }: Props) {
    const theme = useTheme();
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
                    filters: { deal_id: dealId },
                });
            } else if (type === 'estimations') {
                res = await fetchEstimations({
                    page: page + 1,
                    page_size: rowsPerPage,
                    filters: { deal_id: dealId },
                });
            }

            const records = res?.data || [];
            setData(records);
            setTotal(res?.total || 0);

            // Calculate small summary
            const s = records.reduce((acc: any, curr: any) => {
                acc.total += (curr.grand_total || 0);
                acc.paid += (curr.received_amount || 0);
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
    }, [dealId, type, page, rowsPerPage]);

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
        return [
            { id: 'ref_no', label: 'Ref No' },
            { id: 'estimate_date', label: 'Date' },
            { id: 'grand_total', label: 'Total', align: 'right' },
            { id: 'action', label: '' },
        ];
    };

    const getStatusLabel = (row: any) => {
        const balance = row.balance_amount || 0;
        const grandTotal = row.grand_total || 0;
        if (balance === 0 && grandTotal > 0) return <Label variant="soft" color="success">Paid</Label>;
        if (balance > 0 && balance < grandTotal) return <Label variant="soft" color="warning">Partial</Label>;
        return <Label variant="soft" color="error">Unpaid</Label>;
    };

    const handleCreate = () => {
        if (type === 'estimations') {
            router.push(`/estimations/new?deal_id=${dealId}`);
        } else {
            router.push(`/invoices/new?deal_id=${dealId}`);
        }
    };

    const renderRow = (row: any, index: number) => {
        const serialNumber = index + 1 + page * rowsPerPage;

        if (type === 'invoices') {
            return (
                <TableRow key={row.name} hover>
                    <TableCell align="center">{serialNumber}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{row.ref_no}</TableCell>
                    <TableCell>{fDate(row.invoice_date)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fCurrency(row.grand_total)}</TableCell>
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
        return (
            <TableRow key={row.name} hover>
                <TableCell align="center">{serialNumber}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.ref_no}</TableCell>
                <TableCell>{fDate(row.estimate_date)}</TableCell>
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
            {/* Header with New Button */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        flexGrow: 1,
                        gridTemplateColumns: {
                            xs: 'repeat(1, 1fr)',
                            sm: type === 'estimations' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                            md: type === 'estimations' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                        },
                    }}
                >
                    <SummaryCard
                        title="Total Volume"
                        value={fCurrency(summary.total)}
                        icon="solar:wad-of-money-bold"
                        color={theme.palette.primary.main}
                    />

                    {type === 'estimations' ? (
                        <SummaryCard
                            title="Total Count"
                            value={String(total)}
                            icon="solar:document-text-bold"
                            color={theme.palette.info.main}
                        />
                    ) : (
                        <>
                            <SummaryCard
                                title="Total Received"
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

                <Button
                    variant="contained"
                    color={type === 'estimations' ? "info" : "success"}
                    size="small"
                    startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                    onClick={handleCreate}
                    sx={{ height: 40, px: 2, ml: 3 }}
                >
                    New {type === 'estimations' ? 'Estimation' : 'Invoice'}
                </Button>
            </Stack>

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
                    rowsPerPageOptions={[5, 10, 25]}
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
                borderRadius: 2,
                bgcolor: alpha(color, 0.04),
                border: `1px solid ${alpha(color, 0.1)}`,
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1.5,
                    bgcolor: alpha(color, 0.1),
                    color: color,
                }}
            >
                <Iconify icon={icon as any} width={20} />
            </Box>
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}>
                    {title}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
}
