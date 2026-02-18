import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

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

    const getStatusStyle = (record: AttendanceRecord) => {
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const isToday = record.date === todayStr;
        const isHoliday = record.holiday_info && record.holiday_info.startsWith('Holiday:');
        const isNonWorkingHoliday = isHoliday && record.holiday_is_working_day === 0;

        // Muted Professional Palette
        const COLORS = {
            holiday: { bg: '#FFF5CC', text: '#B76E00', dot: '#FFAB00' },
            present: { bg: '#E3F9E5', text: '#1B806A', dot: '#22C55E' },
            late: { bg: '#FFF5CC', text: '#B76E00', dot: '#FFAB00' },
            absent: { bg: '#FFE9D5', text: '#B71D18', dot: '#FF5630' },
            info: { bg: '#CAFDF5', text: '#006C9C', dot: '#00B8D9' },
        };

        if (isNonWorkingHoliday) {
            return {
                label: record.holiday_info?.replace('Holiday: ', '') || 'Holiday',
                ...COLORS.holiday,
            };
        }

        if (isToday) {
            if (record.check_in && record.check_out) {
                const isOvertime = record.working_hours >= TOTAL_HOURS;
                return {
                    label: formatHours(record.working_hours),
                    ...(isOvertime ? COLORS.present : COLORS.absent),
                };
            }
            if (record.check_in) {
                return {
                    label: 'In Office',
                    ...COLORS.info,
                };
            }
            return {
                label: 'Check-in pending',
                ...COLORS.absent,
            };
        }

        if (record.check_in && record.check_out) {
            const isOvertime = record.working_hours >= TOTAL_HOURS;
            return {
                label: 'Present',
                ...(isOvertime ? COLORS.present : COLORS.late),
            };
        }

        if (record.check_in || record.check_out) {
            return {
                label: 'Log Missing',
                ...COLORS.late,
            };
        }

        if (record.status === 'On Leave') {
            return {
                label: 'On Leave',
                ...COLORS.info,
            };
        }

        return {
            label: 'Absent',
            ...COLORS.absent,
        };
    };

    return (
        <Card
            sx={{
                p: 3,
                boxShadow: (themeVar) => themeVar.customShadows?.card,
                backgroundColor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                ...sx,
            }}
            {...other}
        >
            <Box
                sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25 }}
            >
                <Iconify icon="solar:history-bold-duotone" width={26} sx={{ color: 'primary.main' }} />
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 2,
                        color: 'text.primary',
                    }}
                >
                    {title}
                </Typography>
            </Box>

            <Grid container spacing={2.5}>
                {data.map((record, index) => {
                    const status = getStatusStyle(record);
                    const dayName = fDate(record.date, 'ddd');
                    const dayDate = fDate(record.date, 'DD MMM');

                    return (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <Card
                                sx={{
                                    p: 2.5,
                                    position: 'relative',
                                    backgroundColor: alpha(theme.palette.grey[500], 0.02),
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                    borderRadius: 2,
                                    transition: theme.transitions.create(
                                        ['transform', 'box-shadow', 'border-color', 'background-color'],
                                        {
                                            duration: theme.transitions.duration.shorter,
                                        }
                                    ),
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: (themeVar) => themeVar.customShadows?.z12,
                                        backgroundColor: 'background.paper',
                                        borderColor: theme.palette.primary.main,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 3,
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.disabled',
                                                display: 'block',
                                                lineHeight: 1,
                                                letterSpacing: 1,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                mb: 0.5,
                                            }}
                                        >
                                            {dayName}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
                                            {dayDate}
                                        </Typography>
                                    </Box>

                                    <Box
                                        className="status-pill"
                                        sx={{
                                            px: 1.5,
                                            py: 0.75,
                                            borderRadius: '12px',
                                            fontSize: '0.65rem',
                                            fontWeight: 900,
                                            color: status.text,
                                            backgroundColor: status.bg,
                                            transition: theme.transitions.create(['transform', 'background-color']),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            letterSpacing: 0.8,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        <Box
                                            sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status.dot }}
                                        />
                                        {status.label}
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                bgcolor: alpha(theme.palette.grey[500], 0.04),
                                                color: 'text.secondary',
                                                display: 'flex',
                                                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                            }}
                                        >
                                            <Iconify icon="solar:history-bold-duotone" width={18} />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.disabled',
                                                    display: 'block',
                                                    lineHeight: 1,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    mb: 0.5,
                                                }}
                                            >
                                                Check-in
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 700, color: 'text.primary' }}
                                            >
                                                {formatTime(record.check_in)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                bgcolor: alpha(theme.palette.grey[500], 0.04),
                                                color: 'text.secondary',
                                                display: 'flex',
                                                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                            }}
                                        >
                                            <Iconify icon="solar:restart-bold" width={18} />
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'text.disabled',
                                                    display: 'block',
                                                    lineHeight: 1,
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    mb: 0.5,
                                                }}
                                            >
                                                Check-out
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ fontWeight: 700, color: 'text.primary' }}
                                            >
                                                {formatTime(record.check_out)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {record.working_hours > 0 && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: -10,
                                            right: -10,
                                            opacity: 0.05,
                                            transform: 'rotate(-15deg)',
                                        }}
                                    >
                                        <Iconify icon="solar:clock-circle-bold-duotone" width={80} />
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Card>
    );
}
