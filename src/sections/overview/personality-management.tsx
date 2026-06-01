import { BsInfoCircle } from "react-icons/bs";
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { ClickAwayListener } from '@mui/material';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { fetchPersonalityDashboardData, type PersonalityDashboardData } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import PersonalityGauge from 'src/sections/employee-evaluation/component/personality-gauge';

// ----------------------------------------------------------------------



const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

export function PersonalityManagement() {
    const theme = useTheme();
    const router = useRouter();

    const [stats, setStats] = useState<PersonalityDashboardData | null>(null);

    const getDashboardData = useCallback(async () => {
        try {
            const response = await fetchPersonalityDashboardData();
            if (response) {
                setStats(response);
            }
        } catch (error) {
            console.error('Error fetching personality data:', error);
        }
    }, []);


    useEffect(() => {
        getDashboardData();
    }, [getDashboardData]);

    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    const displayTraits = stats?.traits ?? [];
    const totalScore = stats?.totalScore ?? 100;

    const improvementsList = Array.isArray(stats?.howToImprove)
        ? stats.howToImprove.filter(Boolean)
        : stats?.howToImprove
            ? [stats.howToImprove]
            : [];
    const hasImprovements = improvementsList.length > 0;

    return (
        <Card
            sx={{
                p: 2,
                boxShadow: theme.palette.mode === 'light' ? theme.shadows[8] : theme.shadows[12],
            }}
        >
            <Stack spacing={4}>
                {/* Header */}
                <Box sx={{ p: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Employee Evaluation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Overview of employee performance and traits breakdown
                    </Typography>
                </Box>

                {/* FLEX SECTION */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    {/* Gauge Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        <PersonalityGauge value={totalScore} width={300} height={300} />

                        <Stack spacing={0.5} sx={{ mb: 3, textAlign: 'center', mt: -3 }}>
                            <ClickAwayListener onClickAway={() => setIsPinned(false)}>
                                <Box sx={{ display: 'inline-block' }}>
                                    <Tooltip
                                        title={
                                            hasImprovements ? (
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: '#0e7490', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', pb: 1, fontSize: '0.95rem' }}>
                                                        Recommended Improvements
                                                    </Typography>
                                                    <Stack spacing={2}>
                                                        {improvementsList.map((item, i) => {
                                                            const [advice, details] = item.split(' - ');
                                                            return (
                                                                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                                    <Box sx={{ minWidth: 8, height: 8, borderRadius: '50%', bgcolor: '#06b6d4', mt: 0.7, boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)' }} />
                                                                    <Stack spacing={0.3}>
                                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#117eb2', lineHeight: 1.4, textAlign: 'left' }}>
                                                                            {advice}
                                                                        </Typography>
                                                                        {details && (
                                                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0e7490', opacity: 0.8, textAlign: 'left', fontStyle: 'italic' }}>
                                                                                {details}
                                                                            </Typography>
                                                                        )}
                                                                    </Stack>
                                                                </Box>
                                                            );
                                                        })}
                                                    </Stack>
                                                </Box>
                                            ) : (
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: '#166534', borderBottom: '1px solid rgba(34, 197, 94, 0.3)', pb: 1, fontSize: '0.95rem' }}>
                                                        Recommended Improvements
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                        <Iconify icon={"eva:checkmark-circle-2-fill" as any} width={18} sx={{ color: '#22c55e', mt: 0.2 }} />
                                                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d', lineHeight: 1.4, textAlign: 'left' }}>
                                                            No improvement suggestions at the moment. Keep up the excellent performance!
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )
                                        }
                                        arrow
                                        placement="top"
                                        disableFocusListener
                                        disableTouchListener
                                        open={isHovered || isPinned}
                                        onOpen={() => setIsHovered(true)}
                                        onClose={() => setIsHovered(false)}
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    background: hasImprovements
                                                        ? 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 50%, #f0fdf4 100%)'
                                                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                                    color: hasImprovements ? '#117eb2' : '#15803d',
                                                    fontSize: '0.875rem',
                                                    padding: '16px 24px',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                    maxWidth: 420,
                                                    fontWeight: 700,
                                                    lineHeight: 1.6,
                                                    textAlign: 'left',
                                                    border: hasImprovements ? '1px solid #06b6d4' : '1px solid #22c55e',
                                                    backdropFilter: 'blur(10px)',
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: hasImprovements ? '#f0f9ff' : '#f0fdf4',
                                                },
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            onClick={() => setIsPinned(!isPinned)}
                                            sx={{
                                                color: 'info.main',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 0.8,
                                                animation: `${pulse} 3s infinite ease-in-out`,
                                                pb: 3,
                                                cursor: 'help'
                                            }}
                                        >
                                            <BsInfoCircle style={{ fontSize: '1.1rem' }} />
                                            What Needs Improvement?
                                        </Typography>
                                    </Tooltip>
                                </Box>
                            </ClickAwayListener>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Last Updated:{' '}
                                <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                    {stats?.lastUpdated
                                        ? new Date(stats.lastUpdated).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : 'No evaluations yet'}
                                </Box>
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Status:{' '}
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 800,
                                        color: stats?.status === 'Excellent' ? 'success.main'
                                            : stats?.status === 'Good' ? 'info.main'
                                                : stats?.status === 'Average' ? 'warning.main'
                                                    : 'error.main',
                                    }}
                                >
                                    {stats?.status || 'Excellent'}
                                </Box>
                            </Typography>
                        </Stack>
                    </Box>

                    {/* List Section */}
                    <Box sx={{ flex: 1, width: '100%' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, mt: -10 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Recent Evaluations
                            </Typography>
                            <Button
                                size="small"
                                color="primary"
                                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                                sx={{ fontSize: '0.75rem', fontWeight: 700 }}
                                onClick={() => router.push('/employee-evaluation')}
                            >
                                View All
                            </Button>
                        </Stack>

                        {displayTraits.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    py: 4,
                                    gap: 1,
                                    color: 'text.disabled',
                                }}
                            >
                                <Iconify icon="eva:slash-outline" width={40} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    No evaluations yet
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                    Trait scores will appear after your first evaluation.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {displayTraits.map((item, index) => {
                                    const pastelPalette = ['#e0f2fe', '#f0fdf4', '#fff7ed', '#f5f3ff', '#fff1f2', '#ecfdf5', '#fdf2f8'];
                                    return (
                                        <Box
                                            key={`${item.trait}-${index}`}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 2,
                                                bgcolor: item.score > 0 ? '#f0fdf4' : item.score < 0 ? '#fff1f2' : '#f8f9fa',
                                                color: 'text.primary',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.trait}</Typography>
                                            <Typography
                                                variant="body1"
                                                fontWeight={800}
                                                sx={{ color: item.score > 0 ? 'success.main' : item.score < 0 ? 'error.main' : 'text.secondary' }}
                                            >
                                                {item.score > 0 ? `+${item.score}` : item.score}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Stack>
        </Card>
    );
}