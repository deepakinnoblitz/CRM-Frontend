import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface MasterEmptyStateProps {
  masterName: string;
  colSpan?: number;
  subtitle?: string;
  icon?: string;
}

export function MasterEmptyState({
  masterName,
  colSpan = 5,
  subtitle = 'Created records will appear here.',
  icon = 'solar:folder-error-bold-duotone'
}: MasterEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 10, border: 'none' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            mx: 'auto',
          }}
        >
          <Iconify
            icon={icon as any}
            sx={{
              width: 72,
              height: 72,
              color: 'text.disabled',
              mb: 2,
              opacity: 0.6,
            }}
          />

          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'fontWeightSemiBold' }}>
            No {masterName} Found
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
