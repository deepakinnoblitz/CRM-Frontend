import dayjs from 'dayjs';

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

const SessionTimelineBar = ({ session }: { session: any }) => {
    const theme = useTheme();
    if (!session || !session.login_time) return null;

    const parseTime = (dateStr: string) => {
        if (!dateStr) return 0;
        let d = dayjs(dateStr);
        if (!d.isValid() && typeof dateStr === 'string' && dateStr.includes(':')) {
            d = dayjs(`2000-01-01 ${dateStr}`);
        }
        return d.hour() * 3600 + d.minute() * 60 + d.second();
    };

    const startSec = parseTime(session.login_time);

    let endSec = session.logout_time ? parseTime(session.logout_time) : 0;
    if (!endSec && session.intervals && session.intervals.length > 0) {
        const lastInterval = session.intervals[session.intervals.length - 1];
        if (lastInterval.to_time) endSec = parseTime(lastInterval.to_time);
    }
    if (!endSec) endSec = parseTime(new Date().toISOString());
    if (endSec <= startSec) endSec = startSec + 3600;

    const totalDuration = Math.max(endSec - startSec, 1);

    const activeSegments = (session.intervals || []).map((int: any) => {
        const from = parseTime(int.from_time);
        const to = int.to_time ? parseTime(int.to_time) : endSec;
        return {
            left: ((from - startSec) / totalDuration) * 100,
            width: ((to - from) / totalDuration) * 100,
            color: theme.palette.primary.main,
            type: 'Active'
        };
    });

    const breakSegments = (session.breaks || []).map((brk: any) => {
        const from = parseTime(brk.break_start);
        const to = brk.break_end ? parseTime(brk.break_end) : endSec;
        return {
            left: ((from - startSec) / totalDuration) * 100,
            width: ((to - from) / totalDuration) * 100,
            color: theme.palette.warning.main,
            type: 'Break'
        };
    });

    const segments = [...activeSegments, ...breakSegments];

    return (
        <Box sx={{ width: '100%', mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.success.main, 0.12),
                        color: 'success.main',
                    }}
                >
                    <Iconify icon="solar:chart-square-bold" width={20} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Timeline Overview
                </Typography>
            </Stack>
            <Box sx={{ width: '100%', height: 24, bgcolor: alpha(theme.palette.grey[500], 0.16), borderRadius: 1.5, position: 'relative', overflow: 'hidden' }}>
                {segments.map((seg, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: 'absolute',
                            left: `${Math.max(0, Math.min(100, seg.left))}%`,
                            width: `${Math.max(0, Math.min(100 - seg.left, seg.width))}%`,
                            height: '100%',
                            bgcolor: seg.color,
                        }}
                    />
                ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {fTime(session.login_time)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {session.logout_time ? fTime(session.logout_time) : 'Active'}
                </Typography>
            </Box>
        </Box>
    );
};

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

                    <SessionTimelineBar session={session} />

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
