import type { CardProps } from '@mui/material/Card';

import { useRef, useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
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
    half_day: number;
    on_leave: number;
    missing: number;
    holiday: number;
    total_days: number;
    calendar_total: number;
    attendance_percentage: number;
};

type Props = CardProps & {
    title: string;
    subheader?: string;
    calendarData: CalendarDay[];
    joiningDate?: string | null;
    breakdown?: AttendanceBreakdown; // NEW: Accept pre-calculated breakdown
};

export function CalendarAttendanceChart({ title, subheader, calendarData, joiningDate, breakdown: manualBreakdown, sx, ...other }: Props) {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Calculate/Memoize breakdown
    const breakdown = useMemo<AttendanceBreakdown>(() => {
        if (manualBreakdown) return manualBreakdown;

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
        let onLeave = 0;
        let halfDay = 0;

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

            // Handle holidays first
            if (record.status === 'Holiday' || (isSunday && !record.holiday_info)) { // Treat Sundays as holidays if not explicitly marked otherwise
                holiday += 1;
                return;
            }

            // Now we're dealing with working days only
            const hasInTime = !!record.check_in;
            const hasOutTime = !!record.check_out;
            const isIncomplete = (hasInTime && !hasOutTime) || (!hasInTime && hasOutTime);

            // Handle incomplete attendance as "Missing" 
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
                present += 1; // Count leave as present for attendance percentage
                onLeave += 1;
            } else if (record.status === 'Half Day') {
                present += 0.5;
                missing += 0.5;
                halfDay += 1;
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

        const calendarTotal = calendarData.length;
        const workingDays = Math.max(0, calendarTotal - holiday);
        const attendancePercentage = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;

        return {
            present: Math.round(present * 10) / 10,
            absent: Math.round(absent * 10) / 10,
            missing: Math.round(missing * 10) / 10,
            holiday,
            half_day: halfDay,
            on_leave: onLeave,
            total_days: workingDays,
            calendar_total: calendarTotal,
            attendance_percentage: attendancePercentage,
        };
    }, [calendarData, manualBreakdown, joiningDate]);

    // Draw donut with exploded leader lines
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return () => { };
        const ctx = canvas.getContext('2d');
        if (!ctx) return () => { };
        const dpr = window.devicePixelRatio || 1;
        const w = 500; // Match container width
        const h = 400;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.scale(dpr, dpr);

        const statusColors = {
            present: '#36B37E',
            absent: '#FF5630',
            missing: '#FFAB00',
            half_day: '#FFAB00',
            holiday: '#8E33FF',
            other: '#E0E0E0',
        };

        // Exploded Corner Positions (targetY matches the center of the rendered labels)
        // Grouped: Actionable (Missing/Absent) on Left, Info-only (Present/Half Day) on Right
        // Labels to show
        const labelItems = [
            { id: 'present', label: 'Present', value: breakdown.present, color: statusColors.present },
            { id: 'absent', label: 'Absent', value: breakdown.absent, color: statusColors.absent },
            { id: 'missing', label: 'Missing', value: breakdown.missing, color: statusColors.missing },
            { id: 'half_day', label: 'Half Day', value: breakdown.half_day, color: statusColors.half_day },
        ].filter(item => item.value > 0);

        const total = breakdown.present + breakdown.absent + breakdown.missing + breakdown.half_day || 1;
        const cx = 250;
        const cy = 200;
        const radius = 105;
        const lineWidth = 30;

        const startAngle = -Math.PI / 2;
        let progress = 0;
        const animationSpeed = 0.03;

        // Pre-calculate label positions for both canvas and JSX
        const calculatePositions = () => {
            let currentAngle = startAngle;
            const leftLabels: any[] = [];
            const rightLabels: any[] = [];

            labelItems.forEach((item) => {
                const angle = (item.value / total) * Math.PI * 2;
                const midAngle = currentAngle + (angle / 2);

                // Determine side based on mid-angle
                // -PI/2 to PI/2 is Right, otherwise Left
                const normalizedAngle = Math.atan2(Math.sin(midAngle), Math.cos(midAngle));
                const isRight = normalizedAngle > -Math.PI / 2 && normalizedAngle <= Math.PI / 2;

                const preferredY = cy + Math.sin(midAngle) * (radius + 20);

                const info = {
                    ...item,
                    midAngle,
                    preferredY,
                    actualY: preferredY,
                    isRight
                };

                if (isRight) {
                    rightLabels.push(info);
                } else {
                    leftLabels.push(info);
                }

                currentAngle += angle;
            });

            // Space out labels vertically
            const spaceLabels = (labels: any[]) => {
                if (labels.length === 0) return;
                labels.sort((a, b) => a.preferredY - b.preferredY);

                const minDist = 80; // Minimum vertical space between labels
                for (let i = 1; i < labels.length; i++) {
                    if (labels[i].actualY < labels[i - 1].actualY + minDist) {
                        labels[i].actualY = labels[i - 1].actualY + minDist;
                    }
                }

                // Center the group vertically if they moved too much
                const currentHeight = labels[labels.length - 1].actualY - labels[0].actualY;
                const preferredHeight = labels[labels.length - 1].preferredY - labels[0].preferredY;
                const shift = (preferredHeight - currentHeight) / 2;
                labels.forEach(l => { l.actualY += shift; });

                // Keep within bounds
                const topBound = 60;
                const bottomBound = 340;
                if (labels[0].actualY < topBound) {
                    const diff = topBound - labels[0].actualY;
                    labels.forEach(l => { l.actualY += diff; });
                }
                if (labels[labels.length - 1].actualY > bottomBound) {
                    const diff = labels[labels.length - 1].actualY - bottomBound;
                    labels.forEach(l => { l.actualY -= diff; });
                }
            };

            spaceLabels(leftLabels);
            spaceLabels(rightLabels);

            return [...leftLabels, ...rightLabels];
        };

        const finalLabels = calculatePositions();

        let animationId: number;
        const animate = () => {
            if (progress < 1) {
                progress += animationSpeed;
            }

            ctx.clearRect(0, 0, w, h);

            let currentAngle = startAngle;
            labelItems.forEach((item) => {
                const angle = (item.value / total) * Math.PI * 2 * progress;

                // Draw segment
                ctx.beginPath();
                ctx.arc(cx, cy, radius, currentAngle, currentAngle + angle);
                ctx.strokeStyle = item.color;
                ctx.lineWidth = lineWidth;
                ctx.lineCap = 'round';
                ctx.stroke();

                currentAngle += angle;
            });

            // Draw Leader Lines after donut reaches certain progress
            if (progress > 0.8) {
                finalLabels.forEach(label => {
                    const pointX = cx + Math.cos(label.midAngle) * (radius + 10);
                    const pointY = cy + Math.sin(label.midAngle) * (radius + 10);

                    ctx.beginPath();
                    ctx.moveTo(pointX, pointY);

                    const bendX = label.isRight ? cx + radius + 20 : cx - radius - 20;
                    const bendY = label.actualY;

                    ctx.lineTo(bendX, bendY);

                    const endX = label.isRight ? 375 : 125;
                    ctx.lineTo(endX, bendY);

                    ctx.strokeStyle = alpha(label.color, 0.4);
                    ctx.lineWidth = 1.2;
                    ctx.lineCap = 'butt';
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(endX, bendY, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = label.color;
                    ctx.fill();
                });
            }

            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(cx, cy, radius - lineWidth / 2 + 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = theme.palette.text.primary;
            ctx.font = `800 24px ${theme.typography.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${breakdown.attendance_percentage}%`, cx, cy - 8);

            ctx.fillStyle = theme.palette.text.secondary;
            ctx.font = `600 12px ${theme.typography.fontFamily}`;
            ctx.fillText('Present Percent', cx, cy + 18);

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    progress = 0;
                    cancelAnimationFrame(animationId);
                    animate();
                } else {
                    cancelAnimationFrame(animationId);
                    progress = 0;
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(canvas);

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationId);
        };
    }, [breakdown]);

    const renderLabel = (item: any, top: number, side: 'left' | 'right') => (
        <Box
            key={item.label}
            sx={{
                position: 'absolute',
                top: top - 25,
                ...(side === 'left' ? { left: 5 } : { right: 5 }),
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(item.color, 0.04),
                borderLeft: side === 'left' ? `4px solid ${item.color}` : 'none',
                borderRight: side === 'right' ? `4px solid ${item.color}` : 'none',
                width: 120,
                transition: (t) => t.transitions.create('background-color'),
                '&:hover': {
                    bgcolor: alpha(item.color, 0.08)
                }
            }}
        >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                {item.label}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={0.3}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800 }}>
                    {item.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.65rem' }}>
                    /{breakdown.calendar_total}
                </Typography>
            </Stack>
        </Box>
    );

    // Dynamic Label Calculations for JSX
    const dynamicLabels = useMemo(() => {
        const total = breakdown.present + breakdown.absent + breakdown.missing + breakdown.half_day || 1;
        const cy = 200;
        const radius = 105;
        const startAngle = -Math.PI / 2;

        const labelItems = [
            { id: 'present', label: 'Present', value: breakdown.present, color: '#36B37E' },
            { id: 'absent', label: 'Absent', value: breakdown.absent, color: '#FF5630' },
            { id: 'missing', label: 'Missing', value: breakdown.missing, color: '#FFAB00' },
            { id: 'half_day', label: 'Half Day', value: breakdown.half_day, color: '#FFAB00' },
        ].filter(item => item.value > 0);

        let currentAngle = startAngle;
        const leftLabels: any[] = [];
        const rightLabels: any[] = [];

        labelItems.forEach((item) => {
            const angle = (item.value / total) * Math.PI * 2;
            const midAngle = currentAngle + (angle / 2);
            const normalizedAngle = Math.atan2(Math.sin(midAngle), Math.cos(midAngle));
            const isRight = normalizedAngle > -Math.PI / 2 && normalizedAngle <= Math.PI / 2;
            const preferredY = cy + Math.sin(midAngle) * (radius + 20);

            const info = { ...item, actualY: preferredY, isRight };
            if (isRight) rightLabels.push(info);
            else leftLabels.push(info);
            currentAngle += angle;
        });

        const spaceLabels = (labels: any[]) => {
            labels.sort((a, b) => a.actualY - b.actualY);
            const minDist = 80;
            for (let i = 1; i < labels.length; i++) {
                if (labels[i].actualY < labels[i - 1].actualY + minDist) {
                    labels[i].actualY = labels[i - 1].actualY + minDist;
                }
            }
            const topBound = 60;
            const bottomBound = 340;
            if (labels.length > 0) {
                if (labels[0].actualY < topBound) {
                    const diff = topBound - labels[0].actualY;
                    labels.forEach(l => { l.actualY += diff; });
                }
                if (labels[labels.length - 1].actualY > bottomBound) {
                    const diff = labels[labels.length - 1].actualY - bottomBound;
                    labels.forEach(l => { l.actualY -= diff; });
                }
            }
        };

        spaceLabels(leftLabels);
        spaceLabels(rightLabels);

        return { leftLabels, rightLabels };
    }, [breakdown]);

    return (
        <Card
            sx={[
                {
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: (t) => t.customShadows?.card,
                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.08)}`,
                    overflow: 'visible',
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <CardHeader
                title={title}
                subheader={subheader}
                sx={{ mb: 2, p: 0 }}
                titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 800, color: '#1C252E' } }}
            />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    position: 'relative',
                    overflow: 'visible',
                    minHeight: 400
                }}
            >
                <Box sx={{ position: 'relative', width: 500, height: 400, display: 'flex', justifyContent: 'center' }}>
                    {/* Corner Labels (Desktop) */}
                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                        {dynamicLabels.leftLabels.map(label => renderLabel(label, label.actualY, 'left'))}
                    </Box>

                    <canvas ref={canvasRef} />

                    <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                        {dynamicLabels.rightLabels.map(label => renderLabel(label, label.actualY, 'right'))}
                    </Box>

                    {/* Mobile Legend */}
                    <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2, position: 'absolute', bottom: -50 }}>
                        {[
                            { label: 'Present', value: breakdown.present, color: '#36B37E' },
                            { label: 'Absent', value: breakdown.absent, color: '#FF5630' },
                            { label: 'Half Day', value: breakdown.half_day, color: '#FFAB00' },
                            { label: 'Missing', value: breakdown.missing, color: '#FFAB00' },
                        ].filter(i => i.value > 0).map(i => renderLabel(i, 0, 'left'))}
                    </Box>
                </Box>

                {/* Bottom KPI Tiles - Expanded Summary */}
                <Box sx={{ mt: 2, px: 2, pb: 2, width: '100%' }}>
                    <Stack spacing={3}>
                        {/* Row 1: Primary Attendance */}
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="center"
                            sx={{ flexWrap: 'wrap', gap: 2 }}
                        >
                            {[
                                { label: 'Present', value: breakdown.present, color: '#36B37E' },
                                { label: 'Absent', value: breakdown.absent, color: '#FF5630' },
                                { label: 'Half Day', value: breakdown.half_day, color: '#FFAB00' },
                                { label: 'Missing', value: breakdown.missing, color: '#FFAB00' },
                            ].map((kpi) => (
                                <Stack key={kpi.label} spacing={0.5} alignItems="center" sx={{ minWidth: 70 }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem' }}>
                                        {kpi.label}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: kpi.color }}>
                                        {kpi.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>

                        {/* Row 2: Monthly Summary */}
                        <Stack
                            direction="row"
                            spacing={3}
                            justifyContent="center"
                        >
                            {[
                                { label: 'Working Days', value: breakdown.total_days, color: 'text.secondary' },
                                { label: 'Holiday', value: breakdown.holiday, color: '#A78BFA' },
                                { label: 'Total Days', value: breakdown.calendar_total, color: 'text.secondary' },
                            ].map((kpi) => (
                                <Stack key={kpi.label} spacing={0.5} alignItems="center" sx={{ minWidth: 80 }}>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.7rem' }}>
                                        {kpi.label}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                        {kpi.value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>
                </Box>
            </Box>
        </Card>
    );
}
