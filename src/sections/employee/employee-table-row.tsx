
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        employeeId: string;
        name: string;
        department: string;
        designation: string;
        status: string;
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

export function EmployeeTableRow({
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

            <TableCell component="th" scope="row">
                <Box>
                    <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize', fontWeight: 700 }}>
                        {row.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {row.id}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.employeeId}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.department}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.designation}
                </Typography>
            </TableCell>

            <TableCell>
                <Label color={(row.status === 'Active' && 'success') || 'error'}>{row.status}</Label>
            </TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
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
