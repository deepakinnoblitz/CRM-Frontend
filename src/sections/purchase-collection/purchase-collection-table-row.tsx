import type { PurchaseCollection } from 'src/api/purchase-collection';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

const renderCurrency = (amount: any, symbolFontSize: string = '15px') => {
  const formatted = fCurrency(amount);
  if (!formatted) return '—';
  const index = formatted.indexOf('₹');
  if (index !== -1) {
    return (
      <>
        {formatted.substring(0, index)}
        <span style={{ fontFamily: 'Arial', fontSize: symbolFontSize, display: 'inline-block', verticalAlign: 'baseline', lineHeight: 'normal' }}>₹</span>{' '}
        {formatted.substring(index + 1)}
      </>
    );
  }
  return formatted;
};

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
    hideCheckbox?: boolean;
    index?: number;
};

export default function PurchaseCollectionTableRow({
    row,
    selected,
    onSelectRow,
    onViewRow,
    onEditRow,
    onDeleteRow,
    isLatest = true,
    hideCheckbox = false,
    index,
}: Props) {
    const { name, purchase, amount_to_pay, collection_date, amount_collected, amount_pending, mode_of_payment } = row;

    return (
        <TableRow
            hover
            tabIndex={-1}
            role="checkbox"
            selected={selected}
            sx={{
                '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                '&:last-child td, &:last-child th': { borderBottom: 0 },
            }}
        >
            {!hideCheckbox && (
                <TableCell padding="checkbox">
                    <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
                </TableCell>
            )}

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
            )}

            <TableCell component="th" scope="row">
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                    {name}
                </Box>
            </TableCell>

            <TableCell align="left" sx={{ fontWeight: 500 }}>{purchase}</TableCell>

            <TableCell align="left" sx={{ fontWeight: 500 }}>{fDate(collection_date)}</TableCell>

            <TableCell align="left" sx={{ fontWeight: 500 }}>{mode_of_payment}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 600 }}>{renderCurrency(amount_to_pay, '16px')}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{renderCurrency(amount_collected, '16px')}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{renderCurrency(amount_pending || 0, '16px')}</TableCell>

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

