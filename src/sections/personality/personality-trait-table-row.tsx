import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function PersonalityTraitTableRow({
  row,
  index,
  onEdit,
  onDelete,
}: Props) {
  const { trait_name, category, reward_score, penalty_score } = row;

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
      <TableCell sx={{ fontWeight: 'bold' }}>{trait_name}</TableCell>
      <TableCell>{category || '-'}</TableCell>
      <TableCell sx={{ color: 'success.main' }}>+{reward_score}</TableCell>
      <TableCell sx={{ color: 'error.main' }}>-{penalty_score}</TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
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
