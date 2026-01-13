import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fCurrency } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    fetchDashboardStats,
    type DashboardStats,
    fetchTodayActivities,
    type TodayActivities,
    fetchSalesDashboardData,
    type SalesDashboardData
} from 'src/api/dashboard';

import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

import { TodayActivitiesWidget } from '../today-activities-widget';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';

// ----------------------------------------------------------------------

export function CombinedDashboardView() {
    const { user } = useAuth();
    const [salesData, setSalesData] = useState<SalesDashboardData | null>(null);
    const [crmStats, setCrmStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<TodayActivities | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sales, stats, acts] = await Promise.all([
                    fetchSalesDashboardData(),
                    fetchDashboardStats(),
                    fetchTodayActivities()
                ]);
                setSalesData(sales);
                setCrmStats(stats);
                setActivities(acts);
            } catch (error) {
                console.error('Failed to load Combined dashboard data:', error);
            }
        };

        loadData();
    }, []);

    // Calculate daily percentage change (today vs yesterday)
    const getPercentChange = (series: number[] = []) => {
        if (series.length < 2) return 0;
        const today = series[series.length - 1];
        const yesterday = series[series.length - 2];
        if (yesterday === 0) return today > 0 ? 100 : 0;
        return Math.round(((today - yesterday) / yesterday) * 100);
    };

    if (!salesData || !crmStats || !activities) return null;

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
                Hi, {user?.full_name || 'User'}, Welcome back 👋
            </Typography>

            <Grid container spacing={3}>
                {/* Row 1: CRM Summary Widgets */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Leads"
                        percent={getPercentChange(crmStats.charts?.leads)}
                        total={crmStats.leads || 0}
                        icon={<img alt="Leads" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-users.svg`} />}
                        chart={{
                            categories: crmStats.charts?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            series: crmStats.charts?.leads || [0, 0, 0, 0, 0, 0, 0],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Contacts"
                        percent={getPercentChange(crmStats.charts?.contacts)}
                        total={crmStats.contacts || 0}
                        color="secondary"
                        icon={<img alt="Contacts" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-message.svg`} />}
                        chart={{
                            categories: crmStats.charts?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            series: crmStats.charts?.contacts || [0, 0, 0, 0, 0, 0, 0],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Deals"
                        percent={getPercentChange(crmStats.charts?.deals)}
                        total={crmStats.deals || 0}
                        color="warning"
                        icon={<img alt="Deals" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`} />}
                        chart={{
                            categories: crmStats.charts?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            series: crmStats.charts?.deals || [0, 0, 0, 0, 0, 0, 0],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Accounts"
                        percent={getPercentChange(crmStats.charts?.accounts)}
                        total={crmStats.accounts || 0}
                        color="info"
                        icon={<img alt="Accounts" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-users.svg`} />}
                        chart={{
                            categories: crmStats.charts?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            series: crmStats.charts?.accounts || [0, 0, 0, 0, 0, 0, 0],
                        }}
                    />
                </Grid>

                {/* Row 2: Sales Summary Widgets */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Sales"
                        percent={0}
                        total={salesData.total_sales}
                        icon={<img alt="Total Sales" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`} />}
                        chart={{
                            categories: ['MTD', 'YTD'],
                            series: [salesData.mtd_sales, salesData.ytd_sales],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="MTD Sales"
                        percent={0}
                        total={salesData.mtd_sales}
                        color="secondary"
                        icon={<img alt="MTD Sales" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-bag.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [salesData.mtd_sales, salesData.mtd_sales],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Conversion Rate"
                        percent={0}
                        total={parseFloat(salesData.conversion_rate.toFixed(2))}
                        color="warning"
                        icon={<img alt="Conversion" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-message.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [salesData.conversion_rate, salesData.conversion_rate],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Open Pipeline"
                        percent={0}
                        total={salesData.pipeline_value}
                        color="info"
                        icon={<img alt="Pipeline" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [salesData.pipeline_value, salesData.pipeline_value],
                        }}
                    />
                </Grid>

                {/* Sales Trend Chart */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <AnalyticsWebsiteVisits
                        title="Sales & Discount Trend"
                        subheader="Total Revenue vs Total Discount over last 12 months"
                        chartType="line"
                        chart={{
                            categories: salesData.sales_trend.categories,
                            series: [
                                {
                                    name: 'Total Revenue',
                                    data: salesData.sales_trend.series,
                                },
                                {
                                    name: 'Total Discount',
                                    data: salesData.discount_trend.series,
                                },
                            ],
                            options: {
                                tooltip: {
                                    y: {
                                        formatter: (value: number) => fCurrency(value),
                                    },
                                },
                            },
                        }}
                        sx={{ height: 1 }}
                    />
                </Grid>

                {/* Leads by Status */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <AnalyticsCurrentVisits
                        title="Leads by Status"
                        chart={{
                            series: (crmStats.leads_by_status || []).map((item) => ({
                                label: item.status,
                                value: item.count,
                            })),
                        }}
                        sx={{ height: 1 }}
                    />
                </Grid>

                {/* Today's Activities */}
                <Grid size={{ xs: 12 }}>
                    <TodayActivitiesWidget
                        calls={activities.calls || []}
                        meetings={activities.meetings || []}
                    />
                </Grid>

                {/* Top Customers */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader title="Top Customers by Revenue" />
                        <Scrollbar>
                            <TableContainer sx={{ minWidth: 400 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Customer</TableCell>
                                            <TableCell>Revenue</TableCell>
                                            <TableCell align="center">Orders</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesData.top_customers_by_revenue.length > 0 ? (
                                            salesData.top_customers_by_revenue.map((row) => (
                                                <TableRow key={row.client_name}>
                                                    <TableCell>{row.billing_name}</TableCell>
                                                    <TableCell>{fCurrency(row.revenue)}</TableCell>
                                                    <TableCell align="center">{row.order_count}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3}>
                                                    <Box
                                                        sx={{
                                                            py: 8,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-users.svg`}
                                                            sx={{ width: 48, height: 48, opacity: 0.3 }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            No customer data available
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Scrollbar>
                    </Card>
                </Grid>

                {/* Overdue Orders */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardHeader title="Overdue Orders" />
                        <Scrollbar>
                            <TableContainer sx={{ minWidth: 400 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell>Due Date</TableCell>
                                            <TableCell align="right">Balance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {salesData.overdue_orders.length > 0 ? (
                                            salesData.overdue_orders.map((row) => (
                                                <TableRow key={row.name}>
                                                    <TableCell>{row.name}</TableCell>
                                                    <TableCell>{row.billing_name}</TableCell>
                                                    <TableCell>{row.due_date}</TableCell>
                                                    <TableCell align="right">{fCurrency(row.balance_amount)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4}>
                                                    <Box
                                                        sx={{
                                                            py: 8,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                        }}
                                                    >
                                                        <Box
                                                            component="img"
                                                            src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`}
                                                            sx={{ width: 48, height: 48, opacity: 0.3 }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            No overdue orders
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Scrollbar>
                    </Card>
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
