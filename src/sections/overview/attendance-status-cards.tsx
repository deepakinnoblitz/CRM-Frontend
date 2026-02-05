import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type AttendanceRecord = {
    date: string;
    status: string;
    check_in: string | null;
    check_out: string | null;
    working_hours: number;
    holiday_info?: string;
    holiday_is_working_day: number;
};

type Props = CardProps & {
    title: string;
    data: AttendanceRecord[];
};

const TOTAL_HOURS = 9;

export function AttendanceStatusCards({ title, data, sx, ...other }: Props) {
    const theme = useTheme();

    const formatHours = (duration: number) => {
        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '-';
        try {
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const hr = hours % 12 || 12;
                const min = minutes < 10 ? `0${minutes}` : minutes;
                return `${hr}:${min} ${ampm}`;
            }
            return timeStr;
        } catch (e) {
            return timeStr;
        }
    };

    const getTimelineContent = (record: AttendanceRecord) => {
        // Correctly identify today based on local date string YYYY-MM-DD
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const isToday = record.date === todayStr;
        const isHoliday = record.holiday_info && record.holiday_info.startsWith('Holiday:');
        const isNonWorkingHoliday = isHoliday && record.holiday_is_working_day === 0;

        // 1. Holiday Logic (Non-working)
        if (isNonWorkingHoliday) {
            return {
                type: 'label',
                background: 'linear-gradient(135deg, #ffa500, #ffcc80)',
                text: record.holiday_info?.replace('Holiday: ', '') || 'Holiday',
            };
        }

        // 2. Today's Logic
        if (isToday) {
            // Both check-in and check-out
            if (record.check_in && record.check_out) {
                const duration = record.working_hours;
                const widthPercent = Math.min((duration / TOTAL_HOURS) * 100, 100);
                return {
                    type: 'bar',
                    width: widthPercent,
                    background:
                        duration < TOTAL_HOURS
                            ? 'linear-gradient(90deg, #ff7f7f, #ff4d4d)'
                            : 'linear-gradient(90deg, #56ccf2, #28a745)',
                    text: formatHours(duration),
                };
            }
            // Only Check-in
            if (record.check_in) {
                return {
                    type: 'label',
                    background: 'linear-gradient(135deg, #43a047, #66bb6a)',
                    text: `Check-in captured at ${formatTime(record.check_in)}`,
                };
            }
            // No In/Out for Today
            return {
                type: 'label',
                background: 'linear-gradient(135deg, #e53935, #ff5252)',
                text: 'Check-in will update soon',
            };
        }

        // 3. Previous Days' Logic

        // Both check-in and check-out - show timeline bar (Present)
        if (record.check_in && record.check_out) {
            const duration = record.working_hours;
            const widthPercent = Math.min((duration / TOTAL_HOURS) * 100, 100);

            return {
                type: 'bar',
                width: widthPercent,
                background:
                    duration < TOTAL_HOURS
                        ? 'linear-gradient(90deg, #ff7f7f, #ff4d4d)'
                        : 'linear-gradient(90deg, #56ccf2, #28a745)',
                text: formatHours(duration),
            };
        }

        // Only check-in or only check-out
        if (record.check_in || record.check_out) {
            return {
                type: 'label',
                background: 'linear-gradient(135deg, #fbc02d, #f57c00)',
                text: record.check_in ? 'Check-in updated' : 'Checkout updated',
            };
        }

        // On Leave
        if (record.status === 'On Leave') {
            return {
                type: 'label',
                background: 'linear-gradient(135deg, #2196f3, #64b5f6)',
                text: 'On Leave',
            };
        }

        // Database status 'Absent' or any missing log for previous days
        return {
            type: 'label',
            background: 'linear-gradient(135deg, #757575, #bdbdbd)',
            text: 'Absent',
        };
    };

    return (
        <Card
            sx={{
                p: 3,
                boxShadow: (themeVar) => themeVar.customShadows?.card,
                border: (themeVar) => `1px solid ${alpha(themeVar.palette.grey[500], 0.08)}`,
                ...sx,
            }}
            {...other}
        >
            {/* Header */}
            <Typography
                variant="h6"
                sx={{
                    mb: 3,
                    textAlign: 'center',
                    pb: 1,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    fontWeight: 700,
                }}
            >
                {title}
            </Typography>

            {/* Grid of cards */}
            <Grid container spacing={2}>
                {data.map((record, index) => {
                    const timeline = getTimelineContent(record);

                    return (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    p: 2,
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    },
                                }}
                            >
                                {/* Date Header */}
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 700,
                                        mb: 1.5,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {fDate(record.date, 'DD-MM-YYYY')}
                                </Typography>

                                {/* Timeline Bar/Label */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 32,
                                        borderRadius: 2,
                                        background: alpha(theme.palette.grey[500], 0.08),
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                        mb: 1.5,
                                    }}
                                >
                                    {timeline.type === 'bar' ? (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                width: `${timeline.width}%`,
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                background: timeline.background,
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            {timeline.text}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                background: timeline.background,
                                                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                                            }}
                                        >
                                            {timeline.text}
                                        </Box>
                                    )}
                                </Box>

                                {/* Footer - Check-in/out times */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: 'text.secondary',
                                    }}
                                >
                                    <Typography variant="caption" component="span">
                                        <strong>In:</strong> {formatTime(record.check_in)}
                                    </Typography>
                                    <Typography variant="caption" component="span">
                                        <strong>Out:</strong> {formatTime(record.check_out)}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Card>
    );
}
