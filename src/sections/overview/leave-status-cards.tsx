import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

// ----------------------------------------------------------------------

type LeaveAllocation = {
    leave_type: string;
    total_leaves_allocated: number;
    total_leaves_taken: number;
    unused_leaves?: number;
};

type Props = CardProps & {
    data: LeaveAllocation[];
};

export function LeaveStatusCards({ data, sx, ...other }: Props) {
    const theme = useTheme();

    // Find specific leave types
    const sickLeave = data.find((l) => l.leave_type === 'Paid Leave');
    const unpaidLeave = data.find((l) => l.leave_type === 'Unpaid Leave');
    const permission = data.find((l) => l.leave_type === 'Permission');

    const getUsagePercent = (allocated: number, taken: number) => {
        if (allocated === 0) return 0;
        return Math.min((taken / allocated) * 100, 100);
    };

    return (
        <Grid container spacing={3} sx={sx} {...other}>
            {/* Paid Leave */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        p: 3.25,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: alpha('#73cddd', 0.09),
                        borderRadius: 2.25,
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 26px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 2.75,
                            fontSize: '1.0625rem',
                            fontWeight: 700,
                            color: '#0f172a',
                        }}
                    >
                        Paid Leave
                    </Typography>

                    {/* Stats Row */}
                    <Stack direction="row" spacing={2.5} sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: '0.8125rem', display: 'block', mb: 0.5 }}
                            >
                                Allocated
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: '#12a3cf',
                                    mr: 0.5,
                                }}
                            >
                                {sickLeave?.total_leaves_allocated || 0}
                            </Typography>
                            <Typography component="span" sx={{ color: '#12a3cf', fontSize: '0.875rem' }}>
                                Day
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: '0.8125rem', display: 'block', mb: 0.5 }}
                            >
                                Taken
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: '#12a3cf',
                                    mr: 0.5,
                                }}
                            >
                                {sickLeave?.total_leaves_taken || 0}
                            </Typography>
                            <Typography component="span" sx={{ color: '#12a3cf', fontSize: '0.875rem' }}>
                                Day
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Progress */}
                    <Box sx={{ mt: 1.25 }}>
                        <Typography
                            variant="caption"
                            sx={{ color: '#6b7280', fontSize: '0.8125rem', display: 'block', mb: 0.75 }}
                        >
                            Usage
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={getUsagePercent(
                                sickLeave?.total_leaves_allocated || 0,
                                sickLeave?.total_leaves_taken || 0
                            )}
                            sx={{
                                height: 10,
                                borderRadius: 1.25,
                                backgroundColor: '#f1f5f9',
                                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#3b82f6',
                                    borderRadius: 1.25,
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'right',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: '#475569',
                                mt: 0.75,
                            }}
                        >
                            {getUsagePercent(
                                sickLeave?.total_leaves_allocated || 0,
                                sickLeave?.total_leaves_taken || 0
                            ).toFixed(1)}
                            %
                        </Typography>
                    </Box>
                </Card>
            </Grid>

            {/* Unpaid Leave */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        p: 3.25,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'center',
                        background: '#fafafa',
                        borderRadius: 2.25,
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 26px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 2.75,
                            fontSize: '1.0625rem',
                            fontWeight: 700,
                            color: '#0f172a',
                        }}
                    >
                        Unpaid Leave
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: '3.375rem',
                            fontWeight: 900,
                            color: '#1f2937',
                            lineHeight: 1,
                            mb: 1,
                        }}
                    >
                        {unpaidLeave?.total_leaves_taken || 0}
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}
                    >
                        Days Taken
                    </Typography>
                </Card>
            </Grid>

            {/* Permission */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                    sx={{
                        p: 3.25,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: alpha('#73cddd', 0.09),
                        borderRadius: 2.25,
                        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        boxShadow: '0 4px 18px rgba(0,0,0,0.05)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 26px rgba(0,0,0,0.08)',
                        },
                    }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mb: 2.75,
                            fontSize: '1.0625rem',
                            fontWeight: 700,
                            color: '#0f172a',
                        }}
                    >
                        Permission
                    </Typography>

                    {/* Stats Row */}
                    <Stack direction="row" spacing={2.5} sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: '0.8125rem', display: 'block', mb: 0.5 }}
                            >
                                Allocated
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: '#303538',
                                    mr: 0.5,
                                }}
                            >
                                {permission?.total_leaves_allocated || 0}
                            </Typography>
                            <Typography component="span" sx={{ color: '#303538', fontSize: '0.875rem' }}>
                                Minutes
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: '#64748b', fontSize: '0.8125rem', display: 'block', mb: 0.5 }}
                            >
                                Taken
                            </Typography>
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '1.75rem',
                                    fontWeight: 800,
                                    color: '#303538',
                                    mr: 0.5,
                                }}
                            >
                                {permission?.total_leaves_taken || 0}
                            </Typography>
                            <Typography component="span" sx={{ color: '#303538', fontSize: '0.875rem' }}>
                                Minutes
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Progress */}
                    <Box sx={{ mt: 1.25 }}>
                        <Typography
                            variant="caption"
                            sx={{ color: '#6b7280', fontSize: '0.8125rem', display: 'block', mb: 0.75 }}
                        >
                            Usage
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={getUsagePercent(
                                permission?.total_leaves_allocated || 0,
                                permission?.total_leaves_taken || 0
                            )}
                            sx={{
                                height: 10,
                                borderRadius: 1.25,
                                backgroundColor: '#f1f5f9',
                                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#10b981',
                                    borderRadius: 1.25,
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'right',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: '#475569',
                                mt: 0.75,
                            }}
                        >
                            {getUsagePercent(
                                permission?.total_leaves_allocated || 0,
                                permission?.total_leaves_taken || 0
                            ).toFixed(1)}
                            %
                        </Typography>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}
