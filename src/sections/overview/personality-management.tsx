import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import Chart from 'react-apexcharts';

// ----------------------------------------------------------------------

interface PersonalityTraitData {
    trait: string;
    score: number;
}

interface PersonalityManagementProps {
    data?: PersonalityTraitData[];
}

export function PersonalityManagement({
    data = [
        { trait: 'Communication', score: 18 },
        { trait: 'Teamwork', score: 15 },
        { trait: 'Leadership', score: 14 },
        { trait: 'Creativity', score: 16 },
        { trait: 'Technical Skills', score: 22 },
    ],
}: PersonalityManagementProps) {
    const theme = useTheme();

    const colors = [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main,
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
        labels: data.map((d) => d.trait),
        legend: {
            show: true,
            position: 'bottom' as const,
            markers: {
                radius: 4,
            },
            itemMargin: {
                horizontal: 12,
                vertical: 8,
            },
            offsetY: 0,
        },
        plotOptions: {
            pie: {
                size: undefined,
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '13px',
                            offsetY: 20,
                        },
                        value: {
                            show: true,
                            fontSize: '18px',
                            fontWeight: 700,
                            offsetY: -20,
                        },
                        total: {
                            show: true,
                            label: 'Total Points',
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
                formatter: (val: number) => `${val} points`,
            },
        },
        dataLabels: {
            enabled: false,
        },
    };

    const chartSeries = data.map((d) => d.score);

    // Calculate total and percentages
    const total = data.reduce((sum, item) => sum + item.score, 0);

    return (
        <Card
            sx={{
                p: { xs: 2, md: 3 },
                boxShadow: theme.palette.mode === 'light' ? 2 : 4,
            }}
        >
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Personality Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Skill distribution and personality traits breakdown
                    </Typography>
                </Box>

                {/* Pie Chart */}
                <Box sx={{ height: 320, width: '100%' }}>
                    <Chart
                        options={chartOptions as any}
                        series={chartSeries}
                        type="pie"
                        height={320}
                    />
                </Box>

                {/* Traits Summary */}
                <Stack spacing={1.5}>
                    {data.map((item, index) => {
                        const percentage = Math.round((item.score / total) * 100);
                        return (
                            <Stack
                                key={index}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            bgcolor: colors[index],
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {item.trait}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 600,
                                            minWidth: 45,
                                            textAlign: 'right',
                                        }}
                                    >
                                        {percentage}%
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            minWidth: 35,
                                            textAlign: 'right',
                                        }}
                                    >
                                        ({item.score}pt)
                                    </Typography>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Stack>

                {/* Total Score */}
                <Box
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Total Score
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: 'primary.main',
                            }}
                        >
                            {total} points
                        </Typography>
                    </Stack>
                </Box>
            </Stack>
        </Card>
    );
}
