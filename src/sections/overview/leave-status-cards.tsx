import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type LeaveAllocation = {
    leave_type: string;
    total_leaves_allocated: number;
    total_leaves_taken: number;
    unused_leaves?: number;
};

type Props = CardProps & {
    data: LeaveAllocation[];
    inProbation?: boolean;
};

type LeaveIconBadgeProps = {
    color: string;
    icon: string;
    hoverIcon: string;
    badgeIcon: string;
    bgColor: string;
};

type LeaveStatProps = {
    label: string;
    value: number;
    unit: string;
    color: string;
    alert?: boolean;
};

type UsageBarProps = {
    value: number;
    color: string;
    trackColor: string;
};

const cardBaseSx = {
    position: 'relative',
    height: '100%',
    minHeight: { xs: 244, md: 260 },
    p: { xs: 2.5, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    overflow: 'hidden',
    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
    '&:hover': {
        transform: 'translateY(-6px)',
    },
    '&:hover .leave-card-primary-icon': {
        opacity: 0.16,
        transform: 'translate(-50%, -50%) scale(0.82)',
    },
    '&:hover .leave-card-hover-icon': {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)',
    },
    '&:hover .leave-card-icon-badge': {
        transform: 'translate(3px, -3px) scale(1.08)',
    },
};

function formatValue(value: number) {
    return Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function getUnit(value: number, singular: string, plural: string) {
    return Math.abs(value) === 1 ? singular : plural;
}

function getUsagePercent(allocated: number, taken: number) {
    if (allocated <= 0) return taken > 0 ? 100 : 0;

    return Math.min(Math.max((taken / allocated) * 100, 0), 100);
}

function LeaveIconBadge({ color, icon, hoverIcon, badgeIcon, bgColor }: LeaveIconBadgeProps) {
    return (
        <Box
            sx={{
                position: 'relative',
                width: 58,
                height: 58,
                flexShrink: 0,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color,
                backgroundColor: bgColor,
                border: `1px solid ${alpha(color, 0.14)}`,
                boxShadow: `0 12px 24px ${alpha(color, 0.14)}`,
            }}
        >
            <Iconify
                className="leave-card-primary-icon"
                icon={icon as any}
                width={30}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(1)',
                    transition: 'opacity 220ms ease, transform 220ms ease',
                }}
            />
            <Iconify
                className="leave-card-hover-icon"
                icon={hoverIcon as any}
                width={30}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    opacity: 0,
                    transform: 'translate(-50%, -50%) scale(0.68)',
                    transition: 'opacity 220ms ease, transform 220ms ease',
                }}
            />
            <Box
                className="leave-card-icon-badge"
                sx={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    backgroundColor: color,
                    border: '2px solid #ffffff',
                    transition: 'transform 220ms ease',
                }}
            >
                <Iconify icon={badgeIcon as any} width={15} />
            </Box>
        </Box>
    );
}

function LeaveStat({ label, value, unit, color, alert = false }: LeaveStatProps) {
    const statColor = alert ? '#dc2626' : color;

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: alert ? alpha('#ef4444', 0.08) : alpha('#ffffff', 0.66),
                border: `1px solid ${alert ? alpha('#ef4444', 0.18) : alpha('#ffffff', 0.72)}`,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    display: 'block',
                    mb: 0.75,
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                }}
            >
                {label}
            </Typography>
            <Stack direction="row" spacing={0.6} alignItems="baseline" sx={{ minWidth: 0 }}>
                <Typography
                    component="span"
                    sx={{
                        color: statColor,
                        fontSize: { xs: '1.55rem', md: '1.8rem' },
                        fontWeight: 850,
                        lineHeight: 1,
                    }}
                >
                    {formatValue(value)}
                </Typography>
                <Typography
                    component="span"
                    sx={{
                        color: statColor,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        lineHeight: 1.2,
                    }}
                >
                    {unit}
                </Typography>
            </Stack>
        </Box>
    );
}

function UsageBar({ value, color, trackColor }: UsageBarProps) {
    return (
        <Box sx={{ mt: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                    }}
                >
                    Usage
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color,
                        fontSize: '0.82rem',
                        fontWeight: 850,
                    }}
                >
                    {Math.round(value)}%
                </Typography>
            </Stack>
            <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                    height: 9,
                    borderRadius: 999,
                    backgroundColor: trackColor,
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${alpha(color, 0.78)} 0%, ${color} 100%)`,
                    },
                }}
            />
        </Box>
    );
}

export function LeaveStatusCards({ data, inProbation, sx, ...other }: Props) {
    const paidLeave = data.find((l) => l.leave_type === 'Paid Leave');
    const unpaidLeave = data.find((l) => l.leave_type === 'Unpaid Leave');
    const permission = data.find((l) => l.leave_type === 'Permission');

    const paidAllocated = paidLeave?.total_leaves_allocated || 0;
    const paidTaken = paidLeave?.total_leaves_taken || 0;
    const unpaidTaken = unpaidLeave?.total_leaves_taken || 0;
    const permissionAllocated = permission?.total_leaves_allocated || 0;
    const permissionTaken = permission?.total_leaves_taken || 0;

    const paidUsage = getUsagePercent(paidAllocated, paidTaken);
    const permissionUsage = getUsagePercent(permissionAllocated, permissionTaken);
    const paidOverused = paidTaken > paidAllocated;

    const paidColor = paidOverused ? '#dc2626' : '#2563eb';
    const unpaidColor = '#ef4444';
    const permissionColor = '#7c3aed';

    return (
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="stretch" sx={sx} {...other}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        ...cardBaseSx,
                        background: paidOverused
                            ? `linear-gradient(135deg, #ffffff 0%, ${alpha('#eff6ff', 0.96)} 46%, ${alpha('#fee2e2', 0.86)} 100%)`
                            : 'linear-gradient(135deg, #ffffff 0%, #eff6ff 52%, #dbeafe 100%)',
                        border: `1px solid ${paidOverused ? alpha('#ef4444', 0.2) : alpha('#93c5fd', 0.46)}`,
                        boxShadow: `0 14px 34px ${alpha(paidOverused ? '#ef4444' : '#2563eb', 0.1)}`,
                        '&:hover': {
                            ...cardBaseSx['&:hover'],
                            borderColor: paidOverused ? alpha('#ef4444', 0.34) : alpha('#2563eb', 0.32),
                            boxShadow: `0 22px 42px ${alpha(paidOverused ? '#ef4444' : '#2563eb', 0.16)}`,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: '#0f172a',
                                    fontSize: '1rem',
                                    fontWeight: 850,
                                }}
                            >
                                Paid Leave
                            </Typography>
                            {paidOverused && !inProbation && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        mt: 0.5,
                                        color: '#dc2626',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                    }}
                                >
                                    Limit exceeded
                                </Typography>
                            )}
                        </Box>
                        <LeaveIconBadge
                            color={paidColor}
                            icon="solar:calendar-mark-bold-duotone"
                            hoverIcon="solar:check-circle-bold-duotone"
                            badgeIcon="solar:check-circle-bold"
                            bgColor={paidOverused ? alpha('#ef4444', 0.1) : alpha('#2563eb', 0.1)}
                        />
                    </Stack>

                    {inProbation ? (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                p: 2,
                                borderRadius: 1.5,
                                backgroundColor: alpha('#ef4444', 0.08),
                                border: `1px solid ${alpha('#ef4444', 0.14)}`,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: '#b91c1c',
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    lineHeight: 1.55,
                                }}
                            >
                                Paid Leave will be available once your probation ends.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                                <LeaveStat
                                    label="Allocated"
                                    value={paidAllocated}
                                    unit={getUnit(paidAllocated, 'Day', 'Days')}
                                    color="#2563eb"
                                />
                                <LeaveStat
                                    label="Taken"
                                    value={paidTaken}
                                    unit={getUnit(paidTaken, 'Day', 'Days')}
                                    color="#2563eb"
                                    alert={paidOverused}
                                />
                            </Stack>
                            <UsageBar
                                value={paidUsage}
                                color={paidColor}
                                trackColor={paidOverused ? alpha('#fecaca', 0.66) : alpha('#bfdbfe', 0.7)}
                            />
                        </>
                    )}
                </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        ...cardBaseSx,
                        minHeight: { xs: 264, md: 284 },
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#ffffff',
                        border: `1px solid ${alpha('#ef4444', 0.12)}`,
                        boxShadow: `0 20px 42px ${alpha('#0f172a', 0.08)}`,
                        '&:hover': {
                            ...cardBaseSx['&:hover'],
                            borderColor: alpha('#ef4444', 0.22),
                            boxShadow: `0 26px 52px ${alpha('#ef4444', 0.14)}`,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#0f172a',
                                fontSize: '1rem',
                                fontWeight: 850,
                            }}
                        >
                            Unpaid Leave
                        </Typography>
                        <LeaveIconBadge
                            color={unpaidColor}
                            icon="solar:calendar-mark-bold-duotone"
                            hoverIcon="solar:close-circle-bold-duotone"
                            badgeIcon="solar:close-circle-bold"
                            bgColor={alpha('#ef4444', 0.09)}
                        />
                    </Stack>

                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            py: 2,
                        }}
                    >
                        <Typography
                            sx={{
                                color: '#0f172a',
                                fontSize: { xs: '4.25rem', md: '5rem' },
                                fontWeight: 900,
                                lineHeight: 0.92,
                            }}
                        >
                            {formatValue(unpaidTaken)}
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={{
                                mt: 1.25,
                                px: 1.5,
                                py: 0.7,
                                color: unpaidColor,
                                fontSize: '0.78rem',
                                fontWeight: 850,
                                textTransform: 'uppercase',
                                borderRadius: 999,
                                backgroundColor: alpha('#ef4444', 0.08),
                            }}
                        >
                            Days Taken
                        </Typography>
                    </Box>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        ...cardBaseSx,
                        background: 'linear-gradient(135deg, #ffffff 0%, #faf7ff 48%, #ede9fe 100%)',
                        border: `1px solid ${alpha('#c4b5fd', 0.48)}`,
                        boxShadow: `0 14px 34px ${alpha('#7c3aed', 0.1)}`,
                        '&:hover': {
                            ...cardBaseSx['&:hover'],
                            borderColor: alpha('#7c3aed', 0.3),
                            boxShadow: `0 22px 42px ${alpha('#7c3aed', 0.15)}`,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                color: '#0f172a',
                                fontSize: '1rem',
                                fontWeight: 850,
                            }}
                        >
                            Permission
                        </Typography>
                        <LeaveIconBadge
                            color={permissionColor}
                            icon="solar:clock-circle-bold-duotone"
                            hoverIcon="solar:stopwatch-bold"
                            badgeIcon="solar:clock-circle-bold"
                            bgColor={alpha('#7c3aed', 0.1)}
                        />
                    </Stack>

                    <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                        <LeaveStat
                            label="Allocated"
                            value={permissionAllocated}
                            unit={getUnit(permissionAllocated, 'Minute', 'Minutes')}
                            color={permissionColor}
                        />
                        <LeaveStat
                            label="Taken"
                            value={permissionTaken}
                            unit={getUnit(permissionTaken, 'Minute', 'Minutes')}
                            color={permissionColor}
                        />
                    </Stack>

                    <UsageBar
                        value={permissionUsage}
                        color={permissionColor}
                        trackColor={alpha('#ddd6fe', 0.75)}
                    />
                </Card>
            </Grid>
        </Grid>
    );
}
