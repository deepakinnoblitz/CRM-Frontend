import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    fetchEmployeeDashboardData,
    type EmployeeDashboardData,
    fetchMonthHolidays
} from 'src/api/dashboard';

import { useAuth } from 'src/auth/auth-context';

import { HRCalendar } from '../hr-calendar';
import { HRAnnouncements } from '../hr-announcements';
import { HRDashboardTable } from '../hr-dashboard-table';
import { LeaveStatusCards } from '../leave-status-cards';
import { MissingTimesheets } from '../missing-timesheets';
import { AttendanceStatusCards } from '../attendance-status-cards';
import { MonthlyAttendanceChart } from '../monthly-attendance-chart';

// ----------------------------------------------------------------------

export function EmployeeDashboardView() {
    const { user } = useAuth();
    const [data, setData] = useState<EmployeeDashboardData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const dashboardData = await fetchEmployeeDashboardData();
                console.log('Fetched Employee Dashboard Data:', dashboardData);
                console.log('Weekly Attendance:', dashboardData.weekly_attendance);
                console.log('Weekly Attendance Length:', dashboardData.weekly_attendance?.length);
                console.log('First Attendance Record:', dashboardData.weekly_attendance?.[0]);
                console.log('Announcements:', dashboardData.announcements);
                setData(dashboardData);
            } catch (error) {
                console.error('Failed to load employee dashboard data:', error);
            }
        };

        loadData();
    }, []);

    const handleAttendanceRangeChange = async (range: string) => {
        try {
            const dashboardData = await fetchEmployeeDashboardData(range);
            setData((prev: any) => ({
                ...prev,
                monthly_attendance_breakdown: dashboardData.monthly_attendance_breakdown,
                missing_timesheets: dashboardData.missing_timesheets,
                attendance_range: range
            }));
        } catch (error) {
            console.error('Failed to update attendance range:', error);
        }
    };

    const handleMonthChange = async (date: Date) => {
        try {
            const holidays = await fetchMonthHolidays(date.getMonth() + 1, date.getFullYear());
            if (data) {
                setData((prev: any) => ({ ...prev, holidays }));
            }
        } catch (error) {
            console.error('Failed to update holidays:', error);
        }
    };

    if (!data) {
        return null;
    }

    return (
        <DashboardContent maxWidth="xl">
            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
                Hi, {data.employee_name || user?.full_name || 'Employee'}, Welcome back 👋
            </Typography>

            <Grid container spacing={3}>
                {/* 1. Latest Announcements */}
                <Grid size={{ xs: 12 }}>
                    <HRAnnouncements
                        list={(data.announcements || []).map((a: any) => ({
                            title: a.title,
                            message: a.message,
                            posting_date: a.posting_date
                        }))}
                    />
                </Grid>

                {/* 2. Last Seven Days Working Hours (Attendance Cards) */}
                <Grid size={{ xs: 12 }}>
                    <AttendanceStatusCards
                        title="Last Seven Days Working Hours"
                        data={data.weekly_attendance || []}
                    />
                </Grid>

                {/* 3. Leave Status Cards */}
                <Grid size={{ xs: 12 }}>
                    <LeaveStatusCards data={data.leave_allocations || []} />
                </Grid>

                {/* 4. Monthly Attendance Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MonthlyAttendanceChart
                        title="Monthly Attendance Chart"
                        subheader={data.attendance_range ? `Period: ${data.attendance_range}` : "Last synced just now"}
                        data={data.monthly_attendance_breakdown || {
                            present: 0,
                            absent: 0,
                            half_day: 0,
                            on_leave: 0,
                            missing: 0,
                            total_days: 0,
                            present_percentage: 0
                        }}
                        onRangeChange={handleAttendanceRangeChange}
                    />
                </Grid>

                {/* 5. Calendar */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <HRCalendar
                        title="February 2026 Calendar"
                        subheader="Upcoming holidays for this month"
                        onDateChange={handleMonthChange}
                        events={(data.holidays || []).map((h: any) => ({
                            title: h.description,
                            start: h.date,
                            color: '#FF4842'
                        }))}
                    />
                </Grid>

                {/* 6. Today's Birthdays */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <HRDashboardTable
                        title="Today's Birthdays"
                        tableData={data.todays_birthdays || []}
                        headLabel={[
                            { id: 'index', label: '#' },
                            { id: 'employee_name', label: 'Employee Name' },
                        ]}
                    />
                </Grid>

                {/* 7. Today's Leave */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <HRDashboardTable
                        title="Today's Leave"
                        tableData={data.todays_leaves || []}
                        headLabel={[
                            { id: 'index', label: '#' },
                            { id: 'employee_name', label: 'Employee Name' },
                            { id: 'employee', label: 'Employee ID' },
                        ]}
                    />
                </Grid>

                {/* 8. Missing Timesheets */}
                <Grid size={{ xs: 12 }}>
                    <MissingTimesheets
                        title="Missing Timesheets - Current Month"
                        data={data.missing_timesheets || []}
                    />
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
