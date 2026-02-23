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

const TimelineDayCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'isToday' && prop !== 'statusColor',
})<{ isToday?: boolean; statusColor?: string }>(
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
        const status = record.status;
        const holiday = record.holiday_info;
        const isNonWorking = holiday && record.holiday_is_working_day === 0;

        // Colors mapping
        const colors: Record<string, string> = {
            'Present': theme.palette.success.main,
            'In Office': theme.palette.info.main,
            'Missing': theme.palette.warning.main,
            'Missing Log': theme.palette.warning.main,
            'Half Day': theme.palette.warning.main,
            'On Leave': theme.palette.success.main,
            'Holiday': theme.palette.error.main,
            'Absent': theme.palette.error.main,
            'Updating...': theme.palette.info.main,
            'Not Marked': theme.palette.error.main,
            'Weekly Off': theme.palette.error.main,
        };

        let label = status;
        if (status === 'Missing') label = 'Missing Log';
        if (status === 'Not Marked') label = isToday ? 'Updating...' : 'Absent';

        // Special case for today: if only check-in exists
        if (isToday && record.check_in && !record.check_out) {
            label = 'In Office';
        }

        const color = colors[label] || (isNonWorking ? theme.palette.error.main : theme.palette.grey[500]);

        // For non-working days (holidays/weekends) without logs, show specific holiday info in the small pill
        if (isNonWorking && !record.check_in && !record.check_out && (status === 'Holiday' || status === 'Weekly Off' || status === 'Not Marked')) {
            return {
                label: holiday || label,
                color,
                dotColor: color,
                bgcolor: alpha(color, 0.12)
            };
        }

        return {
            label,
            color,
            dotColor: color,
            bgcolor: alpha(color, 0.12)
        };
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

                {/* 3-4 Grid Layout (Desktop) / Vertical Stack (Mobile) */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        rowGap: 5,
                        columnGap: 4,
                        width: '100%',
                        py: 3
                    }}
                >
                    {data.map((record, index) => {
                        const status = getStatusInfo(record);
                        const isToday = record.date === todayStr;
                        const isNonWorking = record.holiday_info && record.holiday_is_working_day === 0;

                        // Grid Logic: 3 items in row 1 (span 4), 4 items in row 2 (span 3)
                        const gridSpan = index < 3 ? 4 : 3;

                        const progress = Math.min((record.working_hours / 9) * 100, 100);

                        // Improved hours label logic (Center text)
                        let centerLabel = `${record.working_hours.toFixed(1)}h`;
                        if (record.working_hours === 0) {
                            if (isNonWorking && (record.status === 'Holiday' || record.status === 'Weekly Off' || record.status === 'Not Marked')) {
                                centerLabel = record.holiday_info ? record.holiday_info.toUpperCase() : 'HOLIDAY';
                            } else if (status.label === 'In Office') {
                                centerLabel = 'IN OFFICE';
                            } else if (status.label === 'Missing Log') {
                                centerLabel = 'MISSING LOG';
                            } else if (isToday && status.label === 'Updating...') {
                                centerLabel = 'Will Update Soon';
                            } else {
                                centerLabel = status.label.toUpperCase();
                            }
                        }

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
                                        p: 3,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        minHeight: 120
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent={isNonWorking && record.working_hours === 0 ? "center" : "space-between"}
                                            sx={{ mb: 1.5 }}
                                        >
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 800,
                                                    lineHeight: 1.2,
                                                    textAlign: isNonWorking && record.working_hours === 0 ? 'center' : 'inherit',
                                                    fontSize: centerLabel.length > 20 ? '0.75rem' : (centerLabel.length > 12 ? '0.875rem' : '1.125rem'),
                                                    color: record.working_hours >= 9 ? 'success.main' :
                                                        (record.working_hours > 0 ? 'error.main' :
                                                            (centerLabel.includes('HOLIDAY') || centerLabel.includes('SATURDAY') || centerLabel.includes('SUNDAY') ? 'error.main' :
                                                                (centerLabel === 'Will Update Soon' ? 'info.main' : 'text.primary')))
                                                }}
                                            >
                                                {centerLabel}
                                            </Typography>
                                            {!isNonWorking && status.label.toUpperCase() !== centerLabel && (
                                                <StatusPill bgcolor={status.bgcolor} color={status.dotColor} sx={{ px: 1, py: 0.35, fontSize: '0.65rem', fontWeight: 800 }}>
                                                    {status.label}
                                                </StatusPill>
                                            )}
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

                                        {!(isNonWorking && record.working_hours === 0) && (
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
                                        )}
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
