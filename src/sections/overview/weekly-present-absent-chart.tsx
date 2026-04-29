import type { Dayjs } from 'dayjs';
import type { CardProps } from '@mui/material/Card';

import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  subheader?: string;
  data: Array<{ date: string; day: string; present: number; absent: number }>;
  filter: string;
  onFilterChange: (filter: string, from?: string, to?: string) => void;
};

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

  // Prepare chart data
  const categories = data.map((item) => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateStr}, ${item.day}`;
  });
  const presentSeries = data.map((item) => item.present || 0);
  const absentSeries = data.map((item) => item.absent || 0);

  const maxVal = Math.max(...presentSeries, ...absentSeries, 0);
  const yMax = maxVal === 0 ? 10 : Math.ceil((maxVal * 1.2) / 5) * 5; // Round to nearest 5 with 20% cushion

  const chartOptions = useChart({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      stacked: false,
    },
    colors: ['#22C55E', '#FF5630'], // Green for Present, Red for Absent
    plotOptions: {
      bar: {
        borderRadius: data.length > 10 ? 4 : 8,
        columnWidth: data.length > 15 ? '80%' : '50%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    stroke: {
      show: true,
      width: data.length > 20 ? 1 : 2,
      colors: ['#22C55E', '#FF5630'],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: ['#6FE798', '#FF8F6D'],
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: data.length <= 15,
      offsetY: -25,
      style: {
        fontSize: '10px',
        fontWeight: 700,
        colors: ['#22C55E', '#FF5630'],
      },
      formatter: (value: number) => Math.round(value).toString(),
    },
    xaxis: {
      categories,
      labels: {
        rotate: data.length > 10 ? -45 : 0,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: yMax,
      title: {
        text: 'Employee Count',
        offsetX: -30,
        style: {
          color: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 600,
        },
      },
      labels: {
        padding: 20,
        formatter: (value: number) => Math.round(value).toString(),
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => `${Math.round(value)} employee${value !== 1 ? 's' : ''}`,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      itemMargin: { horizontal: 8, vertical: 0 },
      labels: {
        colors: theme.palette.text.primary,
        useSeriesColors: false,
      },
      fontFamily: theme.typography.fontFamily,
      fontWeight: 600,
      fontSize: '13px',
      offsetY: -10,
    },
    grid: {
      borderColor: alpha(theme.palette.grey[500], 0.12),
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 10, right: 10, bottom: 0, left: 80 },
    },
  });

  const handleFilterChange = (event: any) => {
    const value = event.target.value;
    if (value !== 'Custom') {
      onFilterChange(value);
    } else {
      onFilterChange(value, startDate?.format('YYYY-MM-DD'), endDate?.format('YYYY-MM-DD'));
    }
  };

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
      ? `${startDate.format('MMM D')} - ${endDate.format('MMM D, YYYY')}`
      : subheaderProp || filter;

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
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {subheader}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            flexWrap: 'wrap',
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {filter === 'Custom' && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="From"
                  value={startDate}
                  onChange={(val) => handleDateChange('start', val)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        width: { xs: '100%', sm: 140 },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                        },
                      },
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
                      sx: {
                        width: { xs: '100%', sm: 140 },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                        },
                      },
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
          )}
          <Select
            size="small"
            value={filter}
            onChange={handleFilterChange}
            sx={{
              minWidth: 160,
              borderRadius: 1,
              fontWeight: 600,
              bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (t) => alpha(t.palette.grey[500], 0.16),
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (t) => t.palette.text.primary,
              },
            }}
          >
            <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
            <MenuItem value="This Month">This Month</MenuItem>
            <MenuItem value="Last Month">Last Month</MenuItem>
            <MenuItem value="Custom">Custom Range</MenuItem>
          </Select>
        </Box>
      </Box>

      {data.length > 0 ? (
        <Chart
          type="bar"
          series={[
            { name: 'Present', data: presentSeries },
            { name: 'Absent', data: absentSeries },
          ]}
          options={chartOptions}
          sx={{ height: 320 }}
        />
      ) : (
        <Box
          sx={{
            height: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body2">No data available for this range</Typography>
        </Box>
      )}
    </Card>
  );
}
