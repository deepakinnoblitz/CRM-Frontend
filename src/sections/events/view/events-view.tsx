
import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Card, Grid, Stack, Alert, Button, Snackbar, IconButton, Typography } from '@mui/material';

import { stripHtml } from 'src/utils/string';

import { getCall, type Call } from 'src/api/calls';
import { DashboardContent } from 'src/layouts/dashboard';
import { getMeeting, type Meeting } from 'src/api/meetings';
import { fetchEvents, updateEvent, createEvent, deleteEvent, type CalendarEvent } from 'src/api/events';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import TodoDialog from 'src/sections/todo/todo-dialog';
import CallDialog from 'src/sections/calls/call-dialog';
import MeetingDialog from 'src/sections/meetings/meeting-dialog';

// ----------------------------------------------------------------------

const INITIAL_EVENT_STATE: Partial<CalendarEvent> = {
    subject: '',
    description: '',
    event_category: 'Event',
    event_type: 'Private',
    starts_on: '',
    ends_on: '',
    status: 'Open',
};

export function EventsView() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [eventData, setEventData] = useState<Partial<CalendarEvent>>(INITIAL_EVENT_STATE);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    // Event Type Selection Dialog
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [openCallDialog, setOpenCallDialog] = useState(false);
    const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
    const [openTodoDialog, setOpenTodoDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const [selectedCallDoc, setSelectedCallDoc] = useState<Call | null>(null);
    const [selectedMeetingDoc, setSelectedMeetingDoc] = useState<Meeting | null>(null);

    const loadEvents = useCallback(async (start?: Date, end?: Date) => {
        try {
            const startStr = start?.toISOString();
            const endStr = end?.toISOString();
            const data = await fetchEvents(startStr, endStr);

            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleDatesSet = (arg: any) => {
        loadEvents(arg.start, arg.end);
    };

    // Handler to open type selection dialog
    const handleOpenTypeDialog = (date?: string) => {
        if (date) setSelectedDate(date);
        else setSelectedDate(null);
        setOpenTypeDialog(true);
    };

    // Handlers for opening specific dialogs
    const handleOpenCallDialog = () => {
        setOpenTypeDialog(false);
        setOpenCallDialog(true);
    };

    const handleOpenMeetingDialog = () => {
        setOpenTypeDialog(false);
        setOpenMeetingDialog(true);
    };

    const handleOpenTodoDialog = () => {
        setOpenTypeDialog(false);
        setOpenTodoDialog(true);
    };

    const handleCloseCallDialog = () => {
        setOpenCallDialog(false);
        setSelectedCallDoc(null);
    };

    const handleCloseMeetingDialog = () => {
        setOpenMeetingDialog(false);
        setSelectedMeetingDoc(null);
    };

    const handleEventClick = async (info: any) => {
        const eventId = info.event.id;
        const event = events.find(e => e.name === eventId);
        if (event) {
            if (event.reference_doctype === 'Calls' && event.reference_docname) {
                try {
                    const call = await getCall(event.reference_docname);
                    setSelectedCallDoc(call);
                    setOpenCallDialog(true);
                } catch (error) {
                    console.error('Failed to fetch call:', error);
                    setSnackbar({ open: true, message: 'Failed to fetch call details', severity: 'error' });
                }
                return;
            }

            if (event.reference_doctype === 'Meeting' && event.reference_docname) {
                try {
                    const meeting = await getMeeting(event.reference_docname);
                    setSelectedMeetingDoc(meeting);
                    setOpenMeetingDialog(true);
                } catch (error) {
                    console.error('Failed to fetch meeting:', error);
                    setSnackbar({ open: true, message: 'Failed to fetch meeting details', severity: 'error' });
                }
                return;
            }

            setSelectedEvent(event);
            setEventData({
                subject: event.subject,
                description: stripHtml(event.description || ''),
                event_category: event.event_category && event.event_category.trim() !== '' ? event.event_category : 'Event',
                event_type: event.event_type || 'Private',
                starts_on: event.starts_on.replace(' ', 'T'),
                ends_on: event.ends_on?.replace(' ', 'T') || '',
                status: event.status || 'Open',
            });
            setOpenDialog(true);
        }
    };


    const handleEventDrop = async (info: any) => {
        const { event } = info;
        try {
            await updateEvent(event.id, {
                starts_on: dayjs(event.start).format('YYYY-MM-DD HH:mm:ss'),
                ends_on: event.end ? dayjs(event.end).format('YYYY-MM-DD HH:mm:ss') : undefined
            });
            // Refresh events
            loadEvents();
        } catch (error: any) {
            console.error('Failed to update event position:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to update event position', severity: 'error' });
            info.revert();
        }
    };

    const handleEventResize = async (info: any) => {
        const { event } = info;
        try {
            await updateEvent(event.id, {
                starts_on: dayjs(event.start).format('YYYY-MM-DD HH:mm:ss'),
                ends_on: event.end ? dayjs(event.end).format('YYYY-MM-DD HH:mm:ss') : undefined
            });
            // Refresh events
            loadEvents();
        } catch (error: any) {
            console.error('Failed to update event duration:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to update event duration', severity: 'error' });
            info.revert();
        }
    };

    const handleSaveEvent = async () => {
        const formattedData = {
            ...eventData,
            starts_on: eventData.starts_on?.replace('T', ' '),
            ends_on: eventData.ends_on ? eventData.ends_on.replace('T', ' ') : undefined,
        };

        try {
            if (selectedEvent) {
                await updateEvent(selectedEvent.name, formattedData);
            } else {
                await createEvent(formattedData);
            }
            setOpenDialog(false);
            loadEvents();
            setSnackbar({ open: true, message: selectedEvent ? 'Event updated successfully' : 'Event created successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Failed to save event:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save event', severity: 'error' });
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;
        try {
            await deleteEvent(selectedEvent.name);
            setOpenDialog(false);
            setConfirmDelete({ open: false, id: null });
            loadEvents();
            setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Failed to delete event:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to delete event', severity: 'error' });
        }
    };


    const calendarEvents = events.map((event) => {
        let eventColor = event.color || '#08a3cd';

        if (!event.color) {
            switch (event.status) {
                case 'Completed':
                case 'Closed':
                    eventColor = theme.palette.success.main;
                    break;
                case 'Cancelled':
                    eventColor = theme.palette.error.main;
                    break;
                case 'Scheduled':
                    eventColor = '#08a3cd';
                    break;
                case 'Open':
                    eventColor = theme.palette.warning.main;
                    break;
                default:
                    eventColor = '#08a3cd';
            }
        }

        return {
            id: event.name,
            title: event.subject,
            start: event.starts_on,
            end: event.ends_on || event.starts_on,
            allDay: event.all_day === 1,
            color: eventColor,
            extendedProps: {
                eventType: event.event_type,
                status: event.status,
                category: event.event_category,
            },
        };
    });

    return (
        <DashboardContent maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Box>
                    <Typography variant="h4">Events Calendar</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Manage your schedule and important events
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => handleOpenTypeDialog()}
                >
                    Add Events
                </Button>
            </Stack>

            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 3,
                }}
            >

                <Box
                    sx={{
                        p: 3,
                        pt: 0,
                        '& .fc': {
                            '--fc-border-color': theme.palette.divider,
                            '--fc-daygrid-event-dot-width': '8px',
                            '--fc-list-event-dot-width': '10px',
                            '--fc-today-bg-color': theme.palette.primary.lighter,
                        },
                        // ToolBar
                        '& .fc .fc-toolbar': {
                            mb: 3,
                            gap: 1.5,
                            flexDirection: { xs: 'column', md: 'row' },
                            '& .fc-toolbar-title': {
                                fontSize: '1.25rem',
                                fontWeight: 700,
                            },
                        },
                        // Buttons
                        '& .fc .fc-button': {
                            border: 'none',
                            py: '8px',
                            px: '12px',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            backgroundColor: theme.palette.background.neutral,
                            color: theme.palette.text.primary,
                            transition: theme.transitions.create(['background-color', 'color', 'box-shadow']),
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                            '&:focus': {
                                boxShadow: 'none',
                            },
                            '&.fc-button-active': {
                                backgroundColor: '#08a3cd',
                                color: theme.palette.common.white,
                                '&:hover': {
                                    backgroundColor: '#068eb1', // Slightly darker for hover
                                },
                            },
                            '&.fc-today-button': {
                                border: `1px solid #08a3cd`,
                                '&:disabled': {
                                    opacity: 0.48,
                                },
                            },
                        },
                        // Table Head
                        '& .fc .fc-col-header-cell': {
                            py: 1.5,
                            backgroundColor: '#08a3cd', // Custom theme color
                            color: theme.palette.common.white,
                            '&:first-of-type': {
                                borderTopLeftRadius: '12px',
                            },
                            '&:last-of-type': {
                                borderTopRightRadius: '12px',
                            },
                            '& .fc-col-header-cell-cushion': {
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                            },
                        },
                        // Calendar Border Radius
                        '& .fc-view-harness': {
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                        },
                        '& .fc-scrollgrid': {
                            border: 'none',
                        },
                        // Day Cells
                        '& .fc .fc-daygrid-day': {
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            },
                        },
                        '& .fc .fc-daygrid-day-number': {
                            p: 1.5,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                        },
                        // Events
                        '& .fc .fc-event': {
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            mx: '4px',
                            my: '1px',
                            p: '2px 4px',
                            cursor: 'pointer',
                        },
                        '& .fc .fc-daygrid-event': {
                            boxShadow: 'none',
                        },
                        // List View
                        '& .fc .fc-list': {
                            border: 'none',
                            '& .fc-list-day-cushion': {
                                backgroundColor: theme.palette.background.neutral,
                            },
                        },
                    }}
                >
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                        }}
                        initialView="dayGridMonth"
                        editable
                        selectable
                        selectMirror
                        dayMaxEvents={3}
                        weekends
                        events={calendarEvents}
                        datesSet={handleDatesSet}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        select={(info) => {
                            handleOpenTypeDialog();
                        }}
                        eventContent={(eventInfo) => {
                            const { category } = eventInfo.event.extendedProps;
                            let icon = "solar:notes-bold";

                            if (category === 'Call') icon = "solar:phone-bold";
                            else if (category === 'Meeting') icon = "solar:calendar-add-bold";

                            return (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        width: 1,
                                        px: 0.5,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Iconify icon={icon as any} width={14} sx={{ flexShrink: 0 }} />
                                    <Box
                                        component="span"
                                        sx={{
                                            flexGrow: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {eventInfo.timeText && (
                                            <Box component="span" sx={{ mr: 0.5, fontWeight: 600 }}>
                                                {eventInfo.timeText}
                                            </Box>
                                        )}
                                        {eventInfo.event.title}
                                    </Box>
                                </Box>
                            );
                        }}
                        height="auto"
                        eventDisplay="block"
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short',
                        }}
                        views={{
                            dayGridMonth: {
                                titleFormat: { year: 'numeric', month: 'long' },
                            },
                            timeGridWeek: {
                                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                            },
                            timeGridDay: {
                                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                            },
                        }}
                    />
                </Box>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedEvent ? 'Edit Event' : 'New Event'}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ borderBottom: 'none', px: 3, pb: 0 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Event Overview Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Event Overview
                                </Typography>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label="Subject"
                                        placeholder="Enter event subject"
                                        value={eventData.subject}
                                        onChange={(e) => setEventData({ ...eventData, subject: e.target.value })}
                                    />

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Event Category</InputLabel>
                                                <Select
                                                    label="Event Category"
                                                    value={eventData.event_category}
                                                    onChange={(e) => setEventData({ ...eventData, event_category: e.target.value as string })}
                                                >
                                                    <MenuItem value="Event">Event</MenuItem>
                                                    <MenuItem value="Meeting">Meeting</MenuItem>
                                                    <MenuItem value="Call">Call</MenuItem>
                                                    <MenuItem value="Todo">Todo</MenuItem>
                                                    <MenuItem value="Email">Email</MenuItem>
                                                    <MenuItem value="Other">Other</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    label="Status"
                                                    value={eventData.status}
                                                    onChange={(e) => setEventData({ ...eventData, status: e.target.value as string })}
                                                >
                                                    <MenuItem value="Open">Open</MenuItem>
                                                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                                                    <MenuItem value="Completed">Completed</MenuItem>
                                                    <MenuItem value="Closed">Closed</MenuItem>
                                                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>

                            {/* Schedule Details Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Schedule Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="Starts On"
                                            value={eventData.starts_on ? dayjs(eventData.starts_on) : null}
                                            onChange={(newValue) => setEventData({ ...eventData, starts_on: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <DateTimePicker
                                            label="Ends On"
                                            value={eventData.ends_on ? dayjs(eventData.ends_on) : null}
                                            onChange={(newValue) => setEventData({ ...eventData, ends_on: newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '' })}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Description Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Details"
                                    placeholder="Enter event details..."
                                    value={eventData.description}
                                    onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                                />
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, gap: 1.5 }}>
                    {selectedEvent && (
                        <Button color="error" variant="outlined" onClick={() => setConfirmDelete({ open: true, id: selectedEvent.name })} sx={{ mr: 'auto', borderRadius: 1 }}>
                            Delete
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleSaveEvent}
                        sx={{ borderRadius: 1, px: 3 }}
                    >
                        {selectedEvent ? 'Save Changes' : 'Create Event'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this event?"
                action={
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ borderRadius: 1.5, minWidth: 100 }}>
                        Delete
                    </Button>
                }
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Event Type Selection Dialog */}
            <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Choose Event Type
                    <IconButton onClick={() => setOpenTypeDialog(false)} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ py: 2 }}>
                        {[
                            {
                                label: 'Calls',
                                icon: '/assets/company/crm/assets/images/calls-3d-white.png',
                                color: 'primary',
                                sub: 'Schedule a call',
                                handler: handleOpenCallDialog,
                            },
                            {
                                label: 'Meeting',
                                icon: '/assets/company/crm/assets/images/meeting-3d-white.png',
                                color: 'success',
                                sub: 'Schedule a meeting',
                                handler: handleOpenMeetingDialog,
                            },
                            {
                                label: 'To-do',
                                icon: '/assets/company/crm/assets/images/todo-3d-white.png',
                                color: 'warning',
                                sub: 'Create a task',
                                handler: handleOpenTodoDialog,
                            },
                        ].map((item) => (
                            <Grid key={item.label} size={{ xs: 12, md: 4 }}>
                                <Box
                                    onClick={item.handler}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2.5,
                                        cursor: 'pointer',
                                        transition: theme.transitions.create(['all'], {
                                            duration: theme.transitions.duration.shorter,
                                        }),
                                        textAlign: 'center',
                                        bgcolor: alpha(theme.palette[item.color as 'primary' | 'success' | 'warning'].main, 0.04),
                                        border: `1px solid ${alpha(theme.palette[item.color as 'primary' | 'success' | 'warning'].main, 0.1)}`,
                                        backdropFilter: 'blur(12px) saturate(160%)',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette[item.color as 'primary' | 'success' | 'warning'].main, 0.08),
                                            borderColor: theme.palette[item.color as 'primary' | 'success' | 'warning'].main,
                                            transform: 'translateY(-6px)',
                                            boxShadow: `0 12px 24px -4px ${alpha(theme.palette[item.color as 'primary' | 'success' | 'warning'].main, 0.16)}`,
                                            '& img': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                            }
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mb: 1,
                                            display: 'inline-flex',
                                            transition: theme.transitions.create(['transform']),
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={item.icon}
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                objectFit: 'contain',
                                                mixBlendMode: 'multiply',
                                                filter: 'contrast(1.2) brightness(1.1)',
                                                transition: theme.transitions.create(['transform']),
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{item.label}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.813rem' }}>
                                        {item.sub}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>

            <CallDialog
                open={openCallDialog}
                onClose={handleCloseCallDialog}
                selectedCall={selectedCallDoc}
                initialData={selectedDate ? { call_start_time: selectedDate } : undefined}
                onSuccess={loadEvents}
            />

            <MeetingDialog
                open={openMeetingDialog}
                onClose={handleCloseMeetingDialog}
                selectedMeeting={selectedMeetingDoc}
                initialData={selectedDate ? { from: selectedDate } : undefined}
                onSuccess={loadEvents}
            />

            <TodoDialog
                open={openTodoDialog}
                onClose={() => setOpenTodoDialog(false)}
                initialData={selectedDate ? { date: selectedDate.split('T')[0] } : undefined}
                onSuccess={loadEvents}
            />
        </DashboardContent>
    );
}
