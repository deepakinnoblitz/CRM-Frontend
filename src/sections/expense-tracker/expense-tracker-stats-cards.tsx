import type { PaletteColorKey } from 'src/theme/core';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    stats: {
        total_income: number;
        total_expense: number;
        balance: number;
    };
};

export default function ExpenseTrackerStatsCards({ stats }: Props) {
    const ITEMS = [
        {
            label: 'Total Income',
            value: stats.total_income,
            color: 'success' as PaletteColorKey,
            icon: 'solar:database-bold-duotone',
        },
        {
            label: 'Total Expense',
            value: stats.total_expense,
            color: 'error' as PaletteColorKey,
            icon: 'solar:bill-list-bold-duotone',
        },
        {
            label: 'Balance',
            value: stats.balance,
            color: 'info' as PaletteColorKey,
            icon: 'solar:wallet-money-bold-duotone',
        },
    ];

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
            {ITEMS.map((item) => (
                <Card
                    key={item.label}
                    sx={{
                        p: 2,
                        width: 1,
                        borderRadius: 3,
                        border: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: '#EEF0F5',
                        boxShadow: `
                            6px 6px 12px #d1d4dc,
                            -6px -6px 12px #ffffff
                        `,
                        transition: (t) =>
                            t.transitions.create(['box-shadow', 'transform'], {
                                duration: t.transitions.duration.short,
                            }),
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `
                                10px 10px 20px #c8ccd5,
                                -10px -10px 20px #ffffff
                            `,
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                    >
                        {/* Icon — left */}
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                bgcolor: '#EEF0F5',
                                color: (t) => t.palette[item.color].main,
                                boxShadow: `
                                    inset 3px 3px 6px #d1d4dc,
                                    inset -3px -3px 6px #ffffff
                                `,
                            }}
                        >
                            <Iconify icon={item.icon as any} width={22} />
                        </Box>

                        {/* Label + Value — right aligned */}
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    fontSize: 10,
                                    letterSpacing: 0.8,
                                    display: 'block',
                                    mb: 0.4,
                                    color: '#8a90a0',
                                }}
                            >
                                {item.label}
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: -0.5,
                                    color: '#2d3348',
                                }}
                            >
                                {fCurrency(item.value)}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Colored bottom accent bar */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: '15%',
                            right: '15%',
                            height: 3,
                            borderRadius: '4px 4px 0 0',
                            bgcolor: (t) => t.palette[item.color].main,
                            boxShadow: (t) =>
                                `0 -2px 8px ${alpha(t.palette[item.color].main, 0.45)}`,
                        }}
                    />
                </Card>
            ))}
        </Stack>
    );
}