import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onEditRow: VoidFunction;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  index?: number;
};

export function SalaryStructureComponentTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  index,
}: Props) {
  const { component_name, field_name, type, percentage, static_amount } = row;

  const typeColor = (t: string) => {
    if (t === 'Earning') return 'success';
    if (t === 'Deduction') return 'error';
    return 'default';
  };

  return (
    <TableRow
      hover
      selected={selected}
      sx={{
        '& td, & th': {
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          py: 1.5,
        },
        '&:last-child td, &:last-child th': { borderBottom: 0 },
      }}
    >
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
              transition: (theme) =>
                theme.transitions.create(['all'], {
                  duration: theme.transitions.duration.shorter,
                }),
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
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {component_name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={typeColor(type) as any}
          sx={{ fontWeight: 700 }}
        >
          {type || '-'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {percentage != null && percentage > 0 ? `${percentage}%` : '-'}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {static_amount != null && static_amount > 0
            ? static_amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
            : '-'}
        </Typography>
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
