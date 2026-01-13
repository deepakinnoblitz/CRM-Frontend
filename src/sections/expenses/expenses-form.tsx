import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { getExpense, createExpense, updateExpense, getDoctypeList } from 'src/api/expenses';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ItemRow = {
    items: string;
    quantity: number;
    price: number;
    amount: number;
};

type Props = {
    id?: string;
};

export function ExpenseForm({ id }: Props) {
    const router = useRouter();

    const [paymentTypeOptions, setPaymentTypeOptions] = useState<any[]>([]);

    const [expenseNo, setExpenseNo] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentType, setPaymentType] = useState('');
    const [description, setDescription] = useState('');

    const [items, setItems] = useState<ItemRow[]>([
        {
            items: '',
            quantity: 1,
            price: 0,
            amount: 0,
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        getDoctypeList('Payment Type', ['name', 'payment_type'])
            .then(setPaymentTypeOptions)
            .catch((error) => console.error('Failed to load Payment Type data:', error));

        if (id) {
            getExpense(id)
                .then((expense) => {
                    setExpenseNo(expense.expense_no || '');
                    setExpenseCategory(expense.expense_category || '');
                    setDate(expense.date || '');
                    setPaymentType(expense.payment_type || '');
                    setDescription(expense.description || '');
                    setItems(expense.table_qecz || []);
                })
                .catch((error) => console.error('Failed to fetch expense:', error));
        }
    }, [id]);

    const handleAddRow = () => {
        setItems([
            ...items,
            {
                items: '',
                quantity: 1,
                price: 0,
                amount: 0,
            },
        ]);
    };

    const handleRemoveRow = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Calculate amount
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        item.amount = qty * price;

        newItems[index] = item;
        setItems(newItems);
    };

    const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const grandTotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const handleSave = async () => {
        if (!expenseCategory) {
            setSnackbar({ open: true, message: 'Please enter expense category', severity: 'error' });
            return;
        }

        if (!date) {
            setSnackbar({ open: true, message: 'Please select a date', severity: 'error' });
            return;
        }

        const validItems = items.filter((item) => item.items !== '');
        if (validItems.length === 0) {
            setSnackbar({ open: true, message: 'Please add at least one item', severity: 'error' });
            return;
        }

        try {
            setLoading(true);
            const expenseData = {
                expense_category: expenseCategory,
                date,
                payment_type: paymentType,
                description,
                table_qecz: validItems,
                total: grandTotal,
            };

            if (id) {
                await updateExpense(id, expenseData);
                setSnackbar({ open: true, message: 'Expense updated successfully', severity: 'success' });
            } else {
                await createExpense({ ...expenseData, expense_no: `EXP-${Date.now()}` });
                setSnackbar({ open: true, message: 'Expense created successfully', severity: 'success' });
            }
            setTimeout(() => router.push('/expenses'), 1500);
        } catch (err: any) {
            console.error(err);
            setSnackbar({ open: true, message: err.message || 'Failed to save expense', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/expenses');
    };

    return (
        <DashboardContent maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">{id ? 'Edit Expense' : 'New Expense'}</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="inherit" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : id ? 'Update Expense' : 'Save Expense'}
                    </Button>
                </Stack>
            </Stack>

            <Card sx={{ p: 4 }}>
                <Box
                    sx={{
                        display: 'grid',
                        columnGap: 3,
                        rowGap: 3,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                    }}
                >
                    {id && (
                        <TextField
                            fullWidth
                            label="Expense No"
                            value={expenseNo}
                            InputProps={{ readOnly: true }}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Expense Category"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        required
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={dayjs(date)}
                            onChange={(newValue) => setDate(newValue?.format('YYYY-MM-DD') || '')}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                },
                            }}
                        />
                    </LocalizationProvider>

                    <TextField
                        fullWidth
                        select
                        label="Payment Type"
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        required
                    >
                        {paymentTypeOptions.map((opt) => (
                            <MenuItem key={opt.name} value={opt.name}>
                                {opt.payment_type || opt.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Items
                </Typography>

                <TableContainer sx={{
                    overflow: 'unset',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    boxShadow: (theme) => theme.customShadows.z8,
                }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08) }}>
                            <TableRow>
                                <TableCell sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5, fontWeight: 'fontWeightSemiBold' }}>Items</TableCell>
                                <TableCell width={120} align="right" sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5, fontWeight: 'fontWeightSemiBold' }}>Qty</TableCell>
                                <TableCell width={150} align="right" sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5, fontWeight: 'fontWeightSemiBold' }}>Price</TableCell>
                                <TableCell width={150} align="right" sx={{ borderRight: (theme) => `1px solid ${theme.palette.divider}`, py: 1.5, fontWeight: 'fontWeightSemiBold' }}>Amount</TableCell>
                                <TableCell width={60} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        verticalAlign: 'top',
                                        transition: (theme) => theme.transitions.create('background-color'),
                                        '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) },
                                        '&:nth-of-type(even)': { bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02) },
                                    }}
                                >
                                    <TableCell sx={{ px: 1, py: 1, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="standard"
                                            value={row.items}
                                            onChange={(e) => handleItemChange(index, 'items', e.target.value)}
                                            placeholder="Item description"
                                            InputProps={{ disableUnderline: true, sx: { typography: 'body2' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ px: 1, py: 1, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            variant="standard"
                                            value={row.quantity === 0 ? '' : row.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            onFocus={(e) => e.target.select()}
                                            inputProps={{ sx: { textAlign: 'right', typography: 'body2', px: 0 } }}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ px: 1, py: 1, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            variant="standard"
                                            value={row.price === 0 ? '' : row.price}
                                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                            onFocus={(e) => e.target.select()}
                                            inputProps={{ sx: { textAlign: 'right', typography: 'body2', px: 0 } }}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ px: 1, py: 1, borderRight: (theme) => `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="subtitle2" color="primary.main">{fCurrency(row.amount)}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ px: 1, py: 1 }}>
                                        <IconButton color="error" onClick={() => handleRemoveRow(index)} size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                                            <Iconify icon="solar:trash-bin-trash-bold" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Button
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={handleAddRow}
                    sx={{ mt: 2 }}
                >
                    Add Item
                </Button>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ maxWidth: 500 }}
                    />

                    <Stack spacing={2} sx={{ width: 400, mt: 3 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify icon={"solar:box-bold-duotone" as any} sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">Total Quantity</Typography>
                            </Stack>
                            <Typography variant="subtitle2" sx={{ width: 120, textAlign: 'right' }}>{totalQty}</Typography>
                        </Stack>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Grand Total</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>{fCurrency(grandTotal)}</Typography>
                        </Stack>
                    </Stack>
                </Box>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
        </DashboardContent>
    );
}
