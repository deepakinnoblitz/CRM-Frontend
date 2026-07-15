import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { EmptyContent } from 'src/components/empty-content';
import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsCurrentVisits({ title, subheader, emptyTitle, emptyDescription, emptyIcon, chart, sx, ...other }: Props) {
  const theme = useTheme();

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? [
    theme.palette.primary.main,
    theme.palette.warning.light,
    theme.palette.info.dark,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    ...chart.options,
  });

  return (
    <Card
      sx={{
        border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`,
        boxShadow: (t) => t.customShadows?.card,
        ...sx
      }}
      {...other}
    >
      <CardHeader title={title} subheader={subheader} titleTypographyProps={{ variant: 'h6' }} />

      {chartSeries.length > 0 && chartSeries.some(v => v > 0) ? (
        <Chart
          type="pie"
          series={chartSeries}
          options={chartOptions}
          sx={{
            my: 3,
            mx: 'auto',
            width: '100%',
            maxWidth: { xs: 240, xl: 320 },
            height: { xs: 240, xl: 320 },
          }}
        />
      ) : (
        <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyContent
            title={emptyTitle || "No data"}
            description={emptyDescription}
            icon={emptyIcon}
            sx={{ py: 5 }}
          />
        </Box>
      )}

      <Divider sx={{ borderStyle: 'dashed' }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{ p: 3, justifyContent: 'center' }}
      />
    </Card>
  );
}
