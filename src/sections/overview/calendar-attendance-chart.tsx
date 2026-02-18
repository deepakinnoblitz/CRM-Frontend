import type { CardProps } from '@mui/material/Card';

import { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type CalendarDay = {
    date: string;
    status: string;
    check_in: string | null;
    check_out: string | null;
    working_hours: number;
    holiday_info: string | null;
    holiday_is_working_day: number;
};

type AttendanceBreakdown = {
    present: number;
    absent: number;
    missing: number;
    holiday: number;
    total_days: number;
    attendance_percentage: number;
};

type Props = CardProps & {
    title: string;
    subheader?: string;
    calendarData: CalendarDay[];
    joiningDate?: string | null;
};

export function CalendarAttendanceChart({ title, subheader, calendarData, joiningDate, sx, ...other }: Props) {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Calculate attendance breakdown from calendar data
    const breakdown: AttendanceBreakdown = (() => {
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const joiningDateObj = joiningDate ? new Date(joiningDate) : null;

        let present = 0;
        let absent = 0;
        let missing = 0;
        let holiday = 0;

        console.log('📊 Processing', calendarData.length, 'calendar days');
        console.log('📅 Today:', todayStr);
        console.log('🎯 Joining Date:', joiningDate);

        calendarData.forEach((record) => {
            const recordDate = new Date(record.date);
            const isSunday = recordDate.getDay() === 0;
            const isPast = record.date < todayStr;
            const isToday = record.date === todayStr;
            const isFuture = record.date > todayStr;

            // Skip days before joining date
            if (joiningDateObj && recordDate < joiningDateObj) {
                return;
            }

            // Skip future dates
            if (isFuture) {
                return;
            }

            // Skip Sundays - they are non-working days (count as holiday)
            if (isSunday) {
                holiday += 1;
                return;
            }

            // Check for holidays
            const isHoliday = !!record.holiday_info;
            const isNonWorkingHoliday = isHoliday && record.holiday_is_working_day === 0;

            // Non-working holidays don't count as working days
            if (isNonWorkingHoliday) {
                holiday += 1;
                return;
            }

            // Now we're dealing with working days only
            // Check for incomplete attendance (missing check-in or check-out)
            const hasInTime = !!record.check_in;
            const hasOutTime = !!record.check_out;
            const isIncomplete = (hasInTime && !hasOutTime) || (!hasInTime && hasOutTime);

            // Handle incomplete attendance as "Missing" - THIS COUNTS IN WORKING DAYS
            if (isIncomplete && (isPast || isToday)) {
                missing += 1;
                return;
            }

            // Handle based on status
            if (record.status === 'Present') {
                present += 1;
            } else if (record.status === 'Absent') {
                absent += 1;
            } else if (record.status === 'On Leave' || record.status === 'Leave') {
                // Count leave as present for attendance percentage
                present += 1;
            } else if (record.status === 'Half Day') {
                present += 0.5;
                missing += 0.5;
            } else if (record.status === 'Not Marked' && isPast && joiningDate && record.date >= joiningDate) {
                // Working day after joining with no attendance entry - this is "Unmarked"
                // DON'T count unmarked days in working days - they are excluded from the graph
                return;
            } else if (record.status === 'Not Marked' && isPast) {
                // Legacy logic - treat as absent
                absent += 1;
            } else if (isToday && record.check_in) {
                present += 1;
            } else if (isToday && !record.check_in) {
                // Today but not checked in yet - don't count
                return;
            } else {
                // Unknown/future - don't count
                return;
            }
        });

        const workingDays = present + absent + missing;
        const attendancePercentage = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;

        // Calculate total days in the month from calendar data
        const totalDaysInMonth = calendarData.length;

        console.log('✅ Final Breakdown:', {
            present,
            absent,
            missing,
            holiday,
            workingDays,
            totalDaysInMonth,
            attendancePercentage
        });

        return {
            present: Math.round(present * 10) / 10, // Keep one decimal for half days
            absent: Math.round(absent * 10) / 10,
            missing: Math.round(missing * 10) / 10,
            holiday,
            total_days: totalDaysInMonth, // Show total calendar days (e.g., 28 for Feb)
            attendance_percentage: attendancePercentage,
        };
    })();

    // Draw animated full circle pie chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Retina display support
        const dpr = window.devicePixelRatio || 1;
        const w = 320;
        const h = 320;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.scale(dpr, dpr);

        // Status-specific colors
        const statusColors = {
            present: '#22C55E',  // Green
            absent: '#FF5630',   // Red
            missing: '#FFAB00',  // Amber/Orange
            holiday: '#8E33FF',  // Purple
            other: '#E0E0E0',    // Light Grey for unmarked/other days
        };

        // Calculate "other" days (unmarked, Sundays, future days, etc.)
        const accountedDays = breakdown.present + breakdown.absent + breakdown.missing + breakdown.holiday;
        const otherDays = breakdown.total_days - accountedDays;

        const values = [
            { label: 'Present', value: breakdown.present, color: statusColors.present },
            { label: 'Absent', value: breakdown.absent, color: statusColors.absent },
            { label: 'Missing', value: breakdown.missing, color: statusColors.missing },
            { label: 'Holiday', value: breakdown.holiday, color: statusColors.holiday },
            { label: 'Other', value: otherDays, color: statusColors.other },
        ].filter(item => item.value > 0);

        const total = breakdown.total_days || 1;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 110;
        const lineWidth = 35;

        const startAngle = -Math.PI / 2; // Start from top
        let progress = 0;
        const animationSpeed = 0.03;

        function animate() {
            if (!ctx) return;

            ctx.clearRect(0, 0, w, h);

            let tempStart = startAngle;

            // Draw full circle with all segments
            values.forEach((item) => {
                const angle = (item.value / total) * Math.PI * 2;

                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = item.color;
                ctx.lineCap = 'round';
                ctx.arc(cx, cy, radius, tempStart, tempStart + angle * progress);
                ctx.stroke();

                tempStart += angle;
            });

            // White center circle
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(cx, cy, radius - lineWidth / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Total days text in center
            ctx.fillStyle = '#212B36';
            ctx.font = 'bold 32px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${breakdown.total_days}`, cx, cy - 8);

            ctx.fillStyle = '#637381';
            ctx.font = '500 13px Outfit, sans-serif';
            ctx.fillText('Total Days', cx, cy + 15);

            if (progress < 1) {
                progress += animationSpeed;
                requestAnimationFrame(animate);
            }
        }

        animate();
    }, [breakdown]);

    return (
        <Card
            sx={[
                {
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: (t) => t.customShadows?.card,
                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'text.primary' }}>
                    {title}
                </Typography>
                {subheader && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {subheader}
                    </Typography>
                )}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3, position: 'relative' }}>
                <canvas ref={canvasRef} />
            </Box>

            <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                {[
                    { label: 'Present', value: breakdown.present, color: '#22C55E' },
                    { label: 'Absent', value: breakdown.absent, color: '#FF5630' },
                    { label: 'Missing', value: breakdown.missing, color: '#FFAB00' },
                    { label: 'Holiday', value: breakdown.holiday, color: '#8E33FF' },
                ].map((item) => (
                    <Box key={item.label} sx={{ textAlign: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ color: item.color, fontWeight: 700 }}>
                                {item.label}
                            </Typography>
                        </Stack>
                        <Typography variant="subtitle2">
                            {item.value} <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400, fontSize: '0.75rem' }}>/ {breakdown.total_days}</Box>
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}
