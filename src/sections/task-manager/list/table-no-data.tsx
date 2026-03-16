
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  searchQuery?: string;
};

export function TableNoData({ notFound, searchQuery }: Props) {
  if (!notFound) {
    return null;
  }

  return (
    <TableRow>
      <TableCell colSpan={12}>
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Iconify
            icon="solar:clipboard-list-bold-duotone"
            width={64}
            sx={{ color: 'text.disabled', mb: 2, opacity: 0.48 }}
          />
          
          <Typography variant="h6" sx={{ mb: 1, color: 'text.disabled' }}>
            No tasks found
          </Typography>

          {searchQuery && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No results found for &nbsp;
              <strong>&quot;{searchQuery}&quot;</strong>.
              <br /> Try checking for typos or using complete words.
            </Typography>
          )}

          {!searchQuery && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No tasks match your active filters.
            </Typography>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
}
