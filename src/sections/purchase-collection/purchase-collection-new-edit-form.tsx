import type { PurchaseCollection } from 'src/api/purchase-collection';

import dayjs from 'dayjs';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useRouter } from 'src/routes/hooks';

import { getPurchase } from 'src/api/purchase';
import { getDoc, getDoctypeList } from 'src/api/leads';
import { createPurchaseCollection, updatePurchaseCollection } from 'src/api/purchase-collection';

// ----------------------------------------------------------------------

type Props = {
    currentPurchaseCollection?: PurchaseCollection;
    onLoadingChange?: (loading: boolean) => void;
};

const PurchaseCollectionNewEditForm = forwardRef(({ currentPurchaseCollection, onLoadingChange }: Props, ref) => {
    const router = useRouter();

    const [purchaseOptions, setPurchaseOptions] = useState<any[]>([]);
    const [paymentTypeOptions, setPaymentTypeOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [formData, setFormData] = useState({
        purchase: '',
        vendor: '',
        vendor_name: '',
        collection_date: new Date().toISOString().split('T')[0],
        amount_to_pay: 0,
        amount_collected: 0 as number | string,
        amount_pending: 0,
        mode_of_payment: 'Cash',
        remarks: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (currentPurchaseCollection) {
            setFormData({
                purchase: currentPurchaseCollection.purchase || '',
                vendor: currentPurchaseCollection.vendor || '',
                vendor_name: currentPurchaseCollection.vendor_name || '',
                collection_date: currentPurchaseCollection.collection_date || '',
                amount_to_pay: currentPurchaseCollection.amount_to_pay || 0,
                amount_collected: currentPurchaseCollection.amount_collected || 0,
                amount_pending: currentPurchaseCollection.amount_pending || 0,
                mode_of_payment: currentPurchaseCollection.mode_of_payment || 'Cash',
                remarks: currentPurchaseCollection.remarks || '',
            });
        }
    }, [currentPurchaseCollection]);

    useEffect(() => {
        getDoctypeList('Purchase', ['name', 'vendor_name', 'grand_total', 'balance_amount']).then((data) => {
            setPurchaseOptions(data);
        });
        getDoctypeList('Payment Type', ['name']).then((data) => {
            setPaymentTypeOptions(data);
        });
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            if (field === 'amount_collected') {
                updated.amount_pending = Math.max(0, (updated.amount_to_pay || 0) - (Number(value) || 0));
            }

            return updated;
        });

        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handlePurchaseChange = async (name: string) => {
        handleChange('purchase', name);
        if (name) {
            try {
                const purchaseData = await getPurchase(name);
                const amountToPay = purchaseData.balance_amount || purchaseData.grand_total || 0;

                // Fetch real vendor name from Contacts since purchaseData.vendor_name is just the ID
                let vendorRealName = '';
                if (purchaseData.vendor_name) {
                    const contactData = await getDoc('Contacts', purchaseData.vendor_name);
                    vendorRealName = contactData.first_name || '';
                }

                setFormData(prev => ({
                    ...prev,
                    purchase: name,
                    vendor: purchaseData.vendor_name || '',
                    vendor_name: vendorRealName,
                    amount_to_pay: amountToPay,
                    amount_pending: Math.max(0, amountToPay - (Number(prev.amount_collected) || 0)),
                }));
            } catch (error) {
                console.error("Failed to fetch purchase details", error);
            }
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        const normalizedAmount = Number(formData.amount_collected);

        if (!formData.purchase) {
            newErrors.purchase = 'Purchase is required';
        }
        if (!formData.collection_date) {
            newErrors.collection_date = 'Collection Date is required';
        }
        if (!formData.mode_of_payment) {
            newErrors.mode_of_payment = 'Mode of Payment is required';
        }
        if (!formData.amount_collected || normalizedAmount <= 0) {
            newErrors.amount_collected = 'Amount Collected must be greater than zero';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSnackbar({ open: true, message: 'Please fill in all mandatory fields', severity: 'error' });
            return;
        }

        const submissionData = {
            ...formData,
            amount_collected: normalizedAmount,
        };

        try {
            setLoading(true);
            onLoadingChange?.(true);
            if (currentPurchaseCollection) {
                await updatePurchaseCollection(currentPurchaseCollection.name, submissionData);
                setSnackbar({ open: true, message: 'Update success!', severity: 'success' });
            } else {
                await createPurchaseCollection(submissionData);
                setSnackbar({ open: true, message: 'Create success!', severity: 'success' });
            }
            setTimeout(() => router.push('/purchase?tab=collections'), 1500);
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Something went wrong', severity: 'error' });
            console.error(error);
        } finally {
            setLoading(false);
            onLoadingChange?.(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSubmit,
    }));

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Card sx={{ p: 3 }}>
                <Box
                    display="grid"
                    columnGap={3}
                    rowGap={3}
                    gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                >
                    <Autocomplete
                        fullWidth
                        options={purchaseOptions}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option.name || '';
                        }}
                        value={purchaseOptions.find((opt) => opt.name === formData.purchase) || null}
                        onChange={(_e, newValue) => handlePurchaseChange(newValue?.name || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Purchase"
                                disabled={!!currentPurchaseCollection}
                                error={!!errors.purchase}
                                helperText={errors.purchase}
                                required
                            />
                        )}
                    />

                    <DatePicker
                        label="Collection Date"
                        value={dayjs(formData.collection_date)}
                        onChange={(newValue) => handleChange('collection_date', newValue?.format('YYYY-MM-DD') || '')}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!errors.collection_date,
                                helperText: errors.collection_date,
                                required: true,
                            },
                        }}
                    />

                    <TextField
                        label="Vendor ID"
                        value={formData.vendor}
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Vendor Name"
                        value={formData.vendor_name}
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Amount to Pay"
                        type="number"
                        value={formData.amount_to_pay}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            readOnly: true,
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Amount Collected"
                        type="number"
                        value={formData.amount_collected}
                        onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            handleChange('amount_collected', val);
                        }}
                        onFocus={(e) => {
                            if (formData.amount_collected === 0) {
                                handleChange('amount_collected', '');
                            } else {
                                e.target.select();
                            }
                        }}
                        onBlur={(e) => {
                            if (formData.amount_collected === '' || formData.amount_collected === null) {
                                handleChange('amount_collected', 0);
                            }
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                        error={!!errors.amount_collected}
                        helperText={errors.amount_collected}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Amount Pending"
                        type="number"
                        value={formData.amount_pending}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            readOnly: true,
                        }}
                        sx={{
                            '& .MuiInputBase-input': {
                                color: formData.amount_pending > 0 ? '#ff5630' : '#36b37e',
                            }
                        }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Mode of Payment"
                        value={formData.mode_of_payment}
                        onChange={(e) => handleChange('mode_of_payment', e.target.value)}
                        error={!!errors.mode_of_payment}
                        helperText={errors.mode_of_payment}
                        required
                    >
                        {paymentTypeOptions.map((option) => (
                            <MenuItem key={option.name} value={option.name}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Remarks"
                        multiline
                        rows={3}
                        value={formData.remarks}
                        onChange={(e) => handleChange('remarks', e.target.value)}
                        sx={{ gridColumn: { sm: 'span 2' } }}
                    />
                </Box>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </LocalizationProvider>
    );
});

export default PurchaseCollectionNewEditForm;
