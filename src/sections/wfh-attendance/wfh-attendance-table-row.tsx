import { useState } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fTimeDist } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
    row: {
        id: string;
        employee: string;
        employeeName: string;
        date: string;
        workflowState: string;
        fromTime?: string;
        toTime?: string;
        totalHours?: string;
        modified?: string;
    };
    selected: boolean;
    onSelectRow: VoidFunction;
    onView: VoidFunction;
    onEdit: VoidFunction;
    onApplyAction: (action: string) => void;
    canEdit?: boolean;
    isHR?: boolean;
    hideCheckbox?: boolean;
    index?: number;
};

export function WFHAttendanceTableRow({
    row,
    selected,
    onSelectRow,
    onView,
    onEdit,
    onApplyAction,
    canEdit,
    isHR,
    hideCheckbox = false,
    index,
}: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending': return 'warning';
            case 'Draft': return 'info';
            default: return 'default';
        }
    };

    const [openMenu, setOpenMenu] = useState<HTMLElement | null>(null);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenu(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setOpenMenu(null);
    };

    const handleAction = (action: string) => {
        onApplyAction(action);
        handleCloseMenu();
    };

    return (
        <>
            <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
                {!hideCheckbox && (
                    <TableCell padding="checkbox">
                        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
                    </TableCell>
                )}

                {typeof index === 'number' && (
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
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
                            {row.employeeName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {row.employee}
                        </Typography>
                    </Box>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" noWrap>
                        {row.date}
                    </Typography>
                </TableCell>

                <TableCell>
                    <Label color={getStatusColor(row.workflowState)}>{row.workflowState}</Label>
                </TableCell>

                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" noWrap>
                        {row.fromTime || '-'}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" noWrap>
                        {row.toTime || '-'}
                    </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" noWrap>
                        {row.totalHours || '-'}
                    </Typography>
                </TableCell>

                <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 700, mr: 1, fontSize: 12, display: { xs: 'none', md: 'block' } }}>
                            {row.modified ? fTimeDist(row.modified) : '-'}
                        </Box>
                        <IconButton size="small" onClick={onView} sx={{ color: 'info.main' }}>
                            <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        {canEdit &&
                            (isHR
                                ? (row.workflowState !== 'Rejected')
                                : (row.workflowState === 'Draft' || row.workflowState === 'Approved')
                            ) && (
                                <IconButton size="small" onClick={onEdit} sx={{ color: 'primary.main' }}>
                                    <Iconify icon="solar:pen-bold" />
                                </IconButton>
                            )}

                        {isHR && row.workflowState === 'Pending' && (
                            <IconButton size="small" onClick={handleOpenMenu} sx={{ color: 'warning.main' }}>
                                <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                        )}
                    </Box>
                </TableCell>
            </TableRow>

            <Popover
                open={!!openMenu}
                anchorEl={openMenu}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { width: 140, p: 1 },
                }}
            >
                <MenuItem onClick={() => handleAction('Approve')} sx={{ color: 'success.main' }}>
                    <Iconify icon="solar:check-circle-bold" sx={{ mr: 2 }} />
                    Approve
                </MenuItem>

                <MenuItem onClick={() => handleAction('Reject')} sx={{ color: 'error.main' }}>
                    <Iconify icon="mingcute:close-line" sx={{ mr: 2 }} />
                    Reject
                </MenuItem>
            </Popover>
        </>
    );
}
