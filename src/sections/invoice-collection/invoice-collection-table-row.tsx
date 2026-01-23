import type { InvoiceCollection } from 'src/api/invoice-collection';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: InvoiceCollection;
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isLatest?: boolean;
};

export function InvoiceCollectionTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    isLatest = true,
}: Props) {
    return (
        <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
            </TableCell>

            <TableCell component="th" scope="row">
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    {row.name}
                </Box>
            </TableCell>

            <TableCell>{row.invoice}</TableCell>

            <TableCell>{row.customer_name || row.customer}</TableCell>

            <TableCell>{fDate(row.collection_date)}</TableCell>

            <TableCell>{row.mode_of_payment}</TableCell>

            <TableCell align="right">{fCurrency(row.amount_collected)}</TableCell>

            <TableCell align="right">{fCurrency(row.amount_pending || 0)}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                    {isLatest && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {isLatest && (
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
