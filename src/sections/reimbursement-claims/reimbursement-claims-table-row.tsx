import type { MouseEvent } from 'react';

import Box from '@mui/material/Box';
import { Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        employee_name: string;
        claim_type: string;
        date_of_expense: string;
        amount: number;
        paid: number;
        workflow_state?: string;
    };
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onWorkflowAction?: (action: string) => void;
    canEdit: boolean;
    canDelete: boolean;
    isHR?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};
export function ReimbursementClaimTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    onWorkflowAction,
    canEdit,
    canDelete,
    isHR,
    hideCheckbox = false,
    index,
}: Props) {
    const handleClick = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
        event.stopPropagation();
        action();
    };

    return (
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

            <TableCell>{row.employee_name}</TableCell>

            <TableCell>{row.claim_type}</TableCell>

            <TableCell>{new Date(row.date_of_expense).toLocaleDateString()}</TableCell>

            <TableCell>₹{row.amount?.toLocaleString() || 0}</TableCell>

            <TableCell>
                <Label
                    variant="soft"
                    color={
                        (row.workflow_state === 'Approved' && 'success') ||
                        (row.workflow_state === 'Paid' && 'success') ||
                        (row.workflow_state === 'Rejected' && 'error') ||
                        (row.workflow_state === 'Pending' && 'warning') ||
                        'default'
                    }
                >
                    {row.workflow_state || (row.paid === 1 ? 'Paid' : 'Pending')}
                </Label>
            </TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <IconButton onClick={(e) => handleClick(e, onView)} color="info">
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>

                    {isHR && row.workflow_state === 'Pending' && (
                        <>
                            <Tooltip title="Approve">
                                <IconButton onClick={(e) => handleClick(e, () => onWorkflowAction?.('Approve'))} color="success">
                                    <Iconify icon="solar:check-circle-bold" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                                <IconButton onClick={(e) => handleClick(e, () => onWorkflowAction?.('Reject'))} color="error">
                                    <Iconify icon="mingcute:close-line" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}

                    {isHR && row.workflow_state === 'Approved' && (
                        <Tooltip title="Mark as Paid">
                            <IconButton onClick={(e) => handleClick(e, () => onWorkflowAction?.('Mark as Paid'))} color="primary">
                                <Iconify icon="solar:hand-money-bold-duotone" />
                            </IconButton>
                        </Tooltip>
                    )}

                    {canEdit && row.workflow_state === 'Draft' && (
                        <IconButton onClick={(e) => handleClick(e, onEdit)} color="primary">
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}

                    {canDelete && (
                        <IconButton onClick={(e) => handleClick(e, onDelete)} color="error">
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
