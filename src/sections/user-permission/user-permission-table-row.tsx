import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: any;
    selected: boolean;
    onSelectRow: () => void;
    onEditRow: () => void;
    onDeleteRow: () => void;
    index: number;
};

export function UserPermissionTableRow({
    row,
    selected,
    onSelectRow,
    onEditRow,
    onDeleteRow,
    index,
}: Props) {
    return (
        <TableRow hover selected={selected}>
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
            <TableCell>{row.user}</TableCell>
            <TableCell>{row.allow}</TableCell>
            <TableCell>{row.for_value}</TableCell>
            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton size="small" onClick={onEditRow} sx={{ color: 'primary.main' }}>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton size="small" onClick={onDeleteRow} sx={{ color: 'error.main' }}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
}
