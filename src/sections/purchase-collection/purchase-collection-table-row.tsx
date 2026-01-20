import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { PurchaseCollection } from 'src/api/purchase-collection';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: PurchaseCollection;
    selected: boolean;
    onSelectRow: () => void;
    onViewRow: () => void;
    onEditRow: () => void;
    onDeleteRow: () => void;
    isLatest?: boolean;
};

export default function PurchaseCollectionTableRow({
    row,
    selected,
    onSelectRow,
    onViewRow,
    onEditRow,
    onDeleteRow,
    isLatest = true,
}: Props) {
    const { name, purchase, vendor_name, collection_date, amount_collected, amount_pending, mode_of_payment } = row;

    return (
        <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
            <TableCell padding="checkbox">
                <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
            </TableCell>

            <TableCell component="th" scope="row">
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    {name}
                </Box>
            </TableCell>

            <TableCell>{purchase}</TableCell>

            <TableCell>{vendor_name}</TableCell>

            <TableCell>{fDate(collection_date)}</TableCell>

            <TableCell>{mode_of_payment}</TableCell>

            <TableCell align="right">{fCurrency(amount_collected)}</TableCell>

            <TableCell align="right">{fCurrency(amount_pending || 0)}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={onViewRow} sx={{ color: 'info.main' }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                    {isLatest && (
                        <IconButton onClick={onEditRow} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {isLatest && (
                        <IconButton onClick={onDeleteRow} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}

