import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';
import { getPurchase, createPurchase, updatePurchase, getDoctypeList } from 'src/api/purchase';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    id?: string;
};

export function PurchaseForm({ id }: Props) {
    const router = useRouter();

    const [vendorOptions, setVendorOptions] = useState<{ name: string; first_name: string; company_name: string }[]>([]);
    const [itemOptions, setItemOptions] = useState<any[]>([]);

    const paymentTypeOptions = ['Bank Transfer', 'Cash', 'Credit Card', 'Debit Card', 'E-coins'];

    const [formData, setFormData] = useState<{
        vendor_name: string;
        vendor_id: string;
        bill_no: string;
        bill_date: string;
        payment_type: string;
        payment_terms: string;
        due_date: string;
        description: string;
        items: any[];
        total_qty: number;
        total_amount: number;
        overall_discount_type: string;
        overall_discount: number;
        grand_total: number;
        paid_amount: number;
    }>({
        vendor_name: '',
        vendor_id: '',
        bill_no: '',
        bill_date: '',
        payment_type: '',
        payment_terms: '',
        due_date: '',
        description: '',
        items: [],
        total_qty: 0,
        total_amount: 0,
        overall_discount_type: '',
        overall_discount: 0,
        grand_total: 0,
        paid_amount: 0
    });

    const fetchData = useCallback(async () => {
        try {
            const [vendors, items, services] = await Promise.all([
                getDoctypeList('Contacts', ['name', 'first_name', 'company_name']),
                getDoctypeList('Item', ['item_code', 'item_name', 'rate']),
                getDoctypeList('Service', ['service_id', 'service_name'])
            ]);
            setVendorOptions(vendors);

            // Merge Item and Service lists for the items table
            const combinedItems = [
                ...items.map((i: any) => ({ ...i, display_name: i.item_name || i.item_code })),
                ...services.map((s: any) => ({
                    item_code: s.service_name,
                    item_name: s.service_name,
                    rate: 0,
                    display_name: s.service_name
                }))
            ];
            setItemOptions(combinedItems);

            if (id) {
                const purchase = await getPurchase(id);
                setFormData({
                    vendor_name: purchase.vendor_name || '',
                    vendor_id: purchase.vendor_id || '',
                    bill_no: purchase.bill_no || '',
                    bill_date: purchase.bill_date || '',
                    payment_type: purchase.payment_type || '',
                    payment_terms: purchase.payment_terms || '',
                    due_date: purchase.due_date || '',
                    description: purchase.description || '',
                    items: purchase.table_qecz || [],
                    total_qty: purchase.total_qty || 0,
                    total_amount: purchase.total_amount || 0,
                    overall_discount_type: purchase.overall_discount_type || '',
                    overall_discount: purchase.overall_discount || 0,
                    grand_total: purchase.grand_total || 0,
                    paid_amount: purchase.paid_amount || 0
                });
            }
        } catch (error) {
            console.error(error);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const calculateTotals = (items: any[], overallDiscount: number, overallDiscountType: string) => {
        let totalQty = 0;
        let totalAmount = 0;

        items.forEach(item => {
            totalQty += Number(item.quantity || 0);

            const qty = Number(item.quantity || 0);
            const price = Number(item.price || 0);
            const discount = Number(item.discount || 0);
            let subTotal = qty * price;

            if (item.discount_type === 'Percentage') {
                subTotal -= subTotal * (discount / 100);
            } else {
                subTotal -= discount;
            }

            item.sub_total = subTotal;
            totalAmount += subTotal;
        });

        let grandTotal = totalAmount;
        if (overallDiscountType === 'Percentage') {
            grandTotal -= grandTotal * (overallDiscount / 100);
        } else {
            grandTotal -= overallDiscount;
        }

        return { totalQty, totalAmount, grandTotal };
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    service: '',
                    hsn_code: '',
                    description: '',
                    quantity: 1,
                    price: 0,
                    discount_type: '',
                    discount: 0,
                    tax_type: '',
                    tax_amount: 0,
                    sub_total: 0
                }
            ]
        }));
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        const { totalQty, totalAmount, grandTotal } = calculateTotals(newItems, formData.overall_discount, formData.overall_discount_type);
        setFormData({ ...formData, items: newItems, total_qty: totalQty, total_amount: totalAmount, grand_total: grandTotal });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        const { totalQty, totalAmount, grandTotal } = calculateTotals(newItems, formData.overall_discount, formData.overall_discount_type);
        setFormData({ ...formData, items: newItems, total_qty: totalQty, total_amount: totalAmount, grand_total: grandTotal });
    };

    const handleOverallDiscountChange = (field: string, value: any) => {
        const { totalQty, totalAmount, grandTotal } = calculateTotals(formData.items, field === 'overall_discount' ? value : formData.overall_discount, field === 'overall_discount_type' ? value : formData.overall_discount_type);
        setFormData({ ...formData, [field]: value, total_qty: totalQty, total_amount: totalAmount, grand_total: grandTotal });
    };

    const handleSubmit = async () => {
        try {
            if (id) {
                await updatePurchase(id, formData);
            } else {
                await createPurchase(formData);
            }
            router.push('/purchase');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <DashboardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4">{id ? 'Edit Purchase' : 'New Purchase'}</Typography>
                <Button variant="outlined" color="inherit" onClick={() => router.push('/purchase')}>
                    Back to List
                </Button>
            </Stack>

            <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ gridColumn: '1 / -1', mb: 1 }}>Purchase Details</Typography>

                    <Autocomplete
                        fullWidth
                        options={vendorOptions}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option.name || '';
                        }}
                        value={
                            vendorOptions.find((opt) => opt.name === formData.vendor_name) ||
                            (formData.vendor_name ? { name: formData.vendor_name, first_name: formData.vendor_name, company_name: '' } : null)
                        }
                        onChange={(event, newValue) => {
                            if (newValue && typeof newValue !== 'string') {
                                setFormData({
                                    ...formData,
                                    vendor_name: newValue.name || '',
                                    vendor_id: newValue.name || ''
                                });
                            } else {
                                setFormData({
                                    ...formData,
                                    vendor_name: '',
                                    vendor_id: ''
                                });
                            }
                        }}
                        renderInput={(params) => <TextField {...params} label="Vendor Name" />}
                    />

                    <TextField
                        fullWidth
                        label="Bill No"
                        value={formData.bill_no}
                        onChange={(e) => setFormData({ ...formData, bill_no: e.target.value })}
                    />

                    <TextField
                        fullWidth
                        label="Bill Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.bill_date}
                        onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                    />

                    <TextField
                        fullWidth
                        label="Payment Terms"
                        select
                        value={formData.payment_terms}
                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    >
                        {['Next day Payment', 'Due On Receipt', '15 days', '30 days', '60 days', '1 Year'].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Payment Type"
                        select
                        value={formData.payment_type}
                        onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    >
                        {paymentTypeOptions.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label="Due Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />

                    <TextField
                        fullWidth
                        label="Purchase Status"
                        value="Pending"
                        disabled
                        sx={{ gridColumn: '1 / -1' }}
                    />

                    <Typography variant="h6" sx={{ gridColumn: '1 / -1', mt: 2 }}>Items</Typography>

                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <Scrollbar>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Qty</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Discount</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell sx={{ minWidth: 250 }}>
                                                    <Autocomplete
                                                        fullWidth
                                                        size="small"
                                                        options={itemOptions as any[]}
                                                        getOptionLabel={(option: any) => {
                                                            if (typeof option === 'string') return option;
                                                            return option.display_name || option.item_name || option.item_code || '';
                                                        }}
                                                        value={
                                                            (itemOptions as any[]).find((opt) => opt.item_code === item.service) ||
                                                            (item.service ? { item_code: item.service, item_name: item.service, display_name: item.service } : null)
                                                        }
                                                        onChange={(event, newValue: any) => {
                                                            const newItems = [...formData.items];
                                                            if (newValue) {
                                                                newItems[index] = {
                                                                    ...newItems[index],
                                                                    service: newValue.item_code,
                                                                    price: newValue.rate || 0
                                                                };
                                                            } else {
                                                                newItems[index] = {
                                                                    ...newItems[index],
                                                                    service: '',
                                                                    price: 0
                                                                };
                                                            }
                                                            const { totalQty, totalAmount, grandTotal } = calculateTotals(newItems, formData.overall_discount, formData.overall_discount_type);
                                                            setFormData({ ...formData, items: newItems, total_qty: totalQty, total_amount: totalAmount, grand_total: grandTotal });
                                                        }}
                                                        renderInput={(params) => <TextField {...params} label="Service" />}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 100 }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 120 }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ minWidth: 200 }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <TextField
                                                            select
                                                            size="small"
                                                            value={item.discount_type || ''}
                                                            onChange={(e) => handleItemChange(index, 'discount_type', e.target.value)}
                                                            label="Type"
                                                            sx={{ minWidth: 80 }}
                                                        >
                                                            <MenuItem value="Flat">Flat</MenuItem>
                                                            <MenuItem value="Percentage">%</MenuItem>
                                                        </TextField>
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.discount}
                                                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                                            label="Value"
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{item.sub_total}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => handleRemoveItem(index)}>
                                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Scrollbar>
                        <Button startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleAddItem} sx={{ mt: 1 }}>
                            Add Row
                        </Button>
                    </Box>

                    <Box sx={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Add Files</Typography>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Iconify icon="mingcute:add-line" />}
                                >
                                    Attach
                                    <input type="file" hidden />
                                </Button>
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Total Amount"
                                value={formData.total_amount}
                                disabled
                            />
                            <TextField
                                fullWidth
                                label="Total Quantity"
                                value={formData.total_qty}
                                disabled
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Overall Discount Type"
                                    value={formData.overall_discount_type}
                                    onChange={(e) => handleOverallDiscountChange('overall_discount_type', e.target.value)}
                                >
                                    <MenuItem value="Flat">Flat</MenuItem>
                                    <MenuItem value="Percentage">Percentage</MenuItem>
                                </TextField>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Overall Discount"
                                    value={formData.overall_discount}
                                    onChange={(e) => handleOverallDiscountChange('overall_discount', e.target.value)}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Grand Total"
                                value={formData.grand_total}
                                disabled
                            />
                            <TextField
                                fullWidth
                                label="Paid Amount"
                                type="number"
                                value={formData.paid_amount}
                                onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                            />
                            <TextField
                                fullWidth
                                label="Balance Amount"
                                value={formData.grand_total - (formData.paid_amount || 0)}
                                disabled
                            />
                        </Box>
                    </Box>
                </Box>

                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                    <Button onClick={() => router.push('/purchase')}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" size="large">
                        {id ? 'Update Purchase' : 'Create Purchase'}
                    </Button>
                </Stack>
            </Card>
        </DashboardContent>
    );
}