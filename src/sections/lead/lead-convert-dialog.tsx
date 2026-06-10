import { MuiTelInput } from 'mui-tel-input';
import React, { useState, useEffect } from 'react';

import Step from '@mui/material/Step';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { getStates, getCities, updateLead, getDoctypeList } from 'src/api/leads';

const STEPS = ['Client Details', 'Company Details'];

type Props = {
    open: boolean;
    onClose: () => void;
    lead: any;
    onReadyToConvert: () => void;
    onError: (msg: string) => void;
};

export function LeadConvertDialog({ open, onClose, lead, onReadyToConvert, onError }: Props) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [countryOptions, setCountryOptions] = useState<string[]>([]);
    const [clientStateOptions, setClientStateOptions] = useState<string[]>([]);
    const [clientCityOptions, setClientCityOptions] = useState<string[]>([]);
    const [companyStateOptions, setCompanyStateOptions] = useState<string[]>([]);
    const [companyCityOptions, setCompanyCityOptions] = useState<string[]>([]);

    useEffect(() => {
        getDoctypeList('Country', ['name']).then((list) => {
            const mapped = list.map((item: any) => item?.name || item?.label || String(item) || '');
            setCountryOptions(["", ...mapped.filter(Boolean)]);
        });
    }, []);

    // Client Location Options
    useEffect(() => {
        if (formData.client_country) {
            getStates(formData.client_country).then(setClientStateOptions);
        } else {
            setClientStateOptions([]);
        }
    }, [formData.client_country]);

    useEffect(() => {
        if (formData.client_country && formData.client_state) {
            getCities(formData.client_country, formData.client_state).then(setClientCityOptions);
        } else {
            setClientCityOptions([]);
        }
    }, [formData.client_country, formData.client_state]);

    // Company Location Options
    useEffect(() => {
        if (formData.company_country) {
            getStates(formData.company_country).then(setCompanyStateOptions);
        } else {
            setCompanyStateOptions([]);
        }
    }, [formData.company_country]);

    useEffect(() => {
        if (formData.company_country && formData.company_state) {
            getCities(formData.company_country, formData.company_state).then(setCompanyCityOptions);
        } else {
            setCompanyCityOptions([]);
        }
    }, [formData.company_country, formData.company_state]);

    useEffect(() => {
        if (open && lead) {
            setActiveStep(0);
            setFormData({
                lead_name: lead.lead_name || lead.first_name || '',
                email: lead.email || lead.email_id || '',
                client_phone: lead.phone_number || '',
                client_type: lead.client_type || '',
                company_name: lead.company_name || '',
                client_country: lead.country || '',
                client_state: lead.state || '',
                client_city: lead.city || '',
                billing_address: lead.billing_address || '',
                company_phone: lead.phone_number || '',
                gstin: lead.gstin || '',
                company_country: lead.country || '',
                company_state: lead.state || '',
                company_city: lead.city || '',
                website: lead.website || '',
            });
        }
    }, [open, lead]);

    const handleNext = async () => {
        if (activeStep === 0) {
            setActiveStep(1);
        } else {
            // Save data
            setLoading(true);
            try {
                const finalData = { ...formData };
                // Ensure standard frappe fields are populated as fallback
                finalData.phone_number = formData.company_phone || formData.client_phone;
                finalData.country = formData.company_country || formData.client_country;
                finalData.state = formData.company_state || formData.client_state;
                finalData.city = formData.company_city || formData.client_city;

                await updateLead(lead.name, finalData);
                onClose();
                onReadyToConvert();
            } catch (err: any) {
                onError(err.message || "Failed to update lead details");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        setActiveStep(0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Dialog open={open} onClose={!loading ? onClose : undefined} fullWidth maxWidth="sm">
            <DialogTitle>Convert Lead</DialogTitle>
            <DialogContent dividers>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Stack spacing={3}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Please review and update the client details before conversion.
                        </Typography>
                        <TextField fullWidth label="Name" required name="lead_name" value={formData.lead_name || ''} onChange={handleChange} />
                        <TextField fullWidth label="Email" required name="email" value={formData.email || ''} onChange={handleChange} />
                        
                        <MuiTelInput
                            fullWidth
                            defaultCountry="IN"
                            label="Phone Number"
                            name="client_phone"
                            value={formData.client_phone || ''}
                            onChange={(newValue: string) => {
                                setFormData({ ...formData, client_phone: newValue });
                            }}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>Client Type</InputLabel>
                            <Select
                                value={formData.client_type || ''}
                                label="Client Type"
                                name="client_type"
                                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                            >
                                <MenuItem value="Sales">Sales</MenuItem>
                                <MenuItem value="Purchase">Purchase</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField fullWidth label="Company Name" name="company_name" value={formData.company_name || ''} onChange={handleChange} />
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Autocomplete
                                fullWidth
                                options={(countryOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.client_country || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, client_country: val, client_state: '', client_city: '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Country" />}
                            />
                            <Autocomplete
                                fullWidth
                                disabled={!formData.client_country}
                                options={(clientStateOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.client_state || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, client_state: val, client_city: '' });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="State"
                                        placeholder={!formData.client_country ? "Select Country First" : ""}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                            <Autocomplete
                                fullWidth
                                disabled={!formData.client_state}
                                options={(clientCityOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.client_city || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, client_city: val });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City"
                                        placeholder={!formData.client_state ? "Select State First" : ""}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Stack>
                        <TextField fullWidth multiline rows={3} label="Address" name="billing_address" value={formData.billing_address || ''} onChange={handleChange} />
                    </Stack>
                )}

                {activeStep === 1 && (
                    <Stack spacing={3}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Please review and update the company details before conversion.
                        </Typography>
                        <TextField fullWidth label="Company Name" required name="company_name" value={formData.company_name || ''} onChange={handleChange} />
                        
                        <MuiTelInput
                            fullWidth
                            defaultCountry="IN"
                            label="Phone Number"
                            name="company_phone"
                            value={formData.company_phone || ''}
                            onChange={(newValue: string) => {
                                setFormData({ ...formData, company_phone: newValue });
                            }}
                            required
                        />

                        <TextField fullWidth label="GSTIN" name="gstin" value={formData.gstin || ''} onChange={handleChange} />
                        
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Autocomplete
                                fullWidth
                                options={(countryOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.company_country || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, company_country: val, company_state: '', company_city: '' });
                                }}
                                renderInput={(params) => <TextField {...params} label="Country" />}
                            />
                            <Autocomplete
                                fullWidth
                                disabled={!formData.company_country}
                                options={(companyStateOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.company_state || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, company_state: val, company_city: '' });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="State"
                                        placeholder={!formData.company_country ? "Select Country First" : ""}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                            <Autocomplete
                                fullWidth
                                disabled={!formData.company_state}
                                options={(companyCityOptions || []).filter(Boolean)}
                                getOptionLabel={(option: any) => option?.label || option?.name || option || ''}
                                isOptionEqualToValue={(option: any, value: any) => 
                                    (option?.label || option?.name || option) === (value?.label || value?.name || value)
                                }
                                value={formData.company_city || ''}
                                onChange={(e, newValue: any) => {
                                    const val = newValue?.label || newValue?.name || newValue || '';
                                    setFormData({ ...formData, company_city: val });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City"
                                        placeholder={!formData.company_state ? "Select State First" : ""}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />
                        </Stack>
                        <TextField fullWidth label="Website" name="website" value={formData.website || ''} onChange={handleChange} />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancel
                </Button>
                {activeStep === 1 && (
                    <Button onClick={handleBack} disabled={loading} color="inherit">
                        Back
                    </Button>
                )}
                <Button variant="contained" onClick={handleNext} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : activeStep === 1 ? 'Next / Review' : 'Next'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

