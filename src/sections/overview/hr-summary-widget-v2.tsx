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

export function HRSummaryWidgetV2({
    title,
    total,
    icon,
    color = 'primary',
    loading,
    compact,
    sx,
    ...other
}: Props) {
    const theme = useTheme();

    const colorMain = (theme.palette as any)[color]?.main || theme.palette.primary.main;
    const colorDark = (theme.palette as any)[color]?.dark || theme.palette.primary.dark;
    const colorLight = (theme.palette as any)[color]?.light || theme.palette.primary.light;

    return (
        <Card
            sx={[
                {
                    p: 0,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: compact ? 120 : 148,
                    cursor: 'default',
                    borderRadius: '16px',
                    // Light white/paper background with very soft color tint
                    background: theme.palette.background.paper,
                    border: `1px solid ${alpha(colorMain, 0.14)}`,
                    boxShadow: `0 2px 12px ${alpha(colorMain, 0.08)}, 0 1px 3px ${alpha('#000', 0.06)}`,
                    transition: 'transform 0.26s cubic-bezier(.34,1.56,.64,1), box-shadow 0.26s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${alpha(colorMain, 0.16)}, 0 2px 8px ${alpha('#000', 0.08)}`,
                        border: `1px solid ${alpha(colorMain, 0.28)}`,
                        '& .icon-orb': { transform: 'scale(1.10) rotate(-5deg)' },
                        '& .top-bar': { opacity: 1 },
                    },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            {/* Top color accent bar */}
            <Box
                className="top-bar"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: '12%',
                    right: '12%',
                    height: 3,
                    borderRadius: '0 0 6px 6px',
                    background: `linear-gradient(90deg, ${alpha(colorLight, 0.6)}, ${colorMain}, ${alpha(colorLight, 0.6)})`,
                    opacity: 0.5,
                    transition: 'opacity 0.3s ease',
                    zIndex: 2,
                }}
            />

            {/* Soft color wash top-right corner */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(colorMain, 0.10)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* Content */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: compact ? 2.5 : 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '100%',
                    gap: 2,
                }}
            >
                {/* Left: text */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: compact ? '0.72rem' : '0.78rem',
                            letterSpacing: '0.04em',
                            mb: compact ? 1 : 1.5,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {title}
                    </Typography>

                    {loading ? (
                        <Box sx={{ height: compact ? 28 : 40, display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={compact ? 20 : 24} sx={{ color: colorMain, opacity: 0.6 }} />
                        </Box>
                    ) : (
                        <Typography
                            variant={compact ? 'h4' : 'h3'}
                            sx={{
                                fontWeight: 800,
                                color: 'text.primary',
                                lineHeight: 1,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            {fNumber(total)}
                        </Typography>
                    )}
                </Box>

                {/* Right: icon orb */}
                {icon && (
                    <Box
                        className="icon-orb"
                        sx={{
                            flexShrink: 0,
                            width: compact ? 46 : 56,
                            height: compact ? 46 : 56,
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            // Light tinted icon background
                            background: `linear-gradient(135deg, ${alpha(colorLight, 0.28)} 0%, ${alpha(colorMain, 0.14)} 100%)`,
                            border: `1.5px solid ${alpha(colorMain, 0.18)}`,
                            color: colorDark,
                            boxShadow: `0 2px 10px ${alpha(colorMain, 0.12)}`,
                            transition: 'transform 0.26s cubic-bezier(.34,1.56,.64,1)',
                            '& svg': {
                                width: compact ? 20 : 24,
                                height: compact ? 20 : 24,
                            },
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>

            {/* Bottom left soft dot accent */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -20,
                    left: -20,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(colorMain, 0.07)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
        </Card>
    );
}