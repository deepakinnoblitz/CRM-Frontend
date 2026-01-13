import dayjs from 'dayjs';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect, useCallback } from 'react';
import interactionPlugin from '@fullcalendar/interaction';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Card, Grid, Alert, Button, Snackbar, IconButton, Typography } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';
import { type ToDo, fetchToDos, updateToDo, deleteToDo, createToDo } from 'src/api/todo';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

const INITIAL_TODO_STATE: Partial<ToDo> = {
    description: '',
    status: 'Open',
    priority: 'Medium',
    date: dayjs().format('YYYY-MM-DD'),
};

export function ToDoView() {
    const theme = useTheme();
    const [todos, setTodos] = useState<ToDo[]>([]);
    const [selectedTodo, setSelectedTodo] = useState<ToDo | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [todoData, setTodoData] = useState<Partial<ToDo>>(INITIAL_TODO_STATE);
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
            setTodoData({
                description: todo.description,
                status: todo.status,
                priority: todo.priority,
                date: todo.date,
                allocated_to: todo.allocated_to,
            });
            setOpenDialog(true);
        }
    };

    const handleNewToDo = () => {
        setSelectedTodo(null);
        setTodoData({
            ...INITIAL_TODO_STATE,
            date: dayjs().format('YYYY-MM-DD'),
        });
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
            setSnackbar({ open: true, message: error.message || 'Failed to update todo position', severity: 'error' });
            info.revert();
        }
    };

    const handleSaveToDo = async () => {
        try {
            if (selectedTodo) {
                await updateToDo(selectedTodo.name, todoData);
            } else {
                await createToDo(todoData);
            }
            setOpenDialog(false);
            loadToDos();
            setSnackbar({ open: true, message: selectedTodo ? 'ToDo updated successfully' : 'ToDo created successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Failed to save todo:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save todo', severity: 'error' });
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
            setSnackbar({ open: true, message: error.message || 'Failed to delete todo', severity: 'error' });
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
                            setTodoData({
                                ...INITIAL_TODO_STATE,
                                date: info.startStr,
                            });
                            setOpenDialog(true);
                        }}
                        height="auto"
                        eventDisplay="block"
                    />
                </Box>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedTodo ? 'Edit Task' : 'New Task'}
                    <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Iconify icon="solar:pen-bold" sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle2">Task Description</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="What needs to be done?"
                                    value={todoData.description}
                                    onChange={(e) => setTodoData({ ...todoData, description: e.target.value })}
                                />
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={todoData.status}
                                            onChange={(e) => setTodoData({ ...todoData, status: e.target.value as any })}
                                        >
                                            <MenuItem value="Open">Open</MenuItem>
                                            <MenuItem value="Closed">Closed</MenuItem>
                                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Priority</InputLabel>
                                        <Select
                                            label="Priority"
                                            value={todoData.priority}
                                            onChange={(e) => setTodoData({ ...todoData, priority: e.target.value as any })}
                                        >
                                            <MenuItem value="High">High</MenuItem>
                                            <MenuItem value="Medium">Medium</MenuItem>
                                            <MenuItem value="Low">Low</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Iconify icon={"solar:calendar-bold" as any} sx={{ color: 'primary.main' }} />
                                    <Typography variant="subtitle2">Due Date</Typography>
                                </Box>
                                <DatePicker
                                    label="Due Date"
                                    value={todoData.date ? dayjs(todoData.date) : null}
                                    onChange={(newValue) => setTodoData({ ...todoData, date: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    {selectedTodo && (
                        <Button color="error" variant="outlined" onClick={() => setConfirmDelete({ open: true, id: selectedTodo.name })} sx={{ mr: 'auto' }}>
                            Delete
                        </Button>
                    )}
                    <Button color="inherit" variant="outlined" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveToDo}>{selectedTodo ? 'Save Changes' : 'Create Task'}</Button>
                </DialogActions>
            </Dialog>

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
