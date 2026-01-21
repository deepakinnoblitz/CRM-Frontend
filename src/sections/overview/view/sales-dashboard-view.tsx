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
import { fetchSalesDashboardData, type SalesDashboardData } from 'src/api/dashboard';

import { Scrollbar } from 'src/components/scrollbar';

import { useAuth } from 'src/auth/auth-context';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';

// ----------------------------------------------------------------------

export function SalesDashboardView() {
    const { user } = useAuth();
    const [data, setData] = useState<SalesDashboardData>({
        total_sales: 0,
        total_qty_sold: 0,
        total_orders: 0,
        aov: 0,
        gross_sales: 0,
        net_sales: 0,
        total_discounts: 0,
        mtd_sales: 0,
        ytd_sales: 0,
        pipeline_value: 0,
        top_customers_by_revenue: [],
        most_repeated_customers: [],
        overdue_orders: [],
        pending_orders_count: 0,
        sales_trend: { categories: [], series: [] },
        discount_trend: { categories: [], series: [] },
        conversion_rate: 0,
    });

    useEffect(() => {
        const loadData = async () => {
            const dashboardData = await fetchSalesDashboardData();
            setData(dashboardData);
        };

        loadData();
    }, []);

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
                Hi, {user?.full_name || 'User'}, Welcome back 👋
            </Typography>

            <Grid container spacing={3}>
                {/* Top Summary Widgets */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Total Sales"
                        percent={0}
                        total={data.total_sales}
                        icon={<img alt="Total Sales" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`} />}
                        chart={{
                            categories: ['MTD', 'YTD'],
                            series: [data.mtd_sales, data.ytd_sales],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="MTD Sales"
                        percent={0}
                        total={data.mtd_sales}
                        color="secondary"
                        icon={<img alt="MTD Sales" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-bag.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [data.mtd_sales, data.mtd_sales],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Conversion Rate"
                        percent={0}
                        total={parseFloat(data.conversion_rate.toFixed(2))}
                        color="warning"
                        icon={<img alt="Conversion" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-message.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [data.conversion_rate, data.conversion_rate],
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <AnalyticsWidgetSummary
                        title="Open Pipeline"
                        percent={0}
                        total={data.pipeline_value}
                        icon={<img alt="Pipeline" src={`${import.meta.env.BASE_URL}assets/icons/glass/ic-glass-buy.svg`} />}
                        chart={{
                            categories: ['Prev', 'Current'],
                            series: [data.pipeline_value, data.pipeline_value],
                        }}
                    />
                </Grid>

                {/* Sales Trend Chart */}
                <Grid size={{ xs: 12, md: 12 }}>
                    <AnalyticsWebsiteVisits
                        title="Sales Trend"
                        subheader="Total Revenue over last 12 months"
                        chart={{
                            categories: data.sales_trend.categories,
                            series: [
                                {
                                    name: 'Sales',
                                    data: data.sales_trend.series,
                                },
                            ],
                        }}
                    />
                </Grid>

                {/* Top Customers by Revenue */}
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
                                        {data.top_customers_by_revenue.length > 0 ? (
                                            data.top_customers_by_revenue.map((row) => (
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
                                        {data.overdue_orders.length > 0 ? (
                                            data.overdue_orders.map((row) => (
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

                {/* Discount Trend */}
                <Grid size={{ xs: 12, md: 12 }}>
                    <AnalyticsWebsiteVisits
                        title="Discount Trend"
                        subheader="Total Discounts given over last 12 months"
                        chart={{
                            categories: data.discount_trend.categories,
                            series: [
                                {
                                    name: 'Discounts',
                                    data: data.discount_trend.series,
                                },
                            ],
                        }}
                    />
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
