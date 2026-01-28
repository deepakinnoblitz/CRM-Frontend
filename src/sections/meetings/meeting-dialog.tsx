import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

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
import { type Meeting, createMeeting, updateMeeting } from 'src/api/meetings';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    selectedMeeting?: Meeting | null;
    initialData?: Partial<Meeting>;
    onSuccess?: () => void;
};

const INITIAL_MEETING_STATE: Partial<Meeting> = {
    title: '',
    meet_for: 'Lead',
    lead_name: '',
    outgoing_call_status: 'Scheduled',
    from: '',
    to: '',
    meeting_venue: 'In Office',
    location: '',
    completed_meet_notes: '',
};

export default function MeetingDialog({ open, onClose, selectedMeeting, initialData, onSuccess }: Props) {
    const [meetingData, setMeetingData] = useState<Partial<Meeting>>(INITIAL_MEETING_STATE);
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
        if (selectedMeeting) {
            setMeetingData({
                title: selectedMeeting.title,
                meet_for: selectedMeeting.meet_for || 'Lead',
                outgoing_call_status: selectedMeeting.outgoing_call_status || 'Scheduled',
                from: selectedMeeting.from.replace(' ', 'T'),
                to: selectedMeeting.to?.replace(' ', 'T') || '',
                meeting_venue: selectedMeeting.meeting_venue || 'In Office',
                location: selectedMeeting.location || '',
                completed_meet_notes: stripHtml(selectedMeeting.completed_meet_notes || ''),
                lead_name: selectedMeeting.lead_name || '',
                contact_name: selectedMeeting.contact_name || '',
                account_name: selectedMeeting.account_name || '',
            });
        } else if (initialData) {
            setMeetingData({
                ...INITIAL_MEETING_STATE,
                ...initialData,
            });
        } else {
            setMeetingData(INITIAL_MEETING_STATE);
        }
    }, [selectedMeeting, initialData, open]);

    const handleSaveMeeting = async () => {
        try {
            const formattedData = {
                ...meetingData,
                from: meetingData.from?.replace('T', ' '),
                to: meetingData.to?.replace('T', ' ') || undefined,
            };

            if (selectedMeeting) {
                await updateMeeting(selectedMeeting.name, formattedData);
            } else {
                await createMeeting(formattedData);
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Failed to save meeting:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save meeting', severity: 'error' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedMeeting ? 'Edit Meeting' : 'New Meeting'}
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
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        placeholder="Enter meeting title"
                                        value={meetingData.title}
                                        onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Meet For</InputLabel>
                                                <Select
                                                    label="Meet For"
                                                    value={meetingData.meet_for}
                                                    onChange={(e) => setMeetingData({
                                                        ...meetingData,
                                                        meet_for: e.target.value as string,
                                                        lead_name: '',
                                                        contact_name: '',
                                                        account_name: ''
                                                    })}
                                                >
                                                    <MenuItem value="Lead">Lead</MenuItem>
                                                    <MenuItem value="Contact">Contact</MenuItem>
                                                    <MenuItem value="Accounts">Account</MenuItem>
                                                    <MenuItem value="Others">Others</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {meetingData.meet_for === 'Lead' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={leadOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.lead_name} (${option.name})`}
                                                    value={leadOptions.find(opt => opt.name === meetingData.lead_name) || null}
                                                    onChange={(_, newValue) => {
                                                        setMeetingData({
                                                            ...meetingData,
                                                            lead_name: newValue?.name || '',
                                                            contact_name: newValue?.converted_contact || '',
                                                            account_name: newValue?.converted_account || ''
                                                        });
                                                    }}
                                                    renderInput={(params) => <TextField {...params} label="Select Lead" />}
                                                />
                                            </Grid>
                                        )}

                                        {meetingData.meet_for === 'Contact' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={contactOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.first_name || ''} ${option.last_name || ''} (${option.name})`.trim()}
                                                    value={contactOptions.find(opt => opt.name === meetingData.contact_name) || null}
                                                    onChange={(_, newValue) => setMeetingData({ ...meetingData, contact_name: newValue?.name || '' })}
                                                    renderInput={(params) => <TextField {...params} label="Select Contact" />}
                                                />
                                            </Grid>
                                        )}

                                        {meetingData.meet_for === 'Accounts' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={accountOptions}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.account_name} (${option.name})`}
                                                    value={accountOptions.find(opt => opt.name === meetingData.account_name) || null}
                                                    onChange={(_, newValue) => setMeetingData({ ...meetingData, account_name: newValue?.name || '' })}
                                                    renderInput={(params) => <TextField {...params} label="Select Account" />}
                                                />
                                            </Grid>
                                        )}

                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    label="Status"
                                                    value={meetingData.outgoing_call_status}
                                                    onChange={(e) => setMeetingData({ ...meetingData, outgoing_call_status: e.target.value as string })}
                                                >
                                                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>

                            {/* Schedule Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Time Schedule
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="From"
                                            value={meetingData.from ? dayjs(meetingData.from) : null}
                                            onChange={(newValue) => setMeetingData({ ...meetingData, from: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="To"
                                            value={meetingData.to ? dayjs(meetingData.to) : null}
                                            onChange={(newValue) => setMeetingData({ ...meetingData, to: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Location Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Location & Venue
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Venue</InputLabel>
                                            <Select
                                                label="Venue"
                                                value={meetingData.meeting_venue}
                                                onChange={(e) => setMeetingData({ ...meetingData, meeting_venue: e.target.value as string })}
                                            >
                                                <MenuItem value="In Office">In Office</MenuItem>
                                                <MenuItem value="Client Location">Client Location</MenuItem>
                                                <MenuItem value="Online">Online</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Location"
                                            placeholder="Enter address or link"
                                            value={meetingData.location}
                                            onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Notes Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Meeting Notes
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Notes"
                                    placeholder="Write summary or observations..."
                                    value={meetingData.completed_meet_notes}
                                    onChange={(e) => setMeetingData({ ...meetingData, completed_meet_notes: e.target.value })}
                                />
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
                        onClick={handleSaveMeeting}
                        sx={{ borderRadius: 1, px: 3 }}
                    >
                        {selectedMeeting ? 'Save Changes' : 'Create Meeting'}
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
