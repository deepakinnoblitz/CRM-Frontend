import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, keyframes, styled, useTheme } from '@mui/material/styles';

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
    source?: 'Attendance' | 'Daily Log';
};

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DayCard = styled(Card, {
    shouldForwardProp: (prop) => !['accentColor', 'isToday'].includes(String(prop)),
})<{ accentColor: string; isToday?: boolean }>(({ theme, accentColor, isToday }) => ({
    position: 'relative',
    minHeight: 164,
    padding: theme.spacing(1.75),
    borderRadius: 18,
    overflow: 'hidden',
    background: alpha('#ffffff', 0.96),
    border: `1px solid ${alpha(isToday ? accentColor : '#dbe4f0', isToday ? 0.34 : 0.95)}`,
    boxShadow: `0 10px 24px ${alpha('#0f172a', 0.05)}`,
    transition: theme.transitions.create(['transform', 'box-shadow', 'border-color', 'background-color'], {
        duration: theme.transitions.duration.shorter,
    }),
    animation: `${fadeInUp} 360ms ease both`,
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 14px 28px ${alpha('#0f172a', 0.08)}`,
        borderColor: alpha(accentColor, 0.3),
        backgroundColor: '#ffffff',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 10,
        bottom: 10,
        left: 0,
        width: 3,
        borderRadius: 999,
        background: accentColor,
        pointerEvents: 'none',
    },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
    height: 28,
    borderRadius: 999,
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: 0.02,
    '& .MuiChip-label': {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
}));

function formatClock(timeStr: string | null) {
    if (!timeStr) return '--:--';
    try {
        const [hh, mm] = timeStr.split(':');
        const hour = Number(hh);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${mm} ${suffix}`;
    } catch {
        return '--:--';
    }
}

export function PremiumWorkingHours({ title = 'Weekly Working Hours', data, source = 'Attendance', sx, ...other }: Props) {
    const theme = useTheme();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const dateRange =
        data.length > 0
            ? `${fDate(data[0].date, 'DD MMM YYYY')} - ${fDate(data[data.length - 1].date, 'DD MMM YYYY')}`
            : '';

    const getDayStatus = (record: AttendanceRecord) => {
        const isToday = record.date === todayStr;
        const holiday = Boolean(record.holiday_info && record.holiday_is_working_day === 0);
        const hasCheckIn = Boolean(record.check_in);
        const hasCheckOut = Boolean(record.check_out);
        const hours = record.working_hours || 0;

        if (holiday) {
            return {
                label: 'Holiday',
                title: record.holiday_info || 'Holiday',
                subtitle: 'Holiday - enjoy the day',
                chip: 'HOLIDAY',
                icon: 'solar:sun-bold-duotone',
                color: '#f59e0b',
                isToday,
            };
        }

        if (isToday && hasCheckIn && !hasCheckOut) {
            return {
                label: 'Now',
                title: 'Tracking Live',
                subtitle: 'Updating now',
                chip: 'NOW',
                icon: 'solar:play-bold-duotone',
                color: theme.palette.primary.main,
                isToday,
            };
        }

        if (hours >= 8) {
            return {
                label: 'Completed',
                title: `${hours.toFixed(1)} hrs logged`,
                subtitle: 'Goal reached',
                chip: 'COMPLETED',
                icon: 'solar:check-circle-bold-duotone',
                color: theme.palette.success.main,
                isToday,
            };
        }

        if (hours >= 4) {
            return {
                label: 'Partial',
                title: `${hours.toFixed(1)} hrs logged`,
                subtitle: 'Partial day',
                chip: 'PARTIAL',
                icon: 'solar:clock-circle-bold-duotone',
                color: theme.palette.warning.main,
                isToday,
            };
        }

        if (!hasCheckIn && !hasCheckOut) {
            return {
                label: 'Missing Log',
                title: 'No logs',
                subtitle: 'Please update attendance',
                chip: 'MISSING LOG',
                icon: 'solar:document-text-bold-duotone',
                color: '#64748b',
                isToday,
            };
        }

        if (hours > 0) {
            return {
                label: 'Absent',
                title: `${hours.toFixed(1)} hrs logged`,
                subtitle: 'Below expected hours',
                chip: 'ABSENT',
                icon: 'solar:close-circle-bold-duotone',
                color: theme.palette.error.main,
                isToday,
            };
        }

        return {
            label: 'Missing Log',
            title: 'No logs',
            subtitle: 'Please update attendance',
            chip: 'MISSING LOG',
            icon: 'solar:document-text-bold-duotone',
            color: '#64748b',
            isToday,
        };
    };

    const legendItems = [
        { label: 'Live / Tracking', color: theme.palette.primary.main },
        { label: 'Completed', color: theme.palette.success.main },
        { label: 'Partial', color: theme.palette.warning.main },
        { label: 'Absent', color: theme.palette.error.main },
        { label: 'Missing / No Data', color: '#64748b' },
        { label: 'Holiday', color: '#f59e0b' },
    ];

    return (
        <Card
            {...other}
            sx={{
                borderRadius: 4,
                border: `1px solid ${alpha('#dbe4f0', 0.8)}`,
                background: '#ffffff',
                boxShadow: `0 18px 40px ${alpha('#0f172a', 0.06)}`,
                ...sx,
            }}
        >
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2.5 }}
                >
                    <Box>
                        <Typography sx={{ fontSize: { xs: '1.6rem', md: '1.95rem' }, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.04em' }}>
                            {title}
                        </Typography>
                        <Typography sx={{ mt: 0.6, color: '#64748b', fontSize: '0.98rem', fontWeight: 500 }}>
                            {dateRange}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        {/* <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{
                                height: 42,
                                px: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${alpha('#cbd5e1', 0.9)}`,
                                backgroundColor: alpha('#ffffff', 0.96),
                                boxShadow: `0 6px 14px ${alpha('#0f172a', 0.04)}`,
                            }}
                        >
                            <Iconify icon="solar:calendar-mark-bold-duotone" width={18} sx={{ color: '#334155' }} />
                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>This Week</Typography>
                            <Iconify icon="solar:alt-arrow-down-linear" width={16} sx={{ color: '#475569' }} />
                        </Stack> */}

                        <IconButton
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                border: `1px solid ${alpha('#cbd5e1', 0.9)}`,
                                backgroundColor: alpha('#ffffff', 0.96),
                                boxShadow: `0 6px 14px ${alpha('#0f172a', 0.04)}`,
                                color: '#475569',
                            }}
                        >
                            <Iconify icon={`solar:refresh-outline` as any} width={20} />
                        </IconButton>
                    </Stack>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(3, minmax(0, 1fr))',
                            xl: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: { xs: 1.5, md: 2 },
                    }}
                >
                    {data.map((record, index) => {
                        const status = getDayStatus(record);
                        const loginLabel = source === 'Daily Log' ? 'Login' : 'In';
                        const logoutLabel = source === 'Daily Log' ? 'Logout' : 'Out';

                        return (
                                <DayCard
                                    accentColor={status.color}
                                    isToday={status.isToday}
                                    sx={{
                                        animationDelay: `${index * 60}ms`,
                                        ...(status.isToday && {
                                            backgroundColor: alpha(status.color, 0.03),
                                        }),
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                        <Typography
                                            sx={{
                                                fontSize: '0.76rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                color: status.isToday ? status.color : '#334155',
                                            }}
                                        >
                                        {fDate(record.date, 'ddd,DD MMMM')}
                                        </Typography>

                                        <StatusChip
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: status.color,
                                                            boxShadow: `0 0 0 3px ${alpha(status.color, 0.12)}`,
                                                        }}
                                                    />
                                                    <Box component="span">{status.chip}</Box>
                                                </Stack>
                                            }
                                            sx={{
                                                backgroundColor: alpha(status.color, 0.08),
                                                color: status.color,
                                                border: `1px solid ${alpha(status.color, 0.14)}`,
                                            }}
                                        />
                                    </Stack>

                                    <Stack sx={{ mt: 1.5, gap: 0.8 }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box
                                                sx={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 2.5,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    bgcolor: alpha(status.color, 0.1),
                                                    color: status.color,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Iconify icon={status.icon as any} width={20} />
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', lineHeight: 1.25 }} noWrap>
                                                    {status.title}
                                                </Typography>
                                                <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.2 }} noWrap>
                                                    {status.subtitle}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{
                                                pt: 1,
                                                borderTop: `1px solid ${alpha('#cbd5e1', 0.6)}`,
                                                color: '#64748b',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Iconify icon={`solar:login-3-linear` as any} width={16} sx={{ color: status.color }} />
                                            <Typography sx={{ fontSize: '0.70rem' }}>
                                                {loginLabel}: {formatClock(record.check_in)}
                                            </Typography>
                                            <Typography sx={{ color: '#cbd5e1', fontWeight: 300 }}>|</Typography>
                                            <Iconify icon={`solar:logout-3-linear` as any} width={16} sx={{ color: status.color }} />
                                            <Typography sx={{ fontSize: '0.70rem' }}>
                                                {logoutLabel}: {formatClock(record.check_out)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </DayCard>
                        );
                    })}
                </Box>

                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    alignItems={{ xs: 'flex-start', lg: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{
                        mt: 3,
                        pt: 2.25,
                        borderTop: `1px solid ${alpha('#dbe4f0', 0.9)}`,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b', flexWrap: 'wrap' }}>
                        <Iconify icon={`solar:info-circle-linear` as any} width={18} />
                        <Typography sx={{ fontSize: '0.92rem' }}>All times are in your local timezone</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        {legendItems.map((item) => (
                            <Stack key={item.label} direction="row" alignItems="center" spacing={0.8}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: item.color,
                                        boxShadow: `0 0 0 3px ${alpha(item.color, 0.12)}`,
                                    }}
                                />
                                <Typography sx={{ fontSize: '0.86rem', color: '#475569' }}>{item.label}</Typography>
                            </Stack>
                        ))}
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#94a3b8' }}>
                        <Iconify icon={`solar:stars-line-duotone` as any} width={18} />
                        <Typography sx={{ fontSize: '0.9rem' }}>Compact weekly overview</Typography>
                    </Stack>
                </Stack>
            </Box>
        </Card>
    );
}
