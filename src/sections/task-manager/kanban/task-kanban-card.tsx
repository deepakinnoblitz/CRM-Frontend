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
                p: 1.5,
                borderRadius: 4,
                bgcolor: "#fff",
                border: "1px solid #ececf2",
                boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                cursor: "pointer",
                transition: "all .25s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
                },
            }}
        >
            {/* Top */}
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
            >
                <Stack direction="row" spacing={0.8}>
                    {/* Priority */}
                    <Box
                        sx={{
                            px: 1.2,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.7,
                            borderRadius: 2,
                            bgcolor: "#fff7eb",
                            border: "1px solid #ffe1b2",
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#f6a623",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#f6a623",
                                textTransform: "capitalize",
                            }}
                        >
                            {task.priority}
                        </Typography>
                    </Box>

                    {/* Ticket */}
                    <Box
                        sx={{
                            px: 1.2,
                            height: 34,
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 2,
                            bgcolor: "#f7f7fa",
                            border: "1px solid #e7e8ee",
                            maxWidth: 130,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#4d5566",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            #{task.name}
                        </Typography>
                    </Box>
                </Stack>

                {/* Menu */}
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenu(e);
                    }}
                    sx={{
                        color: "#7f8798",
                        mt: -0.3,
                    }}
                >
                    <Iconify icon="eva:more-vertical-fill" width={18} />
                </IconButton>
            </Stack>

            {/* Title */}
            <Typography
                title={task.title}
                sx={{
                    mt: 2,
                    fontSize: 20,
                    lineHeight: 1.2,
                    fontWeight: 900,
                    color: "#0f172a",
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    minHeight: 48,
                }}
            >
                {task.title}
            </Typography>

            {/* Project */}
            {task.project && (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.2}
                // sx={{
                //     mt: 2,
                // }}
                >
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2,
                            bgcolor: "#f4f1ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6c63ff",
                            flexShrink: 0,
                        }}
                    >
                        <Iconify icon="solar:folder-bold" width={18} />
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#8b90a1",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Project:
                        <Box
                            component="span"
                            sx={{
                                ml: 0.5,
                                color: "#4c6fff",
                                fontWeight: 800,
                            }}
                        >
                            {task.project}
                        </Box>
                    </Typography>
                </Stack>
            )}

            {/* Bottom */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    mt: 2.2,
                }}
            >
                {/* Date */}
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2,
                            bgcolor: "#f4f1ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#4c6fff",
                            flexShrink: 0,
                        }}
                    >
                        <Iconify icon="solar:calendar-date-bold" width={18} />
                    </Box>

                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#111827",
                            lineHeight: 1.2,
                        }}
                    >
                        {task.due_date
                            ? fDate(task.due_date, "DD MMM YYYY")
                            : "No date"}
                    </Typography>
                </Stack>

                {/* Assignees */}
                <Stack direction="row" alignItems="center">
                    {task.assignees?.slice(0, 3).map((assignee, index) => (
                        <Avatar
                            key={index}
                            src={assignee.profile_pic}
                            sx={{
                                width: 32,
                                height: 32,
                                ml: index === 0 ? 0 : -0.8,
                                border: "2px solid #fff",
                                fontSize: 14,
                                fontWeight: 800,
                                bgcolor: stringToColor(
                                    assignee.full_name || assignee.name
                                ),
                                color: stringToDarkColor(
                                    assignee.full_name || assignee.name
                                ),
                            }}
                        >
                            {getInitials(
                                assignee.full_name || assignee.name
                            )}
                        </Avatar>
                    ))}

                    {extraAssignees > 0 && (
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                ml: -0.8,
                                border: "2px solid #fff",
                                bgcolor: "#ede9fe",
                                color: "#7c3aed",
                                fontWeight: 900,
                                fontSize: 14,
                            }}
                        >
                            +{extraAssignees}
                        </Avatar>
                    )}
                </Stack>
            </Stack>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} onClick={(e) => e.stopPropagation()} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: 160 } } }} > {permissions.write && (<MenuItem onClick={handleEdit} sx={{ gap: 1.5, typography: 'body2', fontWeight: 600, color: 'primary.main', '& svg': { color: 'inherit' } }} > <Iconify icon="solar:pen-bold" width={18} /> Edit </MenuItem>)} {permissions.delete && (<MenuItem onClick={handleDelete} sx={{ gap: 1.5, typography: 'body2', fontWeight: 600, color: 'error.main', '& svg': { color: 'inherit' } }} > <Iconify icon="solar:trash-bin-trash-bold" width={18} /> Delete </MenuItem>)} {!permissions.write && !permissions.delete && (<MenuItem disabled sx={{ typography: 'caption', color: 'text.disabled', textAlign: 'center', py: 2 }}> No Permissions </MenuItem>)} </Menu>
        </Card>
    );
}
