import type { BankAccount } from 'src/api/masters';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { getBankAccount, createBankAccount, updateBankAccount } from 'src/api/masters';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ACCOUNT_TYPES = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'Salary Account', label: 'Salary Account' },
  { value: 'Other', label: 'Other' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id?: string | null;
};

export function BankAccountDialog({ open, onClose, onSuccess, id }: Props) {
  const [bankAccountName, setBankAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState<BankAccount['account_type']>('Savings');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        if (id) {
          try {
            setLoading(true);
            const data = await getBankAccount(id);
            setBankAccountName(data.bank_account_name || '');
            setAccountNumber(data.account_number || '');
            setBankName(data.bank_name || '');
            setBranch(data.branch || '');
            setIfscCode(data.ifsc_code || '');
            setAccountType(data.account_type || 'Savings');
          } catch (err) {
            console.error('Failed to fetch bank account:', err);
            setSnackbar({ open: true, message: 'Failed to fetch details', severity: 'error' });
          } finally {
            setLoading(false);
          }
        } else {
          setBankAccountName('');
          setAccountNumber('');
          setBankName('');
          setBranch('');
          setIfscCode('');
          setAccountType('Savings');
        }
        setError('');
      }
    };

    fetchData();
  }, [open, id]);

  const handleSubmit = async () => {
    if (!bankAccountName.trim()) {
      setError('Bank Account Name');
      setSnackbar({ open: true, message: 'Bank Account Name is required', severity: 'error' });
      return;
    }
    if (!accountNumber.trim()) {
      setError('Account Number');
      setSnackbar({ open: true, message: 'Account Number is required', severity: 'error' });
      return;
    }
    if (!bankName.trim()) {
      setError('Bank Name');
      setSnackbar({ open: true, message: 'Bank Name is required', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data: Partial<BankAccount> = {
        bank_account_name: bankAccountName,
        account_number: accountNumber,
        bank_name: bankName,
        branch,
        ifsc_code: ifscCode,
        account_type: accountType,
      };

      if (id) {
        await updateBankAccount(id, data);
      } else {
        await createBankAccount(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to save';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6">{id ? 'Edit Bank Account' : 'New Bank Account'}</Typography>
        <Iconify
          icon="mingcute:close-line"
          onClick={onClose}
          sx={{ cursor: 'pointer', color: 'text.disabled' }}
        />
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 2 }}>
          <TextField
            required
            fullWidth
            label="Bank Account Name"
            placeholder="e.g. Salary Account"
            value={bankAccountName}
            onChange={(e) => {
              setBankAccountName(e.target.value);
              if (error === 'Bank Account Name') setError('');
            }}
            error={error === 'Bank Account Name'}
            disabled={loading}
            autoFocus
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiFormLabel-asterisk': { color: 'red' } }}
          />

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField
              required
              fullWidth
              label="Account Number"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                if (error === 'Account Number') setError('');
              }}
              error={error === 'Account Number'}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiFormLabel-asterisk': { color: 'red' } }}
            />
            <TextField
              select
              fullWidth
              label="Account Type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as any)}
              disabled={loading}
            >
              {ACCOUNT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            required
            fullWidth
            label="Bank Name"
            value={bankName}
            onChange={(e) => {
              setBankName(e.target.value);
              if (error === 'Bank Name') setError('');
            }}
            error={error === 'Bank Name'}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiFormLabel-asterisk': { color: 'red' } }}
          />

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField
              fullWidth
              label="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ bgcolor: '#08a3cd', '&:hover': { bgcolor: '#068fb3' } }}
        >
          {id ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>

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
    </Dialog>
  );
}
