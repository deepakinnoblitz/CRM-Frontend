import { MuiTelInput } from 'mui-tel-input';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getDoctypeList } from 'src/api/leads';
import locationData from 'src/assets/data/location_data.json';
import { getContact, createContact, updateContact } from 'src/api/contacts';

import { Iconify } from 'src/components/iconify';

type Props = {
    open: boolean;
    onClose: () => void;
    contactId?: string | null;
    onSuccess?: () => void;
};

export function ContactFormDialog({ open, onClose, contactId, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [designation, setDesignation] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [contactType, setContactType] = useState('Sales');
    const [sourceLead, setSourceLead] = useState('');

    const [countryOptions, setCountryOptions] = useState<string[]>([]);
    const [stateOptions, setStateOptions] = useState<string[]>([]);
    const [cityOptions, setCityOptions] = useState<string[]>([]);
    const [leadOptions, setLeadOptions] = useState<{ name: string; lead_name: string }[]>([]);

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // Populate Country Options
        const countries = Array.from(new Set(locationData.map((c: any) => c.country)));
        setCountryOptions(["", ...countries]);

        // Fetch Leads
        getDoctypeList('Lead', ['name', 'lead_name']).then(setLeadOptions).catch(console.error);
    }, []);

    useEffect(() => {
        if (open && contactId) {
            setLoading(true);
            getContact(contactId)
                .then((contact) => {
                    setFirstName(contact.first_name || '');
                    setCompanyName(contact.company_name || '');
                    setEmail(contact.email || '');
                    setPhone(cleanPhoneNumber(contact.phone || ''));
                    setDesignation(contact.designation || '');
                    setAddress(contact.address || '');
                    setNotes(contact.notes || '');
                    setCountry(contact.country || '');
                    setState(contact.state || '');
                    setCity(contact.city || '');
                    setContactType(contact.customer_type || 'Sales');
                    setSourceLead(contact.source_lead || '');
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else if (open) {
            resetForm();
        }
    }, [open, contactId]);

    // Fetch States when Country changes
    useEffect(() => {
        if (country) {
            const countryData = locationData.find((c: any) => c.country === country);
            if (countryData) {
                const states = countryData.states.map((s: any) => s.name);
                setStateOptions(["", ...states, "Others"]);
            } else {
                setStateOptions([]);
            }
        } else {
            setStateOptions([]);
            setCityOptions([]);
        }
    }, [country]);

    // Fetch Cities when State changes
    useEffect(() => {
        if (state && country) {
            if (state === 'Others') {
                setCityOptions(['Others']);
            } else {
                const countryData = locationData.find((c: any) => c.country === country);
                if (countryData) {
                    const stateData = countryData.states.find((s: any) => s.name === state);
                    if (stateData) {
                        setCityOptions(["", ...stateData.cities, "Others"]);
                    } else {
                        setCityOptions(["Others"]);
                    }
                }
            }
        } else {
            setCityOptions([]);
        }
    }, [state, country]);

    const resetForm = () => {
        setFirstName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
        setDesignation('');
        setAddress('');
        setNotes('');
        setCountry('');
        setState('');
        setCity('');
        setContactType('Sales');
        setSourceLead('');
        setValidationErrors({});
    };

    const cleanPhoneNumber = (val: string) => {
        if (!val) return '';
        if (val.startsWith('+') && val.includes('-')) {
            return val.replace('-', ' ');
        }
        return val;
    };

    const handleSave = async () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!firstName) newErrors.firstName = true;
        if (!email) newErrors.email = true;
        if (!phone) newErrors.phone = true;

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        try {
            setSaving(true);
            let formattedPhone = phone.replace(/\s/g, '');
            const parts = phone.trim().split(/\s+/);
            if (parts.length > 1 && parts[0].startsWith('+')) {
                formattedPhone = `${parts[0]}-${parts.slice(1).join('')}`;
            }

            const contactData = {
                first_name: firstName,
                company_name: companyName,
                email,
                phone: formattedPhone,
                designation,
                address,
                notes,
                country,
                state,
                city,
                customer_type: contactType,
                source_lead: sourceLead,
            };

            if (contactId) {
                await updateContact(contactId, contactData);
            } else {
                await createContact(contactData);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            // In a real app, show snackbar here or pass error back
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: (theme) => theme.customShadows.z24,
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {contactId ? 'Edit Client' : 'New Client'}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.default' },
                    }}
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon="solar:restart-bold" width={40} sx={{ color: 'primary.main' }} />
                    </Box>
                ) : (
                    <Box display="grid" margin={2} gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                if (e.target.value) setValidationErrors(prev => ({ ...prev, firstName: false }));
                            }}
                            required
                            error={!!validationErrors.firstName}
                            helperText={validationErrors.firstName ? 'Name is required' : ''}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (e.target.value) setValidationErrors(prev => ({ ...prev, email: false }));
                            }}
                            required
                            error={!!validationErrors.email}
                            helperText={validationErrors.email ? 'Email is required' : ''}
                        />

                        <MuiTelInput
                            fullWidth
                            defaultCountry="IN"
                            label="Phone Number"
                            name="phone_number"
                            value={phone}
                            onChange={(newValue) => {
                                setPhone(newValue);
                                if (newValue) setValidationErrors(prev => ({ ...prev, phone: false }));
                            }}
                            required
                            error={!!validationErrors.phone}
                            helperText={validationErrors.phone ? 'Phone Number is required' : ''}
                        />

                        <TextField
                            fullWidth
                            label="Company Name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Client Type"
                            value={contactType}
                            onChange={(e) => setContactType(e.target.value)}
                            SelectProps={{
                                MenuProps: {
                                    PaperProps: {
                                        sx: {
                                            marginTop: 0.5,
                                            boxShadow: (theme) => theme.customShadows.z20,
                                            borderRadius: 1.5,
                                        }
                                    }
                                }
                            }}
                        >
                            <MenuItem value="Sales">Sales</MenuItem>
                            <MenuItem value="Purchase">Purchase</MenuItem>
                        </TextField>

                        <Autocomplete
                            fullWidth
                            options={countryOptions.filter(o => o !== '')}
                            value={country}
                            onChange={(e, newValue) => setCountry(newValue || '')}
                            renderInput={(params) => <TextField {...params} label="Country" />}
                        />

                        <Autocomplete
                            fullWidth
                            disabled={!country}
                            options={stateOptions.filter(o => o !== '')}
                            value={state}
                            onChange={(e, newValue) => setState(newValue || '')}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="State" 
                                    placeholder={!country ? "Select Country First" : ""}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                        />

                        <Autocomplete
                            fullWidth
                            disabled={!state}
                            options={cityOptions.filter(o => o !== '')}
                            value={city}
                            onChange={(e, newValue) => setCity(newValue || '')}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="City" 
                                    placeholder={!state ? "Select State First" : ""}
                                    InputLabelProps={{ shrink: true }}
                                />
                            )}
                        />

                        <TextField
                            fullWidth
                            label="Address"
                            multiline
                            rows={2}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            sx={{ gridColumn: 'span 2' }}
                        />
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            sx={{ gridColumn: 'span 2' }}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{m:1}}>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : (contactId ? 'Update Client' : 'Create Client')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
