import type { CardProps } from '@mui/material/Card';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AttendanceBreakdown = {
    present: number;
    absent: number;
    half_day: number;
    on_leave: number;
    missing: number;
    total_days: number;
    present_percentage: number;
};

type Props = CardProps & {
    title: string;
    subheader?: string;
    data: AttendanceBreakdown;
    onRangeChange?: (range: string) => void;
};

export function MonthlyAttendanceChart({ title, subheader, data, onRangeChange, sx, ...other }: Props) {
    const theme = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRange, setSelectedRange] = useState('This Month');

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = (range?: string) => {
        setAnchorEl(null);
        if (range && range !== selectedRange) {
            setSelectedRange(range);
            if (onRangeChange) {
                onRangeChange(range);
            }
        }
    };

    const open = Boolean(anchorEl);

    // Use percentage from backend
    const displayPercentage = data.present_percentage ?? 0;

    // Draw animated donut chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Retina display support
        const dpr = window.devicePixelRatio || 1;
        const w = 220;
        const h = 220;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.scale(dpr, dpr);

        // Status-specific colors
        const statusColors = {
            present: '#22C55E', // Green
            absent: '#FF5630',  // Red
            half_day: '#FFAB00', // Orange
            on_leave: '#00B8D9', // Blue
            missing: '#919EAB',  // Grey
        };

        const values = [
            { label: 'present', value: data.present, color: statusColors.present },
            { label: 'missing', value: data.missing, color: statusColors.missing },
            { label: 'absent', value: data.absent, color: statusColors.absent },
            { label: 'half_day', value: data.half_day, color: statusColors.half_day },
            { label: 'on_leave', value: data.on_leave, color: statusColors.on_leave },
        ].filter(item => item.value > 0);

        const total = data.total_days || 1;
        const cx = w / 2;
        const cy = h / 2;
        const radius = 75;
        const lineWidth = 30;

        const startAngle = -Math.PI / 2;
        let progress = 0;
        const animationSpeed = 0.03;

        function animate() {
            if (!ctx) return;

            ctx.clearRect(0, 0, w, h);

            let tempStart = startAngle;

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

            // Percentage text in center
            ctx.fillStyle = '#212B36';
            ctx.font = 'bold 28px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${displayPercentage}%`, cx, cy - 5);

            ctx.fillStyle = '#637381';
            ctx.font = '500 12px Outfit, sans-serif';
            ctx.fillText('Attendance', cx, cy + 18);

            if (progress < 1) {
                progress += animationSpeed;
                requestAnimationFrame(animate);
            }
        }

        animate();
    }, [data, displayPercentage]);

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
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                        {title}
                    </Typography>
                    {subheader && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                            {subheader}
                        </Typography>
                    )}
                </Box>

                <Button
                    size="small"
                    onClick={handleFilterClick}
                    sx={{
                        minWidth: 'auto',
                        p: '6px 10px',
                        bgcolor: 'background.neutral',
                        color: 'text.primary',
                    }}
                >
                    <Iconify icon="ic:round-filter-list" width={18} />
                </Button>
            </Stack>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => handleFilterClose()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleFilterClose('Today')}>Today</MenuItem>
                <MenuItem onClick={() => handleFilterClose('This Week')}>This Week</MenuItem>
                <MenuItem onClick={() => handleFilterClose('This Month')}>This Month</MenuItem>
            </Popover>

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
                    { label: 'Present', value: data.present, color: '#22C55E' },
                    { label: 'Missing', value: data.missing, color: '#919EAB' },
                    { label: 'Absent', value: data.absent, color: '#FF5630' },
                    { label: 'Half Day', value: data.half_day, color: '#FFAB00' },
                    { label: 'On Leave', value: data.on_leave, color: '#00B8D9' },
                ].map((item) => (
                    <Box key={item.label} sx={{ textAlign: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, bgcolor: item.color, borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {item.label}
                            </Typography>
                        </Stack>
                        <Typography variant="subtitle2">
                            {item.value} <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400, fontSize: '0.75rem' }}>/ {data.total_days}</Box>
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Card>
    );
}
