import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { fDate } from 'src/utils/format-time';

import { getHRDoc } from 'src/api/hr-management';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';
// ----------------------------------------------------------------------

export function MyProfileView() {
    const { user } = useAuth();
    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.employee) {
            setLoading(true);
            getHRDoc('Employee', user.employee)
                .then(setEmployee)
                .catch((err) => console.error('Failed to fetch employee details:', err))
                .finally(() => setLoading(false));
        }
    }, [user?.employee]);

    const renderStatus = (status: string) => (
        <Label variant="soft" color={status === 'Active' ? 'success' : 'error'}>
            {status}
        </Label>
    );

    return (
        <DashboardContent>
            <Container maxWidth="lg">
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
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: (theme) => employee.profile_picture
                                            ? 'transparent'
                                            : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                        color: 'white',
                                        overflow: 'hidden',
                                        border: (theme) => `3px solid ${theme.palette.background.paper}`,
                                        boxShadow: (theme) => `0 8px 24px ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.4)'}`,
                                        flexShrink: 0,
                                        position: 'relative',
                                    }}
                                >
                                    {employee.profile_picture ? (
                                        <Box component="img" src={employee.profile_picture} sx={{ width: 1, height: 1, objectFit: 'cover' }} />
                                    ) : (
                                        <Iconify icon={"solar:user-bold" as any} width={50} />
                                    )}
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
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                        {employee.ctc ? `₹${parseFloat(employee.ctc).toLocaleString()}` : '-'}
                                    </Typography>
                                </Box>

                                {/* Earnings & Deductions Grid */}
                                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
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
                                            <SalaryItem label="Basic Pay" value={employee.basic_pay} />
                                            <SalaryItem label="HRA" value={employee.hra} />
                                            <SalaryItem label="Conveyance" value={employee.conveyance_allowances} />
                                            <SalaryItem label="Medical" value={employee.medical_allowances} />
                                            <SalaryItem label="Other Allowances" value={employee.other_allowances} />
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
                                            <SalaryItem label="PF Deduction" value={employee.pf} />
                                            <SalaryItem label="ESI/Health Insurance" value={employee.health_insurance} />
                                            <SalaryItem label="Professional Tax" value={employee.professional_tax} />
                                            <SalaryItem label="Loan Recovery" value={employee.loan_recovery} />
                                        </Box>
                                    </Box>
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
        </DashboardContent>
    );
}

function SectionHeader({ title, icon, noMargin = false }: { title: string; icon: string, noMargin?: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: noMargin ? 0 : 2.5 }}>
            <Iconify icon={icon as any} width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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

function SalaryItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {value ? `₹${parseFloat(value.toString()).toLocaleString()}` : '-'}
            </Typography>
        </Box>
    );
}
