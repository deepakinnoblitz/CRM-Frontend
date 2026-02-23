import dayjs from 'dayjs';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fTimeDist } from 'src/utils/format-time';

import { getLeaveWorkflowActions, type WorkflowAction } from 'src/api/leaves';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { ClarificationDialog } from '../report/requests/clarification-dialog';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        employee: string;
        employeeName: string;
        leaveType: string;
        fromDate: string;
        toDate: string;
        totalDays: number;
        reason: string;
        status: string;
        halfDay?: number | boolean;
        permissionHours?: number;
        modified?: string;
        hrQueryCount?: number;
        empReplyCount?: number;
    };
    selected: boolean;
    onSelectRow: VoidFunction;
    onView: VoidFunction;
    onDelete: VoidFunction;
    onApplyAction: (action: string) => void;
    onClarify: (message: string) => Promise<void>;
    canDelete?: boolean;
    isHR?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function LeavesTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onDelete,
    onApplyAction,
    onClarify,
    canDelete,
    isHR,
    hideCheckbox = false,
    index,
}: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending': return 'warning';
            case 'Clarification Requested': return 'warning';
            case 'Open': return 'info';
            default: return 'default';
        }
    };

    const [openMenu, setOpenMenu] = useState<HTMLElement | null>(null);

    const [openClarification, setOpenClarification] = useState(false);

    const [submittingClarification, setSubmittingClarification] = useState(false);

    const [actions, setActions] = useState<WorkflowAction[]>([]);

    const [loadingActions, setLoadingActions] = useState(false);

    const handleOpenMenu = async (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenu(event.currentTarget);
        try {
            setLoadingActions(true);
            const availableActions = await getLeaveWorkflowActions(row.status);
            setActions(availableActions);
        } catch (error) {
            console.error('Failed to fetch actions:', error);
        } finally {
            setLoadingActions(false);
        }
    };

    const handleCloseMenu = () => {
        setOpenMenu(null);
    };

    const filteredActions = actions.filter((action) => {
        const lowerAction = action.action.toLowerCase();
        const isClarification = lowerAction.includes('clarification') || lowerAction.includes('query');
        const isReply = lowerAction.includes('reply');

        const hrCount = row.hrQueryCount || 0;
        const empCount = row.empReplyCount || 0;

        if (isClarification && isHR && hrCount >= 5) return false;
        if (isReply && !isHR && empCount >= 5) return false;

        return true;
    });

    const handleAction = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('clarification') || lowerAction.includes('query') || lowerAction.includes('reply')) {
            setOpenClarification(true);
        } else {
            onApplyAction(action);
        }
        handleCloseMenu();
    };

    const getActionColor = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('approve')) return 'success.main';
        if (lower.includes('reject')) return 'error.main';
        if (lower.includes('clarification') || lower.includes('query')) return 'warning.main';
        if (lower.includes('reply')) return 'info.main';
        return 'primary.main';
    };

    const getActionIcon = (action: string): any => {
        const lower = action.toLowerCase();
        if (lower.includes('approve')) return 'solar:check-circle-bold';
        if (lower.includes('reject')) return 'mingcute:close-line';
        if (lower.includes('clarification') || lower.includes('query')) return 'solar:question-square-bold';
        if (lower.includes('reply')) return 'solar:chat-round-dots-bold';
        return 'solar:pen-bold';
    };

    const handleClarifyConfirm = async (message: string) => {
        try {
            setSubmittingClarification(true);
            await onClarify(message);
            setOpenClarification(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingClarification(false);
        }
    };

    const isPermission = row.leaveType.trim().toLowerCase() === 'permission';

    const showActions = isHR && (row.status === 'Pending' || row.status === 'Open' || row.status === 'Clarification Requested');

    return (
        <>
            <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
                {!hideCheckbox && (
                    <TableCell padding="checkbox">
                        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
                    </TableCell>
                )}

                {typeof index === 'number' && (
                    <TableCell align="center">
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                display: 'flex',
                                borderRadius: '50%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                typography: 'subtitle2',
                                fontWeight: 800,
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                                mx: 'auto',
                                transition: (theme) => theme.transitions.create(['all'], { duration: theme.transitions.duration.shorter }),
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            {index + 1}
                        </Box>
                    </TableCell>
                )}

                <TableCell>
                    <Box>
                        <Typography variant="subtitle2" noWrap>
                            {row.employeeName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {row.employee}
                        </Typography>
                    </Box>
                </TableCell>

                <TableCell>
                    <Typography variant="body2" noWrap>
                        {row.leaveType}
                    </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                    <Typography variant="body2" noWrap>
                        {dayjs(row.fromDate).format('DD-MM-YYYY')} to {dayjs(row.toDate).format('DD-MM-YYYY')}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    {!isPermission && (
                        <Typography variant="body2" noWrap>
                            {row.totalDays}
                            {row.halfDay === 1 && (
                                <Iconify icon={"solar:history-bold" as any} width={16} sx={{ ml: 0.5, color: 'info.main', verticalAlign: 'middle' }} />
                            )}
                        </Typography>
                    )}
                    {!!row.permissionHours && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {row.permissionHours} {isPermission ? 'mins' : 'hrs'} permission
                        </Typography>
                    )}
                </TableCell>

                {/* <TableCell>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {row.reason}
                </Typography>
            </TableCell> */}

                <TableCell>
                    <Label color={getStatusColor(row.status)}>{row.status}</Label>
                </TableCell>

                <TableCell align="right" sx={{ pr: 3, minWidth: 100 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 700, mr: 1, fontSize: 12 }}>
                            {row.modified ? fTimeDist(row.modified) : '-'}
                        </Box>
                        <IconButton size="small" onClick={onView} sx={{ color: 'info.main' }}>
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>

                        {showActions && (
                            <IconButton size="small" onClick={handleOpenMenu} sx={{ color: 'warning.main' }}>
                                <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                        )}
                    </Box>
                </TableCell>
            </TableRow>

            <Popover
                open={!!openMenu}
                anchorEl={openMenu}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { width: 180, p: 1 },
                }}
            >
                {loadingActions ? (
                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                        <Iconify icon={"svg-spinners:18-dots-indicator" as any} />
                    </Box>
                ) : (
                    <>
                        {filteredActions.map((action) => (
                            <MenuItem key={action.action} onClick={() => handleAction(action.action)} sx={{ color: getActionColor(action.action) }}>
                                <Iconify icon={getActionIcon(action.action)} sx={{ mr: 2 }} />
                                {action.action}
                            </MenuItem>
                        ))}
                        {actions.length === 0 && (
                            <Typography variant="caption" sx={{ p: 1, color: 'text.disabled', textAlign: 'center', display: 'block' }}>
                                No actions available
                            </Typography>
                        )}
                    </>
                )}
            </Popover>

            <ClarificationDialog
                open={openClarification}
                onClose={() => setOpenClarification(false)}
                onConfirm={handleClarifyConfirm}
                title="Ask Clarification"
                label="Query"
                loading={submittingClarification}
            />
        </>
    );
}

