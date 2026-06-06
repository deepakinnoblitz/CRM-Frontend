
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import '@bryntum/core-thin/fontawesome/css/fontawesome.css';
import '@bryntum/core-thin/fontawesome/css/solid.css';
import '@bryntum/core-thin/core.css';
import '@bryntum/grid-thin/grid.css';
import '@bryntum/scheduler-thin/scheduler.css';
import '@bryntum/calendar-thin/calendar.css';
import '@bryntum/core-thin/svalbard-light.css';

import { LuFilter } from "react-icons/lu";
import listPlugin from '@fullcalendar/list';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BryntumCalendar } from '@bryntum/calendar-react-thin';
import { FiPhoneCall, FiCalendar, FiCheckSquare } from 'react-icons/fi';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Card, Grid, Stack, Alert, Button, Snackbar, IconButton, Typography, CircularProgress, Popover, Divider, InputAdornment, Badge } from '@mui/material';

import { stripHtml } from 'src/utils/string';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { getToDo, deleteToDo, type ToDo } from 'src/api/todo';
import { getCall, deleteCall, type Call } from 'src/api/calls';
import { getMeeting, deleteMeeting, type Meeting } from 'src/api/meetings';
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

const getLocalDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes(' ') || dateStr.includes('T')) {
        return dayjs.utc(dateStr).local().format('YYYY-MM-DD');
    }
    return dayjs(dateStr).format('YYYY-MM-DD');
};

export function EventsView() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
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
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedCallDoc, setSelectedCallDoc] = useState<Call | null>(null);
    const [selectedMeetingDoc, setSelectedMeetingDoc] = useState<Meeting | null>(null);
    const [selectedTodoDoc, setSelectedTodoDoc] = useState<ToDo | null>(null);

    const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
    const [clickedEvent, setClickedEvent] = useState<CalendarEvent | null>(null);
    const [miniCalDate, setMiniCalDate] = useState<any>(dayjs());
    const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');

    const handleClosePopover = () => {
        setPopoverAnchorEl(null);
    };

    const handleOpenEditDialog = async (event: CalendarEvent) => {
        setPopoverAnchorEl(null);
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

        if (event.reference_doctype === 'ToDo' && event.reference_docname) {
            try {
                const todo = await getToDo(event.reference_docname);
                setSelectedTodoDoc(todo);
                setOpenTodoDialog(true);
            } catch (error) {
                console.error('Failed to fetch todo:', error);
                setSnackbar({ open: true, message: 'Failed to fetch task details', severity: 'error' });
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
    };

    const handleDeleteClick = () => {
        if (clickedEvent) {
            setSelectedEvent(clickedEvent);
            setConfirmDelete({ open: true, id: clickedEvent.name });
            setPopoverAnchorEl(null);
        }
    };

    const loadEvents = useCallback(async (start?: Date, end?: Date) => {
        setLoadingEvents(true);
        try {
            const startStr = start?.toISOString();
            const endStr = end?.toISOString();
            const data = await fetchEvents(startStr, endStr);

            setEvents(data);
            console.log('Fetched events count:', data.length);
        } catch (error: any) {
            console.error('Failed to load events:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to load events', severity: 'error' });
        } finally {
            setLoadingEvents(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    useEffect(() => {
        if (!miniCalDate) return () => {};
        
        const dateStr = miniCalDate.format('YYYY-MM-DD');

        const applyHighlight = () => {
            document.querySelectorAll('.crm-main-selected-date').forEach(el => {
                el.classList.remove('crm-main-selected-date');
            });
            const cell = document.querySelector(`[data-date="${dateStr}"]`);
            if (cell) {
                cell.classList.add('crm-main-selected-date');
            }
        };

        const timer = setTimeout(applyHighlight, 50);
        return () => clearTimeout(timer);
    }, [miniCalDate, events]);

    const handleDatesSet = (arg: any) => {
        loadEvents(arg.start, arg.end);
    };

    // Handler to open type selection dialog
    const handleOpenTypeDialog = useCallback((date?: string) => {
        if (date) setSelectedDate(date);
        else setSelectedDate(null);
        setOpenTypeDialog(true);
    }, []);

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

    const handleOpenEventDialog = () => {
        setOpenTypeDialog(false);
        setSelectedEvent(null);
        setEventData({
            ...INITIAL_EVENT_STATE,
            starts_on: selectedDate ? selectedDate.replace(' ', 'T') : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
            ends_on: selectedDate ? selectedDate.replace(' ', 'T') : dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
        });
        setOpenDialog(true);
    };

    const handleCloseCallDialog = () => {
        setOpenCallDialog(false);
        setSelectedCallDoc(null);
    };

    const handleCloseMeetingDialog = () => {
        setOpenMeetingDialog(false);
        setSelectedMeetingDoc(null);
    };

    const handleCloseTodoDialog = () => {
        setOpenTodoDialog(false);
        setSelectedTodoDoc(null);
    };

    const handleEventClick = async (info: any) => {
        console.log('handleEventClick ignored to prevent opening full edit dialogs directly', info);
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

        setLoadingEvents(true);
        try {
            if (selectedEvent) {
                const response = await updateEvent(selectedEvent.name, formattedData);
                console.log('Updated event response:', response);
                setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' });
            } else {
                const response = await createEvent(formattedData);
                console.log('Created event response:', response);
                setSnackbar({ open: true, message: 'Event created successfully', severity: 'success' });
            }
            setOpenDialog(false);
            loadEvents();
        } catch (error: any) {
            console.error('Failed to save event:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save event', severity: 'error' });
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;
        setLoadingEvents(true);
        try {
            if (selectedEvent.reference_doctype === 'Calls' && selectedEvent.reference_docname) {
                await deleteCall(selectedEvent.reference_docname);
            } else if (selectedEvent.reference_doctype === 'Meeting' && selectedEvent.reference_docname) {
                await deleteMeeting(selectedEvent.reference_docname);
            } else if (selectedEvent.reference_doctype === 'ToDo' && selectedEvent.reference_docname) {
                await deleteToDo(selectedEvent.reference_docname);
            } else {
                await deleteEvent(selectedEvent.name);
            }
            console.log('Deleted event response:', selectedEvent.name);
            setOpenDialog(false);
            setConfirmDelete({ open: false, id: null });
            loadEvents();
            setSnackbar({ open: true, message: 'Event deleted successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Failed to delete event:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to delete event', severity: 'error' });
        } finally {
            setLoadingEvents(false);
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

    // Bryntum Calendar configuration and logic (New Calendar UI)
    const calendarRef = useRef<BryntumCalendar>(null);
    const initialDateRef = useRef(new Date());

    const stateRef = useRef<any>({});
    stateRef.current = {
        events,
        loadEvents,
        setSelectedCallDoc,
        setOpenCallDialog,
        setSelectedMeetingDoc,
        setOpenMeetingDialog,
        setSelectedTodoDoc,
        setOpenTodoDialog,
        setSelectedEvent,
        setEventData,
        setOpenDialog,
        setSnackbar,
        handleOpenTypeDialog,
        handleOpenEventDialog,
        setClickedEvent,
        setPopoverAnchorEl,
    };

    const handlersRef = useRef({
        eventClick: async ({ eventRecord, eventElement, domEvent }: any) => {
            const {
                events: latestEvents,
                setClickedEvent: stateSetClickedEvent,
                setPopoverAnchorEl: stateSetPopoverAnchorEl
            } = stateRef.current;

            const eventId = eventRecord.id;
            const event = latestEvents.find((e: any) => e.name === eventId);
            if (event) {
                setClickedEvent(event);
                setPopoverAnchorEl(domEvent?.target || domEvent?.currentTarget || null);
            }
        },
        beforeEventCreate: ({ date }: any) => {
            const { handleOpenTypeDialog: stateHandleOpenTypeDialog } = stateRef.current;
            const dateStr = dayjs(date).format('YYYY-MM-DDTHH:mm:ss');
            stateHandleOpenTypeDialog(dateStr);
            return false;
        },
        beforeDragMoveEnd: async ({ eventRecord, newStartDate, newEndDate }: any): Promise<boolean> => {
            const { loadEvents: stateLoadEvents, setSnackbar: stateSetSnackbar } = stateRef.current;
            try {
                console.log('eventDrop fired');
                console.log('Dropped locked check', eventRecord.data);

                const isLocked =
                    eventRecord.get?.('isCompletedLocked') === true ||
                    eventRecord.data?.isCompletedLocked === true;

                if (isLocked) {
                    stateSetSnackbar({
                        open: true,
                        message: 'Completed events cannot be rescheduled.',
                        severity: 'error',
                    });
                    stateLoadEvents();
                    return false;
                }

                const eventId = eventRecord.id || eventRecord.data?.id || (typeof eventRecord.get === 'function' ? eventRecord.get('id') : undefined);
                await updateEvent(eventId, {
                    starts_on: dayjs(newStartDate).format('YYYY-MM-DD HH:mm:ss'),
                    ends_on: newEndDate ? dayjs(newEndDate).format('YYYY-MM-DD HH:mm:ss') : undefined
                });
                stateLoadEvents();
                return true;
            } catch (error: any) {
                console.error('Failed to update event position:', error);
                stateSetSnackbar({ open: true, message: error.message || 'Failed to update event position', severity: 'error' });
                stateLoadEvents();
                return false;
            }
        },
        eventResizeEnd: async ({ eventRecord, startDate, endDate }: any) => {
            const { loadEvents: reload, setSnackbar: stateSetSnackbar } = stateRef.current;
            try {
                await updateEvent(eventRecord.id, {
                    starts_on: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
                    ends_on: endDate ? dayjs(endDate).format('YYYY-MM-DD HH:mm:ss') : undefined
                });
                reload();
            } catch (error: any) {
                console.error('Failed to update event duration:', error);
                stateSetSnackbar({ open: true, message: error.message || 'Failed to update event duration', severity: 'error' });
                reload();
            }
        }
    });

    const calendarPropsRef = useRef({
        date: initialDateRef.current,
        mode: 'month',
        eventRenderer: ({ eventRecord, renderData, element }: any) => {
            const color = eventRecord.data?.eventColor || eventRecord.eventColor || '#08a3cd';
            
            if (renderData) {
                renderData.eventColor = color;
                renderData.style = `background-color: ${color}; color: white;`;
            }

            return eventRecord.name || eventRecord.title || '';
        },
        modes: {
            day: true,
            week: true,
            month: {
                showWeekNumber: false
            },
            year: true,
            agenda: true
        },
        features: {
            eventEdit: false, // disable built-in event editor
            eventTooltip: false, // disable default event tooltip
            eventMenu: false // disable default event context menu
        },
        sidebar: false, // disable built-in sidebar; we render our own React sidebar
        listeners: {
            eventClick: (args: any) => handlersRef.current.eventClick(args),
            beforeEventCreate: (args: any) => handlersRef.current.beforeEventCreate(args),
            beforeDragMoveEnd: (args: any) => handlersRef.current.beforeDragMoveEnd(args),
            eventResizeEnd: (args: any) => handlersRef.current.eventResizeEnd(args)
        }
    });

    const todayEvents = useMemo(() => {
        const todayStart = dayjs().startOf('day');
        const todayEnd = dayjs().endOf('day');
        return events.filter((event) => {
            if (!event.starts_on) return false;
            const start = dayjs(event.starts_on);
            const end = dayjs(event.ends_on || event.starts_on);
            return (start.isBefore(todayEnd) || start.isSame(todayEnd)) &&
                   (end.isAfter(todayStart) || end.isSame(todayStart));
        });
    }, [events]);

    const filteredTodayEvents = useMemo(() => {
        if (!searchQuery) return todayEvents;
        return todayEvents.filter(evt =>
            evt.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [todayEvents, searchQuery]);

    useEffect(() => {
        if (calendarRef.current?.instance) {
            const calendar = calendarRef.current.instance;
            // Programmatically disable built-in features to prevent duplicate/unwanted popups
            if (calendar.features?.eventTooltip) calendar.features.eventTooltip.disabled = true;
            if (calendar.features?.eventEdit) calendar.features.eventEdit.disabled = true;
            if (calendar.features?.eventMenu) calendar.features.eventMenu.disabled = true;
        }
    }, [loadingEvents]);

    useEffect(() => {
        const injectIcons = () => {
            const eventNodes = document.querySelectorAll('.b-cal-event-wrap');
            eventNodes.forEach(node => {
                const eventId = node.getAttribute('data-event-id');
                if (!eventId) return;

                const descNode = node.querySelector('.b-cal-event-desc') || node.querySelector('.b-cal-event-body');
                if (!descNode) return;

                if (descNode.querySelector('.crm-inline-event-icon')) return;

                const event = events?.find((e: any) => String(e.name) === String(eventId));
                if (!event) return;

                const type = event.reference_doctype;
                const evCat = event.event_category;
                const subjectLower = (event.subject || '').toLowerCase();

                let IconComponent = null;
                if (type === 'Call' || type === 'Calls' || evCat === 'Call' || evCat === 'Calls' || subjectLower.includes('call')) {
                    IconComponent = <FiPhoneCall size={12} />;
                } else if (type === 'Meeting') {
                    IconComponent = <FiCalendar size={12} />;
                } else if (type === 'ToDo' || type === 'Todo') {
                    IconComponent = <FiCheckSquare size={12} />;
                }

                if (IconComponent) {
                    const span = document.createElement('span');
                    span.className = 'crm-inline-event-icon';
                    span.style.display = 'inline-flex';
                    span.style.alignItems = 'center';
                    span.style.marginRight = '4px';
                    span.style.verticalAlign = 'middle';
                    span.style.flexShrink = '0';
                    
                    descNode.insertBefore(span, descNode.firstChild);
                    
                    const root = createRoot(span);
                    root.render(IconComponent);
                }
            });
        };

        const timer = setInterval(injectIcons, 300);
        return () => clearInterval(timer);
    }, [events]);

    const bryntumEvents = useMemo(() => {
        console.log('BRYNTUM EVENTS USEMEMO RUNNING', events?.length);
        if (!events) return [];

        let filtered = events;
        if (eventTypeFilter && eventTypeFilter !== 'All') {
            filtered = events.filter((event) => {
                const type = event.reference_doctype;
                const evCat = event.event_category || (event as any).eventOriginalData?.event_category;
                const subjectLower = (event.subject || '').toLowerCase();
                
                if (eventTypeFilter === 'Calls') {
                    return type === 'Call' || type === 'Calls' || evCat === 'Call' || evCat === 'Calls' || subjectLower.includes('call');
                } else if (eventTypeFilter === 'Meetings') {
                    return type === 'Meeting';
                } else if (eventTypeFilter === 'To-Do') {
                    return type === 'ToDo' || type === 'Todo' || type === 'To-do';
                }
                return true;
            });
        }

        return filtered.map((event) => {
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

            const rawStatus = String(
                (event as any).status ||
                (event as any).workflow_state ||
                (event as any).call_status ||
                (event as any).meeting_status ||
                (event as any).event_status ||
                ''
            ).trim().toLowerCase();

            const isCompletedLocked = rawStatus === 'completed' || rawStatus === 'closed';

            console.log("Calendar event mapping:", event.name, event.subject, event.status, event.reference_doctype, event.reference_docname, "rawStatus:", rawStatus, "isCompletedLocked:", isCompletedLocked);

            const startDate = event.starts_on ? dayjs(event.starts_on).toDate() : new Date();
            let endDate = event.ends_on ? dayjs(event.ends_on).toDate() : startDate;

            // Fix for events (like CRM Meetings) that have missing or identical ends_on,
            // which causes Bryntum to treat them as 0-duration milestones (b-milestone).
            if (startDate.getTime() === endDate.getTime()) {
                endDate = dayjs(startDate).add(1, 'hour').toDate();
            }

            const finalBryntumEvent = {
                id: event.name,
                name: event.subject,
                title: event.subject,
                start: event.starts_on,
                end: event.ends_on || event.starts_on,
                starts_on: event.starts_on,
                ends_on: event.ends_on || event.starts_on,
                startDate,
                endDate,
                allDay: event.all_day === 1,
                eventColor,
                color: eventColor,
                backgroundColor: eventColor,
                status: event.status,
                eventStatus: event.status,
                eventOriginalData: event,
                reference_doctype: event.reference_doctype,
                reference_docname: event.reference_docname,
                event_category: (event as any).event_category,
                event_type: (event as any).event_type,
                isCompletedLocked,
                rawStatus,
                originalEventName: event.name,
            };

            if (
                finalBryntumEvent.name?.includes('meeting') ||
                finalBryntumEvent.name?.includes('Meeting') ||
                finalBryntumEvent.reference_doctype === 'Meeting'
            ) {
                console.log(`===== FINAL MEETING DEBUG: ${finalBryntumEvent.name} =====`);
                console.table({
                    id: finalBryntumEvent.id,
                    name: finalBryntumEvent.name,
                    startDate: finalBryntumEvent.startDate,
                    endDate: finalBryntumEvent.endDate,
                    allDay: finalBryntumEvent.allDay,
                    durationMS:
                        (finalBryntumEvent.startDate as any) instanceof Date && (finalBryntumEvent.endDate as any) instanceof Date
                        ? (finalBryntumEvent.endDate as any).getTime() - (finalBryntumEvent.startDate as any).getTime()
                        : 'invalid date',
                    durationUnit: (finalBryntumEvent as any).durationUnit,
                    milestone: (finalBryntumEvent as any).milestone,
                    isMilestone: (finalBryntumEvent as any).isMilestone,
                    eventStyle: (finalBryntumEvent as any).eventStyle,
                    cls: (finalBryntumEvent as any).cls,
                    eventColor: finalBryntumEvent.eventColor
                });
            }

            return finalBryntumEvent;
        });
    }, [events, theme, eventTypeFilter]);

    return (
        <>
            <style>{`
                /* Hide any watermark or trial indicators */
                .b-watermark,
                [class*="b-watermark"],
                .b-sch-watermark,
                .b-trial,
                .b-sch-trial,
                [class*="trial"],
                [class*="trial"]::before,
                [class*="trial"]::after,
                .b-calendar::before,
                .b-calendar::after,
                .b-calendar-content::before,
                .b-calendar-content::after,
                .b-grid-panel-body::before,
                .b-grid-panel-body::after,
                .b-timeline-subgrid::before,
                .b-timeline-subgrid::after,
                /* Override inline background SVGs used for watermarks specifically */
                [style*="data:image/svg+xml"] {
                    background-image: none !important;
                }
                /* Hide element-level watermarks completely */
                .b-watermark,
                [class*="watermark"],
                .b-sch-watermark,
                .b-trial,
                .b-sch-trial,
                [class*="trial"] {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }
                /* Hide week number column */
                .b-week-num {
                    display: none !important;
                    width: 0px !important;
                }
                /* Hide 'other' resource item from the sidebar resourceFilter checklist */
                .b-list-item[data-id="other"],
                .b-resourcefilter .b-list-item[data-id="other"] {
                    display: none !important;
                    height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: none !important;
                }
                /* Hide Bryntum default event dot icon */
                .b-cal-event-icon {
                    display: none !important;
                }
                /* Keep existing event background color visible after click/selection */
                .b-cal-event-bar-container .b-cal-event-wrap:not(.b-solid-bar) .b-cal-event {
                    background: var(--b-calendar-event-color) !important;
                }
                .b-cal-event-bar-container .b-cal-event-wrap:not(.b-solid-bar) .b-cal-event .b-cal-event-icon,
                .b-cal-event-bar-container .b-cal-event-wrap:not(.b-solid-bar) .b-cal-event .b-cal-recurrence-icon,
                .b-cal-event-bar-container .b-cal-event-wrap:not(.b-solid-bar) .b-cal-event .b-cal-event-body {
                    color: var(--b-calendar-event-reveal-color) !important;
                }
                .b-cal-event-bar-container .b-cal-event-wrap .b-cal-event {
                    background: var(--b-calendar-event-color) !important;
                }
                /* Prevent intraday events from dimming when another event is selected */
                .b-calendar .b-cal-event-wrap.b-colorize.b-intraday {
                    opacity: 1 !important;
                }

                /* Fix multi-day Bryntum solid-bar text visibility */
                .b-cal-event-wrap.b-solid-bar .b-cal-event-desc {
                    color: #ffffff !important;
                    opacity: 1 !important;
                    filter: none !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }

                .b-cal-event-wrap.b-solid-bar .b-cal-event-desc *,
                .b-cal-event-wrap.b-solid-bar .crm-inline-event-icon,
                .b-cal-event-wrap.b-solid-bar svg {
                    color: #ffffff !important;
                    stroke: #ffffff !important;
                    opacity: 1 !important;
                    filter: none !important;
                }

                .b-has-selection .b-cal-event-wrap.b-solid-bar .b-cal-event-desc,
                .b-has-selection .b-cal-event-wrap.b-solid-bar .b-cal-event-desc * {
                   color: #ffffff !important;
                   opacity: 1 !important;
                   filter: none !important;
                }
                .crm-event-content {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  width: 100%;
                  overflow: hidden;
                }

                .crm-event-icon {
                  display: inline-flex;
                  align-items: center;
                  flex-shrink: 0;
                }

                .crm-event-icon svg {
                  width: 12px;
                  height: 12px;
                  stroke: currentColor;
                }

                .crm-event-title {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }

                /* Layout overrides for full-width toolbar */
                .b-top-toolbar,
                .b-toolbar,
                .b-calendar-tbar {
                    height: 64px !important;
                    padding-left: 16px !important;
                    border-bottom: 1px solid ${theme.palette.divider} !important;
                    box-sizing: border-box !important;
                }
                .b-calendar-panel-body {
                    position: relative !important;
                    margin-left: 260px !important;
                    width: calc(100% - 260px) !important;
                    border-top: none !important;
                    box-sizing: border-box !important;
                    background-color: var(--b-calendar-background, #fff) !important;
                }

                /* Inset the view container to create proper visual breathing space on all sides of the grid */
                .b-calendar-view-container {
                    position: absolute !important;
                    top: 0px !important;
                    left: 250px !important;
                    right: 0px !important;
                    bottom: 0px !important;
                    width: auto !important;
                    height: auto !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                }

                /* Styling view grids as premium floating cards with soft shadows and borders */
                .b-month-view,
                .b-day-view,
                .b-week-view,
                .b-year-view,
                .b-agenda-view {
                    border: 0px solid ${theme.palette.divider} !important;
                    border-radius: 0px !important;
                    overflow: hidden !important;
                    background-color: var(--b-calendar-background, #fff) !important;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05) !important;
                }

                /* Center column headers for balanced, modern, and aligned alignment */
                .b-month-view .b-calendar-day-header {
                    justify-content: center !important;
                    padding-bottom: 8px !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
                .b-day-column-header-cell {
                    justify-content: center !important;
                    align-items: center !important;
                    padding: 8px 0 !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                }

                /* Overall calendar event padding, gap, and text presentation */
                .crm-event-content {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px !important; /* Visual separation between icon and text */
                  width: 100%;
                  overflow: hidden;
                }
                .b-cal-event {
                    padding: 0px 05px !important; /* Balanced internal padding for text breathing room */
                }

                /* Overall calendar event border radius for premium modern feel */
                .b-cal-event-wrap,
                .b-cal-event {
                    border-radius: 6px !important;
                }

                /* Month View Spacing & Positioning Overrides */
                .b-month-view {
                    --b-month-view-event-padding: 12px !important; /* Spacing from cell borders */
                    --bi-event-spacing: 8px !important; /* Space between stacked events */
                    --b-month-view-cell-header-padding: 12px 12px 0 0 !important; /* Spacing for day numbers */
                    --b-month-view-padding: 2.6em 0 0 0 !important; /* Breathing space below day numbers */
                }

                /* Day/Week View spacing */
                .b-day-view {
                    --b-day-view-event-body-padding: 2px 10px !important; /* Spacing inside event cards */
                    --b-day-view-event-border-radius: 6px !important;
                }
                .b-day-view-day-detail .b-cal-event-wrap {
                    padding: 5px 6px !important; /* Margin around event cards from grid borders */
                }

                /* Year View spacing & typography hierarchy */
                .b-year-view {
                    --b-year-view-row-gap: 2.0em !important; /* Open layout spacing */
                    --b-year-view-column-gap: 2.em !important;
                    --b-year-view-content-padding: 24px !important;
                }
                .b-year-view .b-week-number-cell {
                    display: none !important;
                    width: 0px !important;
                    flex: 0 0 0px !important;
                }
                .b-year-view-month-name {
                    font-weight: 700 !important;
                    font-size: 1.15rem !important;
                    color: var(--b-neutral-10, #212B36) !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    padding-bottom: 8px !important;
                }

                /* Agenda View spacing and alignment */
                .b-agenda-view {
                    --b-agenda-view-cell-padding-block: 16px !important; /* Comfortable vertical cell spacing */
                    --b-agenda-view-cell-padding-inline: 20px !important;
                }
                .b-cal-agenda-event-row {
                    padding: 2px 1 !important; /* Balanced internal event line height/spacing */
                }
                .b-agenda-view .b-cal-event-wrap {
                    margin-block: 2px !important;
                }

                /* Selected Date Highlight */
                .crm-main-selected-date {
                  background: rgba(0, 145, 255, 0.08) !important;
                  outline: 1px solid #c3dcfaff !important;
                  outline-offset: -2px;
                }
            `}</style>
            <DashboardContent maxWidth="xl">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} mt={2}>
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

                {/* 1. Full width Event Types Legend */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, mb: 1.5, px: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Event Types:</Typography>
                    <Box 
                        onClick={() => setEventTypeFilter('All')}
                        sx={{ 
                            display: 'flex', alignItems: 'center', gap: 0.5, 
                            color: eventTypeFilter === 'All' ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                            fontWeight: eventTypeFilter === 'All' ? 700 : 400,
                            bgcolor: eventTypeFilter === 'All' ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
                            px: 1, py: 0.5, borderRadius: 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <LuFilter size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>All</Typography>
                    </Box>
                    <Box 
                        onClick={() => setEventTypeFilter('Calls')}
                        sx={{ 
                            display: 'flex', alignItems: 'center', gap: 0.5, 
                            color: eventTypeFilter === 'Calls' ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                            fontWeight: eventTypeFilter === 'Calls' ? 700 : 400,
                            bgcolor: eventTypeFilter === 'Calls' ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
                            px: 1, py: 0.5, borderRadius: 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiPhoneCall size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>Calls</Typography>
                    </Box>
                    <Box 
                        onClick={() => setEventTypeFilter('Meetings')}
                        sx={{ 
                            display: 'flex', alignItems: 'center', gap: 0.5, 
                            color: eventTypeFilter === 'Meetings' ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                            fontWeight: eventTypeFilter === 'Meetings' ? 700 : 400,
                            bgcolor: eventTypeFilter === 'Meetings' ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
                            px: 1, py: 0.5, borderRadius: 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiCalendar size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>Meetings</Typography>
                    </Box>
                    <Box 
                        onClick={() => setEventTypeFilter('To-Do')}
                        sx={{ 
                            display: 'flex', alignItems: 'center', gap: 0.5, 
                            color: eventTypeFilter === 'To-Do' ? 'primary.main' : 'text.secondary',
                            cursor: 'pointer',
                            fontWeight: eventTypeFilter === 'To-Do' ? 700 : 400,
                            bgcolor: eventTypeFilter === 'To-Do' ? (t) => alpha(t.palette.primary.main, 0.08) : 'transparent',
                            px: 1, py: 0.5, borderRadius: 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <FiCheckSquare size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>To-Do</Typography>
                    </Box>
                </Box>

                {/* Calendar Layout: custom sidebar + Bryntum calendar */}
                <Card sx={{ mb: 3, overflow: 'hidden', position: 'relative', height: 720 }}>

                    {/* ---- Custom Left Sidebar ---- */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 64, // starts immediately below toolbar
                            left: 0,
                            bottom: 0,
                            width: 260,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                            overflowY: 'auto',
                            zIndex: 20
                        }}
                    >
                        {/* Mini month calendar */}
                        <Box
                            sx={{
                                '& .MuiDateCalendar-root': {
                                    width: '90%', // full width
                                    maxHeight: 240,
                                    minHeight: 'unset',
                                    mt: 3 // removed extra empty gap
                                },
                                '& .MuiPickersCalendarHeader-root': {
                                    pl: 1, pr: 0.5, mt: 0.5, mb: 0,
                                },
                                '& .MuiPickersCalendarHeader-label': {
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    width: 30,
                                    height: 24,
                                },
                                '& .MuiPickersDay-root': {
                                    width: 28,
                                    height: 28,
                                    fontSize: '0.78rem',
                                    '&.Mui-selected': {
                                        bgcolor: '#08a3cd',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#068eb1' },
                                    },
                                    '&.MuiPickersDay-today:not(.Mui-selected)': {
                                        borderColor: '#08a3cd',
                                    },
                                },
                                '& .MuiDayCalendar-slideTransition': {
                                    minHeight: 170,
                                },
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateCalendar
                                    value={miniCalDate}
                                    onChange={(newVal: any) => setMiniCalDate(newVal)}
                                    showDaysOutsideCurrentMonth
                                    slots={{
                                        day: (props) => {
                                            const { day, outsideCurrentMonth, ...other } = props;
                                            
                                            // Find all events for this date
                                            const dayEvents = outsideCurrentMonth ? [] : events.filter((event) => {
                                                if (!event.starts_on) return false;
                                                const start = dayjs(event.starts_on).startOf('day');
                                                const end = dayjs(event.ends_on || event.starts_on).startOf('day');
                                                const target = day.startOf('day');
                                                return (target.isAfter(start) || target.isSame(start)) && (target.isBefore(end) || target.isSame(end));
                                            });

                                            // Determine dots (max 3)
                                            const dots = dayEvents.slice(0, 3).map((event, index) => {
                                                const type = event.reference_doctype;
                                                const evCat = event.event_category || (event as any).eventOriginalData?.event_category;
                                                const subjectLower = (event.subject || '').toLowerCase();
                                                
                                                let bgColor = '#08a3cd'; // default
                                                if (type === 'Call' || type === 'Calls' || evCat === 'Call' || evCat === 'Calls' || subjectLower.includes('call')) {
                                                    bgColor = '#ff9800'; // orange
                                                } else if (type === 'Meeting') {
                                                    bgColor = '#4caf50'; // green
                                                } else if (type === 'ToDo' || type === 'Todo' || type === 'To-do') {
                                                    bgColor = '#f44336'; // red
                                                }
                                                return <Box key={`${event.name || index}-${index}`} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: bgColor }} />;
                                            });

                                            return (
                                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
                                                    {dots.length > 0 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 2,
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                display: 'flex',
                                                                gap: '2px',
                                                                pointerEvents: 'none'
                                                            }}
                                                        >
                                                            {dots}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>

                        <Divider />
                        {/* Search box */}
                        <Box sx={{ p: 2, pb: 1.5 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 18, height: 18 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.875rem',
                                    }
                                }}
                            />
                        </Box>

                        <Divider />

                        {/* Today Events heading */}
                        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                            <Typography
                                variant="overline"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.08em',
                                    color: 'text.secondary',
                                }}
                            >
                                Today Events
                            </Typography>
                        </Box>

                        {/* Event cards list */}
                        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
                            {filteredTodayEvents.length === 0 ? (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        py: 4,
                                        color: 'text.disabled',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    No Today Events Found
                                </Box>
                            ) : (
                                <Stack spacing={0.75}>
                                    {filteredTodayEvents.map((evt) => {
                                        let dotColor = evt.color || '#08a3cd';
                                        if (!evt.color) {
                                            switch (evt.status) {
                                                case 'Completed':
                                                case 'Closed': dotColor = theme.palette.success.main; break;
                                                case 'Cancelled': dotColor = theme.palette.error.main; break;
                                                case 'Scheduled': dotColor = '#08a3cd'; break;
                                                case 'Open': dotColor = theme.palette.warning.main; break;
                                                default: dotColor = '#08a3cd';
                                            }
                                        }
                                        return (
                                            <Box
                                                key={evt.name}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    px: 1.25,
                                                    py: 1,
                                                    borderRadius: 1.5,
                                                    bgcolor: 'background.neutral',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                }}
                                                onClick={() => handleOpenEditDialog(evt)}
                                            >
                                                {/* Color dot */}
                                                <Box
                                                    sx={{
                                                        mt: 0.5,
                                                        width: 9,
                                                        height: 9,
                                                        borderRadius: '50%',
                                                        bgcolor: dotColor,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: '0.8125rem',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {evt.subject.replace(/\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*$/i, '')}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                                                    >
                                                        {(() => {
                                                            if (!evt.starts_on) return '';
                                                            const start = dayjs(evt.starts_on);
                                                            const end = dayjs(evt.ends_on || evt.starts_on);
                                                            const isMultiDay = !start.isSame(end, 'day');

                                                            if (isMultiDay) {
                                                                return `${start.format('MMM D, hh:mm A')} - ${end.format('MMM D, hh:mm A')}`;
                                                            }
                                                            if (!evt.ends_on || start.isSame(end, 'minute')) {
                                                                return start.format('hh:mm A');
                                                            }
                                                            return `${start.format('hh:mm A')} - ${end.format('hh:mm A')}`;
                                                        })()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Box>
                    </Box>

                    {/* ---- Bryntum Calendar grid ---- */}
                    <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, position: 'relative' }}>
                            {loadingEvents && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    bgcolor: 'rgba(255, 255, 255, 0.6)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <CircularProgress color="info" />
                                </Box>
                            )}
                            <BryntumCalendar
                                ref={calendarRef}
                                {...calendarPropsRef.current}
                                eventTooltipFeature={false}
                                eventEditFeature={false}
                                eventMenuFeature={false}
                                events={bryntumEvents}
                            />
                        </Box>
                    </Box>
                </Card>

                {/* Old Events Calendar Component (Hidden / Commented out safely) */}

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, boxShadow: (t) => t.customShadows.z24, } }}>
                    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, boxShadow: (t) => t.customShadows.z24, } }}>
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
                                    icon: `${CONFIG.assetsDir}/images/calls-3d-white.png`,
                                    color: 'primary',
                                    sub: 'Schedule a call',
                                    handler: handleOpenCallDialog,
                                },
                                {
                                    label: 'Meeting',
                                    icon: `${CONFIG.assetsDir}/images/meeting-3d-white.png`,
                                    color: 'success',
                                    sub: 'Schedule a meeting',
                                    handler: handleOpenMeetingDialog,
                                },
                                {
                                    label: 'To-do',
                                    icon: `${CONFIG.assetsDir}/images/todo-3d-white.png`,
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
                                            bgcolor: alpha(theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main, 0.04),
                                            border: `1px solid ${alpha(theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main, 0.1)}`,
                                            backdropFilter: 'blur(12px) saturate(160%)',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main, 0.08),
                                                borderColor: theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main,
                                                transform: 'translateY(-6px)',
                                                boxShadow: `0 12px 24px -4px ${alpha(theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main, 0.16)}`,
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
                    onClose={handleCloseTodoDialog}
                    selectedTodo={selectedTodoDoc}
                    initialData={selectedDate ? { date: selectedDate.split('T')[0] } : undefined}
                    onSuccess={loadEvents}
                />

                <Popover
                    open={Boolean(popoverAnchorEl)}
                    anchorEl={popoverAnchorEl}
                    onClose={handleClosePopover}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    PaperProps={{
                        sx: {
                            p: 2.5,
                            width: 380,
                            borderRadius: 3,
                            boxShadow: (t) => t.customShadows?.z24 || '0 12px 24px -4px rgba(0,0,0,0.12)',
                            border: '1px solid',
                            borderColor: 'divider',
                            backdropFilter: 'blur(8px)',
                        },
                    }}
                >
                    {clickedEvent && (() => {
                        const isCompleted = (clickedEvent.status || '').toLowerCase() === 'completed' || (clickedEvent.status || '').toLowerCase() === 'closed';
                        const showDuration = isCompleted;

                        return (
                            <Stack spacing={2}>
                                {/* Header */}
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                                    <Typography variant="subtitle1" sx={{ 
                                        fontWeight: 700, 
                                        flexGrow: 1,
                                        wordBreak: 'break-word'
                                    }}>
                                        {clickedEvent.subject}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ pt: 0.25 }}>
                                        <IconButton size="small" onClick={() => handleOpenEditDialog(clickedEvent)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                            <Iconify icon="solar:pen-bold" width={20} />
                                        </IconButton>
                                        <IconButton size="small" onClick={handleDeleteClick} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                                            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                        </IconButton>
                                        <IconButton size="small" onClick={handleClosePopover} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
                                            <Iconify icon="mingcute:close-line" width={20} />
                                        </IconButton>
                                    </Stack>
                                </Stack>

                                {/* Start Date */}
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ width: 44, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', textAlign: 'center', flexShrink: 0 }}>
                                        <Box sx={{ bgcolor: 'info.main', color: 'common.white', fontSize: '0.688rem', fontWeight: 700, py: 0.25, textTransform: 'uppercase' }}>
                                            {dayjs(clickedEvent.starts_on).format('MMM')}
                                        </Box>
                                        <Box sx={{ bgcolor: 'background.neutral', color: 'text.primary', fontSize: '0.938rem', fontWeight: 700, py: 0.5 }}>
                                            {dayjs(clickedEvent.starts_on).format('D')}
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        {dayjs(clickedEvent.starts_on).format('MMM D, YYYY h:mm A')}
                                    </Typography>
                                </Stack>

                                {/* End Date */}
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ width: 44, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', textAlign: 'center', flexShrink: 0 }}>
                                        <Box sx={{ bgcolor: 'info.main', color: 'common.white', fontSize: '0.688rem', fontWeight: 700, py: 0.25, textTransform: 'uppercase' }}>
                                            {dayjs(clickedEvent.ends_on || clickedEvent.starts_on).format('MMM')}
                                        </Box>
                                        <Box sx={{ bgcolor: 'background.neutral', color: 'text.primary', fontSize: '0.938rem', fontWeight: 700, py: 0.5 }}>
                                            {dayjs(clickedEvent.ends_on || clickedEvent.starts_on).format('D')}
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        {dayjs(clickedEvent.ends_on || clickedEvent.starts_on).format('MMM D, YYYY h:mm A')}
                                    </Typography>
                                </Stack>

                                {/* Duration */}
                                {showDuration && (
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ pl: 0.5 }}>
                                        <Iconify icon="solar:clock-circle-bold" sx={{ color: 'text.secondary', width: 24, height: 24, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {(() => {
                                                const start = dayjs(clickedEvent.starts_on);
                                                const end = dayjs(clickedEvent.ends_on || clickedEvent.starts_on);
                                                const diffMinutes = end.diff(start, 'minute');
                                                const hours = Math.floor(diffMinutes / 60);
                                                const minutes = diffMinutes % 60;
                                                let durationStr = '';
                                                if (hours > 0) {
                                                    durationStr += `${hours} hour${hours > 1 ? 's' : ''}`;
                                                }
                                                if (minutes > 0) {
                                                    if (durationStr) durationStr += ', ';
                                                    durationStr += `${minutes} minute${minutes > 1 ? 's' : ''}`;
                                                }
                                                return durationStr || '0 minutes';
                                            })()}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        );
                    })()}
                </Popover>
            </DashboardContent>
        </>
    );
}
