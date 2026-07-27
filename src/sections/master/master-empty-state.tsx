import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { EmptyContent } from 'src/components/empty-content';

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
  icon = 'solar:bill-check-bold-duotone',
}: MasterEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <EmptyContent
          title={`No ${masterName} Found`}
          description={subtitle}
          icon={icon}
        />
      </TableCell>
    </TableRow>
  );
}
