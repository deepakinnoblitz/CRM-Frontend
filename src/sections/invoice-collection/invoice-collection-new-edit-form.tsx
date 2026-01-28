import type {
    InvoiceCollection
} from 'src/api/invoice-collection';

import dayjs from 'dayjs';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

// 2️⃣ MUI Components (sorted alphabetically)
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

import { getInvoice } from 'src/api/invoice';
import { getDoctypeList } from 'src/api/leads';
import {
    createInvoiceCollection,
    updateInvoiceCollection
} from 'src/api/invoice-collection';


// ----------------------------------------------------------------------

type Props = {
    currentInvoiceCollection?: InvoiceCollection;
    onLoadingChange?: (loading: boolean) => void;
};

const InvoiceCollectionNewEditForm = forwardRef(({ currentInvoiceCollection, onLoadingChange }: Props, ref) => {
    const router = useRouter();

    const [invoiceOptions, setInvoiceOptions] = useState<any[]>([]);
    const [paymentTypeOptions, setPaymentTypeOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [formData, setFormData] = useState({
        invoice: '',
        customer: '',
        customer_name: '',
        collection_date: new Date().toISOString().split('T')[0],
        amount_to_pay: 0,
        amount_collected: 0 as number | string,
        amount_pending: 0,
        mode_of_payment: 'Cash',
        remarks: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (currentInvoiceCollection) {
            setFormData({
                invoice: currentInvoiceCollection.invoice || '',
                customer: currentInvoiceCollection.customer || '',
                customer_name: currentInvoiceCollection.customer_name || '',
                collection_date: currentInvoiceCollection.collection_date || '',
                amount_to_pay: currentInvoiceCollection.amount_to_pay || 0,
                amount_collected: currentInvoiceCollection.amount_collected || 0,
                amount_pending: currentInvoiceCollection.amount_pending || 0,
                mode_of_payment: currentInvoiceCollection.mode_of_payment || 'Cash',
                remarks: currentInvoiceCollection.remarks || '',
            });
        }
    }, [currentInvoiceCollection]);

    useEffect(() => {
        getDoctypeList('Invoice', ['name', 'client_name', 'customer_name', 'grand_total']).then((data) => {
            setInvoiceOptions(data);
        });
        getDoctypeList('Payment Type', ['name']).then((data) => {
            setPaymentTypeOptions(data);
        });
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-calculate amount_pending when amount_collected changes
            if (field === 'amount_collected') {
                updated.amount_pending = Math.max(0, (updated.amount_to_pay || 0) - (value || 0));
            }

            return updated;
        });

        // Clear error when field changes
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleInvoiceChange = async (name: string) => {
        handleChange('invoice', name);
        if (name) {
            try {
                const invoiceData = await getInvoice(name);
                const amountToPay = invoiceData.balance_amount || invoiceData.grand_total || 0;
                setFormData(prev => ({
                    ...prev,
                    invoice: name,
                    customer: invoiceData.client_name || invoiceData.customer_id || '',
                    customer_name: invoiceData.customer_name || '',
                    amount_to_pay: amountToPay,
                    amount_pending: amountToPay, // Initially, pending = amount to pay
                }));
            } catch (error) {
                console.error("Failed to fetch invoice details", error);
            }
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        const normalizedAmount = Number(formData.amount_collected);

        // Mandatory Field Validations
        if (!formData.invoice) {
            newErrors.invoice = 'Invoice is required';
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
            if (currentInvoiceCollection) {
                await updateInvoiceCollection(currentInvoiceCollection.name, submissionData);
                setSnackbar({ open: true, message: 'Update success!', severity: 'success' });
            } else {
                await createInvoiceCollection(submissionData);
                setSnackbar({ open: true, message: 'Create success!', severity: 'success' });
            }
            setTimeout(() => router.push('/invoices?tab=collections'), 1500);
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || 'Something went wrong', severity: 'error' });
            console.error(error);
        } finally {
            setLoading(false);
            onLoadingChange?.(false);
        }
    };

    // Expose handleSubmit method to parent component
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
                    rowGap={3}
                    columnGap={3}
                    display="grid"
                    gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                    }}
                >
                    <Autocomplete
                        options={invoiceOptions}
                        getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} - ${option.customer_name}`}
                        value={invoiceOptions.find(opt => opt.name === formData.invoice) || null}
                        onChange={(_, newValue) => handleInvoiceChange(newValue?.name || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Invoice"
                                disabled={!!currentInvoiceCollection}
                                error={!!errors.invoice}
                                helperText={errors.invoice}
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
                        label="Customer ID"
                        value={formData.customer}
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Customer Name"
                        value={formData.customer_name}
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

export default InvoiceCollectionNewEditForm;
