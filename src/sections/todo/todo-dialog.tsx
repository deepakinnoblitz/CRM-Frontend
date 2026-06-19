import dayjs from 'dayjs';
import { IoMdTrash } from "react-icons/io";
import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, Grid, Alert, Button, Snackbar, IconButton, Typography } from '@mui/material';

import { type ToDo, createToDo, updateToDo, deleteToDo } from 'src/api/todo';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    selectedTodo?: ToDo | null;
    initialData?: Partial<ToDo>;
    onSuccess?: () => void;
};

const INITIAL_TODO_STATE: Partial<ToDo> = {
    description: '',
    status: 'Open',
    priority: 'Medium',
    date: dayjs().format('YYYY-MM-DD'),
};

export default function TodoDialog({ open, onClose, selectedTodo, initialData, onSuccess }: Props) {
    const [todoData, setTodoData] = useState<Partial<ToDo>>(INITIAL_TODO_STATE);
    const [formErrors, setFormErrors] = useState({ description: false });
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        setFormErrors({ description: false });
        if (selectedTodo) {
            setTodoData({
                description: selectedTodo.description,
                status: selectedTodo.status,
                priority: selectedTodo.priority,
                date: selectedTodo.date,
                allocated_to: selectedTodo.allocated_to,
            });
        } else if (initialData) {
            setTodoData({
                ...INITIAL_TODO_STATE,
                ...initialData,
            });
        } else {
            setTodoData(INITIAL_TODO_STATE);
        }
    }, [selectedTodo, initialData, open]);

    const handleSaveToDo = async () => {
        const errors = {
            description: !todoData.description?.trim(),
        };
        setFormErrors(errors);

        if (errors.description) {
            setSnackbar({
                open: true,
                message: 'Please fill in mandatory fields: Task Description',
                severity: 'error'
            });
            return;
        }

        try {
            if (selectedTodo) {
                await updateToDo(selectedTodo.name, todoData);
            } else {
                await createToDo(todoData);
            }
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Failed to save todo:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to save todo', severity: 'error' });
        }
    };

    const handleDeleteToDo = async () => {
        if (!selectedTodo) return;
        try {
            await deleteToDo(selectedTodo.name);
            setConfirmDelete(false);
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Failed to delete todo:', error);
            setSnackbar({ open: true, message: error.message || 'Failed to delete todo', severity: 'error' });
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2, boxShadow: (theme) => theme.customShadows.z24,}}}>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedTodo ? 'Edit Todo' : 'New Todo'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ borderBottom: 'none', px: 3, pb: 0 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {/* Description Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Task Description
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    required
                                    label="What needs to be done?"
                                    placeholder="Enter task details..."
                                    value={todoData.description}
                                    onChange={(e) => {
                                        setTodoData({ ...todoData, description: e.target.value });
                                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, description: false }));
                                    }}
                                    error={formErrors.description}
                                    helperText={formErrors.description ? 'Task description is required' : ''}
                                />
                            </Box>

                            {/* Status Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Priority & Status
                                </Typography>
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
                            </Box>

                            {/* Scheduling Section */}
                            <Box>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
                                    Due Date
                                </Typography>
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

                <DialogActions sx={{ p: 2.5, pt: 2, gap: 1.5 }}>
                    {selectedTodo && (
                        <Button
                            color="error"
                            variant="contained"
                            onClick={() => setConfirmDelete(true)}
                            startIcon={<IoMdTrash size={20} />}
                            sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: 'none', mr:'auto' }}
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleSaveToDo}
                        sx={{ borderRadius: 1, px: 3 }}
                    >
                        {selectedTodo ? 'Save Changes' : 'Create Task'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Confirm Delete"
                content="Are you sure you want to delete this todo?"
                action={
                    <Button variant="contained" color="error" onClick={handleDeleteToDo} sx={{ borderRadius: 1.5, minWidth: 100 }}>
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
        </>
    );
}
