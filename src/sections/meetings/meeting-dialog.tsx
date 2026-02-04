import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Grid, Stack, Alert, Button, Switch, Snackbar, IconButton, Typography, Autocomplete, FormControlLabel } from '@mui/material';

import { stripHtml } from 'src/utils/string';

import { getDoctypeList } from 'src/api/leads';
import { type Meeting, createMeeting, updateMeeting, deleteMeeting } from 'src/api/meetings';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

const Android12Switch = styled(Switch)(({ theme }) => ({
    padding: 8,
    '& .MuiSwitch-track': {
        borderRadius: 22 / 2,
        '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
        },
        '&::before': {
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                '#fff',
            )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
            left: 12,
        }
    },
    '& .MuiSwitch-thumb': {
        boxShadow: 'none',
        width: 16,
        height: 16,
        margin: 2,
    },
}));

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
    accounts_name: '',
    enter_id: '',
    outgoing_call_status: 'Scheduled',
    completed_meet_status: '',
    from: '',
    to: '',
    meeting_venue: 'In Office',
    location: '',
    completed_meet_notes: '',
    enable_reminder: 0,
    remind_before_minutes: 60,
    host: '',
    participants: [],
};

export default function MeetingDialog({ open, onClose, selectedMeeting, initialData, onSuccess }: Props) {
    const [meetingData, setMeetingData] = useState<Partial<Meeting>>(INITIAL_MEETING_STATE);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const [confirmDelete, setConfirmDelete] = useState(false);

    const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

    const [leadOptions, setLeadOptions] = useState<any[]>([]);
    const [contactOptions, setContactOptions] = useState<any[]>([]);
    const [accountOptions, setAccountOptions] = useState<any[]>([]);
    const [userOptions, setUserOptions] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            getDoctypeList('Lead', ['name', 'lead_name', 'converted_contact', 'converted_account']).then(setLeadOptions);
            getDoctypeList('Contacts', ['name', 'first_name', 'last_name']).then(setContactOptions);
            getDoctypeList('Accounts', ['name', 'account_name']).then(setAccountOptions);
            getDoctypeList('User', ['name', 'full_name']).then((users) => {
                setUserOptions(users.filter((u: any) => u.name !== 'Administrator' && u.name !== 'Guest'));
            });
        }
    }, [open]);

    useEffect(() => {
        if (selectedMeeting) {
            setMeetingData({
                title: selectedMeeting.title,
                meet_for: selectedMeeting.meet_for || 'Lead',
                outgoing_call_status: selectedMeeting.outgoing_call_status || 'Scheduled',
                completed_meet_status: selectedMeeting.completed_meet_status || '',
                enter_id: selectedMeeting.enter_id || '',
                from: selectedMeeting.from.replace(' ', 'T'),
                to: selectedMeeting.to?.replace(' ', 'T') || '',
                meeting_venue: selectedMeeting.meeting_venue || 'In Office',
                location: selectedMeeting.location || '',
                completed_meet_notes: stripHtml(selectedMeeting.completed_meet_notes || ''),
                lead_name: selectedMeeting.lead_name || '',
                contact_name: selectedMeeting.contact_name || '',
                accounts_name: selectedMeeting.accounts_name || '',
                enable_reminder: selectedMeeting.enable_reminder || 0,
                remind_before_minutes: selectedMeeting.remind_before_minutes || 60,
                host: selectedMeeting.host || '',
                participants: selectedMeeting.participants || [],
            });
        } else if (initialData) {
            setMeetingData({
                ...INITIAL_MEETING_STATE,
                ...initialData,
            });
        } else {
            setMeetingData({
                ...INITIAL_MEETING_STATE,
                from: dayjs().format('YYYY-MM-DDTHH:mm')
            });
        }
    }, [selectedMeeting, initialData, open]);

    const handleSaveMeeting = async () => {
        const errors: { [key: string]: boolean } = {};
        if (!meetingData.title) errors.title = true;

        if (meetingData.meet_for === 'Lead' && !meetingData.lead_name) errors.lead_name = true;
        if (meetingData.meet_for === 'Contact' && !meetingData.contact_name) errors.contact_name = true;
        if (meetingData.meet_for === 'Accounts' && !meetingData.accounts_name) errors.accounts_name = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
            return;
        }

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

    const handleConfirmDelete = async () => {
        if (!selectedMeeting) return;
        try {
            await deleteMeeting(selectedMeeting.name);
            setConfirmDelete(false);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Failed to delete meeting:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to delete meeting', severity: 'error' });
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
                                        required
                                        fullWidth
                                        error={!!formErrors.title}
                                        helperText={formErrors.title ? 'Title is required' : ''}
                                        label="Title"
                                        placeholder="Enter meeting title"
                                        value={meetingData.title}
                                        onChange={(e) => {
                                            setMeetingData({ ...meetingData, title: e.target.value });
                                            if (formErrors.title) setFormErrors({ ...formErrors, title: false });
                                        }}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Meet For</InputLabel>
                                                <Select
                                                    required
                                                    label="Meet For"
                                                    value={meetingData.meet_for}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem' } }
                                                        }
                                                    }}
                                                    onChange={(e) => setMeetingData({
                                                        ...meetingData,
                                                        meet_for: e.target.value as string,
                                                        lead_name: '',
                                                        contact_name: '',
                                                        accounts_name: ''
                                                    })}
                                                >
                                                    <MenuItem value="Lead">Lead</MenuItem>
                                                    <MenuItem value="Contact">Contact</MenuItem>
                                                    <MenuItem value="Accounts">Account</MenuItem>
                                                    <MenuItem value="Others">Others</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {meetingData.meet_for === 'Others' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Enter ID"
                                                    placeholder="Enter other ID"
                                                    value={meetingData.enter_id}
                                                    onChange={(e) => setMeetingData({ ...meetingData, enter_id: e.target.value })}
                                                />
                                            </Grid>
                                        )}

                                        {meetingData.meet_for === 'Lead' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={leadOptions}
                                                    ListboxProps={{
                                                        sx: { '& .MuiAutocomplete-option': { fontSize: '0.9rem' } }
                                                    }}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.lead_name} (${option.name})`}
                                                    value={leadOptions.find(opt => opt.name === meetingData.lead_name) || null}
                                                    onChange={(_, newValue) => {
                                                        setMeetingData({
                                                            ...meetingData,
                                                            lead_name: newValue?.name || '',
                                                            contact_name: newValue?.converted_contact || '',
                                                            accounts_name: newValue?.converted_account || ''
                                                        });
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Lead"
                                                            required
                                                            error={!!formErrors.lead_name}
                                                            helperText={formErrors.lead_name ? 'Lead is required' : ''}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        )}

                                        {meetingData.meet_for === 'Contact' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={contactOptions}
                                                    ListboxProps={{
                                                        sx: { '& .MuiAutocomplete-option': { fontSize: '0.9rem' } }
                                                    }}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.first_name || ''} ${option.last_name || ''} (${option.name})`.trim()}
                                                    value={contactOptions.find(opt => opt.name === meetingData.contact_name) || null}
                                                    onChange={(_, newValue) => setMeetingData({ ...meetingData, contact_name: newValue?.name || '' })}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Contact"
                                                            required
                                                            error={!!formErrors.contact_name}
                                                            helperText={formErrors.contact_name ? 'Contact is required' : ''}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        )}

                                        {meetingData.meet_for === 'Accounts' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={accountOptions}
                                                    ListboxProps={{
                                                        sx: { '& .MuiAutocomplete-option': { fontSize: '0.9rem' } }
                                                    }}
                                                    getOptionLabel={(option) => typeof option === 'string' ? option : `${option.account_name} (${option.name})`}
                                                    value={accountOptions.find(opt => opt.name === meetingData.accounts_name) || null}
                                                    onChange={(_, newValue) => setMeetingData({ ...meetingData, accounts_name: newValue?.name || '' })}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Account"
                                                            required
                                                            error={!!formErrors.accounts_name}
                                                            helperText={formErrors.accounts_name ? 'Account is required' : ''}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        )}

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    label="Status"
                                                    value={meetingData.outgoing_call_status}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: { '& .MuiMenuItem-root': { fontSize: '0.9rem' } }
                                                        }
                                                    }}
                                                    onChange={(e) => setMeetingData({ ...meetingData, outgoing_call_status: e.target.value as string })}
                                                >
                                                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        {meetingData.outgoing_call_status === 'Completed' && (
                                            <Grid size={{ xs: 12, md: 6 }}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Meeting Status</InputLabel>
                                                    <Select
                                                        label="Meeting Status"
                                                        value={meetingData.completed_meet_status}
                                                        onChange={(e) => setMeetingData({ ...meetingData, completed_meet_status: e.target.value as string })}
                                                    >
                                                        {[
                                                            'Called – No Response',
                                                            'Called – Phone Switched Off',
                                                            'Called – Number Not Reachable',
                                                            'Called – Wrong Number',
                                                            'Called – Left Voicemail',
                                                            'Called – Asked to Call Later',
                                                            'Called – Spoke Briefly',
                                                            'Spoke to Prospect – Not Available',
                                                            'Spoke to Prospect – Confirmed Interest',
                                                            'Spoke to Prospect – Needs More Time',
                                                            'Spoke to Prospect – Will Revert Soon',
                                                            'Spoke to Prospect – Awaiting Internal Discussion',
                                                            'Demo Scheduled',
                                                            'Demo Completed',
                                                            'Demo Rescheduled',
                                                            'Prospect Did Not Attend Demo',
                                                            'Proposal / Quotation Sent',
                                                            'Pricing Discussion Ongoing',
                                                            'Negotiation in Progress',
                                                            'Awaiting Prospect Approval',
                                                            'Deal Won – Order Confirmed',
                                                            'Deal Lost – Price Issue',
                                                            'Deal Lost – No Requirement',
                                                            'Deal Lost – Competitor Chosen',
                                                            'Order Processing Started',
                                                            'Payment Received',
                                                            'Delivery / Implementation Started',
                                                            'Post-Sales Follow-up Scheduled',
                                                            'Lead Not Interested',
                                                            'Lead Invalid',
                                                            'Lead Closed – No Response',
                                                            'Others'
                                                        ].map((opt) => (
                                                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        )}
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

                            {/* Stakeholders Section */}
                           {/*</Box><Box>
                           {/*</Box>    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                           {/*</Box>        Stakeholders
                           {/*</Box>    </Typography>
                           {/*</Box>    <Grid container spacing={2}>
                           {/*</Box>        <Grid size={{ xs: 12, md: 6 }}>
                           {/*</Box>            <Autocomplete
                           {/*</Box>                fullWidth
                           {/*</Box>                options={userOptions}
                           {/*</Box>                getOptionLabel={(option) => typeof option === 'string' ? option : option.full_name || option.name}
                           {/*</Box>                value={userOptions.find(opt => opt.name === meetingData.host) || null}
                           {/*</Box>                onChange={(_, newValue) => setMeetingData({ ...meetingData, host: newValue?.name || '' })}
                           {/*</Box>                renderInput={(params) => <TextField {...params} label="Host" />}
                           {/*</Box>            />
                           {/*</Box>        </Grid>
                           {/*</Box>        <Grid size={{ xs: 12, md: 6 }}>
                           {/*</Box>            <Autocomplete
                           {/*</Box>                multiple
                           {/*</Box>                fullWidth
                           {/*</Box>                options={userOptions}
                           {/*</Box>                getOptionLabel={(option) => typeof option === 'string' ? option : option.full_name || option.name}
                           {/*</Box>                value={userOptions.filter(opt => meetingData.participants?.some(p => p.user === opt.name))}
                           {/*</Box>                onChange={(_, newValue) => setMeetingData({
                           {/*</Box>                    ...meetingData,
                           {/*</Box>                    participants: newValue.map(v => ({ user: v.name }))
                           {/*</Box>                })}
                           {/*</Box>                renderInput={(params) => <TextField {...params} label="Participants" />}
                           {/*</Box>            />
                           {/*</Box>        </Grid>
                           {/*</Box>    </Grid>
                           {/*</Box></Box>

                            {/* Reminder Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Reminder Settings
                                </Typography>
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Android12Switch
                                                checked={meetingData.enable_reminder === 1}
                                                onChange={(e) => setMeetingData({ ...meetingData, enable_reminder: e.target.checked ? 1 : 0 })}
                                            />
                                        }
                                        label="Enable Reminder"
                                    />
                                    {meetingData.enable_reminder === 1 && (
                                        <Box>
                                            <TimePicker
                                                label="Remind Before (Time)"
                                                value={dayjs().startOf('day').add(meetingData.remind_before_minutes || 60, 'minutes')}
                                                onChange={(newValue: dayjs.Dayjs | null) => {
                                                    if (newValue) {
                                                        const hours = newValue.hour();
                                                        const minutes = newValue.minute();
                                                        const totalMinutes = hours * 60 + minutes;
                                                        setMeetingData({ ...meetingData, remind_before_minutes: totalMinutes });
                                                    }
                                                }}
                                                ampm={false}
                                                views={['hours', 'minutes']}
                                                format="HH:mm"
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        helperText: 'Set hours and minutes before the meeting'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Stack>
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
                    {selectedMeeting && (
                        <Button
                            color="error"
                            variant="outlined"
                            onClick={() => setConfirmDelete(true)}
                            sx={{ mr: 'auto', borderRadius: 1 }}
                        >
                            Delete
                        </Button>
                    )}
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

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Confirm Delete"
                content="Are you sure you want to delete this meeting?"
                action={
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
            />

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
