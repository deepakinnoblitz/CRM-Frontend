import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title: string;
    total: number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
};

export function HRSummaryWidget({ title, total, icon, color = 'primary', sx, ...other }: Props) {
    const theme = useTheme();

    const renderIcon = (
        <Box
            sx={{
                width: 64,
                height: 64,
                flexShrink: 0,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${color}.main`,
                bgcolor: alpha((theme.palette as any)[color]?.main || theme.palette.primary.main, 0.12),
                transition: theme.transitions.create(['transform'], {
                    duration: theme.transitions.duration.shorter,
                }),
                '& svg': {
                    width: 32,
                    height: 32,
                },
            }}
        >
            {icon}
        </Box>
    );

    return (
        <Card
            sx={[
                {
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    justifyContent: 'space-between',
                    transition: theme.transitions.create(['box-shadow', 'transform']),
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme as any).customShadows?.z12 || theme.shadows[12],
                        '& .icon-container': {
                            transform: 'scale(1.1)',
                        },
                    },
                    // Subtle background gradient based on color
                    background: `linear-gradient(135deg, ${alpha((theme.palette as any)[color]?.main || theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'fontWeightSemiBold', mb: 1 }}>
                    {title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'fontWeightBold' }}>
                    {fNumber(total)}
                </Typography>
            </Box>

            <Box className="icon-container" sx={{ transition: 'transform 0.2s' }}>
                {renderIcon}
            </Box>
        </Card>
    );
}
