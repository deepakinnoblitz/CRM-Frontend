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
        attendanceDate: string;
        status: string;
        inTime?: string;
        out_time?: string;
        working_hours_display?: string;
        modified: string;
    };
    selected: boolean;
    onSelectRow: VoidFunction;
    onView: VoidFunction;
    onEdit: VoidFunction;
    onDelete: VoidFunction;
    canEdit?: boolean;
    canDelete?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function AttendanceTableRow({
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
}: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'success';
            case 'Absent': return 'error';
            case 'On Leave': return 'warning';
            case 'Holiday': return 'info';
            case 'Half Day': return 'warning';
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

            <TableCell>
                <Box>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                        {row.employeeName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.employee}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {dayjs(row.attendanceDate).format('DD-MM-YYYY')}
                </Typography>
            </TableCell>

            <TableCell>
                <Label color={getStatusColor(row.status)}>{row.status}</Label>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.inTime || '-'}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.out_time || '-'}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.working_hours_display || '-'}
                </Typography>
            </TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            fontSize: 12,
                            minWidth: 24,
                            textAlign: 'right',
                        }}
                    >
                        {fTimeDist(row.modified)}
                    </Typography>

                    <IconButton size="small" onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                    {canEdit && (
                        <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {canDelete && (
                        <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
