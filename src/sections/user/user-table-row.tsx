import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  name: string;
  [key: string]: any;
};

type UserTableRowProps = {
  row: any;
  selected: boolean;
  onSelectRow: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
};

export function UserTableRow({
  row,
  selected,
  onSelectRow,
  onView,
  onEdit,
  onDelete,
  index,
}: UserTableRowProps) {
  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
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
      <TableCell component="th" scope="row">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar alt={row.full_name} src={row.user_image} />
          <Typography variant="subtitle2" noWrap>
            {row.full_name}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>{row.email}</TableCell>

      <TableCell>
        <Label color={row.enabled ? 'success' : 'error'}>
          {row.enabled ? 'Enabled' : 'Disabled'}
        </Label>
      </TableCell>

      <TableCell>{row.user_type}</TableCell>

      <TableCell>
        <Label color={row.has_permission ? 'success' : 'default'}>
          {row.has_permission ? 'Added' : 'Not Added'}
        </Label>
      </TableCell>

      <TableCell>{row.creation ? new Date(row.creation).toLocaleDateString() : '-'}</TableCell>

      <TableCell align="right">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <IconButton size="small" onClick={onView} sx={{ color: 'info.main' }}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}
