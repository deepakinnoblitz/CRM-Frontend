import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
  chartType?: 'bar' | 'line' | 'area';
};

export function AnalyticsWebsiteVisits({ title, subheader, chart, chartType = 'bar', sx, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      colors: chartType === 'bar' ? ['transparent'] : undefined,
    },
    xaxis: { categories: chart.categories },
    legend: { show: true },
    tooltip: { y: { formatter: (value: number) => `${value} visits` } },
    ...chart.options,
  });

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      {chart.series.length > 0 && chart.series.some(s => s.data.length > 0 && s.data.some(v => v > 0)) ? (
        <Chart
          type={chartType}
          series={chart.series}
          options={chartOptions}
          slotProps={{ loading: { p: 2.5 } }}
          sx={{
            pl: 1,
            py: 2.5,
            pr: 2.5,
            height: 364,
          }}
        />
      ) : (
        <Box sx={{ height: 364, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyContent
            title="No data"
            sx={{ py: 5 }}
          />
        </Box>
      )}
    </Card>
  );
}
