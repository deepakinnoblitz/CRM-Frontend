import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    fetchMonthHolidays,
    fetchTodayBirthdays,
    fetchAttendanceStats,
    fetchUpcomingRenewals,
    fetchPendingLeaveCount,
    fetchTotalEmployeeCount,
    fetchRecentAnnouncements,
    fetchTodayLeaveEmployees,
    fetchMissingAttendanceChartData,
    fetchWeeklyPresentChartData
} from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

import { HRCalendar } from '../hr-calendar';
import { HRAnnouncements } from '../hr-announcements';
import { HRSummaryWidget } from '../hr-summary-widget';
import { HRDashboardTable } from '../hr-dashboard-table';
import { WeeklyPresentChart } from '../weekly-present-chart';
import { MissingAttendanceChart } from '../missing-attendance-chart';

// ----------------------------------------------------------------------

export function HRDashboardView() {
    const { user } = useAuth();
    const [data, setData] = useState<any>({
        announcements: [],
        total_employees: 0,
        pending_leaves: 0,
        present_today: 0,
        missing_attendance: 0,
        todays_leaves: [],
        todays_birthdays: [],
        holidays: [],
        missing_attendance_chart: [],
        weekly_present_chart: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [
                    announcements,
                    birthdays,
                    leaves,
                    holidays,
                    stats,
                    renewals,
                    totalEmployees,
                    pendingLeaves,
                    missingAttendanceChart,
                    weeklyPresentChart
                ] = await Promise.all([
                    fetchRecentAnnouncements(),
                    fetchTodayBirthdays(),
                    fetchTodayLeaveEmployees(),
                    fetchMonthHolidays(),
                    fetchAttendanceStats('today'),
                    fetchUpcomingRenewals(),
                    fetchTotalEmployeeCount(),
                    fetchPendingLeaveCount(),
                    fetchMissingAttendanceChartData(),
                    fetchWeeklyPresentChartData()
                ]);

                console.log('Holidays data received:', holidays);
                setData({
                    announcements,
                    todays_birthdays: birthdays,
                    todays_leaves: leaves,
                    holidays,
                    renewals,
                    present_today: stats?.present || 0,
                    missing_attendance: stats?.missing || 0,
                    pending_leaves: pendingLeaves,
                    total_employees: totalEmployees,
                    missing_attendance_chart: missingAttendanceChart,
                    weekly_present_chart: weeklyPresentChart
                });
            } catch (error) {
                console.error('Failed to load HR dashboard data:', error);
            }
        };

        loadData();
    }, []);

    const handleMonthChange = async (date: Date) => {
        try {
            const holidays = await fetchMonthHolidays(date.getMonth() + 1, date.getFullYear());
            setData((prev: any) => ({ ...prev, holidays }));
        } catch (error) {
            console.error('Failed to update holidays:', error);
        }
    };

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
                Hi, {user?.full_name || 'HR User'}, Welcome back 👋
            </Typography>

            <Grid container spacing={3}>
                {/* Announcements */}
                <Grid size={{ xs: 12 }}>
                    <HRAnnouncements
                        title="Latest Announcements"
                        list={data.announcements.map((a: any) => ({
                            title: a.announcement_name,
                            message: a.announcement,
                            posting_date: a.creation
                        }))}
                    />
                </Grid>

                {/* Summary Widgets */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <HRSummaryWidget
                        title="Total Employees"
                        total={data.total_employees || 0}
                        icon={<Iconify icon={"solar:users-group-rounded-bold-duotone" as any} width={32} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <HRSummaryWidget
                        title="Pending Leave Applications"
                        total={data.pending_leaves || 0}
                        color="warning"
                        icon={<Iconify icon={"solar:calendar-date-bold-duotone" as any} width={32} />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <HRSummaryWidget
                        title="Yesterday Missing Attendance"
                        total={data.missing_attendance || 0}
                        color="error"
                        icon={<Iconify icon={"solar:close-circle-bold-duotone" as any} width={32} />}
                    />
                </Grid>

                {/* Missing Attendance Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MissingAttendanceChart
                        title="Missing Attendance"
                        subheader="Last 7 days"
                        data={data.missing_attendance_chart}
                    />
                </Grid>

                {/* Weekly Present Count Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <WeeklyPresentChart
                        title="Weekly Present Count"
                        subheader="Current week (Mon-Sun)"
                        data={data.weekly_present_chart}
                    />
                </Grid>

                {/* Today's Leaves */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <HRDashboardTable
                        title="Today's Leave"
                        tableData={data.todays_leaves}
                        headLabel={[
                            { id: 'index', label: 'S.No' },
                            { id: 'employee_name', label: 'Employee Name' },
                            { id: 'leave_type', label: 'Leave Type' },
                        ]}
                        emptyMessage="No leave today"
                    />
                </Grid>

                {/* Today's Birthdays */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <HRDashboardTable
                        title="Today's Birthdays"
                        tableData={data.todays_birthdays}
                        headLabel={[
                            { id: 'index', label: 'S.No' },
                            { id: 'employee_name', label: 'Employee Name' },
                            { id: 'employee', label: 'Employee ID' },
                        ]}
                        emptyMessage="No birthdays today"
                    />
                </Grid>

                {/* Upcoming Renewals */}
                <Grid size={{ xs: 12 }}>
                    <HRDashboardTable
                        title="Upcoming Renewals"
                        tableData={data.renewals || []}
                        headLabel={[
                            { id: 'index', label: 'S.No' },
                            { id: 'item_name', label: 'Item Name' },
                            { id: 'category', label: 'Category' },
                            { id: 'renewal_date', label: 'Renewal Date' },
                            { id: 'amount', label: 'Amount' },
                            { id: 'status', label: 'Status' },
                        ]}
                        emptyMessage="No upcoming renewals"
                    />
                </Grid>

                {/* Holiday Calendar */}
                <Grid size={{ xs: 12 }}>
                    <HRCalendar
                        title="Holiday Calendar"
                        subheader="Upcoming holidays for this month"
                        onDateChange={handleMonthChange}
                        events={(() => {
                            const mappedEvents = data.holidays.map((h: any) => ({
                                title: h.description,
                                start: h.holiday_date,
                                color: '#FF4842'
                            }));
                            console.log('Mapped holiday events:', mappedEvents);
                            return mappedEvents;
                        })()}
                    />
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
