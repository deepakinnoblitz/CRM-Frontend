import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

type Props = {
  row: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};

export function BadgeTableRow({ row, index, onEdit, onDelete, onView }: Props) {
  return (
    <TableRow hover>
      <TableCell align="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: (theme) => alpha('#00A5D1', 0.1),
            color: '#00A5D1',
            fontWeight: 600,
            mx: 'auto',
          }}
        >
          {index + 1}
        </Box>
      </TableCell>
      
      <TableCell align="center">
        {row.icon ? (
          <Box
            component="img"
            src={row.icon}
            sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
          />
        ) : (
          <Iconify icon="solar:medal-star-bold" width={48} sx={{ color: 'text.disabled' }} />
        )}
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
          {row.badge_name}
        </Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={(row.badge_type === 'Achievement' && 'success') || (row.badge_type === 'Performance' && 'info') || 'warning'}>
          {row.badge_type}
        </Label>
      </TableCell>

      <TableCell align="right">
        <IconButton onClick={onView} sx={{ color: 'info.main' }}>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
