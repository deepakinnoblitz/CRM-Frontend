import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

const getStatusStyle = (status: string) => {
    const styles: Record<string, { bgcolor: string; border: string; color: string }> = {
        'Draft': {
            bgcolor: 'rgba(156, 163, 175, 0.25)',
            border: '1px solid rgba(156, 163, 175, 0.45)',
            color: '#374151'
        },
        'Scheduled': {
            bgcolor: 'rgba(99, 102, 241, 0.25)',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            color: '#4338ca'
        },
        'Running': {
            bgcolor: 'rgba(34, 197, 94, 0.25)',
            border: '1px solid rgba(34, 197, 94, 0.45)',
            color: '#15803d'
        },
        'Paused': {
            bgcolor: 'rgba(251, 146, 60, 0.24)',
            border: '1px solid rgba(251, 146, 60, 0.45)',
            color: '#9a3412'
        },
        'Completed': {
            bgcolor: 'rgba(34, 197, 94, 0.25)',
            border: '1px solid rgba(34, 197, 94, 0.45)',
            color: '#15803d'
        },
        'Cancelled': {
            bgcolor: 'rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#991b1b'
        }
    };

    return styles[status] || {
        bgcolor: 'rgba(156, 163, 175, 0.25)',
        border: '1px solid rgba(156, 163, 175, 0.45)',
        color: '#374151'
    };
};

export type EmailCampaignRowProps = {
    id: string;
    campaign_name: string;
    email_template: string;
    target_type: string;
    total_recipients: number;
    sent_count: number;
    status: string;
    created_on?: string;
    template_name?: string;
};

type EmailCampaignTableRowProps = {
    row: EmailCampaignRowProps;
    hideCheckbox?: boolean;
    index?: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
};

export function EmailCampaignTableRow({
    row,
    hideCheckbox = false,
    index,
    onView,
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
}: EmailCampaignTableRowProps) {
    return (
        <TableRow
            hover
            tabIndex={-1}
            sx={{
                '& td, & th': { borderBottom: (t) => `1px solid ${t.palette.divider}` },
                '&:last-child td, &:last-child th': { borderBottom: 0 },
            }}
        >
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

            <TableCell component="th" scope="row">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {row.campaign_name}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2" noWrap>
                    {row.template_name || row.email_template}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.target_type}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.total_recipients}
                </Typography>
            </TableCell>

            <TableCell>
                <Typography variant="body2">
                    {row.sent_count}
                </Typography>
            </TableCell>

            <TableCell>
                <Label
                    sx={{
                        ...getStatusStyle(row.status),
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        borderRadius: '6px',
                        padding: '4px 12px',
                    }}
                >
                    {row.status}
                </Label>
            </TableCell>

            <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton onClick={onView} sx={{ color: 'info.main' }} title="View">
                        <Iconify icon="solar:eye-bold" />
                    </IconButton>
                    {canEdit && (
                        <IconButton onClick={onEdit} sx={{ color: 'primary.main' }} title="Edit">
                            <Iconify icon="solar:pen-bold" />
                        </IconButton>
                    )}
                    {canDelete && row.status != 'Completed' &&(
                        <IconButton onClick={onDelete} sx={{ color: 'error.main' }} title="Delete">
                            <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                    )}
                </Box>
            </TableCell>
        </TableRow>
    );
}