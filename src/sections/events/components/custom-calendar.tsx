import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import React, { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiPhoneCall, FiCheckSquare } from 'react-icons/fi';

import { Box, Button, Typography, ButtonGroup, IconButton, CircularProgress } from '@mui/material';


interface CustomCalendarProps {
    events: any[];
    loading?: boolean;
    onEventClick?: (event: any) => void;
    onDateSelect?: (selectInfo: any) => void;
    onEventDrop?: (dropInfo: any) => void;
    onEventResize?: (resizeInfo: any) => void;
    selectedDate?: dayjs.Dayjs;
    onDateChange?: (date: dayjs.Dayjs) => void;
}

export function CustomCalendar({
    events,
    loading = false,
    onEventClick,
    onDateSelect,
    onEventDrop,
    onEventResize,
    selectedDate,
    onDateChange,
}: CustomCalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth'>('dayGridMonth');
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            setTitle(api.view.title);
        }
    }, [currentView]);

    useEffect(() => {
        if (selectedDate && calendarRef.current) {
            const api = calendarRef.current.getApi();
            api.gotoDate(selectedDate.toDate());
            setTitle(api.view.title);
        }
    }, [selectedDate]);

    const handlePrev = () => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            api.prev();
            setTitle(api.view.title);
            if (onDateChange) onDateChange(dayjs(api.getDate()));
        }
    };

    const handleNext = () => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            api.next();
            setTitle(api.view.title);
            if (onDateChange) onDateChange(dayjs(api.getDate()));
        }
    };

    const handleToday = () => {
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            api.today();
            setTitle(api.view.title);
            if (onDateChange) onDateChange(dayjs());
        }
    };

    const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth') => {
        setCurrentView(view);
        if (calendarRef.current) {
            const api = calendarRef.current.getApi();
            api.changeView(view);
            setTitle(api.view.title);
        }
    };

    // Format events for FullCalendar
    const formattedEvents = events.map((event) => {
        const type = event.reference_doctype;
        const evCat = event.event_category || (event as any).eventOriginalData?.event_category;
        const subjectLower = (event.subject || '').toLowerCase();

        let backgroundColor = event.color || '#08a3cd';
        let iconType: 'call' | 'meeting' | 'todo' | 'other' = 'other';

        if (type === 'Call' || type === 'Calls' || evCat === 'Call' || evCat === 'Calls' || subjectLower.includes('call')) {
            backgroundColor = '#ff9800';
            iconType = 'call';
        } else if (type === 'Meeting' || evCat === 'Meeting') {
            backgroundColor = '#4caf50';
            iconType = 'meeting';
        } else if (type === 'ToDo' || type === 'Todo' || type === 'To-do' || evCat === 'Todo' || evCat === 'ToDo') {
            backgroundColor = '#f44336';
            iconType = 'todo';
        }

        return {
            id: String(event.name || event.id),
            title: event.subject || event.name,
            start: event.starts_on || event.start,
            end: event.ends_on || event.end,
            backgroundColor,
            borderColor: backgroundColor,
            textColor: '#ffffff',
            extendedProps: {
                ...event,
                iconType,
            },
        };
    });

    const renderEventContent = (eventInfo: any) => {
        const iconType = eventInfo.event.extendedProps.iconType;

        let IconComp = null;
        if (iconType === 'call') IconComp = <FiPhoneCall size={12} style={{ marginRight: 4, flexShrink: 0 }} />;
        else if (iconType === 'meeting') IconComp = <FiCalendar size={12} style={{ marginRight: 4, flexShrink: 0 }} />;
        else if (iconType === 'todo') IconComp = <FiCheckSquare size={12} style={{ marginRight: 4, flexShrink: 0 }} />;

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.25,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    width: '100%',
                }}
            >
                {IconComp}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eventInfo.event.title}
                </span>
            </Box>
        );
    };

    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', position: 'relative' }}>
            {/* Top Toolbar matching Bryntum Layout */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.25,
                    bgcolor: '#FFFFFF', // Clean white background
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    borderBottom: '1px solid #E2E8F0',
                }}
            >
                {/* Left controls: Today button, < >, Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={handleToday}
                        startIcon={<FiCalendar size={20} style={{ color: '#0F172A' }} />}
                        sx={{
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            color: '#0F172A',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            px: 2.25,
                            py: 0.8,
                        }}
                    >
                        Today
                    </Button>
                    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                        <IconButton
                            size="small"
                            onClick={handlePrev}
                            sx={{ color: '#334155', p: 0.5 }}
                        >
                            <FiChevronLeft size={24} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleNext}
                            sx={{ color: '#334155', p: 0.5 }}
                        >
                            <FiChevronRight size={24} />
                        </IconButton>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, ml: 1, color: '#1E293B', fontSize: '1.35rem' }}>
                        {title}
                    </Typography>
                </Box>

                {/* Right controls: View switchers */}
                <ButtonGroup
                    size="small"
                    sx={{
                        bgcolor: '#CBD5E1',
                        p: '4px',
                        borderRadius: '12px',
                        '& .MuiButton-root': {
                            border: 'none !important',
                            borderRadius: '8px',
                            px: 2.2,
                            py: 0.5,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            color: '#475569',
                        },
                    }}
                >
                    <Button
                        onClick={() => handleViewChange('timeGridDay')}
                        sx={{
                            bgcolor: currentView === 'timeGridDay' ? '#FFFFFF !important' : 'transparent',
                            color: currentView === 'timeGridDay' ? '#0F172A !important' : '#475569',
                            boxShadow: currentView === 'timeGridDay' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        Day
                    </Button>
                    <Button
                        onClick={() => handleViewChange('timeGridWeek')}
                        sx={{
                            bgcolor: currentView === 'timeGridWeek' ? '#FFFFFF !important' : 'transparent',
                            color: currentView === 'timeGridWeek' ? '#0F172A !important' : '#475569',
                            boxShadow: currentView === 'timeGridWeek' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        Week
                    </Button>
                    <Button
                        onClick={() => handleViewChange('dayGridMonth')}
                        sx={{
                            bgcolor: currentView === 'dayGridMonth' ? '#FFFFFF !important' : 'transparent',
                            color: currentView === 'dayGridMonth' ? '#0F172A !important' : '#475569',
                            boxShadow: currentView === 'dayGridMonth' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        Month
                    </Button>
                    <Button
                        onClick={() => handleViewChange('listMonth')}
                        sx={{
                            bgcolor: currentView === 'listMonth' ? '#FFFFFF !important' : 'transparent',
                            color: currentView === 'listMonth' ? '#0F172A !important' : '#475569',
                            boxShadow: currentView === 'listMonth' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        Agenda
                    </Button>
                </ButtonGroup>
            </Box>

            {/* Calendar Container */}
            <Box
                sx={{
                    flex: 1,
                    p: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '& .fc': {
                        height: '100%',
                        fontFamily: 'inherit',
                    },
                    '& .fc-header-toolbar': {
                        display: 'none',
                    },
                    '& .fc-theme-standard td, & .fc-theme-standard th': {
                        borderColor: '#E2E8F0',
                    },
                    '& .fc-col-header-cell': {
                        py: 1,
                        bgcolor: '#FAFAFA',
                        color: '#E11D48',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                    },
                    '& .fc-daygrid-day-number': {
                        color: '#475569',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        p: 1,
                    },
                    '& .fc-day-today': {
                        backgroundColor: '#F0F9FF !important',
                    },
                    '& .fc-day-today .fc-daygrid-day-number': {
                        color: '#0284C7',
                        fontWeight: 700,
                    },
                    '& .fc-event': {
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                        transition: 'transform 0.15s ease',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                    },
                }}
            >
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.65)',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress color="info" />
                    </Box>
                )}

                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={currentView}
                    headerToolbar={false}
                    events={formattedEvents}
                    editable
                    selectable
                    eventContent={renderEventContent}
                    eventClick={(info) => {
                        if (onEventClick) {
                            onEventClick(info.event.extendedProps);
                        }
                    }}
                    select={(selectInfo) => {
                        if (onDateSelect) {
                            onDateSelect(selectInfo);
                        }
                    }}
                    eventDrop={(dropInfo) => {
                        if (onEventDrop) {
                            onEventDrop(dropInfo);
                        }
                    }}
                    eventResize={(resizeInfo) => {
                        if (onEventResize) {
                            onEventResize(resizeInfo);
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
