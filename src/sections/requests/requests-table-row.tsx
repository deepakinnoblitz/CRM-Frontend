import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fTimeDist } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type RequestTableRowProps = {
    row: {
        id: string;
        employee_name: string;
        subject: string;
        workflow_state?: string;
        creation?: string;
        modified?: string;
    };
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
    canDelete: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function RequestTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    hideCheckbox = false,
    index,
}: RequestTableRowProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending':
            case 'Clarification Requested': return 'warning';
            case 'Open': return 'info';
            default: return 'default';
        }
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

            <TableCell>{row.employee_name || '-'}</TableCell>

            <TableCell>{row.subject || '-'}</TableCell>

            <TableCell>
                <Label color={getStatusColor(row.workflow_state || '')}>
                    {row.workflow_state || 'Open'}
                </Label>
            </TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Box sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 700, mr: 2, fontSize: 12 }}>
                        {row.modified ? fTimeDist(row.modified) : '-'}
                    </Box>
                    <IconButton size="small" color="primary" onClick={onView}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
}
