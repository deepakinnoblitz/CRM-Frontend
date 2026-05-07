import { useRef, useMemo } from 'react';

import type { TaskManager } from 'src/api/task-manager';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import TaskKanbanColumn from './task-kanban-column';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['Open', 'In Progress', 'On Hold', 'Completed', 'Reopened'];

interface Props {
    tasks: TaskManager[];
    onUpdateStatus: (taskId: string, newStatus: string) => void;
    onViewDetails: (task: TaskManager) => void;
    onEditTask: (task: TaskManager) => void;
    onDeleteTask: (task: TaskManager) => void;
    loading: boolean;
    permissions: { read: boolean; write: boolean; create: boolean; delete: boolean };
}

export default function TaskKanbanBoard({ 
    tasks, 
    onUpdateStatus, 
    onViewDetails,
    onEditTask,
    onDeleteTask,
    loading,
    permissions
}: Props) {
    const boardRef = useRef<HTMLDivElement>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const totalByStatus = useMemo(
        () => STATUS_OPTIONS.reduce<Record<string, number>>((acc, status) => {
            acc[status] = tasks.filter((task) => task.status === status).length;
            return acc;
        }, {}),
        [tasks]
    );

    const handleMouseDown = (e: React.MouseEvent) => {
        isDown.current = true;
        startX.current = e.pageX - (boardRef.current?.offsetLeft || 0);
        scrollLeft.current = boardRef.current?.scrollLeft || 0;
    };

    const handleMouseLeave = () => {
        isDown.current = false;
    };

    const handleMouseUp = () => {
        isDown.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current) return;
        e.preventDefault();
        const x = e.pageX - (boardRef.current?.offsetLeft || 0);
        const walk = (x - startX.current) * 2; // scroll-fast
        if (boardRef.current) {
            boardRef.current.scrollLeft = scrollLeft.current - walk;
        }
    };

    if (loading) {
        return (
            <Stack direction="row" spacing={0.75} sx={{ height: 1, overflow: 'hidden' }}>
                {[...Array(5)].map((_, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 314,
                            height: '70vh',
                            borderRadius: 0.75,
                            backgroundColor: '#f7f7f8',
                            flexShrink: 0,
                        }}
                    />
                ))}
            </Stack>
        );
    }

    return (
        <Box
            ref={boardRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            sx={{
                flexGrow: 1,
                display: 'flex',
                gap: 0.75,
                pb: 1.5,
                overflowX: 'auto',
                overflowY: 'hidden',
                minHeight: { xs: 'calc(100vh - 280px)', md: 'calc(100vh - 248px)' },
                height: { xs: 'calc(100vh - 280px)', md: 'calc(100vh - 248px)' },
                bgcolor: '#ececef',
                p: 0.75,
                border: '1px solid #d8d8dd',
                borderRadius: 0.75,
                cursor: 'grab',
                userSelect: 'none',
                '&:active': { cursor: 'grabbing' },
                '&::-webkit-scrollbar': {
                    height: 14,
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#8c8c8c',
                    borderRadius: 0,
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#d5d5d8',
                },
            }}
        >
            {STATUS_OPTIONS.map((status) => (
                <TaskKanbanColumn
                    key={status}
                    status={status}
                    tasks={tasks.filter((task) => task.status === status)}
                    total={totalByStatus[status] || 0}
                    onUpdateStatus={onUpdateStatus}
                    onViewDetails={onViewDetails}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    permissions={permissions}
                />
            ))}
        </Box>
    );
}
