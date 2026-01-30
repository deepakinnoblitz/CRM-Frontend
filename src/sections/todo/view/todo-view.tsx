import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { Box, Card, Alert, Button, Snackbar } from '@mui/material';

import { getFriendlyErrorMessage } from 'src/utils/error-handler';

import { DashboardContent } from 'src/layouts/dashboard';
import { type ToDo, fetchToDos, updateToDo, deleteToDo } from 'src/api/todo';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import TodoDialog from '../todo-dialog';

// ----------------------------------------------------------------------

export function ToDoView() {
    const theme = useTheme();
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [selectedTodo, setSelectedTodo] = useState<ToDo | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const loadToDos = useCallback(async (start?: Date, end?: Date) => {
        try {
            const startStr = start?.toISOString().split('T')[0];
            const endStr = end?.toISOString().split('T')[0];
            const data = await fetchToDos(startStr, endStr);
            setTodos(data);
        } catch (error) {
            console.error('Failed to load todos:', error);
        }
    }, []);

    useEffect(() => {
        loadToDos();
    }, [loadToDos]);

    const handleDatesSet = (arg: any) => {
        loadToDos(arg.start, arg.end);
    };

    const handleEventClick = (info: any) => {
        const todoId = info.event.id;
        const todo = todos.find(t => t.name === todoId);
        if (todo) {
            setSelectedTodo(todo);
            setOpenDialog(true);
        }
    };

    const handleNewToDo = () => {
        setSelectedTodo(null);
        setOpenDialog(true);
    };

    const handleEventDrop = async (info: any) => {
        const { event } = info;
        try {
            await updateToDo(event.id, {
                date: event.start.toISOString().split('T')[0]
            });
            loadToDos();
        } catch (error: any) {
            console.error('Failed to update todo position:', error);
            const friendlyMsg = getFriendlyErrorMessage(error);
            setSnackbar({ open: true, message: friendlyMsg, severity: 'error' });
            info.revert();
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedTodo) return;
        try {
            await deleteToDo(selectedTodo.name);
            setOpenDialog(false);
            setConfirmDelete({ open: false, id: null });
            loadToDos();
            setSnackbar({ open: true, message: 'ToDo deleted successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Failed to delete todo:', error);
            const friendlyMsg = getFriendlyErrorMessage(error);
            setSnackbar({ open: true, message: friendlyMsg, severity: 'error' });
        }
    };

    const calendarEvents = todos.map(todo => ({
        id: todo.name,
        title: todo.description || 'Untitled Task',
        start: todo.date,
        allDay: true,
        color: todo.color || (todo.status === 'Closed' ? theme.palette.success.main : todo.priority === 'High' ? theme.palette.error.main : theme.palette.primary.main),
    }));

    return (
        <DashboardContent>
            <Card
                sx={{
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <CardHeader
                    title="ToDo Calendar"
                    subheader="Manage your tasks and to-dos"
                    action={
                        <Button variant="contained" onClick={handleNewToDo} startIcon={<Iconify icon="mingcute:add-line" />}>
                            New Task
                        </Button>
                    }
                    sx={{ mb: 1 }}
                />

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
                        '& .fc .fc-toolbar': {
                            mb: 3,
                            gap: 1.5,
                            flexDirection: { xs: 'column', md: 'row' },
                            '& .fc-toolbar-title': {
                                fontSize: '1.25rem',
                                fontWeight: 700,
                            },
                        },
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
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            },
                        },
                        '& .fc .fc-col-header-cell': {
                            py: 1.5,
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.common.white,
                            '& .fc-col-header-cell-cushion': {
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                            },
                        },
                        '& .fc-view-harness': {
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
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
                        select={(info) => {
                            setSelectedTodo(null);
                            setOpenDialog(true);
                        }}
                        height="auto"
                        eventDisplay="block"
                    />
                </Box>
            </Card>

            <TodoDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                selectedTodo={selectedTodo}
                onSuccess={loadToDos}
            />

            <ConfirmDialog
                open={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                title="Confirm Delete"
                content="Are you sure you want to delete this task?"
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
        </DashboardContent>
    );
}
