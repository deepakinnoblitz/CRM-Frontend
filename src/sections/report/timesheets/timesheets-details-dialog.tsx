import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    timesheet: any;
};

export function TimesheetDetailsDialog({ open, onClose, timesheet }: Props) {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Timesheet Details</Typography>
                <IconButton onClick={onClose} sx={{ color: theme.palette.grey[500] }}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4 }}>
                {timesheet ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Header Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: 'primary.main',
                                }}
                            >
                                <Iconify icon={"solar:clock-circle-bold-duotone" as any} width={32} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                    {timesheet.employee_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Date: {timesheet.timesheet_date ? fDate(timesheet.timesheet_date, 'DD-MM-YYYY') : '-'}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                    {timesheet.total_hours || 0} hrs
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled', fontWeight: 700 }}>
                                    ID: {timesheet.name}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        {/* Timesheet Information Section */}
                        <Box>
                            <SectionHeader title="Timesheet Information" icon="" />
                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 2.5,
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                }}
                            >
                                <DetailCard label="Employee" value={timesheet.employee_name} icon="solar:user-rounded-bold-duotone" />
                                <DetailCard
                                    label="Date"
                                    value={timesheet.timesheet_date ? fDate(timesheet.timesheet_date, 'DD-MM-YYYY') : '-'}
                                    icon="solar:calendar-date-bold-duotone"
                                />
                                <DetailCard
                                    label="Total Hours"
                                    value={`${timesheet.total_hours || 0} hours`}
                                    icon="solar:history-bold-duotone"
                                    highlight
                                />
                            </Box>
                        </Box>

                        {/* Notes Section */}
                        {timesheet.notes && (
                            <Box>
                                <SectionHeader title="Notes" icon="solar:notes-bold-duotone" />
                                <Box
                                    sx={{
                                        p: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {timesheet.notes}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Timesheet Entries Section */}
                        {timesheet.timesheet_entries && timesheet.timesheet_entries.length > 0 && (
                            <Box>
                                <SectionHeader title="Timesheet Entries" icon="" />
                                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <Box component="thead" sx={{ bgcolor: 'background.neutral' }}>
                                                <Box component="tr">
                                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' }}>
                                                        Project
                                                    </Box>
                                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' }}>
                                                        Activity Type
                                                    </Box>
                                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' }}>
                                                        Hours
                                                    </Box>
                                                    <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' }}>
                                                        Description
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box component="tbody">
                                                {timesheet.timesheet_entries.map((entry: any, index: number) => (
                                                    <Box component="tr" key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                                        <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {entry.project}
                                                            </Typography>
                                                        </Box>
                                                        <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                            <Typography variant="body2">
                                                                {entry.activity_type}
                                                            </Typography>
                                                        </Box>
                                                        <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                                {entry.hours} hrs
                                                            </Typography>
                                                        </Box>
                                                        <Box component="td" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                                {entry.description || '-'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <Iconify icon={"solar:ghost-bold-duotone" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'text.secondary' }}>No Timesheet Found</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

function SectionHeader({ title, icon }: { title: string; icon?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            {icon && (
                <Box sx={{ display: 'flex', p: 0.75, borderRadius: 1, bgcolor: 'primary.main', color: 'common.white' }}>
                    <Iconify icon={icon as any} width={18} />
                </Box>
            )}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'text.secondary', fontSize: 12 }}>
                {title}
            </Typography>
        </Box>
    );
}

function DetailCard({ label, value, icon, highlight = false }: { label: string; value?: string | null; icon: string; highlight?: boolean }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => highlight ? alpha(theme.palette.primary.main, 0.08) : 'background.neutral',
                border: (theme) => highlight ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={icon as any} width={20} sx={{ color: highlight ? 'primary.main' : 'text.disabled' }} />
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, textTransform: 'uppercase' }}>
                    {label}
                </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: highlight ? 'primary.main' : 'text.primary' }}>
                {value || '-'}
            </Typography>
        </Box>
    );
}
