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

export function EmployeeEvaluationTraitTableRow({
  row,
  index,
  onEdit,
  onDelete,
}: Props) {
  const { trait_name, category, description } = row;

  return (
    <TableRow hover>
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
      <TableCell sx={{ fontWeight: 'bold' }}>{trait_name}</TableCell>
      <TableCell>{category || '-'}</TableCell>
      <TableCell sx={{ color: 'text.secondary', typography: 'body2' }}>{description || '-'}</TableCell>
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
