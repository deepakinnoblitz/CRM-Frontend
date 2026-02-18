import type { CardProps } from '@mui/material/Card';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
const GlassCard = styled(Card)(({ theme }) => ({
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.02)})`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    borderRadius: 20,
    padding: theme.spacing(3),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.16)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
    },
}));

const DayCard = styled(Card)<{ isToday?: boolean; statusColor?: string }>(
    ({ theme, isToday, statusColor }) => ({
        minWidth: 140,
        padding: theme.spacing(2),
        borderRadius: 16,
        borderLeft: `4px solid ${statusColor || theme.palette.grey[300]}`,
        background: theme.palette.background.paper,
        boxShadow: isToday
            ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.16)}`
            : '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&::before': isToday
            ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            }
            : {},
        '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
        },
    })
);

export function PremiumWorkingHours({ title, data, weeklyTarget = 45, sx, ...other }: Props) {
    const theme = useTheme();
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Get today's date
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Calculate analytics
    const totalHours = data.reduce((sum, record) => sum + (record.working_hours || 0), 0);
    const daysWithData = data.filter((r) => r.check_in || r.check_out).length;
    const avgHours = daysWithData > 0 ? totalHours / daysWithData : 0;
    const daysPresent = data.filter((r) => r.check_in && r.check_out).length;

    // Format time
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '--:--';
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

    // Format hours
    const formatHours = (duration: number) => {
        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);
        return { hours, minutes, display: `${hours}h ${minutes}m` };
    };

    // Get status info
    const getStatusInfo = (record: AttendanceRecord) => {
        const isToday = record.date === todayStr;
        const isHoliday = record.holiday_info && record.holiday_info.startsWith('Holiday:');
        const isNonWorkingDay = isHoliday && record.holiday_is_working_day === 0;

        // Weekend/Non-working day (holiday_is_working_day = 0)
        if (isNonWorkingDay) {
            return {
                label: 'Weekend',
                color: theme.palette.grey[600],
                bgcolor: alpha(theme.palette.grey[500], 0.12),
                icon: 'solar:calendar-bold-duotone',
                borderColor: theme.palette.grey[400],
            };
        }

        // TODAY logic
        if (isToday) {
            // Both check-in and check-out present
            if (record.check_in && record.check_out) {
                return {
                    label: 'Present',
                    color: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    icon: 'solar:check-circle-bold-duotone',
                    borderColor: theme.palette.success.main,
                };
            }

            // Only check-in present (check-in captured)
            if (record.check_in && !record.check_out) {
                return {
                    label: 'In Office',
                    color: theme.palette.info.main,
                    bgcolor: alpha(theme.palette.info.main, 0.12),
                    icon: 'solar:login-3-bold-duotone',
                    borderColor: theme.palette.info.main,
                };
            }

            // Both missing (check-in will update soon)
            return {
                label: 'Check-in will update soon',
                color: theme.palette.warning.main,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                icon: 'solar:clock-circle-bold-duotone',
                borderColor: theme.palette.warning.main,
            };
        }

        // PREVIOUS DAYS logic
        // Both check-in and check-out present
        if (record.check_in && record.check_out) {
            return {
                label: 'Present',
                color: theme.palette.success.main,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                icon: 'solar:check-circle-bold-duotone',
                borderColor: theme.palette.success.main,
            };
        }

        // Only check-in OR only check-out (missing log)
        if (record.check_in || record.check_out) {
            return {
                label: 'Missing Log',
                color: theme.palette.warning.main,
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                icon: 'solar:danger-triangle-bold-duotone',
                borderColor: theme.palette.warning.main,
            };
        }

        // Both missing (absent)
        return {
            label: 'Absent',
            color: theme.palette.error.main,
            bgcolor: alpha(theme.palette.error.main, 0.12),
            icon: 'solar:close-circle-bold-duotone',
            borderColor: theme.palette.error.main,
        };
    };

    const totalFormatted = formatHours(totalHours);
    const avgFormatted = formatHours(avgHours);

    return (
        <Box sx={sx} {...other}>
            {/* Analytics Summary */}
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <GlassCard sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.32)}`,
                            }}
                        >
                            <Iconify icon="solar:clock-circle-bold-duotone" width={32} sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                                {totalFormatted.display}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Total This Week
                            </Typography>
                        </Box>
                    </Stack>
                </GlassCard>

                <GlassCard sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                                boxShadow: `0 8px 16px ${alpha(theme.palette.info.main, 0.32)}`,
                            }}
                        >
                            <Iconify icon={"solar:chart-2-bold-duotone" as any} width={32} sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                                {avgFormatted.display}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Average Per Day
                            </Typography>
                        </Box>
                    </Stack>
                </GlassCard>

                <GlassCard sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.32)}`,
                            }}
                        >
                            <Iconify icon={"solar:user-check-bold-duotone" as any} width={32} sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                                {daysPresent}/{data.length}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Days Present
                            </Typography>
                        </Box>
                    </Stack>
                </GlassCard>
            </Stack>

            {/* Horizontal Timeline */}
            <Box
                sx={{
                    overflowX: 'auto',
                    pb: 2,
                    mb: 3,
                    '&::-webkit-scrollbar': {
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: alpha(theme.palette.grey[500], 0.08),
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: alpha(theme.palette.primary.main, 0.24),
                        borderRadius: 4,
                        '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.4),
                        },
                    },
                }}
            >
                <Stack direction="row" spacing={2} sx={{ minWidth: 'max-content' }}>
                    {data.map((record, index) => {
                        const statusInfo = getStatusInfo(record);
                        const isToday = record.date === todayStr;
                        const dayName = fDate(record.date, 'ddd');
                        const dayDate = fDate(record.date, 'DD');
                        const hoursFormatted = formatHours(record.working_hours);

                        return (
                            <DayCard
                                key={index}
                                isToday={isToday}
                                statusColor={statusInfo.borderColor}
                                onClick={() => setSelectedDay(index)}
                                sx={{
                                    opacity: selectedDay === null || selectedDay === index ? 1 : 0.6,
                                }}
                            >
                                {/* Day Header */}
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.disabled',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                            }}
                                        >
                                            {dayName}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                            {dayDate}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: statusInfo.bgcolor,
                                        }}
                                    >
                                        <Iconify icon={statusInfo.icon as any} width={24} sx={{ color: statusInfo.color }} />
                                    </Box>
                                </Stack>

                                {/* Status Badge */}
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: statusInfo.bgcolor,
                                        display: 'inline-flex',
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: statusInfo.color,
                                            fontWeight: 700,
                                            fontSize: '0.6875rem',
                                        }}
                                    >
                                        {statusInfo.label}
                                    </Typography>
                                </Box>

                                {/* Time Info */}
                                <Stack spacing={1}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                            {formatTime(record.check_in)}
                                        </Typography>
                                        <Iconify icon={"solar:arrow-right-linear" as any} width={14} sx={{ color: 'text.disabled' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                                            {formatTime(record.check_out)}
                                        </Typography>
                                    </Stack>

                                    {record.working_hours > 0 && (
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 800,
                                                color: 'primary.main',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {hoursFormatted.display}
                                        </Typography>
                                    )}
                                </Stack>
                            </DayCard>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}
