import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { TaxType } from 'src/api/masters';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: TaxType;
  index: number;
  onEditRow: VoidFunction;
  onDeleteRow: VoidFunction;
};

export function TaxTypesTableRow({ row, index, onEditRow, onDeleteRow }: Props) {
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
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '14px',
            color: 'text.primary',
          }}
        >
          {row.tax_name}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {row.tax_percentage}%
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {row.tax_type}
        </Typography>
      </TableCell>

      <TableCell>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '12px',
            fontWeight: 700,
            bgcolor: (theme) =>
              row.status === 'Active'
                ? alpha(theme.palette.success.main, 0.08)
                : alpha(theme.palette.error.main, 0.08),
            color: (theme) =>
              row.status === 'Active' ? theme.palette.success.main : theme.palette.error.main,
          }}
        >
          {row.status}
        </Box>
      </TableCell>

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
