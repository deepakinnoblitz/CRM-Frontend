import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import {
    fetchMonthCalendarData,
    fetchEmployeeDashboardData,
    type EmployeeDashboardData,
} from 'src/api/dashboard';

import { MonthlyAttendanceChart } from 'src/sections/overview/monthly-attendance-chart';

import { useAuth } from 'src/auth/auth-context';

import { HRAnnouncements } from '../hr-announcements';
import { EmployeeCalendar } from '../employee-calendar';
import { HRDashboardTable } from '../hr-dashboard-table';
import { LeaveStatusCards } from '../leave-status-cards';
import { MissingTimesheets } from '../missing-timesheets';
import { AttendanceStatusCards } from '../attendance-status-cards';

// ----------------------------------------------------------------------

export function EmployeeDashboardView() {
    const { user } = useAuth();
    const [data, setData] = useState<EmployeeDashboardData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const dashboardData = await fetchEmployeeDashboardData();
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
                attendance_range: range,
            }));
        } catch (error) {
            console.error('Failed to update attendance range:', error);
        }
    };

    const handleMonthChange = async (date: Date) => {
        try {
            const response = await fetchMonthCalendarData(date.getMonth() + 1, date.getFullYear());
            if (data) {
                setData((prev: any) => ({
                    ...prev,
                    monthly_attendance_list: response.calendar_data || [],
                    joining_date: response.joining_date,
                    holidays: (response.calendar_data || []).filter((d: any) => d.holiday_info),
                }));
            }
        } catch (error) {
            console.error('Failed to update calendar data:', error);
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
                            posting_date: a.posting_date,
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
                        subheader={
                            data.attendance_range ? `Period: ${data.attendance_range}` : 'Last synced just now'
                        }
                        data={
                            data.monthly_attendance_breakdown || {
                                present: 0,
                                absent: 0,
                                half_day: 0,
                                on_leave: 0,
                                holiday: 0,
                                missing: 0,
                                total_days: 0,
                                present_percentage: 0,
                            }
                        }
                        onRangeChange={handleAttendanceRangeChange}
                    />
                </Grid>

                {/* 5. Calendar */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <EmployeeCalendar
                        title={`${new Date(data.start_date || new Date()).toLocaleString('default', { month: 'long' })} ${new Date(data.start_date || new Date()).getFullYear()} Calendar`}
                        subheader="Attendance and holidays for this month"
                        onDateChange={handleMonthChange}
                        events={
                            (data.monthly_attendance_list || [])
                                .map((record: any) => {
                                    const todayObj = new Date();
                                    const year = todayObj.getFullYear();
                                    const month = String(todayObj.getMonth() + 1).padStart(2, '0');
                                    const day = String(todayObj.getDate()).padStart(2, '0');
                                    const todayStr = `${year}-${month}-${day}`;

                                    const isToday = record.date === todayStr;
                                    const isPast = record.date < todayStr;
                                    const isHoliday = !!record.holiday_info;
                                    const isNonWorkingHoliday = isHoliday && record.holiday_is_working_day === 0;

                                    let eventTitle = '';
                                    let bgColor = '';

                                    // Check if date is before joining date
                                    const joiningDate = data.joining_date;
                                    if (joiningDate && record.date < joiningDate) {
                                        // Don't show anything for dates before joining
                                        return null;
                                    }

                                    // 1. Holiday Logic (Non-working) - Priority
                                    if (isNonWorkingHoliday) {
                                        eventTitle = record.holiday_info || 'Holiday';
                                        bgColor = '#B71D18'; // Dark Red for Holiday
                                    }
                                    // 2. Status Based Logic
                                    else {
                                        // Check for incomplete attendance (missing in_time or out_time)
                                        const hasInTime = !!record.check_in;
                                        const hasOutTime = !!record.check_out;
                                        const isIncomplete = (hasInTime && !hasOutTime) || (!hasInTime && hasOutTime);

                                        if (isIncomplete && (isPast || isToday)) {
                                            eventTitle = 'Missing';
                                            bgColor = '#FFC107'; // Amber/Yellow for Missing
                                        } else if (record.status === 'Present') {
                                            eventTitle = 'Present';
                                            bgColor = '#22C55E'; // Green
                                        } else if (record.status === 'Absent') {
                                            eventTitle = 'Absent';
                                            bgColor = '#FF5630'; // Red
                                        } else if (record.status === 'On Leave' || record.status === 'Leave') {
                                            eventTitle = 'On Leave';
                                            bgColor = '#00B8D9'; // Blue/Cyan for Leave
                                        } else if (record.status === 'Half Day') {
                                            eventTitle = 'Half Day';
                                            bgColor = '#FFAB00'; // Orange
                                        } else if (
                                            record.status === 'Not Marked' &&
                                            isPast &&
                                            joiningDate &&
                                            record.date >= joiningDate
                                        ) {
                                            // Working day after joining with no attendance entry
                                            eventTitle = 'Unmarked';
                                            bgColor = '#9E9E9E'; // Gray for Unmarked
                                        } else if (isPast) {
                                            // Default for past unmarked days (legacy logic)
                                            eventTitle = 'Absent';
                                            bgColor = '#FF5630';
                                        } else if (isToday) {
                                            if (record.check_in) {
                                                eventTitle = 'Present';
                                                bgColor = '#22C55E';
                                            } else {
                                                // Today unmarked
                                                return null;
                                            }
                                        } else if (isHoliday) {
                                            // Future Working Holiday
                                            eventTitle = record.holiday_info || 'Holiday';
                                            bgColor = '#B71D18';
                                        } else {
                                            return null;
                                        }
                                    }

                                    return {
                                        title: eventTitle,
                                        start: record.date,
                                        color: bgColor,
                                        textColor: '#FFFFFF',
                                    };
                                })
                                .filter(Boolean) as any[]
                        }
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
                        holidays={data.holidays || []}
                    />
                </Grid>
            </Grid>
        </DashboardContent>
    );
}
