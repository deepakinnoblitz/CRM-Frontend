import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type ExpenseTrackerTableRowProps = {
    row: {
        id: string;
        name: string;
        type: 'Income' | 'Expense';
        titlenotes: string;
        amount: number;
        creation: string;
        date_time?: string;
    };
    selected: boolean;
    onSelectRow: () => void;
    onEdit: () => void;
    onDelete: () => void;
    index?: number;
    hideCheckbox?: boolean;
};

export function ExpenseTrackerTableRow({
    row,
    selected,
    onSelectRow,
    onEdit,
    onDelete,
    index,
    hideCheckbox = false,
}: ExpenseTrackerTableRowProps) {
    const { type, titlenotes, amount, date_time } = row;

    return (
        <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
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
                        }}
                    >
                        {index + 1}
                    </Box>
                </TableCell>
            )}

            <TableCell>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {titlenotes || '-'}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {date_time ? dayjs(date_time).format('DD MMM YYYY h:mm A') : '-'}
                </Typography>
            </TableCell>

            <TableCell>
                <Label
                    variant="soft"
                    color={(type === 'Income' && 'success') || 'error'}
                    sx={{ textTransform: 'capitalize' }}
                >
                    {type}
                </Label>
            </TableCell>

            <TableCell>
                {fCurrency(amount)}
            </TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton size="small" color="info" onClick={onEdit}>
                        <Iconify icon="solar:pen-bold" />
                    </IconButton>

                    <IconButton size="small" color="error" onClick={onDelete}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
}
