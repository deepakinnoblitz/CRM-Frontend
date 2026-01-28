import dayjs from 'dayjs';
import { useState, useEffect, useCallback } from 'react';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Grid, Stack, Button, IconButton, Typography, Autocomplete, Snackbar, Alert } from '@mui/material';

import { stripHtml } from 'src/utils/string';

import { getDoctypeList } from 'src/api/leads';
import { type Call, createCall, updateCall } from 'src/api/calls';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    selectedCall?: Call | null;
    initialData?: Partial<Call>;
    onSuccess?: () => void;
};

const INITIAL_CALL_STATE: Partial<Call> = {
    title: '',
    call_purpose: '',
    call_agenda: '',
    call_for: 'Lead',
    outgoing_call_status: 'Scheduled',
    call_start_time: '',
    call_end_time: '',
    lead_name: '',
};

export default function CallDialog({ open, onClose, selectedCall, initialData, onSuccess }: Props) {
    const [callData, setCallData] = useState<Partial<Call>>(INITIAL_CALL_STATE);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [leadOptions, setLeadOptions] = useState<any[]>([]);
    const [contactOptions, setContactOptions] = useState<any[]>([]);
    const [accountOptions, setAccountOptions] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            getDoctypeList('Lead', ['name', 'lead_name', 'converted_contact', 'converted_account']).then(setLeadOptions);
            getDoctypeList('Contacts', ['name', 'first_name', 'last_name']).then(setContactOptions);
            getDoctypeList('Accounts', ['name', 'account_name']).then(setAccountOptions);
        }
    }, [open]);

    useEffect(() => {
        if (selectedCall) {
            setCallData({
                title: selectedCall.title,
                call_purpose: selectedCall.call_purpose || '',
                call_agenda: stripHtml(selectedCall.call_agenda || ''),
                call_for: selectedCall.call_for || 'Lead',
                outgoing_call_status: selectedCall.outgoing_call_status || 'Scheduled',
                call_start_time: selectedCall.call_start_time.replace(' ', 'T'),
                call_end_time: selectedCall.call_end_time?.replace(' ', 'T') || '',
                lead_name: selectedCall.lead_name || '',
                contact_name: selectedCall.contact_name || '',
                account_name: selectedCall.account_name || '',
            });
        } else if (initialData) {
            setCallData({
                ...INITIAL_CALL_STATE,
                ...initialData,
            });
        } else {
            setCallData(INITIAL_CALL_STATE);
        }
    }, [selectedCall, initialData, open]);

    const handleSaveCall = async () => {
        try {
            const formattedData = {
                ...callData,
                call_start_time: callData.call_start_time?.replace('T', ' '),
                call_end_time: callData.call_end_time?.replace('T', ' ') || undefined,
            };

            if (selectedCall) {
                await updateCall(selectedCall.name, formattedData);
            } else {
                await createCall(formattedData);
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Failed to save call:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save call', severity: 'error' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedCall ? 'Edit Call' : 'New Call'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ borderBottom: 'none', px: 3, pb: 0 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* General Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    General Information
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        placeholder="Enter call title"
                                        value={callData.title}
                                        onChange={(e) => setCallData({ ...callData, title: e.target.value })}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Call For</InputLabel>
                                                <Select
                                                    label="Call For"
                                                    value={callData.call_for}
                                                    onChange={(e) => setCallData({
                                                        ...callData,
                                                        call_for: e.target.value as string,
                                                        lead_name: '',
                                                        contact_name: '',
                                                        account_name: ''
                                                    })}
                                                >
                                                    <MenuItem value="Lead">Lead</MenuItem>
                                                    <MenuItem value="Contact">Contact</MenuItem>
                                                    <MenuItem value="Accounts">Accounts</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {callData.call_for === 'Lead' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={leadOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.lead_name} (${option.name})`}
                                                    value={leadOptions.find(opt => opt.name === callData.lead_name) || null}
                                                    onChange={(_, newValue) => {
                                                        setCallData({
                                                            ...callData,
                                                            lead_name: newValue?.name || '',
                                                            contact_name: newValue?.converted_contact || '',
                                                            account_name: newValue?.converted_account || ''
                                                        });
                                                    }}
                                                    renderInput={(params) => <TextField {...params} label="Select Lead" />}
                                                />
                                            </Grid>
                                        )}

                                        {callData.call_for === 'Contact' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={contactOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.first_name || ''} ${option.last_name || ''} (${option.name})`.trim()}
                                                    value={contactOptions.find(opt => opt.name === callData.contact_name) || null}
                                                    onChange={(_, newValue) => setCallData({ ...callData, contact_name: newValue?.name || '' })}
                                                    renderInput={(params) => <TextField {...params} label="Select Contact" />}
                                                />
                                            </Grid>
                                        )}

                                        {callData.call_for === 'Accounts' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={accountOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.account_name} (${option.name})`}
                                                    value={accountOptions.find(opt => opt.name === callData.account_name) || null}
                                                    onChange={(_, newValue) => setCallData({ ...callData, account_name: newValue?.name || '' })}
                                                    renderInput={(params) => <TextField {...params} label="Select Account" />}
                                                />
                                            </Grid>
                                        )}

                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    label="Status"
                                                    value={callData.outgoing_call_status}
                                                    onChange={(e) => setCallData({ ...callData, outgoing_call_status: e.target.value as string })}
                                                >
                                                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>

                            {/* Schedule Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Time Schedule
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="Start Time"
                                            value={callData.call_start_time ? dayjs(callData.call_start_time) : null}
                                            onChange={(newValue) => setCallData({ ...callData, call_start_time: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="End Time"
                                            value={callData.call_end_time ? dayjs(callData.call_end_time) : null}
                                            onChange={(newValue) => setCallData({ ...callData, call_end_time: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Agenda Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Details & Agenda
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Purpose"
                                        placeholder="Reason for the call"
                                        value={callData.call_purpose}
                                        onChange={(e) => setCallData({ ...callData, call_purpose: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Agenda"
                                        placeholder="Points to discuss..."
                                        value={callData.call_agenda}
                                        onChange={(e) => setCallData({ ...callData, call_agenda: e.target.value })}
                                    />
                                </Stack>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
                    <Button color="inherit" variant="outlined" onClick={onClose} sx={{ borderRadius: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleSaveCall}
                        sx={{ borderRadius: 1, px: 3 }}
                    >
                        {selectedCall ? 'Save Changes' : 'Create Call'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
