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

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type EstimationProps = {
    id: string;
    ref_no: string;
    client_name: string;
    customer_name: string;
    billing_name?: string;
    billing_account_name?: string;
    estimate_date: string;
    grand_total: number;
};

type EstimationTableRowProps = {
    row: EstimationProps;
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

export function EstimationTableRow({
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
}: EstimationTableRowProps) {
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
                    {row.ref_no}
                </Box>
            </TableCell>

            <TableCell align="left" sx={{ fontWeight: 600, maxWidth: 240 }}>{row.billing_account_name || row.billing_name || '-' }</TableCell>

            <TableCell align="left" sx={{ maxWidth: 240 }}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {row.customer_name || row.client_name}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                        {row.client_name}
                    </Typography>
                </Stack>
            </TableCell>
            
            <TableCell align="left" sx={{ fontWeight: 400 }}>{fDate(row.estimate_date)}</TableCell>

            <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{fCurrency(row.grand_total)}</TableCell>

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
                    {canEdit && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {canDelete && (
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
