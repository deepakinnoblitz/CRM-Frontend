import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        title: string;
        account: string;
        contact: string;
        contactName: string;
        value: number;
        stage: string;
        expectedCloseDate?: string;
        avatarUrl: string;
    };
    selected: boolean;
    onEdit: VoidFunction;
    onView: VoidFunction;
    onDelete: VoidFunction;
    onSelectRow: VoidFunction;
    canEdit?: boolean;
    canDelete?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function DealTableRow({
    row,
    selected,
    onEdit,
    onView,
    onDelete,
    onSelectRow,
    canEdit = true,
    canDelete = true,
    hideCheckbox = false,
    index,
}: Props) {
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'Closed Won':
                return 'success';
            case 'Closed Lost':
                return 'error';
            case 'Proposal Sent':
            case 'Negotiation':
                return 'warning';
            default:
                return 'info';
        }
    };

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
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    {row.title}
                </Box>
            </TableCell>

            <TableCell>{row.account}</TableCell>

            <TableCell>
                {row.contactName ? `${row.contactName} (${row.contact})` : row.contact}
            </TableCell>

            <TableCell>{row.value ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.value) : '-'}</TableCell>

            <TableCell>
                <Label color={getStageColor(row.stage)}>{row.stage}</Label>
            </TableCell>

            <TableCell>{row.expectedCloseDate || '-'}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                        onClick={() => window.location.href = `/estimations/new?deal_id=${encodeURIComponent(row.id)}&client_id=${encodeURIComponent(row.contact)}`}
                        sx={{ color: 'secondary.main' }}
                        title="Create Estimation"
                    >
                        <Iconify icon={"solar:document-add-bold" as any} />
                    </IconButton>
                    <IconButton
                        onClick={() => window.location.href = `/invoices/new?deal_id=${encodeURIComponent(row.id)}`}
                        sx={{ color: 'success.main' }}
                        title="Create Invoice"
                    >
                        <Iconify icon={"solar:bill-list-bold" as any} />
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
                    <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
}
