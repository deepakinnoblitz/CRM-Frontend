import { MuiTelInput } from 'mui-tel-input';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { getDoctypeList } from 'src/api/leads';
import { createAccount } from 'src/api/accounts';
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
    const [accountOptions, setAccountOptions] = useState<{ name: string; account_name: string }[]>([]);

    const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

    const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [creatingCompany, setCreatingCompany] = useState(false);

    const [newCompanyPhone, setNewCompanyPhone] = useState('');
    const [newCompanyGSTIN, setNewCompanyGSTIN] = useState('');
    const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
    const [newCompanyCountry, setNewCompanyCountry] = useState('');
    const [newCompanyState, setNewCompanyState] = useState('');
    const [newCompanyCity, setNewCompanyCity] = useState('');

    const [newCompanyStateOptions, setNewCompanyStateOptions] = useState<string[]>([]);
    const [newCompanyCityOptions, setNewCompanyCityOptions] = useState<string[]>([]);

    const [newCompanyValidationErrors, setNewCompanyValidationErrors] = useState<{ accountName?: boolean; phone?: boolean }>({});

    // Fetch States when new Company Country changes
    useEffect(() => {
        if (newCompanyCountry) {
            const countryData = locationData.find((c: any) => c.country === newCompanyCountry);
            if (countryData) {
                const states = countryData.states.map((s: any) => s.name);
                setNewCompanyStateOptions(["", ...states, "Others"]);
            } else {
                setNewCompanyStateOptions([]);
            }
        } else {
            setNewCompanyStateOptions([]);
            setNewCompanyCityOptions([]);
        }
        setNewCompanyState('');
        setNewCompanyCity('');
    }, [newCompanyCountry]);

    // Fetch Cities when new Company State changes
    useEffect(() => {
        if (newCompanyState && newCompanyCountry) {
            if (newCompanyState === 'Others') {
                setNewCompanyCityOptions(['Others']);
            } else {
                const countryData = locationData.find((c: any) => c.country === newCompanyCountry);
                if (countryData) {
                    const stateData = countryData.states.find((s: any) => s.name === newCompanyState);
                    if (stateData) {
                        setNewCompanyCityOptions(["", ...stateData.cities, "Others"]);
                    } else {
                        setNewCompanyCityOptions(["Others"]);
                    }
                } else {
                    setNewCompanyCityOptions([]);
                }
            }
        } else {
            setNewCompanyCityOptions([]);
        }
        setNewCompanyCity('');
    }, [newCompanyState, newCompanyCountry]);

    const handleQuickCreateCompany = async () => {
        const errors: { accountName?: boolean; phone?: boolean } = {};
        if (!newCompanyName.trim()) errors.accountName = true;
        if (!newCompanyPhone.trim()) errors.phone = true;

        if (Object.keys(errors).length > 0) {
            setNewCompanyValidationErrors(errors);
            return;
        }

        setCreatingCompany(true);
        try {
            const newAcc = await createAccount({
                account_name: newCompanyName,
                phone_number: newCompanyPhone,
                gstin: newCompanyGSTIN,
                website: newCompanyWebsite,
                country: newCompanyCountry,
                state: newCompanyState,
                city: newCompanyCity,
            });
            setAccountOptions((prev) => [...prev, { name: newAcc.name, account_name: newAcc.account_name }]);
            setCompanyName(newAcc.name);
            setCreateCompanyOpen(false);
        } catch (error) {
            console.error("Failed to create company", error);
        } finally {
            setCreatingCompany(false);
        }
    };

    useEffect(() => {
        // Populate Country Options
        const countries = Array.from(new Set(locationData.map((c: any) => c.country)));
        setCountryOptions(["", ...countries]);

        // Fetch Leads
        getDoctypeList('Lead', ['name', 'lead_name']).then(setLeadOptions).catch(console.error);

        // Fetch Accounts
        getDoctypeList('Accounts', ['name', 'account_name']).then(setAccountOptions).catch(console.error);
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
        <>
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

                        <Autocomplete
                            fullWidth
                            options={accountOptions}
                            getOptionLabel={(option: any) => {
                                if (typeof option === 'string') return option;
                                if (option.inputValue) return option.inputValue;
                                return option.account_name || '';
                            }}
                            value={
                                accountOptions.find((acc) => acc.name === companyName) ||
                                accountOptions.find((acc) => acc.account_name === companyName) ||
                                (companyName ? { name: companyName, account_name: companyName } : null)
                            }
                            onChange={(event, newValue: any) => {
                                if (newValue && newValue.isNew) {
                                    setNewCompanyName(newValue.inputValue || '');
                                    setNewCompanyPhone('');
                                    setNewCompanyGSTIN('');
                                    setNewCompanyWebsite('');
                                    setNewCompanyCountry('');
                                    setNewCompanyState('');
                                    setNewCompanyCity('');
                                    setNewCompanyValidationErrors({});
                                    setCreateCompanyOpen(true);
                                } else {
                                    setCompanyName(newValue ? newValue.name : '');
                                }
                            }}
                            filterOptions={(options, params) => {
                                const { inputValue } = params;
                                const isExisting = options.some((option) => option.account_name.toLowerCase() === inputValue.toLowerCase());
                                const filtered = options.filter(option => 
                                    option.account_name.toLowerCase().includes(inputValue.toLowerCase()) ||
                                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                                );

                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        name: 'new-option',
                                        account_name: `+ Create "${inputValue}"`,
                                        isNew: true,
                                        inputValue
                                    } as any);
                                } else if (inputValue === '') {
                                    filtered.push({
                                        name: 'new-option',
                                        account_name: '+ Create Company',
                                        isNew: true,
                                        inputValue: ''
                                    } as any);
                                }
                                return filtered;
                            }}
                            renderOption={(props, option: any) => {
                                const { key, ...optionProps } = props as any;
                                return (
                                    <Box 
                                        component="li" 
                                        key={key || option.name || option.account_name} 
                                        {...optionProps} 
                                        sx={{
                                            typography: 'body2',
                                            display: 'flex !important',
                                            flexDirection: 'column !important',
                                            alignItems: 'flex-start !important',
                                            textAlign: 'left !important',
                                            width: '100% !important',
                                            py: 1,
                                            ...(option.isNew && {
                                                flexDirection: 'row !important',
                                                alignItems: 'center !important',
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.08)} !important`,
                                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                                                mt: 0.5,
                                                '&:hover': {
                                                    bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.16)} !important`,
                                                }
                                            })
                                        }}
                                    >
                                        {option.isNew ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, px: 1 }}>
                                                <Iconify icon="solar:add-circle-bold" width={24} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    {option.inputValue ? `Create "${option.inputValue}"` : 'Create Company'}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <Typography variant="body2" sx={{ fontWeight: '600', textAlign: 'left !important', width: '100% !important' }}>
                                                    {option.account_name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'left !important', width: '100% !important' }}>
                                                    ID: {option.name}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                );
                            }}
                            renderInput={(params) => <TextField {...params} label="Company Name" />}
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

            <DialogActions sx={{ m: 1 }}>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : (contactId ? 'Update Client' : 'Create Client')}
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog 
            open={createCompanyOpen} 
            onClose={() => !creatingCompany && setCreateCompanyOpen(false)} 
            fullWidth 
            maxWidth="md" 
            PaperProps={{ sx: { borderRadius: 2, boxShadow: (themeVar) => themeVar.customShadows.z24, } }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                New Company
                <IconButton
                    aria-label="close"
                    onClick={() => !creatingCompany && setCreateCompanyOpen(false)}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    sx={{
                        display: 'grid',
                        margin: '1rem',
                        columnGap: 2,
                        rowGap: 3,
                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                    }}
                >
                    <TextField
                        fullWidth
                        label="Company Name"
                        value={newCompanyName}
                        onChange={(e) => {
                            setNewCompanyName(e.target.value);
                            if (e.target.value) setNewCompanyValidationErrors(prev => ({ ...prev, accountName: false }));
                        }}
                        required
                        error={!!newCompanyValidationErrors.accountName}
                        helperText={newCompanyValidationErrors.accountName ? 'Company Name is required' : ''}
                        placeholder="e.g. Acme Corp"
                    />

                    <MuiTelInput
                        fullWidth
                        defaultCountry="IN"
                        label="Phone Number"
                        name="phone_number"
                        value={newCompanyPhone}
                        onChange={(val) => {
                            setNewCompanyPhone(val);
                            if (val) setNewCompanyValidationErrors(prev => ({ ...prev, phone: false }));
                        }}
                        required
                        error={!!newCompanyValidationErrors.phone}
                        helperText={newCompanyValidationErrors.phone ? 'Phone Number is required' : ''}
                        sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                                WebkitTextFillColor: 'inherit',
                                color: 'inherit',
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="GSTIN"
                        name="gstin"
                        value={newCompanyGSTIN}
                        onChange={(e) => setNewCompanyGSTIN(e.target.value)}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                    />

                    <Autocomplete
                        fullWidth
                        options={countryOptions.filter(o => o !== '')}
                        value={newCompanyCountry}
                        onChange={(e, newValue) => setNewCompanyCountry(newValue || '')}
                        renderInput={(params) => <TextField {...params} label="Country" />}
                    />

                    <Autocomplete
                        fullWidth
                        disabled={!newCompanyCountry}
                        options={newCompanyStateOptions.filter(o => o !== '')}
                        value={newCompanyState}
                        onChange={(e, newValue) => setNewCompanyState(newValue || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="State"
                                placeholder={!newCompanyCountry ? "Select Country First" : ""}
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        disabled={!newCompanyState}
                        options={newCompanyCityOptions.filter(o => o !== '')}
                        value={newCompanyCity}
                        onChange={(e, newValue) => setNewCompanyCity(newValue || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="City"
                                placeholder={!newCompanyState ? "Select State First" : ""}
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />

                    <TextField
                        fullWidth
                        label="Website"
                        value={newCompanyWebsite}
                        onChange={(e) => setNewCompanyWebsite(e.target.value)}
                        placeholder="e.g. https://www.acme.com"
                        sx={{ gridColumn: { sm: 'span 2' } }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button variant="contained" onClick={handleQuickCreateCompany} disabled={creatingCompany}>
                    {creatingCompany ? 'Creating...' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    </>
    );
}
