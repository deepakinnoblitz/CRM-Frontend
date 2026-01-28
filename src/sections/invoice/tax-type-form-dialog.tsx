import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { createTaxType } from 'src/api/invoice';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: (newTax: any) => void;
    initialName?: string;
};

export function TaxTypeFormDialog({ open, onClose, onSuccess, initialName = '' }: Props) {
    const [taxName, setTaxName] = useState(initialName);
    const [taxPercentage, setTaxPercentage] = useState<number>(0);
    const [taxType, setTaxType] = useState('GST'); // Default to IGST
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!taxName) {
            setError('Tax Name is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = {
                tax_name: taxName,
                tax_percentage: taxPercentage,
                tax_type: taxType,
            };
            const result = await createTaxType(data);
            onSuccess(result);
            onClose();
            // Reset form
            setTaxName('');
            setTaxPercentage(0);
            setTaxType('IGST');
        } catch (err: any) {
            setError(err.message || 'Failed to create tax type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Create New Tax Type</DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <TextField
                    fullWidth
                    label="Tax Name"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    margin="normal"
                    error={!!error && !taxName}
                    placeholder="e.g. GST@18%"
                />

                <TextField
                    fullWidth
                    type="number"
                    label="Tax Percentage"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                />

                <TextField
                    fullWidth
                    select
                    label="Tax Type"
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    margin="normal"
                >
                    {['GST', 'IGST'].map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                {error && (
                    <DialogContent sx={{ color: 'error.main', typography: 'caption', px: 0, pb: 0 }}>
                        {error}
                    </DialogContent>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
