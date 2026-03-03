import type { CardProps } from '@mui/material/Card';

import { useRef, useEffect } from 'react';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Props = CardProps & {
    title?: string;
    subheader?: string;
    events: {
        title: string;
        start: string;
        color?: string;
    }[];
    onDateChange?: (date: Date) => void;
};

export function HRCalendar({ title, subheader, events, onDateChange, ...other }: Props) {
    const theme = useTheme();
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!calendarRef.current || !events.length) return;

        // Apply colors to existing cells when events update
        events.forEach((event) => {
            const cell = calendarRef.current?.querySelector(`td[data-date="${event.start}"]`);
            if (cell && event.color) {
                (cell as HTMLElement).style.backgroundColor = 'transparent';
                (cell as HTMLElement).style.boxShadow = `inset 0 0 0px 1px ${alpha(event.color, 0.44)}`;
                (cell as HTMLElement).style.border = 'none';
            }
        });
    }, [events]);

    return (
        <Card
            {...other}
            sx={{
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                borderRadius: 3,
                boxShadow: `0 8px 24px ${alpha(theme.palette.grey[500], 0.12)}`,
                overflow: 'hidden',
                ...other.sx,
            }}
        >
            <CardHeader
                title={title}
                subheader={subheader}
                sx={{
                    mb: 2,
                    '& .MuiTypography-root': {
                        fontWeight: 'bold',
                    },
                }}
            />

            <Box
                ref={calendarRef}
                sx={{
                    p: 3,
                    '& .fc': {
                        '--fc-border-color': alpha(theme.palette.grey[500], 0.12),
                        '--fc-today-bg-color': alpha(theme.palette.primary.main, 0.08),
                        '--fc-page-bg-color': 'transparent',
                        '--fc-neutral-bg-color': alpha(theme.palette.grey[500], 0.04),
                        '--fc-list-event-hover-bg-color': alpha(theme.palette.primary.lighter, 0.5),
                        fontFamily: theme.typography.fontFamily,
                    },
                    '& .fc .fc-toolbar-title': {
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: theme.palette.text.primary,
                        letterSpacing: -0.5,
                        textTransform: 'capitalize',
                    },
                    '& .fc .fc-toolbar.fc-header-toolbar': {
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        bgcolor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(20px)',
                        p: 2,
                        mx: -3,
                        mt: -3,
                        mb: 3,
                        borderRadius: '16px 16px 0 0',
                        boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.08)}`,
                    },
                    '& .fc .fc-button': {
                        bgcolor: alpha(theme.palette.grey[500], 0.08),
                        border: 'none',
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'capitalize',
                        borderRadius: '10px',
                        px: 2,
                        py: 1,
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&:focus': {
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                        },
                    },
                    '& .fc .fc-button-primary:not(:disabled).fc-button-active': {
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                            transform: 'translateY(-1px)',
                        },
                    },
                    '& .fc .fc-button-group': {
                        gap: 0.5,
                    },
                    '& .fc .fc-daygrid-day': {
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                    },
                    '& .fc .fc-daygrid-day-number': {
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        padding: '8px',
                    },
                    '& .fc .fc-daygrid-day.fc-day-today': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '& .fc-daygrid-day-number': {
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                        },
                    },
                    '& .fc .fc-col-header-cell': {
                        bgcolor: alpha(theme.palette.grey[500], 0.04),
                        borderBottom: `2px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                        py: 1.5,
                    },
                    '& .fc .fc-col-header-cell-cushion': {
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: theme.palette.text.secondary,
                        padding: '8px',
                    },
                    '& .fc .fc-daygrid-day-frame': {
                        minHeight: 100,
                        padding: '4px',
                    },
                    '& .fc .fc-event': {
                        backgroundColor: 'transparent !important',
                        borderColor: 'transparent !important',
                        boxShadow: 'none !important',
                        cursor: 'default',
                        '&:hover': {
                            backgroundColor: 'transparent !important',
                        }
                    },
                    '& .fc .fc-list': {
                        borderRadius: '12px',
                        overflow: 'hidden',
                    },
                    '& .fc .fc-list-day-cushion': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        py: 1.5,
                    },
                    '& .fc .fc-list-event': {
                        borderRadius: '8px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                        '&:hover td': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                    },
                    '& .fc .fc-list-event-dot': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 3,
                    },
                    '& .fc-theme-standard td, & .fc-theme-standard th': {
                        borderColor: alpha(theme.palette.grey[500], 0.08),
                    },
                    '& .fc-scrollgrid': {
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: `0 1px 3px ${alpha(theme.palette.grey[500], 0.08)}`,
                    },
                }}
            >
                <FullCalendar
                    plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,dayGridWeek,listMonth',
                    }}
                    height="auto"
                    contentHeight="auto"
                    stickyHeaderDates
                    eventColor={theme.palette.primary.main}
                    eventTextColor={theme.palette.primary.contrastText}
                    displayEventTime={false}
                    datesSet={(arg) => {
                        if (onDateChange) {
                            onDateChange(arg.view.currentStart);
                        }
                    }}
                    dayCellDidMount={(arg) => {
                        const date = arg.date;
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateStr = `${year}-${month}-${day}`;

                        const event = events.find((e) => e.start === dateStr);
                        if (event && event.color) {
                            arg.el.style.backgroundColor = 'transparent';
                            arg.el.style.boxShadow = `inset 0 0 12px 2px ${alpha(event.color, 0.24)}`;
                            arg.el.style.border = 'none';
                        }
                    }}
                    eventContent={(arg) => (
                        <Box sx={{
                            color: arg.event.backgroundColor,
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            mt: 0.5,
                            whiteSpace: 'normal',
                            lineHeight: 1.2,
                            width: '100%',
                            wordBreak: 'break-word',
                            px: 0.5
                        }}>
                            {arg.event.title}
                        </Box>
                    )}
                />
            </Box>
        </Card >
    );
}
