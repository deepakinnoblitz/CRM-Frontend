import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title: string;
    subheader?: string;
    data: Array<{ date: string; hours: number }>;
};

export function WorkingHoursChart({ title, subheader, data, sx, ...other }: Props) {
    const theme = useTheme();

    // Prepare chart data
    const categories = data.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const series = data.map((item) => item.hours || 0);

    const chartOptions = useChart({
        chart: {
            type: 'bar',
            toolbar: { show: false },
        },
        colors: [theme.palette.primary.main],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '60%',
            },
        },
        xaxis: {
            categories,
            labels: {
                style: {
                    colors: theme.palette.text.secondary,
                },
            },
        },
        yaxis: {
            title: {
                text: 'Hours',
                style: {
                    color: theme.palette.text.secondary,
                },
            },
            labels: {
                formatter: (value: number) => fNumber(value),
                style: {
                    colors: theme.palette.text.secondary,
                },
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => `${fNumber(value)} hours`,
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            borderColor: alpha(theme.palette.grey[500], 0.16),
        },
    });

    return (
        <Card
            sx={[
                {
                    p: 3,
                    boxShadow: (t) => t.customShadows?.card,
                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {title}
                </Typography>
                {subheader && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {subheader}
                    </Typography>
                )}
            </Box>

            {data.length > 0 ? (
                <Chart
                    type="bar"
                    series={[{ name: 'Working Hours', data: series }]}
                    options={chartOptions}
                    sx={{ height: 280 }}
                />
            ) : (
                <Box
                    sx={{
                        height: 280,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="body2">No timesheet data available for the last 7 days</Typography>
                </Box>
            )}
        </Card>
    );
}
