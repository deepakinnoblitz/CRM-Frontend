import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: any;
};

export function SalarySlipPreviewDialog({ open, onClose, onConfirm, data }: Props) {
    if (!data) return null;

    const formatDate = (date: string) => {
        if (!date) return '-';
        return dayjs(date).format('DD-MM-YYYY');
    };

    const renderHeader = (
        <Box
            sx={{
                p: 3,
                mb: 3,
                textAlign: 'center',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
        >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 800, color: 'primary.main' }}>
                SALARY SLIP
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Period: {formatDate(data.pay_period_start)} — {formatDate(data.pay_period_end)}
            </Typography>
        </Box>
    );

    const renderEmployeeDetails = (
        <Box sx={{ mb: 4 }}>
            <SectionHeader title="Employee Details" icon="solar:user-id-bold" color="primary.main" />
            <Box
                sx={{
                    p: 3,
                    borderRadius: 2,
                    display: 'grid',
                    gap: 3,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                }}
            >
                <InfoRow label="Employee" value={data.employee} />
                <InfoRow label="Bank Name" value={data.bank_name || '-'} />
                <InfoRow label="Employee Name" value={data.employee_name} />
                <InfoRow label="Email" value={data.email || '-'} />
                <InfoRow label="Department" value={data.department || '-'} />
                <InfoRow label="Personal Email" value={data.personal_email || '-'} />
                <InfoRow label="Designation" value={data.designation || '-'} />
                <Box />
                <InfoRow label="Date of Joining" value={formatDate(data.date_of_joining)} />
            </Box>
        </Box>
    );

    const renderAttendanceSummary = (
        <Box sx={{ mb: 4 }}>
            <SectionHeader title="Attendance Summary" icon="solar:calendar-date-bold" color="warning.main" />
            <Box
                sx={{
                    p: 3,
                    borderRadius: 2,
                    display: 'grid',
                    gap: 3,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                    border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                }}
            >
                <InfoRow label="No of Leave" value={data.no_of_leave || 0} />
                <InfoRow label="Total Working Days" value={data.total_working_days || 0} />
                <InfoRow label="LOP Days" value={data.lop_days || 0} />
                <InfoRow label="No of Paid Leave" value={data.no_of_paid_leave || 0} />
            </Box>
        </Box>
    );

    const renderSalaryBreakdown = (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {/* Earnings */}
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.success.main, 0.04), border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
                    <SectionHeader title="Earnings" icon="solar:wad-of-money-bold" color="success.main" />
                    <Stack spacing={1.5}>
                        <AmountRow label="Basic Pay" amount={data.basic_pay} />
                        <AmountRow label="HRA" amount={data.hra} />
                        <AmountRow label="Conveyance" amount={data.conveyance_allowances} />
                        <AmountRow label="Medical" amount={data.medical_allowances} />
                        <AmountRow label="Other Allowances" amount={data.other_allowances} />
                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                        <AmountRow label="Gross Earnings" amount={data.gross_pay} isTotal color="success.main" />
                    </Stack>
                </Box>

                {/* Deductions */}
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.error.main, 0.04), border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.12)}` }}>
                    <SectionHeader title="Deductions" icon="solar:hand-money-bold" color="error.main" />
                    <Stack spacing={1.5}>
                        <AmountRow label="EPF" amount={data.pf} />
                        <AmountRow label="ESI/Health Insurance" amount={data.health_insurance} />
                        <AmountRow label="Professional Tax" amount={data.professional_tax} />
                        <AmountRow label="Loan Recovery" amount={data.loan_recovery} />
                        <AmountRow label="LOP" amount={data.lop} />
                        <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                        <AmountRow label="Total Deductions" amount={data.total_deduction} isTotal color="error.main" />
                    </Stack>
                </Box>
            </Box>
        </Box>
    );

    const renderNetPay = (
        <Box
            sx={{
                p: 3,
                mt: 1,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'common.white',
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: (theme) => `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.4)}`,
            }}
        >
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                    NET SALARY PAYABLE
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.72, fontWeight: 500 }}>
                    (Gross Earnings - Total Deductions)
                </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
                ₹{data.grand_net_pay?.toLocaleString() || 0}
            </Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.neutral' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Salary Slip Preview</Typography>
                <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                    <Iconify icon={"mingcute:close-line" as any} />
                </IconButton>
            </DialogTitle>

            <Scrollbar sx={{ maxHeight: '85vh' }}>
                <DialogContent sx={{ p: 4 }}>
                    {renderHeader}
                    {renderEmployeeDetails}
                    {renderAttendanceSummary}
                    <Divider sx={{ my: 4, borderStyle: 'dashed' }} />
                    {renderSalaryBreakdown}
                    {renderNetPay}

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            This is a computer generated salary slip and does not require a signature.
                        </Typography>
                    </Box>
                </DialogContent>
            </Scrollbar>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <DialogActions sx={{ p: 2.5 }}>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" onClick={onConfirm} autoFocus>
                    Confirm & Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon, color = 'text.secondary' }: { title: string; icon: string; color?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Iconify icon={icon as any} width={22} sx={{ mr: 1.5, color }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
        </Box>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
        </Box>
    );
}

function AmountRow({ label, amount, isTotal = false, color }: { label: string; amount: number; isTotal?: boolean; color?: string }) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant={isTotal ? 'subtitle2' : 'body2'} sx={{ color: isTotal ? (color || 'text.primary') : 'text.secondary', fontWeight: isTotal ? 700 : 500 }}>
                {label}
            </Typography>
            <Typography variant={isTotal ? 'subtitle1' : 'body2'} sx={{ fontWeight: isTotal ? 800 : 600, color: isTotal ? color : 'inherit' }}>
                ₹{amount?.toLocaleString() || 0}
            </Typography>
        </Box>
    );
}
