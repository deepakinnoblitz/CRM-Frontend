import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';

// ----------------------------------------------------------------------

interface DashboardHeroProps {
    employeeName?: string;
    employeeAvatar?: string;
    weeklyData?: Array<{
        day: string;
        hours: number;
    }>;
}

export function DashboardHero({
    employeeName = 'Employee',
    employeeAvatar = 'EB',
    weeklyData = [
        { day: 'Mon', hours: 8.5 },
        { day: 'Tue', hours: 9 },
        { day: 'Wed', hours: 8.2 },
        { day: 'Thu', hours: 9.3 },
        { day: 'Fri', hours: 8.8 },
        { day: 'Sat', hours: 0 },
        { day: 'Sun', hours: 0 },
    ],
}: DashboardHeroProps) {
    const theme = useTheme();

    const chartOptions = {
        chart: {
            type: 'area',
            toolbar: {
                show: false,
            },
            sparkline: {
                enabled: false,
            },
            zoom: {
                enabled: false,
            },
        },
        colors: [theme.palette.primary.main],
        dataLabels: {
            enabled: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.01,
                stops: [0, 100],
            },
        },
        grid: {
            borderColor: alpha(theme.palette.divider, 0.1),
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            categories: weeklyData.map((d) => d.day),
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            min: 0,
            max: 10,
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                    fontSize: '12px',
                },
                formatter: (val: number) => `${val}h`,
            },
        },
        tooltip: {
            theme: theme.palette.mode,
            x: {
                show: true,
            },
            y: {
                formatter: (val: number) => `${val}h`,
            },
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'left',
            markers: {
                radius: 3,
            },
        },
    };

    const chartSeries = [
        {
            name: 'Working Hours',
            data: weeklyData.map((d) => d.hours),
        },
    ];

    return (
        <Stack spacing={3} sx={{ mb: { xs: 3, md: 5 } }}>
            {/* Greeting Card */}
            <Card
                sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    boxShadow: theme.shadows[2],
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    {/* Avatar */}
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            bgcolor: alpha(theme.palette.primary.main, 0.25),
                            color: theme.palette.primary.main,
                            border: `3px solid ${theme.palette.primary.main}`,
                        }}
                    >
                        {employeeAvatar}
                    </Avatar>

                    {/* Greeting Text */}
                    <Stack spacing={1} flex={1}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Hi, {employeeName}! 👋
                        </Typography>

                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Welcome back! Here's your weekly performance overview.
                        </Typography>

                        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
                            <Box
                                sx={{
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.success.main, 0.12),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: theme.palette.success.main,
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    ✓ On Track
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Stack>
            </Card>

            {/* Weekly Chart */}
            <Card
                sx={{
                    p: { xs: 2, md: 3 },
                    boxShadow: theme.shadows[4],
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            This Week's Working Hours
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Weekly performance trend and productivity metrics
                        </Typography>
                    </Box>

                    <Box sx={{ height: 300, width: '100%', mt: 2 }}>
                        <Chart
                            options={chartOptions as any}
                            series={chartSeries}
                            type="area"
                            height={300}
                        />
                    </Box>
                </Stack>
            </Card>
        </Stack>
    );
}
