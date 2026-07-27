import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

// ----------------------------------------------------------------------

export type ContactProps = {
    id: string;
    firstName: string;
    companyName: string;
    companyNames?: string[];
    email: string;
    phone: string;
    designation?: string;
    avatarUrl: string;
    country?: string;
    state?: string;
    city?: string;
    sourceLead?: string;
    sourceLeadId?: string;
    sourceLeadName?: string;
};

type ContactTableRowProps = {
    row: ContactProps;
    selected: boolean;
    onSelectRow: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function ContactTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
    canView = true,
    hideCheckbox = false,
    index,
}: ContactTableRowProps) {
    const { user } = useAuth();
    const hasCustomPerms = user?.permissions?.custom_permissions_assigned && user?.permissions?.actions?.clients;

    const displayView = hasCustomPerms ? !!user?.permissions?.actions?.clients?.view : canView;
    const displayEdit = hasCustomPerms ? !!user?.permissions?.actions?.clients?.edit : canEdit;
    const displayDelete = hasCustomPerms ? !!user?.permissions?.actions?.clients?.delete : canDelete;
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
                <Box
                    sx={{
                        gap: 2,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, maxWidth: 260 }}>
                        {row.firstName}
                    </Typography>
                </Box>
            </TableCell>

            <TableCell>
                <Box sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, display: 'inline' }}>
                        {(() => {
                            const names = row.companyNames && row.companyNames.length > 0
                                ? row.companyNames
                                : (row.companyName ? row.companyName.split(',').map(s => s.trim()) : []);
                            return names[0] || '-';
                        })()}
                    </Typography>
                    {(() => {
                        const names = row.companyNames && row.companyNames.length > 0
                            ? row.companyNames
                            : (row.companyName ? row.companyName.split(',').map(s => s.trim()) : []);
                        if (names.length <= 1) return null;
                        const remaining = names.slice(1);
                        return (
                            <Tooltip title={remaining.join(', ')} arrow placement="top">
                                <Box
                                    component="span"
                                    sx={{
                                        cursor: 'pointer',
                                        px: 0.8,
                                        py: 0.2,
                                        ml: 0.75,
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        borderRadius: '6px',
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.main',
                                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        verticalAlign: 'middle',
                                        transition: (theme) => theme.transitions.create(['background-color', 'transform', 'box-shadow']),
                                        '&:hover': {
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                                            transform: 'scale(1.08)',
                                            boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        },
                                    }}
                                >
                                    +{names.length - 1}
                                </Box>
                            </Tooltip>
                        );
                    })()}
                </Box>
            </TableCell>

            <TableCell>
                <Typography variant="subtitle2" sx={{ fontSize: '14px', maxWidth: 320 }}>
                    {row.sourceLeadName || '-'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                    {row.sourceLeadId}
                </Typography>
            </TableCell>


            <TableCell>{row.phone}</TableCell>

            <TableCell>{row.email}</TableCell>

            <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {displayView && (
                        <IconButton onClick={onView} sx={{ color: 'info.main' }}>
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>
                    )}
                    {displayEdit && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }}>
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {displayDelete && (
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}
