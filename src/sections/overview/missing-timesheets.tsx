import type { CardProps } from '@mui/material/Card';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type MissingTimesheet = {
    date: string;
};

type Props = CardProps & {
    title: string;
    data: MissingTimesheet[];
};

export function MissingTimesheets({ title, data, sx, ...other }: Props) {
    const theme = useTheme();

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <Card
            sx={[
                {
                    p: 2.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    borderRadius: 2,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...other}
        >
            {/* Header */}
            <Typography
                variant="h6"
                sx={{
                    color: '#1e2f40',
                    mb: 2.5,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    borderBottom: `2px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                    pb: 1.25,
                }}
            >
                {title}
            </Typography>

            {/* Cards Grid */}
            {data.length > 0 ? (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 2.5,
                        pt: 0.625,
                    }}
                >
                    {data.map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                p: 2.25,
                                px: 2.5,
                                borderRadius: 2.25,
                                // Glass effect
                                background: 'rgba(255, 255, 255, 0.55)',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                // Soft border
                                border: '1px solid rgba(255, 255, 255, 0.35)',
                                // Inner + outer glow
                                boxShadow: `
                                    0 6px 18px rgba(0, 0, 0, 0.08),
                                    inset 0 0 8px rgba(255, 255, 255, 0.4)
                                `,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2.25,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                animation: 'slideUp 0.3s ease',
                                '@keyframes slideUp': {
                                    from: { transform: 'translateY(10px)', opacity: 0 },
                                    to: { transform: 'translateY(0)', opacity: 1 },
                                },
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `
                                        0 12px 24px rgba(0, 0, 0, 0.12),
                                        0 0 14px rgba(80, 140, 255, 0.45),
                                        inset 0 0 12px rgba(255, 255, 255, 0.6)
                                    `,
                                    background: 'rgba(255, 255, 255, 0.65)',
                                },
                            }}
                        >
                            {/* Number Badge */}
                            <Box
                                sx={{
                                    background: 'rgba(30, 47, 64, 0.85)',
                                    backdropFilter: 'blur(6px)',
                                    WebkitBackdropFilter: 'blur(6px)',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                                    flexShrink: 0,
                                }}
                            >
                                {index + 1}
                            </Box>

                            {/* Date */}
                            <Typography
                                sx={{
                                    color: '#1b3a8a',
                                    fontWeight: 700,
                                    fontSize: '0.9375rem',
                                    letterSpacing: 0.3,
                                }}
                            >
                                {formatDate(item.date)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 2,
                        color: '#16a34a',
                        fontWeight: 600,
                    }}
                >
                    🎉 All Timesheets Submitted! Great Job!
                </Box>
            )}
        </Card>
    );
}
