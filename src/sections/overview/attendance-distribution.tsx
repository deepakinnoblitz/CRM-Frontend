import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';

// ----------------------------------------------------------------------

interface AttendanceDistributionProps {
    data?: Array<{
        label: string;
        value: number;
    }>;
}

export function AttendanceDistribution({
    data = [
        { label: 'Present', value: 18 },
        { label: 'On Leave', value: 2 },
        { label: 'Half Day', value: 1 },
        { label: 'Absent', value: 1 },
        { label: 'Holiday', value: 3 },
    ],
}: AttendanceDistributionProps) {
    const theme = useTheme();

    const colors = [
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.secondary.main,
    ];

    const chartOptions = {
        chart: {
            sparkline: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        colors,
        labels: data.map((d) => d.label),
        legend: {
            show: true,
            position: 'bottom' as const,
            markers: {
                radius: 4,
            },
            itemMargin: {
                horizontal: 16,
                vertical: 8,
            },
            offsetY: 0,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '13px',
                            offsetY: 20,
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: 700,
                            offsetY: -20,
                        },
                        total: {
                            show: true,
                            label: 'Total Days',
                            fontSize: '13px',
                            color: theme.palette.text.secondary,
                        },
                    },
                },
            },
        },
        tooltip: {
            theme: theme.palette.mode,
            y: {
                formatter: (val: number) => `${val} days`,
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const chartSeries = data.map((d) => d.value);

    return (
        <Card
            sx={{
                p: { xs: 2, md: 3 },
                boxShadow: theme.palette.mode === 'light' ? 2 : 4,
            }}
        >
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Attendance Distribution
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Monthly attendance breakdown by status
                    </Typography>
                </Box>

                <Box sx={{ height: 320, width: '100%' }}>
                    <Chart
                        options={chartOptions as any}
                        series={chartSeries}
                        type="donut"
                        height={320}
                    />
                </Box>

                {/* Summary Stats */}
                <Stack direction="row" spacing={2} sx={{ pt: 2, justifyContent: 'space-around' }}>
                    {data.map((item, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: colors[index],
                                    mx: 'auto',
                                    mb: 0.75,
                                }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {item.label}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {item.value}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Card>
    );
}
