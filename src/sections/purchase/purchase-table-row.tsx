import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type PurchaseProps = {
    id: string;
    name: string;
    bill_no: string;
    vendor: string;
    vendor_name: string;
    bill_date: string;
    payment_type: string;
    grand_total: number;
    paid_amount: number;
    balance_amount?: number;
};

type PurchaseTableRowProps = {
    row: PurchaseProps;
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPrint?: () => void;
    onPreview?: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

const renderCurrency = (amount: any, symbolFontSize: string = '16px') => {
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

export function PurchaseTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    onPrint,
    onPreview,
    canEdit = true,
    canDelete = true,
    hideCheckbox = false,
    index,
}: PurchaseTableRowProps) {
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

            <TableCell align="left" sx={{ fontWeight: 700 }}>{row.name}</TableCell>

            <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                {row.bill_no}
            </TableCell>

            <TableCell align="left" sx={{ maxWidth: 240 }}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {row.vendor_name || row.vendor}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                        {row.vendor}
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell align="left" sx={{ fontWeight: 400 }}>{fDate(row.bill_date)}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 600 }}>{renderCurrency(row.grand_total)}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{renderCurrency(row.paid_amount)}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{renderCurrency(row.balance_amount ?? (row.grand_total - row.paid_amount))}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {onPrint && (
                        <IconButton onClick={onPrint} sx={{ color: 'warning.main' }}>
                            <Iconify icon={"solar:printer-bold" as any} />
                        </IconButton>
                    )}
                    {onPreview && (
                        <IconButton onClick={onPreview} sx={{ color: 'secondary.main' }}>
                            <Iconify icon={"solar:file-text-bold" as any} />
                        </IconButton>
                    )}
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon={"solar:eye-bold" as any} />
                    </IconButton>
                    {canEdit && row.paid_amount === 0 && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {canDelete && row.paid_amount === 0 && (
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}