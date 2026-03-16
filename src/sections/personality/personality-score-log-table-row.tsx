import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';
// ----------------------------------------------------------------------

type Props = {
  row: any;
  index: number;
};

export function PersonalityScoreLogTableRow({
  row,
  index,
}: Props) {
  const { employee, employee_name, previous_score, change, new_score, reason, date } = row;

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
            {employee_name || 'Unknown'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {employee}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>{previous_score}</TableCell>
      <TableCell sx={{ color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary' }}>
        {change > 0 ? `+${change}` : change}
      </TableCell>
      <TableCell sx={{ fontWeight: 'bold' }}>{new_score}</TableCell>
      <TableCell>{reason}</TableCell>
      <TableCell>{fDate(date, 'DD-MM-YYYY')}</TableCell>
    </TableRow>
  );
}
