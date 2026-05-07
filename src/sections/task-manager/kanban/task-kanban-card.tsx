import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { getInitials } from 'src/utils/string';
import { stringToColor, stringToDarkColor } from 'src/utils/color-utils';

import type { TaskManager } from 'src/api/task-manager';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props {
    task: TaskManager;
    onUpdateStatus: (taskId: string, newStatus: string) => void;
    onViewDetails: (task: TaskManager) => void;
    onEditTask: (task: TaskManager) => void;
    onDeleteTask: (task: TaskManager) => void;
    permissions: { read: boolean; write: boolean; create: boolean; delete: boolean };
}

export default function TaskKanbanCard({
    task,
    onUpdateStatus,
    onViewDetails,
    onEditTask,
    onDeleteTask,
    permissions
}: Props) {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEditTask(task);
        handleCloseMenu();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteTask(task);
        handleCloseMenu();
    };

    const priorityColor =
        task.priority === 'High' ? 'error' :
            task.priority === 'Medium' ? 'warning' : 'info';
    const primaryAssignee = task.assignees?.[0];
    const primaryAssigneeLabel = primaryAssignee?.employee_name || primaryAssignee?.user || primaryAssignee?.employee || 'Unassigned';
    const extraAssignees = Math.max((task.assignees?.length || 0) - 1, 0);
    const taskNumber = task.name?.replace(/^TASK-?/, '') || task.name;
    const isHighPriority = task.priority === 'High';

    return (
        <Card
            onClick={() => onViewDetails(task)}
            sx={{
                p: 0,
                cursor: 'pointer',
                boxShadow: 'none',
                border: '1px solid #b8b8c0',
                borderRadius: 1,
                bgcolor: '#fff',
                color: '#6d6d80',
                overflow: 'hidden',
                transition: theme.transitions.create(['box-shadow', 'border-color'], {
                    duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                    boxShadow: '0 10px 24px rgba(20, 23, 42, 0.12)',
                    borderColor: '#8f90a0',
                },
            }}
        >
            <Box sx={{ p: 1.25, pb: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack direction="row" alignItems="center" spacing={0.55} sx={{ minWidth: 0 }}>
                        <Iconify
                            icon="solar:medal-star-bold"
                            width={25}
                            sx={{ color: isHighPriority ? '#f7c600' : '#77798c', flexShrink: 0 }}
                        />
                        <Typography
                            title={task.name}
                            sx={{
                                color: '#a4a5b1',
                                fontWeight: 800,
                                fontSize: 16,
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {taskNumber}
                        </Typography>
                    </Stack>

                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMenu(e);
                        }}
                        sx={{
                            width: 24,
                            height: 24,
                            color: '#8c8d9d',
                            flexShrink: 0,
                        }}
                    >
                        <Iconify icon="eva:more-vertical-fill" width={18} />
                    </IconButton>
                </Stack>

                <Typography
                    title={primaryAssigneeLabel}
                    sx={{
                        mt: 0.2,
                        color: '#737486',
                        fontWeight: 700,
                        fontSize: 16,
                        lineHeight: 1.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {primaryAssigneeLabel}
                    {extraAssignees > 0 ? ` +${extraAssignees}` : ''}
                </Typography>

                <Typography
                    title={task.title}
                    sx={{
                        mt: 0.55,
                        color: '#686879',
                        fontWeight: 900,
                        fontSize: 16,
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                    }}
                >
                    {task.title}
                </Typography>

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1.05 }}>
                    <Stack direction="row" alignItems="center" spacing={0.8} sx={{ minWidth: 0 }}>
                        <Avatar
                            alt={primaryAssigneeLabel}
                            src={primaryAssignee?.profile_pic}
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: primaryAssignee ? stringToColor(primaryAssigneeLabel) : '#ff5d8f',
                                color: primaryAssignee ? stringToDarkColor(primaryAssigneeLabel) : '#fff',
                                fontSize: 12,
                                fontWeight: 900,
                                border: '0',
                                flexShrink: 0,
                            }}
                        >
                            {getInitials(primaryAssigneeLabel)}
                        </Avatar>
                        <Box
                            sx={{
                                height: 26,
                                px: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: 0.75,
                                color: `${priorityColor}.main`,
                                bgcolor: varAlpha(theme.vars.palette[priorityColor].mainChannel, 0.08),
                                border: `1px solid ${varAlpha(theme.vars.palette[priorityColor].mainChannel, 0.14)}`,
                                fontSize: 11,
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                lineHeight: 1,
                            }}
                        >
                            {task.priority}
                        </Box>
                    </Stack>

                    <Typography
                        variant="body2"
                        sx={{
                            color: '#6f6f80',
                            fontWeight: 700,
                            fontSize: 17,
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {task.due_date ? fDate(task.due_date, 'MMM DD') : 'No date'}
                    </Typography>
                </Stack>
            </Box>

            {task.project && (
                <Box
                    sx={{
                        px: 1.25,
                        py: 0.75,
                        borderTop: '1px solid #eeeeef',
                        bgcolor: '#fbfbfc',
                    }}
                >
                    <Typography
                        title={task.project}
                        sx={{
                            color: '#8b8c99',
                            fontWeight: 700,
                            fontSize: 13,
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {task.project}
                    </Typography>
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                    paper: {
                        sx: { width: 160 }
                    }
                }}
            >
                {permissions.write && (
                    <MenuItem
                        onClick={handleEdit}
                        sx={{
                            gap: 1.5,
                            typography: 'body2',
                            fontWeight: 600,
                            color: 'primary.main',
                            '& svg': { color: 'inherit' }
                        }}
                    >
                        <Iconify icon="solar:pen-bold" width={18} />
                        Edit
                    </MenuItem>
                )}

                {permissions.delete && (
                    <MenuItem
                        onClick={handleDelete}
                        sx={{
                            gap: 1.5,
                            typography: 'body2',
                            fontWeight: 600,
                            color: 'error.main',
                            '& svg': { color: 'inherit' }
                        }}
                    >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        Delete
                    </MenuItem>
                )}

                {!permissions.write && !permissions.delete && (
                    <MenuItem disabled sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'center', py: 2 }}>
                        No Permissions
                    </MenuItem>
                )}
            </Menu>
        </Card>
    );
}
