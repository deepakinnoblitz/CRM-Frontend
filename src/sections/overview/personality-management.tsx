import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fetchPersonalityDashboardData, type PersonalityDashboardData } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import PersonalityGauge from 'src/sections/employee-evaluation/component/personality-gauge';

// ----------------------------------------------------------------------



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

    const displayTraits = stats?.traits ?? [];
    const totalScore = stats?.totalScore ?? 100;

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

                        <Stack spacing={0.5} sx={{ mb: 3, textAlign: 'center' }}>
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