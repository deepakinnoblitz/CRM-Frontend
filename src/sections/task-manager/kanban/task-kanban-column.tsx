import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TaskManager } from 'src/api/task-manager';

import TaskKanbanCard from './task-kanban-card';

// ----------------------------------------------------------------------

interface Props {
    status: string;
    tasks: TaskManager[];
    total: number;
    onUpdateStatus: (taskId: string, newStatus: string) => void;
    onViewDetails: (task: TaskManager) => void;
    onEditTask: (task: TaskManager) => void;
    onDeleteTask: (task: TaskManager) => void;
    permissions: { read: boolean; write: boolean; create: boolean; delete: boolean };
}

export default function TaskKanbanColumn({ 
    status, 
    tasks, 
    total,
    onUpdateStatus,
    onViewDetails,
    onEditTask,
    onDeleteTask,
    permissions
}: Props) {
    return (
        <Paper
            sx={{
                width: 314,
                display: 'flex',
                boxShadow: 'none',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: 0.75,
                flexShrink: 0,
                border: '1px solid #e2e2e6',
                overflow: 'hidden',
                // Match board height minus board padding (6px top + 12px bottom) and board border (2px)
                height: { xs: 'calc(100vh - 300px)', md: 'calc(100vh - 268px)' },
            }}
        >
            {/* ── Column Header ── */}
            <Box 
                sx={{ 
                    height: 78,
                    minHeight: 78,
                    px: 1.5,
                    py: 1.4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    bgcolor: '#242746',
                    color: '#f6f7fb',
                    flexShrink: 0,
                }} 
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: 18 }}>
                    {status}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.7, color: '#b9bccb', fontWeight: 700, fontSize: 15 }}>
                    {tasks.length} of {total} Tasks
                </Typography>
            </Box>

            {/* ── Scrollable Card Area ── */}
            <Box
                component="div"
                sx={{
                    px: 0.7,
                    py: 1,
                    overflowY: 'scroll',
                    // Explicit max: column height - header(78px) - column border(2px)
                    maxHeight: { xs: 'calc(100vh - 380px)', md: 'calc(100vh - 348px)' },
                    '&::-webkit-scrollbar': {
                        width: 8,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#8c8c8c',
                        borderRadius: 0,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#eeeeef',
                    },
                }}
            >
                <Stack spacing={0.8}>
                    {tasks.length === 0 ? (
                        <Stack 
                            alignItems="center" 
                            justifyContent="center" 
                            sx={{ 
                                py: 8,
                                borderRadius: 0.75,
                                border: '1px dashed #d9d9df',
                                bgcolor: '#fafafa',
                            }}
                        >
                            <Stack spacing={1} alignItems="center">
                                <Typography variant="caption" sx={{ color: '#9a9ba8', fontWeight: 700 }}>
                                    No {status}
                                </Typography>
                            </Stack>
                        </Stack>
                    ) : (
                        tasks.map((task) => (
                            <TaskKanbanCard 
                                key={task.name} 
                                task={task} 
                                onUpdateStatus={onUpdateStatus} 
                                onViewDetails={onViewDetails}
                                onEditTask={onEditTask}
                                onDeleteTask={onDeleteTask}
                                permissions={permissions}
                            />
                        ))
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}

