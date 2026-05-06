import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';

import { fDate } from 'src/utils/format-time';
import { frappeRequest } from 'src/utils/csrf';
import { fNumber } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import { getHRDoc, getHRSettings } from 'src/api/hr-management';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

import { ProfileBadges } from '../profile-badges';
import { PersonalityManagement } from '../../overview/personality-management';

// ----------------------------------------------------------------------

export function MyProfileView() {
    const { user, setUser } = useAuth();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });
    const [hrSettings, setHRSettings] = useState<{ default_currency: string; currency_symbol: string; default_locale: string }>({
        default_currency: 'INR',
        currency_symbol: '₹',
        default_locale: 'en-IN'
    });

    useEffect(() => {
        getHRSettings().then(setHRSettings).catch(console.error);
    }, []);

    const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

    const fetchEmployee = useCallback(() => {
        if (user?.employee) {
            setLoading(true);
            getHRDoc('Employee', user.employee)
                .then(setEmployee)
                .catch((err) => console.error('Failed to fetch employee details:', err))
                .finally(() => setLoading(false));
        }
    }, [user?.employee]);

    useEffect(() => {
        fetchEmployee();
    }, [fetchEmployee]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.employee) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_private', '0');
        formData.append('doctype', 'Employee');
        formData.append('docname', user.employee);
        formData.append('fieldname', 'profile_picture');

        try {
            const res = await frappeRequest('/api/method/upload_file', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const result = await res.json();
            const fileUrl = result.message?.file_url || result.file_url;

            if (fileUrl) {
                // Update employee record
                await frappeRequest(`/api/resource/Employee/${encodeURIComponent(user.employee)}`, {
                    method: 'PUT',
                    body: JSON.stringify({ profile_picture: fileUrl }),
                });

                // Update global user state for header avatar
                setUser({
                    ...user,
                    user_image: fileUrl,
                });

                setSnackbar({ open: true, message: 'Profile picture updated successfully', severity: 'success' });
                fetchEmployee();
            }
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            setSnackbar({ open: true, message: 'Failed to update profile picture', severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const renderStatus = (status: string) => (
        <Label variant="soft" color={status === 'Active' ? 'success' : 'error'}>
            {status}
        </Label>
    );

    return (
        <DashboardContent maxWidth={false}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 5 }}>
                    My Profile
                </Typography>

                <Card sx={{
                    p: 4,
                    boxShadow: (theme) => theme.customShadows?.z24,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                }}>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={40} sx={{ color: 'primary.main' }} />
                        </Box>
                    ) : employee ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {/* Header Info */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        '&:hover .edit-icon': {
                                            opacity: 1,
                                            transform: 'scale(1)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: (theme) => {
                                                if (employee.profile_picture) return 'transparent';
                                                const colors = ['#E2F0CB', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#FFB7B2', '#FF9AA2'];
                                                let hash = 0;
                                                const name = employee.employee_name || '';
                                                for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash * 31) - hash);
                                                return colors[Math.abs(hash) % colors.length];
                                            },
                                            overflow: 'hidden',
                                            border: (theme) => `4px solid ${theme.palette.background.paper}`,
                                            boxShadow: (theme) => `0 8px 32px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.4)'}`,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {employee.profile_picture ? (
                                            <Box component="img" src={employee.profile_picture} sx={{ width: 1, height: 1, objectFit: 'cover' }} />
                                        ) : (
                                            <Typography variant="h2" sx={{
                                                fontWeight: 800,
                                                color: (theme) => {
                                                    const name = employee.employee_name || '';
                                                    let hash = 0;
                                                    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash * 31) - hash);
                                                    const textColors = ['#4F7942', '#2D5A27', '#3F51B5', '#BF360C', '#C62828', '#AD1457'];
                                                    return textColors[Math.abs(hash) % textColors.length];
                                                }
                                            }}>
                                                {(employee.employee_name || '?').charAt(0).toUpperCase()}
                                            </Typography>
                                        )}


                                        {uploading && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    bgcolor: 'rgba(0,0,0,0.4)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 1,
                                                }}
                                            >
                                                <Iconify icon={"svg-spinners:12-dots-scale-rotate" as any} width={30} sx={{ color: 'white' }} />
                                            </Box>
                                        )}
                                    </Box>

                                    <Tooltip title={uploading ? "Uploading..." : "Change Profile Picture"} placement="top">
                                        <IconButton
                                            className="edit-icon"
                                            component="label"
                                            disabled={uploading}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 2,
                                                right: 2,
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                                padding: 0.8,
                                                opacity: 0.9,
                                                transform: 'scale(0.9)',
                                                transition: (theme) => theme.transitions.create(['opacity', 'transform']),
                                                boxShadow: (theme) => theme.customShadows?.z8,
                                                '&:hover': {
                                                    bgcolor: 'primary.dark',
                                                    opacity: 1,
                                                    transform: 'scale(1)',
                                                },
                                            }}
                                        >
                                            <Iconify icon={"solar:camera-bold" as any} width={18} />
                                            <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{employee.employee_name}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{employee.designation} at {employee.department}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                    {renderStatus(employee.status)}
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                        ID: {employee.name}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Contact Information */}
                            <Box>
                                <SectionHeader title="Contact Information" icon="solar:phone-calling-bold" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Official Email" value={employee.email} icon="solar:letter-bold" />
                                    <DetailItem label="Personal Email" value={employee.personal_email} icon="solar:letter-bold" />
                                    <DetailItem label="Personal Phone" value={employee.phone} icon="solar:phone-bold" />
                                    <DetailItem label="Office Phone" value={employee.office_phone_number} icon="solar:phone-bold" />
                                    <DetailItem label="User Login" value={employee.user} icon="solar:user-bold" />
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Employment Details */}
                            <Box>
                                <SectionHeader title="Employment Details" icon="solar:case-bold" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Department" value={employee.department} icon="solar:buildings-bold" />
                                    <DetailItem label="Designation" value={employee.designation} icon="solar:medal-star-bold" />
                                    <DetailItem label="Joining Date" value={fDate(employee.date_of_joining, 'DD-MM-YYYY')} icon="solar:calendar-bold" />
                                    <DetailItem label="Status" value={employee.status} icon="solar:info-circle-bold" />
                                    <DetailItem label="Date of Birth" value={fDate(employee.dob, 'DD-MM-YYYY')} icon="solar:calendar-bold" />
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Location Details */}
                            <Box>
                                <SectionHeader title="Location Details" icon="solar:earth-bold" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Country" value={employee.country} icon="solar:earth-bold" />
                                    <DetailItem label="State" value={employee.state} icon="solar:map-point-bold" />
                                    <DetailItem label="City" value={employee.city} icon="solar:map-point-bold" />
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Bank & Identification */}
                            <Box>
                                <SectionHeader title="Bank & Identification" icon="solar:card-bold" />
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gap: 3,
                                        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    }}
                                >
                                    <DetailItem label="Bank Name" value={employee.bank_name} icon="solar:buildings-bold" />
                                    <DetailItem label="Bank Account" value={employee.bank_account} icon="solar:card-bold" />
                                    <DetailItem label="PF Number" value={employee.pf_number} icon="solar:document-bold" />
                                    <DetailItem label="ESI No" value={employee.esi_no} icon="solar:health-bold" />
                                </Box>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Employee Evaluation Metrics */}

                            <Grid size={{ xs: 12 }}>
                                <PersonalityManagement />
                            </Grid>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Badges & Achievements */}
                            <Box>
                                <SectionHeader title="Badges & Achievements" icon="solar:medal-ribbon-bold" />
                                <ProfileBadges employeeId={employee.name} />
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed' }} />

                            {/* Salary & Finance */}
                            <Box>
                                <SectionHeader title="Financial Summary" icon="solar:wallet-money-bold" />

                                {/* CTC Card */}
                                <Box sx={{
                                    mb: 3,
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                                    border: (theme) => `1px solid ${theme.palette.divider}`,
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Iconify icon={"solar:dollar-minimalistic-bold" as any} width={20} sx={{ color: 'primary.main' }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                                            Cost to Company (Monthly)
                                        </Typography>
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                        <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 1, fontSize: '0.8em', color: 'primary.main' }}>{hrSettings.currency_symbol}</Box>
                                        {employee.ctc ? fNumber(parseFloat(employee.ctc), { locale: hrSettings.default_locale }) : '-'}
                                    </Typography>
                                </Box>

                                {/* Earnings & Deductions Grid */}
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} sx={{ mb: 3 }}>
                                    {/* Earnings Card */}
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: (theme) => theme.palette.mode === 'light' ? 'success.lighter' : 'grey.900',
                                        border: (theme) => `1px solid ${theme.palette.success.light}`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'success.main',
                                                color: 'white'
                                            }}>
                                                <Iconify icon={"solar:chart-2-bold" as any} width={18} />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.darker' }}>
                                                Earnings
                                            </Typography>
                                        </Box>
                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                            {(employee.earnings || []).map((item: any, idx: number) => (
                                                <SalaryItem key={idx} label={item.component_name} value={item.amount} hrSettings={hrSettings} />
                                            ))}
                                            {(!employee.earnings || employee.earnings.length === 0) && (
                                                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No earnings defined</Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Deductions Card */}
                                    <Box sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: (theme) => theme.palette.mode === 'light' ? 'warning.lighter' : 'grey.900',
                                        border: (theme) => `1px solid ${theme.palette.warning.light}`,
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 1.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: 'warning.main',
                                                color: 'white'
                                            }}>
                                                <Iconify icon={"solar:chart-square-bold" as any} width={18} />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.darker' }}>
                                                Deductions
                                            </Typography>
                                        </Box>
                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                            {(employee.deductions || []).map((item: any, idx: number) => (
                                                <SalaryItem key={idx} label={item.component_name} value={item.amount} hrSettings={hrSettings} />
                                            ))}
                                            {(!employee.deductions || employee.deductions.length === 0) && (
                                                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No deductions defined</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Net Salary Summary */}
                                <Box sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                    border: (theme) => `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                                }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Net Salary (Monthly)</Typography>
                                            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                                                <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 1, fontSize: '0.8em', color: 'primary.main' }}>{hrSettings.currency_symbol}</Box>
                                                {fNumber(employee.net_salary || 0, { locale: hrSettings.default_locale })}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={4}>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Earnings</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main', display: 'flex', alignItems: 'center' }}>
                                                    + <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5, color: 'success.main' }}>{hrSettings.currency_symbol}</Box>
                                                    {fNumber(employee.total_earnings || 0, { locale: hrSettings.default_locale })}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Deductions</Typography>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main', display: 'flex', alignItems: 'center' }}>
                                                    - <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mx: 0.5, color: 'error.main' }}>{hrSettings.currency_symbol}</Box>
                                                    {fNumber(employee.total_deductions || 0, { locale: hrSettings.default_locale })}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Iconify icon={"solar:ghost-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Employee Profile Found</Typography>
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Please ensure your account is linked to an Employee record.</Typography>
                        </Box>
                    )}
                </Card>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 1.5, fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '14px' }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailItem({ label, value, icon, color = 'text.primary' }: { label: string; value?: string | null; icon: string; color?: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                    {value || '-'}
                </Typography>
            </Box>
        </Box>
    );
}

function SalaryItem({ label, value, hrSettings }: { label: string; value?: string | number | null, hrSettings: any }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                <Box component="span" sx={{ fontFamily: "Arial, 'sans-serif'", mr: 0.5, fontSize: '0.9em', color: 'text.primary' }}>{hrSettings.currency_symbol}</Box>
                {value ? fNumber(parseFloat(value.toString()), { locale: hrSettings.default_locale }) : '-'}
            </Typography>
        </Box>
    );
}
