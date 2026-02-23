import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        employee_name: string;
        employee_id?: string;
        pay_period_start: string;
        pay_period_end: string;
        gross_pay: number;
        net_pay: number;
        status: string;
        docstatus: number;
    };
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;

    hideCheckbox?: boolean;
    index?: number;
    isHR?: boolean;
};

export function SalarySlipTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    hideCheckbox = false,
    index,
    isHR = false,
}: Props) {

    const formatDate = (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const periodLabel = `${formatDate(row.pay_period_start)} - ${formatDate(row.pay_period_end)}`;

    return (
        <TableRow hover selected={selected}>
            {!hideCheckbox && (
                <TableCell padding="checkbox">
                    <Checkbox checked={selected} onChange={onSelectRow} />
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

            <TableCell>
                <Box>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                        {row.employee_name}
                    </Typography>
                    {row.employee_id && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {row.employee_id}
                        </Typography>
                    )}
                </Box>
            </TableCell>

            <TableCell>{periodLabel}</TableCell>

            <TableCell align="right">₹{row.gross_pay?.toLocaleString() || 0}</TableCell>

            <TableCell align="right">
                <Typography variant="subtitle2" sx={{ color: 'success.main', fontWeight: 700 }}>
                    ₹{row.net_pay?.toLocaleString() || 0}
                </Typography>
            </TableCell>

            <TableCell>
                <Label
                    variant="soft"
                    color={
                        (row.docstatus === 1 && 'success') ||
                        (row.docstatus === 0 && 'warning') ||
                        (row.docstatus === 2 && 'error') ||
                        'default'
                    }
                >
                    {(row.docstatus === 1 && 'Submitted') ||
                        (row.docstatus === 0 && 'Draft') ||
                        (row.docstatus === 2 && 'Cancelled') ||
                        row.status || 'Unknown'}
                </Label>
            </TableCell>

            <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon={"solar:eye-bold" as any} />
                    </IconButton>
                    {isHR && (
                        <>
                            {/* {row.docstatus === 0 && (
                                <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                                    <Iconify icon={"solar:pen-bold" as any} />
                                </IconButton>
                            )} */}
                            {row.docstatus === 0 && (
                                <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                                    <Iconify icon={"solar:trash-bin-trash-bold" as any} />
                                </IconButton>
                            )}
                        </>
                    )}
                </Stack>
            </TableCell>

        </TableRow>
    );
}

