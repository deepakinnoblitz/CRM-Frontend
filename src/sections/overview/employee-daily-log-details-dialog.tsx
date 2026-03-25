import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
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

    const formatShortDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.round((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
        return `${mins}m`;
    };

    const formattedTimeFromSec = (sec: number) => {
        const hrs = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        return dayjs().hour(hrs).minute(mins).format('h:mm a');
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

    // Split and merge logic
    const timePointsSet = new Set<number>();
    timePointsSet.add(startSec);
    timePointsSet.add(endSec);
    (session.intervals || []).forEach((int: any) => {
        timePointsSet.add(parseTime(int.from_time));
        if (int.to_time) timePointsSet.add(parseTime(int.to_time));
    });
    (session.breaks || []).forEach((brk: any) => {
        timePointsSet.add(parseTime(brk.break_start));
        if (brk.break_end) timePointsSet.add(parseTime(brk.break_end));
    });

    const sortedTimePoints = Array.from(timePointsSet)
        .filter(t => t >= startSec && t <= endSec)
        .sort((a, b) => a - b);

    const rawSegments: any[] = [];
    for (let i = 0; i < sortedTimePoints.length - 1; i++) {
        const from = sortedTimePoints[i];
        const to = sortedTimePoints[i + 1];
        if (from === to) continue;

        const mid = (from + to) / 2;

        const isInBreak = (session.breaks || []).find((brk: any) => {
            const bStart = parseTime(brk.break_start);
            const bEnd = brk.break_end ? parseTime(brk.break_end) : endSec;
            return mid >= bStart && mid <= bEnd;
        });

        if (isInBreak) {
            rawSegments.push({ from, to, type: 'Break' });
            continue;
        }

        const isInActive = (session.intervals || []).find((int: any) => {
            const iStart = parseTime(int.from_time);
            const iEnd = int.to_time ? parseTime(int.to_time) : endSec;
            return mid >= iStart && mid <= iEnd;
        });

        if (isInActive) {
            rawSegments.push({ from, to, type: 'Active' });
        } else {
            rawSegments.push({ from, to, type: 'Offline' });
        }
    }

    const mergedSegments: any[] = [];
    if (rawSegments.length > 0) {
        let current = { ...rawSegments[0] };
        for (let i = 1; i < rawSegments.length; i++) {
            // Only merge if they are NOT active or if we want to preserve short blips?
            // Actually, merging same types is good, but we should check duration AFTER merge.
            // But wait, if we have [Active 10m] [Active 4s] [Active 5m], they should probably be one Green block.
            // If the user sees them as separate in the list, but they are consecutive, merging them makes sense.
            // HOWEVER, the user example shows 11:37-11:37 as a separate item.
            // If I merge them, it becomes one block.
            // Let's NOT merge Active segments if we want to see the "4s" blip as grey.
            // But if they are perfectly consecutive, it's just one continuous activity.
            // The 4s blip might be a "gap" in reality if it was 11:37:00-11:37:04 and the next started at 11:37:04.
            
            if (rawSegments[i].type === current.type) {
                current.to = rawSegments[i].to;
            } else {
                mergedSegments.push(current);
                current = { ...rawSegments[i] };
            }
        }
        mergedSegments.push(current);
    }

    const segments = mergedSegments.map((seg) => {
        const duration = seg.to - seg.from;
        const width = (duration / totalDuration) * 100;
        const left = ((seg.from - startSec) / totalDuration) * 100;
        
        const isBreak = seg.type === 'Break';
        const isOffline = seg.type === 'Offline';
        const isShortActive = seg.type === 'Active' && duration < 60; // Less than 1 minute

        let color = alpha(theme.palette.success.main, 0.8);
        let textColor = '#FFFFFF';

        if (isBreak) {
            color = alpha('#ffab00', 0.8);
            textColor = '#664d00'; // Darker version of #ffab00 for readability
        } else if (isOffline || isShortActive) {
            color = alpha(theme.palette.grey[500], 0.16);
            textColor = theme.palette.text.disabled;
        }

        return {
            left,
            width,
            color,
            textColor,
            label: formatShortDuration(duration),
            tooltip: `${seg.type}: ${formattedTimeFromSec(seg.from)} - ${formattedTimeFromSec(seg.to)} (${fDecimalHours(duration / 3600)})`,
            showLabel: width > 8 && !isOffline && !isShortActive
        };
    });

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
            <Box sx={{ width: '100%', height: 32, bgcolor: alpha(theme.palette.grey[500], 0.12), borderRadius: 1.5, position: 'relative', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                {segments.map((seg, i) => (
                    <Tooltip key={i} title={seg.tooltip} arrow>
                        <Box
                            sx={{
                                position: 'absolute',
                                left: `${Math.max(0, Math.min(100, seg.left))}%`,
                                width: `${Math.max(0, Math.min(100 - seg.left, seg.width))}%`,
                                height: '100%',
                                bgcolor: seg.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRight: `1px solid ${alpha(theme.palette.common.black, 0.05)}`,
                                transition: theme.transitions.create('background-color'),
                                '&:hover': {
                                    bgcolor: alpha(seg.color, 0.9),
                                }
                            }}
                        >
                            {seg.showLabel && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: seg.textColor,
                                        fontWeight: 800,
                                        fontSize: 10,
                                        whiteSpace: 'nowrap',
                                        pointerEvents: 'none',
                                        textShadow: '0 0 4px rgba(255,255,255,0.5)'
                                    }}
                                >
                                    {seg.label}
                                </Typography>
                            )}
                        </Box>
                    </Tooltip>
                ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, px: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {fTime(session.login_time)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    {session.logout_time ? fTime(session.logout_time) : 'Active Now'}
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
