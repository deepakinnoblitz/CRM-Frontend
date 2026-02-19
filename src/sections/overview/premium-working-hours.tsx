import type { CardProps } from '@mui/material/Card';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { alpha, useTheme, styled } from '@mui/material/styles';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

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
    title?: string;
    data: AttendanceRecord[];
    weeklyTarget?: number;
};

// Styled Components
const GlassSummaryCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderRadius: 20,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.02)})`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    transition: theme.transitions.create(['transform', 'box-shadow']),
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.16)}`,
    },
}));

const TimelineDayCard = styled(Card)<{ isToday?: boolean; statusColor?: string }>(
    ({ theme, isToday, statusColor }) => ({
        padding: theme.spacing(2),
        borderRadius: 20,
        backgroundColor: alpha(statusColor || theme.palette.grey[300], 0.04),
        border: `1px solid ${alpha(statusColor || theme.palette.grey[300], 0.2)}`,
        boxShadow: isToday
            ? `0 12px 32px ${alpha(statusColor || theme.palette.primary.main, 0.12)}, 0 4px 12px ${alpha(statusColor || theme.palette.primary.main, 0.08)}`
            : `0 8px 24px ${alpha(theme.palette.common.black, 0.04)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
        transition: theme.transitions.create(['transform', 'box-shadow', 'border-color', 'background-color']),
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
            transform: 'translateY(-6px) scale(1.01)',
            boxShadow: `0 20px 48px ${alpha(statusColor || theme.palette.common.black, 0.12)}`,
            borderColor: alpha(statusColor || theme.palette.grey[300], 0.4),
            backgroundColor: alpha(statusColor || theme.palette.grey[300], 0.08),
        },
    })
);

const StatusPill = styled(Box)<{ bgcolor: string; color: string }>(({ bgcolor, color }) => ({
    padding: '4px 10px',
    borderRadius: 8,
    backgroundColor: bgcolor,
    color: color,
    fontSize: '0.6875rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'inline-flex',
    alignItems: 'center',
}));

export function PremiumWorkingHours({ title = 'Weekly Working Hours', data, weeklyTarget = 45, sx, ...other }: Props) {
    const theme = useTheme();

    // Get today's date
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Calculate analytics
    const totalHours = data.reduce((sum, record) => sum + (record.working_hours || 0), 0);
    const daysWithData = data.filter((r) => r.check_in || r.check_out).length;
    const avgHours = daysWithData > 0 ? totalHours / daysWithData : 0;

    // Updated logic: Include holidays/non-working days as present
    const daysPresent = data.filter((r) =>
        (r.check_in && r.check_out) ||
        (r.holiday_info && r.holiday_is_working_day === 0)
    ).length;

    // Format time
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '--:--';
        try {
            const parts = timeStr.split(':');
            const hr = parseInt(parts[0], 10);
            const min = parts[1];
            const ampm = hr >= 12 ? 'PM' : 'AM';
            return `${hr % 12 || 12}:${min} ${ampm}`;
        } catch (e) { return '--:--'; }
    };

    // Get status info
    const getStatusInfo = (record: AttendanceRecord) => {
        const isToday = record.date === todayStr;
        const isHoliday = !!record.holiday_info;
        const isNonWorking = isHoliday && record.holiday_is_working_day === 0;

        if (isNonWorking) return {
            label: record.holiday_info || 'Weekend',
            color: theme.palette.info.main,
            dotColor: theme.palette.info.main,
            bgcolor: alpha(theme.palette.info.main, 0.12)
        };

        if (isToday) {
            if (record.check_in && record.check_out) return { label: 'Present', color: theme.palette.success.main, dotColor: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.12) };
            if (record.check_in) return { label: 'In Office', color: theme.palette.info.main, dotColor: theme.palette.info.main, bgcolor: alpha(theme.palette.info.main, 0.12) };
            return { label: 'Updating...', color: theme.palette.warning.main, dotColor: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.12) };
        }

        if (record.check_in && record.check_out) return { label: 'Present', color: theme.palette.success.main, dotColor: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.12) };
        if (record.check_in || record.check_out) return { label: 'Missing Log', color: theme.palette.warning.main, dotColor: theme.palette.warning.main, bgcolor: alpha(theme.palette.warning.main, 0.12) };
        return { label: 'Absent', color: theme.palette.error.main, dotColor: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.12) };
    };

    return (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.grey[500], 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                ...sx
            }}
            {...other}
        >
            <CardHeader
                title={title}
                subheader={data.length > 0 ? `${fDate(data[0].date)} - ${fDate(data[data.length - 1].date)}` : ''}
                sx={{ mb: 3 }}
            />

            <Box sx={{ px: 3, pb: 4 }}>
                {/* Analytics Summary */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                    <GlassSummaryCard sx={{ flex: 1 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
                            <Iconify icon={"solar:clock-circle-bold-duotone" as any} width={28} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 900 }}>{totalHours.toFixed(1)}h</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Weekly Total</Typography>
                        </Box>
                    </GlassSummaryCard>
                    <GlassSummaryCard sx={{ flex: 1 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', display: 'flex' }}>
                            <Iconify icon={"solar:chart-2-bold-duotone" as any} width={28} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 900 }}>{avgHours.toFixed(1)}h</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Daily Avg</Typography>
                        </Box>
                    </GlassSummaryCard>
                    <GlassSummaryCard sx={{ flex: 1 }}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', display: 'flex' }}>
                            <Iconify icon={"solar:user-check-bold-duotone" as any} width={28} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 900 }}>{daysPresent}/{data.length}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Days Present</Typography>
                        </Box>
                    </GlassSummaryCard>
                </Stack>

                {/* 4-3 Grid Layout (Desktop) / Vertical Stack (Mobile) */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        rowGap: 4,
                        columnGap: 2.5,
                        width: '100%',
                        py: 2
                    }}
                >
                    {data.map((record, index) => {
                        const status = getStatusInfo(record);
                        const isToday = record.date === todayStr;

                        // Grid Logic: 4 items in row 1 (span 3), 3 items in row 2 (span 4)
                        const gridSpan = index < 4 ? 3 : 4;

                        const progress = Math.min((record.working_hours / 9) * 100, 100);
                        const hoursLabel = record.working_hours > 0
                            ? `${record.working_hours.toFixed(1)}h`
                            : (record.holiday_info ? 'HOLIDAY' : 'RELAX');

                        return (
                            <Box
                                key={index}
                                sx={{
                                    gridColumn: { xs: 'span 12', sm: 'span 6', md: `span ${gridSpan}` },
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Date Header */}
                                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2, ml: 0.75 }}>
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            bgcolor: 'background.paper',
                                            border: `2.5px solid ${status.dotColor}`,
                                            boxShadow: `0 0 0 4px ${alpha(status.dotColor, 0.1)}`,
                                            zIndex: 1,
                                            flexShrink: 0
                                        }}
                                    />
                                    <Typography variant="subtitle2" sx={{ color: isToday ? 'primary.main' : 'text.primary', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.75, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                        {fDate(record.date, 'ddd, DD MMM')}
                                    </Typography>
                                    {isToday && (
                                        <Box
                                            sx={{
                                                px: 1,
                                                py: 0.2,
                                                borderRadius: 0.75,
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                color: 'primary.main',
                                                typography: 'overline',
                                                fontWeight: 900,
                                                fontSize: '0.65rem'
                                            }}
                                        >
                                            Now
                                        </Box>
                                    )}
                                </Stack>

                                <TimelineDayCard
                                    isToday={isToday}
                                    statusColor={status.dotColor}
                                    sx={{
                                        p: 2.5,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        minHeight: 110
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: record.working_hours > 9 ? 'primary.main' : 'text.primary' }}>
                                                {hoursLabel}
                                                {record.working_hours > 9 && (
                                                    <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'success.main', fontWeight: 900, verticalAlign: 'middle' }}>
                                                        +{(record.working_hours - 9).toFixed(1)}
                                                    </Typography>
                                                )}
                                            </Typography>
                                            <StatusPill bgcolor={status.bgcolor} color={status.dotColor} sx={{ px: 1, py: 0.35, fontSize: '0.65rem', fontWeight: 800 }}>
                                                {status.label}
                                            </StatusPill>
                                        </Stack>

                                        {record.working_hours > 0 && (
                                            <Box sx={{ mb: 1.5 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={progress}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: alpha(status.dotColor, 0.1),
                                                        [`& .MuiLinearProgress-bar`]: {
                                                            borderRadius: 3,
                                                            bgcolor: status.dotColor,
                                                            backgroundImage: `linear-gradient(90deg, ${alpha(status.dotColor, 0.6)} 0%, ${status.dotColor} 100%)`
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
                                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
                                                <Iconify icon={"solar:login-3-bold-duotone" as any} width={16} sx={{ color: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {formatTime(record.check_in)}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
                                                <Iconify icon={"solar:logout-3-bold-duotone" as any} width={16} sx={{ color: 'text.disabled' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {formatTime(record.check_out)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>

                                    {isToday && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: -4,
                                                    left: -4,
                                                    right: -4,
                                                    bottom: -4,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${theme.palette.primary.main}`,
                                                    animation: 'pulse 2s infinite',
                                                },
                                                '@keyframes pulse': {
                                                    '0%': { transform: 'scale(1)', opacity: 0.8 },
                                                    '100%': { transform: 'scale(2.5)', opacity: 0 }
                                                }
                                            }}
                                        />
                                    )}
                                </TimelineDayCard>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Card>
    );
}
