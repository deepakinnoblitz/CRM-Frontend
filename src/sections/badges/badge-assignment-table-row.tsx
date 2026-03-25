import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  index: number;
  onView: () => void;
  onDelete: () => void;
};

export function BadgeAssignmentTableRow({ row, index, onView, onDelete }: Props) {
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

      <TableCell>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {row.employee_name || 'Unknown'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.employee}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {(row['badge.icon'] || row.badge_icon || row.icon) && (
            <Box
              component="img"
              src={row['badge.icon'] || row.badge_icon || row.icon}
              sx={{ width: 32, height: 32, borderRadius: 0.5, objectFit: 'cover' }}
            />
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {row.badge}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{fDate(row.awarded_on, 'DD-MM-YYYY')}</TableCell>

      <TableCell>{row.awarded_by}</TableCell>

      <TableCell align="right">
        <IconButton onClick={onView} sx={{ color: 'primary.main' }}>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
