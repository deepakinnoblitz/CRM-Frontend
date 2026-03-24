import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';

import { fDate, fTime, fDecimalHours } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: VoidFunction;
    session: any;
};

export function EmployeeDailyLogDetailsDialog({ open, onClose, session }: Props) {
    const theme = useTheme();

    if (!session) return null;

    const { login_date, login_time, logout_time, total_work_hours, status, intervals = [], breaks = [] } = session;

    const renderDetailItem = (label: string, value: string) => (
        <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 15 }}>
                {value}
            </Typography>
        </Box>
    );

    const formatDuration = (seconds: number) => fDecimalHours(seconds / 3600);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Details for {fDate(login_date, 'DD MMM YYYY')}
                </Typography>
                <IconButton onClick={onClose}>
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4 }}>
                <Scrollbar sx={{ maxHeight: 600 }}>
                    
                    {/* Summary Section */}
                    <Box sx={{ mb: 5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: alpha(theme.palette.info.main, 0.12),
                                    color: 'info.main',
                                }}
                            >
                                <Iconify icon={"solar:user-id-bold" as any} width={20} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                Session Summary
                            </Typography>
                        </Stack>

                        <Box
                            display="grid"
                            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                            gap={{ xs: 3, sm: 4 }}
                            sx={{ mt: 1, pl: { sm: 2 } }}
                        >
                            {renderDetailItem(
                                "Login Date",
                                login_date ? fDate(login_date, 'DD MMM YYYY') : '-'
                            )}
                            {renderDetailItem(
                                "Status",
                                status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
                            )}
                            {renderDetailItem(
                                "Login Time",
                                login_time ? `${fDate(login_date, 'DD MMM YYYY')} ${fTime(login_time)}` : '-'
                            )}
                            {renderDetailItem(
                                "Logout Time",
                                logout_time ? `${fDate(login_date, 'DD MMM YYYY')} ${fTime(logout_time)}` : 'Active'
                            )}
                            {renderDetailItem(
                                "Total Work Hours",
                                total_work_hours ? fDecimalHours(total_work_hours) : '0 secs'
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed', mb: 5 }} />

                    <Stack spacing={5} direction={{ xs: 'column', md: 'row' }}>
                        
                        {/* Activity Timeline */}
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    }}
                                >
                                    <Iconify icon={"solar:history-bold" as any} width={20} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                    Activity Timeline
                                </Typography>
                            </Stack>

                            <Stack spacing={3}>
                                {intervals.map((interval: any, index: number) => (
                                    <Stack key={index} direction="row" spacing={2.5}>
                                        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Box
                                                sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '50%',
                                                    border: `3px solid ${theme.palette.primary.main}`,
                                                    bgcolor: 'background.paper',
                                                    zIndex: 1
                                                }}
                                            />
                                            {index !== intervals.length - 1 && (
                                                <Box
                                                    sx={{
                                                        width: 2,
                                                        flexGrow: 1,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                        my: 0.5,
                                                        minHeight: 24
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {fTime(interval.from_time)} — {interval.to_time ? fTime(interval.to_time) : 'Active'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase' }}>
                                                Duration: {interval.duration_seconds ? formatDuration(interval.duration_seconds) : 'Tracking...'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                ))}
                            </Stack>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', display: { xs: 'none', md: 'block' } }} />

                        {/* Breaks Section */}
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                                        color: 'warning.main',
                                    }}
                                >
                                    <Iconify icon={"ph:coffee-fill" as any} width={20} />
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                    Break Intervals
                                </Typography>
                            </Stack>

                            {breaks.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 5, bgcolor: alpha(theme.palette.grey[500], 0.04), borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                        No breaks recorded for this session.
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={2.5}>
                                    {breaks.map((brk: any, index: number) => (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            alignItems="center"
                                            spacing={2}
                                            sx={{
                                                p: 2,
                                                borderRadius: 1.5,
                                                bgcolor: alpha(theme.palette.warning.main, 0.04),
                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                                            }}
                                        >
                                            <Iconify icon={"ph:coffee-fill" as any} sx={{ color: 'warning.main' }} />
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                    {fTime(brk.break_start)} — {brk.break_end ? fTime(brk.break_end) : 'On Break'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 900 }}>
                                                    {brk.break_duration ? fDecimalHours(brk.break_duration / 60) : 'Active'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </Scrollbar>
            </DialogContent>
        </Dialog>
    );
}
