import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
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

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export type InvoiceProps = {
    id: string;
    ref_no: string;
    client_name: string;
    customer_name: string;
    billing_name?: string;
    billing_account_name: string;
    invoice_date: string;
    grand_total: number;
    received_amount: number;
    balance_amount: number;
};

type InvoiceTableRowProps = {
    row: InvoiceProps;
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPrint: () => void;
    onPreview: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function InvoiceTableRow({
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
}: InvoiceTableRowProps) {
    const { user } = useAuth();
    const hasCustomPerms = user?.permissions?.custom_permissions_assigned && user?.permissions?.actions?.invoice;
    const displayEdit = hasCustomPerms ? !!user?.permissions?.actions?.invoice?.edit : canEdit;
    const displayDelete = hasCustomPerms ? !!user?.permissions?.actions?.invoice?.delete : canDelete;
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

            <TableCell component="th" scope="row" sx={{ fontWeight: 700 }}>
                {row.ref_no}
            </TableCell>

            <TableCell align="left" sx={{ fontWeight: 600, maxWidth: 240 }}>{ row.billing_account_name || row.billing_name }</TableCell>
            
            <TableCell align="left" sx={{ maxWidth: 240 }}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        { row.customer_name || row.client_name}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                        {row.client_name}
                    </Typography>
                </Stack>
            </TableCell>

            <TableCell align="left" sx={{ fontWeight: 400 }}>{fDate(row.invoice_date)}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 600 }}>{renderCurrency(row.grand_total, '16px')}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{renderCurrency(row.received_amount, '16px')}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{renderCurrency(row.balance_amount, '16px')}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={onPrint} sx={{ color: 'warning.main' }}>
                        <Iconify icon={"solar:printer-bold" as any} />
                    </IconButton>
                    <IconButton onClick={onPreview} sx={{ color: 'secondary.main' }}>
                        <Iconify icon={"solar:file-text-bold" as any} />
                    </IconButton>
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon={"solar:eye-bold" as any} />
                    </IconButton>
                    {displayEdit && row.received_amount === 0 && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {displayDelete && row.received_amount === 0 && (
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
