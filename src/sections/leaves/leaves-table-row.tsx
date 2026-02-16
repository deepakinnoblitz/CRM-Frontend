import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fTimeDist } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

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
    };
    selected: boolean;
    onSelectRow: VoidFunction;
    onView: VoidFunction;
    onDelete: VoidFunction;
    canDelete?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function LeavesTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onDelete,
    canDelete,
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

    const isPermission = row.leaveType.trim().toLowerCase() === 'permission';

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
                </Box>
            </TableCell>
        </TableRow>
    );
}
