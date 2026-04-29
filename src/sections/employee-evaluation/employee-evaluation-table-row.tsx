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

// ----------------------------------------------------------------------

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  index: number;
};

export function EmployeeEvaluationEventTableRow({
  row,
  selected,
  onSelectRow,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onCancel,
  index,
}: Props) {
  const { name, employee, employee_name, trait, evaluation_type, score_change, evaluation_date, hr_user, docstatus } = row;

  return (
    <TableRow
      hover
      selected={selected}
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
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {employee_name || 'Unknown'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {employee}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{trait}</TableCell>
      <TableCell>
        <Label
          variant="soft"
          color={
            (evaluation_type === 'Excellent' && 'success') ||
            (evaluation_type === 'Good' && 'info') ||
            (evaluation_type === 'Average' && 'warning') ||
            (evaluation_type === 'Bad' && 'error') ||
            'default'
          }
        >
          {evaluation_type}
        </Label>
      </TableCell>
      <TableCell>{score_change > 0 ? `+${score_change}` : score_change}</TableCell>
      <TableCell>{fDate(evaluation_date, 'DD-MM-YYYY')}</TableCell>
      <TableCell>
        <Label variant="soft" color={(docstatus === 1 && 'success') || (docstatus === 2 && 'error') || 'warning'}>
          {docstatus === 0 ? 'Draft' : docstatus === 1 ? 'Submitted' : 'Cancelled'}
        </Label>
      </TableCell>
      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {docstatus === 0 && (
            <>
              <IconButton size="small" onClick={onSubmit} sx={{ color: 'success.main' }}>
                <Iconify icon="solar:check-circle-bold" />
              </IconButton>
              <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </>
          )}
          {docstatus === 1 && (
            <IconButton size="small" onClick={onCancel} sx={{ color: 'error.main' }}>
              <Iconify icon="solar:close-circle-bold" />
            </IconButton>
          )}
          <IconButton size="small" onClick={onView} sx={{ color: 'info.main' }}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
