import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

type Props = {
    row: any;
    index: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export function EmployeeMonthlyAwardTableRow({ row, index, onView, onEdit, onDelete }: Props) {
    const {
        employee,
        employee_name,
        month,
        total_score,
        rank,
        published,
        is_auto_generated,
        manually_selected
    } = row;

    return (
        <TableRow
            hover
            sx={{
                '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                '&:last-child td, &:last-child th': { borderBottom: 0 },
            }}
        >
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
            
            <TableCell>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800 }}>
                    {employee_name || employee}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {employee}
                </Typography>
            </TableCell>

            <TableCell>
                {month ? fDate(month, 'MMMM YYYY').toUpperCase() : '-'}
            </TableCell>

            <TableCell align="center">
                <Typography variant="subtitle2">
                    {Number(total_score || 0).toFixed(2)}
                </Typography>
            </TableCell>

            <TableCell align="center">
                <Label
                    variant="soft"
                    color={rank === 1 ? 'success' : 'warning'}
                    sx={{ textTransform: 'capitalize' }}
                >
                    Rank {rank}
                </Label>
            </TableCell>

            <TableCell align="center">
                <Label color={manually_selected ? 'secondary' : 'info'}>
                    {manually_selected ? 'Manual' : 'Auto'}
                </Label>
            </TableCell>

            <TableCell align="center">
                <Label color={published ? 'success' : 'error'}>
                    {published ? 'Published' : 'Draft'}
                </Label>
            </TableCell>

            <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                    <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                </Stack>
            </TableCell>
        </TableRow>
    );
}
