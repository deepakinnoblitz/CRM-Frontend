import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title: string;
    total: number;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
    loading?: boolean;
    compact?: boolean;
};

export function HRSummaryWidget({ title, total, icon, color = 'primary', loading, compact, sx, ...other }: Props) {
    const theme = useTheme();

    const renderIcon = icon ? (
        <Box
            sx={{
                width: compact ? 48 : 64,
                height: compact ? 48 : 64,
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
                    width: compact ? 24 : 28,
                    height: compact ? 24 : 28,
                },
            }}
        >
            {icon}
        </Box>
    ) : null;

    return (
        <Card
            sx={[
                {
                    p: compact ? 2 : 3,
                    px: compact ? 2 : 3,
                    pl: compact ? 3 : 4,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    justifyContent: 'space-between',
                    transition: theme.transitions.create(['box-shadow', 'transform']),
                    boxShadow: (theme as any).customShadows?.z4 || theme.shadows[4],
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: (theme as any).customShadows?.z12 || theme.shadows[12],
                        '& .icon-container': {
                            transform: 'scale(1.1)',
                        },
                    },
                    // Subtle background gradient based on color
                    background: `linear-gradient(150deg, ${alpha((theme.palette as any)[color]?.main || theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    border: `1px solid ${alpha((theme.palette as any)[color]?.main || theme.palette.primary.main, 0.16)}`,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'fontWeightSemiBold', mb: compact ? 0.5 : 1 }}>
                    {title}
                </Typography>
                {loading ? (
                    <Box sx={{ height: compact ? 32 : 48, display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={compact ? 20 : 24} color="inherit" sx={{ opacity: 0.48 }} />
                    </Box>
                ) : (
                    <Typography variant={compact ? "h4" : "h3"} sx={{ fontWeight: 'fontWeightBold' }}>
                        {fNumber(total)}
                    </Typography>
                )}
            </Box>

            {icon && (
                <Box className="icon-container" sx={{ transition: 'transform 0.2s' }}>
                    {renderIcon}
                </Box>
            )}
        </Card>
    );
}
