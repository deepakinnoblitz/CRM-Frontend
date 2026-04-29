import type { CardProps } from '@mui/material/Card';

import { useState, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title: string;
    subheader?: string;
    data: Array<{ date: string; day: string; present: number; absent: number }>;
    filter: string;
    onFilterChange: (filter: string, from?: string, to?: string) => void;
};

// ----------------------------------------------------------------------
// Custom pill-style select trigger label map

const FILTER_LABELS: Record<string, string> = {
    'Last 7 Days': 'Last 7 Days',
    'This Month': 'This Month',
    'Last Month': 'Last Month',
    Custom: 'Custom Range',
};

// ----------------------------------------------------------------------

function EmptyState() {
    const theme = useTheme();
    return (
        <Box
            sx={{
                height: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: `1.5px dashed ${alpha(theme.palette.grey[500], 0.18)}`,
                mx: 1,
                mb: 1,
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: alpha(theme.palette.primary.main, 0.5),
                    mb: 0.5,
                }}
            >
                <Iconify icon={`solar:chart-bold-duotone` as any} width={36} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    No attendance data available
                </Typography>
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                    Try changing the date range or filter
                </Typography>
            </Box>
        </Box>
    );
}

// ----------------------------------------------------------------------

export function WeeklyPresentAbsentChart({
    title,
    subheader: subheaderProp,
    data,
    filter,
    onFilterChange,
    sx,
    ...other
}: Props) {
    const theme = useTheme();

    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(6, 'day'));
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

    // Animate chart on filter change
    const [chartKey, setChartKey] = useState(0);
    useEffect(() => {
        setChartKey((k) => k + 1);
    }, [data]);

    // Trend calculation (present vs absent overall)
    const totalPresent = data.reduce((s, d) => s + (d.present || 0), 0);
    const totalAbsent = data.reduce((s, d) => s + (d.absent || 0), 0);
    const total = totalPresent + totalAbsent;
    const presentRate = total > 0 ? Math.round((totalPresent / total) * 100) : null;
    const isPositive = presentRate !== null && presentRate >= 70;

    // Chart data
    const categories = data.map((item) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${dateStr} ${item.day}`;
    });
    const presentSeries = data.map((item) => item.present || 0);
    const absentSeries = data.map((item) => item.absent || 0);
    const maxVal = Math.max(...presentSeries, ...absentSeries, 0);
    const yMax = maxVal === 0 ? 10 : Math.ceil((maxVal * 1.25) / 5) * 5;

    const chartOptions = useChart({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            background: 'transparent',
            stacked: false,
            animations: {
                enabled: true,
                speed: 600,
                animateGradually: { enabled: true, delay: 80 },
                dynamicAnimation: { enabled: true, speed: 400 },
            },
        },
        // Use CSS gradient via ApexCharts fill
        colors: ['#22C55E', '#FF5630'],
        plotOptions: {
            bar: {
                borderRadius: data.length > 15 ? 4 : 7,
                borderRadiusApplication: 'end',
                columnWidth: data.length > 15 ? '75%' : '45%',
                dataLabels: { position: 'top' },
            },
        },
        stroke: {
            show: false,
        },
        fill: {
            type: ['gradient', 'gradient'],
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.2,
                gradientToColors: ['#86EFAC', '#FFB4A2'],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.85,
                stops: [0, 100],
            },
        },
        dataLabels: {
            enabled: false, // shown only on hover via tooltip
        },
        xaxis: {
            categories,
            labels: {
                rotate: data.length > 10 ? -40 : 0,
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: data.length > 10 ? '10px' : '11px',
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            min: 0,
            max: yMax,
            title: {
                text: 'Employees',
                offsetX: -8,
                style: {
                    color: theme.palette.text.disabled,
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: theme.typography.fontFamily,
                },
            },
            labels: {
                padding: 12,
                formatter: (value: number) => Math.round(value).toString(),
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: '11px',
                    fontFamily: theme.typography.fontFamily,
                },
            },
        },
        tooltip: {
            theme: theme.palette.mode,
            shared: true,
            intersect: false,
            custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
                const label = w.globals.labels[dataPointIndex];
                const present = series[0]?.[dataPointIndex] ?? 0;
                const absent = series[1]?.[dataPointIndex] ?? 0;
                const bg = theme.palette.mode === 'dark' ? '#1C252E' : '#fff';
                const border = alpha(theme.palette.grey[500], 0.16);
                const text = theme.palette.text.primary;
                const sub = theme.palette.text.secondary;
                return `
                  <div style="
                    background:${bg};
                    border:1px solid ${border};
                    border-radius:12px;
                    padding:12px 16px;
                    box-shadow:0 8px 24px ${alpha('#000', 0.12)};
                    min-width:160px;
                    font-family:${theme.typography.fontFamily};
                  ">
                    <div style="font-size:11px;font-weight:600;color:${sub};margin-bottom:8px;letter-spacing:0.5px;text-transform:uppercase;">${label}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                      <span style="width:10px;height:10px;border-radius:50%;background:linear-gradient(180deg,#22C55E,#86EFAC);display:inline-block;"></span>
                      <span style="font-size:13px;color:${text};font-weight:600;">Present &nbsp;<strong>${present}</strong></span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="width:10px;height:10px;border-radius:50%;background:linear-gradient(180deg,#FF5630,#FFB4A2);display:inline-block;"></span>
                      <span style="font-size:13px;color:${text};font-weight:600;">Absent &nbsp;<strong>${absent}</strong></span>
                    </div>
                  </div>
                `;
            },
        },
        legend: { show: false }, // We render a custom legend
        grid: {
            borderColor: alpha(theme.palette.grey[500], 0.1),
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: { top: 4, right: 8, bottom: 0, left: 8 },
        },
        states: {
            hover: {
                filter: { type: 'lighten', value: 0.1 } as any,
            },
            active: {
                filter: { type: 'darken', value: 0.1 } as any,
            },
        },
    });

    const handleFilterChange = useCallback(
        (value: string) => {
            if (value !== 'Custom') {
                onFilterChange(value);
            } else {
                onFilterChange(value, startDate?.format('YYYY-MM-DD'), endDate?.format('YYYY-MM-DD'));
            }
        },
        [onFilterChange, startDate, endDate]
    );

    const handleDateChange = (type: 'start' | 'end', newValue: Dayjs | null) => {
        if (type === 'start') {
            setStartDate(newValue);
            if (newValue && endDate && filter === 'Custom') {
                onFilterChange('Custom', newValue.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
            }
        } else {
            setEndDate(newValue);
            if (startDate && newValue && filter === 'Custom') {
                onFilterChange('Custom', startDate.format('YYYY-MM-DD'), newValue.format('YYYY-MM-DD'));
            }
        }
    };

    const subheader =
        filter === 'Custom' && startDate && endDate
            ? `${startDate.format('MMM D')} – ${endDate.format('MMM D, YYYY')}`
            : subheaderProp || filter;

    // Pill-shaped date picker field styles
    const pillDatePickerSx = {
        width: { xs: '100%', sm: 148 },
        '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            height: 36,
            fontSize: '13px',
            fontWeight: 500,
            bgcolor: alpha(theme.palette.grey[500], 0.06),
            transition: 'all 0.2s',
            '& fieldset': {
                borderColor: alpha(theme.palette.grey[500], 0.18),
                transition: 'border-color 0.2s',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: '1.5px',
            },
        },
        '& .MuiInputLabel-root': {
            fontSize: '12px',
        },
    };

    return (
        <Card
            sx={[
                {
                    p: 3,
                    borderRadius: '16px',
                    background:
                        theme.palette.mode === 'dark'
                            ? `linear-gradient(135deg, ${alpha(theme.palette.grey[900], 0.95)} 0%, ${alpha(theme.palette.grey[800], 0.8)} 100%)`
                            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 60%)',
                    boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.1)}, 0 1px 3px ${alpha(theme.palette.grey[500], 0.08)}`,
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                    borderTop: `3px solid ${theme.palette.success.main}`,
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    '&:hover': {
                        boxShadow: `0 12px 32px ${alpha(theme.palette.grey[500], 0.18)}, 0 2px 8px ${alpha(theme.palette.grey[500], 0.1)}`,
                        transform: 'translateY(-2px)',
                    },
                    overflow: 'visible',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            {/* ── Header ── */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                {/* Left: Title + subheader + trend badge */}
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.3 }}
                        >
                            {title}
                        </Typography>

                        {/* {presentRate !== null && (
                            <Tooltip
                                title={`${presentRate}% attendance rate`}
                                arrow
                                placement="top"
                            >
                                <Chip
                                    size="small"
                                    icon={
                                        <Iconify
                                            icon={
                                                isPositive
                                                    ? 'solar:arrow-up-bold' as any
                                                    : 'solar:arrow-down-bold' as any
                                            }
                                            width={13}
                                        />
                                    }
                                    label={`${presentRate}%`}
                                    sx={{
                                        height: 22,
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        borderRadius: '10px',
                                        bgcolor: isPositive
                                            ? alpha(theme.palette.success.main, 0.12)
                                            : alpha(theme.palette.error.main, 0.12),
                                        color: isPositive
                                            ? theme.palette.success.dark
                                            : theme.palette.error.dark,
                                        '& .MuiChip-icon': {
                                            color: isPositive
                                                ? theme.palette.success.dark
                                                : theme.palette.error.dark,
                                        },
                                    }}
                                />
                            </Tooltip>
                        )} */}
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={0.6} mt={0.5}>
                        <Iconify
                            icon={`solar:calendar-linear` as any}
                            width={14}
                            sx={{ color: 'text.disabled' }}
                        />
                        <Typography variant="caption" color="text.disabled" fontWeight={500}>
                            {subheader}
                        </Typography>
                    </Stack>
                </Box>

                {/* Right: Filters */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1.2,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        width: { xs: '100%', md: 'auto' },
                    }}
                >
                    {/* Custom date pickers */}
                    {filter === 'Custom' && (
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                    width: { xs: '100%', sm: 'auto' },
                                }}
                            >
                                <DatePicker
                                    label="From"
                                    value={startDate}
                                    onChange={(val) => handleDateChange('start', val)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            sx: pillDatePickerSx,
                                        },
                                    }}
                                />
                                <DatePicker
                                    label="To"
                                    value={endDate}
                                    onChange={(val) => handleDateChange('end', val)}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            sx: pillDatePickerSx,
                                        },
                                    }}
                                />
                            </Box>
                        </LocalizationProvider>
                    )}

                    {/* Pill select */}
                    <Select
                        size="small"
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        startAdornment={
                            <Iconify
                                icon={`solar:filter-bold` as any}
                                width={15}
                                sx={{ mr: 0.5, color: 'text.disabled' }}
                            />
                        }
                        sx={{
                            minWidth: 160,
                            height: 36,
                            borderRadius: '20px',
                            fontWeight: 600,
                            fontSize: '13px',
                            bgcolor: alpha(theme.palette.grey[500], 0.06),
                            transition: 'all 0.2s',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.grey[500], 0.18),
                                transition: 'border-color 0.2s',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1.5px',
                            },
                        }}
                    >
                        {Object.entries(FILTER_LABELS).map(([value, label]) => (
                            <MenuItem key={value} value={value} sx={{ fontSize: '13px', fontWeight: 500 }}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            {/* ── Custom Legend ── */}
            {data.length > 0 && (
                <Stack direction="row" justifyContent="flex-end" spacing={2.5} sx={{ mb: 1.5, pr: 1 }}>
                    {[
                        {
                            label: 'Present',
                            from: '#22C55E',
                            to: '#86EFAC',
                            count: totalPresent,
                        },
                        {
                            label: 'Absent',
                            from: '#FF5630',
                            to: '#FFB4A2',
                            count: totalAbsent,
                        },
                    ].map((item) => (
                        <Stack key={item.label} direction="row" alignItems="center" spacing={0.8}>
                            <Box
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${item.from}, ${item.to})`,
                                    flexShrink: 0,
                                    boxShadow: `0 2px 6px ${alpha(item.from, 0.4)}`,
                                }}
                            />
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                color="text.secondary"
                                sx={{ userSelect: 'none' }}
                            >
                                {item.label}
                            </Typography>
                            <Typography
                                variant="caption"
                                fontWeight={700}
                                color="text.primary"
                                sx={{
                                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: '6px',
                                }}
                            >
                                {item.count}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            )}

            {/* ── Chart or Empty State ── */}
            {data.length > 0 ? (
                <Box
                    key={chartKey}
                    sx={{
                        animation: 'chartFadeIn 0.5s ease forwards',
                        '@keyframes chartFadeIn': {
                            from: { opacity: 0, transform: 'translateY(10px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                        },
                    }}
                >
                    <Chart
                        type="bar"
                        series={[
                            { name: 'Present', data: presentSeries },
                            { name: 'Absent', data: absentSeries },
                        ]}
                        options={chartOptions}
                        sx={{ height: 260 }}
                    />
                </Box>
            ) : (
                <EmptyState />
            )}
        </Card>
    );
}
