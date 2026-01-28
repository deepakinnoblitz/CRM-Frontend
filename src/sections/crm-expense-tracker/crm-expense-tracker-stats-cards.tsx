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

export default function CRMExpenseTrackerStatsCards({ stats }: Props) {
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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 5 }}>
            {ITEMS.map((item) => (
                <Card
                    key={item.label}
                    sx={{
                        p: 3,
                        width: 1,
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 2,
                        boxShadow: 'none',
                        color: (t) => t.palette[item.color].darker,
                        bgcolor: (t) => alpha(t.palette[item.color].main, 0.08),
                        border: (t) => `1px solid ${alpha(t.palette[item.color].main, 0.16)}`,
                        transition: (theme) => theme.transitions.create(['background-color', 'box-shadow'], {
                            duration: theme.transitions.duration.shorter,
                        }),
                        '&:hover': {
                            bgcolor: (t) => alpha(t.palette[item.color].main, 0.12),
                            boxShadow: (theme) => theme.customShadows.z4,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: (t) => t.palette[item.color].main,
                            bgcolor: (t) => alpha(t.palette[item.color].main, 0.12),
                            mr: 2.5,
                        }}
                    >
                        <Iconify icon={item.icon as any} width={32} />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.72, fontWeight: 'bold', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                            {item.label}
                        </Typography>
                        <Typography variant="h3">
                            {fCurrency(item.value)}
                        </Typography>
                    </Box>
                </Card>
            ))}
        </Stack>
    );
}
